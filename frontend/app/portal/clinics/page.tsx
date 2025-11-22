"use client";

import { useEffect, useState } from "react";
import { cliniqueService } from "@/lib/services/clinique.service";
import { Clinique } from "@/lib/models/clinique.model";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      setLoading(true);
      const data = await cliniqueService.getAll();
      // Filter out soft-deleted clinics
      const activeClinics = data.filter((clinic) => !clinic.deletedAt);
      setClinics(activeClinics);
    } catch (err) {
      setError("Failed to load clinics. Please try again later.");
      console.error("Error loading clinics:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Clinic
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse through our network of healthcare clinics and discover the
          services they offer
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search clinics by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Clinics Grid */}
      {filteredClinics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? "No clinics found matching your search."
              : "No clinics available at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClinics.map((clinic) => (
            <Link
              key={clinic.id}
              href={`/portal/clinic/${clinic.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
            >
              {/* Clinic Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <h2 className="text-2xl font-bold text-white group-hover:scale-105 transition-transform">
                  {clinic.name}
                </h2>
              </div>

              {/* Clinic Details */}
              <div className="p-6 space-y-3">
                <div className="flex items-start space-x-3 text-gray-600">
                  <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{clinic.address}</span>
                </div>

                <div className="flex items-center space-x-3 text-gray-600">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{clinic.phone}</span>
                </div>

                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm truncate">{clinic.email}</span>
                </div>

                {/* Services Count */}
                {clinic.services && clinic.services.length > 0 && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-blue-600 font-medium">
                      {clinic.services.length} service
                      {clinic.services.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                )}

                {/* View Details Button */}
                <div className="pt-2">
                  <span className="text-blue-600 font-medium text-sm group-hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
