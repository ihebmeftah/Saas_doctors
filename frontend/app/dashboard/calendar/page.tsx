"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/auth.context";
import { UserRole } from "@/lib/models/user.model";
import { rdvService, ChangeStatusDto } from "@/lib/services/rdv.service";
import { Rdv, RdvStatus } from "@/lib/models/rdv.model";
import ConsultationModal from "@/lib/components/ConsultationModal";
import CreateEditAppointment from "@/lib/components/CreateEditAppointment";
import AppointmentDetailsModal from "@/lib/components/AppointmentDetailsModal";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  appointments: Rdv[];
}

const statusColors: Record<RdvStatus, string> = {
  [RdvStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [RdvStatus.SCHEDULED]: "bg-blue-100 text-blue-800 border-blue-200",
  [RdvStatus.IN_PROGRESS]: "bg-purple-100 text-purple-800 border-purple-200",
  [RdvStatus.COMPLETED]: "bg-green-100 text-green-800 border-green-200",
  [RdvStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<RdvStatus, string> = {
  [RdvStatus.PENDING]: "Pending",
  [RdvStatus.SCHEDULED]: "Scheduled",
  [RdvStatus.IN_PROGRESS]: "In Progress",
  [RdvStatus.COMPLETED]: "Completed",
  [RdvStatus.CANCELLED]: "Cancelled",
};

export default function CalendarPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Rdv[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Rdv | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const isReceptionist = user?.role === UserRole.RECEP;
  const isDoctor = user?.role === UserRole.DOCTOR;

  // Get active appointment from local state for restriction checks
  const activeAppointment = isDoctor
    ? appointments.find((apt) => apt.status === RdvStatus.IN_PROGRESS)
    : null;

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = isReceptionist
        ? await rdvService.getReceptionistAppointments()
        : await rdvService.getDoctorAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41);

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      // Use local timezone for date comparison to avoid date shift
      const year = d.getFullYear();
      const month = d.getMonth();
      const day = d.getDate();

      const dayAppointments = appointments.filter((apt) => {
        const aptDate = new Date(apt.rdvDate);
        return (
          aptDate.getFullYear() === year &&
          aptDate.getMonth() === month &&
          aptDate.getDate() === day
        );
      });

      days.push({
        date: new Date(d),
        isCurrentMonth: d.getMonth() === currentDate.getMonth(),
        appointments: dayAppointments,
      });
    }

    return days;
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(
        (apt) =>
          new Date(apt.rdvDate) >= now &&
          apt.status !== RdvStatus.COMPLETED &&
          apt.status !== RdvStatus.CANCELLED
      )
      .sort(
        (a, b) => new Date(a.rdvDate).getTime() - new Date(b.rdvDate).getTime()
      )
      .slice(0, 10);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleStatusChange = async (appointment: Rdv, newStatus: RdvStatus) => {
    // For doctors: prevent canceling the in-progress appointment
    if (
      isDoctor &&
      appointment.status === RdvStatus.IN_PROGRESS &&
      newStatus === RdvStatus.CANCELLED
    ) {
      alert(
        "You cannot cancel an appointment that is currently in progress. Please complete it first."
      );
      return;
    }

    // For doctors: prevent starting new appointment or cancelling when one is in progress
    if (
      isDoctor &&
      activeAppointment &&
      activeAppointment.id !== appointment.id
    ) {
      if (newStatus === RdvStatus.IN_PROGRESS) {
        alert(
          `You cannot start a new appointment while "${activeAppointment.patient.firstName} ${activeAppointment.patient.lastName}" appointment is in progress. Please complete the current appointment first.`
        );
        return;
      }
      if (newStatus === RdvStatus.CANCELLED) {
        alert(
          `You cannot cancel appointments while an appointment is in progress. Please complete the current appointment first.`
        );
        return;
      }
    }

    if (newStatus === RdvStatus.COMPLETED) {
      setSelectedAppointment(appointment);
      setShowConsultationModal(true);
    } else {
      try {
        const data: ChangeStatusDto = { status: newStatus };
        await rdvService.changeStatus(appointment.id, data);
        await loadAppointments();
      } catch (error) {
        console.error("Failed to change status:", error);
        alert("Failed to change appointment status");
      }
    }
  };

  const handleConsultationSubmit = async (consultationData: {
    examination: string;
    diagnosis: string;
    treatment: string;
  }) => {
    if (!selectedAppointment) return;

    try {
      setIsSubmitting(true);
      const data: ChangeStatusDto = {
        status: RdvStatus.COMPLETED,
        examination: consultationData.examination,
        diagnosis: consultationData.diagnosis,
        treatment: consultationData.treatment,
      };
      await rdvService.changeStatus(selectedAppointment.id, data);
      await loadAppointments();
      setShowConsultationModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error("Failed to complete consultation:", error);
      alert("Failed to complete consultation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const calendarDays = getCalendarDays();
  const upcomingAppointments = getUpcomingAppointments();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Calendar</h1>
        <p className="text-gray-600 mt-1">
          Manage your appointments and schedule
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
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
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}

            {calendarDays.map((day, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedDay(day.date);
                  if (isReceptionist) {
                    setShowCreateModal(true);
                  }
                }}
                className={`
                  min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all
                  ${
                    !day.isCurrentMonth
                      ? "bg-gray-50 text-gray-400"
                      : "bg-white hover:bg-blue-50"
                  }
                  ${
                    isToday(day.date)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }
                  ${
                    selectedDay?.toDateString() === day.date.toDateString()
                      ? "ring-2 ring-blue-500"
                      : ""
                  }
                `}
              >
                <div className="text-sm font-medium mb-1">
                  {day.date.getDate()}
                </div>
                {day.appointments.length > 0 && (
                  <div className="space-y-1">
                    {day.appointments.slice(0, 2).map((apt, i) => (
                      <div
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(apt);
                          setShowDetailsModal(true);
                        }}
                        className={`text-xs px-1 py-0.5 rounded truncate hover:opacity-80 transition-opacity ${
                          statusColors[apt.status]
                        }`}
                      >
                        {formatTime(apt.rdvDate)}
                      </div>
                    ))}
                    {day.appointments.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{day.appointments.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Upcoming Appointments
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedAppointment(apt);
                    setShowDetailsModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {apt.patient.firstName} {apt.patient.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(apt.rdvDate)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(apt.rdvDate)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        statusColors[apt.status]
                      }`}
                    >
                      {statusLabels[apt.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    <span className="font-medium">Reason:</span> {apt.reason}
                  </p>

                  {/* Status Change Buttons - Only for Doctors */}
                  {!isReceptionist && (
                    <div
                      className="flex flex-wrap gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {apt.status === RdvStatus.PENDING && (
                        <button
                          onClick={() =>
                            handleStatusChange(apt, RdvStatus.SCHEDULED)
                          }
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Schedule
                        </button>
                      )}
                      {apt.status === RdvStatus.SCHEDULED && (
                        <button
                          onClick={() =>
                            handleStatusChange(apt, RdvStatus.IN_PROGRESS)
                          }
                          className="text-xs px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {apt.status === RdvStatus.IN_PROGRESS && (
                        <button
                          onClick={() =>
                            handleStatusChange(apt, RdvStatus.COMPLETED)
                          }
                          className="text-xs px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {apt.status !== RdvStatus.CANCELLED &&
                        apt.status !== RdvStatus.COMPLETED && (
                          <button
                            onClick={() =>
                              handleStatusChange(apt, RdvStatus.CANCELLED)
                            }
                            className="text-xs px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No upcoming appointments
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Consultation Modal - Only for Doctors */}
      {!isReceptionist && selectedAppointment && (
        <ConsultationModal
          isOpen={showConsultationModal}
          onClose={() => {
            setShowConsultationModal(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSubmit={handleConsultationSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Create Appointment Modal - Only for Receptionists */}
      {isReceptionist && (
        <CreateEditAppointment
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedDay(null);
          }}
          selectedDate={selectedDay}
          onSubmit={async (data) => {
            await rdvService.create(data);
            await loadAppointments();
          }}
        />
      )}

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
      />
    </div>
  );
}
