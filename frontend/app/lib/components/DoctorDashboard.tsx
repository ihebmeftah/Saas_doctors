"use client";

import { useEffect, useState } from "react";
import { rdvService, DoctorStats } from "@/lib/services/rdv.service";
import { Rdv, RdvStatus } from "@/lib/models/rdv.model";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  appointments: Rdv[];
}

const statusColors: Record<RdvStatus, string> = {
  [RdvStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [RdvStatus.SCHEDULED]: "bg-blue-100 text-blue-800 border-blue-200",
  [RdvStatus.IN_PROGRESS]: "bg-purple-100 text-purple-800 border-purple-200",
  [RdvStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200",
  [RdvStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<RdvStatus, string> = {
  [RdvStatus.PENDING]: "Pending",
  [RdvStatus.SCHEDULED]: "Scheduled",
  [RdvStatus.IN_PROGRESS]: "In Progress",
  [RdvStatus.COMPLETED]: "Completed",
  [RdvStatus.CANCELLED]: "Cancelled",
};

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Rdv[]>([]);
  const [todayStats, setTodayStats] = useState<DoctorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, statsData] = await Promise.all([
        rdvService.getDoctorAppointments(),
        rdvService.getDoctorStats(),
      ]);
      setAppointments(appointmentsData);
      setTodayStats(statsData);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 6 weeks

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      const dayAppointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.rdvDate).toISOString().split("T")[0];
        return aptDate === dateStr;
      });

      days.push({
        date: new Date(d),
        isCurrentMonth: d.getMonth() === month,
        appointments: dayAppointments,
      });
    }

    return days;
  };

  const getDayAppointments = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.rdvDate).toISOString().split("T")[0];
      return aptDate === dateStr;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const calendarDays = getCalendarDays();
  const selectedDayAppointments = selectedDay
    ? getDayAppointments(selectedDay)
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage your appointments and view today&apos;s statistics
        </p>
      </div>

      {/* Today's Statistics */}
      {todayStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {todayStats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {todayStats.completed}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {todayStats.scheduled}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {todayStats.inProgress}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar and Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((day, index) => (
              <div
                key={index}
                onClick={() => setSelectedDay(day.date)}
                className={`
                  min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all
                  ${
                    !day.isCurrentMonth
                      ? "bg-gray-50 text-gray-400"
                      : "bg-white hover:bg-blue-50"
                  }
                  ${
                    isToday(day.date)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }
                  ${
                    selectedDay?.toDateString() === day.date.toDateString()
                      ? "ring-2 ring-blue-500"
                      : ""
                  }
                `}
              >
                <div className="text-sm font-medium mb-1">
                  {day.date.getDate()}
                </div>
                {day.appointments.length > 0 && (
                  <div className="space-y-1">
                    {day.appointments.slice(0, 2).map((apt, i) => (
                      <div
                        key={i}
                        className={`text-xs px-1 py-0.5 rounded truncate ${
                          statusColors[apt.status]
                        }`}
                      >
                        {formatTime(apt.rdvDate)}
                      </div>
                    ))}
                    {day.appointments.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{day.appointments.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Appointments */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {selectedDay
              ? selectedDay.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })
              : "Select a day"}
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {selectedDay && selectedDayAppointments.length > 0 ? (
              selectedDayAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {apt.patient.firstName} {apt.patient.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatTime(apt.rdvDate)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        statusColors[apt.status]
                      }`}
                    >
                      {statusLabels[apt.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Reason:</span> {apt.reason}
                  </p>
                  {apt.clinique && (
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Clinic:</span>{" "}
                      {apt.clinique.name}
                    </p>
                  )}
                </div>
              ))
            ) : selectedDay ? (
              <p className="text-gray-500 text-center py-8">
                No appointments for this day
              </p>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Select a day to view appointments
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Today's Appointments List */}
      {todayStats && todayStats.appointments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Today&apos;s
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clinic
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayStats.appointments
                  .sort(
                    (a, b) =>
                      new Date(a.rdvDate).getTime() -
                      new Date(b.rdvDate).getTime()
                  )
                  .map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(apt.rdvDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {apt.patient.firstName} {apt.patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {apt.patient.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {apt.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                            statusColors[apt.status]
                          }`}
                        >
                          {statusLabels[apt.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {apt.clinique?.name}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
