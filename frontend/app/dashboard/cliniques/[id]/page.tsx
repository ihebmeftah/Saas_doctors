"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { cliniqueService } from "@/lib/services/clinique.service";
import { clinicServiceService } from "@/lib/services/clinicservice.service";
import { userService } from "@/lib/services/user.service";
import { Clinique } from "@/lib/models/clinique.model";
import { ClinicService } from "@/lib/models/clinique-services.model";
import DoctorsListModal from "@/lib/components/DoctorsListModal";
import ReceptionistsListModal from "@/lib/components/ReceptionistsListModal";
import ServicesListModal from "@/lib/components/ServicesListModal";
import AddUserModal from "@/lib/components/AddUserModal";
import AddServiceModal from "@/lib/components/AddServiceModal";
import ConfirmDeleteModal from "@/lib/components/ConfirmDeleteModal";
import AssignUserModal from "@/lib/components/AssignUserModal";

export default function CliniqueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [clinique, setClinique] = useState<Clinique | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [showDoctorsModal, setShowDoctorsModal] = useState(false);
  const [showReceptionistsModal, setShowReceptionistsModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddReceptionistModal, setShowAddReceptionistModal] =
    useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);
  const [showDeleteCliniqueModal, setShowDeleteCliniqueModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ClinicService | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchClinique(params.id as string);
    }
  }, [params.id]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchClinique = async (id: string) => {
    try {
      setLoading(true);
      const data = await cliniqueService.getById(id);
      setClinique(data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch clinique");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: any) => {
    try {
      let createdUser;

      // Create the user based on role
      if (data.role === "doctor") {
        createdUser = await userService.createDoctor({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone,
          speciality: data.speciality,
        });
      } else {
        createdUser = await userService.createReceptionist({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone,
        });
      }

      // Assign the user to the clinique
      await cliniqueService.assignUser({
        cliniqueId: params.id as string,
        role: data.role,
        userIds: [createdUser.id],
      });

      // Show success message
      setSuccessMessage(
        `${
          data.role === "doctor" ? "Doctor" : "Receptionist"
        } created successfully!`
      );

      // Refresh the clinique data
      if (params.id) {
        await fetchClinique(params.id as string);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to create user";
      throw new Error(errorMessage);
    }
  };

  const handleCreateService = async (data: any) => {
    try {
      await clinicServiceService.create({
        ...data,
        cliniqueId: params.id as string,
      });

      // Show success message
      setSuccessMessage("Service created successfully!");

      if (params.id) {
        await fetchClinique(params.id as string);
      }
    } catch (err) {
      console.error("Failed to create service:", err);
      throw err;
    }
  };

  const handleDeleteService = (service: ClinicService) => {
    setServiceToDelete(service);
    setShowDeleteServiceModal(true);
  };

  const handleConfirmDeleteService = async () => {
    if (!serviceToDelete) return;

    setDeleteLoading(true);
    try {
      await clinicServiceService.delete(serviceToDelete.id);
      setSuccessMessage("Service deleted successfully!");
      setShowDeleteServiceModal(false);
      setServiceToDelete(null);
      setShowServicesModal(false);
      if (params.id) {
        await fetchClinique(params.id as string);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to delete service");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteClinique = () => {
    setShowDeleteCliniqueModal(true);
  };

  const handleConfirmDeleteClinique = async () => {
    if (!clinique) return;

    setDeleteLoading(true);
    try {
      await cliniqueService.delete(clinique.id);
      router.push("/dashboard/cliniques");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to delete clinique");
      setDeleteLoading(false);
    }
  };

  const handleAssignUsers = async (
    userIds: string[],
    role: "doctor" | "receptionist"
  ) => {
    try {
      await cliniqueService.assignUser({
        cliniqueId: params.id as string,
        role,
        userIds,
      });
      setSuccessMessage(
        `${
          role === "doctor" ? "Doctors" : "Receptionists"
        } assigned successfully!`
      );
      setShowAssignUserModal(false);
      if (params.id) {
        await fetchClinique(params.id as string);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      throw new Error(
        error.response?.data?.message || "Failed to assign users"
      );
    }
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

  if (error || !clinique) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error || "Clinique not found"}</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/cliniques")}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Cliniques
        </button>
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

      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard/cliniques")}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Cliniques
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 mb-6 text-white shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{clinique.name}</h1>
            <p className="text-blue-100">Clinique Details</p>
          </div>
          <div className="p-4 bg-white bg-opacity-20 rounded-xl">
            <svg
              className="w-8 h-8"
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowAssignUserModal(true)}
            className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center"
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            Assign Users
          </button>
          <button
            onClick={handleDeleteClinique}
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
            Delete Clinique
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-800 font-medium">
                    {clinique.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-800 font-medium">{clinique.phone}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 bg-purple-100 rounded-lg mr-4">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-800 font-medium">{clinique.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4">
            <div
              onClick={() => setShowDoctorsModal(true)}
              className="bg-white rounded-xl border border-gray-200 p-4 text-center cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all"
            >
              <div className="text-2xl font-bold text-blue-600">
                {clinique.doctors?.length || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Doctors</div>
            </div>
            <div
              onClick={() => setShowReceptionistsModal(true)}
              className="bg-white rounded-xl border border-gray-200 p-4 text-center cursor-pointer hover:shadow-lg hover:border-green-300 transition-all"
            >
              <div className="text-2xl font-bold text-green-600">
                {clinique.receptionists?.length || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Receptionists</div>
            </div>
            <div
              onClick={() => setShowServicesModal(true)}
              className="bg-white rounded-xl border border-gray-200 p-4 text-center cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all"
            >
              <div className="text-2xl font-bold text-purple-600">
                {clinique.services?.length || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">Services</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center">
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Clinique
              </button>
              <button className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center">
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Assign User
              </button>
              <button className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center">
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
                Delete Clinique
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DoctorsListModal
        doctors={clinique.doctors || []}
        isOpen={showDoctorsModal}
        onClose={() => setShowDoctorsModal(false)}
        onAdd={() => {
          setShowDoctorsModal(false);
          setShowAddDoctorModal(true);
        }}
      />

      <ReceptionistsListModal
        receptionists={clinique.receptionists || []}
        isOpen={showReceptionistsModal}
        onClose={() => setShowReceptionistsModal(false)}
        onAdd={() => {
          setShowReceptionistsModal(false);
          setShowAddReceptionistModal(true);
        }}
      />

      <ServicesListModal
        services={clinique.services || []}
        isOpen={showServicesModal}
        onClose={() => setShowServicesModal(false)}
        onAdd={() => {
          setShowServicesModal(false);
          setShowAddServiceModal(true);
        }}
        onDelete={handleDeleteService}
      />

      <AddUserModal
        isOpen={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
        onSubmit={handleCreateUser}
        defaultRole="doctor"
        cliniqueId={clinique.id}
      />

      <AddUserModal
        isOpen={showAddReceptionistModal}
        onClose={() => setShowAddReceptionistModal(false)}
        onSubmit={handleCreateUser}
        defaultRole="receptionist"
        cliniqueId={clinique.id}
      />

      <AddServiceModal
        isOpen={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
        onSubmit={handleCreateService}
        cliniqueId={clinique.id}
      />

      {/* Assign User Modal */}
      <AssignUserModal
        isOpen={showAssignUserModal}
        onClose={() => setShowAssignUserModal(false)}
        onAssign={handleAssignUsers}
        cliniqueId={clinique.id}
        assignedDoctors={clinique.doctors}
        assignedReceptionists={clinique.receptionists}
      />

      {/* Delete Service Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteServiceModal}
        onClose={() => {
          setShowDeleteServiceModal(false);
          setServiceToDelete(null);
        }}
        onConfirm={handleConfirmDeleteService}
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.name}"? This action cannot be undone.`}
        loading={deleteLoading}
      />

      {/* Delete Clinique Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteCliniqueModal}
        onClose={() => setShowDeleteCliniqueModal(false)}
        onConfirm={handleConfirmDeleteClinique}
        title="Delete Clinique"
        message={`Are you sure you want to delete "${clinique.name}"? This will permanently delete all associated data. This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
}
