"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/contexts/auth.context";
import { userService } from "@/lib/services/user.service";
import { User } from "@/lib/models/user.model";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  rdvDate: z.string().min(1, "Date and time are required"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface CreateEditAppointmentProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    patientId: string;
    doctorId: string;
    cliniqueId: string;
    rdvDate: string;
    reason: string;
  }) => Promise<void>;
  selectedDate?: Date | null;
}

export default function CreateEditAppointment({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
}: CreateEditAppointmentProps) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  useEffect(() => {
    if (isOpen) {
      loadDoctorsAndPatients();

      // Set default date/time if selectedDate is provided
      if (selectedDate) {
        // Format date in local timezone to avoid date shift
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;
        const defaultTime = "09:00";
        setValue("rdvDate", `${dateStr}T${defaultTime}`);
      } else {
        reset({
          patientId: "",
          doctorId: "",
          rdvDate: "",
          reason: "",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedDate, reset, setValue]);

  const loadDoctorsAndPatients = async () => {
    try {
      setLoadingData(true);
      const userWithClinic: User & { clinique?: { id: string; name: string } } =
        user as User & { clinique?: { id: string; name: string } };

      console.log("Loading doctors and patients...");
      console.log("User clinic:", userWithClinic?.clinique);

      if (userWithClinic?.clinique?.id) {
        const [doctorsData, patientsData] = await Promise.all([
          userService.getDoctorsByClinic(userWithClinic.clinique.id),
          userService.getPatients(), // Gets ALL patients from the system
        ]);

        console.log("Loaded doctors:", doctorsData.length, doctorsData);
        console.log("Loaded ALL patients:", patientsData.length, patientsData);

        setDoctors(doctorsData);
        setPatients(patientsData);
      } else {
        console.error("No clinic ID found. Please logout and login again.");
      }
    } catch (error) {
      console.error("Failed to load doctors and patients:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleFormSubmit = async (data: AppointmentFormData) => {
    try {
      const userWithClinic: User & { clinique?: { id: string; name: string } } =
        user as User & { clinique?: { id: string; name: string } };

      if (!userWithClinic?.clinique?.id) {
        alert("Clinic information is required");
        return;
      }

      await onSubmit({
        patientId: data.patientId,
        doctorId: data.doctorId,
        cliniqueId: userWithClinic.clinique.id,
        rdvDate: data.rdvDate,
        reason: data.reason,
      });

      reset();
      onClose();
    } catch (error) {
      console.error("Failed to create appointment:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Appointment
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
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

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="space-y-4">
            {/* Patient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient <span className="text-red-500">*</span>
              </label>
              <select
                {...register("patientId")}
                disabled={loadingData}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} - {patient.email}
                  </option>
                ))}
              </select>
              {errors.patientId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.patientId.message}
                </p>
              )}
              {!loadingData && patients.length === 0 && (
                <p className="text-yellow-600 text-sm mt-1">
                  No patients found. Please create a patient first.
                </p>
              )}
              {loadingData && (
                <p className="text-gray-500 text-sm mt-1">
                  Loading patients...
                </p>
              )}
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor <span className="text-red-500">*</span>
              </label>
              <select
                {...register("doctorId")}
                disabled={loadingData}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                    {doctor.speciality ? ` - ${doctor.speciality}` : ""}
                  </option>
                ))}
              </select>
              {errors.doctorId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.doctorId.message}
                </p>
              )}
            </div>

            {/* Date and Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register("rdvDate")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.rdvDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.rdvDate.message}
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("reason")}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the reason for this appointment..."
              />
              {errors.reason && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.reason.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                "Create Appointment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
