'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Star, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, X, Loader2, PenLine } from 'lucide-react';
import { getReviewsByProduct, markReviewHelpful, addReview } from '@/lib/services/reviewService';
import { useAuthStore } from '@/store/authStore';
import type { Review } from '@/types';
import toast from 'react-hot-toast';

interface ProductReviewsProps {
  productId: string;
  initialRating?: number;
  initialReviewCount?: number;
}

const REVIEWS_PER_PAGE = 5;
const TOPICS = ['Product Quality', 'Seller Services', 'Product Price', 'Shipment', 'Match with Description'];

export function ProductReviews({ productId, initialRating = 0, initialReviewCount = 0 }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'photo' | 'description'>('all');
  const [page, setPage] = useState(1);

  // Write review modal state
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);
  const [form, setForm] = useState({
    rating: 0,
    title: '',
    body: '',
  });

  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true);
        const data = await getReviewsByProduct(productId, 'recent');
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [productId]);

  const distribution = useMemo(() => {
    const d = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      const idx = 5 - Math.round(r.rating);
      if (idx >= 0 && idx < 5) d[idx]++;
    });
    return d;
  }, [reviews]);

  const totalReviews = reviews.length || initialReviewCount;
  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : initialRating;

  const filteredReviews = useMemo(() => {
    let result = [...reviews];
    if (selectedRatings.length > 0) {
      result = result.filter(r => selectedRatings.includes(Math.round(r.rating)));
    }
    if (activeTab === 'photo') {
      result = result.filter(r => r.images && r.images.length > 0);
    } else if (activeTab === 'description') {
      result = result.filter(r => r.body && r.body.length > 50);
    }
    return result;
  }, [reviews, selectedRatings, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
  const paginatedReviews = filteredReviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

  const toggleRating = (star: number) => {
    setPage(1);
    setSelectedRatings(prev =>
      prev.includes(star) ? prev.filter(r => r !== star) : [...prev, star]
    );
  };

  const formatDate = (createdAt: any) => {
    try {
      const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to write a review.');
      return;
    }
    if (form.rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }
    if (form.body.trim().length < 10) {
      toast.error('Please write at least 10 characters in your review.');
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
        isVerifiedPurchase: false,
      });

      // Optimistically add to review list
      const newReview: Review = {
        id: Date.now().toString(),
        productId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userImage: user.photoURL || '',
        rating: form.rating,
        title: form.title.trim() || `${form.rating}-star review`,
        body: form.body.trim(),
        images: [],
        isVerifiedPurchase: false,
        helpful: 0,
        reported: false,
        createdAt: new Date() as any,
      };
      setReviews(prev => [newReview, ...prev]);
      setForm({ rating: 0, title: '', body: '' });
      setShowWriteReview(false);
      toast.success('Review submitted! Thank you.');
    } catch (err: any) {
      toast.error('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Rating Summary */}
      <div className="border border-dashed border-gray-200 rounded-xl p-5">
        <div className="flex gap-8 sm:gap-12">
          {/* Average Score */}
          <div className="flex flex-col items-center justify-center gap-2 min-w-[80px]">
            <div className="w-16 h-16 rounded-full border-2 border-amber-400 flex items-center justify-center">
              <span className="text-xl font-extrabold text-gray-800">{avgRating.toFixed(1)}</span>
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="text-amber-400" fill={i < Math.round(avgRating) ? 'currentColor' : 'none'} />
              ))}
            </div>
            <p className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
              {totalReviews >= 1000 ? `${(totalReviews / 1000).toFixed(1)}k` : totalReviews} reviews
            </p>
          </div>

          {/* Distribution Bars */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star, i) => {
              const count = distribution[i];
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2.5 text-sm">
                  <span className="text-[12px] text-gray-500 w-3 flex-shrink-0">{star}</span>
                  <Star size={12} className="text-amber-400 flex-shrink-0" fill="currentColor" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-800 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[12px] text-gray-400 w-5 text-right flex-shrink-0">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Write Review Button */}
          <div className="hidden sm:flex flex-col items-center justify-center">
            <button
              onClick={() => setShowWriteReview(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-[12px] font-bold uppercase tracking-widest rounded hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              <PenLine size={14} />
              Write a Review
            </button>
          </div>
        </div>

        {/* Mobile write review */}
        <div className="mt-4 sm:hidden">
          <button
            onClick={() => setShowWriteReview(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-black text-white text-[12px] font-bold uppercase tracking-widest rounded hover:bg-gray-800 transition-all"
          >
            <PenLine size={14} />
            Write a Review
          </button>
        </div>
      </div>

      {/* Main Layout: Filter + Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8">
        {/* Left Filters */}
        <aside className="space-y-5">
          <div className="border border-dashed border-gray-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[12px] font-bold text-gray-800 uppercase tracking-wide">Rating</h4>
            </div>
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1].map(star => (
                <label key={star} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => toggleRating(star)}
                    className={`w-4 h-4 border rounded flex-shrink-0 flex items-center justify-center cursor-pointer transition-all ${
                      selectedRatings.includes(star)
                        ? 'bg-amber-400 border-amber-400'
                        : 'border-gray-200 group-hover:border-amber-400'
                    }`}
                  >
                    {selectedRatings.includes(star) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(star)].map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" className="text-amber-400" />
                    ))}
                  </div>
                </label>
              ))}
            </div>
            {selectedRatings.length > 0 && (
              <button
                onClick={() => { setSelectedRatings([]); setPage(1); }}
                className="text-[11px] font-bold text-gray-400 hover:text-gray-800 transition-colors uppercase tracking-widest"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="border border-dashed border-gray-100 rounded-xl p-4 space-y-3">
            <h4 className="text-[12px] font-bold text-gray-800 uppercase tracking-wide">Topics</h4>
            <div className="space-y-2.5">
              {TOPICS.map(topic => (
                <label key={topic} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="w-4 h-4 border border-gray-200 rounded flex-shrink-0 group-hover:border-amber-400 transition-colors" />
                  <span className="text-[11px] text-amber-500 group-hover:text-amber-600 transition-colors font-medium">{topic}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right: Review List */}
        <div>
          {/* Tabs */}
          <div className="flex items-center gap-1.5 mb-5 flex-wrap">
            <span className="text-[12px] font-bold text-gray-500 mr-1">Review Lists</span>
            {[
              { key: 'all', label: 'All Reviews' },
              { key: 'photo', label: 'With Photo' },
              { key: 'description', label: 'With Description' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as any); setPage(1); }}
                className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all border ${
                  activeTab === tab.key
                    ? 'bg-white border-gray-200 text-gray-900 shadow-sm'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Review Cards */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block w-8 h-8 border-2 border-gray-200 border-t-amber-400 rounded-full animate-spin mb-3" />
              <p className="text-[13px] text-gray-400">Loading reviews...</p>
            </div>
          ) : paginatedReviews.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-gray-100 rounded-xl">
              <p className="text-[13px] text-gray-400 mb-4">No reviews yet. Be the first!</p>
              <button
                onClick={() => setShowWriteReview(true)}
                className="px-5 py-2 bg-black text-white text-[12px] font-bold uppercase tracking-widest rounded hover:bg-gray-800 transition-all"
              >
                Write a Review
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {paginatedReviews.map(review => (
                <div key={review.id} className="py-5 first:pt-0">
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className="text-amber-400" />
                    ))}
                  </div>
                  <h4 className="font-extrabold text-gray-900 text-[14px] mb-0.5 leading-snug">{review.title}</h4>
                  <p className="text-gray-400 text-[11px] mb-2">{formatDate(review.createdAt)}</p>
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-4">{review.body}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 overflow-hidden">
                        {review.userImage ? (
                          <img src={review.userImage} alt={review.userName} className="w-full h-full object-cover" />
                        ) : (
                          review.userName?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>
                      <span className="text-[12px] font-bold text-gray-700">{review.userName}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={async () => { await markReviewHelpful(review.id); }}
                        className="flex items-center gap-1 text-gray-400 hover:text-gray-700 transition-colors group"
                      >
                        <ThumbsUp size={14} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-semibold">{review.helpful || 0}</span>
                      </button>
                      <button className="text-gray-300 hover:text-gray-500 transition-colors">
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                if (totalPages > 7 && p !== 1 && p !== totalPages && (p < page - 1 || p > page + 1)) {
                  if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="text-gray-300 px-1 text-sm">...</span>;
                  }
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded border text-[12px] font-bold transition-all ${
                      page === p
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Write Review Modal */}
      {showWriteReview && (
        <div
          className="fixed inset-0 z-[998] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowWriteReview(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-[15px] font-extrabold text-gray-900 uppercase tracking-tight">Write a Review</h3>
              <button
                onClick={() => setShowWriteReview(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReview} className="px-6 py-5 space-y-4">
              {!user && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  <p className="text-[13px] text-amber-700 font-medium">
                    Please{' '}
                    <a href="/auth/login" className="font-bold underline">log in</a>
                    {' '}to submit a review.
                  </p>
                </div>
              )}

              {/* Star Rating Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-700 mb-2">
                  Your Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
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
                        size={28}
                        className={
                          star <= (hoverStar || form.rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200'
                        }
                        fill={star <= (hoverStar || form.rating) ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
                {form.rating > 0 && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-700 mb-1.5">
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
                <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-700 mb-1.5">
                  Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder="Share details about your experience with this product..."
                  rows={4}
                  minLength={10}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] focus:outline-none focus:border-black transition-colors resize-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">{form.body.length} characters (min. 10)</p>
              </div>

              {/* Submit */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowWriteReview(false)}
                  className="flex-1 py-3 border border-gray-200 text-[12px] font-bold text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !user || form.rating === 0}
                  className="flex-1 py-3 bg-black text-white text-[12px] font-bold uppercase tracking-widest rounded-lg hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
