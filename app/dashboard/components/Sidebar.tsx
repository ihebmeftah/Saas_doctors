"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Building2,
} from "lucide-react";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  submenu?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Clinics",
    href: "/dashboard/clinics",
    icon: <Building2 size={20} />,
  },
  {
    label: "Patients",
    href: "/dashboard/patients",
    icon: <Users size={20} />,
  },
  {
    label: "Appointments",
    href: "/dashboard/appointments",
    icon: <Calendar size={20} />,
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: <FileText size={20} />,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings size={20} />,
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleSubmenu = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:static top-0 left-0 h-screen w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-transform duration-300 z-40 overflow-y-auto`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">MD</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">MedClinic</h1>
              <p className="text-xs text-blue-200">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4">
          {sidebarItems.map((item) => (
            <div key={item.label}>
              <button
                onClick={() => item.submenu && toggleSubmenu(item.label)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-3 flex-1"
                  onClick={(e) => {
                    if (item.submenu) {
                      e.preventDefault();
                    }
                  }}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
                {item.submenu && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      expandedItems.includes(item.label) ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {/* Submenu */}
              {item.submenu && expandedItems.includes(item.label) && (
                <div className="ml-8 mt-2 space-y-2">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.label}
                      href={subitem.href}
                      className="block px-4 py-2 rounded-lg text-sm text-blue-100 hover:bg-blue-500 transition-colors"
                    >
                      {subitem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-500">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
