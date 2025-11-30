"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth.context";
import { rdvService } from "@/lib/services/rdv.service";
import { RdvStatus } from "@/lib/models/rdv.model";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  speciality?: string;
}

interface Appointment {
  id: string;
  rdvDate: string;
  reason?: string;
  status: RdvStatus;
  patient: Patient;
  doctor: Doctor;
  examination?: string;
  diagnosis?: string;
  treatment?: string;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [changingStatus, setChangingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadAppointments();
  }, [user, router]);

  useEffect(() => {
    filterAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, appointments]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await rdvService.getReceptionistAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    if (!selectedDate) {
      setFilteredAppointments(appointments);
      return;
    }

    const filtered = appointments.filter((apt) => {
      const aptDate = new Date(apt.rdvDate).toISOString().split("T")[0];
      return aptDate === selectedDate;
    });

    setFilteredAppointments(filtered);
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: RdvStatus.SCHEDULED | RdvStatus.CANCELLED
  ) => {
    try {
      setChangingStatus(appointmentId);
      await rdvService.changeStatus(appointmentId, { status: newStatus });
      await loadAppointments();
    } catch (error) {
      console.error("Failed to change status:", error);
      alert("Failed to change appointment status");
    } finally {
      setChangingStatus(null);
    }
  };

  const getStatusColor = (status: RdvStatus): { bg: string; text: string } => {
    switch (status) {
      case RdvStatus.PENDING:
        return { bg: "bg-gray-100", text: "text-gray-800" };
      case RdvStatus.SCHEDULED:
        return { bg: "bg-blue-100", text: "text-blue-800" };
      case RdvStatus.IN_PROGRESS:
        return { bg: "bg-yellow-100", text: "text-yellow-800" };
      case RdvStatus.COMPLETED:
        return { bg: "bg-green-100", text: "text-green-800" };
      case RdvStatus.CANCELLED:
        return { bg: "bg-red-100", text: "text-red-800" };
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleClearFilter = () => {
    setSelectedDate("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Appointment Management
        </h1>
        <p className="mt-2 text-gray-600">View and manage all appointments</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label
              htmlFor="date-filter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filter by Date
            </label>
            <input
              id="date-filter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleClearFilter}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Show All
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadAppointments}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Showing {filteredAppointments.length} of {appointments.length}{" "}
          appointments
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No appointments found for the selected date
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => {
                  const statusColors = getStatusColor(appointment.status);
                  const isChanging = changingStatus === appointment.id;

                  return (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(appointment.rdvDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patient.firstName}{" "}
                          {appointment.patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.patient.phone ||
                            appointment.patient.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {appointment.doctor.firstName}{" "}
                          {appointment.doctor.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.doctor.speciality}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {appointment.reason || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors.bg} ${statusColors.text}`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {appointment.status === RdvStatus.PENDING && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  appointment.id,
                                  RdvStatus.SCHEDULED
                                )
                              }
                              disabled={isChanging}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isChanging ? "..." : "Schedule"}
                            </button>
                          )}
                          {(appointment.status === RdvStatus.PENDING ||
                            appointment.status === RdvStatus.SCHEDULED) && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  appointment.id,
                                  RdvStatus.CANCELLED
                                )
                              }
                              disabled={isChanging}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isChanging ? "..." : "Cancel"}
                            </button>
                          )}
                          {appointment.status === RdvStatus.IN_PROGRESS && (
                            <span className="text-yellow-600 text-xs">
                              In consultation
                            </span>
                          )}
                          {appointment.status === RdvStatus.COMPLETED && (
                            <span className="text-green-600 text-xs">
                              Completed
                            </span>
                          )}
                          {appointment.status === RdvStatus.CANCELLED && (
                            <span className="text-red-600 text-xs">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
        {[
          {
            label: "Total",
            value: filteredAppointments.length,
            color: "bg-gray-100",
          },
          {
            label: "Pending",
            value: filteredAppointments.filter(
              (a) => a.status === RdvStatus.PENDING
            ).length,
            color: "bg-gray-100",
          },
          {
            label: "Scheduled",
            value: filteredAppointments.filter(
              (a) => a.status === RdvStatus.SCHEDULED
            ).length,
            color: "bg-blue-100",
          },
          {
            label: "Completed",
            value: filteredAppointments.filter(
              (a) => a.status === RdvStatus.COMPLETED
            ).length,
            color: "bg-green-100",
          },
          {
            label: "Cancelled",
            value: filteredAppointments.filter(
              (a) => a.status === RdvStatus.CANCELLED
            ).length,
            color: "bg-red-100",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} rounded-lg p-4 text-center`}
          >
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
