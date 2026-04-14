"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { db, Service } from "@/lib/db";
import { motion } from "framer-motion";
import { Scissors, Calendar, MapPin, MessageSquare, Star, Loader2 } from "lucide-react";

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      const data = await db.getServices();
      setServices(data);
      setLoading(false);
    }
    loadServices();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-gold selection:text-black">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.png"
            alt="Luxury Barbershop"
            fill
            className="object-cover opacity-60 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-px bg-gold self-center" />
              <Scissors className="text-gold mx-4 w-8 h-8" />
              <div className="w-16 h-px bg-gold self-center" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
              MODERN <span className="text-gold italic">BARBER</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Donde la tradición se encuentra con la vanguardia. 
              Experiencia premium diseñada para el hombre moderno.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book">
                <Button size="lg" className="rounded-full shadow-lg shadow-gold/20">
                  <Calendar className="mr-2 w-5 h-5" />
                  Agendar Cita
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="rounded-full">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">Deslizar</span>
          <div className="w-px h-12 bg-gradient-to-b from-gold to-transparent" />
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-4 bg-zinc-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Servicios Exclusivos</h2>
            <p className="text-zinc-500">Todo lo que necesitas para tu estilo impecable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[400px]">
            {loading ? (
              <div className="col-span-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-gold animate-spin" />
              </div>
            ) : services.length > 0 ? (
              services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass p-8 rounded-2xl border border-zinc-900 group hover:border-gold/50 transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-6 group-hover:bg-gold transition-colors duration-500">
                    <Star className="text-gold group-hover:text-black w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                  <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-gold font-bold text-lg">${service.price / 100}</span>
                    <span className="text-zinc-600 text-xs uppercase tracking-widest">{service.duration} MIN</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-zinc-600">
                No hay servicios disponibles en este momento.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Location/Contact Section */}
      <section className="py-24 px-4 border-t border-zinc-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">Ubicación & Contacto</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-zinc-900">
                  <MapPin className="text-gold" />
                </div>
                <div>
                  <h4 className="font-bold">Nuestra Sede</h4>
                  <p className="text-zinc-500">Av. Lujo 123, Barrio Premium, Ciudad</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-zinc-900">
                  <MessageSquare className="text-gold" />
                </div>
                <div>
                  <h4 className="font-bold">WhatsApp</h4>
                  <p className="text-zinc-500">+1 (234) 567-890</p>
                </div>
              </div>
            </div>
            <Button variant="secondary" className="w-full md:w-auto">
              Ver en Google Maps
            </Button>
          </div>
          <div className="flex-1 w-full aspect-video rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 relative">
             <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                [ Map Component Placeholder ]
             </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/something"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-8 right-8 z-50 p-4 bg-emerald-500 text-white rounded-full shadow-2xl hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
          ¿En qué podemos ayudarte?
        </span>
      </a>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 text-center text-zinc-600 text-sm">
        <p>© 2026 MODERN BARBER & BEAUTY. Reservados todos los derechos.</p>
      </footer>
    </div>
  );
}
