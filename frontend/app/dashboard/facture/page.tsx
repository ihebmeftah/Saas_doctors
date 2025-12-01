"use client";

import { useAuth } from "@/lib/contexts/auth.context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { facturationService } from "@/lib/services/facturation.service";
import { Facturation, FacturationStatus } from "@/lib/models/facturation.model";
import { CreatePaymentModal } from "@/lib/components/CreatePaymentModal";
import { UserRole } from "@/lib/models/user.model";

export default function FacturePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Facturation[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Facturation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<
    FacturationStatus | "all"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Facturation | null>(
    null
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== UserRole.RECEP) {
      router.push("/dashboard");
      return;
    }
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await facturationService.getReceptionistInvoices();
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error) {
      console.error("Failed to load invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = invoices;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((inv) => inv.status === selectedStatus);
    }

    // Filter by search term (patient name or invoice number)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(term) ||
          `${inv.patient.firstName} ${inv.patient.lastName}`
            .toLowerCase()
            .includes(term)
      );
    }

    setFilteredInvoices(filtered);
  }, [selectedStatus, searchTerm, invoices]);

  const getStatusColor = (status: FacturationStatus) => {
    switch (status) {
      case FacturationStatus.PAID:
        return "bg-green-100 text-green-800";
      case FacturationStatus.PARTIALLY_PAID:
        return "bg-yellow-100 text-yellow-800";
      case FacturationStatus.ISSUED:
        return "bg-blue-100 text-blue-800";
      case FacturationStatus.OVERDUE:
        return "bg-red-100 text-red-800";
      case FacturationStatus.CANCELLED:
        return "bg-gray-100 text-gray-800";
      case FacturationStatus.DRAFT:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: FacturationStatus) => {
    switch (status) {
      case FacturationStatus.PAID:
        return "Payé";
      case FacturationStatus.PARTIALLY_PAID:
        return "Partiellement Payé";
      case FacturationStatus.ISSUED:
        return "Émis";
      case FacturationStatus.OVERDUE:
        return "En Retard";
      case FacturationStatus.CANCELLED:
        return "Annulé";
      case FacturationStatus.DRAFT:
        return "Brouillon";
      default:
        return status;
    }
  };

  const handlePaymentClick = (invoice: Facturation) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    loadInvoices();
    setShowPaymentModal(false);
    setSelectedInvoice(null);
  };

  const stats = {
    total: invoices.length,
    paid: invoices.filter((inv) => inv.status === FacturationStatus.PAID)
      .length,
    pending: invoices.filter(
      (inv) =>
        inv.status === FacturationStatus.ISSUED ||
        inv.status === FacturationStatus.PARTIALLY_PAID
    ).length,
    overdue: invoices.filter((inv) => inv.status === FacturationStatus.OVERDUE)
      .length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paidAmount: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Facturation</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">
            Total Factures
          </div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {stats.total}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Payées</div>
          <div className="mt-2 text-3xl font-semibold text-green-600">
            {stats.paid}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">En Attente</div>
          <div className="mt-2 text-3xl font-semibold text-yellow-600">
            {stats.pending}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">En Retard</div>
          <div className="mt-2 text-3xl font-semibold text-red-600">
            {stats.overdue}
          </div>
        </div>
      </div>

      {/* Amount Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Montant Total</div>
          <div className="mt-2 text-2xl font-semibold text-gray-900">
            {stats.totalAmount} DT
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Montant Payé</div>
          <div className="mt-2 text-2xl font-semibold text-green-600">
            {stats.paidAmount} DT
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Numéro de facture ou nom du patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value as FacturationStatus | "all")
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value={FacturationStatus.ISSUED}>Émis</option>
              <option value={FacturationStatus.PARTIALLY_PAID}>
                Partiellement Payé
              </option>
              <option value={FacturationStatus.PAID}>Payé</option>
              <option value={FacturationStatus.OVERDUE}>En Retard</option>
              <option value={FacturationStatus.CANCELLED}>Annulé</option>
              <option value={FacturationStatus.DRAFT}>Brouillon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date RDV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Aucune facture trouvée
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const remaining = invoice.totalAmount - invoice.paidAmount;
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.patient.firstName} {invoice.patient.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.rdv
                          ? new Date(invoice.rdv.rdvDate).toLocaleDateString(
                              "fr-FR"
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.totalAmount} DT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {invoice.paidAmount} DT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {remaining} DT
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {getStatusLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {invoice.status !== FacturationStatus.PAID &&
                          invoice.status !== FacturationStatus.CANCELLED && (
                            <button
                              onClick={() => handlePaymentClick(invoice)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              Enregistrer Paiement
                            </button>
                          )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <CreatePaymentModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedInvoice(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
