'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/formatters';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQty, total, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please sign in to checkout');
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <ShoppingCart size={64} className="mx-auto text-[var(--neutral-200)] mb-6" strokeWidth={1} />
        <h1 className="text-3xl font-bold text-black uppercase tracking-tight mb-4">Your Basket is Empty</h1>
        <p className="text-[var(--neutral-500)] mb-8">Add some items to get started.</p>
        <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-[13px] font-bold uppercase tracking-widest hover:bg-black/90 transition-all">
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-black uppercase tracking-tight">
          Your Basket <span className="text-[var(--neutral-400)] font-medium">({items.length})</span>
        </h1>
        <button onClick={clearCart} className="text-[12px] font-bold text-[var(--neutral-400)] uppercase tracking-widest hover:text-black transition-colors">
          Clear All
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 p-4 border border-[var(--border-default)] bg-white">
              <Link href={`/products/${item.productId}`} className="w-24 h-24 relative bg-[var(--neutral-50)] flex-shrink-0">
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-contain mix-blend-multiply p-1" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <h3 className="text-[14px] font-bold text-black uppercase tracking-tight line-clamp-1">{item.name}</h3>
                  <button onClick={() => removeItem(item.productId, item.variantId)} className="text-[var(--neutral-300)] hover:text-black transition-colors flex-shrink-0" aria-label="Remove">
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
                {item.variant && <p className="text-[12px] text-[var(--neutral-500)] mt-1">{item.variant}</p>}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-black">
                    <button onClick={() => updateQty(item.productId, item.qty - 1, item.variantId)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--neutral-100)] border-r border-black">
                      <Minus size={12} />
                    </button>
                    <span className="px-4 text-[13px] font-bold tabular-nums">{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1, item.variantId)} disabled={item.qty >= item.stock} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--neutral-100)] border-l border-black disabled:opacity-40">
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-[16px] font-extrabold text-black tabular-nums">{formatPrice(item.price * item.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border border-[var(--border-default)] bg-white p-6 h-fit space-y-4 sticky top-24">
          <h2 className="text-[14px] font-bold uppercase tracking-widest text-black">Order Summary</h2>
          <div className="space-y-2 border-b border-[var(--border-default)] pb-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-[13px]">
                <span className="text-[var(--neutral-500)] truncate max-w-[160px]">{item.name} ×{item.qty}</span>
                <span className="font-medium tabular-nums">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[13px] font-bold uppercase tracking-widest">
            <span className="text-[var(--neutral-500)]">Delivery</span>
            <span>{total() >= 5000 ? 'FREE' : formatPrice(299)}</span>
          </div>
          <div className="flex justify-between text-[18px] font-extrabold text-black tracking-tighter border-t border-[var(--border-default)] pt-4">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(total() >= 5000 ? total() : total() + 299)}</span>
          </div>
          {total() < 5000 && (
            <p className="text-[12px] text-[var(--neutral-500)] text-center">
              Add {formatPrice(5000 - total())} more for free delivery
            </p>
          )}
          <button onClick={handleCheckout} className="w-full h-14 bg-black text-white text-[13px] font-bold uppercase tracking-widest hover:bg-black/90 transition-all active:scale-[0.99] flex items-center justify-center gap-2">
            Proceed to Checkout <ArrowRight size={16} />
          </button>
          <Link href="/products" className="block text-center text-[12px] font-bold text-[var(--neutral-400)] uppercase tracking-widest hover:text-black transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
