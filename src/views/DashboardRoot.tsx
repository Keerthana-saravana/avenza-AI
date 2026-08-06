import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ShoppingBag, BarChart3, Calendar, FileText, 
  ShieldCheck, Users, Settings, LogOut, Search,
  Bell, ChevronDown, CheckCircle, AlertTriangle, Play, Menu, X,
  Plus, Download, Printer, RefreshCw, Send,
  TrendingUp, Info
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import type { ActiveTab, UIOrder } from '../context/BusinessContext';
import type { Customer, Product } from '../services/db';
import { dbService } from '../services/db';
import { getProductImageUrl } from '../utils/imageHelper';
import useSWR from 'swr';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, PieChart, Pie, Cell
} from 'recharts';

export const DashboardRoot: React.FC = () => {
  const { 
    activeTab, setActiveTab, 
    activeTemplate, switchTemplate, 
    businessData, setCurrentView, setIsLoggedIn,
    toast, isDemoRunning, demoStep, runJudgeDemo,
    activeBusiness, setActiveUser, setActiveBusiness
  } = useBusiness();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [templateDropdownOpen, setTemplateDropdownOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  // Caching Analytics dynamically from DB via SWR
  // Revalidates/polls every 3 seconds for instant real-time sync!
  const { data: analytics } = useSWR(
    activeBusiness ? `analytics_${activeBusiness.id}` : null,
    () => dbService.getAnalytics(activeBusiness!.id),
    { refreshInterval: 3000 }
  );

  const stats = analytics || {
    revenue: 0,
    orderCount: 0,
    lowStockCount: 0,
    upcomingAppointments: 0,
    averageOrderValue: 0,
    chartData: [],
    topCustomers: [],
    topSellingProducts: [],
    categoryDistribution: [],
    repeatCustomersPercent: 0,
    conversionRate: 0
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-5" /> },
    { id: 'ai-assistant', label: 'AI Assistant', icon: <Sparkles className="w-4 h-5" />, highlight: true },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-5" /> },
    { id: 'products', label: 'Products', icon: <Plus className="w-4 h-5" /> },
    { id: 'inventory', label: 'Inventory', icon: <AlertTriangle className="w-4 h-5" /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-5" /> },
    { id: 'invoices', label: 'Invoices', icon: <FileText className="w-4 h-5" /> },
    { id: 'payments', label: 'Payments', icon: <ShieldCheck className="w-4 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-5" /> }
  ];

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveUser(null);
    setActiveBusiness(null);
    localStorage.removeItem('avenza_active_user');
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex font-sans overflow-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-bold ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
              toast.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
              'bg-indigo-50 text-indigo-800 border border-indigo-100'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              toast.type === 'success' ? 'bg-emerald-500' :
              toast.type === 'warning' ? 'bg-amber-500' :
              'bg-indigo-500'
            }`}></div>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for AI Chat */}
      {activeTab !== 'ai-assistant' && (
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab('ai-assistant')}
          className="fixed bottom-6 right-6 z-40 gradient-bg text-white p-4.5 rounded-full shadow-2xl flex items-center justify-center hover:shadow-pink-500/20 transition-all border border-white"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
        </motion.button>
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-pink-100 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-pink-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="gradient-bg p-1.5 rounded-xl text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-brand-dark">
                AVENZA <span className="text-brand-secondary font-light">AI</span>
              </span>
            </div>
            <button className="md:hidden p-1 text-slate-400" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Workspace template dropdown switcher */}
          <div className="p-4 relative">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-2">Niche Template</label>
            <button 
              onClick={() => setTemplateDropdownOpen(!templateDropdownOpen)}
              className="w-full px-3 py-2.5 rounded-xl border border-pink-100 hover:border-brand-primary/50 text-left text-xs font-semibold flex items-center justify-between bg-pink-50/20 text-slate-700 active:scale-98 transition-all"
            >
              <span className="flex items-center space-x-2">
                <span className="text-sm">
                  {activeTemplate === 'boutique' ? '🌸' : activeTemplate === 'bakery' ? '🎂' : '💇‍♀️'}
                </span>
                <span>
                  {activeTemplate === 'boutique' ? 'Aura Boutique' : activeTemplate === 'bakery' ? 'The Whisk Bakery' : 'Glow Salon'}
                </span>
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {templateDropdownOpen && (
              <div className="absolute top-[80px] left-4 right-4 z-40 bg-white border border-pink-100 rounded-2xl shadow-xl p-2.5 space-y-1 mt-1">
                {[
                  { id: 'boutique', label: 'Aura Boutique', emoji: '🌸' },
                  { id: 'bakery', label: 'The Whisk Bakery', emoji: '🎂' },
                  { id: 'salon', label: 'Glow & Grace Salon', emoji: '💇‍♀️' }
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => {
                      switchTemplate(item.id as any);
                      setTemplateDropdownOpen(false);
                    }}
                    className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center space-x-2 transition-colors ${
                      activeTemplate === item.id ? 'bg-pink-100/50 text-brand-secondary' : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-2 space-y-0.5 overflow-y-auto max-h-[50vh]">
            {menuItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as ActiveTab);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left text-xs font-semibold px-3.5 py-3 rounded-xl flex items-center space-x-3 transition-all ${
                  activeTab === item.id 
                    ? 'gradient-bg text-white shadow-md shadow-purple-500/10' 
                    : item.highlight 
                    ? 'bg-pink-50/50 text-brand-secondary hover:bg-pink-100/50' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={activeTab === item.id ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
                {item.highlight && activeTab !== item.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary ml-auto animate-pulse"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-pink-50 space-y-3">
          {/* Judge Demo Trigger */}
          <button 
            onClick={runJudgeDemo}
            disabled={isDemoRunning}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 border transition-all ${
              isDemoRunning 
                ? 'bg-indigo-50 border-indigo-100 text-indigo-700 cursor-not-allowed'
                : 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-purple-500/15 hover:opacity-95 hover:scale-[1.02] active:scale-98'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isDemoRunning ? 'animate-spin' : 'fill-white'}`} />
            <span>{isDemoRunning ? 'Running Demo...' : '🎥 Judge Demo Mode'}</span>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full text-left text-xs font-semibold text-slate-500 hover:text-red-500 px-3.5 py-2.5 rounded-xl flex items-center space-x-3 transition-colors hover:bg-red-50/30"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen bg-brand-bg">
        
        {/* Top Header */}
        <header className="bg-white border-b border-pink-100 px-6 py-4 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center space-x-3">
            <button className="md:hidden p-1.5 text-slate-500 hover:bg-slate-50 rounded-xl" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            {activeBusiness && (
              <div>
                <h2 className="text-base font-bold text-brand-dark flex items-center space-x-1.5">
                  <span>{activeBusiness.name}</span>
                  <span className="text-[10px] bg-pink-100/70 text-brand-secondary border border-pink-200/50 px-2 py-0.5 rounded-full font-semibold">
                    {activeBusiness.category}
                  </span>
                </h2>
                <p className="text-[10px] text-slate-400">Owner: {businessData.ownerName} • Live System Operating</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-slate-100 px-3.5 py-2 rounded-xl w-60">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Global search..." 
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-700 outline-none w-full" 
              />
            </div>

            {/* Notifications */}
            <div className="relative cursor-pointer hover:bg-slate-50 p-2 rounded-xl">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-secondary"></span>
            </div>

            {/* Profile Avatar summary */}
            <div className="flex items-center space-x-2.5 border-l border-slate-100 pl-4">
              <img 
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${businessData.ownerName.split(" ")[0].toLowerCase()}`} 
                alt={businessData.ownerName} 
                className="w-8 h-8 rounded-full bg-pink-50"
              />
              <div className="hidden sm:block text-left">
                <h4 className="text-xs font-bold text-brand-dark leading-tight">{businessData.ownerName}</h4>
                <p className="text-[9px] font-bold text-emerald-600">Online</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab View container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Judge Demo Banner overlay when running */}
          {isDemoRunning && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-900 text-white rounded-3xl p-5 mb-8 shadow-xl border border-indigo-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-800/40 rounded-full blur-2xl"></div>
              <div className="relative z-10 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-pink-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Cinematic Demo Running (WhatsApp Checkout Journey)</span>
                </div>
                <h3 className="text-lg font-bold">Watch Avenza operate on autopilot</h3>
                <p className="text-indigo-200 text-xs">AI chatbot receives messages, parses catalog, constructs invoice, requests UPI, and updates reports.</p>
              </div>
              
              {/* Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full md:w-auto relative z-10 text-[10px] font-semibold text-indigo-200">
                {[
                  { step: 1, label: "1. Message" },
                  { step: 2, label: "2. Search" },
                  { step: 3, label: "3. Invoice" },
                  { step: 4, label: "4. Payment" },
                  { step: 5, label: "5. CRM Log" }
                ].map((s) => (
                  <div key={s.step} className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5 ${
                    demoStep === s.step ? 'bg-brand-secondary text-white font-extrabold animate-pulse' :
                    demoStep > s.step ? 'bg-emerald-600 text-white' : 'bg-indigo-950/50 border border-indigo-800/40'
                  }`}>
                    {demoStep > s.step ? <CheckCircle className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-indigo-400"></div>}
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Module Selection rendering */}
          {activeTab === 'dashboard' && <ModuleDashboard stats={stats} />}
          {activeTab === 'ai-assistant' && <ModuleAIAssistant />}
          {activeTab === 'customers' && <ModuleCustomers globalSearch={globalSearchTerm} />}
          {activeTab === 'orders' && <ModuleOrders globalSearch={globalSearchTerm} />}
          {activeTab === 'products' && <ModuleProducts globalSearch={globalSearchTerm} />}
          {activeTab === 'inventory' && <ModuleInventory globalSearch={globalSearchTerm} />}
          {activeTab === 'appointments' && <ModuleAppointments globalSearch={globalSearchTerm} />}
          {activeTab === 'invoices' && <ModuleInvoices globalSearch={globalSearchTerm} />}
          {activeTab === 'payments' && <ModulePayments globalSearch={globalSearchTerm} />}
          {activeTab === 'analytics' && <ModuleAnalytics stats={stats} />}
          {activeTab === 'settings' && <ModuleSettings />}

        </main>
      </div>
    </div>
  );
};

/* ========================================== */
/*           SUB-MODULE 1: DASHBOARD          */
/* ========================================== */
const ModuleDashboard: React.FC<{ stats: any }> = ({ stats }) => {
  const { businessData, activeTemplate, setActiveTab, refreshAllData } = useBusiness();

  // Niche-specific KPI calculations derived from actual DB values
  const cakeOrdersCount = businessData.orders.filter(o => 
    o.products?.some(p => p.name.toLowerCase().includes('cake'))
  ).length;

  const customCakesCount = businessData.orders.filter(o => 
    o.products?.some(p => p.name.toLowerCase().includes('custom') || p.name.toLowerCase().includes('style'))
  ).length;

  const chocolateOrdersCount = businessData.orders.filter(o => 
    o.products?.some(p => p.name.toLowerCase().includes('chocolate') || p.name.toLowerCase().includes('truffle'))
  ).length;

  const dressOrdersCount = businessData.orders.filter(o => 
    o.products?.some(p => p.name.toLowerCase().includes('saree') || p.name.toLowerCase().includes('kurti'))
  ).length;

  const customStitchingCount = businessData.appointments.filter(a => 
    a.service_name.toLowerCase().includes('consultation') || a.service_name.toLowerCase().includes('fitting')
  ).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-pink-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-44 h-44 bg-pink-100/30 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <h2 className="text-xl md:text-2xl font-black text-brand-dark">Welcome back, {businessData.ownerName}! 🌸</h2>
          <p className="text-xs text-slate-500 mt-1">Workspace: {businessData.businessName} • Avenza has parsed {businessData.orders.length} transactions.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('ai-assistant')}
            className="gradient-btn text-xs font-bold px-4 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Ask Assistant
          </button>
        </div>
      </div>

      {/* KPI Stats Cards Grid (Dynamic Niche conditional rendering) */}
      {activeTemplate === 'bakery' && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Cake Orders", value: cakeOrdersCount, desc: "Cakes ordered count", color: "text-pink-600" },
            { label: "Custom Cake Orders", value: customCakesCount, desc: "Bespoke decorations", color: "text-purple-600" },
            { label: "Chocolate Orders", value: chocolateOrdersCount, desc: "Flavors in demand", color: "text-amber-800" },
            { label: "Low Stock Ingredients", value: stats.lowStockCount, desc: "Requires restock", color: "text-red-500" },
            { label: "Cake Revenue", value: `₹${stats.revenue.toLocaleString('en-IN')}`, desc: "Calculated from orders", color: "text-emerald-600" }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-pink-50 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{kpi.label}</span>
              <h3 className={`text-lg md:text-xl font-black mt-2 ${kpi.color}`}>{kpi.value}</h3>
              <p className="text-[10px] text-slate-400 mt-1">{kpi.desc}</p>
            </div>
          ))}
        </div>
      )}

      {activeTemplate === 'boutique' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Dress Orders", value: dressOrdersCount, desc: "Kurtis & sarees sold", color: "text-brand-secondary" },
            { label: "Custom Stitching", value: customStitchingCount, desc: "Fittings booked", color: "text-purple-600" },
            { label: "Fabric Inventory", value: businessData.products.filter(p => p.stock > 0).length, desc: "Active items", color: "text-amber-600" },
            { label: "Boutique Revenue", value: `₹${stats.revenue.toLocaleString('en-IN')}`, desc: "Calculated from orders", color: "text-emerald-600" }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-pink-50 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{kpi.label}</span>
              <h3 className={`text-lg md:text-xl font-black mt-2 ${kpi.color}`}>{kpi.value}</h3>
              <p className="text-[10px] text-slate-400 mt-1">{kpi.desc}</p>
            </div>
          ))}
        </div>
      )}

      {activeTemplate === 'salon' && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Appointments", value: stats.upcomingAppointments, desc: "Upcoming client bookings", color: "text-indigo-600" },
            { label: "Beauticians Active", value: "3 Stylists", desc: "Staff availability", color: "text-purple-600" },
            { label: "Active Services", value: businessData.products.length, desc: "Hair, makeup, nails", color: "text-pink-600" },
            { label: "Available Slots", value: "8 slots today", desc: "Daily calendar", color: "text-amber-600" },
            { label: "Salon Revenue", value: `₹${stats.revenue.toLocaleString('en-IN')}`, desc: "Calculated from database", color: "text-emerald-600" }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-pink-50 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{kpi.label}</span>
              <h3 className={`text-lg md:text-xl font-black mt-2 ${kpi.color}`}>{kpi.value}</h3>
              <p className="text-[10px] text-slate-400 mt-1">{kpi.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales trend chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-pink-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-brand-dark">Weekly Revenue Trend</h3>
              <p className="text-[10px] text-slate-400">Total transaction metrics from retail channels</p>
            </div>
            <span className="text-xs font-bold text-brand-secondary bg-pink-50 px-3 py-1.5 rounded-full border border-pink-100">
              UPI Transactions
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E8FF" />
                <XAxis dataKey="name" stroke="#A78BFA" fontSize={9} tickLine={false} />
                <YAxis stroke="#A78BFA" fontSize={9} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Business Insights Panel */}
        <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-brand-secondary mb-4">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <h3 className="text-sm font-bold">Avenza Smart Insights</h3>
            </div>

            <div className="space-y-4">
              {businessData.insights.map((insight, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs leading-relaxed text-slate-600 bg-pink-50/20 p-3 rounded-xl border border-pink-50">
                  <span className="text-base flex-shrink-0 mt-0.5">
                    {idx === 0 ? '📈' : idx === 1 ? '⚠️' : idx === 2 ? '💡' : '🌟'}
                  </span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 rounded-2xl p-3 border border-purple-100 flex items-center justify-between text-[10px] text-brand-primary mt-6">
            <span className="font-semibold">Live Database Sync Active</span>
            <button 
              onClick={refreshAllData}
              className="p-1 hover:bg-purple-100 rounded-lg text-brand-primary transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders and Appointments Quick lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent orders */}
        <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-brand-dark">Recent Activity Feed</h3>
            <button onClick={() => setActiveTab('orders')} className="text-[10px] font-bold text-brand-secondary hover:underline">
              View All Orders
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {businessData.orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-800">{order.customer_name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">ID: {order.id} • {order.payment_method}</p>
                  <p className="text-[9px] text-brand-secondary font-semibold mt-0.5 bg-pink-50/50 px-1.5 py-0.5 rounded border border-pink-100/50 inline-block">
                    Ordered: {order.products?.map(p => `${p.name} (x${p.quantity})`).join(', ') || 'General Catalog Item'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">₹{order.total}</span>
                  <span className={`block text-[9px] mt-0.5 font-bold ${
                    order.status === 'Completed' ? 'text-emerald-600' :
                    order.status === 'Cancelled' ? 'text-red-500' : 'text-amber-500'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointments calendar review */}
        <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-brand-dark">Calendar Bookings</h3>
            <button onClick={() => setActiveTab('appointments')} className="text-[10px] font-bold text-brand-secondary hover:underline">
              View Calendar
            </button>
          </div>

          <div className="space-y-3.5">
            {businessData.appointments.slice(0, 4).map((apt) => (
              <div key={apt.id} className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs">
                    {apt.time.split(":")[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{apt.customer_name}</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">{apt.service_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold block text-slate-400">{apt.date}</span>
                  <span className="text-[10px] font-bold text-brand-primary block mt-0.5">{apt.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================== */
/*         SUB-MODULE 2: AI ASSISTANT         */
/* ========================================== */
const ModuleAIAssistant: React.FC = () => {
  const { 
    chatMessages, addChatMessage, clearChat, 
    isDemoRunning, runJudgeDemo
  } = useBusiness();

  const [inputVal, setInputVal] = useState("");

  const suggestions = [
    "How many orders today?",
    "Low stock alerts?",
    "Show cakes under ₹1500",
    "Show sarees under ₹2500",
    "What are our business hours?",
    "Book an appointment slot"
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    addChatMessage({
      sender: 'customer',
      text: inputVal
    });

    setInputVal("");
  };

  return (
    <div className="bg-white rounded-3xl border border-pink-100 flex flex-col h-[75vh] relative shadow-sm overflow-hidden font-sans">
      
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-pink-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-100/50 flex items-center justify-center text-brand-secondary border border-pink-200/40">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-dark">Avenza Conversational AI</h3>
            <p className="text-[10px] text-slate-400">Database connected • Online</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={clearChat}
            className="p-2 border border-slate-100 hover:bg-slate-50 transition-colors rounded-xl text-[10px] font-bold text-slate-500 flex items-center space-x-1"
          >
            <span>Reset Chat</span>
          </button>
          {!isDemoRunning && (
            <button 
              onClick={runJudgeDemo}
              className="gradient-btn text-[10px] font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 active:scale-95"
            >
              <Play className="w-2.5 h-2.5 fill-white" />
              <span>Auto Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat Logs Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-pink-50/10">
        {chatMessages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col max-w-[80%] ${msg.sender === 'customer' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
          >
            {/* Sender Label */}
            <span className="text-[9px] font-bold text-slate-400 mb-1 px-1">
              {msg.sender === 'customer' ? 'You' : msg.sender === 'assistant' ? 'Avenza Assistant' : 'System Automation Log'}
            </span>

            {/* Bubble */}
            <div className={`p-4 rounded-3xl text-xs leading-relaxed ${
              msg.sender === 'customer' 
                ? 'bg-brand-secondary text-white rounded-tr-none shadow-sm'
                : msg.sender === 'system'
                ? 'bg-indigo-900 text-indigo-100 border border-indigo-950 font-semibold'
                : 'bg-white text-slate-700 border border-pink-100 shadow-sm rounded-tl-none'
            }`}>
              {msg.text}

              {/* Render dynamic matching products card carousel if present */}
              {msg.products && msg.products.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {msg.products.map((p) => (
                    <div key={p.id} className="bg-slate-50 border border-pink-50/50 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="w-full h-20 rounded-xl bg-slate-50 border border-slate-100 mb-2 overflow-hidden">
                          <img 
                            src={getProductImageUrl(p.image_url || (p as any).image, p.name, p.category)} 
                            alt={p.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-bold text-slate-800 text-[11px] leading-tight line-clamp-1">{p.name}</h4>
                        <span className="text-[10px] font-bold text-brand-secondary mt-1 block">₹{p.price}</span>
                      </div>
                      <button 
                        onClick={() => addChatMessage({ sender: 'customer', text: `I want to order ${p.name}` })}
                        className="mt-3 w-full py-1.5 gradient-bg text-white text-[9px] font-bold rounded-lg shadow-sm hover:scale-[1.02] active:scale-98 transition-transform"
                      >
                        Select & Buy
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Render simulated invoice structure if present */}
              {msg.invoice && (
                <div className="mt-4 bg-slate-50 border border-pink-100/50 p-4 rounded-2xl text-slate-700 space-y-3 font-mono">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2 text-[10px]">
                    <span className="font-bold text-brand-primary">INVOICE DRAFT</span>
                    <span>{msg.invoice.invoiceNo}</span>
                  </div>
                  <div className="text-[10px] space-y-1">
                    <p><span className="font-bold">Bill To:</span> {msg.invoice.customerName}</p>
                    <p><span className="font-bold">Item:</span> {msg.invoice.products?.[0]?.name} (x{msg.invoice.products?.[0]?.quantity || 1})</p>
                    <p><span className="font-bold">Tax Base (GST 5% Included):</span> ₹{Math.floor(msg.invoice.total! * 0.95)}</p>
                    <p className="text-xs font-bold text-slate-800 border-t border-slate-200 pt-2 flex justify-between">
                      <span>Total Amount:</span>
                      <span>₹{msg.invoice.total}</span>
                    </p>
                  </div>

                  {/* Render UPI Payment QR Code generator */}
                  {msg.paymentQr && (
                    <div className="flex flex-col items-center justify-center pt-3 border-t border-slate-200 border-dashed">
                      <button 
                        type="button"
                        onClick={() => addChatMessage({ sender: 'customer', text: "Payment successful" })}
                        className="w-24 h-24 bg-white border border-slate-200 rounded-xl p-1.5 flex items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors"
                      >
                        {/* Mock QR Code Graphic */}
                        <div className="w-full h-full bg-slate-100 rounded-lg flex flex-col items-center justify-center text-[7px] font-bold text-slate-400">
                          <ShieldCheck className="w-5 h-5 text-brand-primary mb-1 animate-pulse" />
                          <span>TAP TO PAY</span>
                        </div>
                      </button>
                      <span className="text-[9px] font-semibold text-slate-400 mt-2">Dynamic UPI QR generated (Click to simulate pay)</span>
                    </div>
                  )}
                </div>
              )}

              {/* Render verified payment receipt badge */}
              {msg.paymentSuccess && (
                <div className="mt-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center space-x-2 text-[10px] text-emerald-800">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold">UPI settlement transaction confirmed!</span>
                    <p className="text-[9px] text-emerald-600 mt-0.5">Order registered in dynamic databases, stock adjusted.</p>
                  </div>
                </div>
              )}
            </div>

            <span className="text-[8px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Suggestion Chips */}
      <div className="px-6 py-2 bg-slate-50 border-t border-pink-50 flex items-center space-x-2 overflow-x-auto flex-shrink-0 scrollbar-none">
        {suggestions.map((chip, idx) => (
          <button 
            key={idx}
            onClick={() => setInputVal(chip)}
            className="flex-shrink-0 text-[10px] font-semibold text-slate-600 hover:text-brand-primary hover:border-brand-primary/50 transition-all bg-white border border-pink-50 px-3 py-1.5 rounded-full shadow-xs active:scale-95"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Inputs panel */}
      <form onSubmit={handleSend} className="p-4 border-t border-pink-50 bg-white flex items-center space-x-3 flex-shrink-0">
        <input 
          type="text" 
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 px-4 py-3 border border-slate-200 focus:border-brand-primary focus:outline-none text-xs rounded-2xl"
          placeholder="Ask Avenza to look up inventory, write messages, create custom invoice records..."
        />
        <button 
          type="submit"
          className="gradient-bg text-white p-3 rounded-2xl shadow-md flex items-center justify-center hover:opacity-95 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

/* ========================================== */
/*          SUB-MODULE 3: CUSTOMERS           */
/* ========================================== */
interface ModuleCustomersProps {
  globalSearch: string;
}
const ModuleCustomers: React.FC<ModuleCustomersProps> = ({ globalSearch }) => {
  const { businessData } = useBusiness();
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);

  // Filter dynamic directory
  const filteredCustomers = businessData.customers.filter(c => 
    c.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
    c.phone.includes(globalSearch) ||
    (c.email && c.email.toLowerCase().includes(globalSearch.toLowerCase()))
  );

  // Automatically select first element if selectedCust is null
  const activeCust = selectedCust || filteredCustomers[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
      {/* Directory Table */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-pink-100 p-6 shadow-sm overflow-hidden flex flex-col">
        <h3 className="text-sm font-bold text-brand-dark mb-4">Customer Relationship Directory (CRM)</h3>
        
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="py-3 px-2">Customer</th>
                <th className="py-3 px-2">Phone</th>
                <th className="py-3 px-2">Location</th>
                <th className="py-3 px-2 text-right">Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.slice(0, 15).map((cust) => {
                const totalOrdersCount = businessData.orders.filter(o => o.customer_name === cust.name).length;
                return (
                  <tr 
                    key={cust.id}
                    onClick={() => setSelectedCust(cust)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      activeCust?.id === cust.id ? 'bg-pink-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-2 flex items-center space-x-2.5">
                      <img src={cust.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${cust.name}`} className="w-7 h-7 rounded-full bg-pink-100/50" />
                      <div>
                        <span className="font-bold text-slate-800">{cust.name}</span>
                        <span className="block text-[9px] text-slate-400">{cust.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-slate-500 font-medium">{cust.phone}</td>
                    <td className="py-3.5 px-2 text-slate-500 max-w-[120px] truncate">{cust.address?.split(",").slice(-2).join(",") || 'Online Client'}</td>
                    <td className="py-3.5 px-2 text-right font-bold text-slate-800">{totalOrdersCount} orders</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected profile summary card */}
      <div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-sm">
        {activeCust ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <img src={activeCust.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${activeCust.name}`} className="w-20 h-20 rounded-full bg-pink-100/50 mb-3" />
              <h4 className="font-bold text-brand-dark">{activeCust.name}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">ID: {activeCust.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center border-y border-slate-100 py-4">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Total Orders</span>
                <p className="text-base font-black text-brand-primary mt-0.5">
                  {businessData.orders.filter(o => o.customer_name === activeCust.name).length}
                </p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">LTV Amount</span>
                <p className="text-base font-black text-brand-secondary mt-0.5">
                  ₹{businessData.orders
                    .filter(o => o.customer_name === activeCust.name && o.status === 'Completed')
                    .reduce((sum, o) => sum + o.total, 0)
                  }
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Contact Coordinates</span>
                <div className="mt-2 space-y-1.5 text-xs text-slate-600">
                  <p><span className="font-bold">Phone:</span> {activeCust.phone}</p>
                  <p><span className="font-bold">Email:</span> {activeCust.email || 'None'}</p>
                  <p><span className="font-bold">Address:</span> {activeCust.address || 'None'}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Merchant Internal Notes</span>
                <p className="text-xs text-slate-500 leading-normal mt-1.5">{activeCust.notes || 'No merchant notes logged.'}</p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Purchase History</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {businessData.orders
                    .filter(o => o.customer_name.toLowerCase() === activeCust.name.toLowerCase())
                    .map(o => (
                      <div key={o.id} className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-700 block">{o.date}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                              o.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {o.status === 'Completed' ? 'Complete' : 'Incomplete'}
                            </span>
                          </div>
                          <span className="text-[10px] text-brand-secondary font-semibold block">
                            {o.products?.map(p => `${p.name} (x${p.quantity})`).join(', ') || 'General Catalog Item'}
                          </span>
                          <span className="text-[9px] text-slate-400 block">ID: {o.id} • {o.payment_method}</span>
                        </div>
                        <span className="font-bold text-slate-800">₹{o.total}</span>
                      </div>
                    ))}
                  {businessData.orders.filter(o => o.customer_name.toLowerCase() === activeCust.name.toLowerCase()).length === 0 && (
                    <p className="text-[10px] text-slate-400 italic">No orders recorded for this customer yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Users className="w-8 h-8 mb-2" />
            <span className="text-xs font-semibold">Select a customer profile to view metrics</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================== */
/*            SUB-MODULE 4: ORDERS            */
/* ========================================== */
interface ModuleOrdersProps {
  globalSearch: string;
}
const ModuleOrders: React.FC<ModuleOrdersProps> = ({ globalSearch }) => {
  const { businessData, showToast, refreshAllData } = useBusiness();
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Processing' | 'Completed' | 'Cancelled'>('All');
  const [selectedOrder, setSelectedOrder] = useState<UIOrder | null>(null);

  const filteredOrders = businessData.orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(globalSearch.toLowerCase()) || 
                          o.customer_name.toLowerCase().includes(globalSearch.toLowerCase()) || 
                          o.invoice_no.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesFilter = filter === 'All' || o.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleMarkAsPaid = async (orderId: string) => {
    try {
      const payment = businessData.payments.find(pay => pay.order_id === orderId);
      if (payment) {
        await dbService.updatePaymentStatus(payment.id, 'Success');
        await refreshAllData();
        showToast(`Order payment status updated to Complete!`, 'success');
        setSelectedOrder(prev => prev ? { ...prev, status: 'Completed' } : null);
      } else {
        showToast(`Payment record not found for this order.`, 'warning');
      }
    } catch (err: any) {
      showToast(`Failed to update status`, 'warning');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-sm overflow-hidden flex flex-col font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-brand-dark">Customer Transaction Orders</h3>
          <p className="text-[10px] text-slate-400">View and update active checkout records</p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-xl text-[10px] font-bold text-slate-500">
          {(['All', 'Pending', 'Processing', 'Completed', 'Cancelled'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filter === tab ? 'bg-white text-brand-secondary shadow-xs' : 'hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold">
              <th className="py-3 px-2">Order ID</th>
              <th className="py-3 px-2">Product Image</th>
              <th className="py-3 px-2">Customer</th>
              <th className="py-3 px-2">Items Ordered</th>
              <th className="py-3 px-2">Order Date</th>
              <th className="py-3 px-2">Checkout Method</th>
              <th className="py-3 px-2">Billing Invoice</th>
              <th className="py-3 px-2 text-right">Total Billing</th>
              <th className="py-3 px-2 text-center">Fulfillment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredOrders.slice(0, 15).map((order) => (
              <tr 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className="hover:bg-slate-50/50 cursor-pointer transition-colors"
              >
                <td className="py-3.5 px-2 font-bold text-slate-700">{order.id}</td>
                <td className="py-3.5 px-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    {order.products?.map((p, idx) => {
                      const fullProduct = businessData.products.find(prod => prod.id === p.productId);
                      const imgUrl = getProductImageUrl(fullProduct?.image_url || (fullProduct as any)?.image, p.name, fullProduct?.category);
                      return (
                        <img 
                          key={idx}
                          src={imgUrl}
                          alt={p.name}
                          className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                          title={p.name}
                        />
                      );
                    }) || (
                      <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-400">
                        N/A
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3.5 px-2 font-bold text-slate-800">{order.customer_name}</td>
                <td className="py-3.5 px-2 font-medium text-brand-secondary font-semibold">
                  {order.products?.map(p => `${p.name} (x${p.quantity})`).join(', ') || 'General Catalog Item'}
                </td>
                <td className="py-3.5 px-2 text-slate-400 font-medium">{order.date}</td>
                <td className="py-3.5 px-2 font-semibold text-slate-500">{order.payment_method}</td>
                <td className="py-3.5 px-2 font-mono text-[10px] text-brand-primary font-bold">{order.invoice_no}</td>
                <td className="py-3.5 px-2 text-right font-black text-slate-800">₹{order.total}</td>
                <td className="py-3.5 px-2 text-center">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold ${
                    order.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-100' :
                    'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {order.status === 'Completed' ? 'Complete' : 'Incomplete'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-brand-dark/40 backdrop-blur-xs flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 border border-pink-100 relative max-h-[90vh] overflow-y-auto"
          >
            <button className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600" onClick={() => setSelectedOrder(null)}>
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-brand-dark mb-4">Order details & Fulfillment</h3>

            <div className="space-y-6">
              {/* Order Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Order ID</span>
                  <span className="font-bold text-slate-800">{selectedOrder.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Invoice No</span>
                  <span className="font-bold text-brand-primary font-mono">{selectedOrder.invoice_no}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Order Date</span>
                  <span className="font-bold text-slate-800">{selectedOrder.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Checkout Method</span>
                  <span className="font-bold text-slate-800">{selectedOrder.payment_method}</span>
                </div>
              </div>

              {/* Payer Information */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Customer Info</span>
                <p className="text-xs font-semibold text-slate-700">{selectedOrder.customer_name}</p>
              </div>

              {/* Items List */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Items Ordered</span>
                <div className="space-y-3">
                  {selectedOrder.products?.map((item, idx) => {
                    const fullProduct = businessData.products.find(prod => prod.id === item.productId);
                    const imgUrl = getProductImageUrl(fullProduct?.image_url || (fullProduct as any)?.image, item.name, fullProduct?.category);
                    return (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                        <div className="flex items-center space-x-3">
                          <img src={imgUrl} alt={item.name} className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{item.name}</p>
                            <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-700">₹{item.price * item.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing Totals */}
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Payment Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    selectedOrder.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {selectedOrder.status === 'Completed' ? 'Complete / Success' : 'Incomplete / Pending'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Total Amount</span>
                  <span className="text-base font-black text-brand-secondary">₹{selectedOrder.total}</span>
                </div>
              </div>

              {/* COD Payment Status Editing Action */}
              {selectedOrder.status !== 'Completed' && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-3">
                  <p className="text-[11px] text-amber-800 leading-normal">
                    This order is currently pending payment confirmation. Once you have received the cash or verified the transaction, click the button below to update records.
                  </p>
                  <button
                    onClick={() => handleMarkAsPaid(selectedOrder.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-colors"
                  >
                    Mark Payment as Received & Complete
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

/* ========================================== */
/*           SUB-MODULE 5: PRODUCTS           */
/* ========================================== */
interface ModuleProductsProps {
  globalSearch: string;
}
const ModuleProducts: React.FC<ModuleProductsProps> = ({ globalSearch }) => {
  const { businessData, addManualProduct, refreshAllData, showToast } = useBusiness();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCat, setNewProdCat] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdImage, setNewProdImage] = useState<string | null>(null);

  // Edit States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editCat, setEditCat] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImage, setEditImage] = useState<string | null>(null);

  const categories = ["All", ...Array.from(new Set(businessData.products.map(p => p.category)))];

  const combinedSearch = globalSearch || searchTerm;

  const filteredProds = businessData.products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(combinedSearch.toLowerCase()) || 
                          p.sku.toLowerCase().includes(combinedSearch.toLowerCase());
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdStock || !newProdCat) return;

    addManualProduct({
      name: newProdName,
      category: newProdCat,
      price: Number(newProdPrice),
      stock: Number(newProdStock),
      image_url: newProdImage || ""
    });

    setIsAddOpen(false);
    setNewProdName("");
    setNewProdCat("");
    setNewProdPrice("");
    setNewProdStock("");
    setNewProdImage(null);
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !editName || !editCat || !editPrice || !editStock) return;

    try {
      await dbService.updateProduct({
        ...selectedProduct,
        name: editName,
        category: editCat,
        price: Number(editPrice),
        stock: Number(editStock),
        image_url: editImage || selectedProduct.image_url
      });
      await refreshAllData();
      showToast(`Product "${editName}" updated successfully!`, 'success');
      setSelectedProduct(null);
    } catch (err: any) {
      showToast(`Failed to update product`, 'warning');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      if (isEdit) {
        setEditImage(base64Str);
      } else {
        setNewProdImage(base64Str);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenEditModal = (prod: Product) => {
    setSelectedProduct(prod);
    setEditName(prod.name);
    setEditCat(prod.category);
    setEditPrice(String(prod.price));
    setEditStock(String(prod.stock));
    setEditImage(prod.image_url || null);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Filters & Actions Panel */}
      <div className="bg-white p-6 rounded-3xl border border-pink-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
          {/* Search bar */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-3.5 py-2.5 rounded-xl w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={combinedSearch}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-700 outline-none w-full" 
            />
          </div>

          {/* Category Dropdown */}
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 outline-none"
          >
            {categories.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => setIsAddOpen(true)}
          className="gradient-btn text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 hover:scale-[1.02] active:scale-98 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>Add Catalog Item</span>
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {filteredProds.slice(0, 16).map((prod) => (
          <div 
            key={prod.id} 
            onClick={() => handleOpenEditModal(prod)}
            className="bg-white rounded-3xl border border-pink-50 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[300px] cursor-pointer hover:border-pink-200"
          >
            <div>
              <div className="w-full h-32 rounded-2xl bg-slate-50 flex items-center justify-center mb-3 overflow-hidden border border-slate-100 relative group">
                <img 
                  src={getProductImageUrl(prod.image_url, prod.name, prod.category)} 
                  alt={prod.name} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-lg text-[9px] text-white font-bold uppercase tracking-wider">
                  {prod.category}
                </div>
              </div>
              <h4 className="font-bold text-slate-800 text-xs leading-tight line-clamp-2">{prod.name}</h4>
              <p className="text-[9px] text-slate-400 mt-1 font-mono">{prod.sku}</p>
            </div>
            
            <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Price</span>
                <span className="text-xs font-black text-brand-secondary">₹{prod.price}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Stock</span>
                <span className={`text-[10px] font-extrabold ${
                  prod.status === 'In Stock' ? 'text-emerald-600' :
                  prod.status === 'Low Stock' ? 'text-amber-500' : 'text-red-500'
                }`}>{prod.stock === 999 ? '∞ Service' : prod.stock}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal Overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-brand-dark/40 backdrop-blur-xs flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-pink-100 relative"
          >
            <button className="absolute top-4 right-4 p-1 text-slate-400" onClick={() => setIsAddOpen(false)}>
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-brand-dark mb-4">Add Custom Catalog Item</h3>
            
            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name</label>
                <input 
                  type="text" 
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                  placeholder="e.g. Belgian Truffle Cake" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <input 
                  type="text" 
                  value={newProdCat}
                  onChange={(e) => setNewProdCat(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                  placeholder="e.g. Cakes, Sarees, Hair" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unit Price (₹)</label>
                  <input 
                    type="number" 
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                    placeholder="e.g. 1200" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Inventory stock qty</label>
                  <input 
                    type="number" 
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                    placeholder="e.g. 25 (Set 999 for infinite services)" 
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-brand-secondary hover:file:bg-pink-100 cursor-pointer" 
                />
                {newProdImage && (
                  <div className="mt-3 w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
                    <img src={newProdImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <button 
                type="submit"
                className="w-full gradient-btn font-bold py-3.5 rounded-xl text-xs shadow-md mt-6"
              >
                Create Product Item
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Product Details & Edit Modal Overlay */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-brand-dark/40 backdrop-blur-xs flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border border-pink-100 relative max-h-[90vh] overflow-y-auto"
          >
            <button className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600" onClick={() => setSelectedProduct(null)}>
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-brand-dark mb-4">Product Details & Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Preview Card */}
              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-between border border-slate-100">
                <div className="space-y-4">
                  <div className="w-full h-48 rounded-xl overflow-hidden bg-white border border-slate-200">
                    <img 
                      src={getProductImageUrl(editImage || selectedProduct.image_url, editName || selectedProduct.name, editCat || selectedProduct.category)} 
                      alt={selectedProduct.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono bg-pink-100 text-brand-secondary px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{editCat || 'Category'}</span>
                    <h4 className="font-bold text-slate-800 text-sm mt-2">{editName || 'Product Name'}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">SKU: {selectedProduct.sku}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-4 mt-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Price</span>
                    <span className="font-black text-brand-secondary text-sm">₹{editPrice || '0'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Stock Status</span>
                    <span className={`font-bold ${
                      Number(editStock) === 0 ? 'text-red-500' : Number(editStock) <= 5 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>{Number(editStock) === 999 ? '∞ Service' : Number(editStock) === 0 ? 'Out of Stock' : `${editStock} Available`}</span>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleEditProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <input 
                    type="text" 
                    value={editCat}
                    onChange={(e) => setEditCat(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Price (₹)</label>
                    <input 
                      type="number" 
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Stock</label>
                    <input 
                      type="number" 
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Product Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-brand-secondary hover:file:bg-pink-100 cursor-pointer" 
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full gradient-btn font-bold py-3.5 rounded-xl text-xs shadow-md mt-6"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

/* ========================================== */
/*          SUB-MODULE 6: INVENTORY           */
/* ========================================== */
interface ModuleInventoryProps {
  globalSearch: string;
}
const ModuleInventory: React.FC<ModuleInventoryProps> = ({ globalSearch }) => {
  const { businessData } = useBusiness();
  const lowsAndOuts = businessData.products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock');

  const filteredInventory = businessData.products.filter(p => 
    p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(globalSearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
      {/* Main Stock Table */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-pink-100 p-6 shadow-sm overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-brand-dark">Active Inventory Audit</h3>
            <p className="text-[10px] text-slate-400">Keep track of physical stock registers and quantities</p>
          </div>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            {lowsAndOuts.length} Alerts active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="py-3 px-2">SKU ID</th>
                <th className="py-3 px-2">Item Name</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2 text-right">Available Stock</th>
                <th className="py-3 px-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredInventory.slice(0, 15).map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-2 font-mono font-bold text-slate-500">{prod.sku}</td>
                  <td className="py-3 px-2 font-bold text-slate-800">{prod.name}</td>
                  <td className="py-3 px-2 text-slate-500">{prod.category}</td>
                  <td className="py-3 px-2 text-right font-bold text-slate-700">
                    {prod.stock === 999 ? '∞ Service' : prod.stock}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      prod.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700' :
                      prod.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 animate-pulse' : 'bg-red-50 text-red-700'
                    }`}>
                      {prod.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Restock Suggestions Sidebar */}
      <div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center space-x-2 text-brand-secondary mb-2">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <h3 className="text-sm font-bold">AI Restock Suggestions</h3>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">Smart alerts predicting depletion schedules based on current sales velocity.</p>
        </div>

        <div className="space-y-4">
          {lowsAndOuts.slice(0, 4).map((alert) => (
            <div key={alert.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 line-clamp-1">{alert.name}</span>
                <span className="font-mono text-[9px] text-slate-400">{alert.sku}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Current Qty: <span className="font-bold text-slate-700">{alert.stock}</span></span>
                <span className="text-brand-secondary font-bold">Reorder Size: 15 units</span>
              </div>
              <div className="bg-pink-100/30 border border-pink-200/50 rounded-xl p-2.5 text-[9px] text-brand-secondary leading-normal">
                🤖 AI: Depleting rapidly due to weekend trending. Estimated stock outage in 3 days.
              </div>
            </div>
          ))}
          {lowsAndOuts.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs font-semibold">
              ✨ All products fully stocked! No restock alerts active.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========================================== */
/*          SUB-MODULE 7: APPOINTMENTS        */
/* ========================================== */
interface ModuleAppointmentsProps {
  globalSearch: string;
}
const ModuleAppointments: React.FC<ModuleAppointmentsProps> = ({ globalSearch }) => {
  const { businessData, addManualAppointment } = useBusiness();
  const [isAddAptOpen, setIsAddAptOpen] = useState(false);
  const [aptCustName, setAptCustName] = useState("");
  const [aptService, setAptService] = useState("");
  const [aptDate, setAptDate] = useState("");
  const [aptTime, setAptTime] = useState("");
  const [aptPrice, setAptPrice] = useState("");

  const filteredAppointments = businessData.appointments.filter(a => 
    a.customer_name.toLowerCase().includes(globalSearch.toLowerCase()) ||
    a.service_name.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const handleAptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aptCustName || !aptService || !aptDate || !aptTime || !aptPrice) return;

    addManualAppointment({
      customer_name: aptCustName,
      service_name: aptService,
      date: aptDate,
      time: aptTime,
      price: Number(aptPrice)
    });

    setIsAddAptOpen(false);
    setAptCustName("");
    setAptService("");
    setAptDate("");
    setAptTime("");
    setAptPrice("");
  };

  return (
    <div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-sm overflow-hidden flex flex-col font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold text-brand-dark">Consultation & Appointment Calendar</h3>
          <p className="text-[10px] text-slate-400">Track beauty sessions or custom client sizing meetings</p>
        </div>

        <button 
          onClick={() => setIsAddAptOpen(true)}
          className="gradient-btn text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-1.5 hover:scale-[1.02] active:scale-98 transition-transform"
        >
          <Calendar className="w-4 h-4" />
          <span>Book Time Slot</span>
        </button>
      </div>

      {/* Appointment table list */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold">
              <th className="py-3 px-2">Apt ID</th>
              <th className="py-3 px-2">Customer Client</th>
              <th className="py-3 px-2">Service Package</th>
              <th className="py-3 px-2">Schedule Date</th>
              <th className="py-3 px-2">Scheduled Time</th>
              <th className="py-3 px-2 text-right">Fee Rate</th>
              <th className="py-3 px-2 text-center">Fulfillment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredAppointments.slice(0, 15).map((apt) => (
              <tr key={apt.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-2 font-bold text-slate-500">{apt.id}</td>
                <td className="py-3.5 px-2 font-bold text-slate-800">{apt.customer_name}</td>
                <td className="py-3.5 px-2 text-slate-600 font-semibold">{apt.service_name}</td>
                <td className="py-3.5 px-2 text-slate-400 font-medium">{apt.date}</td>
                <td className="py-3.5 px-2 text-brand-primary font-bold">{apt.time}</td>
                <td className="py-3.5 px-2 text-right font-bold text-slate-800">₹{apt.price}</td>
                <td className="py-3.5 px-2 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    apt.status === 'Upcoming' ? 'bg-indigo-50 text-indigo-700' :
                    apt.status === 'Cancelled' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Appointment Modal overlay */}
      {isAddAptOpen && (
        <div className="fixed inset-0 z-50 bg-brand-dark/40 backdrop-blur-xs flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-pink-100 relative"
          >
            <button className="absolute top-4 right-4 p-1 text-slate-400" onClick={() => setIsAddAptOpen(false)}>
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-brand-dark mb-4">Book Appointment Slot</h3>
            
            <form onSubmit={handleAptSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Name</label>
                <input 
                  type="text" 
                  value={aptCustName}
                  onChange={(e) => setAptCustName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                  placeholder="e.g. Masaba Gupta" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Service Requested</label>
                <input 
                  type="text" 
                  value={aptService}
                  onChange={(e) => setAptService(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                  placeholder="e.g. Bridal Wear Consultation" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
                  <input 
                    type="text" 
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                    placeholder="e.g. 11:30 AM"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Consultation Fee (₹)</label>
                <input 
                  type="number" 
                  value={aptPrice}
                  onChange={(e) => setAptPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                  placeholder="e.g. 500" 
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full gradient-btn font-bold py-3.5 rounded-xl text-xs shadow-md mt-6"
              >
                Schedule Appointment Slot
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

/* ========================================== */
/*            SUB-MODULE 8: INVOICES          */
/* ========================================== */
interface ModuleInvoicesProps {
  globalSearch: string;
}
const ModuleInvoices: React.FC<ModuleInvoicesProps> = ({ globalSearch }) => {
  const { businessData } = useBusiness();
  const [selectedOrd, setSelectedOrd] = useState<UIOrder | null>(null);

  const filteredInvoices = businessData.orders.filter(o => 
    o.customer_name.toLowerCase().includes(globalSearch.toLowerCase()) ||
    o.invoice_no.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const activeInvoice = selectedOrd || filteredInvoices[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
      {/* Invoice list panel */}
      <div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-sm overflow-hidden flex flex-col">
        <h3 className="text-sm font-bold text-brand-dark mb-4">Invoice Billing Registry</h3>
        
        <div className="overflow-y-auto space-y-2.5 max-h-[60vh]">
          {filteredInvoices.slice(0, 15).map((ord) => (
            <div 
              key={ord.id}
              onClick={() => setSelectedOrd(ord)}
              className={`p-3.5 border rounded-2xl cursor-pointer flex justify-between items-center transition-colors ${
                activeInvoice?.id === ord.id ? 'bg-pink-50/20 border-brand-accent' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">{ord.invoice_no}</span>
                <span className="text-xs font-bold text-slate-800 block mt-0.5">{ord.customer_name}</span>
                <span className="text-[9px] text-brand-secondary font-semibold block mt-0.5 max-w-[140px] truncate">
                  {ord.products?.map(p => `${p.name} (x${p.quantity})`).join(', ') || 'General Catalog Item'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-700">₹{ord.total}</span>
                <span className={`block text-[9px] font-semibold mt-0.5 ${
                  ord.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {ord.payment_method} • {ord.status === 'Completed' ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice view panel */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-pink-100 p-8 shadow-sm flex flex-col justify-between">
        {activeInvoice ? (
          <div className="space-y-6">
            {/* Header branding */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-bold text-brand-dark">{businessData.businessName}</h2>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-relaxed">{businessData.address}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Phone: {businessData.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-brand-secondary block uppercase">INVOICE</span>
                <span className="text-[10px] font-mono text-slate-400 block">{activeInvoice.invoice_no}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Date: {activeInvoice.date}</span>
              </div>
            </div>

            {/* Bill to block */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Bill To:</span>
                <h4 className="font-bold text-slate-800 mt-1">{activeInvoice.customer_name}</h4>
                <p className="text-slate-500 leading-normal mt-0.5">Customer phone synced via transactions.</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Payment Status:</span>
                <h4 className={`font-bold mt-1 uppercase ${
                  activeInvoice.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {activeInvoice.status === 'Completed' ? 'PAID / SUCCESS' : 'UNPAID / INCOMPLETE'}
                </h4>
                <p className="text-slate-400 leading-normal mt-0.5">
                  {activeInvoice.status === 'Completed' ? `Settled via ${activeInvoice.payment_method}` : `Pending settlement via ${activeInvoice.payment_method}`}
                </p>
              </div>
            </div>

            {/* Product table */}
            <div className="border-t border-slate-100 pt-4">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-100 pb-2">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Rate</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {activeInvoice.products?.map((p: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-50">
                      <td className="py-3 font-bold text-slate-800">{p.name}</td>
                      <td className="py-3 text-center text-slate-500">{p.quantity}</td>
                      <td className="py-3 text-right text-slate-500">₹{p.price}</td>
                      <td className="py-3 text-right font-bold text-slate-800">₹{p.price * p.quantity}</td>
                    </tr>
                  ))}
                  {(!activeInvoice.products || activeInvoice.products.length === 0) && (
                    <tr className="border-b border-slate-50">
                      <td className="py-3 font-bold text-slate-800">Order item purchase description</td>
                      <td className="py-3 text-center text-slate-500">1</td>
                      <td className="py-3 text-right text-slate-500">₹{activeInvoice.total}</td>
                      <td className="py-3 text-right font-bold text-slate-800">₹{activeInvoice.total}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculation summary block */}
            <div className="flex justify-end pt-4">
              <div className="w-64 text-xs space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>₹{activeInvoice.total}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST Taxes (5% rate):</span>
                  <span>₹{Math.floor(activeInvoice.total * 0.05)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-sm text-slate-800">
                  <span>Total Amount Paid:</span>
                  <span>₹{activeInvoice.total}</span>
                </div>
              </div>
            </div>

            {/* Actions panel */}
            <div className="border-t border-slate-100 pt-6 flex justify-end space-x-3 text-xs font-bold">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button 
                onClick={() => {
                  const blob = new Blob([`Invoice ${activeInvoice.invoice_no}\nCustomer: ${activeInvoice.customer_name}\nAmount: ₹${activeInvoice.total}`], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${activeInvoice.invoice_no}.txt`;
                  a.click();
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Details</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <FileText className="w-10 h-10 mb-2" />
            <span className="text-xs font-semibold">Select an invoice to review details</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================== */
/*            SUB-MODULE 9: PAYMENTS          */
/* ========================================== */
interface ModulePaymentsProps {
  globalSearch: string;
}
const ModulePayments: React.FC<ModulePaymentsProps> = ({ globalSearch }) => {
  const { businessData } = useBusiness();
  const [upiAmount, setUpiAmount] = useState("");
  const [customQr, setCustomQr] = useState<string | null>(null);

  const filteredPayments = businessData.payments.filter(p => 
    p.txn_id.toLowerCase().includes(globalSearch.toLowerCase()) ||
    p.customer_name.toLowerCase().includes(globalSearch.toLowerCase())
  );

  const handleGenerateQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upiAmount || Number(upiAmount) <= 0) return;
    setCustomQr(`upi://pay?pa=${businessData.upiId}&pn=${encodeURIComponent(businessData.businessName)}&am=${upiAmount}&cu=INR`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
      {/* Transaction Logs list */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-pink-100 p-6 shadow-sm overflow-hidden flex flex-col">
        <h3 className="text-sm font-bold text-brand-dark mb-4">UPI Settlement Transactions</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="py-3 px-2">Txn ID</th>
                <th className="py-3 px-2">Order ID</th>
                <th className="py-3 px-2">Payer Customer</th>
                <th className="py-3 px-2">Items Purchased</th>
                <th className="py-3 px-2">Settlement Date</th>
                <th className="py-3 px-2">Method</th>
                <th className="py-3 px-2 text-right">Settled Amount</th>
                <th className="py-3 px-2 text-center">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.slice(0, 15).map((pay) => {
                const relatedOrder = businessData.orders.find(o => o.id === pay.order_id);
                return (
                  <tr key={pay.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-2 font-mono text-[10px] text-slate-400 font-bold">{pay.txn_id}</td>
                    <td className="py-3.5 px-2 font-bold text-brand-primary">{pay.order_id || 'Direct Pay'}</td>
                    <td className="py-3.5 px-2 font-bold text-slate-800">{pay.customer_name}</td>
                    <td className="py-3.5 px-2 font-medium text-brand-secondary font-semibold">
                      {relatedOrder?.products?.map(p => `${p.name} (x${p.quantity})`).join(', ') || 'Direct Pay Settlement'}
                    </td>
                    <td className="py-3.5 px-2 text-slate-400 font-medium">{pay.date}</td>
                    <td className="py-3.5 px-2 font-semibold text-slate-500">{pay.method}</td>
                    <td className="py-3.5 px-2 text-right font-black text-slate-800">₹{pay.amount}</td>
                    <td className="py-3.5 px-2 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        pay.status === 'Success' ? 'bg-emerald-50 text-emerald-700' :
                        pay.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic QR code generator panel */}
      <div className="bg-white rounded-3xl border border-pink-100 p-6 shadow-sm flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-brand-dark">Instant Checkout QR Code</h3>
            <p className="text-[10px] text-slate-400 mt-1">Generate a dynamic invoice QR for table-side, in-store, or WhatsApp checkouts</p>
          </div>

          <form onSubmit={handleGenerateQr} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Checkout Billing Amount (₹)</label>
              <input 
                type="number" 
                value={upiAmount}
                onChange={(e) => setUpiAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
                placeholder="e.g. 2450" 
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full gradient-btn font-bold py-3.5 rounded-xl text-xs shadow-md"
            >
              Generate UPI QR
            </button>
          </form>

          {customQr ? (
            <div className="border border-slate-100 p-5 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50">
              <div className="w-32 h-32 bg-white border border-slate-200 rounded-2xl p-2.5 flex items-center justify-center">
                <div className="w-full h-full bg-slate-100 rounded-lg flex flex-col items-center justify-center text-[7px] font-black text-slate-400">
                  <ShieldCheck className="w-6 h-6 text-brand-primary mb-1" />
                  <span>PAY ₹{upiAmount}</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-3 block">UPI ID: {businessData.upiId}</span>
            </div>
          ) : (
            <div className="border border-dashed border-slate-100 p-8 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs text-center">
              <ShieldCheck className="w-8 h-8 mb-2" />
              <span>Input billing amount above to construct dynamic QR code</span>
            </div>
          )}
        </div>

        <div className="bg-pink-50/50 border border-pink-100/50 rounded-2xl p-4 text-[10px] text-brand-secondary leading-normal mt-6 flex items-start space-x-2">
          <Info className="w-4 h-4 text-brand-secondary flex-shrink-0 mt-0.5" />
          <span>Real-time payment triggers are hooked into dynamic webhooks, completing invoices instantly.</span>
        </div>
      </div>
    </div>
  );
};

/* ========================================== */
/*           SUB-MODULE 10: ANALYTICS         */
/* ========================================== */
const ModuleAnalytics: React.FC<{ stats: any }> = ({ stats }) => {
  const COLORS = ['#8B5CF6', '#EC4899', '#F472B6', '#1E1B4B'];

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-white p-6 rounded-3xl border border-pink-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-brand-dark">Business Intelligence Analytics</h3>
          <p className="text-[10px] text-slate-400">Charts visualizing growth metrics and peak demand timelines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-pink-100 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 mb-6">Semi-Annual Revenue Growth</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#FCE7F3" vertical={false} />
                <XAxis dataKey="name" stroke="#EC4899" fontSize={9} />
                <YAxis stroke="#EC4899" fontSize={9} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#EC4899" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-700 mb-6">Revenue Share by Category</h3>
          
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryDistribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-[9px] font-bold text-slate-500 mt-4">
            {stats.categoryDistribution.map((entry: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span>{entry.name}</span>
                </span>
                <span>₹{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================== */
/*           SUB-MODULE 11: SETTINGS          */
/* ========================================== */
const ModuleSettings: React.FC = () => {
  const { showToast, activeBusiness, setActiveBusiness, activeUser, setActiveUser } = useBusiness();

  const [businessName, setBusinessName] = useState(activeBusiness?.name || "");
  const [ownerName, setOwnerName] = useState(activeUser?.name || "");
  const [upi, setUpi] = useState(activeBusiness?.upi_id || "");
  const [phone, setPhone] = useState(activeBusiness?.phone || "");
  const [workingHrs, setWorkingHrs] = useState(activeBusiness?.working_hours || "");
  const [address, setAddress] = useState(activeBusiness?.address || "");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusiness) return;

    try {
      if (activeUser) {
        const updatedUser = await dbService.updateUser({
          ...activeUser,
          name: ownerName
        });
        setActiveUser(updatedUser);
        localStorage.setItem('avenza_active_user', JSON.stringify(updatedUser));
      }

      const updated = await dbService.updateBusiness({
        ...activeBusiness,
        name: businessName,
        upi_id: upi,
        phone: phone,
        working_hours: workingHrs,
        address: address
      });

      setActiveBusiness(updated);

      showToast("Workspace configuration saved permanently!", "success");
    } catch (err: any) {
      showToast("Failed to save configuration settings", "warning");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-pink-100 p-8 shadow-sm max-w-3xl mx-auto font-sans">
      <h3 className="text-sm font-bold text-brand-dark mb-6">Business Settings Panel</h3>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Business Name</label>
            <input 
              type="text" 
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none font-semibold text-brand-dark" 
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Business Owner Name</label>
            <input 
              type="text" 
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none font-semibold text-brand-dark" 
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">WhatsApp API Sync Key</label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none font-mono" 
              placeholder="wa_live_api_key_••••••••••••" 
              disabled
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">WhatsApp Auto-Reply Trigger</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:border-brand-primary outline-none">
              <option value="active">Active (Replies 24/7 autonomously)</option>
              <option value="away">Only during away hours</option>
              <option value="off">Deactivated (Manual chat only)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Checkout UPI Address</label>
            <input 
              type="text" 
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none font-semibold text-brand-secondary" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Support Helpline Contact</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Working Hours</label>
            <input 
              type="text" 
              value={workingHrs}
              onChange={(e) => setWorkingHrs(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Physical Store Address</label>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-primary outline-none" 
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex justify-end">
          <button 
            type="submit"
            className="gradient-btn text-xs font-bold px-6 py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-98 transition-transform"
          >
            Save Workspace Settings
          </button>
        </div>
      </form>
    </div>
  );
};
