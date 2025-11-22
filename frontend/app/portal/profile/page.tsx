"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/contexts/auth.context";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@/lib/models/user.model";
import { userService } from "@/lib/services/user.service";
import {
  User as UserIcon,
  Calendar,
  FileText,
  CreditCard,
  Loader2,
} from "lucide-react";
import ProfileInfo from "@/lib/components/portal/ProfileInfo";
import MyAppointments from "@/lib/components/portal/MyAppointments";
import MyInvoices from "@/lib/components/portal/MyInvoices";
import MyPayments from "@/lib/components/portal/MyPayments";
type TabType = "profile" | "appointments" | "invoices" | "payments";

export default function ProfilePage() {
  const { user: authUser, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [patientUser, setPatientUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const loadPatientDetails = useCallback(async () => {
    if (!authUser) return;

    try {
      setLoadingUser(true);
      const fullUser = await userService.getById(authUser.id, UserRole.PATIENT);
      setPatientUser(fullUser);
    } catch (error) {
      console.error("Failed to load user details:", error);
    } finally {
      setLoadingUser(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (!loading) {
      if (!authUser) {
        // Not logged in, redirect to login
        router.push("/login");
      } else if (authUser.role !== "patient") {
        // Non-patients should use the dashboard
        router.push("/dashboard");
      } else {
        // Load patient details
        loadPatientDetails();
      }
    }
  }, [authUser, loading, router, loadPatientDetails]);

  if (loading || loadingUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!patientUser || !authUser || authUser.role !== "patient") {
    return null;
  }

  const tabs = [
    {
      id: "profile" as TabType,
      label: "Profile",
      icon: UserIcon,
    },
    {
      id: "appointments" as TabType,
      label: "Appointments",
      icon: Calendar,
    },
    {
      id: "invoices" as TabType,
      label: "Invoices",
      icon: FileText,
    },
    {
      id: "payments" as TabType,
      label: "Payments",
      icon: CreditCard,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {patientUser.firstName} {patientUser.lastName}!
          </h1>
          <p className="text-blue-100">
            Manage your profile, appointments, and medical records
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                      ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "profile" && <ProfileInfo user={patientUser} />}
            {activeTab === "appointments" && <MyAppointments />}
            {activeTab === "invoices" && <MyInvoices />}
            {activeTab === "payments" && <MyPayments />}
          </div>
        </div>
      </div>
    </div>
  );
}
