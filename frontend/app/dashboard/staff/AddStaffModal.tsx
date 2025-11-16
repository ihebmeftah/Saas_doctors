"use client";

import { useState } from "react";
import { X } from "lucide-react";

export interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  role: "doctor" | "receptionist";
  specialization?: string;
  clinicId: string;
  status: "active" | "inactive";
}

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staff: StaffFormData) => void;
  clinics: Array<{ id: string; name: string }>;
}

export default function AddStaffModal({
  isOpen,
  onClose,
  onSubmit,
  clinics,
}: AddStaffModalProps) {
  const [formData, setFormData] = useState<StaffFormData>({
    name: "",
    email: "",
    phone: "",
    role: "doctor",
    specialization: "",
    clinicId: clinics[0]?.id || "",
    status: "active",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof StaffFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StaffFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.clinicId) newErrors.clinicId = "Clinic is required";
    if (formData.role === "doctor" && !formData.specialization?.trim()) {
      newErrors.specialization = "Specialization is required for doctors";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "doctor",
        specialization: "",
        clinicId: clinics[0]?.id || "",
        status: "active",
      });
      onClose();
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof StaffFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Add Staff Member</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+1 (555) 000-0000"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>
            </div>
          </div>

          {/* Specialization (for doctors) */}
          {formData.role === "doctor" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Medical Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization *
                </label>
                <select
                  name="specialization"
                  value={formData.specialization || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.specialization ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Specialization</option>
                  <option value="General Practice">General Practice</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Dentistry">Dentistry</option>
                </select>
                {errors.specialization && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.specialization}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Clinic Assignment */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Clinic Assignment
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Clinic *
              </label>
              <select
                name="clinicId"
                value={formData.clinicId}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.clinicId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Clinic</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
              {errors.clinicId && (
                <p className="text-red-500 text-sm mt-1">{errors.clinicId}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === "active"}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={formData.status === "inactive"}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Inactive</span>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
