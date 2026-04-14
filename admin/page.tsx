"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { db, Appointment, Service } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, 
  Users, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Search, 
  TrendingUp,
  Clock,
  LayoutDashboard,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const [localAppts, setLocalAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndLoad() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login?redirect=/admin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      const data = await db.getAppointments();
      setLocalAppts(data);
      setLoading(false);
    }
    checkAuthAndLoad();
  }, [router]);

  const handleComplete = async (appt: Appointment) => {
    try {
      // Necesitamos los puntos actuales del usuario para incrementarlos
      const { data: profile } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", appt.user_id)
        .single();

      await db.completeAppointment(appt.id, appt.user_id, profile?.loyalty_points || 0);
      
      // Refresh local state
      const updatedData = await db.getAppointments();
      setLocalAppts(updatedData);
    } catch (error) {
      alert("Error completando cita: " + (error as any).message);
    }
  };

  const pendingCount = localAppts.filter(a => a.status === "pending").length;
  const completedCount = localAppts.filter(a => a.status === "completed").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar Admin */}
      <aside className="w-64 border-r border-zinc-900 p-6 hidden md:flex flex-col gap-8 bg-zinc-950/50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
            <Scissors className="text-black w-5 h-5" />
          </div>
          <span className="font-black tracking-tighter text-lg uppercase">Barber Admin</span>
        </div>

        <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gold text-black rounded-xl font-bold transition-all">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-900 rounded-xl transition-all">
            <Calendar className="w-5 h-5" /> Citas
          </button>
        </nav>

        <div className="mt-auto">
          <button onClick={() => { supabase.auth.signOut(); router.push("/"); }} className="flex items-center gap-3 px-4 py-3 text-zinc-600 hover:text-white transition-all text-sm">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 space-y-10 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass p-6 rounded-3xl border border-zinc-900 space-y-2">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Pendientes</p>
            <p className="text-3xl font-bold">{pendingCount}</p>
          </div>
          <div className="glass p-6 rounded-3xl border border-zinc-900 space-y-2">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Completados</p>
            <p className="text-3xl font-bold">{completedCount}</p>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex flex-col md:row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold">Gestión de Citas</h2>
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
               <input 
                  type="text" 
                  placeholder="Buscar servicio..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-gold transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden glass">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-zinc-900/50 border-b border-zinc-900">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Servicio</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Horario</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">Estado</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500 text-right">Acción</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                   <AnimatePresence>
                     {localAppts.filter(a => 
                        a.service?.name.toLowerCase().includes(searchTerm.toLowerCase())
                     ).map((appt) => (
                          <motion.tr 
                            key={appt.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-zinc-900/30 transition-colors group"
                          >
                             <td className="px-6 py-5 text-sm">
                                <span className="px-3 py-1 rounded-full bg-zinc-900 text-zinc-400 text-[10px] font-black uppercase tracking-tighter">
                                   {appt.service?.name}
                                </span>
                             </td>
                             <td className="px-6 py-5">
                                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                   <Clock className="w-4 h-4" />
                                   {new Date(appt.appointment_date).toLocaleString()}
                                </div>
                             </td>
                             <td className="px-6 py-5">
                                <div className={cn(
                                   "flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest",
                                   appt.status === "completed" ? "text-emerald-500" : "text-amber-500"
                                )}>
                                   {appt.status === "completed" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                   {appt.status === "completed" ? "Completado" : "Pendiente"}
                                </div>
                             </td>
                             <td className="px-6 py-5 text-right">
                                {appt.status === "pending" && (
                                   <div className="flex justify-end gap-2">
                                      <button 
                                        onClick={() => handleComplete(appt)}
                                        className="p-2 rounded-lg bg-zinc-900 hover:bg-emerald-500/20 text-emerald-500 transition-all border border-transparent hover:border-emerald-500/50"
                                      >
                                         <CheckCircle2 className="w-5 h-5" />
                                      </button>
                                   </div>
                                )}
                             </td>
                          </motion.tr>
                        ))}
                   </AnimatePresence>
                </tbody>
             </table>
             
             {localAppts.length === 0 && (
                <div className="py-20 text-center text-zinc-600">
                   No hay citas programadas para hoy.
                </div>
             )}
          </div>
        </section>
      </main>
    </div>
  );
}
