"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Mail, Lock, ArrowLeft, User as UserIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "register") {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          setError("¡Registro exitoso! Por favor verifica tu email.");
        }
      } else {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        // Verificar el rol para redireccionar
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <Link 
        href="/" 
        className="fixed top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-gold transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Volver al inicio</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-10 rounded-3xl border border-zinc-900"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center border border-zinc-800 mb-6">
            <Scissors className="text-gold w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "login" ? "Bienvenido" : "Crea tu cuenta"}
          </h1>
          <p className="text-zinc-500 mt-2 text-center">
            {mode === "login" 
              ? "Ingresa a tu experiencia premium" 
              : "Únete a nuestra selecta clientela"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <AnimatePresence mode="wait">
            {mode === "register" && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-zinc-400 ml-1">Nombre Completo</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-gold transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-gold transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-zinc-400">Contraseña</label>
              {mode === "login" && (
                <button type="button" className="text-xs text-gold hover:underline">¿Olvidaste tu contraseña?</button>
              )}
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-gold transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-gold transition-all"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 text-lg font-bold mt-4 h-16" 
            size="lg"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : mode === "login" ? (
              "Iniciar Sesión"
            ) : (
              "Registrarme"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-500">
          {mode === "login" ? (
            <>
              ¿No tienes una cuenta?{" "}
              <button 
                onClick={() => setMode("register")}
                className="text-gold font-bold hover:underline"
              >
                Crea una aquí
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button 
                onClick={() => setMode("login")}
                className="text-gold font-bold hover:underline"
              >
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </motion.div>

      <p className="mt-12 text-zinc-700 text-xs tracking-widest uppercase">
        Modern Barber & Beauty Experience
      </p>
    </div>
  );
}
