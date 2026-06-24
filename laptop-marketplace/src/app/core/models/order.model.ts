/** Future e-commerce models - backend ready */

export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled';
export type PaymentMethod = 'razorpay' | 'phonepe' | 'upi' | 'card' | 'netbanking' | 'cash';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId?: string;
  items: CartItem[];
  totalAmount: number;
  bookingAmount?: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paymentId?: string;
  deliveryAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingFlow {
  productId: string;
  bookingAmount: number;
  customerName: string;
  mobile: string;
  email: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  maxDiscount: number;
  validUntil: string;
  active: boolean;
}

export interface EmiPlan {
  id: string;
  months: number;
  interestRate: number;
  minAmount: number;
}
