"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import {
  Plus, Search, Wallet, ArrowUpRight, ArrowDownRight,
  SlidersHorizontal, X, Trash2, Pencil, ChevronDown,
  TrendingUp, Settings2, AlertTriangle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type FlowType = "ENTREE" | "SORTIE";
type ExpenseFamily = "FONCTIONNEMENT" | "INVESTISSEMENT" | "EXCEPTIONNEL";
type PaymentMethod = "ESPECES" | "MOBILE_MONEY" | "CHEQUE" | "VIREMENT";

interface FinanceCategory {
  id: string;
  name: string;
  flowType: FlowType;
  family: ExpenseFamily | null;
  color: string | null;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  label: string;
  amount: number;
  type: FlowType;
  expenseFamily: ExpenseFamily | null;
  paymentMethod: PaymentMethod;
  date: string;
  donorName: string | null;
  reference: string | null;
  notes: string | null;
  category: FinanceCategory | null;
  categoryId: string | null;
}

interface DashboardData {
  solde: number;
  totalEntrees: number;
  totalSorties: number;
  entreesThisMois: number;
  sortiesByFamily: Record<ExpenseFamily, number>;
  evolution6mois: { label: string; entrees: number; sorties: number }[];
}

interface CategoriesGrouped {
  entrees: FinanceCategory[];
  sorties: {
    FONCTIONNEMENT: FinanceCategory[];
    INVESTISSEMENT: FinanceCategory[];
    EXCEPTIONNEL: FinanceCategory[];
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API = "http://localhost:3000/api/v1/finances";

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
  type: "ENTREE" as FlowType,
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
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
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

  const [newCatName, setNewCatName] = useState("");
  const [newCatFlow, setNewCatFlow] = useState<FlowType>("SORTIE");
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
      if (txRes.ok) { const d = await txRes.json(); setTransactions(d.data ?? []); }
      if (dashRes.ok) { const d = await dashRes.json(); setDashboard(d.data); }
      if (catRes.ok) { const d = await catRes.json(); setCategories(d.data); }
    } catch {
      // API non disponible
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

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
      const url = editingId ? `${API}/transactions/${editingId}` : `${API}/transactions`;
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(typeof data.error === "string" ? data.error : "Erreur lors de l'enregistrement.");
        return;
      }
      setModalOpen(false);
      showToast(editingId ? "Transaction mise à jour" : "Transaction enregistrée");
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
      if (!res.ok) { showToast(d.error ?? "Erreur", false); return; }
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
      if (!res.ok) { showToast(d.error ?? "Erreur", false); return; }
      showToast("Catégorie supprimée");
      fetchAll();
    } catch {
      showToast("Impossible de joindre le serveur", false);
    }
  };

  const filtered = transactions.filter((tx) => {
    const s = search.toLowerCase();
    const matchSearch = !s || tx.label.toLowerCase().includes(s) || (tx.donorName ?? "").toLowerCase().includes(s);
    const matchType = filterType === "ALL" || tx.type === filterType;
    const matchFamily = filterFamily === "ALL" || tx.expenseFamily === filterFamily;
    const matchPayment = filterPayment === "ALL" || tx.paymentMethod === filterPayment;
    return matchSearch && matchType && matchFamily && matchPayment;
  });

  const chartMax = dashboard
    ? Math.max(...dashboard.evolution6mois.flatMap((m) => [m.entrees, m.sorties]), 1)
    : 1;

  return (
    <DashboardLayout title="Gestion Financière">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-24 right-8 z-50 px-4 py-3 rounded-xl border shadow-lg text-sm font-semibold ${
          toast.ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <div className="col-span-1 sm:col-span-2 xl:col-span-1 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Solde Global</span>
            <div className="p-2 rounded-lg bg-[#006C69]/10 text-[#006C69]"><Wallet className="w-4 h-4" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{dashboard ? fmt(dashboard.solde) : "—"}</p>
          <p className="text-xs text-slate-500 mt-1">Trésorerie disponible</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Entrées / mois</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><ArrowUpRight className="w-4 h-4" /></div>
          </div>
          <p className="text-xl font-bold text-emerald-700">{dashboard ? fmt(dashboard.entreesThisMois) : "—"}</p>
          <p className="text-xs text-slate-500 mt-1">Offrandes, dîmes, dons</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fonctionnement</span>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600"><ArrowDownRight className="w-4 h-4" /></div>
          </div>
          <p className="text-xl font-bold text-orange-700">{dashboard ? fmt(dashboard.sortiesByFamily.FONCTIONNEMENT) : "—"}</p>
          <p className="text-xs text-slate-500 mt-1">Charges courantes</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Investissement</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <p className="text-xl font-bold text-blue-700">{dashboard ? fmt(dashboard.sortiesByFamily.INVESTISSEMENT) : "—"}</p>
          <p className="text-xs text-slate-500 mt-1">Équipements, sono…</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Exceptionnel</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600"><AlertTriangle className="w-4 h-4" /></div>
          </div>
          <p className="text-xl font-bold text-purple-700">{dashboard ? fmt(dashboard.sortiesByFamily.EXCEPTIONNEL) : "—"}</p>
          <p className="text-xs text-slate-500 mt-1">CJSA, séminaires…</p>
        </div>
      </div>

      {/* Chart 6 mois */}
      {dashboard && (
        <div className="mb-6 p-5 rounded-2xl border border-slate-100 bg-white shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Évolution mensuelle — 6 derniers mois</h3>
          <div className="flex items-end gap-3 h-32">
            {dashboard.evolution6mois.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-1 h-24">
                  <div
                    className="flex-1 bg-emerald-400/80 rounded-t"
                    style={{ height: `${(m.entrees / chartMax) * 100}%`, minHeight: m.entrees > 0 ? 4 : 0 }}
                    title={`Entrées: ${fmt(m.entrees)}`}
                  />
                  <div
                    className="flex-1 bg-red-400/70 rounded-t"
                    style={{ height: `${(m.sorties / chartMax) * 100}%`, minHeight: m.sorties > 0 ? 4 : 0 }}
                    title={`Sorties: ${fmt(m.sorties)}`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-medium capitalize">{m.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-emerald-400/80 inline-block" /> Entrées
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-3 h-3 rounded-sm bg-red-400/70 inline-block" /> Sorties
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 mb-5 rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un libellé, donateur…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#006C69] focus:border-[#006C69]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="pl-8 pr-3 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#006C69]">
              <option value="ALL">Tous les flux</option>
              <option value="ENTREE">Entrées</option>
              <option value="SORTIE">Sorties</option>
            </select>
          </div>
          <select value={filterFamily} onChange={(e) => setFilterFamily(e.target.value)}
            className="px-3 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#006C69]">
            <option value="ALL">Toutes familles</option>
            <option value="FONCTIONNEMENT">Fonctionnement</option>
            <option value="INVESTISSEMENT">Investissement</option>
            <option value="EXCEPTIONNEL">Exceptionnel</option>
          </select>
          <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}
            className="px-3 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#006C69]">
            <option value="ALL">Tous modes</option>
            <option value="ESPECES">Espèces</option>
            <option value="MOBILE_MONEY">Mobile Money</option>
            <option value="CHEQUE">Chèque</option>
            <option value="VIREMENT">Virement</option>
          </select>
          <button onClick={() => setCatPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors">
            <Settings2 className="w-3.5 h-3.5" /> Catégories
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-[#006C69] hover:bg-[#006C69]/90 rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Saisir
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Wallet className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-500">Aucune transaction trouvée</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-5">Libellé</th>
                  <th className="py-3 px-5">Catégorie</th>
                  <th className="py-3 px-5">Mode</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5 text-right">Montant</th>
                  <th className="py-3 px-5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-semibold text-slate-900">{tx.label}</p>
                      {tx.donorName && <p className="text-[11px] text-slate-400">{tx.donorName}</p>}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col gap-1">
                        {tx.expenseFamily ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border w-fit ${FAMILY_COLORS[tx.expenseFamily]}`}>
                            {FAMILY_LABELS[tx.expenseFamily]}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 w-fit">
                            Entrée
                          </span>
                        )}
                        {tx.category && <span className="text-[11px] text-slate-500">{tx.category.name}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500 font-medium">{PAYMENT_LABELS[tx.paymentMethod]}</td>
                    <td className="py-3.5 px-5 text-xs text-slate-500">{new Date(tx.date).toLocaleDateString("fr-FR")}</td>
                    <td className={`py-3.5 px-5 text-right font-bold ${tx.type === "ENTREE" ? "text-emerald-700" : "text-red-600"}`}>
                      {tx.type === "ENTREE" ? "+" : "-"}{fmt(tx.amount)}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => openEdit(tx)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteId(tx.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 bg-white rounded-2xl border border-slate-100 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? "Modifier la transaction" : "Nouvelle transaction"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Libellé */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Libellé *</label>
                <input
                  type="text"
                  placeholder="Ex: Offrande culte du dimanche, Facture électricité…"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006C69] focus:border-[#006C69]"
                  required
                />
              </div>

              {/* Flux toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Type de flux *</label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                  {(["ENTREE", "SORTIE"] as FlowType[]).map((t) => (
                    <button key={t} type="button"
                      onClick={() => setForm({ ...form, type: t, expenseFamily: "", categoryId: "" })}
                      className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
                        form.type === t
                          ? t === "ENTREE" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                          : "bg-white text-slate-500 hover:bg-slate-50"
                      }`}>
                      {t === "ENTREE" ? "↑ Entrée" : "↓ Sortie"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Famille (sorties) */}
              {form.type === "SORTIE" && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Famille de dépense *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["FONCTIONNEMENT", "INVESTISSEMENT", "EXCEPTIONNEL"] as ExpenseFamily[]).map((f) => (
                      <button key={f} type="button"
                        onClick={() => setForm({ ...form, expenseFamily: f, categoryId: "" })}
                        className={`py-2 px-2 text-[11px] font-bold rounded-lg border transition-colors ${
                          form.expenseFamily === f
                            ? FAMILY_COLORS[f]
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}>
                        {FAMILY_LABELS[f]}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sous-catégorie */}
              {(form.type === "ENTREE" || form.expenseFamily) && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Sous-catégorie</label>
                  <div className="relative">
                    <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006C69] appearance-none cursor-pointer">
                      <option value="">— Sélectionner —</option>
                      {availableSubCats().map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Montant + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Montant (F CFA) *</label>
                  <input type="number" min={1} required value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006C69]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Date *</label>
                  <input type="date" required value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006C69]" />
                </div>
              </div>

              {/* Mode paiement */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Mode de règlement *</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["ESPECES", "MOBILE_MONEY", "CHEQUE", "VIREMENT"] as PaymentMethod[]).map((m) => (
                    <button key={m} type="button" onClick={() => setForm({ ...form, paymentMethod: m })}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        form.paymentMethod === m
                          ? "bg-[#006C69] text-white border-[#006C69]"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}>
                      {PAYMENT_LABELS[m]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Donateur */}
              {form.type === "ENTREE" && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Donateur (optionnel)</label>
                  <input type="text" placeholder="Nom du donateur ou anonyme" value={form.donorName}
                    onChange={(e) => setForm({ ...form, donorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006C69]" />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#006C69] resize-none"
                  placeholder="Observations complémentaires…" />
              </div>

              {formError && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#006C69] hover:bg-[#006C69]/90 rounded-lg transition-colors disabled:opacity-60">
                  {saving ? "Enregistrement…" : editingId ? "Mettre à jour" : "Valider"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm suppression */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 bg-white rounded-2xl border border-slate-100 shadow-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Supprimer cette transaction ?</h3>
            <p className="text-sm text-slate-500 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700">
                Annuler
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel Catégories */}
      {catPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Gérer les catégories</h3>
              <button onClick={() => setCatPanelOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Ajouter */}
              <form onSubmit={handleAddCategory} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nouvelle catégorie</p>
                <input type="text" placeholder="Nom de la catégorie" value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#006C69]" required />
                <div className="flex gap-2">
                  <select value={newCatFlow} onChange={(e) => setNewCatFlow(e.target.value as FlowType)}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#006C69] cursor-pointer">
                    <option value="ENTREE">Entrée</option>
                    <option value="SORTIE">Sortie</option>
                  </select>
                  {newCatFlow === "SORTIE" && (
                    <select value={newCatFamily} onChange={(e) => setNewCatFamily(e.target.value as ExpenseFamily)}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#006C69] cursor-pointer">
                      <option value="FONCTIONNEMENT">Fonctionnement</option>
                      <option value="INVESTISSEMENT">Investissement</option>
                      <option value="EXCEPTIONNEL">Exceptionnel</option>
                    </select>
                  )}
                </div>
                <button type="submit"
                  className="w-full py-2 text-sm font-bold rounded-lg bg-[#006C69] text-white hover:bg-[#006C69]/90 transition-colors">
                  Ajouter
                </button>
              </form>

              {/* Liste existante */}
              {categories && (
                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Entrées</p>
                    <div className="space-y-1">
                      {categories.entrees.map((c) => (
                        <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                          <span className="text-sm text-slate-700">{c.name}</span>
                          {!c.isDefault && (
                            <button onClick={() => handleDeleteCategory(c.id)}
                              className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {(["FONCTIONNEMENT", "INVESTISSEMENT", "EXCEPTIONNEL"] as ExpenseFamily[]).map((fam) => (
                    <div key={fam}>
                      <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 px-2 py-0.5 rounded w-fit border ${FAMILY_COLORS[fam]}`}>
                        {FAMILY_LABELS[fam]}
                      </p>
                      <div className="space-y-1">
                        {categories.sorties[fam].map((c) => (
                          <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                            <span className="text-sm text-slate-700">{c.name}</span>
                            {!c.isDefault && (
                              <button onClick={() => handleDeleteCategory(c.id)}
                                className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
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
