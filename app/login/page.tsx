"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    console.log("Login result:", result);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.message || "Login failed");
    }
    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold tracking-tight text-black">HFB</span>
            <span className="text-gray-400">|</span>
            <span className="text-sm font-semibold uppercase tracking-wide text-black">
              Hot Forex Brokers
            </span>
          </div>
          <p className="text-xs text-gray-400 italic">Reviews You Can Trade On</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-8">
          <h1 className="text-lg font-bold uppercase tracking-wide text-black text-center mb-6">
            Admin Login
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent"
                placeholder="admin@hotforexbrokers.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#F5A623]"
                />
                <span className="text-xs text-gray-500">Remember me</span>
              </label>
              <a href="#" className="text-xs text-[#F5A623] font-semibold hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#F5A623] text-white text-sm font-bold uppercase rounded-md hover:opacity-90 transition-opacity mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#F5A623] font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-6">
          Copyright &copy; 2023 &ndash; All Rights Reserved. Hot Forex Brokers.
        </p>
      </div>
    </div>
  );
}
