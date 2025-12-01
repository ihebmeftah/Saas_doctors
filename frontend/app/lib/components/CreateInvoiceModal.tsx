"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Rdv } from "@/lib/models/rdv.model";
import {
  facturationService,
  CreateFacturationDto,
} from "@/lib/services/facturation.service";

const invoiceSchema = z.object({
  totalAmount: z.number().min(0.01, "Le montant doit être supérieur à 0"),
  taxAmount: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface CreateInvoiceModalProps {
  appointment: Rdv;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateInvoiceModal({
  appointment,
  onClose,
  onSuccess,
}: CreateInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      totalAmount: 0,
      taxAmount: 0,
      discountAmount: 0,
      description: `Consultation - ${appointment.reason}`,
    },
  });

  const totalAmount = watch("totalAmount") || 0;
  const taxAmount = watch("taxAmount") || 0;
  const discountAmount = watch("discountAmount") || 0;
  const finalAmount = totalAmount + taxAmount - discountAmount;

  const onSubmit = async (data: InvoiceFormData) => {
    try {
      setLoading(true);
      setError(null);

      const invoiceData: CreateFacturationDto = {
        patientId: appointment.patient.id,
        cliniqueId: appointment.clinique.id,
        rdvId: appointment.id,
        totalAmount: finalAmount,
        taxAmount: data.taxAmount || 0,
        discountAmount: data.discountAmount || 0,
        dueDate: data.dueDate,
        description: data.description,
      };

      await facturationService.createInvoice(invoiceData);
      onSuccess();
    } catch (err) {
      console.error("Failed to create invoice:", err);
      setError("Erreur lors de la création de la facture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Créer Facture</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg
                className="w-6 h-6"
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

          {/* Appointment Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <h3 className="font-semibold text-gray-900 mb-2">
              Détails du Rendez-vous
            </h3>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Patient:</span>
              <span className="text-sm font-medium text-gray-900">
                {appointment.patient.firstName} {appointment.patient.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Médecin:</span>
              <span className="text-sm font-medium text-gray-900">
                Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Date:</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(appointment.rdvDate).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Motif:</span>
              <span className="text-sm font-medium text-gray-900">
                {appointment.reason}
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant de Base (DT) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register("totalAmount", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.totalAmount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.totalAmount.message}
                </p>
              )}
            </div>

            {/* Tax Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taxes (DT)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("taxAmount", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Discount Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remise (DT)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("discountAmount", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Final Amount Summary */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Montant de Base:</span>
                  <span className="font-medium">{totalAmount} DT</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes:</span>
                    <span className="font-medium text-green-600">
                      +{taxAmount} DT
                    </span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remise:</span>
                    <span className="font-medium text-red-600">
                      -{discountAmount} DT
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-blue-300">
                  <span className="font-semibold text-gray-900">
                    Montant Total:
                  </span>
                  <span className="font-bold text-blue-600 text-lg">
                    {finalAmount} DT
                  </span>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d&apos;Échéance
              </label>
              <input
                type="date"
                {...register("dueDate")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Création..." : "Créer Facture"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
