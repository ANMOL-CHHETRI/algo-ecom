export type Role = 'CUSTOMER' | 'ADMIN' | 'COURIER';

export type OrderStatus =
  | 'PLACED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'ESEWA' | 'KHALTI' | 'FONEPAY';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
export type BatchStatus = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'COMPLETED';
export type DeliveryStatus = 'PENDING' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
export type NodeType = 'DEPOT' | 'INTERSECTION' | 'CUSTOMER_STOP';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  address?: string | null;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    products: number;
  };
}

export interface ProductFeature {
  id: string;
  productId: string;
  featureKey: string;
  featureValue: string;
  weight: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  status: ProductStatus;
  images: string[];
  brand?: string | null;
  categoryId: string;
  category: Category;
  features?: ProductFeature[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  totalAmount: number;
  deliveryCharge: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryAddress: string;
  deliveryPhone: string;
  roadNodeId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
  };
  roadNode?: RoadNode | null;
  items: OrderItem[];
  delivery?: Delivery | null;
}

export interface RoadNode {
  id: string;
  name: string;
  nodeType: NodeType;
  latitude: number;
  longitude: number;
}

export interface RoadEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  distanceKm: number;
  bidirectional: boolean;
  fromNode?: RoadNode;
  toNode?: RoadNode;
}

export interface DeliveryStop {
  id: string;
  batchId: string;
  roadNodeId: string;
  stopSequence: number;
  estimatedDistanceKm?: number | null;
  isCompleted: boolean;
  roadNode: RoadNode;
}

export interface Delivery {
  id: string;
  batchId: string;
  orderId: string;
  courierId?: string | null;
  status: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
  order?: Order;
  courier?: User | null;
}

export interface DeliveryBatch {
  id: string;
  batchNumber: string;
  status: BatchStatus;
  courierId?: string | null;
  totalDistanceKm?: number | null;
  algorithmLog?: any;
  createdAt: string;
  updatedAt: string;
  courier?: User | null;
  deliveries: Delivery[];
  stops: DeliveryStop[];
}

export interface ExplanationItem {
  dimension: string;
  aValue: number;
  bValue: number;
  product: number;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  images: string[];
  brand?: string | null;
  category: Category;
  similarity: number;
  explanation: ExplanationItem[];
  targetVector?: number[];
  productVector?: number[];
}

export function formatNPR(amount: number): string {
  return `Rs. ${new Intl.NumberFormat('en-IN').format(Math.round(amount))}`;
}
