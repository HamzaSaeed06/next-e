'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ChevronDown, Search, Package, Sparkles, ShoppingBag } from 'lucide-react';
import { getStoreSettings } from '@/lib/services/storeSettingsService';
import { getProducts } from '@/lib/services/productService';
import { formatPrice } from '@/utils/formatters';
import type { StoreSettings, Product } from '@/types';
import Link from 'next/link';

interface Message {
  id: string;
  from: 'bot' | 'user';
  text: string;
  options?: string[];
  products?: Product[];
  link?: { href: string; label: string };
}

const QUICK_OPTIONS = [
  '📦 Track My Order',
  '🚚 Shipping & Delivery',
  '🔄 Return Policy',
  '📞 Contact Us',
  '💳 Payment Methods',
  '🔍 Search Products',
];

function makeId() {
  return Math.random().toString(36).slice(2);
}

function mkBot(text: string, opts?: Partial<Omit<Message, 'id' | 'from' | 'text'>>): Message {
  return { id: makeId(), from: 'bot', text, ...opts };
}

function mkUser(text: string): Message {
  return { id: makeId(), from: 'user', text };
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getStoreSettings()
      .then(s => {
        setSettings(s);
        if (s.chatbotEnabled === false) { setEnabled(false); return; }
        setMessages([mkBot(
          s.chatbotGreeting || 'Hi! 👋 Welcome to Zest & Partners. I can help you find products, check stock, track orders, and answer any questions!',
          { options: QUICK_OPTIONS }
        )]);
      })
      .catch(() => {
        setMessages([mkBot('Hi! 👋 How can I help you today?', { options: QUICK_OPTIONS })]);
      });

    getProducts({ pageSize: 100 })
      .then(({ products }) => setAllProducts(products))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const addBot = useCallback((msg: Message) => {
    setTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, msg]);
      setTyping(false);
    }, 650);
  }, []);

  const searchProducts = useCallback((query: string): Product[] => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return allProducts.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [allProducts]);

  const getAnswer = useCallback((text: string): Message => {
    const lower = text.toLowerCase().trim();

    // Track order
    if (/track|order status|where is my|my order|order tracking/.test(lower)) {
      return mkBot(
        'To track your order:\n1. Go to My Account → Orders\n2. Click on your order\n3. You\'ll see real-time status updates\n\nSign in first if you haven\'t already!',
        { link: { href: '/account/orders', label: '📦 View My Orders' } }
      );
    }

    // Stock check
    if (/stock|available|in stock|out of stock|how many left|remaining/.test(lower)) {
      const q = lower.replace(/stock|available|in stock|out of stock|how many|is there|do you have|left|remaining/g, '').trim();
      if (q.length > 1) {
        const found = searchProducts(q);
        if (found.length > 0) {
          const p = found[0];
          const msg = p.stock === 0
            ? `❌ **${p.name}** is currently out of stock. Add it to your wishlist to get notified when it's back!`
            : p.stock <= 5
            ? `⚠️ Hurry! Only **${p.stock} left** in stock for "${p.name}"!`
            : `✅ "${p.name}" is in stock (${p.stock} available) — ${formatPrice(p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price)}`;
          return mkBot(msg, { products: [p], link: { href: `/products/${p.slug}`, label: 'View Product' } });
        }
      }
      return mkBot('Please tell me the product name and I\'ll check availability for you!\n\nExample: "Is iPhone 15 in stock?"');
    }

    // Shipping / delivery
    if (/shipping|delivery|ship|deliver|how long|arrive|dispatch|when will/.test(lower)) {
      if (!settings) return mkBot('📦 Delivery usually takes 3–5 working days across Pakistan.');
      return mkBot(
        `📦 **Delivery Info:**\n• Estimated time: ${settings.deliveryEstimate}\n• Free delivery on orders above PKR ${settings.freeDeliveryThreshold?.toLocaleString()}\n• Standard shipping: PKR ${settings.standardShippingCost}\n\nOrders are dispatched within 24 hours!`
      );
    }

    // Returns
    if (/return|refund|exchange|send back|money back|cancel return/.test(lower)) {
      return mkBot(
        `🔄 **Return Policy:**\n${settings?.returnPolicy || 'We accept returns within 7 days.'}\n\n• Window: ${settings?.returnPolicyDays || 7} days from delivery\n• Items must be unused & in original packaging\n\nContact us on WhatsApp to start a return.`
      );
    }

    // Warranty
    if (/warranty|guarantee|defect|broken|fault|damaged/.test(lower)) {
      return mkBot(`🛡️ **Warranty:**\n${settings?.warrantyPolicy || 'All products come with manufacturer warranty. Contact support for claims.'}`);
    }

    // Contact
    if (/contact|phone|email|reach|support|help|whatsapp|speak|human/.test(lower)) {
      const parts: string[] = [];
      if (settings?.contactEmail) parts.push(`📧 ${settings.contactEmail}`);
      if (settings?.contactPhone) parts.push(`📱 ${settings.contactPhone}`);
      if (settings?.socialWhatsApp) parts.push(`💬 WhatsApp: ${settings.socialWhatsApp}`);
      return mkBot(
        parts.length > 0 ? `Here's how to reach us:\n\n${parts.join('\n')}` : 'Please visit our contact page for support details.',
        { link: { href: '/contact', label: '📞 Contact Page' } }
      );
    }

    // Coupon
    if (/coupon|discount|promo|voucher|offer|code/.test(lower)) {
      return mkBot('🎟️ Apply a coupon code at checkout in the "Coupon Code" field!\n\nFollow us on social media for exclusive discount codes. 🎉');
    }

    // Payment
    if (/payment|pay|cash on delivery|cod|card|how to pay/.test(lower)) {
      return mkBot('💳 **Payment Methods:**\n• Cash on Delivery (COD)\n• Credit / Debit Card\n\nSelect at checkout. We also support EasyPaisa & JazzCash (coming soon)!');
    }

    // Cancel order
    if (/cancel|cancellation/.test(lower)) {
      return mkBot('❌ To cancel an order:\nGo to My Account → Orders → Cancel.\n\nCancellation is only possible before the order is shipped.',
        { link: { href: '/account/orders', label: '📦 My Orders' } }
      );
    }

    // Product search intent
    if (/search|find|looking for|show me|do you have|i want|i need|suggest/.test(lower)) {
      const q = lower.replace(/search|find|looking for|show me|do you have|i want|i need|suggest|any|me|please|the|a /g, '').trim();
      if (q.length > 1) {
        const found = searchProducts(q);
        if (found.length > 0) {
          return mkBot(`Here's what I found for "${q}":`, { products: found });
        }
        return mkBot(
          `I couldn't find "${q}" right now. Try browsing our store!`,
          { link: { href: `/products?q=${encodeURIComponent(q)}`, label: '🔍 Search Store' } }
        );
      }
      return mkBot('What are you looking for? Tell me a product name, brand, or category!');
    }

    // Categories
    const catKeywords: Record<string, string> = {
      electronics: 'electronics', phones: 'electronics', laptop: 'electronics', tech: 'electronics',
      fashion: 'fashion', clothing: 'fashion', shoes: 'fashion', bags: 'fashion',
      beauty: 'beauty', skincare: 'beauty', makeup: 'beauty',
      home: 'home', furniture: 'home', kitchen: 'home',
    };
    for (const [keyword, cat] of Object.entries(catKeywords)) {
      if (lower.includes(keyword)) {
        const found = allProducts.filter(p => p.category?.toLowerCase() === cat).slice(0, 4);
        return mkBot(
          found.length > 0 ? `Here are some ${keyword} products:` : `Browse our ${keyword} collection:`,
          { products: found.length > 0 ? found : undefined, link: { href: `/products?category=${cat}`, label: `View All` } }
        );
      }
    }

    // Greetings
    if (/^(hi|hello|hey|salam|helo|howdy|yo|sup)/.test(lower)) {
      return mkBot('Hello! 👋 How can I help you today?', { options: QUICK_OPTIONS });
    }

    // Try product search as fallback
    const fallback = searchProducts(text);
    if (fallback.length > 0) {
      return mkBot(`I found some products related to "${text}":`, { products: fallback });
    }

    return mkBot(
      'I\'m not sure about that. Here\'s what I can help with:',
      { options: ['🔍 Search Products', '🚚 Shipping Info', '🔄 Returns', '📦 Track Order', '📞 Contact Us'] }
    );
  }, [settings, allProducts, searchProducts]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, mkUser(trimmed)]);
    setInput('');
    addBot(getAnswer(trimmed));
  }, [addBot, getAnswer]);

  if (!enabled) return null;

  const botName = settings?.chatbotName || 'Zest Assistant';

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        aria-label="Open chat"
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-300 ${
          open ? 'bg-slate-800' : 'bg-black hover:scale-105'
        }`}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            style={{ maxHeight: '72vh', minHeight: 360 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-black text-white flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold">{botName}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <p className="text-[11px] text-white/60">Online · Replies instantly</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors p-1">
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
              {messages.map(msg => (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start items-start'}`}>
                    {msg.from === 'bot' && (
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                        <Sparkles size={10} className="text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed whitespace-pre-line ${
                      msg.from === 'user'
                        ? 'bg-black text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>

                  {/* Product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="ml-8 space-y-1.5">
                      {msg.products.map(p => (
                        <Link
                          key={p.id}
                          href={`/products/${p.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all group"
                        >
                          {p.images?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-10 h-10 object-contain rounded-lg bg-gray-100 flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-gray-900 truncate">{p.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-[11px] font-semibold text-black">
                                {formatPrice(p.isFlashSale && p.flashSalePrice ? p.flashSalePrice : p.price)}
                              </p>
                              {p.stock === 0 && <span className="text-[10px] text-red-500">Out of stock</span>}
                              {p.stock > 0 && p.stock <= 5 && <span className="text-[10px] text-orange-500">Only {p.stock} left</span>}
                            </div>
                          </div>
                          <ShoppingBag size={12} className="text-gray-400 group-hover:text-black flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Link button */}
                  {msg.link && (
                    <div className="ml-8">
                      <Link
                        href={msg.link.href}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black text-white text-[11px] font-bold rounded-full hover:bg-gray-800 transition-all active:scale-95"
                      >
                        <Package size={11} />
                        {msg.link.label}
                      </Link>
                    </div>
                  )}

                  {/* Quick option chips */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="ml-8 flex flex-wrap gap-1.5">
                      {msg.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => sendMessage(opt)}
                          className="px-2.5 py-1.5 bg-white border border-gray-200 text-[11px] font-semibold text-gray-700 rounded-full hover:border-black hover:bg-black hover:text-white transition-all shadow-sm"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {typing && (
                <div className="flex justify-start items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                    <Sparkles size={10} className="text-white" />
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Search hint */}
            <div className="px-3 py-1.5 border-t border-gray-100 bg-white flex-shrink-0">
              <button
                onClick={() => sendMessage('Show me products')}
                className="w-full flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-[11px] text-gray-400 hover:bg-gray-100 transition-colors text-left"
              >
                <Search size={12} />
                Ask about products, stock, or your order...
              </button>
            </div>

            {/* Input */}
            <div className="px-3 py-2.5 border-t border-gray-100 bg-white flex gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 text-[12.5px] border border-gray-200 rounded-xl focus:outline-none focus:border-black bg-gray-50 transition-colors"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center disabled:opacity-30 hover:bg-gray-800 transition-all active:scale-95"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
