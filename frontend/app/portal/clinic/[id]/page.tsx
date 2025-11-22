"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { cliniqueService } from "@/lib/services/clinique.service";
import { Clinique } from "@/lib/models/clinique.model";
import {
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Clock,
  DollarSign,
} from "lucide-react";

export default function ClinicDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clinicId = params.id as string;

  const [clinic, setClinic] = useState<Clinique | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClinicDetails = async () => {
    try {
      setLoading(true);
      const data = await cliniqueService.getById(clinicId);

      // Check if clinic is soft-deleted
      if (data.deletedAt) {
        setError("This clinic is no longer available.");
        setClinic(null);
      } else {
        setClinic(data);
      }
    } catch (err) {
      setError("Failed to load clinic details. Please try again later.");
      console.error("Error loading clinic details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clinicId) {
      loadClinicDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push("/portal")}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Clinics</span>
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          {error || "Clinic not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push("/portal")}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Clinics</span>
      </button>

      {/* Clinic Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold mb-4">{clinic.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-50">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5" />
            <span>{clinic.address}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5" />
            <span>{clinic.phone}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5" />
            <span>{clinic.email}</span>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Services
        </h2>

        {!clinic.services || clinic.services.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">
              No services are currently listed for this clinic.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clinic.services.map((service) => (
              <div
                key={service.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.name}
                </h3>

                <p className="text-gray-600 mb-4">{service.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-semibold text-lg">
                      {service.price}
                    </span>
                  </div>

                  {service.durationMinutes && (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm">
                        {service.durationMinutes} min
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Staff Section */}
      {(clinic.doctors && clinic.doctors.length > 0) ||
      (clinic.receptionists && clinic.receptionists.length > 0) ? (
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Team</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Doctors */}
            {clinic.doctors && clinic.doctors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Doctors
                </h3>
                <div className="space-y-3">
                  {clinic.doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {doctor.firstName?.[0]}
                        {doctor.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{doctor.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Receptionists */}
            {clinic.receptionists && clinic.receptionists.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Reception Staff
                </h3>
                <div className="space-y-3">
                  {clinic.receptionists.map((receptionist) => (
                    <div
                      key={receptionist.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {receptionist.firstName?.[0]}
                        {receptionist.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {receptionist.firstName} {receptionist.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {receptionist.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Contact CTA */}
      <div className="bg-blue-50 rounded-lg p-8 mt-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Ready to Book an Appointment?
        </h3>
        <p className="text-gray-600 mb-6">
          Contact us directly to schedule your visit
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={`tel:${clinic.phone}`}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Call {clinic.phone}
          </a>
          <a
            href={`mailto:${clinic.email}`}
            className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Send Email
          </a>
        </div>
      </div>
    </div>
  );
}
