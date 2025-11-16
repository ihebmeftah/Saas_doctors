"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Stethoscope,
  Users,
  Badge,
  Mail,
  Phone,
  Building2,
} from "lucide-react";
import AddStaffModal, { StaffFormData } from "./AddStaffModal";

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "doctor" | "receptionist";
  specialization?: string;
  clinicId: string;
  clinicName: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface Clinic {
  id: string;
  name: string;
}

const clinics: Clinic[] = [
  { id: "1", name: "Downtown Medical Center" },
  { id: "2", name: "Uptown Health Clinic" },
  { id: "3", name: "Westside Care Center" },
];

const sampleStaff: Staff[] = [
  {
    id: "s1",
    name: "Dr. John Smith",
    email: "john.smith@medclinic.com",
    phone: "+1 (212) 555-0100",
    role: "doctor",
    specialization: "Cardiology",
    clinicId: "1",
    clinicName: "Downtown Medical Center",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "s2",
    name: "Sarah Johnson",
    email: "sarah.johnson@medclinic.com",
    phone: "+1 (212) 555-0101",
    role: "receptionist",
    clinicId: "1",
    clinicName: "Downtown Medical Center",
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: "s3",
    name: "Dr. Emily Brown",
    email: "emily.brown@medclinic.com",
    phone: "+1 (212) 555-0102",
    role: "doctor",
    specialization: "Dermatology",
    clinicId: "2",
    clinicName: "Uptown Health Clinic",
    status: "active",
    createdAt: "2024-02-01",
  },
  {
    id: "s4",
    name: "Michael Davis",
    email: "michael.davis@medclinic.com",
    phone: "+1 (212) 555-0103",
    role: "receptionist",
    clinicId: "2",
    clinicName: "Uptown Health Clinic",
    status: "active",
    createdAt: "2024-02-05",
  },
  {
    id: "s5",
    name: "Dr. Robert Wilson",
    email: "robert.wilson@medclinic.com",
    phone: "+1 (212) 555-0104",
    role: "doctor",
    specialization: "Orthopedics",
    clinicId: "3",
    clinicName: "Westside Care Center",
    status: "inactive",
    createdAt: "2024-02-10",
  },
];

export default function ClinicStaff() {
  const [staff, setStaff] = useState<Staff[]>(sampleStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const handleAddStaff = (formData: StaffFormData) => {
    const selectedClinicName =
      clinics.find((c) => c.id === formData.clinicId)?.name || "";
    const newStaff: Staff = {
      id: `s${staff.length + 1}`,
      ...formData,
      clinicName: selectedClinicName,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setStaff([...staff, newStaff]);
  };

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id));
  };

  const filteredStaff = staff.filter((s) => {
    const matchesClinic =
      selectedClinic === "all" || s.clinicId === selectedClinic;
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClinic && matchesRole && matchesSearch;
  });

  const doctorCount = staff.filter((s) => s.role === "doctor").length;
  const receptionistCount = staff.filter(
    (s) => s.role === "receptionist"
  ).length;
  const activeCount = staff.filter((s) => s.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-2">
            Manage doctors and receptionists across your clinics
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Staff
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {staff.length}
              </p>
            </div>
            <Users size={24} className="text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Doctors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {doctorCount}
              </p>
            </div>
            <Stethoscope size={24} className="text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Receptionists</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {receptionistCount}
              </p>
            </div>
            <Badge size={24} className="text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {activeCount}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Clinic Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clinic
            </label>
            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Clinics</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="doctor">Doctors</option>
              <option value="receptionist">Receptionists</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedClinic("all");
                setRoleFilter("all");
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      {filteredStaff.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Name & Role
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Specialization
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Clinic
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staffMember) => (
                  <tr
                    key={staffMember.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* Name & Role */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            staffMember.role === "doctor"
                              ? "bg-green-600"
                              : "bg-purple-600"
                          }`}
                        >
                          {staffMember.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {staffMember.name}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {staffMember.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail size={14} />
                          {staffMember.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone size={14} />
                          {staffMember.phone}
                        </div>
                      </div>
                    </td>

                    {/* Specialization */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {staffMember.specialization || "—"}
                      </span>
                    </td>

                    {/* Clinic */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 size={14} />
                        {staffMember.clinicName}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          staffMember.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {staffMember.status.charAt(0).toUpperCase() +
                          staffMember.status.slice(1)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staffMember.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            No staff members found. Add one to get started!
          </p>
        </div>
      )}

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddStaff}
        clinics={clinics}
      />
    </div>
  );
}
