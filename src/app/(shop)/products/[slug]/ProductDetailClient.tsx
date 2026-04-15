'use client';

import { useState, useMemo, useEffect } from 'react';
import { Heart, Loader2, Ruler, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import type { Product, StoreSettings } from '@/types';
import { formatPrice } from '@/utils/formatters';
import toast from 'react-hot-toast';

export function ProductDetailClient({
  product,
  settings,
  onDisplayImagesChange,
}: {
  product: Product;
  settings?: Pick<StoreSettings, 'deliveryEstimate' | 'returnPolicy' | 'returnPolicyDays' | 'warrantyPolicy' | 'freeDeliveryThreshold'>;
  onDisplayImagesChange?: (images: string[]) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addItem, openCart } = useCartStore();

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.attributes?.forEach(attr => {
      initial[attr.name] = attr.values[0];
    });
    return initial;
  });

  const activeVariant = useMemo(() => {
    if (!product.hasVariants || !product.variants) return null;
    return product.variants.find(v =>
      Object.entries(selectedAttributes).every(([key, value]) => v.attributes[key] === value)
    );
  }, [product.variants, product.hasVariants, selectedAttributes]);

  const isFlashSale = product.isFlashSale && product.flashSalePrice;
  const basePrice = isFlashSale ? product.flashSalePrice! : (activeVariant?.price || product.price);
  const displayPrice = activeVariant?.price || basePrice;
  const comparePrice = activeVariant?.comparePrice || product.comparePrice;

  const displayImages = useMemo(() => {
    const colorAttr = Object.keys(selectedAttributes).find(k => k.toLowerCase() === 'color');
    const selectedColor = colorAttr ? selectedAttributes[colorAttr] : null;
    if (selectedColor && product.colorImages?.[selectedColor]) {
      return product.colorImages[selectedColor];
    }
    return activeVariant?.images && activeVariant.images.length > 0
      ? activeVariant.images
      : product.images;
  }, [selectedAttributes, product.colorImages, product.images, activeVariant]);

  useEffect(() => {
    if (onDisplayImagesChange) {
      onDisplayImagesChange(displayImages.length > 0 ? displayImages : product.images);
    }
  }, [displayImages, product.images, onDisplayImagesChange]);

  const handleAddToCart = () => {
    const currentStock = activeVariant?.stock ?? product.stock;
    if (currentStock === 0) return;
    setIsLoading(true);
    try {
      addItem({
        productId: product.id,
        variantId: activeVariant?.id,
        name: product.name,
        price: displayPrice,
        image: displayImages[0] || product.images[0] || '',
        qty: 1,
        stock: currentStock,
        attributes: selectedAttributes,
      });
      toast.success(`${product.name} added to bag`);
      openCart();
    } finally {
      setIsLoading(false);
    }
  };

  const updateAttribute = (name: string, value: string) => {
    setSelectedAttributes(prev => ({ ...prev, [name]: value }));
  };

  const currentStock = activeVariant?.stock ?? product.stock;

  return (
    <div className="flex flex-col gap-4">

      {/* Brand + Name */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">
          {product.brand ?? 'Premium Collection'}
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-black leading-snug">
          {product.name}
        </h1>
        {activeVariant?.sku && (
          <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tighter">SKU: {activeVariant.sku}</p>
        )}
      </div>

      {/* Price + Rating */}
      <div className="flex items-center justify-between border-y border-gray-100 py-3">
        <div className="flex items-end gap-2">
          {comparePrice && comparePrice > displayPrice && (
            <span className="text-base text-gray-400 line-through font-medium tabular-nums">
              {formatPrice(comparePrice)}
            </span>
          )}
          <span className="text-2xl font-extrabold text-black tabular-nums">
            {formatPrice(displayPrice)}
          </span>
          {isFlashSale && (
            <span className="text-[10px] font-bold text-white bg-black px-2 py-0.5 rounded uppercase tracking-wide ml-1">
              Sale
            </span>
          )}
        </div>

        <button
          onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center gap-1.5 hover:underline"
        >
          <span className="text-amber-400 text-base">★</span>
          <span className="font-bold text-[14px]">{product.rating > 0 ? product.rating.toFixed(1) : '0.0'}</span>
          <span className="text-gray-500 text-[12px]">({product.reviewCount || 0})</span>
        </button>
      </div>

      {/* Description */}
      <div>
        <p className={`text-[13px] text-gray-600 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
          {product.description}
        </p>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {product.description.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[12px] font-bold text-black underline"
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </button>
          )}
          {product.material && (
            <span className="text-[12px] text-gray-500 italic">Material: {product.material}</span>
          )}
        </div>
      </div>

      {/* Attribute Selectors */}
      {product.attributes && product.attributes.length > 0 && (
        <div className="flex flex-col gap-4">
          {product.attributes.map((attr) => {
            const isColor = attr.name.toLowerCase() === 'color';
            const isSize = attr.name.toLowerCase() === 'size';

            return (
              <div key={attr.name}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[12px] text-gray-800 font-bold">
                    {attr.name}:{' '}
                    <span className="font-normal text-gray-500">{selectedAttributes[attr.name]}</span>
                  </p>
                  {isSize && product.sizeGuide && Object.keys(product.sizeGuide).length > 0 && (
                    <button className="flex items-center gap-1 text-[11px] text-gray-500 underline hover:text-black">
                      <Ruler size={13} /> Size Guide
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {attr.values.map((val) => (
                    <button
                      key={val}
                      onClick={() => updateAttribute(attr.name, val)}
                      title={val}
                      className={
                        isColor
                          ? `w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center p-0.5 ${
                              selectedAttributes[attr.name] === val ? 'border-black' : 'border-transparent hover:border-gray-300'
                            }`
                          : `px-3 py-2 min-w-[2.5rem] text-[12px] font-bold rounded border transition-all ${
                              selectedAttributes[attr.name] === val
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-gray-800 border-gray-200 hover:border-black'
                            }`
                      }
                    >
                      {isColor ? (
                        <div
                          className="w-full h-full rounded-full border border-gray-200"
                          style={{ backgroundColor: val.toLowerCase().replace(/\s+/g, '') }}
                        />
                      ) : (
                        val
                      )}
                    </button>
                  ))}
                </div>

                {isSize && product.sizeGuide?.[selectedAttributes[attr.name]] && (
                  <p className="mt-1.5 text-[11px] text-gray-500 bg-gray-50 px-3 py-1.5 rounded border border-dashed border-gray-200">
                    <span className="font-bold text-gray-700">Measurement:</span>{' '}
                    {product.sizeGuide[selectedAttributes[attr.name]]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Stock Warnings */}
      {currentStock <= 5 && currentStock > 0 && (
        <p className="text-red-600 font-bold text-[12px]">
          Only {currentStock} left in stock!
        </p>
      )}
      {currentStock === 0 && (
        <p className="text-red-600 font-bold uppercase tracking-widest bg-red-50 p-2 rounded text-center text-[11px]">
          Out of Stock
        </p>
      )}

      {/* Call to Actions */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={handleAddToCart}
          disabled={currentStock === 0 || isLoading}
          className="flex-1 py-3.5 bg-black text-white text-[13px] font-bold rounded flex items-center justify-center gap-2 hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={17} className="animate-spin" /> : 'Add To Cart'}
        </button>
        <button
          onClick={handleAddToCart}
          disabled={currentStock === 0 || isLoading}
          className="flex-1 py-3.5 bg-white text-black text-[13px] font-bold rounded border border-black flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          Checkout Now
        </button>
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`w-12 border rounded flex items-center justify-center transition-all ${
            isWishlisted ? 'border-red-300 text-red-500 bg-red-50' : 'border-gray-300 text-gray-500 hover:text-black hover:border-black'
          }`}
        >
          <Heart size={18} className={isWishlisted ? 'fill-red-500' : ''} />
        </button>
      </div>

      {/* Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <div className="border border-gray-100 rounded-lg overflow-hidden">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-4 py-2 bg-gray-50 border-b border-gray-100">
            Specifications
          </p>
          <div className="divide-y divide-gray-50">
            {product.specifications.map((spec, i) => (
              <div key={i} className="flex px-4 py-2">
                <span className="text-[12px] font-semibold text-gray-600 w-36 flex-shrink-0">{spec.key}</span>
                <span className="text-[12px] text-gray-700">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policy Info */}
      <div className="border-t border-gray-100 pt-3 flex flex-col gap-2.5">
        <div className="flex items-start gap-2.5">
          <Truck size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-gray-700">
              {settings?.deliveryEstimate || '3–5 working days'}
            </p>
            {settings?.freeDeliveryThreshold && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                Free delivery on orders over {formatPrice(settings.freeDeliveryThreshold)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <RotateCcw size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-gray-600">
            {settings?.returnPolicy || `${settings?.returnPolicyDays || 30}-day hassle-free returns`}
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <ShieldCheck size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-gray-600">
            {settings?.warrantyPolicy || '1-year manufacturer warranty'}
          </p>
        </div>
      </div>
    </div>
  );
}
