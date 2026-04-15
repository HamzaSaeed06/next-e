'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  X,
  RefreshCw,
  Package,
  Settings2,
  FileText,
  Save,
  Loader2,
  Tag,
  Zap,
  Weight,
  List,
  Upload,
} from 'lucide-react';
import { createProduct, updateProduct } from '@/lib/services/productService';
import type { Product, ProductAttribute, ProductVariant } from '@/types';
import toast from 'react-hot-toast';

interface ProductFormProps {
  initialData?: Product;
  onSuccess?: () => void;
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps = {}) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [basicInfo, setBasicInfo] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    brand: initialData?.brand || '',
    material: initialData?.material || '',
    category: initialData?.category || '',
    subcategory: initialData?.subcategory || '',
    tags: initialData?.tags?.join(', ') || '',
    basePrice: initialData?.price || 0,
    comparePrice: initialData?.comparePrice || 0,
    baseStock: initialData?.stock || 0,
    weight: initialData?.weight || 0,
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    isFlashSale: initialData?.isFlashSale ?? false,
    flashSalePrice: initialData?.flashSalePrice || 0,
  });

  const [attributes, setAttributes] = useState<ProductAttribute[]>(initialData?.attributes || []);
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeValues, setNewAttributeValues] = useState('');

  const [variants, setVariants] = useState<ProductVariant[]>(initialData?.variants || []);

  const [mainImages, setMainImages] = useState<string[]>(initialData?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl || '');
  const [colorImages, setColorImages] = useState<Record<string, string[]>>(initialData?.colorImages || {});
  const [sizeGuide, setSizeGuide] = useState<Record<string, string>>(initialData?.sizeGuide || {});
  const [activeImageTab, setActiveImageTab] = useState<'main' | string>('main');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'drcmvkkg2';
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'e-commerce';
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadToCloudinary));
      urls.forEach(url => {
        if (activeImageTab === 'main') {
          setMainImages(prev => [...prev, url]);
        } else {
          setColorImages(prev => ({
            ...prev,
            [activeImageTab]: [...(prev[activeImageTab] || []), url],
          }));
        }
      });
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded!`);
    } catch {
      toast.error('Image upload failed. Check your Cloudinary settings.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>(
    initialData?.specifications || []
  );
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  const handleAddAttribute = () => {
    if (!newAttributeName || !newAttributeValues) {
      toast.error('Attribute name and values are required');
      return;
    }
    const values = newAttributeValues.split(',').map((v) => v.trim()).filter(Boolean);
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

  const generateVariants = () => {
    if (attributes.length === 0) {
      toast.error('Add at least one attribute to generate variants');
      return;
    }
    const cartesian = (...a: any[]) =>
      a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));
    const combinations = cartesian(...attributes.map((a) => a.values));
    const newVariants: ProductVariant[] = combinations.map((combo: any) => {
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
        comparePrice: basicInfo.comparePrice || undefined,
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
    setVariants(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
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
      setMainImages(mainImages.filter((img) => img !== url));
    } else {
      setColorImages({ ...colorImages, [tab]: colorImages[tab].filter((img) => img !== url) });
    }
  };

  const addSpec = () => {
    if (!newSpecKey || !newSpecValue) return;
    setSpecifications([...specifications, { key: newSpecKey, value: newSpecValue }]);
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const removeSpec = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!basicInfo.name || !basicInfo.category) {
      toast.error('Name and Category are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const tags = basicInfo.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const productData: Partial<Product> = {
        name: basicInfo.name,
        slug: basicInfo.slug || generateSlug(basicInfo.name),
        description: basicInfo.description,
        brand: basicInfo.brand || undefined,
        material: basicInfo.material || undefined,
        category: basicInfo.category,
        subcategory: basicInfo.subcategory || '',
        tags,
        price: basicInfo.basePrice,
        comparePrice: basicInfo.comparePrice > 0 ? basicInfo.comparePrice : undefined,
        stock: variants.length > 0
          ? variants.reduce((acc, v) => acc + (v.stock || 0), 0)
          : basicInfo.baseStock,
        weight: basicInfo.weight > 0 ? basicInfo.weight : undefined,
        images: mainImages,
        videoUrl: videoUrl || undefined,
        colorImages,
        sizeGuide,
        specifications,
        attributes,
        variants,
        hasVariants: variants.length > 0,
        isActive: basicInfo.isActive,
        isFeatured: basicInfo.isFeatured,
        isFlashSale: basicInfo.isFlashSale,
        flashSalePrice: basicInfo.isFlashSale && basicInfo.flashSalePrice > 0
          ? basicInfo.flashSalePrice
          : undefined,
        lowStockThreshold: 5,
        sold: initialData?.sold ?? 0,
        views: initialData?.views ?? 0,
        rating: initialData?.rating ?? 0,
        reviewCount: initialData?.reviewCount ?? 0,
      };

      if (isEditing && initialData) {
        await updateProduct(initialData.id, productData);
        toast.success('Product updated successfully!');
      } else {
        await createProduct(productData);
        toast.success('Product created successfully!');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/admin/products');
      }
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = useMemo(() => {
    const colorAttr = attributes.find((a) => a.name.toLowerCase() === 'color');
    return colorAttr ? colorAttr.values : [];
  }, [attributes]);

  const sizes = useMemo(() => {
    const sizeAttr = attributes.find((a) => a.name.toLowerCase() === 'size');
    return sizeAttr ? sizeAttr.values : [];
  }, [attributes]);

  const inputClass =
    'w-full px-4 py-2 bg-slate-50 border rounded text-[13px] focus:ring-2 focus:ring-orange-500/20 transition-all focus:outline-none';
  const labelClass = 'text-[13px] font-bold text-slate-700';

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-10">

      {/* ── 1. General Information ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b">
          <FileText className="text-orange-500" size={20} />
          <h2 className="text-lg font-bold text-slate-900">General Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className={labelClass}>Product Name *</label>
            <input
              type="text"
              required
              className={inputClass}
              value={basicInfo.name}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, name: e.target.value, slug: generateSlug(e.target.value) })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Category *</label>
            <input
              type="text"
              required
              className={inputClass}
              value={basicInfo.category}
              onChange={(e) => setBasicInfo({ ...basicInfo, category: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Subcategory</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. T-Shirts"
              value={basicInfo.subcategory}
              onChange={(e) => setBasicInfo({ ...basicInfo, subcategory: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Brand</label>
            <input
              type="text"
              className={inputClass}
              value={basicInfo.brand}
              onChange={(e) => setBasicInfo({ ...basicInfo, brand: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className={labelClass}>Description *</label>
            <textarea
              rows={4}
              required
              className={inputClass}
              value={basicInfo.description}
              onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Material</label>
            <input
              type="text"
              className={inputClass}
              placeholder="e.g. 100% Cotton"
              value={basicInfo.material}
              onChange={(e) => setBasicInfo({ ...basicInfo, material: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Tags</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Comma separated: summer, casual, sale"
              value={basicInfo.tags}
              onChange={(e) => setBasicInfo({ ...basicInfo, tags: e.target.value })}
            />
          </div>
        </div>

        {/* Status Toggles */}
        <div className="flex flex-wrap gap-6 pt-2">
          {[
            { key: 'isActive', label: 'Active (visible in store)' },
            { key: 'isFeatured', label: 'Featured Product' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setBasicInfo({ ...basicInfo, [key]: !basicInfo[key as keyof typeof basicInfo] })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  basicInfo[key as keyof typeof basicInfo] ? 'bg-orange-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    basicInfo[key as keyof typeof basicInfo] ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-[13px] font-medium text-slate-700">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* ── 2. Pricing ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Package className="text-orange-500" size={20} />
          <h2 className="text-lg font-bold text-slate-900">Pricing & Inventory</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-1.5">
            <label className={labelClass}>Sale Price (PKR) *</label>
            <input
              type="number"
              min="0"
              step="1"
              className={inputClass}
              value={basicInfo.basePrice}
              onChange={(e) => setBasicInfo({ ...basicInfo, basePrice: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Compare Price (MRP)</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Original price (strikethrough)"
              className={inputClass}
              value={basicInfo.comparePrice || ''}
              onChange={(e) => setBasicInfo({ ...basicInfo, comparePrice: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Stock Quantity *</label>
            <input
              type="number"
              min="0"
              className={inputClass}
              value={basicInfo.baseStock}
              onChange={(e) => setBasicInfo({ ...basicInfo, baseStock: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Weight (grams)</label>
            <input
              type="number"
              min="0"
              placeholder="For shipping"
              className={inputClass}
              value={basicInfo.weight || ''}
              onChange={(e) => setBasicInfo({ ...basicInfo, weight: Number(e.target.value) })}
            />
          </div>
        </div>

        {/* Flash Sale */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-amber-600" />
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div
                onClick={() => setBasicInfo({ ...basicInfo, isFlashSale: !basicInfo.isFlashSale })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  basicInfo.isFlashSale ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    basicInfo.isFlashSale ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-[13px] font-bold text-amber-800">Enable Flash Sale</span>
            </label>
          </div>
          {basicInfo.isFlashSale && (
            <div className="space-y-1.5 max-w-xs">
              <label className="text-[12px] font-bold text-amber-700">Flash Sale Price (PKR)</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={basicInfo.flashSalePrice || ''}
                onChange={(e) => setBasicInfo({ ...basicInfo, flashSalePrice: Number(e.target.value) })}
              />
            </div>
          )}
        </div>
      </section>

      {/* ── 3. Attributes & Variants ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Settings2 className="text-orange-500" size={20} />
          <h2 className="text-lg font-bold text-slate-900">Attributes & Variants</h2>
        </div>

        {/* How-to guide */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2 text-[12px] text-blue-800">
          <p className="font-bold">How to add colours and sizes:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>
              <span className="font-semibold">Colour with HEX code</span> → Attribute Name: <code className="bg-blue-100 px-1 rounded">Color</code> &nbsp;|&nbsp; Values: <code className="bg-blue-100 px-1 rounded">#1A1A2E, #E94560, #F5A623</code>
              <span className="text-blue-500 ml-1">(circle swatch auto-generated from the code)</span>
            </li>
            <li>
              <span className="font-semibold">Size</span> → Attribute Name: <code className="bg-blue-100 px-1 rounded">Size</code> &nbsp;|&nbsp; Values: <code className="bg-blue-100 px-1 rounded">S, M, L, XL, XXL</code>
            </li>
            <li>
              After adding colours you will see separate <span className="font-semibold">image tabs per colour</span> in the Media section below — upload photos for each colour there.
            </li>
          </ul>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider">
                Attribute Name
              </label>
              <input
                type="text"
                placeholder="e.g.  Color  or  Size"
                className="w-full px-3 py-2 bg-white border rounded text-[13px] focus:outline-none"
                value={newAttributeName}
                onChange={(e) => setNewAttributeName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-600 uppercase tracking-wider">
                Values (comma separated)
              </label>
              <input
                type="text"
                placeholder={
                  newAttributeName.toLowerCase() === 'color'
                    ? '#1A1A2E, #E94560, #F5A623'
                    : newAttributeName.toLowerCase() === 'size'
                    ? 'S, M, L, XL, XXL'
                    : 'Value1, Value2, Value3'
                }
                className="w-full px-3 py-2 bg-white border rounded text-[13px] focus:outline-none"
                value={newAttributeValues}
                onChange={(e) => setNewAttributeValues(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleAddAttribute}
              className="px-4 py-2.5 bg-slate-900 text-white text-[13px] font-bold rounded flex items-center justify-center gap-2 hover:bg-black transition-all"
            >
              <Plus size={16} /> Add Attribute
            </button>
          </div>

          {attributes.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {attributes.map((attr, idx) => {
                const isColorAttr = attr.name.toLowerCase() === 'color';
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 bg-white border rounded-xl shadow-sm"
                  >
                    <span className="text-[12px] font-bold text-slate-700">{attr.name}:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {attr.values.map((val) => {
                        const valIsHex = isColorAttr && /^#([0-9A-Fa-f]{3}){1,2}$/.test(val.trim());
                        return (
                          <span
                            key={val}
                            className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border"
                          >
                            {valIsHex && (
                              <span
                                className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                                style={{ backgroundColor: val }}
                              />
                            )}
                            {val}
                          </span>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttribute(idx)}
                      className="text-slate-300 hover:text-red-500 transition-colors ml-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Size Guide */}
          {sizes.length > 0 && (
            <div className="pt-6 border-t space-y-4">
              <h3 className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">
                Size Guide Measurements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {sizes.map((size) => (
                  <div key={size} className="space-y-1.5">
                    <label className="text-[12px] font-bold text-slate-500">{size}</label>
                    <input
                      type="text"
                      placeholder="e.g. Chest 40', Length 28'"
                      className="w-full px-3 py-1.5 bg-white border rounded text-[13px] focus:outline-none"
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
              <p className="text-[12px] text-slate-500 italic">
                Generate all variant combinations from attributes above.
              </p>
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

        {/* Variants Grid */}
        {variants.length > 0 && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Variant</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">SKU</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Price</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Compare</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {variants.map((variant) => (
                  <tr key={variant.id}>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(variant.attributes).map(([k, v]) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 bg-slate-100 text-[11px] font-bold text-slate-600 rounded"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        className="w-full px-2 py-1 bg-slate-50 border-none rounded text-[12px] focus:outline-none"
                        value={variant.sku}
                        onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-24 px-2 py-1 bg-slate-50 border-none rounded text-[12px] focus:outline-none"
                        value={variant.price}
                        onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        placeholder="MRP"
                        className="w-24 px-2 py-1 bg-slate-50 border-none rounded text-[12px] focus:outline-none"
                        value={variant.comparePrice || ''}
                        onChange={(e) =>
                          updateVariant(variant.id, 'comparePrice', Number(e.target.value) || undefined)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-20 px-2 py-1 bg-slate-50 border-none rounded text-[12px] focus:outline-none"
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

      {/* ── 4. Media ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b">
          <ImageIcon className="text-orange-500" size={20} />
          <h2 className="text-lg font-bold text-slate-900">Media</h2>
        </div>

        {/* Image Tabs */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1 border-b">
            <button
              type="button"
              onClick={() => setActiveImageTab('main')}
              className={`px-4 py-2 text-[13px] font-bold transition-all ${
                activeImageTab === 'main'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Main Images
            </button>
            {colors.map((color) => {
              const isHex = /^#([0-9A-Fa-f]{3}){1,2}$/.test(color.trim());
              const countForColor = (colorImages[color] || []).length;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setActiveImageTab(color)}
                  className={`px-4 py-2 text-[13px] font-bold transition-all flex items-center gap-2 ${
                    activeImageTab === color
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: isHex ? color : color.toLowerCase().replace(/\s+/g, '') }}
                  />
                  <span>{isHex ? color : color}</span>
                  {countForColor > 0 && (
                    <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">
                      {countForColor}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
            {/* Active tab context */}
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              {activeImageTab !== 'main' && (() => {
                const isHex = /^#([0-9A-Fa-f]{3}){1,2}$/.test(activeImageTab.trim());
                return (
                  <span className="flex items-center gap-1.5 font-medium">
                    Adding images for colour:
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                      style={{ backgroundColor: isHex ? activeImageTab : activeImageTab.toLowerCase() }}
                    />
                    <code className="bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-700">
                      {activeImageTab}
                    </code>
                    — when customer selects this colour, these images will appear in gallery.
                  </span>
                );
              })()}
              {activeImageTab === 'main' && (
                <span>These are the default product images shown before any colour is selected.</span>
              )}
            </div>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Upload & URL row */}
            <div className="space-y-2">
              {/* File Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-orange-300 rounded-lg text-[13px] font-semibold text-orange-600 hover:border-orange-500 hover:bg-orange-50 transition-all disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Uploading to Cloudinary...
                  </>
                ) : (
                  <>
                    <Upload size={15} />
                    Upload from your computer (saves to Cloudinary)
                  </>
                )}
              </button>

              {/* URL input */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] text-slate-400 font-medium">OR paste URL</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Paste image URL (.jpg, .png, .webp) and press Enter"
                  className="flex-1 px-4 py-2 bg-white border rounded text-[13px] focus:outline-none"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-5 py-2 bg-slate-900 text-white text-[13px] font-bold rounded hover:bg-black transition-all"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {(activeImageTab === 'main'
                ? mainImages
                : colorImages[activeImageTab] || []
              ).map((url, i) => (
                <div
                  key={i}
                  className="group aspect-square relative bg-white border rounded overflow-hidden p-2"
                >
                  <img
                    src={url}
                    alt="Preview"
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
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

        {/* Video URL */}
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <Video size={16} className="text-orange-500" />
            <h3 className="text-[13px] font-bold text-slate-700">Product Video</h3>
            <span className="text-[11px] text-slate-400">(optional — shown at end of gallery)</span>
          </div>
          <input
            type="url"
            placeholder="Paste a direct video URL (.mp4)"
            className={inputClass}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          {videoUrl && (
            <video
              src={videoUrl}
              controls
              className="w-full max-h-48 rounded bg-black mt-2"
            />
          )}
        </div>
      </section>

      {/* ── 5. Specifications ── */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b">
          <List className="text-orange-500" size={20} />
          <h2 className="text-lg font-bold text-slate-900">Specifications</h2>
          <span className="text-[11px] text-slate-400 font-normal ml-1">
            Shown as a table on product page
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Property (e.g. Country of Origin)"
              className="flex-1 px-3 py-2 bg-slate-50 border rounded text-[13px] focus:outline-none"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
            />
            <input
              type="text"
              placeholder="Value (e.g. Pakistan)"
              className="flex-1 px-3 py-2 bg-slate-50 border rounded text-[13px] focus:outline-none"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpec())}
            />
            <button
              type="button"
              onClick={addSpec}
              className="px-4 py-2 bg-slate-900 text-white text-[13px] font-bold rounded hover:bg-black transition-all"
            >
              <Plus size={16} />
            </button>
          </div>

          {specifications.length > 0 && (
            <div className="bg-white border rounded-lg overflow-hidden">
              {specifications.map((spec, i) => (
                <div
                  key={i}
                  className="flex items-center px-4 py-2.5 border-b last:border-b-0 hover:bg-slate-50"
                >
                  <span className="text-[13px] font-semibold text-slate-600 w-48 flex-shrink-0">
                    {spec.key}
                  </span>
                  <span className="text-[13px] text-slate-700 flex-1">{spec.value}</span>
                  <button
                    type="button"
                    onClick={() => removeSpec(i)}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
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
          <span>{isEditing ? 'Update Product' : 'Save Product'}</span>
        </button>
      </div>
    </form>
  );
}
