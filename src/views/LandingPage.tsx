import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Play, CheckCircle2, ChevronDown, 
  MessageSquare, ShoppingBag, BarChart3, Calendar, FileText, 
  ShieldCheck, ArrowUpRight, Star
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setIsLoggedIn } = useBusiness();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-brand-secondary" />,
      title: "24/7 AI Sales Agent",
      desc: "Autonomously answers customer inquiries on WhatsApp & Instagram. Recommends products, checks stock, and coordinates booking schedules."
    },
    {
      icon: <ShoppingBag className="w-6 h-6 text-brand-primary" />,
      title: "Automated Catalog & Inventory",
      desc: "Keeps track of ready-stock and made-to-order items. Alerts you when ingredients or items run low, and auto-reserves stock on purchase."
    },
    {
      icon: <FileText className="w-6 h-6 text-brand-accent" />,
      title: "Instant Professional Invoices",
      desc: "Generates beautiful GST-compliant invoices in real-time. Instantly shares PDF receipts over chat without manual data entry."
    },
    {
      icon: <Calendar className="w-6 h-6 text-purple-500" />,
      title: "Smart Appointment Booker",
      desc: "Coordinates appointments, updates calendar availability, sends automatic reminders, and manages rescheduling requests."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-pink-500" />,
      title: "Deep Business Insights",
      desc: "Predicts future sales, highlights trending items, analyzes peak customer hours, and suggests raw material restock schedules."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-500" />,
      title: "Secure UPI Payments Hub",
      desc: "Creates automated dynamic QR codes linked directly to your UPI ID. Simulates instant payment verifications."
    }
  ];

  const stats = [
    { value: "4,500+", label: "Active Entrepreneurs" },
    { value: "35%+", label: "Average Revenue Growth" },
    { value: "1.2M+", label: "AI Chats Handled Monthly" },
    { value: "₹4.8 Cr+", label: "Sales Processed Successfully" }
  ];

  const testimonials = [
    {
      quote: "Avenza has been like hiring three employees at once. It manages all my saree bookings on WhatsApp while I focus on fabric sourcing.",
      author: "Pooja Hegde",
      role: "Founder, Aura Boutique",
      rating: 5,
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=pooja"
    },
    {
      quote: "My cake bakery order count doubled! The AI coordinates custom dates and collects payment instantly. Customers love the instant replies at midnight.",
      author: "Simran Kohli",
      role: "Owner, The Whisk Bakery",
      rating: 5,
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=simran"
    },
    {
      quote: "Booking bridal makeup appointments was a nightmare. Avenza organizes my daily calendar and handles down-payment QR invoices seamlessly.",
      author: "Meera Oberoi",
      role: "Creative Director, Glow & Grace Salon",
      rating: 5,
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=meera"
    }
  ];

  const faqs = [
    {
      q: "How does Avenza AI sync with my WhatsApp business account?",
      a: "Avenza connects securely to your official WhatsApp Business API or virtual assistants, letting the AI agent reply to customers, show products, and confirm billing directly inside the chat."
    },
    {
      q: "What types of businesses is Avenza best suited for?",
      a: "It is custom-built for clothing boutiques, home bakers, beauty salons, hand-made gift stores, consulting agencies, and freelance creators who handle customer inquiries and payments daily."
    },
    {
      q: "Do I need technical skills to upload my product catalog?",
      a: "Not at all. You can drag and drop a basic Excel spreadsheet, upload standard product images, or type them in manually. Avenza's AI reads your files, understands your pricing structure, and designs the catalog for you."
    },
    {
      q: "How do UPI payments work with the AI?",
      a: "Avenza generates dynamic UPI QR codes containing the exact checkout amount and links them directly to your business UPI ID (e.g., GPay, PhonePe). Funds are credited directly to your bank account."
    }
  ];

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden font-sans">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-accent/20 blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-brand-primary/10 blur-[120px] animate-pulse-slow"></div>

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-50 glass border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="gradient-bg p-2 rounded-xl text-white shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-brand-dark">
              AVENZA <span className="text-brand-secondary font-light">AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-brand-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-primary transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-brand-primary transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-brand-primary transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-brand-primary transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setCurrentView('login')}
              className="text-sm font-semibold text-slate-700 hover:text-brand-primary transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button 
              onClick={() => setCurrentView('onboarding')}
              className="gradient-btn text-sm font-semibold px-5 py-2.5 rounded-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-pink-100/50 border border-brand-accent/30 px-4 py-1.5 rounded-full text-xs font-semibold text-brand-secondary mb-6 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span>The Business Operating System for Women Entrepreneurs</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-brand-dark tracking-tight leading-none max-w-5xl mb-6"
        >
          Your AI Employee That <br />
          <span className="gradient-text">Runs Your Business</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-600 max-w-3xl mb-10 font-normal leading-relaxed"
        >
          Avenza manages customer chats, orders, inventory, invoices, appointments, and UPI payments 24/7 so you can focus on building your dream brand.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mb-16"
        >
          <button 
            onClick={() => setCurrentView('onboarding')}
            className="gradient-btn text-base font-bold px-8 py-4 rounded-2xl flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto justify-center"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => {
              setCurrentView('login');
              // Automatically bypass onboarding for quick review if needed or go straight to dashboard demo
            }}
            className="glass border border-brand-accent/20 bg-white/80 hover:bg-white text-brand-dark text-base font-bold px-8 py-4 rounded-2xl flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto justify-center"
          >
            <Play className="w-5 h-5 text-brand-secondary fill-brand-secondary" />
            <span>Launch Live Sandbox</span>
          </button>
        </motion.div>

        {/* Cinematic Dashboard Showcase Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-5xl rounded-3xl overflow-hidden glass border-4 border-white shadow-2xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-pink-50/40 via-transparent to-transparent pointer-events-none"></div>
          
          {/* Top Bar Decoration */}
          <div className="bg-white/80 px-6 py-4 flex items-center space-x-2 border-b border-pink-100">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="bg-pink-50/50 text-[11px] font-semibold text-brand-primary px-4 py-1 rounded-full mx-auto max-w-xs border border-pink-100">
              ⚡ Avenza OS Dashboard — Sandbox Environment
            </div>
          </div>

          {/* Screenshot Placeholder Image with stunning visual elements */}
          <div className="p-8 md:p-12 bg-white flex flex-col items-center justify-center relative min-h-[350px]">
            <div className="relative z-10 max-w-lg">
              <span className="text-xs uppercase tracking-widest text-brand-secondary font-bold">Checkout Automation Demo</span>
              <h3 className="text-2xl font-bold mt-2 text-brand-dark">Instant WhatsApp Orders</h3>
              <p className="text-slate-500 text-sm mt-2">
                Simulates real customer checkout flows. Scan the QR code, view generated invoice details, watch automated stocks count drop, and see CRM logs adjust automatically.
              </p>
              
              <div className="mt-8 flex items-center justify-center">
                <button 
                  onClick={() => {
                    setCurrentView('login');
                    setIsLoggedIn(true);
                  }}
                  className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-all font-bold px-6 py-3 rounded-xl inline-flex items-center space-x-2"
                >
                  <span>Interactive Sandbox Walkthrough</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Float visual graphics */}
            <div className="absolute top-6 left-6 w-32 h-32 rounded-full bg-pink-300/20 blur-xl"></div>
            <div className="absolute bottom-6 right-6 w-44 h-44 rounded-full bg-purple-300/20 blur-xl"></div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-pink-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <h3 className="text-3xl md:text-5xl font-extrabold text-brand-dark mb-1">{stat.value}</h3>
              <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-sm font-bold uppercase tracking-wider text-brand-secondary">Everything you need</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-dark mt-2 tracking-tight">
            Replace ten apps with <span className="gradient-text">one AI Employee</span>
          </h2>
          <p className="text-slate-600 mt-4 text-base md:text-lg">
            Stop switching between chat apps, spreadsheet registers, calendars, invoice tools, and banking. Avenza centralizes everything.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -6 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-pink-50 hover:shadow-md hover:border-brand-accent/25 transition-all duration-300"
            >
              <div className="bg-pink-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-3">{feat.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-pink-50/40 border-y border-pink-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-sm font-bold uppercase tracking-wider text-brand-primary">Setup in minutes</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mt-2">How Avenza Runs Your Shop</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Business Profile", text: "Name your business, select boutique, bakery, or salon, and write a small description." },
              { step: "2", title: "Upload Catalog", text: "Import products via Excel, images, or manual forms. The AI learns your prices instantly." },
              { step: "3", title: "Connect Workspace", text: "Setup your UPI ID for payments and specify operating business hours." },
              { step: "4", title: "Go Live", text: "Avenza automatically drafts customer responses, generates invoices, and details reports." }
            ].map((step, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-pink-100 relative">
                <div className="absolute top-4 right-4 text-4xl font-black text-brand-accent/20">{step.step}</div>
                <h4 className="text-lg font-bold text-brand-dark mb-2 pr-10">{step.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-bold uppercase tracking-wider text-brand-secondary">Success Stories</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mt-2">Loved by Female Founders</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-pink-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex space-x-1 mb-4">
                  {Array.from({ length: test.rating }).map((_, ri) => (
                    <Star key={ri} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic">"{test.quote}"</p>
              </div>
              <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-slate-100">
                <img src={test.avatar} alt={test.author} className="w-10 h-10 rounded-full bg-pink-50" />
                <div>
                  <h4 className="text-sm font-bold text-brand-dark">{test.author}</h4>
                  <p className="text-xs text-slate-500">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-pink-50/30 border-y border-pink-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-bold uppercase tracking-wider text-brand-primary">Simple pricing</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-dark mt-2">Ready to Scale Your Brand?</h2>
            <p className="text-slate-500 text-sm mt-2">Choose the plan that suits your stage. Try free for 14 days.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white p-8 rounded-3xl border border-pink-100 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-700">Starter</h4>
                <p className="text-xs text-slate-400 mt-1">Perfect for new home-run brands</p>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-brand-dark">₹0</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Up to 100 products</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>WhatsApp Manual Link</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Basic Invoice Generation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>1 user account</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => setCurrentView('onboarding')}
                className="mt-8 border border-brand-accent/25 hover:border-brand-primary/50 text-brand-primary hover:bg-pink-50/50 transition-all font-bold py-3 rounded-xl text-xs"
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-3xl border-2 border-brand-secondary shadow-lg relative flex flex-col justify-between">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-brand-secondary text-white text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
                Most Popular
              </div>
              <div>
                <h4 className="text-lg font-bold text-brand-secondary">Pro Growth</h4>
                <p className="text-xs text-slate-400 mt-1">Best for boutiques, bakers & salons</p>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-brand-dark">₹1,499</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="font-semibold text-slate-700">Unlimited Catalog items</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Automated WhatsApp Bot API</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Advanced Analytics & Charts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Multiple UPI IDs & QR checkout</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>SMS / WhatsApp Auto-Invoicing</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => setCurrentView('onboarding')}
                className="mt-8 gradient-bg text-white hover:opacity-90 transition-all font-bold py-3 rounded-xl text-xs shadow-md shadow-pink-500/20"
              >
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-3xl border border-pink-100 flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-700">Premium Scale</h4>
                <p className="text-xs text-slate-400 mt-1">For multi-location retail chains</p>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-extrabold text-brand-dark">₹4,999</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Multi-channel (Insta DM + Web)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Custom AI model trained on brand voice</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Dedicated account partner support</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={() => setCurrentView('onboarding')}
                className="mt-8 border border-brand-accent/25 hover:border-brand-primary/50 text-brand-primary hover:bg-pink-50/50 transition-all font-bold py-3 rounded-xl text-xs"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-sm font-bold uppercase tracking-wider text-brand-secondary">Got questions?</span>
          <h2 className="text-3xl font-extrabold text-brand-dark mt-2">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-pink-100 overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-semibold text-brand-dark hover:text-brand-primary transition-colors text-sm md:text-base"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-5 text-xs md:text-sm text-slate-500 border-t border-slate-50 pt-4 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-white py-12 px-6 border-t border-pink-900/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="gradient-bg p-2 rounded-xl text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              AVENZA <span className="text-brand-secondary font-light">AI</span>
            </span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-pink-200/80">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Support Helpline</a>
          </div>

          <p className="text-xs text-pink-200/60">
            &copy; 2026 Avenza AI Technologies. Crafted for visionary women founders.
          </p>
        </div>
      </footer>
    </div>
  );
};
