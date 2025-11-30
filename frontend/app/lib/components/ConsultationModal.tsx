"use client";

import { useState } from "react";
import { Rdv } from "@/lib/models/rdv.model";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Rdv;
  onSubmit: (data: {
    examination: string;
    diagnosis: string;
    treatment: string;
  }) => void;
  isSubmitting?: boolean;
}

export default function ConsultationModal({
  isOpen,
  onClose,
  appointment,
  onSubmit,
  isSubmitting = false,
}: ConsultationModalProps) {
  const [examination, setExamination] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (examination.trim()) {
      onSubmit({ examination, diagnosis, treatment });
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setExamination("");
      setDiagnosis("");
      setTreatment("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full z-[101]">
          \n{" "}
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Complete Consultation
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Patient: {appointment.patient.firstName}{" "}
                    {appointment.patient.lastName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-500"
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

              {/* Form fields */}
              <div className="space-y-4">
                {/* Examination */}
                <div>
                  <label
                    htmlFor="examination"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Examination <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="examination"
                    rows={4}
                    required
                    value={examination}
                    onChange={(e) => setExamination(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter examination details..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* Diagnosis */}
                <div>
                  <label
                    htmlFor="diagnosis"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Diagnosis
                  </label>
                  <textarea
                    id="diagnosis"
                    rows={3}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter diagnosis..."
                    disabled={isSubmitting}
                  />
                </div>

                {/* Treatment */}
                <div>
                  <label
                    htmlFor="treatment"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Treatment
                  </label>
                  <textarea
                    id="treatment"
                    rows={3}
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter treatment plan..."
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !examination.trim()}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Complete Consultation"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
