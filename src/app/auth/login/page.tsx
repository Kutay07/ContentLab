"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Orb from "@/app/auth/login/Orb";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormHovered, setIsFormHovered] = useState(false);

  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(username, password, false);
      if (success) {
        router.push("/");
      } else {
        setError("Geçersiz kullanıcı adı veya şifre");
      }
    } catch (err) {
      setError("Giriş yapılırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4">
      {/* Background */}
      {/* <div className="absolute inset-0 overflow-hidden bg-[#000000]"> */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#5e3039] via-[#111c14] to-slate-950">
        <Orb
          hoverIntensity={1.0}
          rotateOnHover={true}
          hue={200}
          forceHoverState={isFormHovered}
        />
      </div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div
          className="bg-white/5 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-white/10"
          onMouseEnter={() => setIsFormHovered(true)}
          onMouseLeave={() => setIsFormHovered(false)}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Giriş Yap</h1>
            <p className="text-white/80 text-sm">Hesabınızla devam edin</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-400/20 rounded-lg backdrop-blur-sm">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                Kullanıcı Adı
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all backdrop-blur-sm"
                placeholder="Kullanıcı adınızı girin"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/90 mb-2"
              >
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all backdrop-blur-sm"
                  placeholder="Şifrenizi girin"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/60 hover:text-white/80 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white/15 hover:bg-white/25 disabled:bg-white/5 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent backdrop-blur-sm border border-white/15 hover:border-white/30"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Giriş yapılıyor...
                </div>
              ) : (
                "Giriş"
              )}
            </button>
          </form>

          {/* Demo Info */}
          {/* <div className="mt-8 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/15">
            <p className="text-sm text-white/80 text-center mb-3">
              <strong>Test Hesapları:</strong>
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs text-white/70">
              <div className="text-center">admin / admin123</div>
              <div className="text-center">demo / demo123</div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
