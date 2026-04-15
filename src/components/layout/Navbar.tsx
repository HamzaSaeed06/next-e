'use client';

import { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/lib/services/authService';
import toast from 'react-hot-toast';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { items, openCart } = useCartStore();
  const { user, role, logout } = useAuthStore();
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  const isAdmin = role === 'admin' || role === 'manager';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
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
          ? 'bg-white/90 backdrop-blur-md border-[var(--border-default)]'
          : 'bg-white/90 backdrop-blur-md border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 group">
          <div className="flex flex-col items-start leading-none">
            <span className="text-lg font-bold text-black uppercase tracking-[0.2em]">ZEST</span>
            <span className="text-[10px] font-medium text-[var(--neutral-500)] uppercase tracking-[0.3em] mt-0.5 group-hover:text-black transition-colors">
              &amp; PARTNERS
            </span>
          </div>
        </Link>

        {/* Center Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 h-9 text-sm border border-[var(--border-default)] bg-[var(--bg-secondary)] focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/wishlist"
            className="w-10 h-10 items-center justify-center text-black hover:bg-[var(--neutral-100)] transition-colors hidden sm:flex"
          >
            <Heart size={20} strokeWidth={1} />
          </Link>

          <motion.button
            onClick={openCart}
            className="w-10 h-10 flex items-center justify-center text-black hover:bg-[var(--neutral-100)] transition-colors relative"
            whileTap={{ scale: 0.95 }}
            aria-label="Open cart"
          >
            <ShoppingBag size={20} strokeWidth={1} />
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 tabular-nums"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <div className="hidden sm:block w-px h-5 bg-slate-200 mx-2" />

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pr-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-full hover:bg-[var(--bg-secondary)]"
              >
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-medium text-sm overflow-hidden">
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    user.displayName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg border border-[var(--border-default)] py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-[var(--neutral-100)]">
                      <p className="text-sm font-medium text-black truncate">{user.displayName || 'User'}</p>
                      <p className="text-xs text-[var(--neutral-400)] truncate">{user.email}</p>
                    </div>

                    {!isAdmin && (
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--neutral-600)] hover:text-black hover:bg-[var(--neutral-50)] transition-colors"
                      >
                        <Package className="w-4 h-4" /> My Orders
                      </Link>
                    )}

                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-black font-bold hover:bg-[var(--neutral-50)] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </Link>
                        <Link
                          href="/admin/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--neutral-600)] hover:text-black hover:bg-[var(--neutral-50)] transition-colors"
                        >
                          <Package className="w-4 h-4" /> Manage Orders
                        </Link>
                      </>
                    )}

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--neutral-600)] hover:text-black hover:bg-[var(--neutral-50)] transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden sm:flex items-center gap-2 px-5 py-2 bg-black text-white text-[13px] font-bold hover:bg-black/90 transition-all"
            >
              Sign In
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-black md:hidden hover:bg-[var(--neutral-50)] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[var(--border-default)] md:hidden"
          >
            <div className="px-6 py-4 space-y-4 bg-white">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 h-9 text-sm border border-[var(--border-default)] bg-[var(--bg-secondary)] focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </form>

              <nav className="space-y-1">
                {[
                  { href: '/products', label: 'All Products' },
                  { href: '/wishlist', label: 'Wishlist' },
                  ...(user ? [] : [{ href: '/auth/login', label: 'Sign In' }]),
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-black transition-colors"
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
