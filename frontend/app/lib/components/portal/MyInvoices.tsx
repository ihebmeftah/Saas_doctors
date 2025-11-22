"use client";

import { useEffect, useState } from "react";
import { facturationService } from "@/lib/services/facturation.service";
import { Facturation, FacturationStatus } from "@/lib/models/facturation.model";
import {
  FileText,
  Calendar,
  DollarSign,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";

const statusColors = {
  [FacturationStatus.DRAFT]: "bg-gray-100 text-gray-800",
  [FacturationStatus.ISSUED]: "bg-blue-100 text-blue-800",
  [FacturationStatus.PAID]: "bg-green-100 text-green-800",
  [FacturationStatus.PARTIALLY_PAID]: "bg-yellow-100 text-yellow-800",
  [FacturationStatus.OVERDUE]: "bg-red-100 text-red-800",
  [FacturationStatus.CANCELLED]: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  [FacturationStatus.DRAFT]: "Draft",
  [FacturationStatus.ISSUED]: "Issued",
  [FacturationStatus.PAID]: "Paid",
  [FacturationStatus.PARTIALLY_PAID]: "Partially Paid",
  [FacturationStatus.OVERDUE]: "Overdue",
  [FacturationStatus.CANCELLED]: "Cancelled",
};

export default function MyInvoices() {
  const [invoices, setInvoices] = useState<Facturation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await facturationService.getMyInvoices();
      // Sort by date, newest first
      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setInvoices(sorted);
    } catch {
      setError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No invoices found</p>
        <p className="text-gray-400 text-sm mt-2">
          Your invoices will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Invoices</h2>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Invoice #{invoice.invoiceNumber}
                </h3>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[invoice.status]
                  }`}
                >
                  {statusLabels[invoice.status]}
                </span>
              </div>
            </div>

            {invoice.description && (
              <p className="text-gray-600 mb-4">{invoice.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {invoice.dueDate && (
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Clinic</p>
                  <p className="font-medium text-gray-900">
                    {invoice.clinique.name}
                  </p>
                </div>
              </div>

              {invoice.rdv && (
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Related Appointment</p>
                    <p className="font-medium text-gray-900">
                      {invoice.rdv.reason}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(invoice.rdv.rdvDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Amount Details */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Total Amount:</span>
                  <span className="font-semibold">${invoice.totalAmount}</span>
                </div>

                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Discount:</span>
                    <span className="text-green-600">
                      -${invoice.discountAmount}
                    </span>
                  </div>
                )}

                {invoice.taxAmount && invoice.taxAmount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Tax:</span>
                    <span>${invoice.taxAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-700">
                  <span>Paid Amount:</span>
                  <span className="font-semibold text-green-600">
                    ${invoice.paidAmount}
                  </span>
                </div>

                {invoice.remainingAmount !== undefined &&
                  invoice.remainingAmount > 0 && (
                    <div className="flex justify-between text-lg font-bold text-red-600 pt-2 border-t">
                      <span>Remaining:</span>
                      <span>${invoice.remainingAmount}</span>
                    </div>
                  )}

                {invoice.status === FacturationStatus.PAID && (
                  <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t">
                    <DollarSign className="w-5 h-5 inline mr-1" />
                    <span>Fully Paid</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
