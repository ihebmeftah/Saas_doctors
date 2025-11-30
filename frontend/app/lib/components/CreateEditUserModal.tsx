"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, UserRole } from "@/lib/models/user.model";

const userSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  phone: z.string().min(8, "Phone number is required"),
  speciality: z.string().optional(),
  age: z.string().optional(),
  cin: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface CreateEditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Partial<{
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      phone?: string;
      role?: string;
      speciality?: string;
      age?: string;
      cin?: string;
      gender?: string;
      address?: string;
    }>
  ) => Promise<void>;
  defaultRole: "doctor" | "receptionist" | "patient";
  user?: User | null;
}

export default function CreateEditUserModal({
  isOpen,
  onClose,
  onSubmit,
  defaultRole,
  user,
}: CreateEditUserModalProps) {
  const isEditMode = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone.toString(),
          speciality: user.speciality || "",
          password: "",
          age: (user as any).age?.toString() || "",
          cin: (user as any).cin || "",
          gender: (user as any).gender || "",
          address: (user as any).address || "",
        });
      } else {
        reset({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phone: "",
          speciality: "",
          age: "",
          cin: "",
          gender: "",
          address: "",
        });
      }
    }
  }, [isOpen, user, reset]);

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      if (isEditMode) {
        const updateData: Partial<{
          firstName?: string;
          lastName?: string;
          email?: string;
          password?: string;
          phone?: string;
          speciality?: string;
        }> = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        };

        if (data.password && data.password.trim() !== "") {
          updateData.password = data.password;
        }

        if (user.role === UserRole.DOCTOR && data.speciality) {
          updateData.speciality = data.speciality;
        }

        await onSubmit(updateData);
      } else {
        const createData = {
          ...data,
          role: defaultRole,
        };
        await onSubmit(createData);
      }
      reset();
      onClose();
    } catch {
      // Error is handled by parent component
    }
  };

  if (!isOpen) return null;

  const roleColor =
    defaultRole === "doctor"
      ? "blue"
      : defaultRole === "patient"
      ? "purple"
      : "green";
  const gradientClass =
    defaultRole === "doctor"
      ? "from-blue-600 to-cyan-600"
      : defaultRole === "patient"
      ? "from-purple-600 to-pink-600"
      : "from-green-600 to-emerald-600";
  const textClass =
    defaultRole === "doctor"
      ? "text-blue-100"
      : defaultRole === "patient"
      ? "text-purple-100"
      : "text-green-100";

  const roleLabel =
    defaultRole === "doctor"
      ? "Doctor"
      : defaultRole === "patient"
      ? "Patient"
      : "Receptionist";

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
          <div
            className={`bg-gradient-to-r ${gradientClass} rounded-t-2xl p-6 text-white`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditMode ? `Edit ${roleLabel}` : `Add ${roleLabel}`}
                </h2>
                <p className={`${textClass} mt-1`}>
                  {isEditMode
                    ? "Update user information"
                    : "Create a new user account"}
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
              {/* First Name and Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("firstName")}
                    type="text"
                    id="firstName"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-${roleColor}-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("lastName")}
                    type="text"
                    id="lastName"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-${roleColor}-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-${roleColor}-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-${roleColor}-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${
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
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password{" "}
                  {!isEditMode && <span className="text-red-500">*</span>}
                  {isEditMode && (
                    <span className="text-gray-500 text-xs">
                      (leave empty to keep current)
                    </span>
                  )}
                </label>
                <input
                  {...register("password")}
                  type="password"
                  id="password"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-${roleColor}-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Speciality (only for doctors) */}
              {defaultRole === "doctor" && (
                <div>
                  <label
                    htmlFor="speciality"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Speciality
                  </label>
                  <input
                    {...register("speciality")}
                    type="text"
                    id="speciality"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400"
                    placeholder="e.g., Cardiology, Pediatrics"
                  />
                  {errors.speciality && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.speciality.message}
                    </p>
                  )}
                </div>
              )}

              {/* Patient-specific fields */}
              {defaultRole === "patient" && (
                <>
                  {/* Age and Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="age"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Age
                      </label>
                      <input
                        {...register("age")}
                        type="number"
                        id="age"
                        min="0"
                        max="150"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400"
                        placeholder="25"
                      />
                      {errors.age && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.age.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="gender"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Gender
                      </label>
                      <select
                        {...register("gender")}
                        id="gender"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.gender.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CIN and Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="cin"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        CIN
                      </label>
                      <input
                        {...register("cin")}
                        type="text"
                        id="cin"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400"
                        placeholder="12345678"
                      />
                      {errors.cin && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.cin.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Address
                      </label>
                      <input
                        {...register("address")}
                        type="text"
                        id="address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-gray-900 placeholder:text-gray-400"
                        placeholder="123 Main St, City"
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
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
                className={`px-6 py-2 bg-gradient-to-r ${gradientClass} text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
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
                    {isEditMode ? "Update User" : "Create User"}
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
