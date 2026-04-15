'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/utils/formatters';
import toast from 'react-hot-toast';
import Image from 'next/image';

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, closeCart, removeItem, updateQty, total } = useCartStore();
  const { user } = useAuthStore();

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please sign in to checkout');
      closeCart();
      router.push('/auth/login');
      return;
    }
    closeCart();
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-default)]">
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-black">
                Your Basket
                {items.length > 0 && (
                  <span className="ml-2 text-[var(--neutral-400)] font-medium">
                    ({items.length})
                  </span>
                )}
              </h2>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-[var(--neutral-100)] transition-colors rounded-sm"
                aria-label="Close cart"
              >
                <X size={20} className="text-black" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <ShoppingCart size={48} className="text-[var(--neutral-200)] mb-6" strokeWidth={1} />
                  <p className="text-[14px] font-bold text-black uppercase tracking-widest mb-4">
                    Your basket is empty
                  </p>
                  <Link
                    href="/products"
                    onClick={closeCart}
                    className="px-8 py-3 border border-black text-[12px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                  >
                    Go Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex gap-4 items-start pb-6 border-b border-[var(--neutral-100)] last:border-0 last:pb-0"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 bg-[var(--neutral-50)] border border-[var(--neutral-100)] shrink-0 overflow-hidden relative">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain mix-blend-multiply p-1"
                          sizes="80px"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 py-0.5">
                        <h3 className="text-[13px] font-bold text-black uppercase tracking-tight line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-[var(--neutral-500)] font-medium mt-1">
                          {item.variant || 'Standard'}
                        </p>
                        <div className="flex justify-between items-center mt-3">
                          {/* Qty Control */}
                          <div className="flex items-center border border-black overflow-hidden">
                            <button
                              onClick={() => updateQty(item.productId, item.qty - 1, item.variantId)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-[var(--neutral-100)] transition-colors border-r border-black"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-4 text-[13px] font-bold tabular-nums">{item.qty}</span>
                            <button
                              onClick={() => updateQty(item.productId, item.qty + 1, item.variantId)}
                              disabled={item.qty >= item.stock}
                              className="w-8 h-8 flex items-center justify-center hover:bg-[var(--neutral-100)] transition-colors disabled:opacity-50 border-l border-black"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-[14px] font-bold text-black tabular-nums">
                            {formatPrice(item.price * item.qty)}
                          </span>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-[var(--neutral-300)] hover:text-black transition-colors mt-0.5"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[var(--border-default)] px-6 py-8 space-y-6 bg-white">
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px] uppercase tracking-widest font-bold">
                    <span className="text-[var(--neutral-500)]">Subtotal</span>
                    <span className="text-black tabular-nums">{formatPrice(total())}</span>
                  </div>
                  <div className="flex justify-between text-[13px] uppercase tracking-widest font-bold">
                    <span className="text-[var(--neutral-500)]">Delivery</span>
                    <span className="text-black">{total() >= 5000 ? 'FREE' : 'STANDARD'}</span>
                  </div>
                  <div className="h-px bg-[var(--neutral-100)] my-4" />
                  <div className="flex justify-between text-[18px] font-bold text-black tracking-tighter">
                    <span>Total</span>
                    <span className="tabular-nums">{formatPrice(total())}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full h-14 bg-black text-white text-[13px] font-bold uppercase tracking-widest hover:bg-black/90 transition-all active:scale-[0.99]"
                >
                  Checkout Now
                </button>
                <p
                  onClick={closeCart}
                  className="text-center text-[11px] font-bold text-[var(--neutral-400)] uppercase tracking-widest cursor-pointer hover:text-black transition-colors"
                >
                  Continue Shopping
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
