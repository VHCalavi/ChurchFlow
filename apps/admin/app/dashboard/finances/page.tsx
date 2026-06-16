"use client";

import React, { useState } from "react";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import { 
  Plus, 
  Search, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  SlidersHorizontal,
  X,
  Construction
} from "lucide-react";

interface Transaction {
  id: string;
  donor: string;
  type: "DIMES" | "OFFRANDES" | "DONS" | "DEPENSE" | "AUTRE";
  amount: number;
  paymentMethod: "ESPECES" | "MOBILE_MONEY" | "CHEQUE" | "VIREMENT";
  date: string;
}

export default function FinancesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form states
  const [donor, setDonor] = useState("");
  const [type, setType] = useState<"DIMES" | "OFFRANDES" | "DONS" | "DEPENSE" | "AUTRE">("DIMES");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"ESPECES" | "MOBILE_MONEY" | "CHEQUE" | "VIREMENT">("MOBILE_MONEY");
  const [date, setDate] = useState("");

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "t1", donor: "Dr. Paul OBIANG", type: "DIMES", amount: 150000, paymentMethod: "VIREMENT", date: "2026-05-15" },
    { id: "t2", donor: "Fidèle Anonyme", type: "OFFRANDES", amount: 45000, paymentMethod: "ESPECES", date: "2026-05-17" },
    { id: "t3", donor: "Marc KOFFI", type: "DIMES", amount: 80000, paymentMethod: "MOBILE_MONEY", date: "2026-05-16" },
    { id: "t4", donor: "Achat projecteur multimédia", type: "DEPENSE", amount: 650000, paymentMethod: "CHEQUE", date: "2026-05-10" },
    { id: "t5", donor: "Don pour travaux temple", type: "DONS", amount: 1200000, paymentMethod: "VIREMENT", date: "2026-05-12" },
  ]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) {
      showNotification("Le montant et la date sont requis", "error");
      return;
    }

    const newTx: Transaction = {
      id: String(Date.now()),
      donor: donor || "Anonyme",
      type,
      amount: Number(amount),
      paymentMethod,
      date
    };

    setTransactions(prev => [newTx, ...prev]);
    showNotification("Transaction enregistrée !", "success");
    setDonor("");
    setType("DIMES");
    setAmount("");
    setPaymentMethod("MOBILE_MONEY");
    setDate("");
    setIsModalOpen(false);
  };

  const formatAmount = (num: number) => {
    return num.toLocaleString("fr-FR") + " F CFA";
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.donor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getSolde = () => {
    const revenue = transactions.filter(t => t.type !== "DEPENSE").reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.type === "DEPENSE").reduce((acc, t) => acc + t.amount, 0);
    return revenue - expenses;
  };

  return (
    <DashboardLayout title="Gestion Financière">
      {/* Under Construction Overlay */}
      <div className="relative w-full min-h-[600px] rounded-xl overflow-hidden">
        <div className="absolute inset-0 z-20 flex pt-48 justify-center p-6 bg-slate-900/5 backdrop-blur-[2px]">
          <div className="max-w-md h-min w-full p-8 rounded-2xl border border-slate-150 bg-white/95 shadow-premium text-center flex flex-col items-center transition-all duration-300 hover:scale-[1.01]">
            <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] mb-6 animate-pulse">
              <Construction className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2.5">Module en Construction</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Le module Gestion Financière est en cours de développement. Il permettra le suivi des dîmes, offrandes, dons et dépenses de la communauté.
            </p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-[#10B981] to-[#006C69] h-1.5 rounded-full" style={{ width: "30%" }} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">30% — En cours</span>
          </div>
        </div>

        {/* Blurred background content */}
        <div className="blur-[5px] opacity-50 pointer-events-none select-none">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-24 right-8 z-50 flex items-center px-4 py-3 rounded-xl border shadow-premium animate-fade-in ${
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Intro Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Solde Actuel</span>
            <div className="p-2.5 rounded-lg bg-primary/5 text-primary border border-primary/10">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{formatAmount(getSolde())}</h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Trésorerie globale disponible</p>
        </div>

        <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entrées ce mois</span>
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {formatAmount(transactions.filter(t => t.type !== "DEPENSE").reduce((acc, t) => acc + t.amount, 0))}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Dîmes, offrandes et dons</p>
        </div>

        <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sorties ce mois</span>
            <div className="p-2.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            {formatAmount(transactions.filter(t => t.type === "DEPENSE").reduce((acc, t) => acc + t.amount, 0))}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1">Dépenses de fonctionnement & travaux</p>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 mb-8 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700" />
          <input
            type="text"
            placeholder="Rechercher une transaction..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-700/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer transition-all"
            >
              <option value="ALL">Tous les Types</option>
              <option value="DIMES">Dîmes</option>
              <option value="OFFRANDES">Offrandes</option>
              <option value="DONS">Dons</option>
              <option value="DEPENSE">Dépenses</option>
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium w-full md:w-auto"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Saisir une transaction</span>
          </button>
        </div>
      </div>

      {/* Transaction list */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Wallet className="w-12 h-12 text-slate-300 mb-4" />
            <h4 className="text-base font-bold text-slate-900">Aucune transaction trouvée</h4>
            <p className="text-sm text-slate-555 mt-1">Aucun mouvement financier enregistré ne correspond à ces critères.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Titre / Donateur</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Mode de paiement</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">{tx.donor}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider ${
                        tx.type === "DIMES"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : tx.type === "DEPENSE"
                          ? "bg-red-50 text-red-750 border border-red-200"
                          : tx.type === "OFFRANDES"
                          ? "bg-secondary/10 text-secondary border border-secondary/20"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs font-semibold uppercase">{tx.paymentMethod}</td>
                    <td className="py-4 px-6 text-slate-500 text-xs">{tx.date}</td>
                    <td className={`py-4 px-6 text-right font-semibold ${
                      tx.type === "DEPENSE" ? "text-red-650" : "text-emerald-700"
                    }`}>
                      {tx.type === "DEPENSE" ? "-" : "+"}{formatAmount(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add finance */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 bg-white rounded-xl border border-slate-100 shadow-premium">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Saisir une Nouvelle Transaction</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Titre / Donateur (Nom ou Objet de dépense)</label>
                <input
                  type="text"
                  placeholder="Ex: Marc KOFFI, Achat chaises, Offrande Culte..."
                  value={donor}
                  onChange={(e) => setDonor(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Type de flux *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "DIMES" | "OFFRANDES" | "DONS" | "DEPENSE" | "AUTRE")}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="DIMES">Dîme</option>
                    <option value="OFFRANDES">Offrande</option>
                    <option value="DONS">Don / Action de grâce</option>
                    <option value="DEPENSE">Dépense (Sortie)</option>
                    <option value="AUTRE">Autre entrée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Montant (F CFA) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Mode de règlement *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as "ESPECES" | "MOBILE_MONEY" | "CHEQUE" | "VIREMENT")}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="ESPECES">Espèces</option>
                    <option value="MOBILE_MONEY">Mobile Money (Orange/MTN/Wave)</option>
                    <option value="CHEQUE">Chèque bancaire</option>
                    <option value="VIREMENT">Virement bancaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Date de l&apos;opération *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>{/* end blurred */}
      </div>{/* end relative wrapper */}
    </DashboardLayout>
  );
}
