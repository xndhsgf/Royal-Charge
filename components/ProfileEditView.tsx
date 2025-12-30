
import React, { useState, useEffect } from 'react';
import { UserState } from '../types';
import { Camera, Save, ArrowRight, Sun, Moon, CheckCircle, User as UserIcon, ShieldCheck } from 'lucide-react';

interface ProfileEditViewProps {
  user: UserState;
  setUser: (updatedUser: Partial<UserState>) => Promise<void>;
  onBack: () => void;
}

const ProfileEditView: React.FC<ProfileEditViewProps> = ({ user, setUser, onBack }) => {
  const [name, setName] = useState(user.name);
  const [pic, setPic] = useState(user.profilePic);
  const [isSaving, setIsSaving] = useState(false);

  // تحديث القيم المحلية إذا تغيرت بيانات المستخدم من الخارج (مزامنة)
  useEffect(() => {
    setName(user.name);
    setPic(user.profilePic);
  }, [user.name, user.profilePic]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("الاسم لا يمكن أن يكون فارغاً");
      return;
    }
    setIsSaving(true);
    try {
      // سيتم التحديث محلياً فوراً بداخل هذه الدالة في App.tsx
      await setUser({ name: name.trim(), profilePic: pic });
      alert('تم تحديث بياناتك بنجاح! ✅');
      onBack();
    } catch (e) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 rtl" dir="rtl">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm active:scale-90 transition-transform">
          <ArrowRight size={24} className="text-slate-600 dark:text-slate-400" />
        </button>
        <h2 className="text-lg font-black text-slate-800 dark:text-white">تعديل الملف الشخصي</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex flex-col items-center mb-10">
        <div className="relative group">
           <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white dark:border-slate-800 shadow-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 transition-transform group-active:scale-95">
              <img src={pic} className="w-full h-full object-cover" alt="Profile" />
           </div>
           <label className="absolute -bottom-2 -right-2 bg-[#facc15] text-white p-3 rounded-2xl shadow-xl cursor-pointer hover:scale-110 transition-transform border-4 border-white dark:border-slate-900 active:scale-95">
              <Camera size={22} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
           </label>
        </div>
        <div className="mt-4 flex items-center gap-2">
           <h3 className="font-black text-slate-800 dark:text-white text-xl">{name}</h3>
           {user.isVerified && <ShieldCheck size={18} className="text-blue-500" />}
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">ID: {user.id}</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm focus-within:border-[#facc15] transition-colors">
           <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 mr-1 text-right">الاسم الكامل</label>
           <div className="flex items-center gap-3 flex-row-reverse">
              <UserIcon size={18} className="text-[#facc15]" />
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-transparent font-black text-slate-800 dark:text-white outline-none text-right"
                placeholder="أدخل اسمك هنا..."
              />
           </div>
        </div>

        <div className="bg-white/50 dark:bg-slate-900/50 rounded-3xl p-5 border border-dashed border-slate-200 dark:border-slate-800">
           <label className="block text-[10px] font-black text-slate-300 uppercase mb-2 mr-1 text-right">البريد الإلكتروني (لا يمكن تغييره)</label>
           <p className="text-right font-bold text-slate-400 text-sm px-1">{user.email}</p>
        </div>
      </div>

      <div className="fixed bottom-24 left-6 right-6 z-40">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full h-16 ${isSaving ? 'bg-slate-400' : 'bg-slate-900 dark:bg-white dark:text-slate-900'} text-white rounded-[2rem] font-black text-lg shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all`}
        >
          {isSaving ? (
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <CheckCircle size={22} /> حفظ التغييرات
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileEditView;
