export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  sku: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  ltv: number;
  ordersCount: number;
  recentPurchase: string;
  notes: string;
  insights: string[];
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  products: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  date: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  paymentMethod: 'UPI' | 'Card' | 'Cash' | 'WhatsApp Pay';
  invoiceNo: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  price: number;
}

export interface Payment {
  id: string;
  orderId?: string;
  customerName: string;
  amount: number;
  status: 'Success' | 'Failed' | 'Pending';
  method: 'UPI' | 'Card' | 'Cash';
  date: string;
  upiId?: string;
  txnId: string;
}

export interface BusinessData {
  businessName: string;
  ownerName: string;
  category: string;
  description: string;
  upiId: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
  workingHours: string;
  products: Product[];
  customers: Customer[];
  orders: Order[];
  appointments: Appointment[];
  payments: Payment[];
  insights: string[];
}

// Names of women customers & business details
const womenNames = [
  "Aishwarya Rai", "Priyanka Chopra", "Deepika Padukone", "Alia Bhatt", "Kareena Kapoor",
  "Anushka Sharma", "Katrina Kaif", "Shraddha Kapoor", "Sara Ali Khan", "Janhvi Kapoor",
  "Kriti Sanon", "Kiara Advani", "Aditi Rao", "Sonam Kapoor", "Vidya Balan",
  "Rani Mukerji", "Kajol Devgan", "Madhuri Dixit", "Sushmita Sen", "Lara Dutta",
  "Dia Mirza", "Taapsee Pannu", "Bhumi Pednekar", "Yami Gautam", "Radhika Apte",
  "Sanya Malhotra", "Fatima Shaikh", "Huma Qureshi", "Sonakshi Sinha", "Parineeti Chopra",
  "Samantha Ruth", "Nayanthara Kurian", "Rashmika Mandanna", "Trisha Krishnan", "Keerthy Suresh",
  "Sai Pallavi", "Pooja Hegde", "Tamannaah Bhatia", "Kajal Aggarwal", "Shreya Ghoshal",
  "Sunidhi Chauhan", "Neeti Mohan", "Jonita Gandhi", "Monali Thakur", "Neha Kakkar",
  "Masaba Gupta", "Ritu Kumar", "Anita Dongre", "Kiran Mazumdar", "Falguni Nayar"
];

const indianCities = [
  "Bandra West, Mumbai", "Jubilee Hills, Hyderabad", "Indiranagar, Bengaluru",
  "Koramangala, Bengaluru", "South Ext, New Delhi", "Alipore, Kolkata",
  "Adyar, Chennai", "Koregaon Park, Pune", "Salt Lake, Kolkata", "C Scheme, Jaipur"
];

// Helper to generate IDs
const randId = (prefix: string) => `${prefix}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

export const getBusinessTemplateData = (type: 'boutique' | 'bakery' | 'salon'): BusinessData => {
  // Generate Customers
  const customers: Customer[] = womenNames.map((name, index) => {
    const firstName = name.split(" ")[0].toLowerCase();
    const city = indianCities[index % indianCities.length];
    return {
      id: `CUST_${1000 + index}`,
      name,
      email: `${firstName}.${Math.floor(Math.random() * 90) + 10}@gmail.com`,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      address: `${Math.floor(Math.random() * 200) + 10}, 4th Cross, ${city}`,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${firstName}`,
      ltv: 0, // Calculated later
      ordersCount: 0, // Calculated later
      recentPurchase: "", // Calculated later
      notes: index % 3 === 0 ? "Prefers early delivery and WhatsApp updates." : index % 3 === 1 ? "Enquired about loyalty discount." : "Active shopper, VIP customer.",
      insights: [
        index % 2 === 0 ? "High frequency shopper" : "Responds well to weekend sales",
        index % 3 === 0 ? "Prefers premium items" : "Typically buys on promo discounts"
      ]
    };
  });

  if (type === 'boutique') {
    // 1. BOUTIQUE & FASHION STORE
    const productPool = [
      { name: "Pink Kanjeevaram Silk Saree", cat: "Sarees", price: 2450, img: "saree_pink" },
      { name: "Emerald Banarasi Brocade Saree", cat: "Sarees", price: 3200, img: "saree_emerald" },
      { name: "Mustard Georgette Floral Saree", cat: "Sarees", price: 1850, img: "saree_mustard" },
      { name: "Crimson Chanderi Handloom Saree", cat: "Sarees", price: 2900, img: "saree_crimson" },
      { name: "Pastel Lavender Organza Saree", cat: "Sarees", price: 2200, img: "saree_lavender" },
      { name: "Indigo Indigo Dabu Print Saree", cat: "Sarees", price: 1600, img: "saree_indigo" },
      { name: "Peach Lucknowi Chikankari Kurti", cat: "Kurtis", price: 1250, img: "kurti_peach" },
      { name: "Ivory Cotton A-Line Kurti", cat: "Kurtis", price: 950, img: "kurti_ivory" },
      { name: "Turquoise Anarkali Kurta Set", cat: "Kurtis", price: 1999, img: "kurti_turquoise" },
      { name: "Wine Velvet Straight Kurta", cat: "Kurtis", price: 1750, img: "kurti_wine" },
      { name: "Olive Linen Daily Kurti", cat: "Kurtis", price: 890, img: "kurti_olive" },
      { name: "Kashmiri Aari Work Tunic", cat: "Kurtis", price: 1450, img: "kurti_kashmiri" },
      { name: "Kundan Meenakari Jhumkas", cat: "Jewelry", price: 650, img: "jewel_jhumka" },
      { name: "Temple Gold Plated Choker Set", cat: "Jewelry", price: 1850, img: "jewel_choker" },
      { name: "Silver Oxidized Antique Bangles", cat: "Jewelry", price: 420, img: "jewel_bangle" },
      { name: "Baroque Pearl Drop Earrings", cat: "Jewelry", price: 790, img: "jewel_earring" },
      { name: "Rose Gold Delicate Bracelet", cat: "Jewelry", price: 580, img: "jewel_bracelet" },
      { name: "Terracotta Handcrafted Earrings", cat: "Jewelry", price: 320, img: "jewel_terra" },
      { name: "Vegan Leather Embroidered Tote", cat: "Handbags", price: 1499, img: "bag_tote" },
      { name: "Raw Silk Clutch with Zardosi Work", cat: "Handbags", price: 1200, img: "bag_clutch" },
      { name: "Jute Boho Sling Bag", cat: "Handbags", price: 750, img: "bag_sling" },
      { name: "Khadi Cotton Travel Duffle", cat: "Handbags", price: 1890, img: "bag_duffle" }
    ];

    // Generate 120 products from pool
    const products: Product[] = Array.from({ length: 120 }).map((_, i) => {
      const template = productPool[i % productPool.length];
      const modifier = Math.floor(i / productPool.length);
      const suffix = modifier > 0 ? ` (Batch ${String.fromCharCode(64 + modifier)})` : "";
      const priceOffset = (i % 5) * 50 - 100;
      const finalPrice = Math.max(250, template.price + priceOffset);
      const stock = i % 15 === 0 ? 0 : i % 8 === 0 ? 3 : Math.floor(Math.random() * 25) + 5;
      
      return {
        id: `PROD_${2000 + i}`,
        name: template.name + suffix,
        category: template.cat,
        price: finalPrice,
        stock,
        image: template.img,
        sku: `AV-BT-${2000 + i}`,
        status: stock === 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock'
      };
    });

    // Generate 80 orders
    const orders: Order[] = Array.from({ length: 80 }).map((_, i) => {
      const customer = customers[i % customers.length];
      const itemCount = (i % 3) + 1;
      const orderProducts = Array.from({ length: itemCount }).map((_, pi) => {
        const prodIndex = (i * 3 + pi) % products.length;
        const p = products[prodIndex];
        return {
          productId: p.id,
          name: p.name,
          quantity: (pi % 2) + 1,
          price: p.price
        };
      });
      const total = orderProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const daysAgo = 30 - Math.floor(i * 0.35);
      const dateStr = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const statusOptions: Order['status'][] = ['Completed', 'Completed', 'Completed', 'Processing', 'Pending', 'Cancelled'];
      const status = daysAgo > 3 ? 'Completed' : statusOptions[i % statusOptions.length];

      // Update customer stats
      customer.ordersCount += 1;
      customer.ltv += total;
      customer.recentPurchase = dateStr;

      return {
        id: `ORD_${3000 + i}`,
        customerId: customer.id,
        customerName: customer.name,
        products: orderProducts,
        total,
        date: dateStr,
        status,
        paymentMethod: i % 4 === 0 ? 'WhatsApp Pay' : i % 3 === 0 ? 'Card' : i % 5 === 0 ? 'Cash' : 'UPI',
        invoiceNo: `INV-2026-${3000 + i}`
      };
    });

    // Generate appointments (fittings/consultations)
    const appointments: Appointment[] = Array.from({ length: 25 }).map((_, i) => {
      const customer = customers[i * 2 % customers.length];
      const daysAhead = (i % 5) - 2;
      const dateStr = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return {
        id: `APT_${4000 + i}`,
        customerName: customer.name,
        serviceName: i % 2 === 0 ? "Custom Bridal Wear Consultation" : "Trousseau Fitting & Styling",
        date: dateStr,
        time: `${10 + (i % 8)}:30 AM`,
        status: daysAhead < 0 ? 'Completed' : i % 6 === 0 ? 'Cancelled' : 'Upcoming',
        price: i % 2 === 0 ? 1500 : 750
      };
    });

    // Payments
    const payments: Payment[] = orders.map((order, i) => {
      return {
        id: `PAY_${5000 + i}`,
        orderId: order.id,
        customerName: order.customerName,
        amount: order.total,
        status: order.status === 'Cancelled' ? 'Failed' : 'Success',
        method: order.paymentMethod === 'Cash' ? 'Cash' : order.paymentMethod === 'Card' ? 'Card' : 'UPI',
        date: order.date,
        upiId: order.paymentMethod === 'UPI' || order.paymentMethod === 'WhatsApp Pay' ? `${order.customerName.split(" ")[0].toLowerCase()}@okaxis` : undefined,
        txnId: randId("TXN")
      };
    });

    const insights = [
      "🌸 Pink Silk Sarees are trending! Pageviews increased by 42% this week.",
      "⚠️ 8 high-demand products are in Low Stock. Consider restocking within 2 days.",
      "💡 Peak shopping hour is between 7:00 PM and 9:30 PM. Target campaigns during this slot.",
      "🌟 masaba.gupta@gmail.com is your VIP customer this month with a lifetime value of ₹14,500.",
      "📈 Revenue up by 23% compared to last week, driven by festive collection launch."
    ];

    return {
      businessName: "Aura Boutique",
      ownerName: "Ananya Sen",
      category: "Boutique & Fashion Store",
      description: "Designer Indian ethnic wear, handloom silk sarees, Lucknowi chikankari kurtis, and handcrafted jewelry.",
      upiId: "auraboutique@okhdfc",
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      instagram: "@auraboutique.in",
      address: "No. 45, 100 Feet Road, Indiranagar, Bengaluru, 560038",
      workingHours: "10:30 AM - 8:30 PM (Mon-Sat)",
      products,
      customers,
      orders,
      appointments,
      payments,
      insights
    };

  } else if (type === 'bakery') {
    // 2. HOME BAKERY
    const productPool = [
      { name: "Belgian Chocolate Truffle Cake", cat: "Cakes", price: 1200, img: "cake_truffle" },
      { name: "Fresh Strawberry Cream Cake", cat: "Cakes", price: 950, img: "cake_strawberry" },
      { name: "Blueberry Cheesecake (Baked)", cat: "Cakes", price: 1400, img: "cake_cheese" },
      { name: "Red Velvet Cream Cheese Cake", cat: "Cakes", price: 1100, img: "cake_redvelvet" },
      { name: "Premium French Macarons Box (12pcs)", cat: "Pastries", price: 850, img: "bake_macaron" },
      { name: "Assorted Cupcakes Box (6pcs)", cat: "Pastries", price: 450, img: "bake_cupcake" },
      { name: "Classic Butter Croissants (4pcs)", cat: "Pastries", price: 380, img: "bake_croissant" },
      { name: "Gooey Chocolate Walnut Brownies", cat: "Pastries", price: 550, img: "bake_brownie" },
      { name: "Artisanal Sourdough Country Loaf", cat: "Breads", price: 280, img: "bread_sourdough" },
      { name: "Garlic Herb Focaccia", cat: "Breads", price: 220, img: "bread_focaccia" },
      { name: "Whole Wheat Multi-seed Bread", cat: "Breads", price: 150, img: "bread_wheat" },
      { name: "Soft Brioche Buns (4pcs)", cat: "Breads", price: 180, img: "bread_brioche" },
      { name: "Dark Chocolate Chunk Cookies (6pcs)", cat: "Cookies", price: 320, img: "cookie_choco" },
      { name: "Oatmeal Raisin Healthy Cookies", cat: "Cookies", price: 280, img: "cookie_oat" },
      { name: "Salted Caramel Macadamia Cookies", cat: "Cookies", price: 350, img: "cookie_macadamia" },
      { name: "Almond Biscotti Jar (250g)", cat: "Cookies", price: 400, img: "cookie_biscotti" }
    ];

    const products: Product[] = Array.from({ length: 120 }).map((_, i) => {
      const template = productPool[i % productPool.length];
      const modifier = Math.floor(i / productPool.length);
      const suffix = modifier > 0 ? ` (Style ${String.fromCharCode(64 + modifier)})` : "";
      const priceOffset = (i % 6) * 30 - 60;
      const finalPrice = Math.max(100, template.price + priceOffset);
      const stock = i % 18 === 0 ? 0 : i % 7 === 0 ? 2 : Math.floor(Math.random() * 15) + 3;

      return {
        id: `PROD_${2000 + i}`,
        name: template.name + suffix,
        category: template.cat,
        price: finalPrice,
        stock,
        image: template.img,
        sku: `AV-BK-${2000 + i}`,
        status: stock === 0 ? 'Out of Stock' : stock <= 3 ? 'Low Stock' : 'In Stock'
      };
    });

    const orders: Order[] = Array.from({ length: 80 }).map((_, i) => {
      const customer = customers[i % customers.length];
      const itemCount = (i % 2) + 1;
      const orderProducts = Array.from({ length: itemCount }).map((_, pi) => {
        const prodIndex = (i * 2 + pi) % products.length;
        const p = products[prodIndex];
        return {
          productId: p.id,
          name: p.name,
          quantity: 1,
          price: p.price
        };
      });
      const total = orderProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const daysAgo = 30 - Math.floor(i * 0.35);
      const dateStr = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const statusOptions: Order['status'][] = ['Completed', 'Completed', 'Processing', 'Pending', 'Cancelled'];
      const status = daysAgo > 2 ? 'Completed' : statusOptions[i % statusOptions.length];

      customer.ordersCount += 1;
      customer.ltv += total;
      customer.recentPurchase = dateStr;

      return {
        id: `ORD_${3000 + i}`,
        customerId: customer.id,
        customerName: customer.name,
        products: orderProducts,
        total,
        date: dateStr,
        status,
        paymentMethod: i % 3 === 0 ? 'UPI' : i % 4 === 0 ? 'WhatsApp Pay' : i % 5 === 0 ? 'Cash' : 'Card',
        invoiceNo: `INV-2026-${3000 + i}`
      };
    });

    const appointments: Appointment[] = Array.from({ length: 15 }).map((_, i) => {
      const customer = customers[i * 3 % customers.length];
      const daysAhead = (i % 5) - 1;
      const dateStr = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return {
        id: `APT_${4000 + i}`,
        customerName: customer.name,
        serviceName: "Wedding Cake Tasting & Consultation",
        date: dateStr,
        time: `${12 + (i % 5)}:00 PM`,
        status: daysAhead < 0 ? 'Completed' : i % 8 === 0 ? 'Cancelled' : 'Upcoming',
        price: 500
      };
    });

    const payments: Payment[] = orders.map((order, i) => {
      return {
        id: `PAY_${5000 + i}`,
        orderId: order.id,
        customerName: order.customerName,
        amount: order.total,
        status: order.status === 'Cancelled' ? 'Failed' : 'Success',
        method: order.paymentMethod === 'Cash' ? 'Cash' : order.paymentMethod === 'Card' ? 'Card' : 'UPI',
        date: order.date,
        upiId: order.paymentMethod === 'UPI' || order.paymentMethod === 'WhatsApp Pay' ? `${order.customerName.split(" ")[0].toLowerCase()}@okaxis` : undefined,
        txnId: randId("TXN")
      };
    });

    const insights = [
      "🎂 Belgian Truffle Cake is the most ordered product this week, making up 35% of revenue.",
      "🥐 Morning croissants sell out by 9:30 AM daily. We suggest doubling batch size.",
      "⚠️ 5 ingredients are running low in stock. Consider restocking soon.",
      "💬 4 custom orders require layout approvals over WhatsApp.",
      "📈 Weekend sales are 45% higher than weekdays. Focus promos on Thursdays."
    ];

    return {
      businessName: "The Whisk Bakery",
      ownerName: "Simran Kohli",
      category: "Home Bakery",
      description: "Artisanal custom cakes, hand-rolled French pastries, and freshly-baked sourdough breads.",
      upiId: "whiskbakery@okicici",
      phone: "+91 99988 77665",
      whatsapp: "+91 99988 77665",
      instagram: "@thewhiskbakery",
      address: "Villa 12, Sobha Greenwoods, Bandra West, Mumbai, 400050",
      workingHours: "08:00 AM - 09:00 PM (Daily)",
      products,
      customers,
      orders,
      appointments,
      payments,
      insights
    };

  } else {
    // 3. BEAUTY SALON
    const productPool = [
      { name: "Global Hair Coloring & Highlights", cat: "Hair", price: 4200, img: "salon_color" },
      { name: "Hydrating Keratin Hair Treatment", cat: "Hair", price: 3500, img: "salon_keratin" },
      { name: "Hair Cut & Blow Dry Styling", cat: "Hair", price: 1200, img: "salon_cut" },
      { name: "Gold Radiance Luxury Facial", cat: "Skin", price: 2200, img: "salon_facial" },
      { name: "Detox Charcoal Cleanse Treatment", cat: "Skin", price: 1500, img: "salon_cleanse" },
      { name: "Gel Nail Extensions & Art", cat: "Nails", price: 1800, img: "salon_nail" },
      { name: "Classic Mani-Pedi Duo Package", cat: "Nails", price: 1100, img: "salon_manipedi" },
      { name: "Complete Bridal Makeup & Draping", cat: "Bridal", price: 15000, img: "salon_bridal" },
      { name: "Premium Party Makeup & Hairstyle", cat: "Bridal", price: 4500, img: "salon_party" },
      { name: "Organic Argan Hair Serum (50ml)", cat: "Retail", price: 850, img: "retail_serum" },
      { name: "Hydrating Rosewater Face Mist", cat: "Retail", price: 450, img: "retail_mist" }
    ];

    const products: Product[] = Array.from({ length: 120 }).map((_, i) => {
      const template = productPool[i % productPool.length];
      const modifier = Math.floor(i / productPool.length);
      const suffix = modifier > 0 ? ` (${String.fromCharCode(64 + modifier)})` : "";
      const priceOffset = (i % 6) * 100 - 300;
      const finalPrice = Math.max(200, template.price + priceOffset);
      const stock = template.cat === "Retail" ? (i % 12 === 0 ? 0 : i % 5 === 0 ? 2 : 12) : 999; // Services have infinite "stock"

      return {
        id: `PROD_${2000 + i}`,
        name: template.name + suffix,
        category: template.cat,
        price: finalPrice,
        stock,
        image: template.img,
        sku: `AV-SL-${2000 + i}`,
        status: stock === 0 ? 'Out of Stock' : stock <= 3 ? 'Low Stock' : 'In Stock'
      };
    });

    const orders: Order[] = Array.from({ length: 80 }).map((_, i) => {
      const customer = customers[i % customers.length];
      const itemCount = (i % 2) + 1;
      const orderProducts = Array.from({ length: itemCount }).map((_, pi) => {
        const prodIndex = (i * 2 + pi) % products.length;
        const p = products[prodIndex];
        return {
          productId: p.id,
          name: p.name,
          quantity: 1,
          price: p.price
        };
      });
      const total = orderProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const daysAgo = 30 - Math.floor(i * 0.35);
      const dateStr = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const statusOptions: Order['status'][] = ['Completed', 'Completed', 'Processing', 'Pending', 'Cancelled'];
      const status = daysAgo > 2 ? 'Completed' : statusOptions[i % statusOptions.length];

      customer.ordersCount += 1;
      customer.ltv += total;
      customer.recentPurchase = dateStr;

      return {
        id: `ORD_${3000 + i}`,
        customerId: customer.id,
        customerName: customer.name,
        products: orderProducts,
        total,
        date: dateStr,
        status,
        paymentMethod: i % 2 === 0 ? 'Card' : i % 3 === 0 ? 'UPI' : 'Cash',
        invoiceNo: `INV-2026-${3000 + i}`
      };
    });

    const appointments: Appointment[] = Array.from({ length: 50 }).map((_, i) => {
      const customer = customers[i % customers.length];
      const daysAhead = (i % 9) - 4;
      const dateStr = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const serviceOptions = [
        "Global Hair Coloring", "Luxury Gold Facial", "Bridal Makeup consultation", "Gel Extensions", "Mani-Pedi Treatment"
      ];
      const servicePrice = [4200, 2200, 15000, 1800, 1100];
      const sIndex = i % serviceOptions.length;

      return {
        id: `APT_${4000 + i}`,
        customerName: customer.name,
        serviceName: serviceOptions[sIndex],
        date: dateStr,
        time: `${9 + (i % 9)}:00 AM`,
        status: daysAhead < 0 ? 'Completed' : i % 10 === 0 ? 'Cancelled' : 'Upcoming',
        price: servicePrice[sIndex]
      };
    });

    const payments: Payment[] = orders.map((order, i) => {
      return {
        id: `PAY_${5000 + i}`,
        orderId: order.id,
        customerName: order.customerName,
        amount: order.total,
        status: order.status === 'Cancelled' ? 'Failed' : 'Success',
        method: order.paymentMethod === 'Cash' ? 'Cash' : order.paymentMethod === 'Card' ? 'Card' : 'UPI',
        date: order.date,
        upiId: order.paymentMethod === 'UPI' ? `${order.customerName.split(" ")[0].toLowerCase()}@okaxis` : undefined,
        txnId: randId("TXN")
      };
    });

    const insights = [
      "💇‍♀️ Hair coloring bookings are up 50% for this weekend. Double-check stylist schedules.",
      "💄 Bridal inquiries via WhatsApp have tripled since yesterday.",
      "🧴 Argan hair serum retail sales grew 15% due to product display adjustments.",
      "⏰ Peak appointment request times are 11:30 AM and 5:00 PM.",
      "⚠️ 2 stylists are booked at 100% capacity for this Friday."
    ];

    return {
      businessName: "Glow & Grace Salon",
      ownerName: "Meera Oberoi",
      category: "Beauty Salon",
      description: "Premium hair care, advanced luxury skincare facials, nails art studio, and customized bridal makeover packages.",
      upiId: "glowgracesalon@okhdfc",
      phone: "+91 97766 55443",
      whatsapp: "+91 97766 55443",
      instagram: "@glowandgrace.salon",
      address: "Shop 14, Grand Galleria, Jubilee Hills, Hyderabad, 500033",
      workingHours: "09:00 AM - 08:30 PM (Daily)",
      products,
      customers,
      orders,
      appointments,
      payments,
      insights
    };
  }
};
