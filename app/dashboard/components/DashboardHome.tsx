"use client";

import {
  TrendingUp,
  Users,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  trendLabel: string;
}

const stats: StatCard[] = [
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
];

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's your clinic overview.
        </p>
      </div>

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
                {[
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
                ].map((appointment, index) => (
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
