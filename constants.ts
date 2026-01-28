/** @copyright 2026 Daniel Gandolfo para Guten - Todos los derechos reservados */

import { Product, StoreSettings } from './types';

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  isOpen: true,
  locationName: "Feria de los Domingos - Puesto 42",
  deliveryCost: 200,
  whatsappNumber: "59899123456",
  // Updated image: Caucasian man, white messy hair, intense blue eyes, informal, smiling.
  // Closest match to "El Griego" description.
  profileImage: "https://images.unsplash.com/photo-1581456495146-65a71b2c8e52?auto=format&fit=crop&q=80&w=600"
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    internalCode: 'G0001',
    barcode: '7730001',
    title: 'Shampoo Herbal 400ml',
    description: 'Brillo intenso y aroma natural para toda la familia.',
    price: 350,
    stock: 12,
    unit: 'un',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=300',
    category: 'Higiene',
    isPack: false,
    available: true,
    keywords: ['champu', 'pelo', 'cabello', 'lavar']
  },
  {
    id: '2',
    internalCode: 'G0002',
    barcode: '7730002',
    title: 'Aceite de Oliva Extra Virgen',
    description: 'Primera prensada en frío. Acidez menor a 0.5%.',
    price: 480,
    oldPrice: 550,
    stock: 8,
    unit: 'lt',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=300',
    category: 'Almacén',
    isPack: false,
    available: true,
    keywords: ['cocina', 'aderezo', 'ensalada', 'aceituna']
  },
  {
    id: '3',
    internalCode: 'G0003',
    barcode: '7730003',
    title: 'Arroz Blanco Premium 1kg',
    description: 'Grano largo y fino, no se pasa nunca.',
    price: 95,
    stock: 50,
    unit: 'un',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300',
    category: 'Almacén',
    isPack: false,
    available: true,
    keywords: ['guiso', 'comida', 'grano']
  },
  {
    id: '4',
    internalCode: 'G0004',
    barcode: '7730004',
    title: 'Pack Desayuno Completo',
    description: 'Incluye: Café, Azúcar y 2 Paquetes de Galletitas.',
    price: 450,
    oldPrice: 520,
    stock: 5,
    unit: 'pack',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80&w=300',
    category: 'Packs',
    isPack: true,
    available: true,
    keywords: ['oferta', 'promo', 'cafe', 'mañana']
  },
  {
    id: '5',
    internalCode: 'G0005',
    barcode: '7730005',
    title: 'Fideos Tallarines al Huevo',
    description: 'Pasta seca estilo casero, cocción en 8 minutos.',
    price: 85,
    stock: 24,
    unit: 'un',
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=300',
    category: 'Almacén',
    isPack: false,
    available: true,
    keywords: ['pasta', 'italiana', 'harina']
  },
  {
    id: '6',
    internalCode: 'G0006',
    barcode: '7730006',
    title: 'Jabón Líquido para Ropa 3L',
    description: 'Limpieza profunda y perfume duradero.',
    price: 290,
    stock: 10,
    unit: 'un',
    image: 'https://images.unsplash.com/photo-1585833816754-144c4f3a743c?auto=format&fit=crop&q=80&w=300',
    category: 'Limpieza',
    isPack: false,
    available: true,
    keywords: ['lavado', 'ropa', 'detergente', 'suavizante']
  },
  {
    id: '7',
    internalCode: 'G0007',
    barcode: '7730007',
    title: 'Pack Limpieza Total',
    description: 'Lavandina 2L + Detergente 1L + Esponja.',
    price: 180,
    oldPrice: 220,
    stock: 15,
    unit: 'pack',
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=300',
    category: 'Packs',
    isPack: true,
    available: true,
    keywords: ['oferta', 'combo', 'casa']
  }
];

export const CATEGORIES = ['Almacén', 'Limpieza', 'Higiene', 'Bebidas', 'Packs', 'Otros'];