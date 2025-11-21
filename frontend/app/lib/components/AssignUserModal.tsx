"use client";

import { useState, useEffect } from "react";
import { User, UserRole } from "@/lib/models/user.model";
import { userService } from "@/lib/services/user.service";

interface AssignUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (
    userIds: string[],
    role: "doctor" | "receptionist"
  ) => Promise<void>;
  cliniqueId: string;
  assignedDoctors?: User[];
  assignedReceptionists?: User[];
}

export default function AssignUserModal({
  isOpen,
  onClose,
  onAssign,
  assignedDoctors = [],
  assignedReceptionists = [],
}: AssignUserModalProps) {
  const [role, setRole] = useState<"doctor" | "receptionist">("doctor");
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableUsers = async () => {
    try {
      setFetchLoading(true);
      const userRole = role === "doctor" ? UserRole.DOCTOR : UserRole.RECEP;
      const allUsers = await userService.getAll(userRole);

      // Filter out already assigned users
      const assignedIds =
        role === "doctor"
          ? assignedDoctors.map((d) => d.id)
          : assignedReceptionists.map((r) => r.id);

      const available = allUsers.filter(
        (user) => !assignedIds.includes(user.id)
      );
      setAvailableUsers(available);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAvailableUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, role]);

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onAssign(selectedUsers, role);
      setSelectedUsers([]);
      onClose();
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || "Failed to assign users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
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
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">Assign Users</h2>
                <p className="text-green-100 mt-1">
                  Assign doctors or receptionists to this clinique
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

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRole("doctor");
                    setSelectedUsers([]);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    role === "doctor"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Doctors
                </button>
                <button
                  onClick={() => {
                    setRole("receptionist");
                    setSelectedUsers([]);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    role === "receptionist"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Receptionists
                </button>
              </div>
            </div>

            {/* User List */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available {role === "doctor" ? "Doctors" : "Receptionists"} (
                {availableUsers.length})
              </label>

              {fetchLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <p className="text-gray-600">
                    No available{" "}
                    {role === "doctor" ? "doctors" : "receptionists"}
                  </p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
                  {availableUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.email}
                        </div>
                        {role === "doctor" && user.speciality && (
                          <div className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Speciality:</span>{" "}
                            {user.speciality}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {selectedUsers.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  {selectedUsers.length}{" "}
                  {role === "doctor" ? "doctor" : "receptionist"}
                  {selectedUsers.length > 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 rounded-b-2xl px-6 py-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedUsers.length === 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading
                ? "Assigning..."
                : `Assign ${selectedUsers.length} User${
                    selectedUsers.length > 1 ? "s" : ""
                  }`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
