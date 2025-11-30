"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth.context";
import { userService } from "@/lib/services/user.service";
import { User } from "@/lib/models/user.model";
import CreateEditUserModal from "@/lib/components/CreateEditUserModal";

export default function PatientsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState<User[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router]);

  useEffect(() => {
    filterPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const userWithClinic = user as User;

      console.log("Loading patients for user:", userWithClinic);
      console.log("Clinic ID:", userWithClinic?.clinique?.id);

      if (!userWithClinic?.clinique?.id) {
        console.error(
          "No clinic ID found for user. User needs to logout and login again to get updated user data."
        );
        setPatients([]);
        return;
      }

      const data = await userService.getPatientsByClinic(
        userWithClinic.clinique.id
      );
      console.log("Loaded patients:", data);
      setPatients(data);
    } catch (error) {
      console.error("Failed to load patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    if (searchQuery) {
      filtered = filtered.filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPatients(filtered);
  };

  const handleCreateAppointment = (patient: User) => {
    // Navigate to calendar with pre-selected patient
    router.push(`/dashboard/calendar?patientId=${patient.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userWithClinic = user as User;
  const hasClinic = userWithClinic?.clinique?.id;

  if (!hasClinic) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-yellow-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Clinic Information Required
          </h3>
          <p className="text-gray-600 mb-4">
            Your user account doesn&apos;t have clinic information. Please
            logout and login again to refresh your session.
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Logout and Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Patients</h1>
          <p className="text-gray-600 mt-1">
            Manage patients for{" "}
            {(user as User)?.clinique?.name || "your clinic"}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
          New Patient
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Patients
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {patients.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Search Results
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {filteredPatients.length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quick Actions</p>
              <p className="text-sm text-gray-500 mt-1">Add appointments</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {filteredPatients.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {patient.firstName.charAt(0)}
                          {patient.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {patient.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.phone || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.age && `Age: ${patient.age}`}
                        {patient.gender && ` • ${patient.gender}`}
                      </div>
                      {patient.address && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {patient.address}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleCreateAppointment(patient)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-2"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
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
                        Book Appointment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No patients found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "Get started by creating a new patient"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Patient Modal */}
      <CreateEditUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        defaultRole="patient"
        onSubmit={async (data) => {
          await userService.createPatient({
            firstName: data.firstName!,
            lastName: data.lastName!,
            email: data.email!,
            password: data.password || "Patient@123",
            phone: data.phone!,
            age: data.age ? parseInt(data.age) : undefined,
            gender: data.gender || undefined,
            address: data.address || undefined,
            cin: data.cin || undefined,
          });
          await loadPatients();
        }}
      />
    </div>
  );
}
