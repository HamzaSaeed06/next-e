'use client';

import { useState, useMemo } from 'react';
import { Heart, Loader2, Ruler } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import type { Product, ProductVariant } from '@/types';
import { formatPrice } from '@/utils/formatters';
import toast from 'react-hot-toast';

export function ProductDetailClient({ product }: { product: Product }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addItem, openCart } = useCartStore();

  // 1. Initialize selections based on available attributes
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.attributes?.forEach(attr => {
      initial[attr.name] = attr.values[0];
    });
    return initial;
  });

  // 2. Find matching variant for price / stock / SKU
  const activeVariant = useMemo(() => {
    if (!product.hasVariants || !product.variants) return null;
    return product.variants.find(v => 
      Object.entries(selectedAttributes).every(([key, value]) => v.attributes[key] === value)
    );
  }, [product.variants, product.hasVariants, selectedAttributes]);

  // 3. Dynamic Price logic
  const isFlashSale = product.isFlashSale && product.flashSalePrice;
  const basePrice = isFlashSale ? product.flashSalePrice! : (activeVariant?.price || product.price);
  const displayPrice = activeVariant?.price || basePrice;
  const comparePrice = activeVariant?.comparePrice || product.comparePrice;

  // 4. Color-specific Image Filtering
  const displayImages = useMemo(() => {
    const colorAttr = Object.keys(selectedAttributes).find(k => k.toLowerCase() === 'color');
    const selectedColor = colorAttr ? selectedAttributes[colorAttr] : null;
    
    if (selectedColor && product.colorImages?.[selectedColor]) {
      return product.colorImages[selectedColor];
    }
    // Fallback to variant images if available, else product images
    return activeVariant?.images && activeVariant.images.length > 0 
      ? activeVariant.images 
      : product.images;
  }, [selectedAttributes, product.colorImages, product.images, activeVariant]);

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

  return (
    <div className="space-y-6">
      {/* Meta Headers */}
      <div>
        <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">
          {product.brand ?? 'Premium Collection'}
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-black leading-tight lg:leading-tight">
          {product.name}
        </h1>
        {activeVariant?.sku && (
          <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tighter">SKU: {activeVariant.sku}</p>
        )}
      </div>

      {/* Price & Rating Bar */}
      <div className="flex items-center justify-between border-b pb-6">
        <div className="flex items-end gap-3">
          {comparePrice && comparePrice > displayPrice && (
            <span className="text-lg text-gray-400 line-through font-medium tabular-nums mb-0.5">
              {formatPrice(comparePrice)}
            </span>
          )}
          <span className="text-3xl font-extrabold text-black tabular-nums">
            {formatPrice(displayPrice)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 cursor-pointer hover:underline" onClick={() => document.getElementById('reviews')?.scrollIntoView({behavior: 'smooth'})}>
           <span className="flex text-amber-500 text-lg">★</span>
           <span className="font-bold text-[15px]">{product.rating > 0 ? product.rating.toFixed(1) : '0.0'}</span>
           <span className="text-gray-500 text-[13px]">({product.reviewCount || 0} reviews)</span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 pt-2">
        <h3 className="font-bold text-black text-[15px]">Description</h3>
        <p className={`text-[14px] text-gray-600 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
          {product.description}
        </p>
        {product.description.length > 150 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[13px] font-bold text-black underline tracking-wide"
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
        {product.material && (
          <p className="text-[13px] text-gray-500 mt-2 italic">Material: {product.material}</p>
        )}
      </div>

      {/* Dynamic Attribute Selectors */}
      <div className="space-y-6 pt-4">
        {product.attributes?.map((attr) => {
          const isColor = attr.name.toLowerCase() === 'color';
          const isSize = attr.name.toLowerCase() === 'size';
          
          return (
            <div key={attr.name}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] text-gray-800 font-bold">
                  {attr.name}: <span className="font-normal text-gray-600">{selectedAttributes[attr.name]}</span>
                </p>
                {isSize && (product.sizeGuide || Object.keys(product.sizeGuide || {}).length > 0) && (
                  <button className="flex items-center gap-1 text-[12px] text-gray-500 underline hover:text-black">
                    <Ruler size={14} /> Size Guide
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3">
                {attr.values.map((val) => (
                  <button
                    key={val}
                    onClick={() => updateAttribute(attr.name, val)}
                    title={val}
                    className={
                      isColor 
                        ? `w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center p-0.5 ${
                            selectedAttributes[attr.name] === val ? 'border-black' : 'border-transparent hover:border-gray-300'
                          }`
                        : `px-4 py-2.5 min-w-[3rem] text-[13px] font-bold rounded border transition-all ${
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

              {/* Size Rules / Measurements Display */}
              {isSize && product.sizeGuide?.[selectedAttributes[attr.name]] && (
                <p className="mt-2 text-[12px] text-gray-500 bg-gray-50 p-2 rounded border border-dashed border-gray-200">
                  <span className="font-bold text-gray-700">Measurement:</span> {product.sizeGuide[selectedAttributes[attr.name]]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Call to Actions */}
      <div className="pt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={(activeVariant ? activeVariant.stock === 0 : product.stock === 0) || isLoading}
          className="flex-1 py-4 bg-black text-white text-[14px] font-bold rounded flex items-center justify-center gap-2 hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Add To Cart'}
        </button>
        <button
          onClick={() => { handleAddToCart(); }}
          disabled={(activeVariant ? activeVariant.stock === 0 : product.stock === 0) || isLoading}
          className="flex-1 py-4 bg-white text-black text-[14px] font-bold rounded border border-black flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          Checkout Now
        </button>
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className={`w-[54px] border border-gray-300 rounded flex items-center justify-center transition-all ${
            isWishlisted ? 'text-red-500' : 'text-gray-500 hover:text-black hover:border-black'
          }`}
        >
          <Heart size={20} className={isWishlisted ? 'fill-red-500' : ''} />
        </button>
      </div>

      {/* Info Notice */}
      <div className="pt-4 text-[12px] text-gray-500 flex flex-col gap-1">
        <p>Delivery: 3-5 Working Days</p>
        {((activeVariant?.stock ?? product.stock) <= 5 && (activeVariant?.stock ?? product.stock) > 0) && (
          <p className="text-red-600 font-bold">
            Only {activeVariant?.stock ?? product.stock} remaining in this selection!
          </p>
        )}
        {(activeVariant?.stock === 0 || (!activeVariant && product.stock === 0)) && (
          <p className="text-red-600 font-bold uppercase tracking-widest bg-red-50 p-2 rounded text-center">Out of Stock</p>
        )}
      </div>
    </div>
  );
}
