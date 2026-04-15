'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Truck, CreditCard, Wallet, CheckCircle2, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/formatters';
import { createOrder } from '@/lib/services/orderService';
import type { Address } from '@/types';
import toast from 'react-hot-toast';

type PaymentMethod = 'cod' | 'card' | 'wallet';

const defaultAddress: Omit<Address, 'id' | 'isDefault'> = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'Pakistan',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [address, setAddress] = useState(defaultAddress);
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [loading, setLoading] = useState(false);

  const subtotal = total();
  const shipping = subtotal >= 5000 ? 0 : 299;
  const grandTotal = subtotal + shipping;

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const required: (keyof typeof address)[] = ['fullName', 'phone', 'line1', 'city', 'province', 'postalCode'];
    for (const field of required) {
      if (!address[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (!/^03\d{9}$/.test(address.phone)) {
      toast.error('Phone must be a valid Pakistani number (03XXXXXXXXX)');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!validate()) return;

    setLoading(true);
    try {
      const fullAddress: Address = { ...address, id: crypto.randomUUID(), isDefault: false };
      const orderId = await createOrder({
        userId: user.uid,
        items,
        address: fullAddress,
        paymentMethod: payment,
      });
      clearCart();
      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <p className="text-[var(--neutral-500)] mb-6">Your cart is empty.</p>
        <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-[13px] font-bold uppercase tracking-widest hover:bg-black/90 transition-all">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Link href="/cart" className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[var(--neutral-400)] hover:text-black transition-colors">
          <ArrowLeft size={14} /> Back to Cart
        </Link>
        <div className="flex-1 h-px bg-[var(--border-default)]" />
        <h1 className="text-2xl font-black uppercase tracking-tight">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* ── Left: Form ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-10">

          {/* Delivery Address */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Truck size={18} strokeWidth={1.5} />
              <h2 className="text-[14px] font-bold uppercase tracking-widest">Delivery Address</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {([ 
                { name: 'fullName',   label: 'Full Name',    placeholder: 'Ahmed Ali' },
                { name: 'phone',      label: 'Phone',        placeholder: '03001234567' },
                { name: 'line1',      label: 'Address Line 1', placeholder: 'House / Street' },
                { name: 'line2',      label: 'Address Line 2 (optional)', placeholder: 'Apartment, Floor…' },
                { name: 'city',       label: 'City',         placeholder: 'Karachi' },
                { name: 'province',   label: 'Province',     placeholder: 'Sindh' },
                { name: 'postalCode', label: 'Postal Code',  placeholder: '75500' },
              ] as const).map(({ name, label, placeholder }) => (
                <div key={name} className={name === 'line1' || name === 'line2' ? 'sm:col-span-2' : ''}>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-[var(--neutral-500)] mb-1">{label}</label>
                  <input
                    type="text"
                    name={name}
                    value={(address as any)[name]}
                    onChange={handleField}
                    placeholder={placeholder}
                    className="w-full h-11 border border-[var(--border-default)] px-4 text-[14px] focus:outline-none focus:border-black transition-colors bg-white"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Payment Method */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <CreditCard size={18} strokeWidth={1.5} />
              <h2 className="text-[14px] font-bold uppercase tracking-widest">Payment Method</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {([
                { id: 'cod',    label: 'Cash on Delivery', icon: Truck },
                { id: 'card',   label: 'Credit / Debit Card', icon: CreditCard },
                { id: 'wallet', label: 'Digital Wallet', icon: Wallet },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPayment(id)}
                  className={`flex flex-col items-center justify-center gap-2 p-5 border text-center transition-all ${
                    payment === id
                      ? 'border-black bg-black text-white'
                      : 'border-[var(--border-default)] bg-white text-[var(--neutral-600)] hover:border-black'
                  }`}
                >
                  <Icon size={20} strokeWidth={1.5} />
                  <span className="text-[12px] font-bold uppercase tracking-widest">{label}</span>
                </button>
              ))}
            </div>
            {payment === 'card' && (
              <p className="mt-4 text-[12px] text-[var(--neutral-500)] border border-[var(--border-default)] p-4 bg-[var(--neutral-50)]">
                🔒 Secure card processing coming soon. Use COD for now.
              </p>
            )}
          </section>
        </div>

        {/* ── Right: Summary ───────────────────────────────── */}
        <div className="border border-[var(--border-default)] bg-white p-6 h-fit sticky top-24 space-y-5">
          <h2 className="text-[14px] font-bold uppercase tracking-widest">Order Summary</h2>

          {/* Items */}
          <div className="space-y-3 border-b border-[var(--border-default)] pb-5">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-3">
                <div className="w-12 h-12 relative border border-[var(--border-default)] flex-shrink-0 bg-[var(--neutral-50)]">
                  <Image src={item.image} alt={item.name} fill sizes="48px" className="object-contain p-1 mix-blend-multiply" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-black uppercase truncate">{item.name}</p>
                  <p className="text-[11px] text-[var(--neutral-500)]">×{item.qty}</p>
                </div>
                <span className="text-[13px] font-bold tabular-nums">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-[var(--neutral-500)]">Subtotal</span>
              <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--neutral-500)]">Shipping</span>
              <span className="font-medium tabular-nums">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>
          </div>

          <div className="flex justify-between text-[18px] font-extrabold text-black tracking-tighter border-t border-[var(--border-default)] pt-4">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(grandTotal)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full h-14 bg-black text-white text-[13px] font-bold uppercase tracking-widest hover:bg-black/90 transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Placing Order…</>
            ) : (
              <><CheckCircle2 size={16} /> Place Order</>
            )}
          </button>

          <p className="text-[11px] text-center text-[var(--neutral-400)]">
            By placing your order you agree to our Terms &amp; Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
