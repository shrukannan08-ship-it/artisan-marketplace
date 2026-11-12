"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Mail, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"request" | "update">("request");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setMode("update");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setMode("update");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isSupabaseConfigured()) {
      setError("Password reset via email requires Supabase Authentication to be configured.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage("If an account matches that email, a password reset link has been sent.");
      }
    } catch {
      setError("Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage("Your password has been updated. Redirecting you back...");
        setTimeout(() => router.push("/auth/customer/login"), 1400);
      }
    } catch {
      setError("Unable to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md clay-card p-7 sm:p-9 space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#F4E3DC] text-[#C86D51] flex items-center justify-center mx-auto shadow-inner">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#3E2A23]">
            {mode === "update" ? "Set New Password" : "Reset Your Password"}
          </h1>
          <p className="text-sm text-[#7A635A]">
            {mode === "update"
              ? "Choose a fresh password for your Mitti & Muse account."
              : "Enter your account email and we will send a secure reset link."}
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-[#FCECEA] border border-[#E5A7A0] px-4 py-3 text-sm text-[#A94438]">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-2xl bg-[#EDF5F0] border border-[#BBD6C6] px-4 py-3 text-sm text-[#2F5D46] flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {mode === "request" ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6F5850]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9C847B] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="clay-input w-full pl-11 pr-4 py-3 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="clay-btn w-full py-3 rounded-full bg-[#C86D51] text-white font-semibold text-sm hover:bg-[#B85E43] disabled:opacity-60"
            >
              {loading ? "Sending Reset Link..." : "Send Password Reset Link"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6F5850]">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="clay-input w-full px-4 py-3 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6F5850]">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="clay-input w-full px-4 py-3 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="clay-btn w-full py-3 rounded-full bg-[#5E8773] text-white font-semibold text-sm hover:bg-[#4E7461] disabled:opacity-60"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-[#EADED6] flex items-center justify-between text-xs font-medium text-[#7A635A]">
          <Link href="/auth/customer/login" className="inline-flex items-center gap-1 hover:text-[#C86D51]">
            <ArrowLeft className="w-3.5 h-3.5" />
            Customer Login
          </Link>
          <Link href="/auth/owner/login" className="hover:text-[#5E8773]">
            Maker Studio Login
          </Link>
        </div>
      </div>
    </div>
  );
}
