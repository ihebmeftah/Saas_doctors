"use client";

import { useEffect, useState } from "react";
import { userService } from "@/lib/services/user.service";
import {
  User,
  UserRole,
  roleLabels,
  roleColors,
} from "@/lib/models/user.model";
import UserModal from "@/lib/components/UserModal";
import CreateEditUserModal from "@/lib/components/CreateEditUserModal";
import ConfirmDeleteModal from "@/lib/components/ConfirmDeleteModal";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createUserRole, setCreateUserRole] = useState<'doctor' | 'receptionist'>('doctor');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [showDeleted]);

  useEffect(() => {
    if (selectedRole === "all") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter((user) => user.role === selectedRole));
    }
  }, [selectedRole, users]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = showDeleted
        ? await userService.getDeleted()
        : await userService.getAll();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const handleCreateUser = async (
    data: Partial<{
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      phone?: string;
      role?: string;
      speciality?: string;
    }>
  ) => {
    try {
      if (createUserRole === 'doctor') {
        await userService.createDoctor(data as any);
      } else {
        await userService.createReceptionist(data as any);
      }
      setSuccessMessage(`${createUserRole === 'doctor' ? 'Doctor' : 'Receptionist'} created successfully!`);
      await fetchUsers();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      throw new Error(error.response?.data?.message || "Failed to create user");
    }
  };

  const handleUpdateUser = async (
    data: Partial<{
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      phone?: string;
      speciality?: string;
    }>
  ) => {
    if (!userToEdit) return;

    try {
      await userService.update(userToEdit.id, userToEdit.role, data);
      setSuccessMessage("User updated successfully!");
      await fetchUsers();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      throw new Error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    try {
      await userService.delete(userToDelete.id, userToDelete.role);
      setSuccessMessage("User deleted successfully!");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      setIsModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestoreUser = async (user: User) => {
    try {
      await userService.restore(user.id, user.role);
      setSuccessMessage("User restored successfully!");
      await fetchUsers();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to restore user");
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const color = roleColors[role];
    const classes = {
      purple: "bg-purple-100 text-purple-800",
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      cyan: "bg-cyan-100 text-cyan-800",
      gray: "bg-gray-100 text-gray-800",
    };
    return classes[color as keyof typeof classes];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-600 mr-2"
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
            <p className="text-green-800">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-600 hover:text-green-800"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage all system users</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCreateUserRole('doctor');
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Doctor
          </button>
          <button
            onClick={() => {
              setCreateUserRole('receptionist');
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Receptionist
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              Filter by role:
            </span>

            <button
              onClick={() => setSelectedRole("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                selectedRole === "all"
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({users.length})
            </button>

            {Object.values(UserRole).map((role) => {
              const count = users.filter((u) => u.role === role).length;

              return (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    selectedRole === role
                      ? getRoleBadgeColor(role)
                          .replace("100", "600")
                          .replace("800", "white") + " shadow-md"
                      : getRoleBadgeColor(role) + " hover:opacity-80"
                  }`}
                >
                  {roleLabels[role]} ({count})
                </button>
              );
            })}
          </div>

          {/* Show Deleted Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Show Deleted Users
            </span>
          </label>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No users found
          </h3>
          <p className="text-gray-600">
            {selectedRole === "all"
              ? "There are no users in the system"
              : `No users with role "${roleLabels[selectedRole as UserRole]}"`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Clinique
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition-colors cursor-pointer ${
                      user.deletedAt
                        ? "bg-gray-50 opacity-60 hover:opacity-75"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleUserClick(user)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            user.deletedAt
                              ? "bg-gradient-to-br from-gray-400 to-gray-500"
                              : "bg-gradient-to-br from-blue-500 to-cyan-500"
                          }`}
                        >
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`text-sm font-medium ${
                                user.deletedAt
                                  ? "text-gray-600"
                                  : "text-gray-900"
                              }`}
                            >
                              {user.firstName} {user.lastName}
                            </div>
                            {user.deletedAt && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded">
                                Deleted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          user.deletedAt ? "text-gray-600" : "text-gray-900"
                        }`}
                      >
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          user.deletedAt ? "text-gray-600" : "text-gray-900"
                        }`}
                      >
                        {user.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                          user.role as UserRole
                        )}`}
                      >
                        {roleLabels[user.role as UserRole]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(user.role === UserRole.DOCTOR ||
                        user.role === UserRole.RECEP) &&
                      user.clinique ? (
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 text-cyan-600 mr-2"
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
                          <span className="text-sm text-gray-900 font-medium">
                            {user.clinique.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {showDeleted && user.deletedAt ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreUser(user);
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserClick(user);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Modal */}
      <UserModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onEdit={handleEditUser}
        onDelete={handleDeleteClick}
      />

      {/* Create User Modal */}
      <CreateEditUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
        defaultRole={createUserRole}
      />

      {/* Edit User Modal */}
      <CreateEditUserModal
        user={userToEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setUserToEdit(null);
        }}
        onSubmit={handleUpdateUser}
        defaultRole={
          userToEdit?.role === UserRole.DOCTOR ? "doctor" : "receptionist"
        }
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}? This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}
