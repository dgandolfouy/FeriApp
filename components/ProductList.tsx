/** @copyright 2026 Daniel Gandolfo para Guten - Todos los derechos reservados */

import React from 'react';
import { Product, CartItem } from '../types';
import { Plus, Minus, Tag, Flame, Sparkles } from 'lucide-react';

interface ProductListProps {
  products: Product[]; // Filtered products (search/category applied)
  cart: CartItem[];
  isSelectionMode: boolean;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

interface QuantityControlProps {
  product: Product;
  quantity: number;
  compact?: boolean;
  isSelectionMode: boolean;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

const QuantityControl: React.FC<QuantityControlProps> = ({ product, quantity, compact, isSelectionMode, onAddToCart, onUpdateQuantity }) => {
    const hasStock = product.stock > 0;
    
    if (!isSelectionMode && quantity === 0) {
      // If not in selection mode and item not in cart, show small 'Add' text or just price implies adding
      // Requirement said: "Offer predictive search... list of products to select".
      // Let's show a small ADD button always to be "purchase induced".
      return (
          <button 
              onClick={() => onAddToCart(product)}
              disabled={!hasStock}
              className={`bg-orange-100 text-orange-700 p-1.5 rounded-full hover:bg-orange-200 transition-colors ${!hasStock ? 'invisible' : ''}`}
          >
              <Plus size={compact ? 16 : 18} strokeWidth={3} />
          </button>
      );
    }

    return (
      <div className={`flex items-center bg-gray-100 rounded-full ${compact ? 'h-7' : 'h-8'}`}>
          <button
              onClick={() => onUpdateQuantity(product.id, -1)}
              className={`w-8 flex items-center justify-center text-orange-600 ${compact ? 'h-7' : 'h-8'}`}
          >
              <Minus size={compact ? 12 : 14} strokeWidth={3} />
          </button>
          <span className={`font-bold text-gray-900 text-center w-4 ${compact ? 'text-xs' : 'text-sm'}`}>{quantity}</span>
          <button
              onClick={() => quantity < product.stock && onUpdateQuantity(product.id, 1)}
              disabled={quantity >= product.stock}
              className={`w-8 flex items-center justify-center ${quantity >= product.stock ? 'text-gray-400' : 'text-orange-600'} ${compact ? 'h-7' : 'h-8'}`}
          >
              <Plus size={compact ? 12 : 14} strokeWidth={3} />
          </button>
      </div>
    );
};

interface ProductItemProps {
    product: Product;
    cart: CartItem[];
    isSelectionMode: boolean;
    onAddToCart: (product: Product) => void;
    onUpdateQuantity: (id: string, delta: number) => void;
}

const FeaturedCard: React.FC<ProductItemProps> = ({ product, cart, isSelectionMode, onAddToCart, onUpdateQuantity }) => {
    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    
    return (
      <div className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-md border border-orange-100 overflow-hidden relative group">
          <div className="h-32 relative">
             <img src={product.image} className="w-full h-full object-cover" alt={product.title} />
             {product.isPack ? (
                 <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                     <Sparkles size={10}/> PACK
                 </div>
             ) : (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                     <Flame size={10}/> OFERTA
                 </div>
             )}
          </div>
          <div className="p-3">
              <h3 className="font-bold text-gray-800 text-sm truncate mb-1">{product.title}</h3>
              <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                      {product.oldPrice && <span className="text-[10px] text-gray-400 line-through">${product.oldPrice}</span>}
                      <span className="font-bold text-orange-600 text-lg">${product.price}</span>
                  </div>
                  <QuantityControl 
                    product={product} 
                    quantity={quantity} 
                    isSelectionMode={isSelectionMode}
                    onAddToCart={onAddToCart}
                    onUpdateQuantity={onUpdateQuantity}
                  />
              </div>
          </div>
      </div>
    );
};

const ProductRow: React.FC<ProductItemProps> = ({ product, cart, isSelectionMode, onAddToCart, onUpdateQuantity }) => {
    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;
    const hasStock = product.stock > 0;

    // Modified to be a self-contained card for grid layout usage on Desktop, 
    // while looking like a row on Mobile via flex layout.
    return (
      <div className={`flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow ${!hasStock ? 'opacity-60 grayscale' : ''} h-full`}>
          {/* Image - Compact */}
          <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <img src={product.image} className="w-full h-full object-cover" alt={product.title} />
          </div>

          {/* Info - Middle */}
          <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">{product.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.description}</p>
              {!hasStock && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1 rounded mt-1 inline-block">SIN STOCK</span>}
          </div>

          {/* Price & Action - Right */}
          <div className="flex flex-col items-end gap-1">
              <span className="font-bold text-gray-900 text-base">${product.price}</span>
              {hasStock && (
                  <QuantityControl 
                    product={product} 
                    quantity={quantity} 
                    compact 
                    isSelectionMode={isSelectionMode}
                    onAddToCart={onAddToCart}
                    onUpdateQuantity={onUpdateQuantity}
                  />
              )}
          </div>
      </div>
    );
};

const ProductList: React.FC<ProductListProps> = ({
  products,
  cart,
  isSelectionMode,
  onAddToCart,
  onUpdateQuantity,
}) => {
  
  // Logic to separate "Inducement" (Offers/Packs) from the rest
  const featured = products.filter(p => (p.oldPrice || p.isPack) && p.stock > 0);
  const regular = products.filter(p => !featured.find(f => f.id === p.id));

  return (
    <div className="pb-24">
      {/* 1. Featured Section (Horizontal Rail) */}
      {featured.length > 0 && (
          <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3 px-1 flex items-center gap-2">
                  <Flame size={18} className="text-orange-500 fill-orange-500" /> 
                  Ofertas y Packs
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 px-1 no-scrollbar snap-x snap-mandatory">
                  {featured.map(p => (
                      <div key={p.id} className="snap-start">
                          <FeaturedCard 
                            product={p} 
                            cart={cart}
                            isSelectionMode={isSelectionMode}
                            onAddToCart={onAddToCart}
                            onUpdateQuantity={onUpdateQuantity}
                          />
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* 2. Main List - RESPONSIVE GRID (1 col mobile, 2 col tablet, 3 col desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
         {regular.length === 0 && featured.length === 0 && (
             <div className="col-span-full p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
                 No encontramos productos con ese nombre.
             </div>
         )}
         {regular.map(p => (
             <ProductRow 
                key={p.id} 
                product={p} 
                cart={cart}
                isSelectionMode={isSelectionMode}
                onAddToCart={onAddToCart}
                onUpdateQuantity={onUpdateQuantity}
             />
         ))}
      </div>
    </div>
  );
};

export default ProductList;