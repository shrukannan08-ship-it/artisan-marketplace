"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  X,
  Send,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderItemData {
  id: string;
  orderId: string;
  orderNumber: string;
  productTitle: string;
  variantName?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  fulfillmentStatus: string;
  trackingNumber?: string | null;
  shippingCourier?: string | null;
  createdAt: string;
  order: {
    orderNumber: string;
    shippingAddress: string;
    user?: { name: string; email: string } | null;
    guestName?: string | null;
    guestEmail?: string | null;
  };
  product?: {
    images?: { url: string }[];
  };
}

export default function SellerOrdersPage() {
  const [orderItems, setOrderItems] = useState<OrderItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  // Modal state
  const [selectedItem, setSelectedItem] = useState<OrderItemData | null>(null);
  const [newStatus, setNewStatus] = useState("PROCESSING");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingCourier, setShippingCourier] = useState("USPS");
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/seller/orders");
      if (res.ok) {
        const data = await res.json();
        setOrderItems(data.orderItems || []);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenModal = (item: OrderItemData) => {
    setSelectedItem(item);
    setNewStatus(item.fulfillmentStatus || "PROCESSING");
    setTrackingNumber(item.trackingNumber || "");
    setShippingCourier(item.shippingCourier || "USPS");
  };

  const handleUpdateFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setUpdating(true);
    try {
      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderItemId: selectedItem.id,
          fulfillmentStatus: newStatus,
          trackingNumber: trackingNumber.trim() || null,
          shippingCourier: shippingCourier.trim() || null,
        }),
      });

      if (res.ok) {
        setOrderItems((prev) =>
          prev.map((item) =>
            item.id === selectedItem.id
              ? {
                  ...item,
                  fulfillmentStatus: newStatus,
                  trackingNumber,
                  shippingCourier,
                }
              : item
          )
        );
        setSelectedItem(null);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders =
    selectedFilter === "ALL"
      ? orderItems
      : orderItems.filter((i) => i.fulfillmentStatus === selectedFilter);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-xs text-brand-stone">Loading studio orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-brand-terracotta">
          Fulfillment Studio
        </span>
        <h1 className="font-serif text-3xl font-bold text-brand-charcoal mt-1">
          Orders &amp; Shipments ({orderItems.length})
        </h1>
        <p className="text-xs text-brand-stone mt-1">
          Review customer purchases, prepare parcels, and provide courier tracking numbers.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {["ALL", "PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedFilter(st)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              selectedFilter === st
                ? "bg-brand-terracotta text-white shadow-xs"
                : "bg-white border border-brand-clay text-brand-stone hover:text-brand-charcoal"
            }`}
          >
            {st} ({st === "ALL" ? orderItems.length : orderItems.filter((i) => i.fulfillmentStatus === st).length})
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-brand-clay/70 p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-brand-sand flex items-center justify-center mx-auto text-brand-stone">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-brand-charcoal">
            No orders in this status
          </h3>
          <p className="text-xs text-brand-stone max-w-sm mx-auto">
            All caught up! New orders placed by patrons will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((item) => {
            const customerName =
              item.order.user?.name || item.order.guestName || "Customer";
            const customerEmail =
              item.order.user?.email || item.order.guestEmail || "";

            let address: { street?: string; city?: string; state?: string; postalCode?: string } = {};
            try {
              address = JSON.parse(item.order.shippingAddress);
            } catch {
              // fallback
            }

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-brand-clay/70 p-6 shadow-soft space-y-4 hover:border-brand-stone/40 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-brand-clay/40 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-base text-brand-charcoal">
                      {item.order.orderNumber}
                    </span>
                    <span className="text-brand-stone">
                      Placed on {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        item.fulfillmentStatus === "SHIPPED"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.fulfillmentStatus === "DELIVERED"
                          ? "bg-brand-sage-light text-brand-sage-dark border-brand-sage/20"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {item.fulfillmentStatus}
                    </span>

                    <button
                      onClick={() => handleOpenModal(item)}
                      className="px-3.5 py-1.5 rounded-full bg-brand-cream border border-brand-clay text-xs font-semibold text-brand-charcoal hover:bg-brand-sand transition-colors"
                    >
                      Update Status
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Product Details */}
                  <div className="md:col-span-6 flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-brand-sand shrink-0">
                      <Image
                        src={
                          item.product?.images?.[0]?.url ||
                          "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=200&q=80"
                        }
                        alt={item.productTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-brand-charcoal">
                        {item.productTitle}
                      </h4>
                      {item.variantName && (
                        <p className="text-xs text-brand-stone">{item.variantName}</p>
                      )}
                      <p className="text-xs text-brand-charcoal font-semibold mt-1">
                        Qty: {item.quantity} × {formatCurrency(item.unitPrice)} ={" "}
                        <span className="text-brand-terracotta">{formatCurrency(item.totalPrice)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Customer & Destination */}
                  <div className="md:col-span-6 text-xs text-brand-stone space-y-1 md:border-l md:border-brand-clay/40 md:pl-6">
                    <p className="font-bold text-brand-charcoal">{customerName} ({customerEmail})</p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-terracotta shrink-0" />
                      <span>
                        {address.street}, {address.city}, {address.state} {address.postalCode}
                      </span>
                    </p>
                    {item.trackingNumber && (
                      <p className="text-brand-charcoal font-medium pt-1 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-brand-sage" />
                        <span>
                          {item.shippingCourier || "Courier"}: <strong className="font-mono">{item.trackingNumber}</strong>
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fulfillment Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 bg-brand-charcoal/50 backdrop-blur-xs"
          />

          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-elevated border border-brand-clay z-10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-clay/40">
              <h3 className="font-serif text-lg font-bold text-brand-charcoal">
                Update Fulfillment
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-full hover:bg-brand-sand text-brand-stone"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFulfillment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                  Status Transition
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none"
                >
                  <option value="PENDING">PENDING (Awaiting Crafting)</option>
                  <option value="PROCESSING">PROCESSING (Packaging Parcel)</option>
                  <option value="SHIPPED">SHIPPED (Handed to Courier)</option>
                  <option value="DELIVERED">DELIVERED (Completed)</option>
                  <option value="CANCELLED">CANCELLED (Refunded)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                  Shipping Courier
                </label>
                <select
                  value={shippingCourier}
                  onChange={(e) => setShippingCourier(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none"
                >
                  <option value="USPS Priority Mail">USPS Priority Mail</option>
                  <option value="FedEx Express">FedEx Express</option>
                  <option value="UPS Ground">UPS Ground</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="Local Courier / Artisan Drop">Local Courier / Artisan Drop</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 9400 1000 0000 0000 0000"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-brand-cream/50 border border-brand-clay focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-5 py-2 rounded-full border border-brand-clay text-xs font-semibold text-brand-stone hover:bg-brand-sand"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary text-xs px-6 py-2.5 flex items-center gap-1.5"
                >
                  {updating ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Status</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
