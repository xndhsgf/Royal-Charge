
import React, { useState, useEffect } from 'react';
import { Megaphone, PlusCircle, LayoutGrid } from 'lucide-react';
import PurchaseModal from './PurchaseModal';
import { Product, UserState, Banner, Category, AppConfig } from '../types';

interface HomeViewProps {
  user: UserState;
  appConfig: AppConfig;
  onPurchase: (product: Product, idValue: string, customPriceUSD?: number, coins?: number) => boolean;
  products: Product[];
  banners: Banner[];
  categories: Category[];
}

const HomeView: React.FC<HomeViewProps> = ({ user, appConfig, onPurchase, products, banners, categories }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(categories[0]?.id || null);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrentBanner((prev) => (prev + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const filteredProducts = activeCategoryId 
    ? products.filter(p => p.categoryId === activeCategoryId)
    : products;

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  return (
    <div className="pb-32 animate-in fade-in duration-500 min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* الإعلان الترحيبي */}
      <div className="bg-[#fbbf24] px-4 py-3 flex items-center justify-between text-white font-bold text-[11px] shadow-sm">
        <div className="flex items-center gap-2 overflow-hidden flex-row-reverse w-full">
          <Megaphone size={14} className="shrink-0" />
          <p className="truncate text-right flex-1">{appConfig.welcomeAnnouncement}</p>
        </div>
        <button className="bg-[#1e293b] text-white px-3 py-1 rounded-md text-[10px] font-black shrink-0 mr-3">الحماية</button>
      </div>

      {/* البنرات */}
      <div className="px-4 mt-4">
        <div className="relative h-44 w-full overflow-hidden rounded-[2.5rem] shadow-xl border border-white/20 bg-slate-900">
          {banners.length > 0 ? banners.map((banner, index) => (
            <div key={banner.id} className={`absolute inset-0 transition-all duration-1000 transform ${index === currentBanner ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-110 translate-x-full'}`}>
              <img src={banner.url} alt={banner.title} className="w-full h-full object-cover" />
              {banner.title && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-6 text-right">
                  <h2 className="text-white text-lg font-black drop-shadow-md">
                    {banner.title}
                  </h2>
                </div>
              )}
            </div>
          )) : (
            <div className="w-full h-full flex items-center justify-center text-white/30">لا توجد بنرات حالياً</div>
          )}
        </div>
      </div>

      {/* الأقسام */}
      <div className="mt-8 px-4">
        <div className="flex items-center justify-between mb-4 px-1">
           <h3 className="text-sm font-black text-white text-right">تصفح الأقسام</h3>
           <LayoutGrid size={18} className="text-yellow-400" />
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategoryId(cat.id)} 
              className={`flex flex-col items-center shrink-0 transition-all duration-300 ${activeCategoryId === cat.id ? 'scale-110' : 'opacity-60 scale-95'}`}
            >
              <div className={`w-20 h-20 rounded-[2rem] overflow-hidden border-4 transition-all shadow-lg ${activeCategoryId === cat.id ? 'border-yellow-400 shadow-yellow-400/20' : 'border-transparent bg-white/5'}`}>
                <img src={cat.image} className="w-full h-full object-cover" alt={cat.title} />
              </div>
              <span className={`text-[10px] font-black mt-2 transition-colors ${activeCategoryId === cat.id ? 'text-yellow-400' : 'text-slate-400'}`}>
                {cat.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* عرض المنتجات - تصميم 4 أعمدة احترافي */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4 px-1">
           <div className="flex flex-col items-end">
              <h3 className="text-xs font-black text-white text-right uppercase tracking-wider">{activeCategory?.title || 'المنتجات'}</h3>
              <div className="w-8 h-1 bg-yellow-400 rounded-full mt-1"></div>
           </div>
           <span className="text-[9px] font-black bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{filteredProducts.length} عنصر</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-4 gap-3 animate-slide-up">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => { setSelectedProduct(product); setTimeout(() => setIsModalOpen(true), 10); }}
                className="relative group cursor-pointer active:scale-90 transition-all duration-300"
              >
                {/* حاوية الصورة المربعة بحواف دائرية */}
                <div className="w-full aspect-square rounded-[1.2rem] overflow-hidden shadow-lg relative border border-white/5 bg-slate-800">
                    <img 
                      src={product.image} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={product.name} 
                    />
                    
                    {/* طبقة شفافة سفلية للاسم (Glassmorphism) */}
                    <div className="absolute bottom-1 inset-x-1 bg-black/30 backdrop-blur-md rounded-[0.8rem] py-1 px-1 border border-white/10">
                        <p className="text-[7px] font-black text-white text-center truncate uppercase tracking-tighter">
                          {product.name}
                        </p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
             <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 text-white/20">
                <PlusCircle size={32} />
             </div>
             <p className="text-sm font-black text-white/30">لا توجد منتجات حالياً</p>
          </div>
        )}
      </div>
      
      {isModalOpen && selectedProduct && (
        <PurchaseModal 
          isOpen={isModalOpen} 
          product={selectedProduct} 
          appConfig={appConfig}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }} 
          onConfirm={onPurchase} 
        />
      )}
    </div>
  );
};

export default HomeView;
