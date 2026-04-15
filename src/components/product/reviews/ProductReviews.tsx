'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Star, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getReviewsByProduct, markReviewHelpful } from '@/lib/services/reviewService';
import type { Review } from '@/types';

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

  // Filter/Sort State
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'photo' | 'description'>('all');
  const [page, setPage] = useState(1);

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

  // Derived Stats
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

  // Filtered Reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by rating
    if (selectedRatings.length > 0) {
      result = result.filter(r => selectedRatings.includes(Math.round(r.rating)));
    }

    // Filter by tab
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
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Rating Summary Bar ─────────────────────────────────────── */}
      <div className="border border-dashed border-gray-200 rounded-xl p-6">
        <div className="flex gap-12">
          {/* Average Score */}
          <div className="flex flex-col items-center justify-center gap-2 min-w-[80px]">
            <div className="w-16 h-16 rounded-full border-2 border-amber-400 flex items-center justify-center">
              <span className="text-xl font-extrabold text-gray-800">{avgRating.toFixed(1)}</span>
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="text-amber-400" fill={i < Math.round(avgRating) ? "currentColor" : "none"} />
              ))}
            </div>
            <p className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
              from {totalReviews >= 1000 ? `${(totalReviews / 1000).toFixed(2)}k` : totalReviews} reviews
            </p>
          </div>

          {/* Distribution Bars */}
          <div className="flex-1 space-y-2.5">
            {[5, 4, 3, 2, 1].map((star, i) => {
              const count = distribution[i];
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="text-[12px] text-gray-500 w-3">{star}</span>
                  <Star size={13} className="text-amber-400 flex-shrink-0" fill="currentColor" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-800 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[12px] text-gray-400 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Layout: Filter (Left) + Reviews (Right) ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        {/* Left: Filters */}
        <aside className="space-y-6">
          {/* Rating Filter */}
          <div className="border border-dashed border-gray-100 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[13px] font-bold text-gray-800">Rating</h4>
              <span className="text-gray-400 text-xs">∧</span>
            </div>
            <div className="space-y-3">
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
                      <Star key={i} size={13} fill="currentColor" className="text-amber-400" />
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

          {/* Topics Filter */}
          <div className="border border-dashed border-gray-100 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[13px] font-bold text-gray-800">Review Topics</h4>
              <span className="text-gray-400 text-xs">∧</span>
            </div>
            <div className="space-y-3">
              {TOPICS.map(topic => (
                <label key={topic} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="w-4 h-4 border border-gray-200 rounded flex-shrink-0 group-hover:border-amber-400 transition-colors" />
                  <span className="text-[12px] text-amber-500 group-hover:text-amber-600 transition-colors font-medium">{topic}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right: Review List */}
        <div className="space-y-0">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[13px] font-bold text-gray-600 mr-1">Review Lists</span>
            {[
              { key: 'all', label: 'All Reviews' },
              { key: 'photo', label: 'With Photo & Video' },
              { key: 'description', label: 'With Description' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as any); setPage(1); }}
                className={`px-4 py-1.5 rounded text-[12px] font-bold transition-all border ${
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
              <p className="text-[13px] text-gray-400">No reviews match the current filter.</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-gray-50">
              {paginatedReviews.map(review => (
                <div key={review.id} className="py-6 first:pt-0">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill={i < review.rating ? "currentColor" : "none"} className="text-amber-400" />
                    ))}
                  </div>

                  {/* Title + Date */}
                  <h4 className="font-extrabold text-gray-900 text-[15px] mb-1 tracking-tight">{review.title}</h4>
                  <p className="text-gray-400 text-[11px] mb-3">{formatDate(review.createdAt)}</p>

                  {/* Body */}
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-5">{review.body}</p>

                  {/* User row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600 overflow-hidden">
                        {review.userImage ? (
                          <img src={review.userImage} alt={review.userName} className="w-full h-full object-cover" />
                        ) : (
                          review.userName?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>
                      <span className="text-[13px] font-bold text-gray-700">{review.userName}</span>
                    </div>

                    {/* Helpful Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          await markReviewHelpful(review.id);
                        }}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 transition-colors group"
                      >
                        <ThumbsUp size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[12px] font-semibold">{review.helpful || 0}</span>
                      </button>
                      <button className="text-gray-300 hover:text-gray-500 transition-colors">
                        <ThumbsDown size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination ─────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 pt-8">
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
                    className={`w-8 h-8 flex items-center justify-center rounded border text-[13px] font-bold transition-all ${
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
    </div>
  );
}
