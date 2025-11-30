"use client";

import { useEffect, useState } from "react";
import {
  rdvService,
  DoctorStats,
  DoctorPatient,
} from "@/lib/services/rdv.service";
import { Rdv, RdvStatus } from "@/lib/models/rdv.model";

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
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, statsData, patientsData] = await Promise.all([
        rdvService.getDoctorAppointments(),
        rdvService.getDoctorStats(),
        rdvService.getDoctorPatients(),
      ]);
      setAppointments(appointmentsData);
      setTodayStats(statsData);
      setPatients(patientsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyStats = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weekAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.rdvDate);
      return aptDate >= weekStart && aptDate < weekEnd;
    });

    return {
      total: weekAppointments.length,
      completed: weekAppointments.filter(
        (apt) => apt.status === RdvStatus.COMPLETED
      ).length,
      upcoming: weekAppointments.filter(
        (apt) =>
          apt.status === RdvStatus.SCHEDULED || apt.status === RdvStatus.PENDING
      ).length,
    };
  };

  const getMonthlyStats = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.rdvDate);
      return aptDate >= monthStart && aptDate <= monthEnd;
    });

    return {
      total: monthAppointments.length,
      completed: monthAppointments.filter(
        (apt) => apt.status === RdvStatus.COMPLETED
      ).length,
      cancelled: monthAppointments.filter(
        (apt) => apt.status === RdvStatus.CANCELLED
      ).length,
    };
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const weeklyStats = getWeeklyStats();
  const monthlyStats = getMonthlyStats();

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

      {/* Weekly and Monthly Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Stats */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            This Week&apos;s Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-blue-600">
                  {weeklyStats.total}
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
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {weeklyStats.completed}
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
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {weeklyStats.upcoming}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
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
        </div>

        {/* Monthly Stats */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            This Month&apos;s Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-purple-600">
                  {monthlyStats.total}
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {monthlyStats.completed}
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
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {monthlyStats.cancelled}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Patients */}
      {patients.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Patients
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Visits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Diagnosis
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.slice(0, 10).map((patientData, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patientData.patient.firstName}{" "}
                        {patientData.patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patientData.patient.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(patientData.lastConsultation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {patientData.totalConsultations} visits
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {patientData.lastDiagnosis || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
