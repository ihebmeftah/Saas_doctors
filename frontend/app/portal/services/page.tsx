"use client";

import { useEffect, useState } from "react";
import { clinicServiceService } from "@/lib/services/clinicservice.service";
import { ClinicService } from "@/lib/models/clinique-services.model";
import Link from "next/link";
import { DollarSign, Clock, Building2, Search } from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState<ClinicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await clinicServiceService.getAll();
      // Filter services that have clinic information
      const servicesWithClinics = data.filter((service) => service.clinique);
      setServices(servicesWithClinics);
    } catch (err) {
      setError("Failed to load services. Please try again later.");
      console.error("Error loading services:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.clinique?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
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
          Available Services
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore all healthcare services available across our network of
          clinics
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search services by name, description, or clinic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 text-center">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">
            {filteredServices.length}
          </span>{" "}
          service{filteredServices.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? "No services found matching your search."
              : "No services available at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              {/* Service Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-5">
                <h3 className="text-xl font-bold text-white">{service.name}</h3>
              </div>

              {/* Service Details */}
              <div className="p-6 space-y-4">
                <p className="text-gray-600 text-sm min-h-[3rem]">
                  {service.description}
                </p>

                {/* Clinic Link */}
                {service.clinique && (
                  <Link
                    href={`/portal/clinic/${service.clinique.id}`}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors group"
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm font-medium group-hover:underline">
                      {service.clinique.name}
                    </span>
                  </Link>
                )}

                {/* Price and Duration */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">{service.price}</span>
                    </div>
                  </div>

                  {service.durationMinutes && (
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {service.durationMinutes} min
                      </span>
                    </div>
                  )}
                </div>

                {/* View Clinic Button */}
                {service.clinique && (
                  <Link
                    href={`/portal/clinic/${service.clinique.id}`}
                    className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium mt-4"
                  >
                    View Clinic
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
