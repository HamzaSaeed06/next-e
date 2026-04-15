'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react';
import { getStoreSettings } from '@/lib/services/storeSettingsService';
import type { StoreSettings } from '@/types';

interface Message {
  id: string;
  from: 'bot' | 'user';
  text: string;
  options?: string[];
}

const FAQ_TRIGGERS: { patterns: string[]; answer: (s: StoreSettings) => string }[] = [
  {
    patterns: ['shipping', 'delivery', 'ship', 'deliver', 'how long', 'arrive'],
    answer: s => `We deliver in ${s.deliveryEstimate}. Free delivery on orders over PKR ${s.freeDeliveryThreshold.toLocaleString()}. Standard shipping is PKR ${s.standardShippingCost}.`,
  },
  {
    patterns: ['return', 'refund', 'exchange', 'send back', 'money back'],
    answer: s => `${s.returnPolicy} You have ${s.returnPolicyDays} days from delivery to request a return.`,
  },
  {
    patterns: ['warranty', 'guarantee', 'defect', 'broken', 'fault'],
    answer: s => s.warrantyPolicy,
  },
  {
    patterns: ['contact', 'phone', 'email', 'reach', 'talk to', 'support', 'help'],
    answer: s => {
      const parts: string[] = [];
      if (s.contactEmail) parts.push(`Email: ${s.contactEmail}`);
      if (s.contactPhone) parts.push(`Phone: ${s.contactPhone}`);
      if (s.socialWhatsApp) parts.push(`WhatsApp: ${s.socialWhatsApp}`);
      if (s.contactAddress) parts.push(`Address: ${s.contactAddress}`);
      return parts.length > 0
        ? `Here are our contact details:\n${parts.join('\n')}`
        : 'Please browse the site or use the contact form to reach us.';
    },
  },
  {
    patterns: ['track', 'order status', 'my order', 'where is my'],
    answer: () => 'To track your order, go to My Account → Orders and click on your order to see live status updates.',
  },
  {
    patterns: ['coupon', 'discount', 'promo code', 'voucher', 'code'],
    answer: () => 'You can apply a coupon code at checkout — enter it in the "Coupon Code" field before placing your order.',
  },
  {
    patterns: ['payment', 'pay', 'cash on delivery', 'cod', 'card'],
    answer: () => 'We accept Cash on Delivery (COD) and card payments. Select your preferred method at checkout.',
  },
  {
    patterns: ['cancel', 'cancellation'],
    answer: () => 'To cancel an order, go to My Account → Orders and click Cancel. Orders can only be cancelled before they are shipped.',
  },
  {
    patterns: ['product', 'items', 'stock', 'available', 'catalog'],
    answer: () => 'Browse our full catalog at /products. You can filter by category, price, and more.',
  },
];

const QUICK_OPTIONS = [
  'Shipping & Delivery',
  'Return Policy',
  'Track My Order',
  'Contact Us',
  'Payment Methods',
];

function botAnswer(text: string, settings: StoreSettings): string {
  const lower = text.toLowerCase();
  for (const faq of FAQ_TRIGGERS) {
    if (faq.patterns.some(p => lower.includes(p))) {
      return faq.answer(settings);
    }
  }
  return `I'm not sure about that, but I'm happy to help with shipping, returns, order tracking, and more. What would you like to know?`;
}

function makeId() {
  return Math.random().toString(36).slice(2);
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getStoreSettings().then(s => {
      setSettings(s);
      if (s.chatbotEnabled === false) { setEnabled(false); return; }
      const greeting: Message = {
        id: makeId(),
        from: 'bot',
        text: s.chatbotGreeting || 'Hi! How can I help you today?',
        options: QUICK_OPTIONS,
      };
      setMessages([greeting]);
    }).catch(() => {
      const greeting: Message = {
        id: makeId(),
        from: 'bot',
        text: 'Hi! How can I help you today?',
        options: QUICK_OPTIONS,
      };
      setMessages([greeting]);
    });
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const sendMessage = (text: string) => {
    if (!text.trim() || !settings) return;
    const userMsg: Message = { id: makeId(), from: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const answer = botAnswer(text.trim(), settings);
      const botMsg: Message = { id: makeId(), from: 'bot', text: answer };
      setMessages(prev => [...prev, botMsg]);
      setTyping(false);
    }, 700);
  };

  if (!enabled) return null;

  const botName = settings?.chatbotName || 'Zest Assistant';

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open chat"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
          open ? 'bg-slate-800 rotate-12' : 'bg-slate-900 hover:scale-110'
        }`}
      >
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
        {!open && messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ maxHeight: '70vh', minHeight: 400 }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-slate-900 text-white">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle size={16} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold">{botName}</p>
              <p className="text-[11px] text-white/60">Usually replies instantly</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id}>
                <div className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                    msg.from === 'user'
                      ? 'bg-slate-900 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
                {msg.options && msg.options.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => sendMessage(opt)}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-[12px] font-medium text-gray-700 rounded-full hover:border-slate-400 hover:bg-slate-50 transition-all shadow-sm"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Ask anything..."
              className="flex-1 px-3 py-2 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:border-slate-400 bg-gray-50"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center disabled:opacity-40 hover:bg-slate-700 transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
