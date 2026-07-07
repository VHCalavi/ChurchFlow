"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import {
  Plus,
  Search,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  X,
  Trash2,
  Pencil,
  ChevronDown,
  TrendingUp,
  Settings2,
  AlertTriangle,
} from "lucide-react";

import { 
  Transaction, 
  FinanceCategory, 
  ExpenseFamily, 
  PaymentMethod,
  FinanceDashboard,
  TransactionType
} from "@churchflow/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CategoriesGrouped {
  entrees: FinanceCategory[];
  sorties: {
    FONCTIONNEMENT: FinanceCategory[];
    INVESTISSEMENT: FinanceCategory[];
    EXCEPTIONNEL: FinanceCategory[];
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API = "/api/v1/finances";

const fmt = (n: number) => n.toLocaleString("fr-FR") + " F CFA";

const FAMILY_LABELS: Record<ExpenseFamily, string> = {
  FONCTIONNEMENT: "Fonctionnement",
  INVESTISSEMENT: "Investissement",
  EXCEPTIONNEL: "Exceptionnel",
};

const FAMILY_COLORS: Record<ExpenseFamily, string> = {
  FONCTIONNEMENT: "bg-orange-50 text-orange-700 border-orange-200",
  INVESTISSEMENT: "bg-blue-50 text-blue-700 border-blue-200",
  EXCEPTIONNEL: "bg-purple-50 text-purple-700 border-purple-200",
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  ESPECES: "Espèces",
  MOBILE_MONEY: "Mobile Money",
  CHEQUE: "Chèque",
  VIREMENT: "Virement",
};

const emptyForm = () => ({
  label: "",
  amount: "",
  type: "ENTREE" as TransactionType,
  expenseFamily: "" as ExpenseFamily | "",
  categoryId: "",
  paymentMethod: "ESPECES" as PaymentMethod,
  date: new Date().toISOString().split("T")[0],
  donorName: "",
  notes: "",
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dashboard, setDashboard] = useState<FinanceDashboard | null>(null);
  const [categories, setCategories] = useState<CategoriesGrouped | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterFamily, setFilterFamily] = useState("ALL");
  const [filterPayment, setFilterPayment] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [catPanelOpen, setCatPanelOpen] = useState(false);

  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Tooltip for the bar chart
  const [chartTooltip, setChartTooltip] = useState<{
    label: string;
    entrees: number;
    sorties: number;
    x: number;
    y: number;
  } | null>(null);

  const [newCatName, setNewCatName] = useState("");
  const [newCatFlow, setNewCatFlow] = useState<TransactionType>("SORTIE");
  const [newCatFamily, setNewCatFamily] = useState<ExpenseFamily>("FONCTIONNEMENT");

  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, dashRes, catRes] = await Promise.all([
        fetch(`${API}/transactions`),
        fetch(`${API}/dashboard`),
        fetch(`${API}/categories`),
      ]);
      if (txRes.ok) {
        const d = await txRes.json();
        setTransactions(d.data ?? []);
      }
      if (dashRes.ok) {
        const d = await dashRes.json();
        setDashboard(d.data);
      }
      if (catRes.ok) {
        const d = await catRes.json();
        setCategories(d.data);
      }
    } catch {
      // API non disponible
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const availableSubCats = (): FinanceCategory[] => {
    if (!categories) return [];
    if (form.type === "ENTREE") return categories.entrees;
    if (!form.expenseFamily) return [];
    return categories.sorties[form.expenseFamily as ExpenseFamily] ?? [];
  };

  const openCreate = () => {
    setForm(emptyForm());
    setEditingId(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (tx: Transaction) => {
    setForm({
      label: tx.label,
      amount: String(tx.amount),
      type: tx.type,
      expenseFamily: tx.expenseFamily ?? "",
      categoryId: tx.categoryId ?? "",
      paymentMethod: tx.paymentMethod,
      date: tx.date.split("T")[0],
      donorName: tx.donorName ?? "",
      notes: tx.notes ?? "",
    });
    setEditingId(tx.id);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.label.trim() || !form.amount || !form.date) {
      setFormError("Libellé, montant et date sont obligatoires.");
      return;
    }
    if (form.type === "SORTIE" && !form.expenseFamily) {
      setFormError("Veuillez sélectionner une famille de dépense.");
      return;
    }
    setSaving(true);
    const payload = {
      label: form.label.trim(),
      amount: parseFloat(form.amount),
      type: form.type,
      expenseFamily: form.expenseFamily || null,
      categoryId: form.categoryId || null,
      paymentMethod: form.paymentMethod,
      date: form.date,
      donorName: form.donorName || null,
      notes: form.notes || null,
    };
    try {
      const url = editingId
        ? `${API}/transactions/${editingId}`
        : `${API}/transactions`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(
          typeof data.error === "string"
            ? data.error
            : "Erreur lors de l'enregistrement.",
        );
        return;
      }
      setModalOpen(false);
      showToast(
        editingId ? "Transaction mise à jour" : "Transaction enregistrée",
      );
      fetchAll();
    } catch {
      setFormError("Impossible de joindre le serveur API.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`${API}/transactions/${deleteId}`, { method: "DELETE" });
      showToast("Transaction supprimée");
      setDeleteId(null);
      fetchAll();
    } catch {
      showToast("Erreur lors de la suppression", false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch(`${API}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          flowType: newCatFlow,
          family: newCatFlow === "SORTIE" ? newCatFamily : null,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        showToast(d.error ?? "Erreur", false);
        return;
      }
      showToast("Catégorie ajoutée");
      setNewCatName("");
      fetchAll();
    } catch {
      showToast("Impossible de joindre le serveur", false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`${API}/categories/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) {
        showToast(d.error ?? "Erreur", false);
        return;
      }
      showToast("Catégorie supprimée");
      fetchAll();
    } catch {
      showToast("Impossible de joindre le serveur", false);
    }
  };

  const filtered = transactions.filter((tx) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      tx.label.toLowerCase().includes(s) ||
      (tx.donorName ?? "").toLowerCase().includes(s);
    const matchType = filterType === "ALL" || tx.type === filterType;
    const matchFamily =
      filterFamily === "ALL" || tx.expenseFamily === filterFamily;
    const matchPayment =
      filterPayment === "ALL" || tx.paymentMethod === filterPayment;
    return matchSearch && matchType && matchFamily && matchPayment;
  });

  const chartMax = dashboard
    ? Math.max(
        ...dashboard.evolution6mois.flatMap((m) => [m.entrees, m.sorties]),
        1,
      )
    : 1;

  return (
    <DashboardLayout title="Gestion Financière">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-24 right-8 z-50 px-4 py-3 rounded-2xl shadow-horizon-xl text-sm font-bold ${
            toast.ok ? "bg-[#12BC7E] text-white" : "bg-[#CD3C14] text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <div className="horizon-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-muted-foreground">
              Solde Global
            </span>
            <div className="p-2.5 rounded-full bg-primary text-white">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {dashboard ? fmt(dashboard.solde) : "—"}
          </p>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Trésorerie disponible
          </p>
        </div>

        <div className="horizon-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-muted-foreground">
              Entrées / mois
            </span>
            <div className="p-2.5 rounded-full bg-primary text-white">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-primary">
            {dashboard ? fmt(dashboard.entreesThisMois) : "—"}
          </p>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Offrandes, dîmes, dons
          </p>
        </div>

        <div className="horizon-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-muted-foreground">
              Fonctionnement
            </span>
            <div className="p-2.5 rounded-full bg-[#CEAD1E] text-white">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#CEAD1E]">
            {dashboard ? fmt(dashboard.sortiesByFamily.FONCTIONNEMENT) : "—"}
          </p>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Charges courantes
          </p>
        </div>

        <div className="horizon-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-muted-foreground">
              Investissement
            </span>
            <div className="p-2.5 rounded-full bg-[#707EAE] text-white">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#707EAE]">
            {dashboard ? fmt(dashboard.sortiesByFamily.INVESTISSEMENT) : "—"}
          </p>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Équipements, sono…
          </p>
        </div>

        <div className="horizon-card p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-muted-foreground">
              Exceptionnel
            </span>
            <div className="p-2.5 rounded-full bg-[#1B2559] text-white">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-[#1B2559]">
            {dashboard ? fmt(dashboard.sortiesByFamily.EXCEPTIONNEL) : "—"}
          </p>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            CJSA, séminaires…
          </p>
        </div>
      </div>

      {/* Chart 6 mois */}
      {dashboard && (
        <div className="horizon-card mb-6 p-6">
          <h3 className="text-base font-bold text-foreground mb-4">
            Évolution mensuelle — 6 derniers mois
          </h3>
          <div className="relative flex items-end gap-3 h-32">
            {dashboard.evolution6mois.map((m) => (
              <div
                key={m.label}
                className="flex-1 flex flex-col items-center gap-1"
                onMouseLeave={() => setChartTooltip(null)}
              >
                <div className="w-full flex items-end gap-1 h-24">
                  <div
                    className="flex-1 bg-primary/80 hover:bg-primary rounded-t cursor-pointer transition-colors"
                    style={{
                      height: `${(m.entrees / chartMax) * 100}%`,
                      minHeight: m.entrees > 0 ? 4 : 0,
                    }}
                    onMouseEnter={(e) => {
                      const rect = (e.currentTarget.closest('.relative') as HTMLElement)?.getBoundingClientRect();
                      const barRect = e.currentTarget.getBoundingClientRect();
                      setChartTooltip({
                        label: m.label,
                        entrees: m.entrees,
                        sorties: m.sorties,
                        x: barRect.left - (rect?.left ?? 0) + barRect.width / 2,
                        y: barRect.top - (rect?.top ?? 0),
                      });
                    }}
                  />
                  <div
                    className="flex-1 bg-[#CD3C14]/70 hover:bg-[#CD3C14] rounded-t cursor-pointer transition-colors"
                    style={{
                      height: `${(m.sorties / chartMax) * 100}%`,
                      minHeight: m.sorties > 0 ? 4 : 0,
                    }}
                    onMouseEnter={(e) => {
                      const rect = (e.currentTarget.closest('.relative') as HTMLElement)?.getBoundingClientRect();
                      const barRect = e.currentTarget.getBoundingClientRect();
                      setChartTooltip({
                        label: m.label,
                        entrees: m.entrees,
                        sorties: m.sorties,
                        x: barRect.left - (rect?.left ?? 0) + barRect.width / 2,
                        y: barRect.top - (rect?.top ?? 0),
                      });
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground capitalize">
                  {m.label}
                </span>
              </div>
            ))}

            {/* Tooltip */}
            {chartTooltip && (
              <div
                className="pointer-events-none absolute z-20 min-w-[160px] rounded-xl bg-[#1B2559] text-white text-xs shadow-xl px-3 py-2.5 -translate-x-1/2 -translate-y-full"
                style={{ left: chartTooltip.x, top: chartTooltip.y - 8 }}
              >
                <p className="font-bold text-sm capitalize mb-1.5 border-b border-white/20 pb-1">{chartTooltip.label}</p>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary/80 inline-block" />
                  <span className="text-white/80">Entrées :</span>
                  <span className="font-bold ml-auto">{fmt(chartTooltip.entrees)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#CD3C14]/80 inline-block" />
                  <span className="text-white/80">Sorties :</span>
                  <span className="font-bold ml-auto">{fmt(chartTooltip.sorties)}</span>
                </div>
                <div className="mt-1.5 pt-1.5 border-t border-white/20 flex items-center justify-between">
                  <span className="text-white/60">Solde</span>
                  <span className={`font-bold ${chartTooltip.entrees - chartTooltip.sorties >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {chartTooltip.entrees - chartTooltip.sorties >= 0 ? '+' : ''}{fmt(chartTooltip.entrees - chartTooltip.sorties)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="w-3 h-3 rounded-sm bg-primary/80 inline-block" />{" "}
              Entrées
            </span>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="w-3 h-3 rounded-sm bg-[#CD3C14]/70 inline-block" />{" "}
              Sorties
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-4 p-4 mb-5 rounded-xl border border-border bg-card shadow-sm">
        {/* Top bar: Search & Main Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un libellé, donateur…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
            />
          </div>
          <button
            onClick={openCreate}
            className="w-full sm:w-auto btn-horizon btn-horizon-primary shrink-0"
          >
            <Plus className="w-4 h-4" /> Saisir
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full border-t border-border/50 pt-4">
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <span className="text-sm font-medium text-muted-foreground hidden sm:block">Filtres :</span>
          </div>
          
          <div className="grid grid-cols-2 lg:flex items-center gap-2 w-full">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full lg:w-auto px-4 py-2.5 text-sm font-semibold rounded-lg border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all"
            >
              <option value="ALL">Tous les flux</option>
              <option value="ENTREE">Entrées</option>
              <option value="SORTIE">Sorties</option>
            </select>

            <select
              value={filterFamily}
              onChange={(e) => setFilterFamily(e.target.value)}
              className="w-full lg:w-auto px-4 py-2.5 text-sm font-semibold rounded-lg border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all"
            >
              <option value="ALL">Toutes familles</option>
              <option value="FONCTIONNEMENT">Fonctionnement</option>
              <option value="INVESTISSEMENT">Investissement</option>
              <option value="EXCEPTIONNEL">Exceptionnel</option>
            </select>

            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full lg:w-auto px-4 py-2.5 text-sm font-semibold rounded-lg border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all col-span-2 lg:col-span-1"
            >
              <option value="ALL">Tous modes</option>
              <option value="ESPECES">Espèces</option>
              <option value="MOBILE_MONEY">Mobile Money</option>
              <option value="CHEQUE">Chèque</option>
              <option value="VIREMENT">Virement</option>
            </select>

            <div className="lg:ml-auto w-full lg:w-auto col-span-2 lg:col-span-1 mt-1 lg:mt-0">
               <button
                  onClick={() => setCatPanelOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg border border-border bg-white text-[#1B2559] hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Settings2 className="w-3.5 h-3.5" /> Gérer les Catégories
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Wallet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-bold text-muted-foreground">
              Aucune transaction trouvée
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-sm font-medium">
                  <th className="py-4 px-6">Libellé</th>
                  <th className="py-4 px-6">Catégorie</th>
                  <th className="py-4 px-6">Mode</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-right">Montant</th>
                  <th className="py-4 px-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-background/60 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="font-bold text-foreground">{tx.label}</p>
                      {tx.donorName && (
                        <p className="text-sm font-medium text-muted-foreground">
                          {tx.donorName}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        {tx.expenseFamily ? (
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold border ${FAMILY_COLORS[tx.expenseFamily]}`}
                          >
                            {FAMILY_LABELS[tx.expenseFamily]}
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">
                            Entrée
                          </span>
                        )}
                        {tx.category && (
                          <span className="text-sm font-medium text-muted-foreground">
                            {tx.category.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-muted-foreground">
                      {PAYMENT_LABELS[tx.paymentMethod]}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td
                      className={`py-4 px-6 text-right font-bold ${
                        tx.type === "ENTREE" ? "text-emerald-700" : "text-[#CD3C14]"
                      }`}
                    >
                      {tx.type === "ENTREE" ? "+" : "-"}
                      {fmt(tx.amount)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => openEdit(tx)}
                          className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(tx.id)}
                          className="p-1.5 rounded-lg hover:bg-[#CD3C14]/10 text-muted-foreground hover:text-[#CD3C14] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Transaction */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 bg-card rounded-[20px] shadow-horizon-xl">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">
                {editingId ? "Modifier la transaction" : "Nouvelle transaction"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Libellé */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Libellé *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Offrande culte du dimanche, Facture électricité…"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                  required
                />
              </div>

              {/* Flux toggle */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Type de flux *
                </label>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {(["ENTREE", "SORTIE"] as TransactionType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          type: t,
                          expenseFamily: "",
                          categoryId: "",
                        })
                      }
                      className={`flex-1 py-3 text-sm font-bold transition-colors ${
                        form.type === t
                          ? t === "ENTREE"
                            ? "bg-primary text-white"
                            : "bg-[#CD3C14] text-white"
                          : "bg-background text-muted-foreground hover:bg-background/60"
                      }`}
                    >
                      {t === "ENTREE" ? "↑ Entrée" : "↓ Sortie"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Famille (sorties) */}
              {form.type === "SORTIE" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Famille de dépense *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        "FONCTIONNEMENT",
                        "INVESTISSEMENT",
                        "EXCEPTIONNEL",
                      ] as ExpenseFamily[]
                    ).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, expenseFamily: f, categoryId: "" })
                        }
                        className={`py-3 px-3 text-sm font-bold rounded-lg border transition-colors ${
                          form.expenseFamily === f
                            ? FAMILY_COLORS[f]
                            : "bg-background border-border text-muted-foreground hover:bg-background/60"
                        }`}
                      >
                        {FAMILY_LABELS[f]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sous-catégorie */}
              {(form.type === "ENTREE" || form.expenseFamily) && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Sous-catégorie
                  </label>
                  <div className="relative">
                    <select
                      value={form.categoryId}
                      onChange={(e) =>
                        setForm({ ...form, categoryId: e.target.value })
                      }
                      className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/25 appearance-none cursor-pointer transition-all"
                    >
                      <option value="">— Sélectionner —</option>
                      {availableSubCats().map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Montant + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Montant (F CFA) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                  />
                </div>
              </div>

              {/* Mode paiement */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Mode de règlement *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      "ESPECES",
                      "MOBILE_MONEY",
                      "CHEQUE",
                      "VIREMENT",
                    ] as PaymentMethod[]
                  ).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm({ ...form, paymentMethod: m })}
                      className={`py-3 text-sm font-semibold rounded-full border transition-colors ${
                        form.paymentMethod === m
                          ? "bg-primary text-white border-primary"
                          : "bg-background border-border text-muted-foreground hover:bg-background/60"
                      }`}
                    >
                      {PAYMENT_LABELS[m]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Donateur */}
              {form.type === "ENTREE" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Donateur (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Nom du donateur ou anonyme"
                    value={form.donorName}
                    onChange={(e) =>
                      setForm({ ...form, donorName: e.target.value })
                    }
                    className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-5 py-3 text-sm font-semibold rounded-2xl border-none bg-[#F4F7FE] text-[#1B2559] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all resize-none"
                  placeholder="Observations complémentaires…"
                />
              </div>

              {formError && (
                <p className="text-sm font-semibold text-[#CD3C14] bg-[#CD3C14]/10 px-3 py-2 rounded-lg border border-[#CD3C14]/20">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-horizon btn-horizon-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-horizon btn-horizon-primary disabled:opacity-60"
                >
                  {saving
                    ? "Enregistrement…"
                    : editingId
                      ? "Mettre à jour"
                      : "Valider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm suppression */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm mx-4 bg-card rounded-[20px] shadow-horizon-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#CD3C14]/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-[#CD3C14]" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">
              Supprimer cette transaction ?
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-5 py-2.5 text-sm font-semibold rounded-full border border-border bg-background hover:bg-background/90 text-foreground transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-5 py-2.5 text-sm font-bold rounded-full bg-[#CD3C14] hover:bg-[#CD3C14]/90 text-white transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel Catégories */}
      {catPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-card shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-base font-bold text-foreground">
                Gérer les catégories
              </h3>
              <button
                onClick={() => setCatPanelOpen(false)}
                className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Ajouter */}
              <form
                onSubmit={handleAddCategory}
                className="p-4 rounded-xl bg-background border border-border space-y-3"
              >
                <p className="text-sm font-bold text-foreground">
                  Nouvelle catégorie
                </p>
                <input
                  type="text"
                  placeholder="Nom de la catégorie"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] placeholder-[#A3AED0] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                  required
                />
                <div className="flex gap-2">
                  <select
                    value={newCatFlow}
                    onChange={(e) => setNewCatFlow(e.target.value as TransactionType)}
                    className="flex-1 px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all"
                  >
                    <option value="ENTREE">Entrée</option>
                    <option value="SORTIE">Sortie</option>
                  </select>
                  {newCatFlow === "SORTIE" && (
                    <select
                      value={newCatFamily}
                      onChange={(e) =>
                        setNewCatFamily(e.target.value as ExpenseFamily)
                      }
                      className="flex-1 px-5 py-3 text-sm font-semibold rounded-full border-none bg-[#F4F7FE] text-[#1B2559] focus:outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer transition-all"
                    >
                      <option value="FONCTIONNEMENT">Fonctionnement</option>
                      <option value="INVESTISSEMENT">Investissement</option>
                      <option value="EXCEPTIONNEL">Exceptionnel</option>
                    </select>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-3 text-sm font-bold rounded-full bg-primary hover:bg-primary/90 text-white transition-all"
                >
                  Ajouter
                </button>
              </form>

              {/* Liste existante */}
              {categories && (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-2">
                      Entrées
                    </p>
                    <div className="space-y-1">
                      {categories.entrees.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-background transition-colors"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {c.name}
                          </span>
                          {!c.isDefault && (
                            <button
                              onClick={() => handleDeleteCategory(c.id)}
                              className="p-1 rounded hover:bg-[#CD3C14]/10 text-muted-foreground hover:text-[#CD3C14] transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {(
                    [
                      "FONCTIONNEMENT",
                      "INVESTISSEMENT",
                      "EXCEPTIONNEL",
                    ] as ExpenseFamily[]
                  ).map((fam) => (
                    <div key={fam}>
                      <p
                        className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit border ${FAMILY_COLORS[fam]}`}
                      >
                        {FAMILY_LABELS[fam]}
                      </p>
                      <div className="space-y-1">
                        {categories.sorties[fam].map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-background transition-colors"
                          >
                            <span className="text-sm font-medium text-foreground">
                              {c.name}
                            </span>
                            {!c.isDefault && (
                              <button
                                onClick={() => handleDeleteCategory(c.id)}
                                className="p-1 rounded hover:bg-[#CD3C14]/10 text-muted-foreground hover:text-[#CD3C14] transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}