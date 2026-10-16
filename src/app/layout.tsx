import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

export const metadata: Metadata = {
  title: "Mitti & Muse — Premium Artisan Marketplace & Independent Storefronts",
  description:
    "A curated digital sanctuary for independent artisans, boutique entrepreneurs, women-led small businesses, and handmade product creators.",
  keywords: [
    "artisan marketplace",
    "handmade pottery",
    "botanical jewelry",
    "craft kits",
    "independent brands",
    "women-led business",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-brand-cream text-brand-charcoal font-sans antialiased selection:bg-brand-terracotta/20">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
