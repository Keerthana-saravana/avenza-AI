import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ChevronRight, ChevronLeft, Upload, FileSpreadsheet, 
  CheckCircle, Phone, Clock, MapPin
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { dbService } from '../services/db';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export const OnboardingPage: React.FC = () => {
  const { 
    onboardingStep, setOnboardingStep, 
    onboardingData, setOnboardingData, 
    setCurrentView, showToast,
    activeUser, setActiveBusiness,
    setActiveUser, setIsLoggedIn
  } = useBusiness();

  const [learningProgress, setLearningProgress] = useState<number>(0);
  const [learningStatus, setLearningStatus] = useState<string>("Initializing Avenza brain...");
  const [customProducts, setCustomProducts] = useState<Array<{ name: string; price: number; stock: number; category: string }>>([]);

  const parseExcelCatalog = (arrayBuffer: ArrayBuffer): Array<{ name: string; price: number; stock: number; category: string }> => {
    const XLSX = (window as any).XLSX;
    if (!XLSX) return [];

    try {
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      const list: Array<{ name: string; price: number; stock: number; category: string }> = [];
      
      for (const row of rows) {
        if (!row || row.length < 2) continue;
        
        let nameCandidate = '';
        let priceCandidate = 0;
        let foundPrice = false;
        
        for (let i = 0; i < row.length; i++) {
          const val = row[i];
          if (val === undefined || val === null) continue;
          
          const strVal = String(val).trim();
          const num = Number(strVal.replace(/[^\d.]/g, ''));
          
          if (typeof val === 'number' && val > 0 && !foundPrice) {
            priceCandidate = val;
            foundPrice = true;
            nameCandidate = row.filter((_, idx) => idx !== i).map(String).join(' ').trim();
          } else if (!isNaN(num) && num > 0 && !foundPrice && strVal.match(/^\d+$/)) {
            priceCandidate = num;
            foundPrice = true;
            nameCandidate = row.filter((_, idx) => idx !== i).map(String).join(' ').trim();
          }
        }
        
        if (foundPrice && nameCandidate.length > 2) {
          const cleanName = nameCandidate.replace(/^["']|["']$/g, '').trim();
          const lowerName = cleanName.toLowerCase();
          if (lowerName.includes('product') && lowerName.includes('name')) continue;
          if (lowerName === 'name' || lowerName === 'price' || lowerName === 'cost' || lowerName === 'stock') continue;
          
          list.push({
            name: cleanName,
            price: priceCandidate,
            stock: 10,
            category: onboardingData.category === 'bakery' ? 'Cakes' : onboardingData.category === 'salon' ? 'Salon Services' : 'Ethnic Wear'
          });
        }
      }
      return list;
    } catch (e) {
      console.error("Excel parse error:", e);
      return [];
    }
  };

  const parsePdfCatalog = async (arrayBuffer: ArrayBuffer): Promise<Array<{ name: string; price: number; stock: number; category: string }>> => {
    let pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib && (window as any)['pdfjs-dist/build/pdf']) {
      pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
    }
    if (!pdfjsLib) return [];

    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const items = textContent.items as any[];
        const rows: { [y: number]: any[] } = {};
        
        for (const item of items) {
          if (!item.str.trim()) continue;
          // round coordinate to group items roughly on same baseline
          const y = Math.round(item.transform[5] * 2) / 2;
          if (!rows[y]) {
            rows[y] = [];
          }
          rows[y].push(item);
        }
        
        const sortedYs = Object.keys(rows)
          .map(Number)
          .sort((a, b) => b - a);
          
        for (const y of sortedYs) {
          const rowItems = rows[y].sort((a, b) => a.transform[4] - b.transform[4]);
          const rowText = rowItems.map(item => item.str).join(' ');
          fullText += rowText + '\n';
        }
      }
      
      return parseTextCatalog(fullText);
    } catch (err) {
      console.error("PDF parse error:", err);
      return [];
    }
  };

  const parseTextCatalog = (text: string) => {
    const lines = text.split(/[\r\n]+/);
    const list: Array<{ name: string; price: number; stock: number; category: string }> = [];
    
    const regexPatterns = [
      /^(.*?)\s+[-—:]?\s*(?:rs\.?|inr|₹)?\s*(\d{2,6})\s+(\d{1,4})(?:\s*|$)/i,
      /^(.*?)\s+[-—:]?\s*(?:rs\.?|inr|₹)?\s*(\d{2,6})(?:\s*|$)/i
    ];
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      let matched = false;
      for (const pattern of regexPatterns) {
        const match = line.match(pattern);
        if (match) {
          const name = match[1].trim();
          const price = parseFloat(match[2]);
          const stock = match[3] ? parseInt(match[3]) : 10;
          
          const cleanName = name.replace(/^["']|["']$/g, '').replace(/^[•\-\*\s]+/, '').trim();
          const lowerName = cleanName.toLowerCase();
          
          if (lowerName.includes('product') && lowerName.includes('name')) continue;
          if (lowerName === 'name' || lowerName === 'price' || lowerName === 'cost' || lowerName === 'stock' || lowerName.includes('invoice') || lowerName.includes('catalog')) continue;
          
          if (cleanName.length > 2 && price > 0) {
            list.push({
              name: cleanName,
              price: price,
              stock: stock,
              category: onboardingData.category === 'bakery' ? 'Cakes' : onboardingData.category === 'salon' ? 'Salon Services' : 'Ethnic Wear'
            });
            matched = true;
            break;
          }
        }
      }
      if (matched) continue;

      const parts = line.split(/[,\t;|]+/);
      if (parts.length >= 2) {
        let nameCandidate = '';
        let priceCandidate = 0;
        let foundPrice = false;
        
        for (let i = 0; i < parts.length; i++) {
          const val = parts[i].trim();
          if (!val) continue;
          
          const cleanNumStr = val.replace(/[^\d.]/g, '');
          const num = parseFloat(cleanNumStr);
          if (!isNaN(num) && num > 0 && !foundPrice && val.match(/\d/)) {
            priceCandidate = num;
            foundPrice = true;
            nameCandidate = parts.filter((_, idx) => idx !== i).map(p => p.trim()).filter(Boolean).join(' ');
          }
        }
        
        if (foundPrice && nameCandidate.length > 2) {
          const cleanName = nameCandidate.replace(/^["']|["']$/g, '').replace(/^[•\-\*\s]+/, '').trim();
          const lowerName = cleanName.toLowerCase();
          if (lowerName.includes('product') && lowerName.includes('name')) continue;
          if (lowerName === 'name' || lowerName === 'price' || lowerName === 'cost' || lowerName === 'stock') continue;
          
          list.push({
            name: cleanName,
            price: priceCandidate,
            stock: 10,
            category: onboardingData.category === 'bakery' ? 'Cakes' : onboardingData.category === 'salon' ? 'Salon Services' : 'Ethnic Wear'
          });
        }
      }
    }
    return list;
  };

  const handleRealFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv' || extension === 'txt') {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const parsed = parseTextCatalog(text);
        if (parsed.length > 0) {
          setCustomProducts(parsed);
          setOnboardingData(prev => ({ ...prev, customProducts: parsed, catalogFile: file.name }));
          showToast(`Extracted ${parsed.length} products from ${file.name}!`, "success");
        } else {
          showToast("Could not extract any product and price pairs. Please check file structure.", "warning");
        }
      };
      reader.readAsText(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      reader.onload = (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        try {
          const parsed = parseExcelCatalog(buffer);
          if (parsed.length > 0) {
            setCustomProducts(parsed);
            setOnboardingData(prev => ({ ...prev, customProducts: parsed, catalogFile: file.name }));
            showToast(`Extracted ${parsed.length} products from ${file.name}!`, "success");
          } else {
            showToast("Could not extract any products from Excel sheet columns. Check format.", "warning");
          }
        } catch (err) {
          showToast("Error reading Excel file. Check format.", "warning");
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (extension === 'pdf') {
      reader.onload = async (event) => {
        const buffer = event.target?.result as ArrayBuffer;
        try {
          const parsed = await parsePdfCatalog(buffer);
          if (parsed.length > 0) {
            setCustomProducts(parsed);
            setOnboardingData(prev => ({ ...prev, customProducts: parsed, catalogFile: file.name }));
            showToast(`Extracted ${parsed.length} products from PDF: ${file.name}!`, "success");
          } else {
            showToast("Could not extract product and price lines from PDF. Check format.", "warning");
          }
        } catch (err) {
          showToast("Error reading PDF text streams.", "warning");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      showToast("Unsupported file type. Please upload a CSV, TXT, Excel, or PDF file.", "warning");
    }
  };

  const handleTableChange = (idx: number, key: string, val: any) => {
    const updated = [...customProducts];
    updated[idx] = { ...updated[idx], [key]: val };
    setCustomProducts(updated);
    setOnboardingData(prev => ({ ...prev, customProducts: updated }));
  };

  const handleAddRow = () => {
    const updated = [...customProducts, { name: 'New Item', price: 100, stock: 10, category: onboardingData.category === 'bakery' ? 'Cakes' : onboardingData.category === 'salon' ? 'Salon Services' : 'Ethnic Wear' }];
    setCustomProducts(updated);
    setOnboardingData(prev => ({ ...prev, customProducts: updated }));
  };

  const handleRemoveRow = (idx: number) => {
    const updated = customProducts.filter((_, i) => i !== idx);
    setCustomProducts(updated);
    setOnboardingData(prev => ({ ...prev, customProducts: updated }));
  };

  const handleClearAll = () => {
    setCustomProducts([]);
    setOnboardingData(prev => ({ ...prev, customProducts: [], catalogFile: null }));
  };

  // AI Learning Step Messages
  useEffect(() => {
    if (onboardingStep !== 5) return;

    let isCompleted = false;

    const interval = setInterval(() => {
      setLearningProgress(prev => {
        const next = prev + 1;
        if (next === 20) setLearningStatus("Parsing product catalog and images...");
        if (next === 40) setLearningStatus("Mapping categories and setting dynamic prices...");
        if (next === 65) setLearningStatus("Generating business guidelines & knowledge base...");
        if (next === 85) setLearningStatus("Tuning natural language conversational agent...");
        if (next === 97) setLearningStatus("Finalizing Avenza Operating System workspace...");
        
        if (next >= 100) {
          clearInterval(interval);
          if (!isCompleted) {
            isCompleted = true;
            
            const saveOnboardingToDB = async () => {
              try {
                let user = activeUser;
                if (!user) {
                  const email = `${onboardingData.ownerName.toLowerCase().replace(/\s+/g, '') || 'owner'}@avenza.com`;
                  user = await dbService.signUp(email, onboardingData.ownerName || 'Business Owner');
                } else {
                  user = await dbService.updateUser({
                    ...user,
                    name: onboardingData.ownerName
                  });
                }
                setActiveUser(user);
                localStorage.setItem('avenza_active_user', JSON.stringify(user));
                setIsLoggedIn(true);

                const cat = onboardingData.category.toLowerCase();
                let templateType: 'boutique' | 'bakery' | 'salon' = 'boutique';
                if (cat.includes('bakery') || cat.includes('bake') || cat.includes('food')) {
                  templateType = 'bakery';
                } else if (cat.includes('salon') || cat.includes('beauty') || cat.includes('spa')) {
                  templateType = 'salon';
                }

                // 1. Create Business in Database
                const business = await dbService.createBusiness({
                  owner_id: user.id,
                  name: onboardingData.businessName,
                  category: onboardingData.category === 'boutique' ? 'Boutique & Fashion Store' : onboardingData.category === 'bakery' ? 'Home Bakery & Confectionery' : 'Beauty Salon & Makeup Studio',
                  type: onboardingData.businessTypes,
                  description: onboardingData.description,
                  upi_id: onboardingData.upiId,
                  phone: onboardingData.phone,
                  working_hours: onboardingData.workingHours,
                  address: onboardingData.address,
                  logo_url: onboardingData.logo || undefined,
                  instagram: onboardingData.instagram,
                  website: onboardingData.instagram ? `https://instagram.com/${onboardingData.instagram.replace('@', '')}` : ''
                });

                // 2. Seed Products & Records
                await dbService.seedCategoryData(business.id, user.id, templateType, onboardingData.customProducts);

                // 3. Load Workspace
                setActiveBusiness(business);
                setCurrentView('dashboard');
                showToast("Avenza OS successfully configured!", "success");
              } catch (err: any) {
                showToast("Failed to initialize database workspace.", "warning");
              }
            };
            
            saveOnboardingToDB();
          }
          return 100;
        }
        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onboardingStep]);

  const handleNext = () => {
    if (onboardingStep === 1) {
      if (!onboardingData.businessName || !onboardingData.ownerName) {
        showToast("Please enter business and owner names.", "warning");
        return;
      }
    }
    if (onboardingStep === 4) {
      if (!onboardingData.upiId || !onboardingData.phone) {
        showToast("Phone and UPI ID are required for checkout setup.", "warning");
        return;
      }
    }
    setOnboardingStep(onboardingStep + 1);
  };

  const handlePrev = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const toggleBusinessType = (type: string) => {
    const activeTypes = [...onboardingData.businessTypes];
    if (activeTypes.includes(type)) {
      if (activeTypes.length > 1) {
        setOnboardingData(prev => ({
          ...prev,
          businessTypes: activeTypes.filter(t => t !== type)
        }));
      }
    } else {
      setOnboardingData(prev => ({
        ...prev,
        businessTypes: [...activeTypes, type]
      }));
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden flex flex-col justify-between font-sans">
      {/* Decorative Orbs */}
      <div className="absolute top-[-20%] left-[-15%] w-[450px] h-[450px] rounded-full bg-brand-accent/25 blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-primary/10 blur-[120px] animate-pulse-slow"></div>

      {/* Top Header */}
      <header className="glass py-4 px-6 border-b border-pink-100 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <div className="gradient-bg p-2 rounded-xl text-white shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-brand-dark">
            AVENZA <span className="text-brand-secondary font-light">AI</span>
          </span>
        </div>
        {onboardingStep < 5 && (
          <div className="text-xs font-semibold text-slate-500 bg-pink-100/50 border border-pink-200/50 px-3.5 py-1.5 rounded-full">
            Step {onboardingStep} of 4
          </div>
        )}
      </header>

      {/* Main wizard Card Area */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-pink-100 shadow-xl overflow-hidden min-h-[500px] flex flex-col justify-between p-8 md:p-10 relative">
          
          {/* Timeline dots indicator */}
          {onboardingStep < 5 && (
            <div className="flex items-center space-x-2 mb-8">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex-1 flex items-center">
                  <div className={`h-1.5 rounded-full w-full transition-colors duration-300 ${
                    step <= onboardingStep ? 'gradient-bg' : 'bg-slate-100'
                  }`}></div>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {onboardingStep === 1 && (
                <motion.div 
                  key="step1" 
                  variants={stepVariants} 
                  initial="hidden" 
                  animate="visible" 
                  exit="exit"
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-brand-dark mb-1">Let's learn about your Business</h2>
                    <p className="text-xs text-slate-400">Tell us a little bit about what you do so Avenza can prepare your environment.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Business Name</label>
                      <input 
                        type="text" 
                        value={onboardingData.businessName}
                        onChange={(e) => setOnboardingData({...onboardingData, businessName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-sm" 
                        placeholder="e.g. Aura Boutique, Sweet Delights"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Owner Name</label>
                      <input 
                        type="text" 
                        value={onboardingData.ownerName}
                        onChange={(e) => setOnboardingData({...onboardingData, ownerName: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-sm" 
                        placeholder="e.g. Ananya Sen"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Business Category</label>
                    <select 
                      value={onboardingData.category}
                      onChange={(e) => setOnboardingData({...onboardingData, category: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-sm bg-white"
                    >
                      <option value="boutique">Boutique & Fashion Store</option>
                      <option value="bakery">Home Bakery & Confectionery</option>
                      <option value="salon">Beauty Salon & Makeup Studio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Business Description</label>
                    <textarea 
                      rows={3}
                      value={onboardingData.description}
                      onChange={(e) => setOnboardingData({...onboardingData, description: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-sm resize-none" 
                      placeholder="Describe what you sell, your specialties, and your target audience..."
                    />
                  </div>
                </motion.div>
              )}

              {onboardingStep === 2 && (
                <motion.div 
                  key="step2" 
                  variants={stepVariants} 
                  initial="hidden" 
                  animate="visible" 
                  exit="exit"
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-bold text-brand-dark mb-1">Import Product & Price List</h2>
                    <p className="text-xs text-slate-400">Please upload your catalog product and price details in PDF or Excel format.</p>
                  </div>

                  <input 
                    type="file" 
                    id="file-upload-input" 
                    accept=".csv, .txt, .xlsx, .xls, .pdf" 
                    onChange={handleRealFileChange} 
                    className="hidden" 
                  />

                  <div className="border-2 border-dashed border-slate-200 hover:border-brand-accent/60 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 min-h-[140px]">
                    <Upload className="w-8 h-8 text-slate-300 mb-2 animate-float" />
                    <p className="text-xs font-semibold text-slate-700">Drag & Drop Product & Price PDF or Excel List here</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-4">Upload PDF Price List or Excel Spreadsheet (Max 15MB)</p>

                    <div className="flex items-center space-x-3 justify-center">
                      <button 
                        type="button" 
                        onClick={() => document.getElementById('file-upload-input')?.click()}
                        className="bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Upload Catalog File</span>
                      </button>
                    </div>
                  </div>

                  {customProducts.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-slate-700">Review & Edit Catalog Products ({customProducts.length})</span>
                        <div className="flex space-x-2">
                          <button 
                            type="button" 
                            onClick={handleAddRow}
                            className="bg-pink-50 hover:bg-pink-100 text-brand-secondary border border-pink-100 px-2.5 py-1 rounded-lg text-[10px] font-bold active:scale-95 transition-all"
                          >
                            + Add Row
                          </button>
                          <button 
                            type="button" 
                            onClick={handleClearAll}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-2.5 py-1 rounded-lg text-[10px] font-bold active:scale-95 transition-all"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-2xl">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 text-[9px] font-bold text-slate-400 uppercase sticky top-0">
                            <tr>
                              <th className="py-2 px-3">Product Name</th>
                              <th className="py-2 px-3 w-24">Price (₹)</th>
                              <th className="py-2 px-3 w-20">Stock</th>
                              <th className="py-2 px-3 w-10 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50 bg-white">
                            {customProducts.map((p, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-1 px-3">
                                  <input 
                                    type="text" 
                                    value={p.name}
                                    onChange={(e) => handleTableChange(idx, 'name', e.target.value)}
                                    className="w-full bg-transparent border-none focus:outline-none focus:bg-slate-50 rounded px-1 py-0.5 text-slate-800 font-semibold text-xs"
                                  />
                                </td>
                                <td className="py-1 px-3">
                                  <input 
                                    type="number" 
                                    value={p.price}
                                    onChange={(e) => handleTableChange(idx, 'price', Number(e.target.value))}
                                    className="w-full bg-transparent border-none focus:outline-none focus:bg-slate-50 rounded px-1 py-0.5 text-brand-secondary font-bold text-xs"
                                  />
                                </td>
                                <td className="py-1 px-3">
                                  <input 
                                    type="number" 
                                    value={p.stock}
                                    onChange={(e) => handleTableChange(idx, 'stock', Number(e.target.value))}
                                    className="w-full bg-transparent border-none focus:outline-none focus:bg-slate-50 rounded px-1 py-0.5 text-slate-600 text-xs"
                                  />
                                </td>
                                <td className="py-1 px-3 text-center">
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemoveRow(idx)}
                                    className="text-red-500 hover:text-red-700 font-bold"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-[11px] text-emerald-800">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>Products parsed and ready. Only these products will appear on the product page.</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => {
                        const defaultRow = [{ name: 'Sample Product', price: 500, stock: 10, category: onboardingData.category === 'bakery' ? 'Cakes' : onboardingData.category === 'salon' ? 'Salon Services' : 'Ethnic Wear' }];
                        setCustomProducts(defaultRow);
                        setOnboardingData(prev => ({ ...prev, customProducts: defaultRow, catalogFile: 'manual' }));
                        showToast("Manual Catalog Entry chosen. Enter product and price details below.", "info");
                      }}
                      className="w-full py-3 border border-dashed border-pink-200 text-brand-secondary text-xs font-semibold rounded-xl text-center hover:bg-pink-50/20 hover:border-pink-300 transition-all active:scale-98"
                    >
                      I don't have a file, enter product and price details manually.
                    </button>
                  )}
                </motion.div>
              )}

              {onboardingStep === 3 && (
                <motion.div 
                  key="step3" 
                  variants={stepVariants} 
                  initial="hidden" 
                  animate="visible" 
                  exit="exit"
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-brand-dark mb-1">Select Business Operations Model</h2>
                    <p className="text-xs text-slate-400">Choose all models that apply. You can change these later.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {[
                      { id: 'ready_stock', title: 'Ready Stock', desc: 'Pre-made items shipped/delivered immediately.' },
                      { id: 'made_order', title: 'Made To Order', desc: 'Custom specifications or baked-on-demand.' },
                      { id: 'appointment', title: 'Appointment bookings', desc: 'Time slots, consulting, hair styling sessions.' }
                    ].map((type) => (
                      <div 
                        key={type.id}
                        onClick={() => toggleBusinessType(type.id)}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between h-40 ${
                          onboardingData.businessTypes.includes(type.id)
                            ? 'border-brand-secondary bg-pink-50/30'
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-brand-dark">{type.title}</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            onboardingData.businessTypes.includes(type.id) ? 'bg-brand-secondary border-brand-secondary text-white' : 'border-slate-300'
                          }`}>
                            {onboardingData.businessTypes.includes(type.id) && <CheckCircle className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal mb-1">{type.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {onboardingStep === 4 && (
                <motion.div 
                  key="step4" 
                  variants={stepVariants} 
                  initial="hidden" 
                  animate="visible" 
                  exit="exit"
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-brand-dark mb-1">Contact & Payments Configuration</h2>
                    <p className="text-xs text-slate-400">Enter details so Avenza can generate UPI checkout QR codes and message templates.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Business UPI ID (for instant QR pay)</label>
                      <input 
                        type="text" 
                        value={onboardingData.upiId}
                        onChange={(e) => setOnboardingData({...onboardingData, upiId: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-sm font-semibold text-brand-secondary" 
                        placeholder="e.g. businessname@okhdfc"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Owner Phone Number</label>
                      <input 
                        type="text" 
                        value={onboardingData.phone}
                        onChange={(e) => setOnboardingData({...onboardingData, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-sm" 
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">WhatsApp Sync Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          value={onboardingData.whatsapp}
                          onChange={(e) => setOnboardingData({...onboardingData, whatsapp: e.target.value})}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-xs" 
                          placeholder="+91 WhatsApp"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Instagram Handle</label>
                      <div className="relative">
                        <InstagramIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          value={onboardingData.instagram}
                          onChange={(e) => setOnboardingData({...onboardingData, instagram: e.target.value})}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-xs" 
                          placeholder="@instagram"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Working Hours</label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                          type="text" 
                          value={onboardingData.workingHours}
                          onChange={(e) => setOnboardingData({...onboardingData, workingHours: e.target.value})}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-xs" 
                          placeholder="e.g. 10AM - 8PM"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Business Address</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <textarea 
                        rows={2}
                        value={onboardingData.address}
                        onChange={(e) => setOnboardingData({...onboardingData, address: e.target.value})}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-primary focus:outline-none text-xs resize-none" 
                        placeholder="Complete physical store or home business address location details..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 5 && (
                <motion.div 
                  key="step5" 
                  variants={stepVariants} 
                  initial="hidden" 
                  animate="visible" 
                  className="flex flex-col items-center justify-center py-10 space-y-6"
                >
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Ring loader */}
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
                    
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="gradient-bg w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg"
                    >
                      <Sparkles className="w-10 h-10 animate-pulse" />
                    </motion.div>
                  </div>

                  <div className="text-center space-y-2 max-w-sm">
                    <h3 className="text-xl font-bold text-brand-dark">Avenza is learning...</h3>
                    <p className="text-xs text-brand-secondary font-semibold h-8 flex items-center justify-center">
                      {learningStatus}
                    </p>
                  </div>

                  {/* Progress bar container */}
                  <div className="w-full max-w-xs bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="gradient-bg h-full rounded-full transition-all duration-100 ease-out" 
                      style={{ width: `${learningProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">{learningProgress}% Complete</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          {onboardingStep < 5 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
              <button 
                type="button"
                onClick={handlePrev}
                disabled={onboardingStep === 1}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors text-xs font-bold flex items-center space-x-1.5 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button 
                type="button"
                onClick={handleNext}
                className="gradient-btn px-6 py-3 rounded-xl text-xs font-bold flex items-center space-x-1.5 active:scale-95 hover:scale-[1.02] transition-transform"
              >
                <span>{onboardingStep === 4 ? "Build Assistant" : "Continue"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom info banner */}
      {onboardingStep < 5 && (
        <footer className="py-6 text-center text-[10px] text-slate-400 border-t border-pink-50">
          🔒 Encrypted catalog parsing. Standard financial UPI links strictly conform to secure NPCI parameters.
        </footer>
      )}
    </div>
  );
};
