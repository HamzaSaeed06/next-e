/**
 * Format a number as Pakistani Rupee currency.
 */
export const formatPrice = (amount: number): string =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * Calculate discount percentage between original and sale price.
 */
export const discountPercent = (original: number, sale: number): number =>
  Math.round(((original - sale) / original) * 100);

/**
 * Truncate a string to a max length with ellipsis.
 */
export const truncate = (text: string, max = 80): string =>
  text.length > max ? `${text.slice(0, max)}…` : text;

/**
 * Convert a Date or Firestore Timestamp to a JS Date.
 */
export const toDate = (value: unknown): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  // Firestore Timestamp
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date(value as string | number);
};

/**
 * Format a date as a readable string.
 */
export const formatDate = (value: unknown): string =>
  toDate(value).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

/**
 * Convert a product name to a URL-friendly slug.
 */
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Merge Tailwind classes safely.
 */
export const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ');
