"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { db, Appointment, UserProfile } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Scissors, User as UserIcon, Calendar, Star, LogOut, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login?redirect=/dashboard");
        return;
      }

      const [profileData, apptsData] = await Promise.all([
        db.getProfile(session.user.id),
        db.getUserAppointments(session.user.id)
      ]);

      setProfile(profileData);
      setAppointments(apptsData);
      setLoading(false);
    }
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  const pointsTarget = 10;
  const isAwardReached = (profile?.loyalty_points || 0) >= pointsTarget;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Navigation / Header */}
        <header className="flex justify-between items-center bg-zinc-950/50 p-4 rounded-2xl border border-zinc-900 glass">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
              <Scissors className="text-gold w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight hidden sm:inline">MODERN BARBER</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
                <UserIcon className="text-gold w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{profile?.name || "Premium User"}</span>
            </div>
            <button onClick={handleLogout}>
              <LogOut className="text-zinc-600 hover:text-white transition-colors w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content: Loyalty Card & Welcome */}
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">Hola, {profile?.name?.split(" ")[0] || "Cliente"}</h1>
              <p className="text-zinc-500">Es un placer tenerte de vuelta. Aquí está tu progreso.</p>
            </section>

            {/* Loyalty Card */}
            <section className="relative overflow-hidden group">
              <div className="absolute inset-0 bg-gold blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative glass p-8 md:p-12 rounded-[2rem] border border-gold/20 shadow-2xl shadow-gold/5">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <h2 className="text-2xl font-bold italic mb-2 tracking-tight">TARJETA DE FIDELIDAD</h2>
                    <p className="text-zinc-500 text-sm">Completa 10 servicios y obtén un corte gratis</p>
                  </div>
                  <div className="bg-gold text-black px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase">
                    GOLD MEMBER
                  </div>
                </div>

                {/* Stamped Points Grid */}
                <div className="grid grid-cols-5 gap-4 md:gap-8 mb-12">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const loyaltyPoints = profile?.loyalty_points || 0;
                    const isFilled = i < loyaltyPoints;
                    const isNext = i === loyaltyPoints;
                    
                    return (
                      <div key={i} className="aspect-square flex items-center justify-center relative">
                        <div className={`w-full h-full rounded-2xl border-2 transition-all duration-500 flex items-center justify-center ${
                          isFilled 
                            ? "bg-gold border-gold shadow-[0_0_20px_rgba(212,175,55,0.4)]" 
                            : isNext 
                              ? "border-gold/50 border-dashed animate-pulse" 
                              : "border-zinc-800 bg-zinc-950/50"
                        }`}>
                          {isFilled ? (
                            <Star className="text-black fill-black w-6 h-6 md:w-8 md:h-8" />
                          ) : (
                            <span className="text-zinc-800 font-mono text-xl">{i + 1}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {isAwardReached ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gold p-6 rounded-2xl text-black text-center space-y-2 font-bold"
                  >
                    <Star className="mx-auto w-8 h-8 mb-2" />
                    <p className="text-xl uppercase tracking-tighter">¡FELICITACIONES!</p>
                    <p className="text-sm font-medium opacity-80">Tienes un corte de cortesía disponible.</p>
                  </motion.div>
                ) : (
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-zinc-500 font-mono italic">Faltan {10 - (profile?.loyalty_points || 0)} para el premio</span>
                    <Link href="/book" className="text-gold flex items-center gap-1 hover:underline group">
                      Agendar servicio <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar: Appointments & Shortcuts */}
          <div className="space-y-8">
            <section className="glass p-8 rounded-3xl border border-zinc-900 space-y-6">
              <h3 className="font-bold flex items-center gap-2">
                <Calendar className="text-gold w-5 h-5" />
                Próximas Citas
              </h3>
              
              {appointments.length > 0 ? (
                appointments.map(appt => (
                  <div key={appt.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-gold bg-gold/10 px-2 py-1 rounded">
                        {appt.service?.name || "Servicio"}
                      </span>
                      <span className="text-[10px] text-zinc-600 font-mono">ID: {appt.id.slice(0, 5)}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{new Date(appt.appointment_date).toLocaleDateString()}</span>
                      <span className="text-zinc-500 text-sm">{appt.appointment_date.split("T")[1].substring(0, 5)} HS</span>
                    </div>
                    <Button variant="secondary" size="sm" className="w-full text-xs">Modificar</Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 space-y-4">
                  <p className="text-zinc-500 text-sm">No tienes citas pendientes.</p>
                  <Link href="/book">
                    <Button variant="outline" size="sm" className="w-full">Agendar ahora</Button>
                  </Link>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
