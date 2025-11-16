"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Users, Edit2, Trash2, Plus } from "lucide-react";
import CreateClinicModal, {
  ClinicFormData,
} from "./CreateClinicModal";

interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  capacity: number;
  description: string;
  createdAt: string;
}

export default function ClinicsList() {
  const [clinics, setClinics] = useState<Clinic[]>([
    {
      id: "1",
      name: "Downtown Medical Center",
      address: "123 Medical Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      phoneNumber: "+1 (212) 555-0100",
      email: "downtown@medclinic.com",
      capacity: 100,
      description:
        "Our flagship clinic offering comprehensive medical services.",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Uptown Health Clinic",
      address: "456 Health Avenue",
      city: "New York",
      state: "NY",
      zipCode: "10002",
      phoneNumber: "+1 (212) 555-0101",
      email: "uptown@medclinic.com",
      capacity: 75,
      description: "Specializing in preventive care and wellness services.",
      createdAt: "2024-02-20",
    },
    {
      id: "3",
      name: "Westside Care Center",
      address: "789 Care Boulevard",
      city: "New York",
      state: "NY",
      zipCode: "10003",
      phoneNumber: "+1 (212) 555-0102",
      email: "westside@medclinic.com",
      capacity: 60,
      description: "Emergency and urgent care services available 24/7.",
      createdAt: "2024-03-10",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateClinic = (formData: ClinicFormData) => {
    const newClinic: Clinic = {
      id: (clinics.length + 1).toString(),
      ...formData,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setClinics([...clinics, newClinic]);
  };

  const handleDeleteClinic = (id: string) => {
    setClinics(clinics.filter((clinic) => clinic.id !== id));
  };

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinics</h1>
          <p className="text-gray-600 mt-2">
            Manage all your clinic buildings and locations
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Clinic
        </button>
      </div>

      {/* Multi-Tenant Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Clinics
            </label>
            <input
              type="text"
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant Filter
            </label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Clinics</option>
              <option value="ny">New York</option>
              <option value="ca">California</option>
              <option value="tx">Texas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clinics Grid */}
      {filteredClinics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Clinic Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {clinic.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">ID: {clinic.id}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClinic(clinic.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {clinic.description}
              </p>

              {/* Details */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                {/* Address */}
                <div className="flex items-start gap-2">
                  <MapPin
                    size={16}
                    className="text-gray-400 mt-1 flex-shrink-0"
                  />
                  <div className="text-sm text-gray-600">
                    <p>{clinic.address}</p>
                    <p>
                      {clinic.city}, {clinic.state} {clinic.zipCode}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{clinic.phoneNumber}</p>
                </div>

                {/* Email */}
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{clinic.email}</p>
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    Capacity: {clinic.capacity} patients
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Created:</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">
            No clinics found. Create one to get started!
          </p>
        </div>
      )}

      {/* Create Clinic Modal */}
      <CreateClinicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateClinic}
      />
    </div>
  );
}
