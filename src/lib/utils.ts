import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format integer minor units (cents) into user-friendly currency string (e.g. 2400 -> "$24.00")
 */
export function formatCurrency(
  cents: number | null | undefined,
  currency = "USD",
  locale = "en-US"
): string {
  if (cents === null || cents === undefined || isNaN(cents)) return "$0.00";
  const amount = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate a clean URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Generate human-readable unique order number
 */
export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MM-${dateStr}-${randomSuffix}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length = 100): string {
  if (!text || text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}
