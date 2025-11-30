"use client";

import { useEffect, useState } from "react";
import { rdvService } from "@/lib/services/rdv.service";
import { userService } from "@/lib/services/user.service";
import { useAuth } from "@/lib/contexts/auth.context";
import { Rdv, RdvStatus } from "@/lib/models/rdv.model";
import { User } from "@/lib/models/user.model";
import CreateAppointmentModal from "./CreateAppointmentModal";
import CreateEditUserModal from "./CreateEditUserModal";

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

export default function ReceptionistDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Rdv[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, patientsData] = await Promise.all([
        rdvService.getReceptionistAppointments(),
        userService.getPatients(),
      ]);
      setAppointments(appointmentsData);
      setPatients(patientsData);

      // Load doctors if user has a clinic
      const userWithClinic: User & { clinique?: { id: string; name: string } } =
        user as User & { clinique?: { id: string; name: string } };
      if (userWithClinic?.clinique?.id) {
        const doctorsData = await userService.getDoctorsByClinic(
          userWithClinic.clinique.id
        );
        setDoctors(doctorsData);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
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

  const getTodayAppointments = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return appointments.filter((apt) => {
      const aptDate = new Date(apt.rdvDate);
      return aptDate >= today && aptDate < tomorrow;
    });
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter((apt) => new Date(apt.rdvDate) >= now);
  };

  const todayAppointments = getTodayAppointments();
  const upcomingAppointments = getUpcomingAppointments();

  const todayStats = {
    total: todayAppointments.length,
    pending: todayAppointments.filter((apt) => apt.status === RdvStatus.PENDING)
      .length,
    scheduled: todayAppointments.filter(
      (apt) => apt.status === RdvStatus.SCHEDULED
    ).length,
    completed: todayAppointments.filter(
      (apt) => apt.status === RdvStatus.COMPLETED
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Receptionist Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            {(user as User & { clinique?: { id: string; name: string } })
              ?.clinique?.name || "Manage appointments and patients"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPatientModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            New Patient
          </button>
          <button
            onClick={() => setShowAppointmentModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Appointment
          </button>
        </div>
      </div>

      {/* Today's Statistics */}
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
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {todayStats.pending}
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Upcoming Appointments ({upcomingAppointments.length})
        </h2>
        <div className="overflow-x-auto">
          {upcomingAppointments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingAppointments
                  .sort(
                    (a, b) =>
                      new Date(a.rdvDate).getTime() -
                      new Date(b.rdvDate).getTime()
                  )
                  .map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(apt.rdvDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(apt.rdvDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {apt.patient.firstName} {apt.patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {apt.patient.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {apt.doctor.firstName} {apt.doctor.lastName}
                        </div>
                        {apt.doctor.speciality && (
                          <div className="text-sm text-gray-500">
                            {apt.doctor.speciality}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
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
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No upcoming appointments
            </p>
          )}
        </div>
      </div>

      {/* Modals */}
      {(user as User & { clinique?: { id: string; name: string } })
        ?.clinique && (
        <CreateAppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          clinicId={
            (user as User & { clinique?: { id: string; name: string } })
              .clinique!.id
          }
          doctors={doctors}
          patients={patients}
          onSuccess={loadData}
        />
      )}

      <CreateEditUserModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        defaultRole="patient"
        onSubmit={async (data) => {
          await userService.createPatient({
            firstName: data.firstName!,
            lastName: data.lastName!,
            email: data.email!,
            password: data.password || "Patient@123",
            phone: data.phone!,
            age: data.age ? parseInt(data.age) : undefined,
            gender: data.gender || undefined,
            address: data.address || undefined,
            cin: data.cin || undefined,
          });
          await loadData();
        }}
      />
    </div>
  );
}
