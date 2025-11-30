"use client";

import { useState } from "react";
import { useActiveAppointment } from "@/lib/contexts/active-appointment.context";
import { RdvStatus } from "@/lib/models/rdv.model";
import { rdvService } from "@/lib/services/rdv.service";
import ConsultationModal from "./ConsultationModal";

export default function ActiveAppointmentIndicator() {
  const { activeAppointment, refreshActiveAppointment } =
    useActiveAppointment();
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinishClick = () => {
    setShowConsultationModal(true);
  };

  const handleConsultationSubmit = async (consultationData: {
    examination: string;
    diagnosis: string;
    treatment: string;
  }) => {
    if (!activeAppointment) return;

    try {
      setIsSubmitting(true);
      await rdvService.changeStatus(activeAppointment.id, {
        status: RdvStatus.COMPLETED,
        examination: consultationData.examination,
        diagnosis: consultationData.diagnosis,
        treatment: consultationData.treatment,
      });
      setShowConsultationModal(false);
      // Refresh to get updated list
      await refreshActiveAppointment();
    } catch (error) {
      console.error("Failed to complete consultation:", error);
      alert("Failed to complete consultation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Don't show when no active appointment
  if (!activeAppointment) {
    return null;
  }

  return (
    <>
      {/* Fixed indicator at the top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg animate-pulse">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  Appointment in Progress
                </h3>
                <p className="text-xs sm:text-sm text-purple-100">
                  Patient: {activeAppointment.patient.firstName}{" "}
                  {activeAppointment.patient.lastName} • Time:{" "}
                  {formatTime(activeAppointment.rdvDate)}
                  {activeAppointment.reason &&
                    ` • Reason: ${activeAppointment.reason}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleFinishClick}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2 text-sm"
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden sm:inline">Finish Consultation</span>
              <span className="sm:hidden">Finish</span>
            </button>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden under fixed indicator */}
      <div className="h-16"></div>

      {/* Consultation Modal */}
      <ConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        onSubmit={handleConsultationSubmit}
        isSubmitting={isSubmitting}
        appointment={activeAppointment}
      />
    </>
  );
}
