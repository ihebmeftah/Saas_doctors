"use client";

import { useState } from "react";
import { Rdv, RdvStatus } from "@/lib/models/rdv.model";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { useAuth } from "@/lib/contexts/auth.context";
import { UserRole } from "@/lib/models/user.model";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Rdv | null;
  onInvoiceCreated?: () => void;
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

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onInvoiceCreated,
}: AppointmentDetailsModalProps) {
  const { user } = useAuth();
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const isReceptionist = user?.role === UserRole.RECEP;

  if (!isOpen || !appointment) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Appointment Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-between items-center">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                statusColors[appointment.status]
              }`}
            >
              {statusLabels[appointment.status]}
            </span>
            <div className="text-sm text-gray-500">
              ID: {appointment.id.slice(0, 8)}...
            </div>
          </div>

          {/* Date and Time */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
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
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(appointment.rdvDate)}
                </p>
                <p className="text-gray-700">
                  {formatTime(appointment.rdvDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h3 className="font-semibold text-gray-800">Patient</h3>
            </div>
            <div className="space-y-2 ml-9">
              <p className="text-gray-900">
                <span className="font-medium">Name:</span>{" "}
                {appointment.patient.firstName} {appointment.patient.lastName}
              </p>
              <p className="text-gray-900">
                <span className="font-medium">Email:</span>{" "}
                {appointment.patient.email}
              </p>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="font-semibold text-gray-800">Doctor</h3>
            </div>
            <div className="space-y-2 ml-9">
              <p className="text-gray-900">
                <span className="font-medium">Name:</span> Dr.{" "}
                {appointment.doctor.firstName} {appointment.doctor.lastName}
              </p>
              {appointment.doctor.speciality && (
                <p className="text-gray-900">
                  <span className="font-medium">Specialty:</span>{" "}
                  {appointment.doctor.speciality}
                </p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="font-semibold text-gray-800">Reason for Visit</h3>
            </div>
            <p className="text-gray-700 ml-9">{appointment.reason}</p>
          </div>

          {/* Consultation Details (if completed) */}
          {appointment.status === RdvStatus.COMPLETED &&
            appointment.consultation && (
              <>
                {appointment.consultation.examination && (
                  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Examination
                    </h3>
                    <p className="text-gray-700">
                      {appointment.consultation.examination}
                    </p>
                  </div>
                )}

                {appointment.consultation.diagnosis && (
                  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Diagnosis
                    </h3>
                    <p className="text-gray-700">
                      {appointment.consultation.diagnosis}
                    </p>
                  </div>
                )}

                {appointment.consultation.treatment && (
                  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Treatment
                    </h3>
                    <p className="text-gray-700">
                      {appointment.consultation.treatment}
                    </p>
                  </div>
                )}
              </>
            )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3">
            {isReceptionist && appointment.status === RdvStatus.COMPLETED && (
              <button
                onClick={() => setShowCreateInvoice(true)}
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer Facture
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateInvoice && appointment && (
        <CreateInvoiceModal
          appointment={appointment}
          onClose={() => setShowCreateInvoice(false)}
          onSuccess={() => {
            setShowCreateInvoice(false);
            onInvoiceCreated?.();
            onClose();
          }}
        />
      )}
    </div>
  );
}
