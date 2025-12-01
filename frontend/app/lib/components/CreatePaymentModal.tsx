"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Facturation } from "@/lib/models/facturation.model";
import {
  facturationService,
  CreatePaymentDto,
} from "@/lib/services/facturation.service";

const paymentSchema = z.object({
  amount: z.number().min(0.01, "Le montant doit être supérieur à 0"),
  paymentMethod: z.string().min(1, "La méthode de paiement est requise"),
  transactionId: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface CreatePaymentModalProps {
  invoice: Facturation;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePaymentModal({
  invoice,
  onClose,
  onSuccess,
}: CreatePaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingAmount = invoice.totalAmount - invoice.paidAmount;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingAmount,
      paymentMethod: "cash",
    },
  });

  const selectedAmount = watch("amount");

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setLoading(true);
      setError(null);

      if (data.amount > remainingAmount) {
        setError(`Le montant ne peut pas dépasser ${remainingAmount} DT`);
        return;
      }

      const paymentData: CreatePaymentDto = {
        facturatationId: invoice.id,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
      };

      await facturationService.createPayment(paymentData);
      onSuccess();
    } catch (err) {
      console.error("Failed to create payment:", err);
      setError("Erreur lors de l'enregistrement du paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Enregistrer Paiement
            </h2>
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

          {/* Invoice Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Facture:</span>
              <span className="text-sm font-medium text-gray-900">
                {invoice.invoiceNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Patient:</span>
              <span className="text-sm font-medium text-gray-900">
                {invoice.patient.firstName} {invoice.patient.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Montant Total:</span>
              <span className="text-sm font-medium text-gray-900">
                {invoice.totalAmount} DT
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Déjà Payé:</span>
              <span className="text-sm font-medium text-green-600">
                {invoice.paidAmount} DT
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-900">
                Restant à Payer:
              </span>
              <span className="text-sm font-bold text-red-600">
                {remainingAmount} DT
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Montant du Paiement *
              </label>
              <input
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.amount.message}
                </p>
              )}
              {selectedAmount && (
                <p className="mt-1 text-xs text-gray-500">
                  {selectedAmount >= remainingAmount
                    ? "Paiement complet"
                    : `Paiement partiel - Restera ${
                        remainingAmount - selectedAmount
                      } DT`}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Méthode de Paiement *
              </label>
              <select
                {...register("paymentMethod")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cash">Espèces</option>
                <option value="card">Carte Bancaire</option>
                <option value="check">Chèque</option>
                <option value="transfer">Virement</option>
                <option value="other">Autre</option>
              </select>
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Référence / N° Transaction (optionnel)
              </label>
              <input
                type="text"
                {...register("transactionId")}
                placeholder="Ex: CHQ123456, TRN789..."
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
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
