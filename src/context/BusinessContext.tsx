import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbService } from '../services/db';
import type { Product, Order, Customer, Appointment, Payment, Business, User } from '../services/db';
import { processChatbotMessage, clearSessionContext } from '../services/chatbot';
import confetti from 'canvas-confetti';

export type ActiveTab = 
  | 'dashboard'
  | 'ai-assistant'
  | 'customers'
  | 'orders'
  | 'products'
  | 'inventory'
  | 'appointments'
  | 'invoices'
  | 'payments'
  | 'analytics'
  | 'settings';

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  products?: Product[];
  invoice?: any;
  paymentQr?: string;
  paymentSuccess?: boolean;
  business_id?: string;
}

export interface OnboardingData {
  businessName: string;
  ownerName: string;
  category: string;
  logo: string | null;
  description: string;
  businessTypes: string[]; // 'ready_stock', 'made_order', 'appointment'
  catalogFile: string | null;
  upiId: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  address: string;
  workingHours: string;
  customProducts?: any[];
}

// Relational BusinessData structure that fits the Dashboard views
export interface UIOrder extends Order {
  products: { productId: string; name: string; quantity: number; price: number }[];
}

export interface SaaSBusinessData {
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
  orders: UIOrder[];
  appointments: Appointment[];
  payments: Payment[];
  insights: string[];
}

interface BusinessContextType {
  // Navigation & Auth
  currentView: 'landing' | 'login' | 'onboarding' | 'dashboard';
  setCurrentView: (view: 'landing' | 'login' | 'onboarding' | 'dashboard') => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  
  // Active User / Session Info
  activeUser: User | null;
  setActiveUser: (user: User | null) => void;
  activeBusiness: Business | null;
  setActiveBusiness: (business: Business | null) => void;

  // Onboarding
  onboardingStep: number;
  setOnboardingStep: (step: number) => void;
  onboardingData: OnboardingData;
  setOnboardingData: React.Dispatch<React.SetStateAction<OnboardingData>>;

  // Active Niche template tracking
  activeTemplate: 'boutique' | 'bakery' | 'salon';
  switchTemplate: (template: 'boutique' | 'bakery' | 'salon') => void;
  businessData: SaaSBusinessData;
  refreshAllData: () => Promise<void>;

  // Conversations
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  clearChat: () => void;

  // Inventory/CRM Ops
  processOrder: (prodId: string, quantity: number) => Promise<void>;
  addManualProduct: (product: Omit<Product, 'id' | 'sku' | 'status' | 'business_id' | 'owner_id' | 'created_at'>) => Promise<void>;
  addManualAppointment: (apt: Omit<Appointment, 'id' | 'status' | 'business_id' | 'owner_id' | 'created_at'>) => Promise<void>;

  // Toast Notification helper
  toast: { show: boolean; message: string; type: 'success' | 'info' | 'warning' };
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;

  // Automated Judge Demo
  isDemoRunning: boolean;
  demoStep: number;
  runJudgeDemo: () => void;
}

const defaultOnboarding: OnboardingData = {
  businessName: '',
  ownerName: '',
  category: 'boutique',
  logo: null,
  description: '',
  businessTypes: ['ready_stock'],
  catalogFile: null,
  upiId: 'avenza.pay@okaxis',
  phone: '',
  whatsapp: '',
  instagram: '',
  address: '',
  workingHours: '09:00 AM - 08:00 PM',
};

const defaultBusinessData: SaaSBusinessData = {
  businessName: 'Avenza SaaS',
  ownerName: 'Merchant',
  category: 'Boutique & Fashion Store',
  description: '',
  upiId: 'shop@okaxis',
  phone: '',
  whatsapp: '',
  instagram: '',
  address: '',
  workingHours: '',
  products: [],
  customers: [],
  orders: [],
  appointments: [],
  payments: [],
  insights: []
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'onboarding' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboarding);

  const [activeTemplate, setActiveTemplate] = useState<'boutique' | 'bakery' | 'salon'>('boutique');
  const [businessData, setBusinessData] = useState<SaaSBusinessData>(defaultBusinessData);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' | 'warning' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  const sessionId = 'session_saas_default';

  // Load user session on boot or database sync
  useEffect(() => {
    const tryAutoLogin = async () => {
      // Look for last active session in localStorage
      const savedUser = localStorage.getItem('avenza_active_user');
      if (savedUser) {
        const user = JSON.parse(savedUser) as User;
        setActiveUser(user);
        setIsLoggedIn(true);

        const business = await dbService.getBusinessByOwner(user.id);
        if (business) {
          setActiveBusiness(business);
          // Set template based on category
          const cat = business.category.toLowerCase();
          if (cat.includes('bakery')) setActiveTemplate('bakery');
          else if (cat.includes('salon')) setActiveTemplate('salon');
          else setActiveTemplate('boutique');
        }
      }
    };
    tryAutoLogin();
  }, []);

  // Fetch all business records when activeBusiness or activeUser changes
  useEffect(() => {
    if (activeBusiness && activeUser) {
      refreshAllData();
    }
  }, [activeBusiness, activeUser]);

  // Sync initial chatbot greeting whenever template/business changes
  useEffect(() => {
    if (activeBusiness) {
      resetChatGreeting();
    }
  }, [activeBusiness, activeTemplate]);

  const resetChatGreeting = async () => {
    if (!activeBusiness) return;
    
    // Load historical messages from database
    const history = await dbService.getMessages(activeBusiness.id, sessionId);
    
    if (history.length > 0) {
      // Map ChatMessage structure
      const mapped = history.map(m => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        timestamp: new Date(m.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: m.products,
        invoice: m.invoice,
        paymentQr: m.payment_qr,
        paymentSuccess: m.payment_success
      }));
      setChatMessages(mapped);
    } else {
      const welcome = activeTemplate === 'boutique'
        ? `Hi there! I am your Avenza AI Assistant. Let's make today productive. Ask me details about ${activeBusiness.name}, check inventory, generate custom invoices, or test the WhatsApp demo below!`
        : activeTemplate === 'bakery'
        ? `Welcome back! I am your Avenza AI Assistant for ${activeBusiness.name}. I can manage your cake orders, recipes ingredients check, and customer chats. What are we baking today?`
        : `Hello! ${activeBusiness.name}'s AI Assistant is online. Ready to organize today's bridal bookings, stylist timesheets, and invoices.`;

      // Save greeting to DB
      const dbGreeting = await dbService.addMessage(activeBusiness.id, sessionId, {
        sender: 'assistant',
        text: welcome
      });

      setChatMessages([
        {
          id: dbGreeting.id,
          sender: 'assistant',
          text: welcome,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const refreshAllData = async () => {
    if (!activeBusiness || !activeUser) return;
    
    const dbProds = await dbService.getProducts(activeBusiness.id);
    const dbCusts = await dbService.getCustomers(activeBusiness.id);
    const dbOrders = await dbService.getOrders(activeBusiness.id);
    const dbItems = await dbService.getOrderItems(activeBusiness.id);
    const dbApts = await dbService.getAppointments(activeBusiness.id);
    const dbPayments = await dbService.getPayments(activeBusiness.id);
    const dbAnalytics = await dbService.getAnalytics(activeBusiness.id);

    // Join order items to orders as 'products' field
    const mappedOrders: UIOrder[] = dbOrders.map(order => ({
      ...order,
      products: dbItems
        .filter(item => item.order_id === order.id)
        .map(item => ({
          productId: item.product_id || '',
          name: item.product_name,
          quantity: item.quantity,
          price: item.price
        }))
    }));

    // Compute basic dynamic insights based on actual database data
    const lowStockList = dbProds.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock');
    const dynamicInsights = [
      `📊 Top Selling product in database: "${dbAnalytics.topSellingProducts[0]?.name || 'No sales recorded yet'}" (${dbAnalytics.topSellingProducts[0]?.qty || 0} units sold).`,
      lowStockList.length > 0 
        ? `⚠️ ${lowStockList.length} products are currently in Low Stock. Consider replenishment.` 
        : `✨ All inventory items are fully stocked. Good job!`,
      `💼 Platform customer retention rate is computed at ${dbAnalytics.repeatCustomersPercent}% repeat buyers.`,
      `📈 Cumulative revenue generated across transactions amounts to ₹${dbAnalytics.revenue.toLocaleString('en-IN')}.`
    ];

    setBusinessData({
      businessName: activeBusiness.name,
      ownerName: activeUser.name || 'Owner',
      category: activeBusiness.category,
      description: activeBusiness.description || '',
      upiId: activeBusiness.upi_id || 'upi@okaxis',
      phone: activeBusiness.phone || '',
      whatsapp: activeBusiness.phone || '',
      instagram: activeBusiness.instagram || '',
      address: activeBusiness.address || '',
      workingHours: activeBusiness.working_hours || '',
      products: dbProds,
      customers: dbCusts,
      orders: mappedOrders,
      appointments: dbApts,
      payments: dbPayments,
      insights: dynamicInsights
    });
  };

  // Switch workspace template
  const switchTemplate = async (template: 'boutique' | 'bakery' | 'salon') => {
    if (!activeUser) return;

    // Switch active view visual representation
    setActiveTemplate(template);
    showToast(`Loading workspace...`, 'info');

    // 1. Fetch businesses for this owner
    // If not found in DB, seed a default one
    const catName = template === 'boutique' 
      ? 'Boutique & Fashion Store' 
      : template === 'bakery' 
      ? 'Home Bakery & Confectionery' 
      : 'Beauty Salon & Makeup Studio';

    let businessesList: Business[] = [];
    if (dbService.isSupabase()) {
      // SUPABASE WORKSPACE QUERY
      // Fetches user businesses
    } else {
      const raw = localStorage.getItem('avenza_saas_db_businesses');
      businessesList = raw ? JSON.parse(raw) : [];
    }

    let b = businessesList.find(x => x.owner_id === activeUser.id && x.category === catName);
    if (!b) {
      // Create new business workspace in DB
      b = await dbService.createBusiness({
        owner_id: activeUser.id,
        name: template === 'boutique' ? 'Aura Boutique' : template === 'bakery' ? 'The Whisk Bakery' : 'Glow & Grace Salon',
        category: catName,
        type: template === 'salon' ? ['appointment'] : ['ready_stock', 'made_order'],
        description: `Database workspace for ${template}`,
        upi_id: template === 'boutique' ? 'auraboutique@okhdfc' : template === 'bakery' ? 'whiskbakery@okicici' : 'glowgracesalon@okhdfc',
        phone: '+91 98765 43210',
        working_hours: '10:00 AM - 08:00 PM',
        address: 'No. 45, 100 Feet Road, Indiranagar, Bengaluru'
      });

      // Seed starting inventory, customers, orders
      await dbService.seedCategoryData(b.id, activeUser.id, template);
    }

    setActiveBusiness(b);
    showToast(`Switched workspace to ${b.name}`, 'success');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const addChatMessage = async (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (!activeBusiness || !activeUser) return;

    // 1. Insert user message in DB
    const userMsg = await dbService.addMessage(activeBusiness.id, sessionId, {
      sender: msg.sender,
      text: msg.text
    });

    const newMsg: ChatMessage = {
      ...msg,
      id: userMsg.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, newMsg]);

    // 2. Query Chatbot logic
    if (msg.sender === 'customer') {
      const response = await processChatbotMessage(activeBusiness.id, activeUser.id, sessionId, msg.text);

      // Save bot response in DB
      const botMsg = await dbService.addMessage(activeBusiness.id, sessionId, {
        sender: 'assistant',
        text: response.text,
        products: response.products,
        invoice: response.invoice,
        payment_qr: response.paymentQr,
        payment_success: response.paymentSuccess
      });

      setChatMessages(prev => [...prev, {
        id: botMsg.id,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        products: response.products,
        invoice: response.invoice,
        paymentQr: response.paymentQr,
        paymentSuccess: response.paymentSuccess
      }]);

      // Trigger automatic DB refresh since DB state could change on order placement
      await refreshAllData();
    }
  };

  const clearChat = () => {
    if (activeBusiness) {
      // Clear chatbot conversation logs
      clearSessionContext(sessionId);
      if (dbService.isSupabase()) {
        // Option to purge from cloud
      } else {
        // Clear local messages table
        const messages = localStorage.getItem('avenza_saas_db_messages');
        if (messages) {
          const arr = JSON.parse(messages) as ChatMessage[];
          const filtered = arr.filter(m => m.business_id !== activeBusiness.id);
          localStorage.setItem('avenza_saas_db_messages', JSON.stringify(filtered));
        }
      }
      resetChatGreeting();
    }
  };

  // Process manual order/transaction
  const processOrder = async (prodId: string, quantity: number) => {
    if (!activeBusiness || !activeUser) return;

    const prod = businessData.products.find(p => p.id === prodId);
    if (!prod) return;

    if (prod.stock !== 999 && prod.stock < quantity) {
      showToast(`Insufficient stock!`, 'warning');
      return;
    }

    const orderTotal = prod.price * quantity;

    await dbService.createOrder({
      business_id: activeBusiness.id,
      owner_id: activeUser.id,
      customer_id: null,
      customer_name: 'Walk-in Customer',
      total: orderTotal,
      status: 'Completed',
      payment_method: 'UPI'
    }, [
      { product_id: prodId, quantity, price: prod.price }
    ]);

    await refreshAllData();
    showToast(`Order processed and inventory stock deducted!`, 'success');
  };

  const addManualProduct = async (product: Omit<Product, 'id' | 'sku' | 'status' | 'business_id' | 'owner_id' | 'created_at'>) => {
    if (!activeBusiness || !activeUser) return;
    await dbService.addProduct({
      ...product,
      business_id: activeBusiness.id,
      owner_id: activeUser.id
    });
    await refreshAllData();
    showToast(`Catalog item "${product.name}" added successfully!`, 'success');
  };

  const addManualAppointment = async (apt: Omit<Appointment, 'id' | 'status' | 'business_id' | 'owner_id' | 'created_at'>) => {
    if (!activeBusiness || !activeUser) return;
    await dbService.createAppointment({
      ...apt,
      business_id: activeBusiness.id,
      owner_id: activeUser.id
    });
    await refreshAllData();
    showToast(`Appointment registered for ${apt.customer_name}`, 'success');
  };

  // 60-Second Automated Judge Demo ( полностью на базе реальной DB )
  const runJudgeDemo = () => {
    if (isDemoRunning || !activeBusiness || !activeUser) return;
    
    setIsDemoRunning(true);
    setDemoStep(1);
    setActiveTab('ai-assistant');
    
    // Step 1: Customer WhatsApp Inquiry
    addChatMessage({
      sender: 'customer',
      text: activeTemplate === 'boutique' 
        ? "Hi, I need a pink silk saree under ₹2500 for a wedding."
        : activeTemplate === 'bakery'
        ? "Hi, do you have premium chocolate cakes under ₹1500?"
        : "Hello, I want to book a hair styling appointment."
    });

    // Step 2: Search products and return suggestions
    setTimeout(async () => {
      setDemoStep(2);
      
      // Step 3: Select product
      setTimeout(() => {
        setDemoStep(3);
        
        addChatMessage({
          sender: 'customer',
          text: "I will go with the first one. Please generate the invoice link."
        });

        // Step 4: Invoice and payment QR code creation
        setTimeout(() => {
          setDemoStep(4);

          // Step 5: Simulate payment verification
          setTimeout(async () => {
            setDemoStep(5);

            // Fetch the last pending payment from DB to confirm it
            const paymentsList = await dbService.getPayments(activeBusiness.id);
            const pendingPay = paymentsList.find(p => p.status === 'Pending');
            if (pendingPay) {
              await dbService.updatePaymentStatus(pendingPay.id, 'Success');
              await refreshAllData();
            }

            addChatMessage({
              sender: 'system',
              text: `✅ DEMO COMPLETE: Transaction captured. Orders, stock counts, Recharts trends, and settlement feeds updated. Try navigating the dashboard tabs to inspect updated figures!`
            });
            setIsDemoRunning(false);

            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 }
            });

          }, 6000); // Wait for payment review
        }, 5000); // Wait for invoice generation
      }, 5000); // Wait for product selection
    }, 4000); // Wait for initial inquiry response
  };

  return (
    <BusinessContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeTab,
        setActiveTab,
        isLoggedIn,
        setIsLoggedIn,
        activeUser,
        setActiveUser,
        activeBusiness,
        setActiveBusiness,
        onboardingStep,
        setOnboardingStep,
        onboardingData,
        setOnboardingData,
        activeTemplate,
        switchTemplate,
        businessData,
        refreshAllData,
        chatMessages,
        setChatMessages,
        addChatMessage,
        clearChat,
        processOrder,
        addManualProduct,
        addManualAppointment,
        toast,
        showToast,
        isDemoRunning,
        demoStep,
        runJudgeDemo
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
