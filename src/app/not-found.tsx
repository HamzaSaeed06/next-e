import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white">
      <p className="text-[11px] font-bold text-[var(--neutral-400)] uppercase tracking-[0.4em] mb-4">Error 404</p>
      <h1 className="text-[80px] md:text-[120px] font-extrabold text-black leading-none tracking-tighter">
        404
      </h1>
      <p className="text-[18px] font-bold text-black mt-4 mb-2">Page Not Found</p>
      <p className="text-[var(--neutral-500)] text-[14px] max-w-sm mb-10">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/"
          className="px-8 py-4 bg-black text-white text-[13px] font-bold uppercase tracking-widest hover:bg-black/90 transition-all"
        >
          Back to Home
        </Link>
        <Link
          href="/products"
          className="px-8 py-4 border border-black text-black text-[13px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
