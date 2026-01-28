/** @copyright 2026 Daniel Gandolfo para Guten - Todos los derechos reservados */

import React, { useState, useRef, useEffect } from 'react';
import { Product, StoreSettings, UnitType } from '../types';
import { CATEGORIES } from '../constants';
import { Plus, Edit, Trash2, Wand2, X, Barcode, Search, Save, Package, RefreshCw, Camera, User } from 'lucide-react';
import { generateProductDescription } from '../services/geminiService';

interface AdminPanelProps {
  products: Product[];
  settings: StoreSettings;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  settings,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onUpdateSettings,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'stock'>('products');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [stockSearch, setStockSearch] = useState('');

  // Stock Quick Filter
  const filteredStockProducts = products.filter(p => 
     p.title.toLowerCase().includes(stockSearch.toLowerCase()) || 
     p.internalCode.toLowerCase().includes(stockSearch.toLowerCase()) ||
     (p.barcode && p.barcode.includes(stockSearch))
  );

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    internalCode: '',
    description: '',
    price: 0,
    stock: 0,
    unit: 'un',
    category: 'Otros',
    image: 'https://picsum.photos/300',
    available: true,
    isPack: false,
  });

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    const nextCode = `G${String(products.length + 1).padStart(4, '0')}`;
    setFormData({
      title: '',
      internalCode: nextCode,
      description: '',
      price: 0,
      stock: 0,
      oldPrice: undefined,
      unit: 'un',
      category: 'Almacén',
      image: `https://picsum.photos/seed/${Date.now()}/300/300`,
      available: true,
      isPack: false,
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) return;
    setLoadingAI(true);
    const desc = await generateProductDescription(formData.title);
    setFormData(prev => ({ ...prev, description: desc }));
    setLoadingAI(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return;

    const productData = {
      ...formData,
      id: editingId || Date.now().toString(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : undefined,
    } as Product;

    if (editingId) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    setIsFormOpen(false);
  };

  // Mock Camera View for "Scanning"
  const CameraView = () => (
      <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-sm aspect-[3/4] bg-gray-900 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.5)]">
             {/* Simulated Camera Feed */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 flex flex-col items-center justify-end pb-8">
                 <p className="text-white text-sm animate-pulse mb-4">Buscando código de barras...</p>
                 <div className="w-64 h-1 bg-red-500 shadow-[0_0_10px_red] animate-pulse"></div>
             </div>
             {/* Close Button */}
             <button onClick={() => setScannerOpen(false)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full text-white">
                 <X />
             </button>
          </div>
          <div className="mt-6 text-center text-white">
              <p className="mb-2">Simulación de Escáner</p>
              <button 
                onClick={() => {
                    const randomProd = products[Math.floor(Math.random() * products.length)];
                    setStockSearch(randomProd.internalCode);
                    setScannerOpen(false);
                }}
                className="bg-orange-600 px-6 py-3 rounded-xl font-bold"
              >
                  Simular "BIP" (Detectar Producto)
              </button>
          </div>
      </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24 font-sans">
      {scannerOpen && <CameraView />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-orange-100 gap-4">
        <h2 className="text-2xl font-bold text-orange-800 flex items-center gap-2">
            <Package /> Gestión El Puesto
        </h2>
        <div className="flex gap-2">
            <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === 'products' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                Productos
            </button>
            <button onClick={() => setActiveTab('stock')} className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === 'stock' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                Stock e Inventario
            </button>
        </div>
        <button onClick={onLogout} className="text-red-600 font-semibold hover:underline">
          Salir
        </button>
      </div>

      {activeTab === 'products' && (
        <>
            {/* Store Settings Quick Config */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-l-4 border-orange-500">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Estado del Puesto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Open/Close Toggle */}
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="font-medium">¿Está abierto?</span>
                      <button
                      onClick={() => onUpdateSettings({ ...settings, isOpen: !settings.isOpen })}
                      className={`px-4 py-2 rounded-full font-bold transition-colors ${
                          settings.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}
                      >
                      {settings.isOpen ? 'ABIERTO' : 'CERRADO'}
                      </button>
                  </div>

                  {/* Delivery Cost */}
                  <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Costo Envío ($)</label>
                      <input
                      type="number"
                      value={settings.deliveryCost}
                      onChange={(e) => onUpdateSettings({ ...settings, deliveryCost: Number(e.target.value) })}
                      className="w-full border-gray-300 border rounded-lg p-2"
                      />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">WhatsApp Avisos</label>
                      <input
                          type="text"
                          value={settings.whatsappNumber}
                          onChange={(e) => onUpdateSettings({ ...settings, whatsappNumber: e.target.value })}
                          className="w-full border-gray-300 border rounded-lg p-2"
                      />
                  </div>

                   {/* Profile Image */}
                   <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Foto Perfil (URL)</label>
                      <div className="flex gap-2">
                          <img src={settings.profileImage} className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-gray-200 border border-gray-300" />
                          <input
                              type="text"
                              value={settings.profileImage}
                              onChange={(e) => onUpdateSettings({ ...settings, profileImage: e.target.value })}
                              className="w-full border-gray-300 border rounded-lg p-2 text-xs truncate"
                              placeholder="https://..."
                          />
                      </div>
                  </div>

                </div>
            </div>

            {/* Products List */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Catálogo</h3>
                <button
                onClick={handleNew}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition shadow-md"
                >
                <Plus size={20} /> Nuevo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-center gap-4 border border-gray-100">
                    <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded-lg bg-gray-200" />
                    <div className="flex-1 text-center sm:text-left min-w-0">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                            <span className="text-xs font-mono bg-gray-200 px-1 rounded text-gray-600">{p.internalCode}</span>
                            <h4 className="font-bold text-gray-900 truncate">{p.title}</h4>
                        </div>
                        <p className="text-sm text-gray-500">{p.unit} - ${p.price} <span className="text-xs text-gray-400">| Stock: {p.stock}</span></p>
                    </div>
                    <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(p)}
                        className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => onDeleteProduct(p.id)}
                        className="p-2 text-red-600 bg-red-50 rounded-full hover:bg-red-100"
                    >
                        <Trash2 size={18} />
                    </button>
                    </div>
                </div>
                ))}
            </div>
        </>
      )}

      {activeTab === 'stock' && (
          <div className="bg-white rounded-xl shadow-md min-h-[500px] flex flex-col">
              <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                   <div className="relative flex-1 w-full">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                       <input 
                          type="text" 
                          placeholder="Buscar por Nombre, Código Interno o Barras..." 
                          className="w-full pl-10 pr-4 py-3 border rounded-xl bg-gray-50 focus:bg-white transition-colors"
                          value={stockSearch}
                          onChange={(e) => setStockSearch(e.target.value)}
                       />
                   </div>
                   <button 
                      onClick={() => setScannerOpen(true)}
                      className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors w-full md:w-auto justify-center"
                   >
                       <Camera size={20} /> Escanear
                   </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 text-sm">
                          <tr>
                              <th className="p-4">Producto</th>
                              <th className="p-4 text-center">Stock Actual</th>
                              <th className="p-4 text-right">Acciones</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {filteredStockProducts.map(p => (
                              <tr key={p.id} className="hover:bg-orange-50 transition-colors">
                                  <td className="p-4">
                                      <div className="flex items-center gap-3">
                                          <div className="hidden sm:block w-10 h-10 rounded bg-gray-200 overflow-hidden">
                                              <img src={p.image} className="w-full h-full object-cover" />
                                          </div>
                                          <div>
                                              <div className="font-bold text-gray-800">{p.title}</div>
                                              <div className="text-xs text-gray-500 font-mono">ID: {p.internalCode}</div>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="p-4 text-center">
                                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${p.stock === 0 ? 'bg-red-100 text-red-600' : p.stock < 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                          {p.stock}
                                      </span>
                                  </td>
                                  <td className="p-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                          <button 
                                            onClick={() => onUpdateProduct({...p, stock: Math.max(0, p.stock - 1)})}
                                            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                          >
                                              -
                                          </button>
                                          <button 
                                            onClick={() => onUpdateProduct({...p, stock: p.stock + 1})}
                                            className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center hover:bg-orange-200"
                                          >
                                              +
                                          </button>
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {filteredStockProducts.length === 0 && (
                      <div className="p-8 text-center text-gray-400">
                          No se encontraron productos.
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-6 text-orange-800">
              {editingId ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Código</label>
                    <input
                        type="text"
                        value={formData.internalCode}
                        onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
                        className="w-full border rounded-lg p-3 bg-gray-50 font-mono text-center"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                    <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full border rounded-lg p-3"
                    />
                  </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                    <label className="block text-sm font-bold text-gray-700">Descripción</label>
                    <button 
                        type="button" 
                        onClick={handleGenerateDescription}
                        disabled={loadingAI || !formData.title}
                        className="text-xs flex items-center gap-1 text-purple-600 font-bold hover:text-purple-800 disabled:opacity-50"
                    >
                        <Wand2 size={14}/> {loadingAI ? 'Pensando...' : 'IA Mágica'}
                    </button>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg p-3"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Precio</label>
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full border rounded-lg p-3"
                  />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Stock</label>
                   <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full border rounded-lg p-3 bg-blue-50"
                  />
                </div>
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Unidad</label>
                   <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitType })}
                        className="w-full border rounded-lg p-3 bg-white"
                    >
                        <option value="un">Unidad</option>
                        <option value="kg">Kilo</option>
                        <option value="pack">Pack</option>
                        <option value="lt">Litro</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full border rounded-lg p-3 bg-white"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cod. Barras</label>
                    <div className="relative">
                        <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            value={formData.barcode || ''}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                            className="w-full border rounded-lg pl-9 p-3"
                            placeholder="Escanee o ingrese"
                        />
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-2 py-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
                 <input 
                    type="checkbox" 
                    id="isPack" 
                    checked={formData.isPack} 
                    onChange={e => setFormData({...formData, isPack: e.target.checked})}
                    className="w-5 h-5 accent-orange-600"
                 />
                 <label htmlFor="isPack" className="font-medium text-gray-700">Es un Pack (Combo de productos)</label>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-orange-700 shadow-lg mt-4 flex justify-center items-center gap-2"
              >
                <Save size={20} /> Guardar Producto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;