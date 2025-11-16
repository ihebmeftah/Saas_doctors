"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface AuthUser {
  email: string;
  name: string;
  role: "admin" | "doctor" | "receptionist";
  clinic?: string;
}

export default function Header() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Initialize user from localStorage on first render
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeUser = () => {
    if (!isInitialized && typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch {
          // Invalid user data
        }
      }
      setIsInitialized(true);
    }
  };

  // Call initialization on first render
  if (!isInitialized) {
    initializeUser();
  }

  const handleLogout = () => {
    // Clear authentication cookie
    document.cookie = "authToken=; path=/; max-age=0";
    document.cookie = "sessionToken=; path=/; max-age=0";
    router.push("/auth/login");
  };

  const getRoleDisplay = () => {
    if (!user) return "User";
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  const getInitials = () => {
    if (!user) return "US";
    return user.name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case "admin":
        return "bg-blue-600";
      case "doctor":
        return "bg-green-600";
      case "receptionist":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search patients, appointments..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notification Bell */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={20} />
          </button>

          {/* User Profile with Dropdown */}
          <div className="relative border-l border-gray-200 pl-4">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || "Dr. Admin"}
                </p>
                <p className="text-xs text-gray-500">{getRoleDisplay()}</p>
              </div>
              <div
                className={`w-10 h-10 ${getRoleColor()} rounded-full flex items-center justify-center text-white font-bold text-sm`}
              >
                {getInitials()}
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{user?.email}</p>
                  {user?.clinic && (
                    <p className="text-xs text-gray-500 mt-1">{user.clinic}</p>
                  )}
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push("/dashboard/profile");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                  >
                    <User size={16} />
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      router.push("/dashboard/settings");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                  >
                    <Settings size={16} />
                    Settings
                  </button>

                  <hr className="my-2" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
