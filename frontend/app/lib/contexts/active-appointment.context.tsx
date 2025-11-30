"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./auth.context";
import { UserRole } from "../models/user.model";
import { rdvService } from "../services/rdv.service";
import { Rdv, RdvStatus } from "../models/rdv.model";

interface ActiveAppointmentContextType {
  activeAppointment: Rdv | null;
  refreshActiveAppointment: () => Promise<void>;
  hasActiveAppointment: boolean;
}

const ActiveAppointmentContext = createContext<
  ActiveAppointmentContextType | undefined
>(undefined);

export function ActiveAppointmentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [activeAppointment, setActiveAppointment] = useState<Rdv | null>(null);

  useEffect(() => {
    // Early return if not a doctor
    if (user?.role !== UserRole.DOCTOR) {
      return;
    }

    const loadActiveAppointment = async () => {
      try {
        const appointments = await rdvService.getDoctorAppointments();
        const inProgress = appointments.find(
          (apt) => apt.status === RdvStatus.IN_PROGRESS
        );
        setActiveAppointment(inProgress || null);
      } catch (error) {
        console.error("Failed to load active appointment:", error);
      }
    };

    loadActiveAppointment();
    // Poll every 10 seconds to check for updates
    const interval = setInterval(loadActiveAppointment, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const refreshActiveAppointment = async () => {
    if (user?.role !== UserRole.DOCTOR) {
      setActiveAppointment(null);
      return;
    }

    try {
      const appointments = await rdvService.getDoctorAppointments();
      const inProgress = appointments.find(
        (apt) => apt.status === RdvStatus.IN_PROGRESS
      );
      setActiveAppointment(inProgress || null);
    } catch (error) {
      console.error("Failed to load active appointment:", error);
    }
  };

  return (
    <ActiveAppointmentContext.Provider
      value={{
        activeAppointment,
        refreshActiveAppointment,
        hasActiveAppointment: !!activeAppointment,
      }}
    >
      {children}
    </ActiveAppointmentContext.Provider>
  );
}

export function useActiveAppointment() {
  const context = useContext(ActiveAppointmentContext);
  if (context === undefined) {
    throw new Error(
      "useActiveAppointment must be used within ActiveAppointmentProvider"
    );
  }
  return context;
}
