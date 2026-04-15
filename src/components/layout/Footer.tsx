import Link from 'next/link';
import { Mail, Phone, MapPin, CreditCard, Truck, Shield, RotateCcw } from 'lucide-react';

// Inline SVGs — lucide-react v1.x removed brand icons
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const footerLinks = {
  shop: [
    { href: '/products', label: 'All Products' },
    { href: '/products?category=electronics', label: 'Electronics' },
    { href: '/products?category=fashion', label: 'Fashion' },
    { href: '/products?category=home', label: 'Home & Living' },
    { href: '/products?category=beauty', label: 'Beauty' },
  ],
  support: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/faq', label: 'FAQs' },
    { href: '/shipping', label: 'Shipping Info' },
    { href: '/returns', label: 'Returns' },
    { href: '/track-order', label: 'Track Order' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/press', label: 'Press' },
    { href: '/blog', label: 'Blog' },
  ],
};

const socialLinks = [
  { Icon: FacebookIcon, href: '#', label: 'Facebook' },
  { Icon: InstagramIcon, href: '#', label: 'Instagram' },
  { Icon: XIcon, href: '#', label: 'X (Twitter)' },
];

const features = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over PKR 5,000' },
  { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: CreditCard, title: 'Flexible Payment', desc: 'Multiple options' },
];

export function Footer() {
  return (
    <footer className="bg-black text-white">
      {/* Features */}
      <div className="border-b border-[var(--neutral-800)]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-4 text-center md:text-left">
                <div className="flex justify-center md:justify-start">
                  <feature.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-bold text-[13px] uppercase tracking-widest leading-none mb-1">
                    {feature.title}
                  </p>
                  <p className="text-[12px] text-[var(--neutral-400)] font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-6">
            <Link href="/" className="flex flex-col items-start leading-none group">
              <span className="text-xl font-bold text-white uppercase tracking-[0.2em]">ZEST</span>
              <span className="text-[11px] font-medium text-[var(--neutral-400)] uppercase tracking-[0.3em] mt-1 group-hover:text-white transition-colors">
                &amp; PARTNERS
              </span>
            </Link>
            <p className="text-[13px] text-[var(--neutral-400)] leading-relaxed">
              Experience editorial excellence in every product. Curated for the modern lifestyle.
            </p>
            <div className="flex gap-4 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-[var(--neutral-400)] hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {(['shop', 'support', 'company'] as const).map((section) => (
            <div key={section}>
              <h4 className="text-[13px] font-bold uppercase tracking-widest mb-6">
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </h4>
              <ul className="space-y-3">
                {footerLinks[section].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[var(--neutral-400)] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-[13px] font-bold uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-4">
              {[
                { icon: Mail, text: 'concierge@zestpartners.com' },
                { icon: Phone, text: '+92 300 ZEST 123' },
                { icon: MapPin, text: 'Karachi, Lahore, Islamabad' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-[13px] text-[var(--neutral-400)]">
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-[var(--neutral-800)]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[11px] font-bold text-[var(--neutral-500)] uppercase tracking-widest">
              &copy; {new Date().getFullYear()} ZEST &amp; PARTNERS. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-8 text-[11px] font-bold text-[var(--neutral-500)] uppercase tracking-widest">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
