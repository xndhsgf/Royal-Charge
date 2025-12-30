
import React, { useState, useRef } from 'react';
import { Product, Category, AppConfig, Order, UserState, RechargeMethod, Banner, ThemeColors } from '../types';
import { 
  Save, Trash2, ArrowRight, Package, ShoppingCart, LayoutGrid, Settings, 
  Image as ImageIcon, CreditCard, Users, ShieldAlert, 
  DollarSign, Star, Palette, BarChart3, Wallet, Camera,
  Plus, X, RefreshCcw, Zap, TrendingUp, Info,
  Search, Edit3, CheckCircle, XCircle
} from 'lucide-react';

interface AdminViewProps {
  products: Product[];
  setProducts: (id: string | null, data: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  categories: Category[];
  addCategory: (data: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  rechargeMethods: RechargeMethod[];
  addRechargeMethod: (data: any) => Promise<void>;
  deleteRechargeMethod: (id: string) => Promise<void>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  allUsers: UserState[];
  updateAnyUser: (email: string, data: any) => Promise<void>;
  deleteAnyUser: (email: string) => Promise<void>;
  currentUser: UserState;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserState>>;
  appConfig: AppConfig;
  setAppConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  onBack: () => void;
  onUpdateOrder: (orderId: string, status: 'completed' | 'rejected', reply: string) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ 
  products, setProducts, deleteProduct, categories, addCategory, deleteCategory, 
  rechargeMethods, addRechargeMethod, deleteRechargeMethod, orders, setOrders, 
  allUsers, updateAnyUser, deleteAnyUser, currentUser, setCurrentUser, appConfig, setAppConfig, onBack, onUpdateOrder
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'deposits' | 'users' | 'products' | 'categories' | 'recharge' | 'settings'>('stats');
  const [replies, setReplies] = useState<{[key: string]: string}>({});
  const [showImageModal, setShowImageModal] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const productFormRef = useRef<HTMLDivElement>(null);

  // States for management forms
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newP, setNewP] = useState({ 
    name: '', 
    priceUSD: '', 
    usdToCoinRate: appConfig.globalUsdToCoinRate.toString(),
    image: '', 
    catId: categories[0]?.id || 0 
  });

  const [newCat, setNewCat] = useState({ title: '', image: '' });
  const [newMethod, setNewMethod] = useState({ 
    label: '', 
    iban: '', 
    recipientName: '', 
    instructions: '', 
    icon: 'https://cdn-icons-png.flaticon.com/512/9402/9402325.png', 
    currencyIcon: '💰',
    color: 'from-blue-600 to-blue-400'
  });

  const [editingBalanceId, setEditingBalanceId] = useState<string | null>(null);
  const [balanceToAdd, setBalanceToAdd] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setAppConfig({
      ...appConfig,
      themeColors: { ...appConfig.themeColors, [key]: value }
    });
  };

  const getUserData = (userId: string) => allUsers.find(u => u.email === userId);

  const startEditingProduct = (p: any) => {
    setEditingProductId(p.id);
    setNewP({
      name: p.name,
      priceUSD: p.priceUSD.toString(),
      usdToCoinRate: p.usdToCoinRate.toString(),
      image: p.image,
      catId: p.categoryId
    });
    productFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearProductForm = () => {
    setEditingProductId(null);
    setNewP({ 
      name: '', 
      priceUSD: '', 
      usdToCoinRate: appConfig.globalUsdToCoinRate.toString(), 
      image: '', 
      catId: categories[0]?.id || 0 
    });
  };

  const totalRecharged = orders.filter(o => o.type === 'recharge' && o.status === 'completed').reduce((sum, o) => sum + o.priceUSD, 0);
  const totalSales = orders.filter(o => o.type === 'product' && o.status === 'completed').reduce((sum, o) => sum + o.priceUSD, 0);
  const productOrders = orders.filter(o => o.type === 'product');
  const depositOrders = orders.filter(o => o.type === 'recharge');
  const filteredUsers = allUsers.filter(u => u.id.includes(userSearchQuery) || u.name.toLowerCase().includes(userSearchQuery.toLowerCase()));

  const tabItems = [
    { id: 'stats', label: 'الرئيسية', icon: <BarChart3 size={20} /> },
    { id: 'orders', label: 'الطلبات', icon: <ShoppingCart size={20} /> },
    { id: 'deposits', label: 'الإيداعات', icon: <Wallet size={20} /> },
    { id: 'users', label: 'الأعضاء', icon: <Users size={20} /> },
    { id: 'products', label: 'المنتجات', icon: <Package size={20} /> },
    { id: 'categories', label: 'الأقسام', icon: <LayoutGrid size={20} /> },
    { id: 'recharge', label: 'طرق الشحن', icon: <CreditCard size={20} /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings size={20} /> }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] pb-32 rtl w-full overflow-x-hidden font-['Cairo']" dir="rtl">
      {showImageModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setShowImageModal(null)}>
           <img src={showImageModal} className="max-w-[95%] max-h-[80vh] rounded-3xl shadow-2xl object-contain border-4 border-white/20" alt="Preview" />
           <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full transition-transform active:scale-90"><X size={28} /></button>
        </div>
      )}

      {/* Admin Header */}
      <div className="h-16 bg-slate-900 flex items-center justify-between px-4 sticky top-0 z-[100] shadow-xl border-b border-white/5 w-full">
         <button onClick={onBack} className="p-2.5 bg-white/10 rounded-2xl text-white active:scale-90 transition-transform">
            <ArrowRight size={22} />
         </button>
         <div className="text-center">
            <h2 className="text-base font-black text-white leading-none uppercase tracking-wide">لوحة الإدارة</h2>
            <p className="text-[9px] text-yellow-400 font-bold uppercase mt-1 tracking-widest">Administrator Dashboard</p>
         </div>
         <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-yellow-400/20">
            <ShieldAlert size={22} />
         </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-16 z-[90] bg-white border-b border-slate-100 w-full overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex py-4 px-4 gap-3 min-w-max">
           {tabItems.map(tab => {
             const isActive = activeTab === tab.id;
             return (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex flex-col items-center justify-center min-w-[84px] h-[84px] rounded-[2rem] transition-all duration-300 relative ${isActive ? 'bg-slate-900 text-yellow-400 shadow-xl scale-105' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
               >
                 {tab.icon}
                 <span className="text-[9px] font-black mt-1">{tab.label}</span>
                 {isActive && <div className="absolute -bottom-1 w-5 h-1 bg-yellow-400 rounded-full shadow-lg"></div>}
               </button>
             );
           })}
        </div>
      </div>

      <div className="px-4 mt-6 w-full max-w-full overflow-x-hidden animate-slide-up">
        
        {/* SECTION 1: Stats Dashboard */}
        {activeTab === 'stats' && (
          <div className="space-y-4 w-full">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'إيداعات مكتملة', value: `$${totalRecharged.toLocaleString()}`, color: 'bg-emerald-50 text-emerald-600', icon: <TrendingUp size={16}/> },
                { label: 'مبيعات المنتجات', value: `$${totalSales.toLocaleString()}`, color: 'bg-blue-50 text-blue-600', icon: <Package size={16}/> },
                { label: 'الأعضاء النشطين', value: allUsers.length, color: 'bg-amber-50 text-amber-600', icon: <Users size={16}/> },
                { label: 'إجمالي العمليات', value: orders.length, color: 'bg-purple-50 text-purple-600', icon: <RefreshCcw size={16}/> },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-5 rounded-[2.2rem] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center min-h-[140px] transition-transform active:scale-95">
                   <div className={`w-10 h-10 rounded-full ${stat.color} mb-3 flex items-center justify-center shadow-inner`}>{stat.icon}</div>
                   <h3 className="text-lg font-black text-black truncate w-full">{stat.value}</h3>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: Product Orders */}
        {activeTab === 'orders' && (
           <div className="space-y-4 pb-10 w-full">
             {productOrders.map(order => {
                const u = getUserData(order.userId);
                return (
                  <div key={order.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4 w-full">
                     <div className="flex justify-between items-start">
                        <div className="text-right">
                           <h4 className="font-black text-xs text-black">{order.productName}</h4>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-black text-slate-500">#{order.id}</span>
                              <span className="text-[9px] font-black bg-slate-50 text-black px-2 py-0.5 rounded-full border border-slate-100">{order.date}</span>
                           </div>
                        </div>
                        <span className="text-base font-black text-emerald-600">${order.priceUSD}</span>
                     </div>
                     
                     <div className="bg-slate-50 rounded-[1.8rem] p-4 border border-slate-100 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                           <span className="text-[9px] font-black text-slate-500">العميل</span>
                           <span className="text-[11px] font-black text-black">{u?.name || order.userId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-slate-500">ID الشحن</span>
                           <span className="text-[11px] font-black text-indigo-600">{order.playerId}</span>
                        </div>
                     </div>

                     {order.status === 'pending' && (
                       <div className="space-y-3 pt-1">
                          <input type="text" placeholder="رد الإدارة..." className="w-full h-12 bg-white border-2 border-slate-100 rounded-2xl px-6 text-[11px] font-bold outline-none text-right text-black" value={replies[order.id] || ''} onChange={(e) => setReplies({...replies, [order.id]: e.target.value})} />
                          <div className="flex gap-2">
                             <button onClick={() => onUpdateOrder(order.id, 'completed', replies[order.id] || 'تم الشحن')} className="flex-1 bg-slate-900 text-white h-12 rounded-2xl font-black text-[11px]">قبول</button>
                             <button onClick={() => onUpdateOrder(order.id, 'rejected', replies[order.id] || 'مرفوض')} className="flex-1 bg-red-500 text-white h-12 rounded-2xl font-black text-[11px]">رفض</button>
                          </div>
                       </div>
                     )}
                  </div>
                );
             })}
           </div>
        )}

        {/* SECTION 4: User Management */}
        {activeTab === 'users' && (
          <div className="space-y-4 pb-10 w-full">
            <input type="text" placeholder="بحث..." value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)} className="w-full h-12 bg-white border border-slate-100 rounded-full px-6 text-right text-black" />
            {filteredUsers.map(u => (
              <div key={u.email} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4 w-full">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <img src={u.profilePic} className="w-12 h-12 rounded-2xl object-cover" alt={u.name} />
                       <div className="text-right">
                          <h4 className="font-black text-xs text-black">{u.name}</h4>
                          <span className="text-[8px] font-black bg-yellow-400 text-white px-1.5 py-0.5 rounded-full">VIP {u.vip}</span>
                       </div>
                    </div>
                    <span className="text-lg font-black text-emerald-600">${u.balanceUSD}</span>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setEditingBalanceId(editingBalanceId === (u as any).email ? null : (u as any).email)} className="h-12 bg-slate-50 rounded-xl text-[10px] font-bold text-black border border-slate-100">رصيد</button>
                    <button onClick={() => updateAnyUser((u as any).email, { vip: u.vip === 5 ? 1 : u.vip + 1 })} className="h-12 bg-yellow-50 rounded-xl text-[10px] font-bold text-yellow-600 border border-yellow-100">ترقية</button>
                    <button onClick={() => confirm('حذف؟') && deleteAnyUser((u as any).email)} className="h-12 bg-red-50 rounded-xl text-[10px] font-bold text-red-500 border border-red-100">حذف</button>
                 </div>

                 {editingBalanceId === (u as any).email && (
                   <div className="p-3 bg-slate-900 rounded-2xl flex gap-2">
                      <input type="number" placeholder="القيمة..." className="flex-1 h-10 bg-white/10 text-white rounded-lg px-3 text-xs" value={balanceToAdd} onChange={(e) => setBalanceToAdd(e.target.value)} />
                      <button onClick={async () => {
                         const val = parseFloat(balanceToAdd);
                         if(!isNaN(val)) {
                            await updateAnyUser((u as any).email, { balanceUSD: u.balanceUSD + val });
                            alert('تم تحديث الرصيد');
                         }
                         setEditingBalanceId(null); setBalanceToAdd('');
                      }} className="bg-yellow-400 text-slate-900 px-4 rounded-lg font-black text-[10px]">إضافة</button>
                   </div>
                 )}
              </div>
            ))}
          </div>
        )}

        {/* SECTION 5: Product Management */}
        {activeTab === 'products' && (
           <div className="space-y-6 pb-10 w-full">
              <div ref={productFormRef} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4 w-full">
                 <h4 className="font-black text-black text-xs text-right">إضافة / تعديل منتج</h4>
                 <label className="w-full h-32 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden">
                    {newP.image ? <img src={newP.image} className="h-full object-contain" /> : <Camera className="text-slate-300"/>}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (u) => setNewP({...newP, image: u}))} />
                 </label>
                 <input type="text" placeholder="اسم المنتج" value={newP.name} onChange={(e) => setNewP({...newP, name: e.target.value})} className="w-full h-12 bg-slate-50 rounded-xl px-4 text-right text-black outline-none" />
                 <input type="number" placeholder="السعر $" value={newP.priceUSD} onChange={(e) => setNewP({...newP, priceUSD: e.target.value})} className="w-full h-12 bg-slate-50 rounded-xl px-4 text-center text-black outline-none" />
                 <select className="w-full h-12 bg-slate-50 rounded-xl px-4 text-right text-black" value={newP.catId} onChange={(e) => setNewP({...newP, catId: parseInt(e.target.value)})}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                 </select>
                 <button onClick={async () => {
                    setIsSaving(true);
                    await setProducts(editingProductId, {
                      name: newP.name,
                      priceUSD: parseFloat(newP.priceUSD),
                      priceEGP: parseFloat(newP.priceUSD) * appConfig.usdToEgpRate,
                      usdToCoinRate: parseFloat(newP.usdToCoinRate),
                      image: newP.image,
                      categoryId: newP.catId,
                      isCustomAmount: true,
                      amount: 0,
                      color: 'from-slate-800 to-slate-700'
                    });
                    setIsSaving(false);
                    clearProductForm();
                    alert('تم الحفظ بنجاح');
                 }} disabled={isSaving} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black disabled:opacity-50">حفظ المنتج</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 {products.map(p => (
                   <div key={p.id} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center">
                      <img src={p.image} className="w-16 h-16 object-contain mb-2" alt={p.name} />
                      <p className="text-[10px] font-black text-black text-center truncate w-full">{p.name}</p>
                      <div className="flex gap-2 mt-2">
                         <button onClick={() => startEditingProduct(p)} className="p-2 bg-amber-50 text-amber-500 rounded-lg"><Edit3 size={14}/></button>
                         <button onClick={() => confirm('حذف؟') && deleteProduct(p.id as any)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14}/></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {/* SECTION 8: Global Settings & Theme */}
        {activeTab === 'settings' && (
           <div className="space-y-6 pb-10 w-full animate-slide-up">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
                 <h4 className="font-black text-xs text-black text-right uppercase">إعدادات المنصة</h4>
                 <div className="flex flex-col items-center gap-4">
                    <img src={appConfig.logoUrl} className="w-20 h-20 object-contain" alt="Logo" />
                    <label className="w-full h-12 bg-slate-900 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer">
                       تغيير الشعار
                       <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (u) => setAppConfig({...appConfig, logoUrl: u}))} />
                    </label>
                 </div>
                 <input type="text" value={appConfig.appName} onChange={(e) => setAppConfig({...appConfig, appName: e.target.value})} className="w-full h-12 bg-slate-50 rounded-xl px-4 text-right text-black font-bold outline-none" />
                 <textarea value={appConfig.welcomeAnnouncement} onChange={(e) => setAppConfig({...appConfig, welcomeAnnouncement: e.target.value})} className="w-full h-24 bg-slate-50 rounded-xl px-4 py-3 text-right text-black font-bold outline-none resize-none" />
                 <button onClick={() => { setAppConfig(appConfig); alert('تم الحفظ لجميع المستخدمين ✅'); }} className="w-full h-14 bg-yellow-400 text-slate-900 rounded-2xl font-black shadow-lg">حفظ الإعدادات</button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default AdminView;
