
import React from 'react';
import { Search } from 'lucide-react';
import { UserState, Order, AppConfig } from '../types';

interface WalletViewProps {
  user: UserState;
  orders: Order[];
  appConfig: AppConfig;
}

const WalletView: React.FC<WalletViewProps> = ({ user, orders, appConfig }) => {
  const totalSpentUSD = orders.filter(o => o.status === 'completed' && o.type === 'product').reduce((sum, o) => sum + o.priceUSD, 0);
  const totalIncomingUSD = orders.filter(o => o.status === 'completed' && o.type === 'recharge').reduce((sum, o) => sum + o.priceUSD, 0);

  return (
    <div className="p-4 pb-32 animate-in fade-in duration-500 bg-white min-h-screen rtl" dir="rtl">
      <div className="mb-4">
         <h2 className="text-xl font-black text-slate-800 text-right">المحفظة (USD)</h2>
      </div>

      <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar py-2">
        <div className="bg-[#4ade80] min-w-[140px] flex-1 p-4 rounded-2xl text-white shadow-md">
           <div className="flex items-center justify-center gap-1 mb-1">
             <img src="https://flagcdn.com/w20/us.png" className="w-4 h-3 object-contain rounded-sm" alt="US" />
             <span className="text-lg font-black">${user.balanceUSD.toLocaleString()}</span>
           </div>
           <p className="text-[10px] font-black text-center">رصيدك الحالي</p>
        </div>
        <div className="bg-[#f43f5e] min-w-[140px] flex-1 p-4 rounded-2xl text-white shadow-md">
           <div className="flex items-center justify-center gap-1 mb-1">
             <img src="https://flagcdn.com/w20/us.png" className="w-4 h-3 object-contain rounded-sm" alt="US" />
             <span className="text-lg font-black">${totalSpentUSD.toLocaleString()}</span>
           </div>
           <p className="text-[10px] font-black text-center">إجمالي مشتريات</p>
        </div>
        <div className="bg-[#a855f7] min-w-[140px] flex-1 p-4 rounded-2xl text-white shadow-md">
           <div className="flex items-center justify-center gap-1 mb-1">
             <img src="https://flagcdn.com/w20/us.png" className="w-4 h-3 object-contain rounded-sm" alt="US" />
             <span className="text-lg font-black">${totalIncomingUSD.toLocaleString()}</span>
           </div>
           <p className="text-[10px] font-black text-center">إجمالي الشحن</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-slate-800 text-right text-sm px-2">العمليات الأخيرة</h3>
        {orders.length > 0 ? (
          orders.slice(0, 10).map(order => (
            <div key={order.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
               <div className="text-left">
                  <p className={`font-black text-xs ${order.type === 'recharge' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {order.type === 'recharge' ? '+' : '-'}${order.priceUSD.toFixed(2)}
                  </p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{order.status}</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-xs text-slate-800">{order.productName}</p>
                    <p className="text-[9px] text-slate-400 font-bold">{order.date}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.type === 'recharge' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {order.type === 'recharge' ? '+' : '-'}
                  </div>
               </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
            <p className="font-bold text-slate-400">لا توجد عمليات حالية</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletView;
