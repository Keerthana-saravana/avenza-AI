import { dbService } from './db';
import type { Product, Order } from './db';

export interface ChatSessionContext {
  lastQueriedProducts: Product[];
  draftOrder: {
    product: Product;
    quantity: number;
    customRequest?: string;
    deliveryDate?: string;
    customerName?: string;
    customerAddress?: string;
    deliveryAddress?: string;
    step: 'ASK_NAME' | 'ASK_QTY' | 'ASK_DATE' | 'ASK_ADDRESS' | 'ASK_CONFIRM' | 'ASK_PAYMENT_METHOD' | 'COMPLETED';
  } | null;
  draftAppointment: {
    serviceName: string;
    date?: string;
    time?: string;
    price: number;
    customerName?: string;
    step: 'ASK_DATE' | 'ASK_TIME' | 'ASK_NAME' | 'COMPLETED';
  } | null;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
}

// Global in-memory chatbot session cache
const chatSessions: Record<string, ChatSessionContext> = {};

const getSessionContext = (sessionId: string): ChatSessionContext => {
  if (!chatSessions[sessionId]) {
    chatSessions[sessionId] = {
      lastQueriedProducts: [],
      draftOrder: null,
      draftAppointment: null
    };
  }
  return chatSessions[sessionId];
};

export const clearSessionContext = (sessionId: string) => {
  delete chatSessions[sessionId];
};

// -------------------------------------------------------------
// NLP INTENT CLASSIFIER & SLOT EXTRACTOR
// -------------------------------------------------------------
const classifyIntent = (query: string): string => {
  const scores: Record<string, number> = {
    greeting: 0,
    goodbye: 0,
    hours: 0,
    location: 0,
    upi: 0,
    appointment: 0,
    product_query: 0,
    order: 0,
    confirm: 0,
    cancel: 0
  };

  const words = query.split(/[\s,?!.()]+/);

  for (const w of words) {
    const word = w.toLowerCase().trim();
    if (!word) continue;

    // Greeting
    if (['hi', 'hello', 'hey', 'greetings', 'morning', 'evening', 'welcome', 'greet', 'hola', 'dear'].includes(word)) {
      scores.greeting += 2.0;
    }
    // Goodbye
    if (['bye', 'goodbye', 'thanks', 'thank', 'thankyou', 'ok', 'okay', 'great', 'awesome', 'fine'].includes(word)) {
      scores.goodbye += 1.2;
    }
    // Hours
    if (['hours', 'timing', 'timings', 'open', 'close', 'opening', 'closing', 'schedule', 'time', 'when', 'saturday', 'sunday', 'workday', 'workdays'].includes(word)) {
      scores.hours += 1.5;
    }
    // Location
    if (['where', 'location', 'address', 'located', 'place', 'shop', 'find', 'reach', 'map', 'street', 'area', 'city'].includes(word)) {
      scores.location += 1.5;
    }
    // UPI/Payment
    if (['upi', 'pay', 'payment', 'method', 'methods', 'card', 'cash', 'qr', 'bank', 'transfer', 'gpay', 'phonepe', 'checkout', 'billing', 'bill'].includes(word)) {
      scores.upi += 1.5;
    }
    // Appointment
    if (['book', 'appointment', 'schedule', 'slot', 'slots', 'salon', 'appointment?', 'booking', 'reserve', 'visit', 'treatment', 'facial', 'styling', 'haircut'].includes(word)) {
      scores.appointment += 1.5;
    }
    // Product query
    if (['show', 'catalog', 'catalogue', 'product', 'products', 'price', 'prices', 'list', 'cost', 'saree', 'sarees', 'cake', 'cakes', 'pastry', 'pastries', 'kurti', 'kurtis', 'jewelry', 'jhumka', 'treatment', 'facial', 'gel', 'nails', 'skin', 'items', 'menu', 'search', 'buy', 'shop', 'get'].includes(word)) {
      scores.product_query += 1.0;
    }
    if (['under', 'below', 'budget', 'rs', 'inr', 'rs.', '₹', '<=', 'less'].includes(word)) {
      scores.product_query += 1.5;
    }
    // Order / Select product
    if (['buy', 'order', 'purchase', 'get', 'want', 'first', 'second', 'third', '1st', '2nd', '3rd', 'one', 'two', 'three', '1', '2', '3', 'select', 'choose'].includes(word)) {
      scores.order += 1.2;
    }
    // Confirm
    if (['yes', 'confirm', 'sure', 'correct', 'ok', 'okay', 'place', 'yap', 'yeah', 'yep', 'y'].includes(word)) {
      scores.confirm += 1.5;
    }
    // Cancel
    if (['cancel', 'no', 'stop', 'abort', 'don\'t', 'dont', 'n', 'nope'].includes(word)) {
      scores.cancel += 1.5;
    }
  }

  let maxIntent = 'unknown';
  let maxScore = 0.8; // Intent activation threshold
  for (const intent in scores) {
    if (scores[intent] > maxScore) {
      maxScore = scores[intent];
      maxIntent = intent;
    }
  }

  return maxIntent;
};

export const processChatbotMessage = async (
  businessId: string,
  ownerId: string,
  sessionId: string,
  messageText: string
): Promise<{
  text: string;
  products?: Product[];
  invoice?: Partial<Order>;
  paymentQr?: string;
  paymentSuccess?: boolean;
}> => {
  const query = messageText.toLowerCase().trim();
  const context = getSessionContext(sessionId);

  // Intercept Payment Success Simulation
  if (query === 'payment successful') {
    const paymentsList = await dbService.getPayments(businessId);
    const pendingPay = paymentsList.find(p => p.status === 'Pending');
    if (pendingPay) {
      await dbService.updatePaymentStatus(pendingPay.id, 'Success');
      return {
        text: `🎉 Professional Payment Success Receipt:\n\nWe have received your online prepayment of **₹${pendingPay.amount}** for Order **${pendingPay.order_id}**.\n\n- **Payment Status**: Complete ✅\n- **Transaction ID**: ${pendingPay.txn_id}\n\nThe order status and invoice records have been updated to Paid in real time!`,
        paymentSuccess: true
      };
    } else {
      return {
        text: `We checked the database but couldn't find a pending payment. Please check your dashboard or place a new order.`
      };
    }
  }

  // Fetch business details
  let businesses = [];
  if (dbService.isSupabase()) {
    const profile = await dbService.getBusinessByOwner(ownerId);
    businesses = profile ? [profile] : [];
  } else {
    const raw = localStorage.getItem('avenza_saas_db_businesses');
    businesses = raw ? JSON.parse(raw) : [];
  }
  const business = businesses.find((b: any) => b.id === businessId) || {
    name: "Our Shop",
    category: "Retail",
    upi_id: "shop@okaxis",
    phone: "9876543210",
    address: "Main Street",
    working_hours: "9 AM - 8 PM"
  };

  const products = await dbService.getProducts(businessId);
  const intent = classifyIntent(query);

  // -------------------------------------------------------------
  // CANCEL INTERCEPT FOR STATE MACHINES
  // -------------------------------------------------------------
  if (intent === 'cancel') {
    if (context.draftOrder) {
      context.draftOrder = null;
      return { text: "🚫 Order placement has been cancelled. Let me know if you would like to explore our other products!" };
    }
    if (context.draftAppointment) {
      context.draftAppointment = null;
      return { text: "🚫 Appointment booking has been cancelled." };
    }
  }

  // -------------------------------------------------------------
  // ORDER PLACEMENT STATE MACHINE
  // -------------------------------------------------------------
  if (context.draftOrder) {
    const draft = context.draftOrder;

    switch (draft.step) {
      case 'ASK_NAME': {
        let name = messageText.trim();
        const nameKeywords = ['my name is', 'i am', 'this is', 'myself', 'name is'];
        for (const kw of nameKeywords) {
          if (query.includes(kw)) {
            name = messageText.substring(query.indexOf(kw) + kw.length).trim();
            break;
          }
        }
        draft.customerName = name.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
        draft.step = 'ASK_QTY';
        return {
          text: `Nice to meet you, ${draft.customerName}! How many units of "${draft.product.name}" would you like to buy?`
        };
      }

      case 'ASK_QTY': {
        const qtyMatch = query.match(/\d+/);
        const qty = qtyMatch ? Number(qtyMatch[0]) : 1;
        draft.quantity = qty;
        draft.step = 'ASK_DATE';
        return {
          text: `Got it, ${qty} units. When would you like this delivered/prepared (e.g. tomorrow, Friday, or YYYY-MM-DD)?`
        };
      }

      case 'ASK_DATE': {
        let dateStr = messageText.trim();
        if (query.includes('tomorrow')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          dateStr = tomorrow.toISOString().split('T')[0];
        } else if (query.includes('today')) {
          dateStr = new Date().toISOString().split('T')[0];
        }
        draft.deliveryDate = dateStr;
        draft.step = 'ASK_ADDRESS';
        return {
          text: `Delivery/preparation set for: ${dateStr}. Please tell me your shipping or delivery address to finalize.`
        };
      }

      case 'ASK_ADDRESS': {
        draft.deliveryAddress = messageText.trim();
        draft.step = 'ASK_CONFIRM';
        const totalAmount = draft.product.price * draft.quantity;
        return {
          text: `Please review and confirm your order:\n- Customer Name: ${draft.customerName}\n- Product: ${draft.product.name} (x${draft.quantity})\n- Total Amount: ₹${totalAmount}\n- Delivery Date: ${draft.deliveryDate}\n- Address: ${draft.deliveryAddress}\n\nReply with "confirm" or "yes" to place the order in the database, or "cancel" to cancel.`
        };
      }

      case 'ASK_CONFIRM': {
        if (intent === 'confirm' || query.includes('yes') || query.includes('confirm')) {
          const product = draft.product;
          const qty = draft.quantity;

          if (product.stock !== 999 && product.stock < qty) {
            context.draftOrder = null;
            return {
              text: `⚠️ Cannot place order: Insufficient stock. Only ${product.stock} units of "${product.name}" are available in inventory.`
            };
          }

          draft.step = 'ASK_PAYMENT_METHOD';
          return {
            text: `Please select your payment method to finalize the order of "${product.name} (x${qty})":\n\n1. 📱 **Online Prepayment** (UPI, QR Code)\n2. 💵 **Cash on Delivery** (Cash after receiving product)\n\nReply with "1", "online", "prepayment" or "2", "cash", "cod".`
          };
        } else {
          return {
            text: `Order not confirmed. Please reply with "confirm" or "yes" to finalize, or "cancel" to abort.`
          };
        }
      }

      case 'ASK_PAYMENT_METHOD': {
        const isOnline = query.includes('1') || query.includes('online') || query.includes('prepay') || query.includes('upi') || query.includes('qr');
        const isCash = query.includes('2') || query.includes('cash') || query.includes('delivery') || query.includes('cod') || query.includes('after');

        if (!isOnline && !isCash) {
          return {
            text: `Please select a valid payment method:\nReply with "1" or "online" for Online Prepayment, or "2" or "cash" for Cash on Delivery.`
          };
        }

        const product = draft.product;
        const qty = draft.quantity;
        const name = draft.customerName || 'Customer';
        const totalAmount = product.price * qty;

        if (isOnline) {
          const order = await dbService.createOrder({
            business_id: businessId,
            owner_id: ownerId,
            customer_id: null,
            customer_name: name,
            total: totalAmount,
            status: 'Pending',
            payment_method: 'UPI'
          }, [
            { product_id: product.id, quantity: qty, price: product.price }
          ]);

          const draftInvoice = {
            customerName: name,
            products: [{ productId: product.id, name: product.name, quantity: qty, price: product.price }],
            total: totalAmount,
            invoiceNo: order.invoice_no,
            status: 'Unpaid'
          };

          const paymentQr = `upi://pay?pa=${business.upi_id}&pn=${encodeURIComponent(business.name)}&am=${totalAmount}&cu=INR`;

          context.draftOrder = null;

          return {
            text: `🎉 Order placed successfully! Here is your invoice details and payment QR link:\n\nUPI ID: **${business.upi_id}**\nWhatsApp Support: **${business.phone || '9876543210'}**\n\nOnce paid, please scan/click the QR code to verify your transaction.`,
            invoice: { ...draftInvoice, id: order.id } as any,
            paymentQr,
            paymentSuccess: false
          };
        } else {
          const order = await dbService.createOrder({
            business_id: businessId,
            owner_id: ownerId,
            customer_id: null,
            customer_name: name,
            total: totalAmount,
            status: 'Pending',
            payment_method: 'Cash'
          }, [
            { product_id: product.id, quantity: qty, price: product.price }
          ]);

          const draftInvoice = {
            customerName: name,
            products: [{ productId: product.id, name: product.name, quantity: qty, price: product.price }],
            total: totalAmount,
            invoiceNo: order.invoice_no,
            status: 'Unpaid'
          };

          context.draftOrder = null;

          return {
            text: `🎉 Cash on Delivery Order Placed!\n\nYour order has been recorded successfully with **Payment Status = Incomplete**.\n\n💵 **Cash Payment Instructions**:\nPlease prepare the exact amount of **₹${totalAmount}** to pay upon receiving your product. The merchant will update the status to Complete once payment is processed.`,
            invoice: { ...draftInvoice, id: order.id } as any
          };
        }
      }
    }
  }

  // -------------------------------------------------------------
  // APPOINTMENT BOOKING STATE MACHINE
  // -------------------------------------------------------------
  if (context.draftAppointment) {
    const draft = context.draftAppointment;

    switch (draft.step) {
      case 'ASK_DATE': {
        let dateStr = query.replace(/[^\w-]/g, '');
        if (query.includes('tomorrow')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          dateStr = tomorrow.toISOString().split('T')[0];
        } else if (query.includes('today')) {
          dateStr = new Date().toISOString().split('T')[0];
        } else if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const defaultDate = new Date();
          defaultDate.setDate(defaultDate.getDate() + 2);
          dateStr = defaultDate.toISOString().split('T')[0];
        }
        draft.date = dateStr;
        draft.step = 'ASK_TIME';
        return {
          text: `Got it: ${dateStr}. What time would you prefer (e.g. 11:00 AM, 3:00 PM)?`
        };
      }

      case 'ASK_TIME': {
        draft.time = messageText.trim();
        draft.step = 'ASK_NAME';
        return {
          text: `Time set: ${draft.time}. To finalize this booking, could you please provide your name?`
        };
      }

      case 'ASK_NAME': {
        const custName = messageText.trim();
        draft.customerName = custName;
        draft.step = 'COMPLETED';

        await dbService.createAppointment({
          business_id: businessId,
          owner_id: ownerId,
          customer_name: custName,
          service_name: draft.serviceName,
          date: draft.date || '',
          time: draft.time || '',
          price: draft.price
        });

        context.draftAppointment = null;

        return {
          text: `🎉 Appointment successfully booked in the database calendar!\n- Customer: ${custName}\n- Service: ${draft.serviceName}\n- Schedule: ${draft.date} at ${draft.time}\n- Fee: ₹${draft.price} (Payable at salon)`
        };
      }
    }
  }

  // -------------------------------------------------------------
  // INDEX-BASED PRODUCT SELECTION
  // -------------------------------------------------------------
  const orderWordRegex = /(first|second|third|1st|2nd|3rd|one|two|three)\s*(one|item)?/i;
  const isSelectingProduct = query.match(orderWordRegex) && context.lastQueriedProducts.length > 0;

  if (isSelectingProduct) {
    const matchWord = query.match(orderWordRegex)?.[1].toLowerCase();
    let index = 0;
    if (matchWord === 'second' || matchWord === '2nd' || matchWord === 'two') index = 1;
    if (matchWord === 'third' || matchWord === '3rd' || matchWord === 'three') index = 2;

    const chosenProduct = context.lastQueriedProducts[index] || context.lastQueriedProducts[0];
    context.draftOrder = {
      product: chosenProduct,
      quantity: 1,
      step: 'ASK_NAME'
    };

    return {
      text: `Excellent choice: "${chosenProduct.name}". To process your order, could you please tell me your Name?`
    };
  }

  // -------------------------------------------------------------
  // DIRECT ITEM ORDER COMMAND BY SUBSTRING MATCHING
  // -------------------------------------------------------------
  if (intent === 'order' || query.includes('order') || query.includes('buy') || query.includes('purchase')) {
    // Check if any product name matches the query text
    const matchedProduct = products.find(p => 
      query.includes(p.name.toLowerCase()) || 
      p.name.toLowerCase().includes(query.replace('order', '').replace('buy', '').replace('purchase', '').trim())
    );

    if (matchedProduct) {
      context.draftOrder = {
        product: matchedProduct,
        quantity: 1,
        step: 'ASK_NAME'
      };
      return {
        text: `Excellent choice: "${matchedProduct.name}". To process your order, could you please tell me your Name?`
      };
    }
  }

  // -------------------------------------------------------------
  // GREETINGS & BASICS
  // -------------------------------------------------------------
  if (intent === 'greeting') {
    return {
      text: `Hello! I'm your Avenza AI Assistant for ${business.name}. I can help you query our products, check prices, manage appointments, and place orders. How can I help you today?`
    };
  }

  if (intent === 'goodbye') {
    return {
      text: "You're very welcome! If you need anything else, feel free to text. Have a wonderful day!"
    };
  }

  if (intent === 'hours') {
    return {
      text: `We are open during: ${business.working_hours}. Let me know if you would like to book a slot or place an order!`
    };
  }

  if (intent === 'location') {
    return {
      text: `You can find us at: ${business.address}. We look forward to your visit!`
    };
  }

  if (intent === 'upi') {
    return {
      text: `We support dynamic UPI payments via GPay, PhonePe, and WhatsApp Pay directly linked to our account: ${business.upi_id}. We also accept cards and cash in-store.`
    };
  }

  // -------------------------------------------------------------
  // APPOINTMENT BOOKING TRIGGER
  // -------------------------------------------------------------
  if (intent === 'appointment') {
    let serviceName = "Bridal Consultation";
    const hairMatch = query.includes('hair') || query.includes('cut') || query.includes('color');
    const facialMatch = query.includes('facial') || query.includes('skin');
    const nailsMatch = query.includes('nail') || query.includes('gel');

    if (hairMatch) serviceName = "Hair Styling & Treatment Session";
    else if (facialMatch) serviceName = "Gold Radiance Luxury Facial";
    else if (nailsMatch) serviceName = "Gel Nail Extension Package";

    context.draftAppointment = {
      serviceName,
      price: hairMatch ? 3500 : facialMatch ? 2200 : nailsMatch ? 1800 : 1500,
      step: 'ASK_DATE'
    };

    return {
      text: `Sure, I can book an appointment for "${serviceName}" (₹${context.draftAppointment.price}). Which date would you like to schedule (e.g. YYYY-MM-DD or tomorrow)?`
    };
  }

  // -------------------------------------------------------------
  // PRODUCT QUERY & FILTERING
  // -------------------------------------------------------------
  if (intent === 'product_query' || query.includes('product') || query.includes('catalog') || query.includes('price') || query.includes('list')) {
    const priceRegex = /(?:under|below|<=|within|budget of?)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i;
    const priceMatch = query.match(priceRegex);
    const maxPrice = priceMatch ? Number(priceMatch[1]) : null;

    let matches = products;

    // Filter by template/keywords
    const isCakes = query.includes('cake') || query.includes('pastr') || query.includes('bread') || query.includes('cookie') || query.includes('chocolate') || query.includes('truffle') || query.includes('croissant') || query.includes('macaron');
    const isSarees = query.includes('saree') || query.includes('kurti') || query.includes('dress') || query.includes('clothing') || query.includes('silk') || query.includes('jewel') || query.includes('jhumka') || query.includes('clutch');
    const isSalon = query.includes('hair') || query.includes('skin') || query.includes('facial') || query.includes('nail') || query.includes('makeup') || query.includes('salon') || query.includes('spa') || query.includes('cut');

    if (isCakes) {
      matches = matches.filter(p => p.category.toLowerCase().includes('cake') || p.category.toLowerCase().includes('pastr') || p.category.toLowerCase().includes('bread') || p.category.toLowerCase().includes('cookie') || p.name.toLowerCase().includes('cake') || p.name.toLowerCase().includes('truffle') || p.name.toLowerCase().includes('croissant') || p.name.toLowerCase().includes('macaron') || p.name.toLowerCase().includes('cookie'));
    } else if (isSarees) {
      matches = matches.filter(p => p.category.toLowerCase().includes('saree') || p.category.toLowerCase().includes('kurti') || p.category.toLowerCase().includes('jewel') || p.category.toLowerCase().includes('bag') || p.name.toLowerCase().includes('saree') || p.name.toLowerCase().includes('kurti') || p.name.toLowerCase().includes('jhumka') || p.name.toLowerCase().includes('clutch') || p.name.toLowerCase().includes('tote'));
    } else if (isSalon) {
      matches = matches.filter(p => p.category.toLowerCase().includes('hair') || p.category.toLowerCase().includes('skin') || p.category.toLowerCase().includes('nail') || p.category.toLowerCase().includes('bridal') || p.category.toLowerCase().includes('retail') || p.name.toLowerCase().includes('color') || p.name.toLowerCase().includes('facial') || p.name.toLowerCase().includes('cut') || p.name.toLowerCase().includes('mani') || p.name.toLowerCase().includes('makeup') || p.name.toLowerCase().includes('highlights'));
    }

    if (maxPrice !== null) {
      matches = matches.filter(p => p.price <= maxPrice);
    }

    // Try finding specific keyword match in names
    const keywords = ['chocolate', 'pink', 'gold', 'bridal', 'silk', 'strawberry', 'sourdough', 'cotton', 'velvet'];
    for (const kw of keywords) {
      if (query.includes(kw)) {
        const keywordMatches = matches.filter(p => p.name.toLowerCase().includes(kw));
        if (keywordMatches.length > 0) matches = keywordMatches;
      }
    }

    const slicedMatches = matches.slice(0, 3);
    context.lastQueriedProducts = slicedMatches;

    if (slicedMatches.length > 0) {
      return {
        text: `Searching our active database registry... I found ${matches.length} matching items. Here are the top suggestions:`,
        products: slicedMatches
      };
    } else {
      return {
        text: "I searched our products table but couldn't find items matching your price range or specifications. Would you like to check our general categories instead?"
      };
    }
  }

  // -------------------------------------------------------------
  // DYNAMIC UNMATCHED NLP ASSISTANT RESPONSE
  // -------------------------------------------------------------
  // Try to match specific words in the product names to guide the user
  const words = query.split(/\s+/);
  let bestMatches: Product[] = [];
  for (const word of words) {
    if (word.length > 3) {
      const match = products.filter(p => p.name.toLowerCase().includes(word));
      if (match.length > 0) {
        bestMatches = [...bestMatches, ...match];
      }
    }
  }

  // Remove duplicates
  const uniqueMatches = Array.from(new Set(bestMatches)).slice(0, 3);

  if (uniqueMatches.length > 0) {
    context.lastQueriedProducts = uniqueMatches;
    return {
      text: `I couldn't identify a exact command, but I did find some matching products in our database related to your request. Let me know if you would like to order one of these:`,
      products: uniqueMatches
    };
  }

  return {
    text: `I'm your NLP assistant. I can help you find products, place orders, and schedule appointments. Try asking me:
- "Show me products under ₹2500"
- "Do you have chocolate cakes?"
- "What are our business hours?"
- "I want to buy the Belgian Chocolate Truffle Cake"
- "Book an appointment for facial tomorrow"`
  };
};
