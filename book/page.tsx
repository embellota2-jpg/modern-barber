"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { db, Service } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Calendar as CalendarIcon, Clock, CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login?redirect=/book");
        return;
      }
      setUser(session.user);

      const servicesData = await db.getServices();
      setServices(servicesData);
      setLoading(false);
    }
    init();
  }, [router]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const confirmBooking = async () => {
    if (selectedServiceId && selectedDate && selectedTime && user) {
      setSubmitting(true);
      try {
        await db.addAppointment({
          user_id: user.id,
          service_id: selectedServiceId,
          appointment_date: `${selectedDate}T${selectedTime}:00Z`,
          status: "pending",
        });
        setStep(4);
      } catch (error) {
        alert("Error al reservar: " + (error as any).message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-gold transition-colors">
              <Scissors className="text-gold w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight">MODERN BARBER</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 uppercase tracking-widest">
            <span className={cn(step >= 1 && "text-gold")}>Servicio</span>
            <div className="w-4 h-px bg-zinc-800" />
            <span className={cn(step >= 2 && "text-gold")}>Fecha</span>
            <div className="w-4 h-px bg-zinc-800" />
            <span className={cn(step >= 3 && "text-gold")}>Confirmar</span>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-4xl font-bold italic">Selecciona un servicio</h1>
                <p className="text-zinc-500">¿Qué ritual realizaremos hoy?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={cn(
                      "flex flex-col p-6 rounded-2xl border transition-all text-left",
                      selectedServiceId === service.id 
                        ? "bg-gold/10 border-gold shadow-lg shadow-gold/5" 
                        : "bg-zinc-950 border-zinc-900 hover:border-zinc-700"
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={cn(
                        "text-xl font-bold",
                        selectedServiceId === service.id ? "text-gold" : "text-white"
                      )}>
                        {service.name}
                      </h3>
                      <span className="text-xl font-mono">${service.price / 100}</span>
                    </div>
                    <p className="text-zinc-500 text-sm flex-1">{service.description}</p>
                    <div className="mt-6 flex items-center text-xs text-zinc-400 uppercase tracking-widest">
                      <Clock className="w-4 h-4 mr-2" />
                      {service.duration} MINUTOS
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-8">
                <Button 
                  disabled={!selectedServiceId} 
                  onClick={handleNext} 
                  size="lg"
                  className="rounded-full px-12"
                >
                  Continuar <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-4xl font-bold italic">Elige el momento</h1>
                <p className="text-zinc-500">Reserva tu espacio en nuestra agenda.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                   <label className="block text-sm font-medium text-zinc-400 uppercase tracking-widest">Fecha</label>
                   <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white text-xl focus:outline-none focus:border-gold transition-all color-scheme-dark"
                      min={new Date().toISOString().split("T")[0]}
                   />
                </div>
                <div className="space-y-6">
                   <label className="block text-sm font-medium text-zinc-400 uppercase tracking-widest">Horarios Disponibles</label>
                   <div className="grid grid-cols-3 gap-3">
                      {["09:00", "10:00", "11:00", "15:00", "16:00", "17:00", "18:00"].map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "py-4 rounded-xl border text-sm font-mono transition-all",
                            selectedTime === time
                              ? "bg-gold border-gold text-black"
                              : "bg-zinc-950 border-zinc-900 hover:border-zinc-500"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              <div className="flex justify-between pt-8">
                <Button variant="ghost" onClick={handleBack}>
                  <ArrowLeft className="mr-2 w-5 h-5" /> Volver
                </Button>
                <Button 
                  disabled={!selectedDate || !selectedTime} 
                  onClick={handleNext} 
                  size="lg"
                  className="rounded-full px-12"
                >
                  Revisar <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto space-y-8 text-center"
            >
              <div className="space-y-2">
                <h1 className="text-4xl font-bold italic">Confirma tu cita</h1>
                <p className="text-zinc-500">Todo listo para tu transformación.</p>
              </div>

              <div className="glass p-10 rounded-3xl border border-zinc-800 text-left space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-zinc-800/50">
                  <span className="text-zinc-500">Servicio</span>
                  <span className="font-bold text-xl">{services.find(s => s.id === selectedServiceId)?.name}</span>
                </div>
                <div className="flex justify-between items-center pb-6 border-b border-zinc-800/50">
                  <span className="text-zinc-500">Fecha</span>
                  <span className="font-bold">{selectedDate}</span>
                </div>
                <div className="flex justify-between items-center pb-6 border-b border-zinc-800/50">
                  <span className="text-zinc-500">Hora</span>
                  <span className="font-bold">{selectedTime}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gold font-bold">Total a pagar</span>
                  <span className="text-3xl font-mono text-gold">${(services.find(s => s.id === selectedServiceId)?.price || 0) / 100}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  disabled={submitting}
                  onClick={confirmBooking} 
                  size="lg" 
                  className="rounded-full py-8 text-lg uppercase tracking-widest"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : "Reservar Ahora"}
                </Button>
                <Button variant="ghost" onClick={handleBack} disabled={submitting}>
                  Editar detalles
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 space-y-8"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gold blur-3xl opacity-20 animate-pulse" />
                <CheckCircle2 className="w-24 h-24 text-gold relative" />
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl font-bold italic tracking-tighter">¡Cita Agendada!</h1>
                <p className="text-zinc-500 max-w-sm mx-auto">
                  Te hemos enviado los detalles a tu correo. ¡Nos vemos pronto!
                </p>
              </div>
              <div className="flex justify-center flex-col sm:flex-row gap-4 pt-10">
                <Button size="lg" onClick={() => router.push("/")} className="rounded-full px-12">
                  Volver al inicio
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="rounded-full px-12">
                    Mi Cuenta
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
