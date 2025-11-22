"use client";

import { useEffect, useState } from "react";
import { paymentService } from "@/lib/services/payment.service";
import {
  Payment,
  PaymentStatus,
  PaymentMethod,
} from "@/lib/models/payment.model";
import {
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  CheckCircle,
} from "lucide-react";

const statusColors = {
  [PaymentStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [PaymentStatus.PROCESSING]: "bg-blue-100 text-blue-800",
  [PaymentStatus.COMPLETED]: "bg-green-100 text-green-800",
  [PaymentStatus.FAILED]: "bg-red-100 text-red-800",
  [PaymentStatus.CANCELLED]: "bg-gray-100 text-gray-800",
  [PaymentStatus.REFUNDED]: "bg-purple-100 text-purple-800",
};

const statusLabels = {
  [PaymentStatus.PENDING]: "Pending",
  [PaymentStatus.PROCESSING]: "Processing",
  [PaymentStatus.COMPLETED]: "Completed",
  [PaymentStatus.FAILED]: "Failed",
  [PaymentStatus.CANCELLED]: "Cancelled",
  [PaymentStatus.REFUNDED]: "Refunded",
};

const methodLabels = {
  [PaymentMethod.CASH]: "Cash",
  [PaymentMethod.CREDIT_CARD]: "Credit Card",
  [PaymentMethod.DEBIT_CARD]: "Debit Card",
  [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
  [PaymentMethod.CHECK]: "Check",
};

export default function MyPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getMyPayments();
      // Sort by date, newest first
      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPayments(sorted);
    } catch {
      setError("Failed to load payments");
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

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No payments found</p>
        <p className="text-gray-400 text-sm mt-2">
          Your payment history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Payments</h2>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Payment - {payment.transactionId}
                </h3>
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[payment.status]
                    }`}
                  >
                    {statusLabels[payment.status]}
                  </span>
                  <span className="text-sm text-gray-600">
                    via {methodLabels[payment.paymentMethod]}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${payment.amount}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(payment.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {payment.completedAt && (
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Completed At</p>
                    <p className="font-medium text-gray-900">
                      {new Date(payment.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Invoice</p>
                  <p className="font-medium text-gray-900">
                    #{payment.facturation.invoiceNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    Total: ${payment.facturation.totalAmount}
                  </p>
                </div>
              </div>

              {payment.reference && (
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Reference</p>
                    <p className="font-medium text-gray-900">
                      {payment.reference}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {payment.notes && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Notes:</p>
                <p className="text-gray-700">{payment.notes}</p>
              </div>
            )}

            {payment.receiptUrl && (
              <div className="mt-4">
                <a
                  href={payment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Receipt</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
