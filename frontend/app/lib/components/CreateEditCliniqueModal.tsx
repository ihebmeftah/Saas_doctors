"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCliniqueSchema,
  CreateCliniqueFormData,
} from "@/lib/models/clinique.model";
import { Clinique } from "@/lib/models/clinique.model";

interface CreateEditCliniqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCliniqueFormData) => Promise<void>;
  clinique?: Clinique | null;
}

export default function CreateEditCliniqueModal({
  isOpen,
  onClose,
  onSubmit,
  clinique,
}: CreateEditCliniqueModalProps) {
  const isEditMode = !!clinique;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCliniqueFormData>({
    resolver: zodResolver(createCliniqueSchema),
    defaultValues: clinique
      ? {
          name: clinique.name,
          address: clinique.address,
          phone: clinique.phone,
          email: clinique.email,
        }
      : undefined,
  });

  useEffect(() => {
    if (isOpen) {
      if (clinique) {
        reset({
          name: clinique.name,
          address: clinique.address,
          phone: clinique.phone,
          email: clinique.email,
        });
      } else {
        reset({
          name: "",
          address: "",
          phone: "",
          email: "",
        });
      }
    }
  }, [isOpen, clinique, reset]);

  const handleFormSubmit = async (data: CreateCliniqueFormData) => {
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
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-t-2xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditMode ? "Edit Clinique" : "Create New Clinique"}
                </h2>
                <p className="text-blue-100 mt-1">
                  {isEditMode
                    ? "Update clinique information"
                    : "Add a new medical clinic to the system"}
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
              {/* Clinique Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Clinique Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter clinique name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("address")}
                  id="address"
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter complete address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Phone and Email in a row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("phone")}
                    type="text"
                    id="phone"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="+216 12 345 678"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    id="email"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="clinic@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
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
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                    {isEditMode ? "Update Clinique" : "Create Clinique"}
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
