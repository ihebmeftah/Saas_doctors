"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth.context";
import { ActiveAppointmentProvider } from "@/lib/contexts/active-appointment.context";
import Sidebar from "@/lib/components/Sidebar";
import DashboardHeader from "@/lib/components/DashboardHeader";
import ActiveAppointmentIndicator from "@/lib/components/ActiveAppointmentIndicator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push("/login");
      } else if (user.role === "patient") {
        // Patients should use the portal, not dashboard
        router.push("/portal");
      }
    }
  }, [user, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render dashboard for patients or unauthenticated users
  if (!user || user.role === "patient") {
    return null;
  }

  return (
    <ActiveAppointmentProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

          {/* Global Active Appointment Indicator */}
          <ActiveAppointmentIndicator />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ActiveAppointmentProvider>
  );
}
