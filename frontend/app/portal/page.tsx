"use client";

import { useEffect, useState } from "react";
import { cliniqueService } from "@/lib/services/clinique.service";
import { Clinique } from "@/lib/models/clinique.model";
import Link from "next/link";
import {
  Heart,
  Shield,
  Clock,
  Star,
  MapPin,
  ArrowRight,
  Users,
  Calendar,
  Activity,
} from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Patient",
    content:
      "The platform made it so easy to find the right clinic for my needs. The booking process was seamless and the staff was professional.",
    rating: 5,
    avatar: "SJ",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Regular Patient",
    content:
      "I've been using this service for over a year now. The quality of care and convenience is unmatched. Highly recommend!",
    rating: 5,
    avatar: "MC",
  },
  {
    id: 3,
    name: "Emma Williams",
    role: "Patient",
    content:
      "Great experience! Being able to see all available services and compare clinics helped me make an informed decision.",
    rating: 5,
    avatar: "EW",
  },
];

const features = [
  {
    icon: Heart,
    title: "Quality Healthcare",
    description:
      "Access to a network of verified and professional healthcare clinics committed to your wellbeing.",
  },
  {
    icon: Shield,
    title: "Safe & Secure",
    description:
      "Your health information is protected with industry-standard security measures.",
  },
  {
    icon: Clock,
    title: "Save Time",
    description:
      "Browse clinics, compare services, and find the perfect match all in one place.",
  },
  {
    icon: Users,
    title: "Expert Doctors",
    description:
      "Connect with experienced healthcare professionals across various specialties.",
  },
];

export default function PortalHomePage() {
  const [clinics, setClinics] = useState<Clinique[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = async () => {
    try {
      setLoading(true);
      const data = await cliniqueService.getAll();
      const activeClinics = data.filter((clinic) => !clinic.deletedAt);
      setClinics(activeClinics.slice(0, 3)); // Only show first 3 clinics
    } catch (err) {
      console.error("Error loading clinics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Your Health, Our Priority
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Connect with trusted healthcare clinics and professionals. Find
              the perfect care for you and your family.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/portal/clinics"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <span>Browse Clinics</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/portal/services"
                className="bg-blue-500 text-white border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-400 transition-colors"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? "..." : clinics.length}+
              </h3>
              <p className="text-gray-600">Partner Clinics</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">100+</h3>
              <p className="text-gray-600">Healthcare Professionals</p>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">24/7</h3>
              <p className="text-gray-600">Service Availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Purpose
            </h2>
            <p className="text-lg text-gray-600">
              We exist to make quality healthcare accessible and convenient for
              everyone. Our platform connects patients with trusted clinics,
              streamlining the process of finding and booking healthcare
              services.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Clinics */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Clinics
              </h2>
              <p className="text-gray-600">
                Discover our top-rated healthcare partners
              </p>
            </div>
            <Link
              href="/portal/clinics"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-2"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {clinics.map((clinic) => (
                <Link
                  key={clinic.id}
                  href={`/portal/clinic/${clinic.id}`}
                  className="bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden group"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                    <h3 className="text-xl font-bold text-white">
                      {clinic.name}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start space-x-2 text-gray-600 mb-4">
                      <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{clinic.address}</span>
                    </div>
                    {clinic.services && clinic.services.length > 0 && (
                      <p className="text-sm text-blue-600 font-medium mb-3">
                        {clinic.services.length} services available
                      </p>
                    )}
                    <span className="text-blue-600 font-medium text-sm group-hover:underline">
                      Learn More →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Patients Say
            </h2>
            <p className="text-lg text-gray-600">
              Real experiences from people who trust our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow"
              >
                {/* Rating Stars */}
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 mb-6 italic">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of patients who trust our platform for their
            healthcare needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/portal/clinics"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Find a Clinic
            </Link>
            <Link
              href="/login"
              className="bg-blue-500 text-white border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-400 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
