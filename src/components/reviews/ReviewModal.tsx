'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, Star, Loader2 } from 'lucide-react';
import { addReview } from '@/lib/services/reviewService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface ReviewModalProps {
  productId: string;
  productName: string;
  productImage: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ productId, productName, productImage, onClose, onSuccess }: ReviewModalProps) {
  const { user } = useAuthStore();
  const [hoverStar, setHoverStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    rating: 0,
    title: '',
    body: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a review.');
      return;
    }
    if (form.rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }
    if (form.body.trim().length < 10) {
      toast.error('Please write at least 10 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await addReview({
        productId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userImage: user.photoURL || '',
        rating: form.rating,
        title: form.title.trim() || `${form.rating}-star review`,
        body: form.body.trim(),
        images: [],
        isVerifiedPurchase: true,
      });
      toast.success('Review submitted! Thank you.');
      onSuccess();
    } catch {
      toast.error('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div
      className="fixed inset-0 z-[998] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-extrabold text-gray-900">Rate Your Purchase</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product info */}
        <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-b border-gray-100">
          {productImage && (
            <div className="w-12 h-12 relative bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
              <Image src={productImage} alt={productName} fill className="object-contain p-1 mix-blend-multiply" />
            </div>
          )}
          <p className="text-[13px] font-bold text-gray-800 line-clamp-2">{productName}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-2">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, rating: star }))}
                  onMouseEnter={() => setHoverStar(star)}
                  onMouseLeave={() => setHoverStar(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={30}
                    fill={star <= (hoverStar || form.rating) ? 'currentColor' : 'none'}
                    className={star <= (hoverStar || form.rating) ? 'text-amber-400' : 'text-gray-200'}
                  />
                </button>
              ))}
            </div>
            {(hoverStar || form.rating) > 0 && (
              <p className="text-[12px] text-amber-600 font-semibold">
                {ratingLabels[hoverStar || form.rating]}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-1.5">
              Review Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Summarize your experience"
              maxLength={100}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-1.5">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="How was the quality, fit, or performance? Share details..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-black transition-colors resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1">{form.body.length} chars (min. 10)</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-200 text-[12px] font-bold text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || form.rating === 0}
              className="flex-1 py-3 bg-black text-white text-[12px] font-bold uppercase tracking-widest rounded-lg hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
