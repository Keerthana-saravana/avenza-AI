import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types matching the SQL schema
export interface User {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  category: string;
  type: string[]; // ready_stock, made_order, appointment
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  website?: string;
  upi_id?: string;
  working_hours?: string;
  logo_url?: string;
  gst_number?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  business_id: string;
  owner_id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image_url?: string;
  stock: number;
  sku: string;
  custom_fields?: Record<string, any>;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  created_at?: string;
}

export interface Customer {
  id: string;
  business_id: string;
  owner_id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  business_id: string;
  owner_id: string;
  customer_id: string | null;
  customer_name: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  payment_method: string;
  invoice_no: string;
  date: string;
  created_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  business_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  created_at?: string;
}

export interface Invoice {
  id: string;
  order_id: string;
  business_id: string;
  customer_name: string;
  invoice_no: string;
  date: string;
  discount: number;
  gst_amount: number;
  total_amount: number;
  status: 'Paid' | 'Unpaid';
  pdf_url?: string;
  created_at?: string;
}

export interface Payment {
  id: string;
  order_id?: string;
  business_id: string;
  customer_name: string;
  amount: number;
  status: 'Success' | 'Failed' | 'Pending';
  method: 'UPI' | 'Card' | 'Cash';
  date: string;
  upi_id?: string;
  txn_id: string;
  provider?: string;
  created_at?: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  owner_id: string;
  customer_name: string;
  service_name: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  price: number;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  business_id: string;
  sender: 'customer' | 'assistant' | 'system';
  text: string;
  products?: Product[];
  invoice?: any;
  payment_qr?: string;
  payment_success?: boolean;
  created_at?: string;
}

// Check environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

let supabaseClient: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

// -------------------------------------------------------------
// LOCAL STORAGE PERSISTENCE ENGINE (FALLBACK RELATIONAL ENGINE)
// -------------------------------------------------------------
class LocalStore {
  private getStorageKey(table: string): string {
    return `avenza_saas_db_${table}`;
  }

  public getTable<T>(table: string): T[] {
    const raw = localStorage.getItem(this.getStorageKey(table));
    return raw ? JSON.parse(raw) : [];
  }

  public saveTable<T>(table: string, data: T[]): void {
    localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
  }

  public insert<T extends { id: string }>(table: string, record: T): T {
    const data = this.getTable<T>(table);
    data.push(record);
    this.saveTable(table, data);
    return record;
  }

  public update<T extends { id: string }>(table: string, record: T): T {
    const data = this.getTable<T>(table);
    const index = data.findIndex((item) => item.id === record.id);
    if (index !== -1) {
      data[index] = { ...data[index], ...record };
      this.saveTable(table, data);
    }
    return record;
  }
}

const localStore = new LocalStore();

// -------------------------------------------------------------
// UNIFIED DATABASE SERVICE
// -------------------------------------------------------------
export const dbService = {
  isSupabase: (): boolean => isSupabaseConfigured,

  // --- AUTHENTICATION ---
  signUp: async (email: string, name: string): Promise<User> => {
    if (isSupabaseConfigured && supabaseClient) {
      // Direct sign up in Supabase
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password: 'temporary-saas-password', // Simple default credentials for client flow
        options: { data: { name } }
      });
      if (error) throw error;
      
      const user: User = {
        id: data.user?.id || '',
        email: data.user?.email || email,
        name
      };

      // Upsert public users table
      await supabaseClient.from('users').upsert([user]);
      return user;
    } else {
      // Local Database mock signup
      const users = localStore.getTable<User>('users');
      let user = users.find(u => u.email === email);
      if (!user) {
        user = {
          id: `USR_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          email,
          name,
          created_at: new Date().toISOString()
        };
        localStore.insert<User>('users', user);
      }
      return user;
    }
  },

  signIn: async (email: string): Promise<User> => {
    if (isSupabaseConfigured && supabaseClient) {
      // Try to get user profile by email
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as User;

      // If user doesn't exist, create profile automatically
      return await dbService.signUp(email, email.split('@')[0]);
    } else {
      // Local DB lookup
      const users = localStore.getTable<User>('users');
      let user = users.find(u => u.email === email);
      if (!user) {
        // Auto-signup to match client expectation
        user = await dbService.signUp(email, email.split('@')[0].toUpperCase());
      }
      return user;
    }
  },

  updateUser: async (user: User): Promise<User> => {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('users')
        .update({ name: user.name })
        .eq('id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      return localStore.update<User>('users', user);
    }
  },

  getOrCreateCustomer: async (
    businessId: string,
    ownerId: string,
    name: string,
    details?: { phone?: string; email?: string; address?: string; avatar?: string }
  ): Promise<string> => {
    const cleanName = name.trim();
    const avatarName = cleanName.split(' ')[0].toLowerCase();
    
    const phone = details?.phone || '+91 99999 88888';
    const email = details?.email || `${avatarName}@gmail.com`;
    const address = details?.address || 'Indiranagar, Bengaluru';
    const avatar_url = details?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarName}`;
    const notes = 'Customer registered via order placement.';

    if (isSupabaseConfigured && supabaseClient) {
      const { data: existing } = await supabaseClient
        .from('customers')
        .select('id')
        .eq('business_id', businessId)
        .ilike('name', cleanName)
        .maybeSingle();
        
      if (existing) {
        return existing.id;
      }
      
      const newId = `CUST_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const { data: inserted, error } = await supabaseClient
        .from('customers')
        .insert([{
          id: newId,
          business_id: businessId,
          owner_id: ownerId,
          name: cleanName,
          phone,
          email,
          address,
          avatar_url,
          notes
        }])
        .select('id')
        .single();
        
      if (error) throw error;
      return inserted.id;
    } else {
      const customers = localStore.getTable<Customer>('customers');
      const existing = customers.find(c => c.name.toLowerCase() === cleanName.toLowerCase() && c.business_id === businessId);
      if (existing) {
        return existing.id;
      }
      
      const id = `CUST_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const newCust: Customer = {
        id,
        business_id: businessId,
        owner_id: ownerId,
        name: cleanName,
        phone,
        email,
        address,
        avatar_url,
        notes,
        created_at: new Date().toISOString()
      };
      localStore.insert<Customer>('customers', newCust);
      return newCust.id;
    }
  },

  // --- BUSINESS WORKSPACE ---
  getBusinessByOwner: async (ownerId: string): Promise<Business | null> => {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('businesses')
        .select('*')
        .eq('owner_id', ownerId)
        .maybeSingle();
      if (error) throw error;
      return data;
    } else {
      const businesses = localStore.getTable<Business>('businesses');
      return businesses.find(b => b.owner_id === ownerId) || null;
    }
  },

  createBusiness: async (business: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Promise<Business> => {
    const id = `BUS_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const newBusiness = {
      ...business,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('businesses')
        .insert([newBusiness])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      return localStore.insert<Business>('businesses', newBusiness);
    }
  },

  updateBusiness: async (business: Business): Promise<Business> => {
    const updated = {
      ...business,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('businesses')
        .update(updated)
        .eq('id', business.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      return localStore.update<Business>('businesses', updated);
    }
  },

  // --- PRODUCTS / CATALOG ---
  getProducts: async (businessId: string): Promise<Product[]> => {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const products = localStore.getTable<Product>('products');
      return products.filter(p => p.business_id === businessId).sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    }
  },

  addProduct: async (product: Omit<Product, 'id' | 'sku' | 'status' | 'created_at'>): Promise<Product> => {
    const id = `PROD_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const sku = `AV-${product.category.substring(0,2).toUpperCase()}-${Math.floor(1000 + Math.random()*9000)}`;
    const status: 'In Stock' | 'Low Stock' | 'Out of Stock' = product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? 'Low Stock' : 'In Stock';
    const newProd: Product = {
      ...product,
      id,
      sku,
      status,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('products')
        .insert([newProd])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      return localStore.insert<Product>('products', newProd);
    }
  },

  updateProduct: async (product: Product): Promise<Product> => {
    const status: 'In Stock' | 'Low Stock' | 'Out of Stock' = product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? 'Low Stock' : 'In Stock';
    const updated = { ...product, status };

    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('products')
        .update(updated)
        .eq('id', product.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      return localStore.update<Product>('products', updated);
    }
  },

  // --- CUSTOMERS ---
  getCustomers: async (businessId: string): Promise<Customer[]> => {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('customers')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const customers = localStore.getTable<Customer>('customers');
      return customers.filter(c => c.business_id === businessId);
    }
  },

  addCustomer: async (customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> => {
    const id = `CUST_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const avatarName = customer.name.split(' ')[0].toLowerCase();
    const newCust: Customer = {
      ...customer,
      id,
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatarName}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('customers')
        .insert([newCust])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      return localStore.insert<Customer>('customers', newCust);
    }
  },

  // --- ORDERS & TRANSACTION PIPELINE ---
  getOrders: async (businessId: string): Promise<Order[]> => {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const orders = localStore.getTable<Order>('orders');
      return orders.filter(o => o.business_id === businessId).sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    }
  },

  getOrderItems: async (businessId: string): Promise<OrderItem[]> => {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('order_items')
        .select('*')
        .eq('business_id', businessId);
      if (error) throw error;
      return data || [];
    } else {
      const items = localStore.getTable<OrderItem>('order_items');
      return items.filter(i => i.business_id === businessId);
    }
  },

  createOrder: async (
    order: Omit<Order, 'id' | 'invoice_no' | 'date' | 'created_at'>,
    items: { product_id: string; quantity: number; price: number }[]
  ): Promise<Order> => {
    const orderId = `ORD_${Math.floor(100000 + Math.random() * 900000)}`;
    const invoiceNo = `INV-2026-${orderId.substring(4)}`;
    const date = new Date().toISOString().split('T')[0];

    const customerId = await dbService.getOrCreateCustomer(order.business_id, order.owner_id, order.customer_name);

    const newOrder: Order = {
      ...order,
      id: orderId,
      customer_id: customerId,
      invoice_no: invoiceNo,
      date,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseClient) {
      // 1. Insert Order
      const { data: dbOrder, error: oErr } = await supabaseClient
        .from('orders')
        .insert([newOrder])
        .select()
        .single();
      if (oErr) throw oErr;

      // 2. Insert Order Items & deduct stock
      for (const item of items) {
        const { data: prod } = await supabaseClient
          .from('products')
          .select('name, stock')
          .eq('id', item.product_id)
          .single();

        const orderItem = {
          order_id: orderId,
          business_id: order.business_id,
          product_id: item.product_id,
          product_name: prod ? prod.name : 'Unknown Product',
          quantity: item.quantity,
          price: item.price
        };

        await supabaseClient.from('order_items').insert([orderItem]);

        if (prod && prod.stock !== 999) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          await supabaseClient
            .from('products')
            .update({ 
              stock: newStock,
              status: newStock === 0 ? 'Out of Stock' : newStock <= 5 ? 'Low Stock' : 'In Stock'
            })
            .eq('id', item.product_id);
        }
      }

      // 3. Create Invoice
      const invoice = {
        order_id: orderId,
        business_id: order.business_id,
        customer_name: order.customer_name,
        invoice_no: invoiceNo,
        date,
        total_amount: order.total,
        status: order.status === 'Completed' ? 'Paid' : 'Unpaid'
      };
      await supabaseClient.from('invoices').insert([invoice]);

      // 4. Create Payment
      const payment = {
        order_id: orderId,
        business_id: order.business_id,
        customer_name: order.customer_name,
        amount: order.total,
        status: order.status === 'Completed' ? 'Success' : 'Pending',
        method: order.payment_method,
        date,
        upi_id: order.payment_method === 'UPI' ? `${order.customer_name.split(' ')[0].toLowerCase()}@okaxis` : undefined,
        txn_id: `TXN_${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      };
      await supabaseClient.from('payments').insert([payment]);

      return dbOrder;
    } else {
      // Local Database transactional execution
      localStore.insert<Order>('orders', newOrder);

      // Create Order Items
      const products = localStore.getTable<Product>('products');
      items.forEach(item => {
        const prod = products.find(p => p.id === item.product_id);
        const orderItem: OrderItem = {
          id: `ITEM_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          order_id: orderId,
          business_id: order.business_id,
          product_id: item.product_id,
          product_name: prod ? prod.name : 'Unknown Product',
          quantity: item.quantity,
          price: item.price,
          created_at: new Date().toISOString()
        };
        localStore.insert<OrderItem>('order_items', orderItem);

        // Deduct stock
        if (prod && prod.stock !== 999) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          prod.status = prod.stock === 0 ? 'Out of Stock' : prod.stock <= 5 ? 'Low Stock' : 'In Stock';
          localStore.update<Product>('products', prod);
        }
      });

      // Create Invoice
      const newInvoice: Invoice = {
        id: `INV_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        order_id: orderId,
        business_id: order.business_id,
        customer_name: order.customer_name,
        invoice_no: invoiceNo,
        date,
        discount: 0,
        gst_amount: Math.floor(order.total * 0.05),
        total_amount: order.total,
        status: order.status === 'Completed' ? 'Paid' : 'Unpaid',
        created_at: new Date().toISOString()
      };
      localStore.insert<Invoice>('invoices', newInvoice);

      // Create Payment
      const newPayment: Payment = {
        id: `PAY_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        order_id: orderId,
        business_id: order.business_id,
        customer_name: order.customer_name,
        amount: order.total,
        status: order.status === 'Completed' ? 'Success' : 'Pending',
        method: order.payment_method as any,
        date,
        upi_id: order.payment_method === 'UPI' ? `${order.customer_name.split(' ')[0].toLowerCase()}@okaxis` : undefined,
        txn_id: `TXN_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        created_at: new Date().toISOString()
      };
      localStore.insert<Payment>('payments', newPayment);

      return newOrder;
    }
  },

  // --- INVOICES ---
  getInvoices: async (businessId: string): Promise<Invoice[]> => {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('invoices')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const invoices = localStore.getTable<Invoice>('invoices');
      return invoices.filter(i => i.business_id === businessId).sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    }
  },

  // --- PAYMENTS ---
  getPayments: async (businessId: string): Promise<Payment[]> => {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('payments')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const payments = localStore.getTable<Payment>('payments');
      return payments.filter(p => p.business_id === businessId).sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    }
  },

  updatePaymentStatus: async (paymentId: string, status: 'Success' | 'Failed'): Promise<Payment> => {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('payments')
        .update({ status })
        .eq('id', paymentId)
        .select()
        .single();
      if (error) throw error;

      // Update corresponding order status
      if (data && data.order_id) {
        await supabaseClient.from('orders').update({ status: status === 'Success' ? 'Completed' : 'Cancelled' }).eq('id', data.order_id);
        await supabaseClient.from('invoices').update({ status: status === 'Success' ? 'Paid' : 'Unpaid' }).eq('order_id', data.order_id);
      }
      return data;
    } else {
      const payments = localStore.getTable<Payment>('payments');
      const pay = payments.find(p => p.id === paymentId);
      if (pay) {
        pay.status = status;
        localStore.update<Payment>('payments', pay);

        if (pay.order_id) {
          const orders = localStore.getTable<Order>('orders');
          const order = orders.find(o => o.id === pay.order_id);
          if (order) {
            order.status = status === 'Success' ? 'Completed' : 'Cancelled';
            localStore.update<Order>('orders', order);
          }

          const invoices = localStore.getTable<Invoice>('invoices');
          const invoice = invoices.find(i => i.order_id === pay.order_id);
          if (invoice) {
            invoice.status = status === 'Success' ? 'Paid' : 'Unpaid';
            localStore.update<Invoice>('invoices', invoice);
          }
        }
      }
      return pay!;
    }
  },

  // --- APPOINTMENTS ---
  getAppointments: async (businessId: string): Promise<Appointment[]> => {
    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('appointments')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const appointments = localStore.getTable<Appointment>('appointments');
      return appointments.filter(a => a.business_id === businessId).sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    }
  },

  createAppointment: async (appointment: Omit<Appointment, 'id' | 'status' | 'created_at'>): Promise<Appointment> => {
    const id = `APT_${Math.floor(1000 + Math.random() * 9000)}`;
    const newApt: Appointment = {
      ...appointment,
      id,
      status: 'Upcoming',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabaseClient) {
      const { data, error } = await supabaseClient
        .from('appointments')
        .insert([newApt])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      return localStore.insert<Appointment>('appointments', newApt);
    }
  },

  // --- REAL-TIME CHAT PERSISTENCE ---
  getMessages: async (businessId: string, sessionId: string): Promise<ChatMessage[]> => {
    if (isSupabaseConfigured && supabaseClient) {
      // Find conversation first
      let { data: conv } = await supabaseClient
        .from('conversations')
        .select('id')
        .eq('business_id', businessId)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (!conv) return [];

      const { data: msgs, error } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return msgs || [];
    } else {
      const convs = localStore.getTable<{ id: string; business_id: string; session_id: string }>('conversations');
      const conv = convs.find(c => c.business_id === businessId && c.session_id === sessionId);
      if (!conv) return [];

      const messages = localStore.getTable<ChatMessage>('messages');
      return messages.filter(m => m.conversation_id === conv.id);
    }
  },

  addMessage: async (
    businessId: string,
    sessionId: string,
    msg: Omit<ChatMessage, 'id' | 'conversation_id' | 'business_id' | 'created_at'>
  ): Promise<ChatMessage> => {
    let convId = '';

    if (isSupabaseConfigured && supabaseClient) {
      // 1. Get or Create conversation
      let { data: conv } = await supabaseClient
        .from('conversations')
        .select('id')
        .eq('business_id', businessId)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (!conv) {
        const { data: newConv } = await supabaseClient
          .from('conversations')
          .insert([{ business_id: businessId, session_id: sessionId }])
          .select()
          .single();
        convId = newConv?.id || '';
      } else {
        convId = conv.id;
      }

      // 2. Insert message
      const dbMsg = {
        conversation_id: convId,
        business_id: businessId,
        sender: msg.sender,
        text: msg.text,
        products: msg.products || [],
        invoice: msg.invoice || null,
        payment_qr: msg.payment_qr || null,
        payment_success: msg.payment_success || false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('messages')
        .insert([dbMsg])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // Local DB Execution
      const convs = localStore.getTable<{ id: string; business_id: string; session_id: string }>('conversations');
      let conv = convs.find(c => c.business_id === businessId && c.session_id === sessionId);
      if (!conv) {
        conv = {
          id: `CONV_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          business_id: businessId,
          session_id: sessionId
        };
        localStore.insert('conversations', conv);
      }
      convId = conv.id;

      const newMsg: ChatMessage = {
        ...msg,
        id: `MSG_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        conversation_id: convId,
        business_id: businessId,
        created_at: new Date().toISOString()
      };
      return localStore.insert<ChatMessage>('messages', newMsg);
    }
  },

  // --- DYNAMIC ANALYTICS CALCULATOR ---
  getAnalytics: async (businessId: string): Promise<any> => {
    // We load all orders, payments, products and customers from the database,
    // and perform standard PostgreSQL/SQL-style group-bys and calculations
    const allProducts = await dbService.getProducts(businessId);
    
    let allOrders: Order[] = [];
    let allAppointments: Appointment[] = [];
    let allCustomers: Customer[] = [];

    if (isSupabaseConfigured && supabaseClient) {
      const { data: orders } = await supabaseClient.from('orders').select('*').eq('business_id', businessId);
      const { data: appointments } = await supabaseClient.from('appointments').select('*').eq('business_id', businessId);
      const { data: customers } = await supabaseClient.from('customers').select('*').eq('business_id', businessId);
      allOrders = orders || [];
      allAppointments = appointments || [];
      allCustomers = customers || [];
    } else {
      allOrders = localStore.getTable<Order>('orders').filter(o => o.business_id === businessId);
      allAppointments = localStore.getTable<Appointment>('appointments').filter(a => a.business_id === businessId);
      allCustomers = localStore.getTable<Customer>('customers').filter(c => c.business_id === businessId);
    }

    // Calculations:
    const completedOrders = allOrders.filter(o => o.status === 'Completed');
    
    // Revenue totals
    const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const lowStockCount = allProducts.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock').length;
    const upcomingAppointmentsCount = allAppointments.filter(a => a.status === 'Upcoming').length;

    // Average Order Value
    const averageOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;

    // Grouping: Revenue per Day (Weekly Sales Summary)
    // Build maps matching the last 7 calendar days to capture real dates
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      
      const dayName = weekdays[d.getDay()];
      
      // Sum completed order totals on this day
      const daySales = allOrders
        .filter(o => o.date === dateStr && o.status === 'Completed')
        .reduce((sum, o) => sum + Number(o.total), 0);

      return {
        name: dayName,
        date: dateStr,
        revenue: daySales,
        sales: daySales // Keep both keys for safety
      };
    });

    // Grouping: Top customers (LTV aggregation)
    const customerSpendMap: Record<string, { count: number; spend: number }> = {};
    completedOrders.forEach(o => {
      if (!customerSpendMap[o.customer_name]) {
        customerSpendMap[o.customer_name] = { count: 0, spend: 0 };
      }
      customerSpendMap[o.customer_name].count += 1;
      customerSpendMap[o.customer_name].spend += Number(o.total);
    });

    const topCustomers = Object.keys(customerSpendMap).map(name => ({
      name,
      orders: customerSpendMap[name].count,
      ltv: customerSpendMap[name].spend
    })).sort((a, b) => b.ltv - a.ltv);

    // Grouping: Top products
    const productSalesMap: Record<string, { qty: number; revenue: number; category: string }> = {};
    
    // In local mode we query order_items
    let itemsList: OrderItem[] = [];
    if (isSupabaseConfigured && supabaseClient) {
      const { data: dbItems } = await supabaseClient.from('order_items').select('*').eq('business_id', businessId);
      itemsList = dbItems || [];
    } else {
      itemsList = localStore.getTable<OrderItem>('order_items').filter(oi => oi.business_id === businessId);
    }

    // Group items
    itemsList.forEach(item => {
      const p = allProducts.find(prod => prod.id === item.product_id);
      const cat = p ? p.category : 'General';
      if (!productSalesMap[item.product_name]) {
        productSalesMap[item.product_name] = { qty: 0, revenue: 0, category: cat };
      }
      productSalesMap[item.product_name].qty += item.quantity;
      productSalesMap[item.product_name].revenue += item.quantity * item.price;
    });

    const topSellingProducts = Object.keys(productSalesMap).map(name => ({
      name,
      qty: productSalesMap[name].qty,
      revenue: productSalesMap[name].revenue,
      category: productSalesMap[name].category
    })).sort((a, b) => b.qty - a.qty);

    // Grouping: Category distribution
    const categoryMap: Record<string, number> = {};
    Object.values(productSalesMap).forEach(v => {
      categoryMap[v.category] = (categoryMap[v.category] || 0) + v.revenue;
    });

    const categoryDistribution = Object.keys(categoryMap).map(name => ({
      name,
      value: categoryMap[name]
    }));

    // Repeat customers calculation
    const repeatCustCount = allCustomers.filter(c => {
      const count = allOrders.filter(o => o.customer_name === c.name).length;
      return count > 1;
    }).length;

    const conversionRate = allCustomers.length > 0 ? Math.round((completedOrders.length / allCustomers.length) * 100) : 0;

    return {
      revenue: totalRevenue,
      orderCount: allOrders.length,
      lowStockCount,
      upcomingAppointments: upcomingAppointmentsCount,
      averageOrderValue,
      chartData,
      topCustomers,
      topSellingProducts,
      categoryDistribution: categoryDistribution.length > 0 ? categoryDistribution : [
        { name: 'Bridal Packages / Sarees', value: 4500 },
        { name: 'Daily Kurtis / Pastries', value: 2500 },
        { name: 'Jewelry / Custom Cakes', value: 1800 },
        { name: 'Accessories / Salon services', value: 1200 }
      ],
      repeatCustomersPercent: allCustomers.length > 0 ? Math.round((repeatCustCount / allCustomers.length) * 100) : 0,
      conversionRate
    };
  },

  // --- SEED DATABASE ON ONBOARDING ---
  seedCategoryData: async (
    businessId: string,
    ownerId: string,
    categoryType: 'boutique' | 'bakery' | 'salon',
    customProducts?: any[]
  ): Promise<void> => {
    // Check if products already exist (only if customProducts not passed)
    const prods = await dbService.getProducts(businessId);
    if (prods.length > 0 && !customProducts) return; // Already seeded

    // Import templates seeds dynamically
    const { getBusinessTemplateData } = await import('../data/templates');
    const templateData = getBusinessTemplateData(categoryType);

    const hasCustom = customProducts && customProducts.length > 0;

    if (isSupabaseConfigured && supabaseClient) {
      // 1. Insert products
      if (hasCustom) {
        const productsToInsert = customProducts.map((p) => ({
          business_id: businessId,
          owner_id: ownerId,
          name: p.name,
          category: p.category || (categoryType === 'boutique' ? 'Boutique' : categoryType === 'bakery' ? 'Bakery' : 'Salon'),
          price: Number(p.price),
          stock: Number(p.stock) || 10,
          sku: `AV-${categoryType.substring(0,2).toUpperCase()}-${Math.floor(1000 + Math.random()*9000)}`,
          status: p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock'
        }));
        await supabaseClient.from('products').insert(productsToInsert);
      } else {
        const productsToInsert = templateData.products.slice(0, 15).map(p => ({
          business_id: businessId,
          owner_id: ownerId,
          name: p.name,
          category: p.category,
          price: p.price,
          stock: p.stock,
          sku: p.sku,
          status: p.status,
          image_url: p.image
        }));
        await supabaseClient.from('products').insert(productsToInsert);
      }

      // Fetch inserted products (ONLY IF NO CUSTOM PRODUCTS)
      if (!hasCustom) {
        const { data: dbProds } = await supabaseClient.from('products').select('id, name, price').eq('business_id', businessId);

        if (dbProds && dbProds.length > 0) {
          // 3. Insert seed orders, order items, invoices, and payments
          const seedCustomerNames = ["Aishwarya Rai", "Priyanka Chopra", "Deepika Padukone", "Alia Bhatt", "Kareena Kapoor"];
          for (let i = 0; i < 5; i++) {
            const custName = seedCustomerNames[i % seedCustomerNames.length];
            const matchingCust = templateData.customers.find(c => c.name.toLowerCase() === custName.toLowerCase()) || templateData.customers[i % templateData.customers.length];

            const customerId = await dbService.getOrCreateCustomer(businessId, ownerId, custName, {
              phone: matchingCust.phone,
              email: matchingCust.email,
              address: matchingCust.address,
              avatar: matchingCust.avatar
            });

            const prod = dbProds[i % dbProds.length];
            
            const orderId = `ORD_${Math.floor(100000 + Math.random()*900000)}`;
            const invoiceNo = `INV-2026-${orderId.substring(4)}`;
            const date = new Date(Date.now() - i * 24*60*60*1000).toISOString().split('T')[0];
            const total = Number(prod.price);

            const newOrder = {
              id: orderId,
              business_id: businessId,
              owner_id: ownerId,
              customer_id: customerId,
              customer_name: custName,
              total,
              status: 'Completed',
              payment_method: 'UPI',
              invoice_no: invoiceNo,
              date,
              created_at: new Date(Date.now() - i * 24*60*60*1000).toISOString()
            };

            await supabaseClient.from('orders').insert([newOrder]);

            const orderItem = {
              order_id: orderId,
              business_id: businessId,
              product_id: prod.id,
              product_name: prod.name,
              quantity: 1,
              price: total
            };
            await supabaseClient.from('order_items').insert([orderItem]);

            const invoice = {
              order_id: orderId,
              business_id: businessId,
              customer_name: custName,
              invoice_no: invoiceNo,
              date,
              total_amount: total,
              status: 'Paid'
            };
            await supabaseClient.from('invoices').insert([invoice]);

            const payment = {
              order_id: orderId,
              business_id: businessId,
              customer_name: custName,
              amount: total,
              status: 'Success',
              method: 'UPI',
              date,
              upi_id: `${custName.split(' ')[0].toLowerCase()}@okaxis`,
              txn_id: `TXN_${Math.random().toString(36).substring(2, 9).toUpperCase()}`
            };
            await supabaseClient.from('payments').insert([payment]);
          }
        }
      }

      // 4. Insert seed appointments
      const appointmentsToInsert = templateData.appointments.slice(0, 5).map(apt => ({
        business_id: businessId,
        owner_id: ownerId,
        customer_name: apt.customerName,
        service_name: apt.serviceName,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        price: apt.price
      }));
      await supabaseClient.from('appointments').insert(appointmentsToInsert);

    } else {
      // Local seed insertion
      // Products
      const localProducts = localStore.getTable<Product>('products');
      let seedProducts: Product[] = [];
      if (hasCustom) {
        seedProducts = customProducts.map((p, idx) => {
          const stock = Number(p.stock) ?? 10;
          return {
            id: `PROD_CUSTOM_${idx}_${businessId.substring(0,4)}`,
            business_id: businessId,
            owner_id: ownerId,
            name: p.name,
            category: p.category || (categoryType === 'boutique' ? 'Boutique' : categoryType === 'bakery' ? 'Bakery' : 'Salon'),
            price: Number(p.price),
            stock: stock,
            sku: `AV-${categoryType.substring(0,2).toUpperCase()}-${Math.floor(1000 + Math.random()*9000)}`,
            status: stock === 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock',
            created_at: new Date().toISOString()
          };
        });
      } else {
        seedProducts = templateData.products.slice(0, 15).map((p, idx) => ({
          id: `PROD_SEED_${idx}_${businessId.substring(0,4)}`,
          business_id: businessId,
          owner_id: ownerId,
          name: p.name,
          category: p.category,
          price: p.price,
          stock: p.stock,
          sku: p.sku,
          status: p.status,
          image_url: p.image,
          created_at: new Date().toISOString()
        }));
      }
      localStore.saveTable('products', [...localProducts, ...seedProducts]);

      if (!hasCustom) {
        // Orders, Invoices, Payments, Items
        const localOrders = localStore.getTable<Order>('orders');
        const localItems = localStore.getTable<OrderItem>('order_items');
        const localInvoices = localStore.getTable<Invoice>('invoices');
        const localPayments = localStore.getTable<Payment>('payments');

        const seedCustomerNames = ["Aishwarya Rai", "Priyanka Chopra", "Deepika Padukone", "Alia Bhatt", "Kareena Kapoor"];
        for (let i = 0; i < 5; i++) {
          const custName = seedCustomerNames[i % seedCustomerNames.length];
          const matchingCust = templateData.customers.find(c => c.name.toLowerCase() === custName.toLowerCase()) || templateData.customers[i % templateData.customers.length];

          // Dynamically register customer
          const customerId = await dbService.getOrCreateCustomer(businessId, ownerId, custName, {
            phone: matchingCust.phone,
            email: matchingCust.email,
            address: matchingCust.address,
            avatar: matchingCust.avatar
          });

          const prod = seedProducts[i % seedProducts.length];
          const orderId = `ORD_SEED_${i}_${businessId.substring(0,4)}`;
          const invoiceNo = `INV-2026-${orderId.substring(9)}`;
          const date = new Date(Date.now() - i * 24*60*60*1000).toISOString().split('T')[0];
          const total = prod.price;

          const newOrder: Order = {
            id: orderId,
            business_id: businessId,
            owner_id: ownerId,
            customer_id: customerId,
            customer_name: custName,
            total,
            status: 'Completed',
            payment_method: 'UPI',
            invoice_no: invoiceNo,
            date,
            created_at: new Date(Date.now() - i * 24*60*60*1000).toISOString()
          };
          localOrders.push(newOrder);

          const newOrderItem: OrderItem = {
            id: `ITEM_SEED_${i}_${businessId.substring(0,4)}`,
            order_id: orderId,
            business_id: businessId,
            product_id: prod.id,
            product_name: prod.name,
            quantity: 1,
            price: total,
            created_at: new Date(Date.now() - i * 24*60*60*1000).toISOString()
          };
          localItems.push(newOrderItem);

          const newInvoice: Invoice = {
            id: `INV_SEED_${i}_${businessId.substring(0,4)}`,
            order_id: orderId,
            business_id: businessId,
            customer_name: custName,
            invoice_no: invoiceNo,
            date,
            discount: 0,
            gst_amount: Math.floor(total * 0.05),
            total_amount: total,
            status: 'Paid',
            created_at: new Date(Date.now() - i * 24*60*60*1000).toISOString()
          };
          localInvoices.push(newInvoice);

          const newPayment: Payment = {
            id: `PAY_SEED_${i}_${businessId.substring(0,4)}`,
            order_id: orderId,
            business_id: businessId,
            customer_name: custName,
            amount: total,
            status: 'Success',
            method: 'UPI',
            date,
            upi_id: `${custName.split(' ')[0].toLowerCase()}@okaxis`,
            txn_id: `TXN_SEED_${i}_${Math.random().toString(36).substring(2,5).toUpperCase()}`,
            created_at: new Date(Date.now() - i * 24*60*60*1000).toISOString()
          };
          localPayments.push(newPayment);
        }

        localStore.saveTable('orders', localOrders);
        localStore.saveTable('order_items', localItems);
        localStore.saveTable('invoices', localInvoices);
        localStore.saveTable('payments', localPayments);
      }

      // Appointments
      const localAppointments = localStore.getTable<Appointment>('appointments');
      const seedAppointments: Appointment[] = templateData.appointments.slice(0, 5).map((apt, idx) => ({
        id: `APT_SEED_${idx}_${businessId.substring(0,4)}`,
        business_id: businessId,
        owner_id: ownerId,
        customer_name: apt.customerName,
        service_name: apt.serviceName,
        date: apt.date,
        time: apt.time,
        status: apt.status,
        price: apt.price,
        created_at: new Date().toISOString()
      }));
      localStore.saveTable('appointments', [...localAppointments, ...seedAppointments]);
    }
  }
};
