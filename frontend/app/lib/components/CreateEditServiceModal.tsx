"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClinicService } from "@/lib/models/clinique-services.model";

const serviceSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  durationMinutes: z
    .number()
    .min(1, "Duration must be at least 1 minute")
    .optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface CreateEditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  cliniqueId: string;
  service?: ClinicService | null;
}

export default function CreateEditServiceModal({
  isOpen,
  onClose,
  onSubmit,
  service,
}: CreateEditServiceModalProps) {
  const isEditMode = !!service;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (service) {
        reset({
          name: service.name,
          description: service.description,
          price: service.price,
          durationMinutes: service.durationMinutes || undefined,
        });
      } else {
        reset({
          name: "",
          description: "",
          price: 0,
          durationMinutes: undefined,
        });
      }
    }
  }, [isOpen, service, reset]);

  const handleFormSubmit = async (data: ServiceFormData) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch {
      // Error is handled by parent component
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditMode ? "Edit Service" : "Add Service"}
                </h2>
                <p className="text-purple-100 mt-1">
                  {isEditMode
                    ? "Update service information"
                    : "Create a new service for this clinique"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
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
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
            <div className="space-y-4">
              {/* Service Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="General Consultation"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("description")}
                  id="description"
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Brief description of the service..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    id="price"
                    step="0.01"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="50.00"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label
                    htmlFor="durationMinutes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Duration (minutes)
                  </label>
                  <input
                    {...register("durationMinutes", { valueAsNumber: true })}
                    type="number"
                    id="durationMinutes"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${
                      errors.durationMinutes
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="30"
                  />
                  {errors.durationMinutes && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.durationMinutes.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
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
                    {isEditMode ? "Update Service" : "Create Service"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
