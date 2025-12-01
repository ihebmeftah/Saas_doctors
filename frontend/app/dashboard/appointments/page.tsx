"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth.context";
import { rdvService } from "@/lib/services/rdv.service";
import { RdvStatus } from "@/lib/models/rdv.model";
import { facturationService } from "@/lib/services/facturation.service";
import { CreatePaymentModal } from "@/lib/components/CreatePaymentModal";
import { Facturation } from "@/lib/models/facturation.model";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  LayoutGrid,
  LayoutList,
  DollarSign,
} from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  speciality?: string;
}

interface Appointment {
  id: string;
  rdvDate: string;
  reason?: string;
  status: RdvStatus;
  patient: Patient;
  doctor: Doctor;
  examination?: string;
  diagnosis?: string;
  treatment?: string;
  amount?: number;
  clinique?: {
    id: string;
    name: string;
  };
  facturation?: {
    id: string;
    invoiceNumber: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
  };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RdvStatus | "ALL">("ALL");
  const [showTodayOnly, setShowTodayOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [changingStatus, setChangingStatus] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Facturation | null>(
    null
  );
  const [loadingInvoice, setLoadingInvoice] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadAppointments();
  }, [user, router]);

  useEffect(() => {
    filterAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, searchQuery, statusFilter, showTodayOnly, appointments]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await rdvService.getReceptionistAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    const today = new Date().toISOString().split("T")[0];

    // Filter by today checkbox
    if (showTodayOnly) {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.rdvDate).toISOString().split("T")[0];
        return aptDate === today;
      });
    }
    // Filter by selected date
    else if (selectedDate) {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.rdvDate).toISOString().split("T")[0];
        return aptDate === selectedDate;
      });
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.patient.firstName.toLowerCase().includes(query) ||
          apt.patient.lastName.toLowerCase().includes(query) ||
          apt.doctor.firstName.toLowerCase().includes(query) ||
          apt.doctor.lastName.toLowerCase().includes(query) ||
          apt.reason?.toLowerCase().includes(query)
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: RdvStatus.SCHEDULED | RdvStatus.CANCELLED
  ) => {
    try {
      setChangingStatus(appointmentId);
      await rdvService.changeStatus(appointmentId, { status: newStatus });
      await loadAppointments();
    } catch (error) {
      console.error("Failed to change status:", error);
      alert("Failed to change appointment status");
    } finally {
      setChangingStatus(null);
    }
  };

  const handleCreatePayment = async (appointmentId: string) => {
    try {
      setLoadingInvoice(appointmentId);

      // Find the appointment to get its details
      const appointment = appointments.find((apt) => apt.id === appointmentId);
      if (!appointment) {
        alert("Appointment not found");
        return;
      }

      let invoice: Facturation;

      // Check if invoice already exists
      if (appointment.facturation) {
        // Load full invoice details
        invoice = await facturationService.getById(appointment.facturation.id);
      } else {
        // Create new invoice for this appointment
        if (!appointment.clinique || !appointment.amount) {
          alert("Missing clinic or amount information");
          return;
        }

        const invoiceData = {
          patientId: appointment.patient.id,
          cliniqueId: appointment.clinique.id,
          rdvId: appointment.id,
          totalAmount: appointment.amount,
          description: `Consultation - ${appointment.reason || "N/A"}`,
        };

        invoice = await facturationService.createInvoice(invoiceData);
      }

      setSelectedInvoice(invoice);
    } catch (error: any) {
      console.error("Failed to load/create invoice:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to load invoice for this appointment"
      );
    } finally {
      setLoadingInvoice(null);
    }
  };

  const handlePaymentSuccess = () => {
    setSelectedInvoice(null);
    router.push("/dashboard/facture");
  };

  const getStatusColor = (
    status: RdvStatus
  ): { bg: string; text: string; icon: React.ReactElement } => {
    switch (status) {
      case RdvStatus.PENDING:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          icon: <AlertCircle className="w-4 h-4" />,
        };
      case RdvStatus.SCHEDULED:
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          icon: <Calendar className="w-4 h-4" />,
        };
      case RdvStatus.IN_PROGRESS:
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          icon: <Clock className="w-4 h-4" />,
        };
      case RdvStatus.COMPLETED:
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case RdvStatus.CANCELLED:
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          icon: <XCircle className="w-4 h-4" />,
        };
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">
            Loading appointments...
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total",
      value: filteredAppointments.length,
      icon: <Calendar className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-500",
      bg: "bg-gradient-to-br from-purple-50 to-pink-50",
    },
    {
      label: "Pending",
      value: filteredAppointments.filter((a) => a.status === RdvStatus.PENDING)
        .length,
      icon: <AlertCircle className="w-6 h-6" />,
      gradient: "from-gray-500 to-gray-600",
      bg: "bg-gradient-to-br from-gray-50 to-gray-100",
    },
    {
      label: "Scheduled",
      value: filteredAppointments.filter(
        (a) => a.status === RdvStatus.SCHEDULED
      ).length,
      icon: <Calendar className="w-6 h-6" />,
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
    },
    {
      label: "Completed",
      value: filteredAppointments.filter(
        (a) => a.status === RdvStatus.COMPLETED
      ).length,
      icon: <CheckCircle className="w-6 h-6" />,
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-gradient-to-br from-green-50 to-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Appointment Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage and track all patient appointments
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-md">
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === "card"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <LayoutList className="w-4 h-4" />
                Table
              </button>
            </div>
            <button
              onClick={loadAppointments}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-2xl p-6 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div
                className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters - Compact Single Row */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setShowTodayOnly(false);
              }}
              disabled={showTodayOnly}
              className="pl-3 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Today Checkbox */}
          <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={showTodayOnly}
              onChange={(e) => {
                setShowTodayOnly(e.target.checked);
                if (e.target.checked) {
                  setSelectedDate("");
                }
              }}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Today
            </span>
          </label>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as RdvStatus | "ALL")
            }
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="ALL">All Status</option>
            <option value={RdvStatus.PENDING}>Pending</option>
            <option value={RdvStatus.SCHEDULED}>Scheduled</option>
            <option value={RdvStatus.IN_PROGRESS}>In Progress</option>
            <option value={RdvStatus.COMPLETED}>Completed</option>
            <option value={RdvStatus.CANCELLED}>Cancelled</option>
          </select>

          {/* Results Count & Clear */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              <span className="font-semibold text-gray-900">
                {filteredAppointments.length}
              </span>{" "}
              / {appointments.length}
            </span>
            {(searchQuery ||
              statusFilter !== "ALL" ||
              selectedDate ||
              showTodayOnly) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setSelectedDate("");
                  setShowTodayOnly(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Appointments Display */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No appointments found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or search criteria
            </p>
          </div>
        </div>
      ) : viewMode === "card" ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map((appointment) => {
            const statusColors = getStatusColor(appointment.status);
            const isChanging = changingStatus === appointment.id;

            return (
              <div
                key={appointment.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                {/* Card Header */}
                <div
                  className={`${statusColors.bg} ${statusColors.text} px-6 py-4`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {statusColors.icon}
                      <span className="font-semibold text-sm uppercase tracking-wide">
                        {appointment.status}
                      </span>
                    </div>
                    <Clock className="w-4 h-4" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Date & Time */}
                  <div className="flex items-center gap-2 mb-4 text-gray-700">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">
                      {formatDate(appointment.rdvDate)}
                    </span>
                  </div>

                  {/* Patient Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-600">
                        Patient
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 ml-7">
                      {appointment.patient.firstName}{" "}
                      {appointment.patient.lastName}
                    </p>
                    <p className="text-sm text-gray-600 ml-7">
                      {appointment.patient.phone || appointment.patient.email}
                    </p>
                  </div>

                  {/* Doctor Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-600">
                        Doctor
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 ml-7">
                      Dr. {appointment.doctor.firstName}{" "}
                      {appointment.doctor.lastName}
                    </p>
                    {appointment.doctor.speciality && (
                      <p className="text-sm text-gray-600 ml-7">
                        {appointment.doctor.speciality}
                      </p>
                    )}
                  </div>

                  {/* Reason */}
                  {appointment.reason && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        {appointment.reason}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    {appointment.status === RdvStatus.PENDING && (
                      <button
                        onClick={() =>
                          handleStatusChange(
                            appointment.id,
                            RdvStatus.SCHEDULED
                          )
                        }
                        disabled={isChanging}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
                      >
                        {isChanging ? "Processing..." : "Schedule"}
                      </button>
                    )}
                    {(appointment.status === RdvStatus.PENDING ||
                      appointment.status === RdvStatus.SCHEDULED) && (
                      <button
                        onClick={() =>
                          handleStatusChange(
                            appointment.id,
                            RdvStatus.CANCELLED
                          )
                        }
                        disabled={isChanging}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
                      >
                        {isChanging ? "Processing..." : "Cancel"}
                      </button>
                    )}
                    {appointment.status === RdvStatus.COMPLETED && (
                      <>
                        {appointment.facturation ? (
                          appointment.facturation.paidAmount >=
                          appointment.facturation.totalAmount ? (
                            <button
                              disabled
                              className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed transition-all font-medium text-sm flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Fully Paid
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleCreatePayment(appointment.id)
                              }
                              disabled={loadingInvoice === appointment.id}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center justify-center gap-2"
                            >
                              <DollarSign className="w-4 h-4" />
                              {loadingInvoice === appointment.id
                                ? "Loading..."
                                : "Add Payment"}
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => handleCreatePayment(appointment.id)}
                            disabled={loadingInvoice === appointment.id}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center justify-center gap-2"
                          >
                            <DollarSign className="w-4 h-4" />
                            {loadingInvoice === appointment.id
                              ? "Loading..."
                              : "Create Payment"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => {
                  const statusColors = getStatusColor(appointment.status);
                  const isChanging = changingStatus === appointment.id;

                  return (
                    <tr
                      key={appointment.id}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          {formatDate(appointment.rdvDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {appointment.patient.firstName[0]}
                            {appointment.patient.lastName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patient.firstName}{" "}
                              {appointment.patient.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.patient.phone ||
                                appointment.patient.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Dr. {appointment.doctor.firstName}{" "}
                              {appointment.doctor.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.doctor.speciality}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-sm text-gray-900 truncate">
                          {appointment.reason || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusColors.bg} ${statusColors.text}`}
                        >
                          {statusColors.icon}
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {appointment.status === RdvStatus.PENDING && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  appointment.id,
                                  RdvStatus.SCHEDULED
                                )
                              }
                              disabled={isChanging}
                              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                            >
                              {isChanging ? "..." : "Schedule"}
                            </button>
                          )}
                          {(appointment.status === RdvStatus.PENDING ||
                            appointment.status === RdvStatus.SCHEDULED) && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  appointment.id,
                                  RdvStatus.CANCELLED
                                )
                              }
                              disabled={isChanging}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                            >
                              {isChanging ? "..." : "Cancel"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedInvoice && (
        <CreatePaymentModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
