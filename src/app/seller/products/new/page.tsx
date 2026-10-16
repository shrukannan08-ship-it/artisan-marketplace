"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Upload,
  Loader2,
  Eye,
  FileText,
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
  const [status, setStatus] = useState<"ACTIVE" | "DRAFT">("ACTIVE");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [craftDetails, setCraftDetails] = useState("");
  const [careInstructions, setCareInstructions] = useState("");

  // Imagery
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Variants state
  const [variants, setVariants] = useState<
    { name: string; option: string; priceDelta: string; stock: string }[]
  >([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories from dedicated API
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
          setCategoryId(data.categories[0].id);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err))
      .finally(() => setLoadingCategories(false));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Only JPG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image file size must be less than 10MB.");
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Image upload failed");
      }

      setImageUrl(data.url);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setUploadError(err.message);
      } else {
        setUploadError("Failed to upload image.");
      }
    } finally {
      setUploadingImage(false);
    }
  };

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
        status,
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
          Provide craftsmanship details, real photography, pricing, and variants for your public storefront.
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
              {loadingCategories ? (
                <div className="text-xs text-brand-stone py-2">Loading categories...</div>
              ) : (
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
              )}
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

        {/* Pricing & Publication Status */}
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-soft space-y-5">
          <h2 className="font-serif text-lg font-bold text-brand-charcoal pb-2 border-b border-brand-clay/40">
            Pricing &amp; Publication Status
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                Compare-at Price (optional)
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

            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Listing Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "ACTIVE" | "DRAFT")}
                className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30 font-medium"
              >
                <option value="ACTIVE">Active (Publish to Marketplace)</option>
                <option value="DRAFT">Draft (Save in Private Atelier)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Imagery */}
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-6 sm:p-8 shadow-soft space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-brand-clay/40">
            <div>
              <h2 className="font-serif text-lg font-bold text-brand-charcoal">
                Photography &amp; Visuals
              </h2>
              <p className="text-xs text-brand-stone">Upload genuine photographs of your creation</p>
            </div>
            <ImageIcon className="w-4 h-4 text-brand-stone" />
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              {uploadError}
            </div>
          )}

          {/* File Upload Zone */}
          <div className="border-2 border-dashed border-brand-clay rounded-2xl p-6 text-center hover:border-brand-terracotta transition-colors bg-brand-cream/30">
            <input
              type="file"
              id="product-image-upload"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileUpload}
              disabled={uploadingImage}
              className="hidden"
            />
            <label
              htmlFor="product-image-upload"
              className="cursor-pointer block space-y-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-brand-clay flex items-center justify-center mx-auto text-brand-terracotta shadow-soft">
                {uploadingImage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-brand-charcoal hover:underline">
                  {uploadingImage ? "Uploading Craft Image..." : "Click to Upload Product Photo"}
                </span>
                <span className="text-[11px] text-brand-stone block mt-0.5">
                  PNG, JPG, or WebP up to 10MB
                </span>
              </div>
            </label>
          </div>

          {/* Or Manual URL */}
          <div>
            <label className="block text-xs font-semibold text-brand-charcoal mb-1">
              Or specify an Image URL directly
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or uploaded URL"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
            />
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="p-3 rounded-2xl bg-brand-cream/40 border border-brand-clay flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden relative border border-brand-clay shrink-0">
                <Image
                  src={imageUrl}
                  alt="Product preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="text-xs truncate">
                <span className="font-semibold text-brand-charcoal block">Image Loaded</span>
                <span className="text-brand-stone text-[11px] truncate block">{imageUrl}</span>
              </div>
            </div>
          )}
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
              <span>Saving Creation...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {status === "ACTIVE" ? "Publish to Storefront" : "Save as Draft"}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
