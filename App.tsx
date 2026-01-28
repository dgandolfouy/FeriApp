/** @copyright 2026 Daniel Gandolfo para Guten - Todos los derechos reservados */

import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_PRODUCTS, INITIAL_STORE_SETTINGS, CATEGORIES } from './constants';
import { Product, CartItem, StoreSettings, CustomerInfo } from './types';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import { ShoppingCart, UserCircle, MapPin, Store, CheckCircle, X, ShoppingBasket, Vegan, Coins, Utensils, Search } from 'lucide-react';

// Using simple in-memory state for this demo. 
// In production, this would sync with Supabase.

const App: React.FC = () => {
  // --- State ---
  const [showSplash, setShowSplash] = useState(true);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false); // "Hacer lista anticipada" active
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [showLogin, setShowLogin] = useState(false);
  const [mainSearchQuery, setMainSearchQuery] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false); // New state for profile picture modal
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- Effects ---
  useEffect(() => {
    // Reverted to 3000ms as requested
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // --- Helpers ---
  const normalizeText = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // --- Filtering Logic ---
  const filteredProducts = useMemo(() => {
    let result = products;

    // 1. Category Filter
    if (activeCategory !== 'Todos') {
        result = result.filter(p => p.category === activeCategory);
    }

    // 2. Smart Search Filter
    if (mainSearchQuery.trim().length > 0) {
        const q = normalizeText(mainSearchQuery);
        result = result.filter(p => {
            const title = normalizeText(p.title);
            const desc = normalizeText(p.description);
            const keywords = p.keywords ? p.keywords.map(k => normalizeText(k)) : [];
            const code = normalizeText(p.internalCode);
            
            return title.includes(q) || desc.includes(q) || code.includes(q) || keywords.some(k => k.includes(q));
        });
    }

    return result;
  }, [products, activeCategory, mainSearchQuery]);

  // --- Actions ---

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // Check stock limit
        if (existing.quantity >= product.stock) {
            alert(`¡No hay más stock de ${product.title}!`);
            return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // Auto-enable selection mode if user adds via predictive search
    if (!isSelectionMode) setIsSelectionMode(true);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      const product = products.find(p => p.id === id);
      
      if (!item || !product) return prev;

      if (delta > 0 && item.quantity >= product.stock) {
         // Don't alert on rapid clicking, just stop adding
         return prev;
      }

      return prev.map(item => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleCheckout = (info: CustomerInfo) => {
    // 1. Send WhatsApp
    const itemsList = cart.map(i => `• ${i.quantity}x *${i.title}* ($${i.price * i.quantity})`).join('%0A');
    const subtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const total = info.deliveryMethod === 'delivery' ? subtotal + settings.deliveryCost : subtotal;
    
    const message = `*PEDIDO NUEVO - El Puesto del Griego*%0A%0ASoy *${info.name}*.%0A%0A*Mi Pedido:*%0A${itemsList}%0A%0A----------------%0ASubtotal: $${subtotal}%0A${info.deliveryMethod === 'delivery' ? `Envío: $${settings.deliveryCost}%0ADirección: ${info.address}` : 'Retiro en el puesto'}%0A*Total Final: $${total}*%0A%0ANotas: ${info.notes || '-'}%0A%0A_Si necesitás link de pago para hacerlo online, avisame y te lo paso._`;

    const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${message}`;
    
    // Deduct Stock (Mock simulation)
    const newProducts = products.map(p => {
        const inCart = cart.find(c => c.id === p.id);
        if (inCart) {
            return { ...p, stock: Math.max(0, p.stock - inCart.quantity) };
        }
        return p;
    });
    setProducts(newProducts);
    
    // Simulate flow
    alert("Abriendo WhatsApp con tu pedido...");
    
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        setCart([]);
        setIsCartOpen(false);
        setIsSelectionMode(false);
    }, 500);
  };

  // Admin Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy validation
    if (email === 'admin@feria.com' && password === 'admin') {
      setIsAdminOpen(true);
      setShowLogin(false);
      setEmail('');
      setPassword('');
    } else {
      alert("Credenciales incorrectas (Usa: admin@feria.com / admin)");
    }
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // --- Render ---

  if (showSplash) {
      return (
          <div className="fixed inset-0 bg-orange-500 z-[100] flex flex-col items-center justify-center animate-fade-out-delay">
              <div className="flex flex-col items-center animate-heartbeat">
                  {/* Centered Basket */}
                  <ShoppingBasket size={80} className="text-white mb-4" strokeWidth={1.5} />
                  
                  {/* Title */}
                  <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-md relative z-10">FeriApp</h1>
                  
                  {/* Slogan removed as requested */}
              </div>
          </div>
      )
  }

  if (isAdminOpen) {
    return (
      <AdminPanel 
        products={products}
        settings={settings}
        onUpdateProduct={(p) => setProducts(products.map(prev => prev.id === p.id ? p : prev))}
        onAddProduct={(p) => setProducts([...products, p])}
        onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))}
        onUpdateSettings={setSettings}
        onLogout={() => setIsAdminOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen pb-24 font-sans flex flex-col bg-gray-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
         <div className="max-w-7xl mx-auto w-full">
            {/* Top Bar: Admin & Status */}
            <div className="bg-orange-50 px-4 py-2 flex justify-between items-center text-xs sm:text-sm border-b border-orange-100 rounded-b-lg sm:rounded-none">
                <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={14} />
                    <span className="truncate max-w-[150px] sm:max-w-none font-medium">{settings.locationName}</span>
                </div>
                <button 
                    onClick={() => setShowLogin(true)}
                    className="text-orange-600 font-bold hover:underline"
                >
                    Acceso Feriante
                </button>
            </div>

            {/* Main Header */}
            <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${settings.isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    
                    {/* Profile Picture - Clickable */}
                    <button 
                        onClick={() => setShowProfileModal(true)}
                        className="w-12 h-12 rounded-full border-2 border-orange-200 overflow-hidden flex-shrink-0 hover:scale-105 transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                        <img 
                            src={settings.profileImage}
                            alt="El Feriante" 
                            className="w-full h-full object-cover"
                        />
                    </button>

                    <div>
                        <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-none">El Puesto del Griego</h1>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${settings.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {settings.isOpen ? 'ABIERTO' : 'CERRADO'}
                        </span>
                    </div>
                </div>
                
                {/* Cart Icon */}
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="relative bg-orange-100 p-2.5 rounded-xl text-orange-600 hover:bg-orange-200 transition-colors shrink-0"
                >
                    <ShoppingCart size={22} />
                    {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                            {cartItemCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Smart Predictive Search */}
            <div className="px-4 pb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="¿Qué buscás? (Ej: champu, arroz...)" 
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-orange-200 focus:bg-white transition-all outline-none"
                        value={mainSearchQuery}
                        onChange={(e) => setMainSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories */}
            {mainSearchQuery.length === 0 && (
                <div className="flex gap-2 overflow-x-auto px-4 pb-4 no-scrollbar">
                    <button 
                        onClick={() => setActiveCategory('Todos')}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === 'Todos' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Todos
                    </button>
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}
         </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-6 max-w-7xl mx-auto w-full flex-1">
        
        {/* Banner only if no search */}
        {!isSelectionMode && mainSearchQuery.length === 0 && activeCategory === 'Todos' && (
             <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-5 mb-8 text-white shadow-xl shadow-orange-200 relative overflow-hidden">
                 <div className="relative z-10 flex flex-col gap-3 max-w-md">
                    <h2 className="text-2xl sm:text-3xl font-black leading-tight">Hacé tu pedido<br/>en segundos</h2>
                    <p className="text-orange-100 text-sm opacity-90">Elegí tus productos, nosotros te los separamos para retirar o te los enviamos.</p>
                    <button 
                        onClick={() => setIsSelectionMode(true)}
                        className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold text-sm shadow-md self-start hover:scale-105 transition-transform"
                    >
                        Comenzar Lista
                    </button>
                 </div>
                 {/* Decorative background elements */}
                 <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                     <ShoppingBasket size={150} />
                 </div>
             </div>
        )}

        <ProductList 
            products={filteredProducts}
            cart={cart}
            isSelectionMode={isSelectionMode}
            onAddToCart={handleAddToCart}
            onUpdateQuantity={handleUpdateQuantity}
        />
      </main>
      
      {/* Footer */}
      <footer className="text-center py-6 text-gray-400 text-xs">
         <p>© 2026 Daniel Gandolfo para Guten - Todos los derechos reservados</p>
      </footer>

      {/* Profile Picture Modal (Lightbox) */}
      {showProfileModal && (
          <div 
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          >
              <div className="relative max-w-2xl w-full flex flex-col items-center">
                  <button 
                    onClick={() => setShowProfileModal(false)}
                    className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
                  >
                      <X size={32} />
                  </button>
                  <img 
                    src={settings.profileImage} 
                    alt="El Feriante - Full Size" 
                    className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border-4 border-orange-500/30"
                    onClick={(e) => e.stopPropagation()} 
                  />
                  <h3 className="text-white mt-4 font-bold text-xl tracking-wide">El Puesto del Griego</h3>
                  <p className="text-white/60 text-sm">Tu feriante de confianza</p>
              </div>
          </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <Cart 
            cart={cart}
            allProducts={products}
            deliveryCost={settings.deliveryCost}
            onUpdateQuantity={handleUpdateQuantity}
            onAddToCart={handleAddToCart}
            onClose={() => setIsCartOpen(false)}
            onCheckout={handleCheckout}
        />
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative">
                <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-gray-400"><X size={24}/></button>
                <div className="text-center mb-6">
                    <UserCircle size={48} className="mx-auto text-orange-600 mb-2" />
                    <h3 className="text-xl font-bold text-gray-900">Acceso Feriante</h3>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="Email (admin@feria.com)" 
                        className="w-full border rounded-lg p-3"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="Contraseña (admin)" 
                        className="w-full border rounded-lg p-3"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Sticky Footer Cart Summary */}
      {isSelectionMode && !isCartOpen && cartItemCount > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-40 max-w-2xl mx-auto">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="w-full bg-orange-600 text-white font-bold text-lg py-4 rounded-2xl shadow-2xl shadow-orange-300 flex justify-between items-center px-6 transition-all hover:scale-[1.02]"
              >
                  <span className="flex items-center gap-2 text-sm"><ShoppingBasket size={20}/> Ver Pedido</span>
                  <div className="flex items-center gap-3">
                     <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">{cartItemCount} un.</span>
                     <span className="text-lg">${cart.reduce((acc, i) => acc + (i.price * i.quantity), 0)}</span>
                  </div>
              </button>
          </div>
      )}

    </div>
  );
};

// Add global styles for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in-right {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes float-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  .animate-slide-in-right { animation: slide-in-right 0.3s ease-out; }
  .animate-fade-in { animation: fade-in 0.2s ease-out; }
  .animate-float-slow { animation: float-slow 3s ease-in-out infinite; }
  .animate-float-delayed { animation: float-delayed 3s ease-in-out infinite 1.5s; }
  .animate-fade-out-delay { animation: fade-in 0.5s reverse forwards 3.5s; }
  .animate-heartbeat { animation: heartbeat 2s ease-in-out infinite; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;
document.head.appendChild(style);

export default App;