/** @copyright 2026 Daniel Gandolfo para Guten - Todos los derechos reservados */

import React, { useState, useMemo } from 'react';
import { CartItem, Product, CustomerInfo } from '../types';
import { Plus, Minus, X, Search, ShoppingBag, Truck, Store, AlertTriangle } from 'lucide-react';

interface CartProps {
  cart: CartItem[];
  allProducts: Product[];
  deliveryCost: number;
  onUpdateQuantity: (id: string, delta: number) => void;
  onAddToCart: (product: Product) => void;
  onClose: () => void;
  onCheckout: (info: CustomerInfo) => void;
}

const Cart: React.FC<CartProps> = ({
  cart,
  allProducts,
  deliveryCost,
  onUpdateQuantity,
  onAddToCart,
  onClose,
  onCheckout,
}) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    notes: '',
    deliveryMethod: 'delivery'
  });

  const [searchQuery, setSearchQuery] = useState('');

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = customerInfo.deliveryMethod === 'delivery' ? cartTotal + deliveryCost : cartTotal;

  // Predictive search logic
  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const lowerQ = searchQuery.toLowerCase();
    return allProducts.filter(p => 
      !cart.find(c => c.id === p.id) && // Exclude items already in cart
      (p.title.toLowerCase().includes(lowerQ) || p.internalCode.toLowerCase().includes(lowerQ))
    );
  }, [searchQuery, allProducts, cart]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckout(customerInfo);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end animate-fade-in backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in-right">
        
        {/* Header */}
        <div className="p-4 bg-orange-600 text-white flex justify-between items-center shadow-md shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag /> Mi Pedido
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-orange-700 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          
          {/* Cart Items */}
          {cart.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg">Tu lista está vacía.</p>
              <button onClick={onClose} className="mt-4 text-orange-600 font-bold underline">
                Volver al puesto
              </button>
            </div>
          ) : (
            <ul className="space-y-3 mb-6">
              {cart.map(item => (
                <li key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex gap-3 items-center">
                  <img src={item.image} alt={item.title} className="w-14 h-14 rounded-lg object-cover bg-gray-200" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 truncate text-sm sm:text-base">{item.title}</h4>
                    <p className="text-orange-600 font-bold text-sm">${item.price * item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                     <button 
                       onClick={() => onUpdateQuantity(item.id, -1)}
                       className="w-7 h-7 flex items-center justify-center bg-white rounded-md text-orange-600 font-bold shadow-sm"
                     >
                        {item.quantity === 1 ? <X size={14}/> : <Minus size={14} />}
                     </button>
                     <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                     <button 
                       onClick={() => {
                          if (item.quantity < item.stock) onUpdateQuantity(item.id, 1);
                       }}
                       disabled={item.quantity >= item.stock}
                       className={`w-7 h-7 flex items-center justify-center rounded-md font-bold shadow-sm ${item.quantity >= item.stock ? 'bg-gray-200 text-gray-400' : 'bg-white text-orange-600'}`}
                     >
                        <Plus size={14} />
                     </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Quick Add Search */}
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6">
            <h3 className="text-sm font-bold text-orange-800 mb-2">¿Te olvidaste de algo?</h3>
            <div className="relative">
              <div className="flex items-center bg-white border border-orange-200 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 ring-orange-400">
                <Search size={18} className="text-orange-400 mr-2" />
                <input
                  type="text"
                  placeholder="Buscar shampoo, papas... (o código)"
                  className="w-full bg-transparent outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-b-xl border border-orange-100 mt-1 max-h-60 overflow-y-auto z-10">
                  {searchResults.map(p => (
                    <div key={p.id} className={`p-2 border-b last:border-0 flex items-center gap-2 ${p.stock === 0 ? 'opacity-50 bg-gray-50' : 'hover:bg-orange-50'}`}>
                      <img src={p.image} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-800">{p.title}</p>
                        <p className="text-xs text-gray-500">${p.price} {p.stock === 0 && <span className="text-red-500 font-bold ml-1">(Sin Stock)</span>}</p>
                      </div>
                      <button 
                        disabled={p.stock === 0}
                        onClick={() => {
                            onAddToCart(p);
                            setSearchQuery('');
                        }}
                        className={`p-1 rounded-full ${p.stock === 0 ? 'bg-gray-300 text-gray-500' : 'bg-green-500 text-white hover:bg-green-600'}`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Checkout Form */}
          {cart.length > 0 && (
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
               <h3 className="font-bold text-lg text-gray-800">Datos para el pedido</h3>
               
               {/* Delivery Method Toggle */}
               <div className="flex gap-4 mb-4">
                  <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${customerInfo.deliveryMethod === 'delivery' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>
                    <input 
                        type="radio" 
                        name="method" 
                        value="delivery" 
                        checked={customerInfo.deliveryMethod === 'delivery'}
                        onChange={() => setCustomerInfo({...customerInfo, deliveryMethod: 'delivery'})}
                        className="hidden"
                    />
                    <Truck className={customerInfo.deliveryMethod === 'delivery' ? 'text-orange-600' : 'text-gray-400'} />
                    <span className="font-bold text-sm">Envío (${deliveryCost})</span>
                  </label>
                  
                  <label className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${customerInfo.deliveryMethod === 'pickup' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}>
                    <input 
                        type="radio" 
                        name="method" 
                        value="pickup" 
                        checked={customerInfo.deliveryMethod === 'pickup'}
                        onChange={() => setCustomerInfo({...customerInfo, deliveryMethod: 'pickup'})}
                        className="hidden"
                    />
                    <Store className={customerInfo.deliveryMethod === 'pickup' ? 'text-orange-600' : 'text-gray-400'} />
                    <span className="font-bold text-sm">Retiro</span>
                  </label>
               </div>

               <div className="space-y-3">
                 <input
                   required
                   type="text"
                   placeholder="Nombre y Apellido"
                   className="w-full border rounded-lg p-3"
                   value={customerInfo.name}
                   onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                 />
                 <input
                   required
                   type="tel"
                   placeholder="Teléfono Celular"
                   className="w-full border rounded-lg p-3"
                   value={customerInfo.phone}
                   onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                 />
                 {customerInfo.deliveryMethod === 'delivery' && (
                     <input
                     required
                     type="text"
                     placeholder="Dirección completa"
                     className="w-full border rounded-lg p-3"
                     value={customerInfo.address}
                     onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                     />
                 )}
                 <textarea
                    placeholder="Notas (ej: timbre no anda)"
                    className="w-full border rounded-lg p-3 text-sm"
                    rows={2}
                    value={customerInfo.notes}
                    onChange={e => setCustomerInfo({...customerInfo, notes: e.target.value})}
                 />
               </div>
            </form>
          )}
        </div>

        {/* Footer Totals & Action */}
        <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] shrink-0 pb-safe">
            <div className="flex justify-between items-end mb-2">
                <span className="text-gray-500 text-sm">Total Productos:</span>
                <span className="font-bold text-gray-800">${cartTotal}</span>
            </div>
            {customerInfo.deliveryMethod === 'delivery' && (
                <div className="flex justify-between items-end mb-2 text-sm">
                    <span className="text-gray-500">Costo Envío:</span>
                    <span className="font-bold text-gray-800">${deliveryCost}</span>
                </div>
            )}
            <div className="flex justify-between items-end mb-4 text-xl">
                <span className="font-bold text-gray-900">Total Final:</span>
                <span className="font-bold text-orange-600">${finalTotal}</span>
            </div>
            
            <button 
                type="submit"
                form="checkout-form"
                disabled={cart.length === 0}
                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-green-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-transform active:scale-95"
            >
                Confirmar y Pedir
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
                Se enviará el pedido por WhatsApp para coordinar pago.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
