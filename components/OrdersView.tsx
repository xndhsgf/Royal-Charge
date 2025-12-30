
import React from 'react';
import { Search, Package, CheckCircle, Clock, XCircle, MessageSquare } from 'lucide-react';
import { Order } from '../types';

interface OrdersViewProps {
  orders: Order[];
}

const OrdersView: React.FC<OrdersViewProps> = ({ orders }) => {
  return (
    <div className="p-4 pb-32 animate-in fade-in duration-500 bg-white min-h-screen rtl" dir="rtl">
      <div className="mb-4">
         <h2 className="text-xl font-black text-slate-800 text-right">طلباتي</h2>
      </div>

      {/* Order List or Empty State */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'completed' ? 'bg-green-50 text-green-500' : order.status === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                    <Package size={24} />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-sm text-slate-800">{order.productName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{order.date} | #{order.id}</p>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-slate-900 font-black text-sm mb-1">${order.priceUSD.toFixed(2)}</div>
                  <div className={`flex items-center gap-1 text-[9px] font-black uppercase ${order.status === 'completed' ? 'text-green-500' : order.status === 'rejected' ? 'text-red-500' : 'text-amber-500'}`}>
                    {order.status === 'completed' ? <CheckCircle size={12} /> : order.status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                    <span>{order.status === 'completed' ? 'مكتمل' : order.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}</span>
                  </div>
                </div>
              </div>

              {/* تفاصيل الطلب */}
              <div className="bg-slate-50 rounded-2xl p-3 flex justify-around border border-slate-100">
                 {order.playerId && (
                   <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 mb-0.5">آي دي اللاعب</p>
                      <p className="text-xs font-black text-indigo-600">{order.playerId}</p>
                   </div>
                 )}
                 {order.coinsAmount > 0 && (
                   <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 mb-0.5">الكمية المطلوبة</p>
                      <p className="text-xs font-black text-indigo-600">{order.coinsAmount.toLocaleString()} كوينز</p>
                   </div>
                 )}
              </div>

              {/* رسالة المدير */}
              {order.adminReply && (
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex gap-3 items-start">
                   <MessageSquare size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                   <div className="text-right">
                      <p className="text-[10px] font-black text-indigo-400 mb-1 uppercase tracking-wider">رسالة من الإدارة:</p>
                      <p className="text-xs font-bold text-indigo-800 leading-relaxed">{order.adminReply}</p>
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 opacity-60">
          <div className="relative w-32 h-32 mb-4">
             <div className="absolute top-0 right-2 w-20 h-28 bg-white border-2 border-slate-200 rounded-md shadow-sm transform -rotate-6 flex flex-col p-2">
                <div className="w-8 h-2 bg-indigo-500 rounded-full mx-auto mb-2"></div>
             </div>
             <div className="absolute top-4 left-2 w-20 h-28 bg-white border-2 border-slate-200 rounded-md shadow-md flex flex-col p-2 z-10">
                <div className="w-8 h-2 bg-indigo-500 rounded-full mx-auto mb-2"></div>
             </div>
          </div>
          <p className="font-bold text-slate-400">لا توجد طلبات سابقة</p>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
