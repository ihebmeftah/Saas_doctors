"use client";

import { useEffect, useState } from "react";
import { rdvService } from "@/lib/services/rdv.service";
import { Rdv, RdvStatus } from "@/lib/models/rdv.model";
import { Calendar, Clock, MapPin, User, FileText, Loader2 } from "lucide-react";

const statusColors = {
  [RdvStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [RdvStatus.SCHEDULED]: "bg-blue-100 text-blue-800",
  [RdvStatus.IN_PROGRESS]: "bg-purple-100 text-purple-800",
  [RdvStatus.COMPLETED]: "bg-green-100 text-green-800",
  [RdvStatus.CANCELLED]: "bg-red-100 text-red-800",
};

const statusLabels = {
  [RdvStatus.PENDING]: "Pending",
  [RdvStatus.SCHEDULED]: "Scheduled",
  [RdvStatus.IN_PROGRESS]: "In Progress",
  [RdvStatus.COMPLETED]: "Completed",
  [RdvStatus.CANCELLED]: "Cancelled",
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Rdv[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await rdvService.getMyAppointments();
      // Sort by date, newest first
      const sorted = data.sort(
        (a, b) => new Date(b.rdvDate).getTime() - new Date(a.rdvDate).getTime()
      );
      setAppointments(sorted);
    } catch {
      setError("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No appointments found</p>
        <p className="text-gray-400 text-sm mt-2">
          Your appointments will appear here once scheduled
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>

      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {appointment.reason}
                </h3>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[appointment.status]
                  }`}
                >
                  {statusLabels[appointment.status]}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${appointment.amount}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Appointment Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(appointment.rdvDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">
                    {new Date(appointment.rdvDate).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Doctor</p>
                  <p className="font-medium text-gray-900">
                    Dr. {appointment.doctor.firstName}{" "}
                    {appointment.doctor.lastName}
                  </p>
                  {appointment.doctor.speciality && (
                    <p className="text-sm text-gray-500">
                      {appointment.doctor.speciality}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Clinic</p>
                  <p className="font-medium text-gray-900">
                    {appointment.clinique.name}
                  </p>
                  {appointment.clinique.address && (
                    <p className="text-sm text-gray-500">
                      {appointment.clinique.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Consultation Details */}
            {appointment.consultation && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-2">
                      Consultation Notes
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">
                          Examination:
                        </span>
                        <p className="text-gray-600">
                          {appointment.consultation.examination}
                        </p>
                      </div>
                      {appointment.consultation.diagnosis && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Diagnosis:
                          </span>
                          <p className="text-gray-600">
                            {appointment.consultation.diagnosis}
                          </p>
                        </div>
                      )}
                      {appointment.consultation.treatment && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Treatment:
                          </span>
                          <p className="text-gray-600">
                            {appointment.consultation.treatment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
