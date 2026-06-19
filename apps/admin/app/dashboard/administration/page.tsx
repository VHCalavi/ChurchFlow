"use client";

import React, { useState } from "react";
import { DashboardLayout } from "../../../components/layout/dashboard-layout";
import { Plus, Search, Package, Users, X, Construction } from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: "EXCELLENT" | "BON" | "MAUVAIS" | "EN_PANNE";
  value: string;
}

interface Provider {
  id: string;
  name: string;
  service: string;
  phone: string;
  status: "ACTIF" | "INACTIF";
}

export default function AdministrationPage() {
  const [activeTab, setActiveTab] = useState<"EQUIPMENT" | "PROVIDERS">(
    "EQUIPMENT",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Equipment Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState("SONORISATION");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<
    "EXCELLENT" | "BON" | "MAUVAIS" | "EN_PANNE"
  >("EXCELLENT");
  const [value, setValue] = useState("");

  // Provider Form states
  const [providerName, setProviderName] = useState("");
  const [service, setService] = useState("");
  const [phone, setPhone] = useState("");

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([
    {
      id: "e1",
      name: "Console de mixage Behringer X32",
      category: "SONORISATION",
      quantity: 1,
      status: "EXCELLENT",
      value: "1 850 000 F",
    },
    {
      id: "e2",
      name: "Microphone HF Shure SM58",
      category: "SONORISATION",
      quantity: 4,
      status: "BON",
      value: "650 000 F",
    },
    {
      id: "e3",
      name: "Vidéoprojecteur Epson 4K",
      category: "MULTIMEDIA",
      quantity: 2,
      status: "BON",
      value: "1 200 000 F",
    },
    {
      id: "e4",
      name: "Chaises rembourrées VIP",
      category: "MOBILIER",
      quantity: 150,
      status: "EXCELLENT",
      value: "3 750 000 F",
    },
    {
      id: "e5",
      name: "Climatiseur Split LG 2CV",
      category: "ELECTRICITE",
      quantity: 6,
      status: "EN_PANNE",
      value: "1 500 000 F",
    },
  ]);

  const [providerList, setProviderList] = useState<Provider[]>([
    {
      id: "p1",
      name: "Cotonou Sound & Light",
      service: "Maintenance Sonorisation",
      phone: "+229 97 11 22 33",
      status: "ACTIF",
    },
    {
      id: "p2",
      name: "Clean Space SARL",
      service: "Entretien & Nettoyage",
      phone: "+229 95 44 55 66",
      status: "ACTIF",
    },
    {
      id: "p3",
      name: "Electro Clime Service",
      service: "Réparation Climatisation",
      phone: "+229 61 77 88 99",
      status: "INACTIF",
    },
  ]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) {
      showNotification("Le nom et la valeur estimée sont requis", "error");
      return;
    }

    const newItem: Equipment = {
      id: String(Date.now()),
      name,
      category,
      quantity,
      status,
      value,
    };

    setEquipmentList((prev) => [newItem, ...prev]);
    showNotification("Équipement ajouté au patrimoine !", "success");
    setName("");
    setCategory("SONORISATION");
    setQuantity(1);
    setStatus("EXCELLENT");
    setValue("");
    setIsModalOpen(false);
  };

  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName || !service || !phone) {
      showNotification("Tous les champs sont requis", "error");
      return;
    }

    const newItem: Provider = {
      id: String(Date.now()),
      name: providerName,
      service,
      phone,
      status: "ACTIF",
    };

    setProviderList((prev) => [newItem, ...prev]);
    showNotification("Prestataire enregistré avec succès !", "success");
    setProviderName("");
    setService("");
    setPhone("");
    setIsModalOpen(false);
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "EXCELLENT":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "BON":
        return "bg-primary/5 text-primary border border-primary/20";
      case "MAUVAIS":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "EN_PANNE":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-slate-50 text-slate-800 border border-slate-200";
    }
  };

  return (
    <DashboardLayout title="Administration Matérielle & Prestataires">
      {/* Under Construction Overlay */}
      <div className="relative w-full min-h-[600px] rounded-xl overflow-hidden">
        <div className="absolute inset-0 z-20 flex pt-48 justify-center p-6 bg-slate-900/5 backdrop-blur-[2px]">
          <div className="max-w-md h-min w-full p-8 rounded-2xl border border-slate-150 bg-white/95 shadow-premium text-center flex flex-col items-center transition-all duration-300 hover:scale-[1.01]">
            <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] mb-6 animate-pulse">
              <Construction className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2.5">
              Module en Construction
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Le module Administration est en cours de développement. Il
              regroupera la gestion du patrimoine matériel et des prestataires
              de la communauté.
            </p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#F59E0B] to-[#006C69] h-1.5 rounded-full"
                style={{ width: "25%" }}
              />
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              25% — En cours
            </span>
          </div>
        </div>

        {/* Blurred background content */}
        <div className="blur-[5px] opacity-50 pointer-events-none select-none">
          {/* Notifications */}
          {notification && (
            <div
              className={`fixed top-24 right-8 z-50 flex items-center px-4 py-3 rounded-xl border shadow-premium animate-fade-in ${
                notification.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <span className="text-sm font-semibold">
                {notification.message}
              </span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-slate-100 mb-8 space-x-6 text-sm font-bold">
            <button
              onClick={() => {
                setActiveTab("EQUIPMENT");
                setSearchTerm("");
              }}
              className={`pb-4 transition-all ${
                activeTab === "EQUIPMENT"
                  ? "text-primary border-b-2 border-primary font-bold"
                  : "text-slate-500 hover:text-primary transition-colors"
              }`}
            >
              Patrimoine & Équipements
            </button>
            <button
              onClick={() => {
                setActiveTab("PROVIDERS");
                setSearchTerm("");
              }}
              className={`pb-4 transition-all ${
                activeTab === "PROVIDERS"
                  ? "text-primary border-b-2 border-primary font-bold"
                  : "text-slate-500 hover:text-primary transition-colors"
              }`}
            >
              Prestataires & Maintenance
            </button>
          </div>

          {/* Control bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 mb-8 rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-700" />
              <input
                type="text"
                placeholder={
                  activeTab === "EQUIPMENT"
                    ? "Rechercher un équipement, matériel..."
                    : "Rechercher un prestataire, service..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-700/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-premium w-full md:w-auto"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>
                {activeTab === "EQUIPMENT"
                  ? "Ajouter un équipement"
                  : "Ajouter un prestataire"}
              </span>
            </button>
          </div>

          {/* Main lists */}
          {activeTab === "EQUIPMENT" ? (
            <div className="rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 text-sm font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Nom de l&apos;Équipement</th>
                      <th className="py-4 px-6">Catégorie</th>
                      <th className="py-4 px-6">Quantité</th>
                      <th className="py-4 px-6">État</th>
                      <th className="py-4 px-6">Valeur Estimée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    {equipmentList
                      .filter((e) =>
                        e.name.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/30 transition-colors"
                        >
                          <td className="py-4 px-6 font-semibold text-slate-900 flex items-center space-x-3.5">
                            <Package className="w-5 h-5 text-slate-400" />
                            <span>{item.name}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-500 text-sm font-semibold uppercase">
                            {item.category}
                          </td>
                          <td className="py-4 px-6 text-slate-800 font-semibold">
                            {item.quantity}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold tracking-wider ${getStatusColor(item.status)}`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-primary font-semibold">
                            {item.value}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-100 bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-600 text-sm font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Nom du Prestataire</th>
                      <th className="py-4 px-6">Service Fourni</th>
                      <th className="py-4 px-6">Téléphone</th>
                      <th className="py-4 px-6">Statut Contrat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    {providerList
                      .filter((p) =>
                        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((provider) => (
                        <tr
                          key={provider.id}
                          className="hover:bg-slate-50/30 transition-colors"
                        >
                          <td className="py-4 px-6 font-semibold text-slate-900 flex items-center space-x-3.5">
                            <Users className="w-5 h-5 text-slate-400" />
                            <span>{provider.name}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-800 font-semibold">
                            {provider.service}
                          </td>
                          <td className="py-4 px-6 text-slate-500 text-sm font-semibold">
                            {provider.phone}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold tracking-wider ${
                                provider.status === "ACTIF"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {provider.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modals Add */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
              <div className="w-full max-w-lg p-6 bg-white rounded-xl border border-slate-100 shadow-premium">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">
                    {activeTab === "EQUIPMENT"
                      ? "Ajouter un Équipement"
                      : "Ajouter un Prestataire"}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {activeTab === "EQUIPMENT" ? (
                  <form onSubmit={handleAddEquipment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                        Nom de l&apos;Équipement *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Console, Chaises, Projecteur..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                          Catégorie *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                        >
                          <option value="SONORISATION">Sonorisation</option>
                          <option value="MULTIMEDIA">Multimédia</option>
                          <option value="MOBILIER">Mobilier</option>
                          <option value="ELECTRICITE">
                            Électricité & Froid
                          </option>
                          <option value="AUTRE">Autre</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                          Quantité *
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                          État Général *
                        </label>
                        <select
                          value={status}
                          onChange={(e) =>
                            setStatus(
                              e.target.value as
                                | "EXCELLENT"
                                | "BON"
                                | "MAUVAIS"
                                | "EN_PANNE",
                            )
                          }
                          className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                        >
                          <option value="EXCELLENT">Excellent</option>
                          <option value="BON">Bon état</option>
                          <option value="MAUVAIS">Mauvais état</option>
                          <option value="EN_PANNE">En panne</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                          Valeur estimée *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: 500 000 F..."
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
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
                        Enregistrer
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleAddProvider} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                        Nom de l&apos;Entreprise prestataire *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nom du prestataire..."
                        value={providerName}
                        onChange={(e) => setProviderName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                        Service fourni *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Maintenance électricité, Nettoyage..."
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+229 ..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      />
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
                        Enregistrer
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
        {/* end blurred */}
      </div>
      {/* end relative wrapper */}
    </DashboardLayout>
  );
}
