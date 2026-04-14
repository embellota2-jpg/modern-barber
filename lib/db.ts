import { supabase } from "./supabase";

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  service_id: string;
  appointment_date: string;
  status: string;
  service?: Service;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  loyalty_points: number;
  role: string;
}

export const db = {
  // Servicios
  async getServices(): Promise<Service[]> {
    const { data } = await supabase.from("services").select("*").order("price", { ascending: true });
    return data || [];
  },

  // Perfiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    return data;
  },

  async createProfile(id: string, name: string, email: string) {
    return await supabase.from("profiles").insert([{ id, name, email, loyalty_points: 0, role: "client" }]);
  },

  // Citas
  async getUserAppointments(userId: string): Promise<Appointment[]> {
    const { data } = await supabase
      .from("appointments")
      .select("*, service:services(*)")
      .eq("user_id", userId)
      .order("appointment_date", { ascending: true });
    return data || [];
  },

  async getAppointments(): Promise<Appointment[]> {
    const { data } = await supabase
      .from("appointments")
      .select("*, service:services(*)")
      .order("appointment_date", { ascending: true });
    return data || [];
  },

  async addAppointment(appointment: Partial<Appointment>) {
    return await supabase.from("appointments").insert([appointment]);
  },

  async completeAppointment(appointmentId: string, userId: string, currentPoints: number) {
    await supabase.from("appointments").update({ status: "completed" }).eq("id", appointmentId);
    return await supabase.from("profiles").update({ loyalty_points: currentPoints + 1 }).eq("id", userId);
  }
};
