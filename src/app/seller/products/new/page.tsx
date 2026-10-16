"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { Category } from "@/types";

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form Fields
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [craftDetails, setCraftDetails] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Variants state
  const [variants, setVariants] = useState<
    { name: string; option: string; priceDelta: string; stock: string }[]
  >([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories for dropdown
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        // Extract categories
        const catsMap = new Map();
        data.products?.forEach((p: { category?: Category }) => {
          if (p.category) catsMap.set(p.category.id, p.category);
        });
        const cats = Array.from(catsMap.values());
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id);
      })
      .catch((err) => console.error("Error fetching categories:", err))
      .finally(() => setLoadingCategories(false));
  }, []);

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { name: "Size", option: "Regular", priceDelta: "0", stock: "5" },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (
    index: number,
    field: "name" | "option" | "priceDelta" | "stock",
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !categoryId || !price) {
      setError("Please fill in all required fields (Title, Category, Price, Description)");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title,
        description,
        categoryId,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock: parseInt(stock) || 10,
        tags,
        craftDetails,
        careInstructions,
        imageUrl:
          imageUrl.trim() ||
          "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
        variants: variants.map((v) => ({
          name: v.name,
          option: v.option,
          priceDelta: parseFloat(v.priceDelta) || 0,
          stock: parseInt(v.stock) || 5,
        })),
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish product");
      }

      router.push("/seller/products");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while creating product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Image Presets for rapid seller demonstration
  const imagePresets = [
    {
      label: "Speckled Stoneware",
      url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    },
    {
      label: "Botanical Jewelry",
      url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    },
    {
      label: "Soy Candle Jar",
      url: "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?auto=format&fit=crop&w=800&q=80",
    },
    {
      label: "DIY Embroidery",
      url: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <div>
        <Link
          href="/seller/products"
          className="text-xs font-semibold text-brand-stone hover:text-brand-terracotta flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Catalog</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-brand-terracotta flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Studio Creation</span>
        </span>
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal mt-1">
          Publish a Handcrafted Product
        </h1>
        <p className="text-xs text-brand-stone mt-1">
          Provide craftsmanship details, pricing, variants, and photography for your public storefront.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Product Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-soft space-y-5">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal pb-2 border-b border-brand-clay/40">
            Basic Information
          </h2>

          <div>
            <label className="block text-xs font-semibold text-brand-charcoal mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hand-thrown Matcha Bowl with Thumb Rest"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Initial Inventory Stock *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-charcoal mb-1">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share the story, tactile texture, dimensions, and feel of this piece..."
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30 resize-none"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-soft space-y-5">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal pb-2 border-b border-brand-clay/40">
            Pricing
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Price (USD $) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="45.00"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Compare-at Price (optional strikethrough original value)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="55.00"
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
              />
            </div>
          </div>
        </div>

        {/* Product Imagery */}
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-brand-clay/40">
            <h2 className="font-serif text-lg font-bold text-brand-charcoal">
              Photography &amp; Visuals
            </h2>
            <ImageIcon className="w-4 h-4 text-brand-stone" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-charcoal mb-1">
              Primary Image URL (HTTPS)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <p className="text-[11px] font-semibold text-brand-stone mb-2">
              Or pick an artisanal preset for instant demo:
            </p>
            <div className="flex flex-wrap gap-2">
              {imagePresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className="px-3 py-1.5 rounded-full border border-brand-clay bg-brand-cream/60 text-xs font-medium text-brand-charcoal hover:bg-brand-sand transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Variants */}
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-brand-clay/40">
            <div>
              <h2 className="font-serif text-lg font-bold text-brand-charcoal">
                Variants &amp; Options (Optional)
              </h2>
              <p className="text-xs text-brand-stone">Add sizes, scents, or finishes</p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 rounded-full bg-brand-cream border border-brand-clay text-xs font-bold text-brand-charcoal hover:bg-brand-sand flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Option</span>
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-xs text-brand-stone italic">
              No variants added. This product sells as a single standard piece.
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-3 rounded-2xl bg-brand-cream/40 border border-brand-clay items-center text-xs"
                >
                  <div>
                    <label className="text-[10px] font-bold text-brand-stone">Option Type</label>
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => handleVariantChange(i, "name", e.target.value)}
                      placeholder="Size, Scent..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-brand-clay bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-brand-stone">Option Value</label>
                    <input
                      type="text"
                      value={v.option}
                      onChange={(e) => handleVariantChange(i, "option", e.target.value)}
                      placeholder="Large, Rose Gold..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-brand-clay bg-white text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-brand-stone">Price Delta ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={v.priceDelta}
                      onChange={(e) => handleVariantChange(i, "priceDelta", e.target.value)}
                      placeholder="+0.00"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-brand-clay bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-brand-stone">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={(e) => handleVariantChange(i, "stock", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-brand-clay bg-white text-xs"
                    />
                  </div>

                  <div className="pt-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(i)}
                      className="p-1.5 rounded-lg text-brand-stone hover:text-red-500 hover:bg-red-50"
                      title="Remove variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Craftsmanship & Ethics */}
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-soft space-y-5">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal pb-2 border-b border-brand-clay/40">
            Craftsmanship &amp; Care Details
          </h2>

          <div>
            <label className="block text-xs font-semibold text-brand-charcoal mb-1">
              Materials &amp; Firing / Craft Techniques
            </label>
            <input
              type="text"
              value={craftDetails}
              onChange={(e) => setCraftDetails(e.target.value)}
              placeholder="e.g. Hand-thrown iron stoneware, fired to cone 6 (1220°C). 100% food safe."
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-charcoal mb-1">
              Care Instructions
            </label>
            <input
              type="text"
              value={careInstructions}
              onChange={(e) => setCareInstructions(e.target.value)}
              placeholder="e.g. Dishwasher and microwave safe. Gentle handwash recommended."
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-charcoal mb-1">
              Tags (comma-separated for search discovery)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="pottery, mug, stoneware, kitchen, handmade"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href="/seller/products"
            className="px-6 py-3 rounded-full border border-brand-clay text-xs font-semibold text-brand-stone hover:bg-brand-sand transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary text-xs px-8 py-3.5 shadow-clay flex items-center gap-2 font-bold"
          >
            {submitting ? (
              <span>Publishing...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish to Storefront</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
