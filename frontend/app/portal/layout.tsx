"use client";

import Link from "next/link";
import { useAuth } from "@/lib/contexts/auth.context";
import { UserRole } from "@/lib/models/user.model";
import { User, LogOut } from "lucide-react";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const isPatient = user && user.role === UserRole.PATIENT;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/portal" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Clinic Portal
              </span>
            </Link>

            <nav className="flex items-center space-x-1 sm:space-x-6">
              <Link
                href="/portal"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
              >
                Home
              </Link>
              <Link
                href="/portal/clinics"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
              >
                Clinics
              </Link>
              <Link
                href="/portal/services"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
              >
                Services
              </Link>

              {isPatient ? (
                <>
                  <Link
                    href="/portal/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors ml-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ml-2"
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">About Us</h3>
              <p className="text-gray-600 text-sm">
                Connecting patients with trusted healthcare clinics and
                professionals for better health outcomes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/portal/clinics"
                    className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
                  >
                    Browse Clinics
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal/services"
                    className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
                  >
                    View Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-blue-600 text-sm transition-colors"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
              <p className="text-gray-600 text-sm">
                Have questions? We&apos;re here to help.
              </p>
            </div>
          </div>
          <div className="border-t pt-6">
            <p className="text-center text-gray-600 text-sm">
              © {new Date().getFullYear()} Clinic Portal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
