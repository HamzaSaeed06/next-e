'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  LayoutDashboard,
  Search,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/lib/services/authService';
import { NotificationBell } from '@/components/layout/NotificationBell';
import toast from 'react-hot-toast';

const TRENDING_SEARCHES = [
  'Sneakers',
  'Summer Dress',
  'Wireless Headphones',
  'Skincare',
  'Laptop Bag',
  'Watch',
];

const RECENT_KEY = 'zest_recent_searches';

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  try {
    const existing = getRecentSearches().filter(q => q !== query);
    const updated = [query, ...existing].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
}

interface SearchDropdownProps {
  query: string;
  onSelect: (q: string) => void;
  onClose: () => void;
}

function SearchDropdown({ query, onSelect, onClose }: SearchDropdownProps) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  const suggestions = query.length > 1
    ? TRENDING_SEARCHES.filter(t => t.toLowerCase().includes(query.toLowerCase()))
    : [];

  const showTrending = query.length === 0;
  const showRecent = query.length === 0 && recent.length > 0;
  const hasSomething = suggestions.length > 0 || showTrending || showRecent;

  if (!hasSomething) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50 origin-top"
    >
      {suggestions.length > 0 && (
        <div className="p-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1.5">
            Suggestions
          </p>
          {suggestions.map((s) => (
            <button
              key={s}
              onMouseDown={() => onSelect(s)}
              className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <Search size={13} className="text-gray-400 flex-shrink-0" />
              <span>
                {s.toLowerCase().indexOf(query.toLowerCase()) !== -1 ? (
                  <>
                    {s.slice(0, s.toLowerCase().indexOf(query.toLowerCase()))}
                    <strong className="text-black">{s.slice(s.toLowerCase().indexOf(query.toLowerCase()), s.toLowerCase().indexOf(query.toLowerCase()) + query.length)}</strong>
                    {s.slice(s.toLowerCase().indexOf(query.toLowerCase()) + query.length)}
                  </>
                ) : s}
              </span>
            </button>
          ))}
        </div>
      )}

      {showRecent && (
        <div className="p-2 border-t border-gray-100">
          <div className="flex items-center justify-between px-3 py-1.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent</p>
            <button
              onMouseDown={() => { localStorage.removeItem(RECENT_KEY); setRecent([]); }}
              className="text-[10px] text-gray-400 hover:text-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
          {recent.map((r) => (
            <button
              key={r}
              onMouseDown={() => onSelect(r)}
              className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <Clock size={13} className="text-gray-400 flex-shrink-0" />
              <span>{r}</span>
            </button>
          ))}
        </div>
      )}

      {showTrending && (
        <div className="p-2 border-t border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1.5">
            Trending
          </p>
          <div className="flex flex-wrap gap-1.5 px-3 py-1.5">
            {TRENDING_SEARCHES.map((t) => (
              <button
                key={t}
                onMouseDown={() => onSelect(t)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-black hover:text-white text-gray-600 text-[11px] font-semibold rounded-full transition-all"
              >
                <TrendingUp size={10} />
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 px-3 py-2">
        <button
          onMouseDown={() => onSelect(query || '')}
          className="w-full flex items-center justify-between text-[12px] text-gray-500 hover:text-black transition-colors py-1"
        >
          <span>{query ? `Search for "${query}"` : 'Browse all products'}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { items, openCart } = useCartStore();
  const { user, logout } = useAuthStore();
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const doSearch = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      router.push('/products');
    } else {
      saveRecentSearch(trimmed);
      router.push(`/products?q=${encodeURIComponent(trimmed)}`);
    }
    setSearchQuery('');
    setSearchFocused(false);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
  }, [router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(searchQuery);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      logout();
      setUserMenuOpen(false);
      router.push('/');
      toast.success('Signed out successfully');
    } catch {
      toast.error('Error signing out');
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 border-b ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-[var(--border-default)] shadow-sm'
          : 'bg-white/95 backdrop-blur-md border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16 gap-3">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 group">
          <div className="flex flex-col items-start leading-none">
            <span className="text-lg font-bold text-black uppercase tracking-[0.2em]">ZEST</span>
            <span className="text-[10px] font-medium text-[var(--neutral-500)] uppercase tracking-[0.3em] mt-0.5 group-hover:text-black transition-colors">
              &amp; PARTNERS
            </span>
          </div>
        </Link>

        {/* Center Search — Desktop */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-lg mx-4 relative">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full pl-9 pr-10 h-10 text-[13px] border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all rounded-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </form>
          <AnimatePresence>
            {searchFocused && (
              <SearchDropdown
                query={searchQuery}
                onSelect={doSearch}
                onClose={() => setSearchFocused(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Mobile search toggle */}
          <button
            onClick={() => setMobileSearchOpen(o => !o)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-black hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Search"
          >
            <Search size={19} strokeWidth={1.5} />
          </button>

          <Link
            href="/wishlist"
            className="w-9 h-9 sm:w-10 sm:h-10 items-center justify-center text-black hover:bg-gray-100 rounded-lg transition-colors hidden sm:flex"
          >
            <Heart size={19} strokeWidth={1.5} />
          </Link>

          <NotificationBell />

          <motion.button
            onClick={openCart}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-black hover:bg-gray-100 rounded-lg transition-colors relative"
            whileTap={{ scale: 0.95 }}
            aria-label="Open cart"
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-1 right-1 min-w-[16px] h-[16px] bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 tabular-nums"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="hidden sm:block w-px h-5 bg-slate-200 mx-1.5" />

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1 pr-2 text-gray-600 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
              >
                <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-white font-medium text-xs overflow-hidden">
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    user.displayName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium max-w-[80px] truncate">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white shadow-xl border border-gray-100 rounded-xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-bold text-black truncate">{user.displayName || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/account/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                    >
                      <Package className="w-4 h-4" /> My Orders
                    </Link>

                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-black font-bold hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                    </Link>

                    <Link
                      href="/account/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Profile Settings
                    </Link>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black text-white text-[12px] font-bold hover:bg-black/90 transition-all rounded-lg"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-black md:hidden hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100 md:hidden bg-white"
          >
            <div className="px-4 py-3 relative">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    autoFocus
                    className="w-full pl-9 pr-10 h-10 text-[13px] border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-black rounded-lg transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </form>
              <AnimatePresence>
                {searchFocused && (
                  <SearchDropdown
                    query={searchQuery}
                    onSelect={doSearch}
                    onClose={() => setSearchFocused(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Trending tags in mobile */}
            {!searchQuery && (
              <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                {TRENDING_SEARCHES.slice(0, 4).map(t => (
                  <button
                    key={t}
                    onClick={() => doSearch(t)}
                    className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-semibold rounded-full hover:bg-black hover:text-white transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100 md:hidden"
          >
            <div className="px-4 py-4 space-y-1 bg-white">
              <nav className="space-y-0.5">
                {[
                  { href: '/products', label: 'All Products' },
                  { href: '/products?sort=popular', label: 'Trending' },
                  { href: '/products?sort=newest', label: 'New Arrivals' },
                  { href: '/products?flash=true', label: '⚡ Flash Sale' },
                  { href: '/wishlist', label: 'Wishlist' },
                  ...(user ? [{ href: '/account/orders', label: 'My Orders' }] : []),
                  ...(user ? [] : [{ href: '/auth/login', label: 'Sign In' }]),
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
