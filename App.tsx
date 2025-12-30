
import React, { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { db } from './lib/firebase';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import WalletView from './components/WalletView';
import OrdersView from './components/OrdersView';
import SearchView from './components/SearchView';
import NotificationsView from './components/NotificationsView';
import ProfileEditView from './components/ProfileEditView';
import CartView from './components/CartView';
import RechargeView, { RECHARGE_METHODS as DEFAULT_METHODS } from './components/RechargeView';
import RechargeDetailsView from './components/RechargeDetailsView';
import AdminView from './components/AdminView';
import PurchaseModal from './components/PurchaseModal';
import LoginView from './components/LoginView';
import { ViewType, UserState, Order, Product, Category, AppConfig, RechargeMethod, Notification } from './types';
import { CATEGORIES as DEFAULT_CATEGORIES, BANNERS as DEFAULT_BANNERS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedRechargeMethod, setSelectedRechargeMethod] = useState<RechargeMethod | null>(null);
  const [selectedProductForPurchase, setSelectedProductForPurchase] = useState<Product | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const [appConfig, setAppConfig] = useState<AppConfig>({
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/9402/9402325.png',
    appName: 'ROYAL-CHARGE',
    usdToEgpRate: 50,
    globalUsdToCoinRate: 100,
    welcomeAnnouncement: 'مرحباً بك في ROYAL-CHARGE، منصة شحن الألعاب الأولى!',
    banners: DEFAULT_BANNERS,
    themeColors: {
      primary: '#facc15',
      secondary: '#0f172a',
      background: '#0000FF',
      surface: '#ffffff',
      text: '#ffffff'
    }
  });

  const [user, setUser] = useState<UserState | null>(() => {
    const saved = localStorage.getItem('royal_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [rechargeMethods, setRechargeMethods] = useState<RechargeMethod[]>(DEFAULT_METHODS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<UserState[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cartItems, setCartItems] = useState<Product[]>([]);

  // مزامنة الإعدادات العامة
  useEffect(() => {
    return onSnapshot(doc(db, "settings", "appConfig"), (docSnap) => {
      if (docSnap.exists()) setAppConfig(docSnap.data() as AppConfig);
    });
  }, []);

  // مزامنة المنتجات والأقسام وطرق الشحن
  useEffect(() => {
    const unsubProds = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any)));
    });
    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      const cats = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      if (cats.length > 0) setCategories(cats);
    });
    const unsubMethods = onSnapshot(collection(db, "rechargeMethods"), (snap) => {
      const methods = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any));
      if (methods.length > 0) setRechargeMethods(methods);
    });
    return () => { unsubProds(); unsubCats(); unsubMethods(); };
  }, []);

  // مزامنة بيانات المستخدم والطلبات
  useEffect(() => {
    if (!user?.email) return;

    const unsubUser = onSnapshot(doc(db, "users", user.email.toLowerCase()), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserState;
        setUser(data);
        localStorage.setItem('royal_user', JSON.stringify(data));
      }
    });

    let unsubOrders: () => void;
    if (user.isAdmin) {
      const q = query(collection(db, "orders"), orderBy("date", "desc"));
      unsubOrders = onSnapshot(q, (snap) => {
        setOrders(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any)));
      });
      onSnapshot(collection(db, "users"), (snap) => {
        setAllUsers(snap.docs.map(doc => doc.data() as UserState));
      });
    } else {
      const q = query(collection(db, "orders"), where("userId", "==", user.email.toLowerCase()), orderBy("date", "desc"));
      unsubOrders = onSnapshot(q, (snap) => {
        setOrders(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any)));
      });
    }

    return () => { unsubUser(); unsubOrders && unsubOrders(); };
  }, [user?.email, user?.isAdmin]);

  const handleLogin = async (email: string, password: string, extraData?: Partial<UserState>, isSignup?: boolean) => {
    const cleanEmail = email.toLowerCase().trim();
    const isAdminCredentials = cleanEmail === 'admin@royal.com' && password === 'admin123456';
    const userRef = doc(db, "users", cleanEmail);

    try {
      const userSnap = await getDoc(userRef);
      
      if (isSignup) {
        if (userSnap.exists()) {
          alert("البريد الإلكتروني مسجل مسبقاً");
          return;
        }
        const newUser = {
          name: extraData?.name || 'مستخدم جديد',
          email: cleanEmail,
          id: Math.floor(1000 + Math.random() * 9000).toString(),
          profilePic: extraData?.profilePic || 'https://picsum.photos/seed/user/200',
          country: extraData?.country || 'مصر 🇪🇬',
          balanceUSD: 0,
          vip: 1,
          isVerified: true,
          theme: 'light',
          isAdmin: isAdminCredentials,
          password: password,
          isBlocked: false,
          isFrozen: false
        };
        await setDoc(userRef, newUser);
        setUser(newUser as any);
        localStorage.setItem('royal_user', JSON.stringify(newUser));
      } else {
        // حالة خاصة لإنشاء حساب المدير إذا لم يكن موجوداً
        if (!userSnap.exists() && isAdminCredentials) {
          const adminUser = {
            name: 'المدير العام',
            email: cleanEmail,
            id: 'ADMIN',
            profilePic: 'https://cdn-icons-png.flaticon.com/512/6024/6024190.png',
            country: 'إدارة النظام ⚡',
            balanceUSD: 1000000,
            vip: 5,
            isVerified: true,
            theme: 'dark',
            isAdmin: true,
            password: password,
            isBlocked: false,
            isFrozen: false
          };
          await setDoc(userRef, adminUser);
          setUser(adminUser as any);
          localStorage.setItem('royal_user', JSON.stringify(adminUser));
          return;
        }

        if (!userSnap.exists()) {
          alert("الحساب غير موجود، يرجى إنشاء حساب أولاً");
          return;
        }

        const userData = userSnap.data() as any;
        if (userData.password !== password) {
          alert("كلمة السر خاطئة");
          return;
        }

        // تحديث حالة الأدمن إذا لزم الأمر
        if (isAdminCredentials && !userData.isAdmin) {
          await updateDoc(userRef, { isAdmin: true });
          userData.isAdmin = true;
        }

        setUser(userData as UserState);
        localStorage.setItem('royal_user', JSON.stringify(userData));
      }
    } catch (e) {
      console.error("Login Error:", e);
      alert("فشل الاتصال بقاعدة البيانات. تأكد من الإنترنت.");
    }
  };

  const handleLogout = useCallback(() => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      setUser(null);
      localStorage.removeItem('royal_user');
      setIsSidebarOpen(false);
      setCurrentView('home');
    }
  }, []);

  const handlePurchase = async (product: Product, idValue: string, customPriceUSD?: number, coins?: number) => {
    if (!user) return false;
    const finalPrice = customPriceUSD || product.priceUSD;
    if (user.balanceUSD < finalPrice) {
      alert('رصيدك غير كافٍ');
      return false;
    }

    try {
      await updateDoc(doc(db, "users", user.email.toLowerCase()), { balanceUSD: user.balanceUSD - finalPrice });
      await addDoc(collection(db, "orders"), {
        productName: product.name,
        priceUSD: finalPrice,
        priceEGP: finalPrice * appConfig.usdToEgpRate,
        coinsAmount: coins || product.amount,
        date: new Date().toISOString(),
        status: 'pending',
        playerId: idValue,
        userId: user.email.toLowerCase(),
        type: 'product'
      });
      alert('تم إرسال الطلب');
      return true;
    } catch (e) { return false; }
  };

  const handleRechargeRequest = async (amount: number, sender: string, pId: string, img?: string) => {
    if (!user) return;
    await addDoc(collection(db, "orders"), {
      productName: 'إيداع رصيد',
      priceUSD: amount,
      priceEGP: amount * appConfig.usdToEgpRate,
      date: new Date().toISOString(),
      status: 'pending',
      type: 'recharge',
      userId: user.email.toLowerCase(),
      playerId: pId,
      screenshot: img || null,
      details: { senderName: sender }
    });
    alert('طلب الشحن قيد المراجعة');
    setCurrentView('home');
  };

  const onAdminUpdateOrder = async (orderId: string, status: 'completed' | 'rejected', reply: string) => {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return;
    const orderData = orderSnap.data() as Order;
    
    await updateDoc(orderRef, { status, adminReply: reply });

    if (status === 'completed' && orderData.type === 'recharge') {
      const uRef = doc(db, "users", orderData.userId.toLowerCase());
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) await updateDoc(uRef, { balanceUSD: uSnap.data().balanceUSD + orderData.priceUSD });
    } else if (status === 'rejected' && orderData.type === 'product') {
      const uRef = doc(db, "users", orderData.userId.toLowerCase());
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) await updateDoc(uRef, { balanceUSD: uSnap.data().balanceUSD + orderData.priceUSD });
    }
  };

  const updateProduct = async (id: any, data: any) => {
    if (typeof id === 'string') await updateDoc(doc(db, "products", id), data);
    else await addDoc(collection(db, "products"), data);
  };
  const deleteProduct = async (id: any) => await deleteDoc(doc(db, "products", id));
  const addCategory = async (data: any) => await addDoc(collection(db, "categories"), data);
  const deleteCategory = async (id: any) => await deleteDoc(doc(db, "categories", id));
  const addRechargeMethod = async (data: any) => await addDoc(collection(db, "rechargeMethods"), data);
  const deleteRechargeMethod = async (id: any) => await deleteDoc(doc(db, "rechargeMethods", id));
  const updateAnyUser = async (email: string, data: any) => await updateDoc(doc(db, "users", email.toLowerCase()), data);
  const deleteAnyUser = async (email: string) => await deleteDoc(doc(db, "users", email.toLowerCase()));

  if (!user) {
    return <LoginView onLogin={handleLogin} appName={appConfig.appName} logoUrl={appConfig.logoUrl} />;
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-[500px] mx-auto relative overflow-hidden font-['Cairo'] shadow-2xl" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)', paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}>
      {currentView !== 'admin' && <Header onMenuClick={() => setIsSidebarOpen(true)} currentView={currentView} onBack={() => setCurrentView('home')} appConfig={appConfig} />}
      <main className="flex-1 overflow-y-auto no-scrollbar w-full relative">
        {currentView === 'home' && <HomeView user={user} appConfig={appConfig} onPurchase={handlePurchase} products={products} banners={appConfig.banners} categories={categories} />}
        {currentView === 'wallet' && <WalletView user={user} orders={orders} appConfig={appConfig} />}
        {currentView === 'orders' && <OrdersView orders={orders} />}
        {currentView === 'notifications' && <NotificationsView notifications={notifications} />}
        {currentView === 'recharge' && <RechargeView rechargeMethods={rechargeMethods} onSelectMethod={(m) => { setSelectedRechargeMethod(m); setCurrentView('recharge_details'); }} />}
        {currentView === 'recharge_details' && selectedRechargeMethod && <RechargeDetailsView method={selectedRechargeMethod} onConfirm={handleRechargeRequest} />}
        {currentView === 'search' && <SearchView products={products} onPurchase={handlePurchase} appConfig={appConfig} />}
        {currentView === 'cart' && <CartView cartItems={cartItems} setCartItems={setCartItems} onCheckout={(p) => { setSelectedProductForPurchase(p); setIsPurchaseModalOpen(true); }} appConfig={appConfig} />}
        {currentView === 'profile_edit' && <ProfileEditView user={user} setUser={(u) => updateDoc(doc(db, "users", user.email.toLowerCase()), u)} onBack={() => setCurrentView('home')} />}
        {currentView === 'admin' && (
           <AdminView 
             products={products} setProducts={updateProduct as any} deleteProduct={deleteProduct}
             categories={categories} addCategory={addCategory} deleteCategory={deleteCategory}
             rechargeMethods={rechargeMethods} addRechargeMethod={addRechargeMethod} deleteRechargeMethod={deleteRechargeMethod}
             orders={orders} setOrders={() => {}}
             allUsers={allUsers} updateAnyUser={updateAnyUser} deleteAnyUser={deleteAnyUser}
             currentUser={user} setCurrentUser={setUser}
             appConfig={appConfig} setAppConfig={(cfg) => setDoc(doc(db, "settings", "appConfig"), cfg)}
             onBack={() => setCurrentView('home')}
             onUpdateOrder={onAdminUpdateOrder}
           />
        )}
      </main>
      {currentView !== 'admin' && <div className="shrink-0 z-50"><BottomNav currentView={currentView} onViewChange={setCurrentView} /></div>}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} setView={setCurrentView} user={user} setUser={() => {}} appConfig={appConfig} onLogout={handleLogout} />
      {isPurchaseModalOpen && selectedProductForPurchase && <PurchaseModal isOpen={isPurchaseModalOpen} product={selectedProductForPurchase} appConfig={appConfig} onClose={() => { setIsPurchaseModalOpen(false); setSelectedProductForPurchase(null); }} onConfirm={handlePurchase} />}
    </div>
  );
};

export default App;
