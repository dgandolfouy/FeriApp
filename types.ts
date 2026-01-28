/** @copyright 2026 Daniel Gandolfo para Guten - Todos los derechos reservados */

export type UnitType = 'un' | 'kg' | '100g' | 'pack' | 'lt';

export interface Product {
  id: string;
  internalCode: string; // e.g., G0001
  barcode?: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number; // For promotions
  stock: number; // Inventory count
  unit: UnitType;
  image: string;
  category: string;
  isPack: boolean; // Is this a bundled pack?
  available: boolean;
  keywords?: string[]; // For smart search (e.g. ['champu', 'pelo'] for Shampoo)
}

export interface CartItem extends Product {
  quantity: number;
}

export interface StoreSettings {
  isOpen: boolean;
  locationName: string; // e.g., "Feria Villa Biarritz"
  deliveryCost: number;
  whatsappNumber: string; // For notifications
  profileImage: string; // URL of the seller's profile picture
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  notes: string;
  deliveryMethod: 'pickup' | 'delivery';
}