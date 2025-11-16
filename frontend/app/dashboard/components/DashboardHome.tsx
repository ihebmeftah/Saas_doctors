"use client";

import { useState } from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
} from "lucide-react";

interface Clinic {
  id: string;
  name: string;
  capacity: number;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  trendLabel: string;
}

// Available clinics
const clinics: Clinic[] = [
  {
    id: "1",
    name: "Downtown Medical Center",
    capacity: 100,
  },
  {
    id: "2",
    name: "Uptown Health Clinic",
    capacity: 75,
  },
  {
    id: "3",
    name: "Westside Care Center",
    capacity: 60,
  },
];

// Dashboard data per clinic
const clinicDashboardData: Record<
  string,
  { stats: StatCard[]; appointments: Array<any> }
> = {
  "1": {
    stats: [
      {
        label: "Total Patients",
        value: "1,234",
        icon: <Users className="text-blue-600" size={24} />,
        trend: 12,
        trendLabel: "from last month",
      },
      {
        label: "Appointments Today",
        value: "28",
        icon: <Calendar className="text-green-600" size={24} />,
        trend: 5,
        trendLabel: "from yesterday",
      },
      {
        label: "Pending Consultations",
        value: "12",
        icon: <Clock className="text-orange-600" size={24} />,
        trend: -3,
        trendLabel: "from last week",
      },
      {
        label: "Revenue",
        value: "$12,500",
        icon: <TrendingUp className="text-purple-600" size={24} />,
        trend: 23,
        trendLabel: "from last month",
      },
    ],
    appointments: [
      {
        name: "John Doe",
        dateTime: "Nov 6, 2024 - 10:00 AM",
        status: "Completed",
        doctor: "Dr. Smith",
      },
      {
        name: "Jane Smith",
        dateTime: "Nov 6, 2024 - 11:30 AM",
        status: "In Progress",
        doctor: "Dr. Johnson",
      },
      {
        name: "Robert Brown",
        dateTime: "Nov 6, 2024 - 2:00 PM",
        status: "Scheduled",
        doctor: "Dr. Williams",
      },
      {
        name: "Emily Davis",
        dateTime: "Nov 7, 2024 - 9:00 AM",
        status: "Scheduled",
        doctor: "Dr. Smith",
      },
      {
        name: "Michael Wilson",
        dateTime: "Nov 7, 2024 - 3:00 PM",
        status: "Cancelled",
        doctor: "Dr. Johnson",
      },
    ],
  },
  "2": {
    stats: [
      {
        label: "Total Patients",
        value: "987",
        icon: <Users className="text-blue-600" size={24} />,
        trend: 8,
        trendLabel: "from last month",
      },
      {
        label: "Appointments Today",
        value: "22",
        icon: <Calendar className="text-green-600" size={24} />,
        trend: 3,
        trendLabel: "from yesterday",
      },
      {
        label: "Pending Consultations",
        value: "8",
        icon: <Clock className="text-orange-600" size={24} />,
        trend: -2,
        trendLabel: "from last week",
      },
      {
        label: "Revenue",
        value: "$9,200",
        icon: <TrendingUp className="text-purple-600" size={24} />,
        trend: 18,
        trendLabel: "from last month",
      },
    ],
    appointments: [
      {
        name: "Sarah Johnson",
        dateTime: "Nov 6, 2024 - 9:00 AM",
        status: "Completed",
        doctor: "Dr. Brown",
      },
      {
        name: "David Lee",
        dateTime: "Nov 6, 2024 - 12:00 PM",
        status: "In Progress",
        doctor: "Dr. Garcia",
      },
      {
        name: "Lisa White",
        dateTime: "Nov 6, 2024 - 3:00 PM",
        status: "Scheduled",
        doctor: "Dr. Brown",
      },
    ],
  },
  "3": {
    stats: [
      {
        label: "Total Patients",
        value: "756",
        icon: <Users className="text-blue-600" size={24} />,
        trend: 15,
        trendLabel: "from last month",
      },
      {
        label: "Appointments Today",
        value: "18",
        icon: <Calendar className="text-green-600" size={24} />,
        trend: 7,
        trendLabel: "from yesterday",
      },
      {
        label: "Pending Consultations",
        value: "5",
        icon: <Clock className="text-orange-600" size={24} />,
        trend: -1,
        trendLabel: "from last week",
      },
      {
        label: "Revenue",
        value: "$7,800",
        icon: <TrendingUp className="text-purple-600" size={24} />,
        trend: 21,
        trendLabel: "from last month",
      },
    ],
    appointments: [
      {
        name: "Thomas Anderson",
        dateTime: "Nov 6, 2024 - 8:00 AM",
        status: "Completed",
        doctor: "Dr. Martinez",
      },
      {
        name: "Emma Taylor",
        dateTime: "Nov 6, 2024 - 10:30 AM",
        status: "In Progress",
        doctor: "Dr. Taylor",
      },
      {
        name: "James Wilson",
        dateTime: "Nov 6, 2024 - 1:00 PM",
        status: "Scheduled",
        doctor: "Dr. Martinez",
      },
    ],
  },
};

export default function DashboardHome() {
  const [selectedClinic, setSelectedClinic] = useState("1");

  const selectedClinicData = clinics.find((c) => c.id === selectedClinic);
  const dashboardData =
    clinicDashboardData[selectedClinic] || clinicDashboardData["1"];
  const stats = dashboardData.stats;
  const appointments = dashboardData.appointments;
  return (
    <div className="space-y-8">
      {/* Header with Clinic Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's your clinic overview.
          </p>
        </div>

        {/* Clinic Selector Dropdown */}
        <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <Building2 size={20} className="text-blue-600 flex-shrink-0" />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Select Building
            </label>
            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            >
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selected Clinic Info */}
      {selectedClinicData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedClinicData.name}
            </h2>
          </div>
          <p className="text-sm text-gray-600">
            Showing data and statistics for this clinic location
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Total Capacity: {selectedClinicData.capacity} patients
          </p>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1 mt-3">
                  {stat.trend >= 0 ? (
                    <ArrowUpRight className="text-green-600" size={16} />
                  ) : (
                    <ArrowDownRight className="text-red-600" size={16} />
                  )}
                  <span
                    className={
                      stat.trend >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {Math.abs(stat.trend)}%
                  </span>
                  <span className="text-xs text-gray-500">
                    {stat.trendLabel}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Appointments
            </h2>
            <a
              href="#"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Patient Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Doctor
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {appointment.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {appointment.dateTime}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : appointment.status === "In Progress"
                            ? "bg-blue-100 text-blue-700"
                            : appointment.status === "Scheduled"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {appointment.doctor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats / Sidebar */}
        <div className="space-y-6">
          {/* Clinic Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Clinic Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Open Hours</span>
                <span className="text-sm font-medium text-gray-900">
                  9:00 AM - 6:00 PM
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Today's Visitors</span>
                <span className="text-sm font-medium text-gray-900">45</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Availability</span>
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Upcoming Tasks</h3>
            <div className="space-y-3">
              {[
                "Review patient reports",
                "Staff meeting at 3 PM",
                "Update inventory",
                "Approve prescriptions",
              ].map((task, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-2 rounded hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{task}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
