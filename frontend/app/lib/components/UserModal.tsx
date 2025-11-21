"use client";

import {
  User,
  UserRole,
  roleLabels,
  roleColors,
} from "@/lib/models/user.model";

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export default function UserModal({
  user,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: UserModalProps) {
  if (!isOpen || !user) return null;

  const roleColor = roleColors[user.role as UserRole];
  const colorClasses = {
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
  };

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
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-blue-100 mt-1">User Details</p>
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

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Role Badge */}
            <div>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold border ${
                  colorClasses[roleColor as keyof typeof colorClasses]
                }`}
              >
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {roleLabels[user.role as UserRole]}
              </span>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
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
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">First Name</p>
                  <p className="text-gray-800 font-medium">{user.firstName}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Last Name</p>
                  <p className="text-gray-800 font-medium">{user.lastName}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-gray-800 font-medium">{user.email}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Phone</p>
                  <p className="text-gray-800 font-medium">{user.phone}</p>
                </div>
              </div>
            </div>

            {/* Doctor Specific Information */}
            {user.role === UserRole.DOCTOR && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-cyan-600"
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
                  Professional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.speciality && (
                    <div className="bg-cyan-50 rounded-lg p-4">
                      <p className="text-sm text-cyan-600 mb-1">Speciality</p>
                      <p className="text-gray-800 font-medium">
                        {user.speciality}
                      </p>
                    </div>
                  )}

                  {user.clinique && (
                    <div className="bg-cyan-50 rounded-lg p-4">
                      <p className="text-sm text-cyan-600 mb-1">Clinique</p>
                      <p className="text-gray-800 font-medium">
                        {user.clinique.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Receptionist Specific Information */}
            {user.role === UserRole.RECEP && user.clinique && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Work Information
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 mb-1">Clinique</p>
                    <p className="text-gray-800 font-medium">
                      {user.clinique.name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Patient Specific Information */}
            {user.role === UserRole.PATIENT && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-600"
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
                  Additional Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.age && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Age</p>
                      <p className="text-gray-800 font-medium">
                        {user.age} years
                      </p>
                    </div>
                  )}

                  {user.gender && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">Gender</p>
                      <p className="text-gray-800 font-medium">{user.gender}</p>
                    </div>
                  )}

                  {user.cin && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500 mb-1">CIN</p>
                      <p className="text-gray-800 font-medium">{user.cin}</p>
                    </div>
                  )}

                  {user.address && (
                    <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="text-gray-800 font-medium">
                        {user.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            {(user.createdAt || user.updatedAt) && (
              <div className="border-t pt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                {user.createdAt && (
                  <div>
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                )}
                {user.updatedAt && (
                  <div>
                    <span className="font-medium">Updated:</span>{" "}
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 rounded-b-2xl px-6 py-4 flex justify-between gap-3">
            <div>
              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(user);
                    onClose();
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center"
                >
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit(user);
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Edit User
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
