'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  RefreshCw, 
  Package, 
  Settings2, 
  FileText,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  Columns
} from 'lucide-react';
import { createProduct } from '@/lib/services/productService';
import type { Product, ProductAttribute, ProductVariant } from '@/types';
import toast from 'react-hot-toast';

export function ProductForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    slug: '',
    description: '',
    brand: '',
    material: '',
    category: '',
    basePrice: 0,
    baseStock: 0,
  });

  // Attributes State
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeValues, setNewAttributeValues] = useState('');

  // Variants State
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  
  // Media State
  const [mainImages, setMainImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  const [sizeGuide, setSizeGuide] = useState<Record<string, string>>({});
  const [activeImageTab, setActiveImageTab] = useState<'main' | string>('main');

  // Helper: Slugify
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  };

  const handleAddField = () => {
    if (!newAttributeName || !newAttributeValues) {
      toast.error('Attribute name and values are required');
      return;
    }
    
    const values = newAttributeValues.split(',').map(v => v.trim()).filter(Boolean);
    if (values.length === 0) return;

    setAttributes([...attributes, { name: newAttributeName, values }]);
    setNewAttributeName('');
    setNewAttributeValues('');
  };

  const removeAttribute = (index: number) => {
    const updated = [...attributes];
    updated.splice(index, 1);
    setAttributes(updated);
  };

  // Generate Variants Logic
  const generateVariants = () => {
    if (attributes.length === 0) {
      toast.error('Add at least one attribute to generate variants');
      return;
    }

    // Cartesian product of attribute values
    const cartesian = (...a: any[]) => a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));
    const combinations = cartesian(...attributes.map(a => a.values));
    
    const newVariants: ProductVariant[] = combinations.map((combo: any, i: number) => {
      const variantAttrs: Record<string, string> = {};
      const comboArr = Array.isArray(combo) ? combo : [combo];
      attributes.forEach((attr, idx) => {
        variantAttrs[attr.name] = comboArr[idx];
      });

      return {
        id: Math.random().toString(36).substr(2, 9),
        sku: `${generateSlug(basicInfo.name)}-${Object.values(variantAttrs).join('-')}`.toUpperCase(),
        attributes: variantAttrs,
        price: basicInfo.basePrice,
        stock: basicInfo.baseStock,
        images: [],
        isActive: true,
        lowStockThreshold: 5,
      };
    });

    setVariants(newVariants);
    toast.success(`${newVariants.length} variants generated`);
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const addImage = () => {
    if (!newImageUrl) return;
    if (activeImageTab === 'main') {
      setMainImages([...mainImages, newImageUrl]);
    } else {
      const current = colorImages[activeImageTab] || [];
      setColorImages({ ...colorImages, [activeImageTab]: [...current, newImageUrl] });
    }
    setNewImageUrl('');
  };

  const removeImage = (url: string, tab: string) => {
    if (tab === 'main') {
      setMainImages(mainImages.filter(img => img !== url));
    } else {
      setColorImages({ ...colorImages, [tab]: colorImages[tab].filter(img => img !== url) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!basicInfo.name || !basicInfo.category) {
      toast.error('Name and Category are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const productData: Partial<Product> = {
        ...basicInfo,
        slug: basicInfo.slug || generateSlug(basicInfo.name),
        price: basicInfo.basePrice,
        stock: variants.length > 0 ? variants.reduce((acc, v) => acc + (v.stock || 0), 0) : basicInfo.baseStock,
        images: mainImages,
        colorImages: colorImages,
        sizeGuide: sizeGuide,
        attributes: attributes,
        variants: variants,
        hasVariants: variants.length > 0,
        isActive: true,
        lowStockThreshold: 5,
        sold: 0,
        views: 0,
        rating: 0,
        reviewCount: 0,
      };

      await createProduct(productData);
      toast.success('Product created successfully!');
      router.push('/admin/products');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = useMemo(() => {
    const colorAttr = attributes.find(a => a.name.toLowerCase() === 'color');
    return colorAttr ? colorAttr.values : [];
  }, [attributes]);

  const sizes = useMemo(() => {
    const sizeAttr = attributes.find(a => a.name.toLowerCase() === 'size');
    return sizeAttr ? sizeAttr.values : [];
  }, [attributes]);

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-10">
      {/* 1. General Information */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b">
          <FileText className="text-orange-500" size={20} />
          <h2 className="text-lg font-bold text-slate-900">General Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700">Product Name *</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 bg-slate-50 border rounded text-[13px] focus:ring-2 focus:ring-orange-500/20 transition-all"
              value={basicInfo.name}
              onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value, slug: generateSlug(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700">Category *</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 bg-slate-50 border rounded text-[13px] focus:ring-2 focus:ring-orange-500/20 transition-all"
              value={basicInfo.category}
              onChange={(e) => setBasicInfo({ ...basicInfo, category: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700">Description *</label>
            <textarea 
              rows={4}
              required
              className="w-full px-4 py-2 bg-slate-50 border rounded text-[13px] focus:ring-2 focus:ring-orange-500/20 transition-all"
              value={basicInfo.description}
              onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700">Brand</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-slate-50 border rounded text-[13px]"
              value={basicInfo.brand}
              onChange={(e) => setBasicInfo({ ...basicInfo, brand: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700">Material</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-slate-50 border rounded text-[13px]"
              value={basicInfo.material}
              onChange={(e) => setBasicInfo({ ...basicInfo, material: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* 2. Attributes & Variants Generator */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Settings2 className="text-orange-500" size={20} />
          <h2 className="text-lg font-bold text-slate-900">Attributes & Variants</h2>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Attr Name</label>
              <input 
                type="text" 
                placeholder="e.g. Color"
                className="w-full px-3 py-2 bg-white border rounded text-[13px]"
                value={newAttributeName}
                onChange={(e) => setNewAttributeName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider">Values (comma separated)</label>
              <input 
                type="text" 
                placeholder="Red, Blue, Green"
                className="w-full px-3 py-2 bg-white border rounded text-[13px]"
                value={newAttributeValues}
                onChange={(e) => setNewAttributeValues(e.target.value)}
              />
            </div>
            <button 
              type="button"
              onClick={handleAddField}
              className="px-4 py-2.5 bg-slate-900 text-white text-[13px] font-bold rounded flex items-center justify-center gap-2 hover:bg-black transition-all"
            >
              <Plus size={16} /> Add Attribute
            </button>
          </div>

          {/* List of Attributes */}
          {attributes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attributes.map((attr, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white border rounded-full shadow-sm group">
                  <span className="text-[13px] font-bold text-slate-700">{attr.name}:</span>
                  <span className="text-[12px] text-slate-500">{attr.values.join(', ')}</span>
                  <button onClick={() => removeAttribute(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Size Guide Management */}
          {sizes.length > 0 && (
            <div className="pt-6 border-t space-y-4">
              <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-slate-400" />
                <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">Size Guide Measurements</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sizes.map(size => (
                  <div key={size} className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-500">{size} Measurement</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Chest 40', Length 28'"
                      className="w-full px-3 py-1.5 bg-white border rounded text-[13px]"
                      value={sizeGuide[size] || ''}
                      onChange={(e) => setSizeGuide({ ...sizeGuide, [size]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {attributes.length > 0 && (
            <div className="pt-4 border-t flex items-center justify-between">
              <p className="text-[12px] text-slate-500 italic">Generate variants automatically based on your attributes.</p>
              <button 
                type="button"
                onClick={generateVariants}
                className="px-4 py-2 bg-orange-100 text-orange-600 text-[13px] font-bold rounded flex items-center gap-2 hover:bg-orange-200 transition-all"
              >
                <RefreshCw size={16} /> Generate Variants
              </button>
            </div>
          )}
        </div>

        {/* Variants Inventory Grid */}
        {variants.length > 0 && (
          <div className="bg-white border rounded-lg overflow-hidden translate-x-0">
             <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Variant</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">SKU</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Price</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {variants.map((variant) => (
                    <tr key={variant.id}>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(variant.attributes).map(([k, v]) => (
                            <span key={k} className="px-2 py-0.5 bg-slate-100 text-[11px] font-bold text-slate-600 rounded">
                              {v}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          className="w-full px-2 py-1 bg-slate-50 border-none rounded text-[12px]" 
                          value={variant.sku}
                          onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          className="w-24 px-2 py-1 bg-slate-50 border-none rounded text-[12px]"
                          value={variant.price}
                          onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input 
                          type="number" 
                          className="w-20 px-2 py-1 bg-slate-50 border-none rounded text-[12px]"
                          value={variant.stock}
                          onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}
      </section>

      {/* 3. Media Management */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b">
          <ImageIcon className="text-orange-500" size={20} />
          <h2 className="text-lg font-bold text-slate-900">Media & Image Groups</h2>
        </div>

        <div className="space-y-4">
          {/* Tabs for Image Groups */}
          <div className="flex flex-wrap gap-1 border-b">
            <button 
              type="button"
              onClick={() => setActiveImageTab('main')}
              className={`px-4 py-2 text-[13px] font-bold transition-all ${activeImageTab === 'main' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Main Product
            </button>
            {colors.map(color => (
              <button 
                key={color}
                type="button"
                onClick={() => setActiveImageTab(color)}
                className={`px-4 py-2 text-[13px] font-bold transition-all ${activeImageTab === color ? 'text-orange-600 border-b-2 border-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {color} Images
              </button>
            ))}
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-6">
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder={`Paste image URL for ${activeImageTab === 'main' ? 'main product' : activeImageTab}...`}
                className="flex-1 px-4 py-2 bg-white border rounded text-[13px]"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <button 
                type="button"
                onClick={addImage}
                className="px-6 py-2 bg-slate-900 text-white text-[13px] font-bold rounded hover:bg-black transition-all"
              >
                Add Image
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {(activeImageTab === 'main' ? mainImages : (colorImages[activeImageTab] || [])).map((url, i) => (
                <div key={i} className="group aspect-square relative bg-white border rounded overflow-hidden p-2">
                   <div className="w-full h-full relative">
                      <img src={url} alt="Preview" className="w-full h-full object-contain mix-blend-multiply" />
                   </div>
                   <button 
                    type="button"
                    onClick={() => removeImage(url, activeImageTab)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                   >
                     <X size={12} />
                   </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing & Base Inventory (If no variants) */}
      {!variants.length && (
        <section className="space-y-6">
           <div className="flex items-center gap-2 pb-2 border-b">
            <Package className="text-orange-500" size={20} />
            <h2 className="text-lg font-bold text-slate-900">Base Inventory</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700">Price *</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full px-4 py-2 bg-slate-50 border rounded text-[13px]"
                  value={basicInfo.basePrice}
                  onChange={(e) => setBasicInfo({ ...basicInfo, basePrice: Number(e.target.value) })}
                />
             </div>
             <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700">Stock Quantity *</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 bg-slate-50 border rounded text-[13px]"
                  value={basicInfo.baseStock}
                  onChange={(e) => setBasicInfo({ ...basicInfo, baseStock: Number(e.target.value) })}
                />
             </div>
          </div>
        </section>
      )}

      {/* Footer Area */}
      <div className="pt-10 border-t flex items-center justify-end gap-4">
        <button 
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 bg-white border text-slate-600 text-[14px] font-bold rounded hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isSubmitting}
          className="px-10 py-3 bg-orange-500 text-white text-[14px] font-bold rounded shadow-md hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span>Save Product</span>
        </button>
      </div>
    </form>
  );
}
