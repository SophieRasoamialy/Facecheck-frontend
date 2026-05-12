"use client";

import { useEffect, useMemo, useState } from "react";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/solid";
import Swal from "sweetalert2";

import AjoutModal from "./modal/ajout";
import EditModal from "./modal/edit";
import { deleteMatiere, getMatieresByNiveau, getNiveaux, unwrapError } from "@/lib/api";
import type { Matiere, Niveau } from "@/lib/types";

export default function ListMatiere() {
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [selectedNiveau, setSelectedNiveau] = useState("");
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [search, setSearch] = useState("");
  const [matiereId, setMatiereId] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadNiveaux() {
      try {
        setNiveaux(await getNiveaux());
      } catch (error) {
        Swal.fire("Erreur", unwrapError(error, "Impossible de charger les niveaux"), "error");
      }
    }

    void loadNiveaux();
  }, []);

  async function loadMatieres(niveauId: string) {
    try {
      setLoading(true);
      setMatieres(await getMatieresByNiveau(niveauId));
    } catch (error) {
      Swal.fire("Erreur", unwrapError(error, "Impossible de charger les matieres"), "error");
    } finally {
      setLoading(false);
    }
  }

  const filteredMatieres = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return matieres;
    }

    return matieres.filter((matiere) =>
      `${matiere.matiere} ${matiere.nom_enseignant ?? ""} ${matiere.prenom_enseignant ?? ""}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [matieres, search]);

  async function handleDelete(id: number) {
    const result = await Swal.fire({
      title: "Supprimer cette matiere ?",
      text: "Cette action est irreversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Supprimer",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteMatiere(id);
      if (selectedNiveau) {
        await loadMatieres(selectedNiveau);
      }
      await Swal.fire("Succes", "Matiere supprimee", "success");
    } catch (error) {
      Swal.fire("Erreur", unwrapError(error, "Suppression impossible"), "error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-slate-50 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">
            Gestion
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Matieres</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedNiveau}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedNiveau(value);
              if (value) {
                void loadMatieres(value);
              } else {
                setMatieres([]);
              }
            }}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
          >
            <option value="">Choisir un niveau</option>
            {niveaux.map((niveau) => (
              <option key={niveau.id_niveau} value={niveau.id_niveau}>
                {niveau.niveau}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une matiere"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
          />
          <button
            onClick={() => setIsCreateOpen(true)}
            disabled={!selectedNiveau}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5" />
            Nouveau
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-6 py-4">Matiere</th>
              <th className="px-6 py-4">Responsable</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-500">
                  Chargement...
                </td>
              </tr>
            ) : filteredMatieres.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-500">
                  Selectionnez un niveau pour afficher les matieres.
                </td>
              </tr>
            ) : (
              filteredMatieres.map((matiere) => (
                <tr key={matiere.id_matiere} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {matiere.matiere}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {matiere.nom_enseignant} {matiere.prenom_enseignant}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setMatiereId(matiere.id_matiere);
                          setIsEditOpen(true);
                        }}
                        className="rounded-xl bg-sky-50 p-2 text-sky-700 transition hover:bg-sky-100"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => void handleDelete(matiere.id_matiere)}
                        className="rounded-xl bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AjoutModal
        isOpen={isCreateOpen}
        selectedNiveau={selectedNiveau}
        onClose={() => setIsCreateOpen(false)}
        onSaved={() => {
          if (selectedNiveau) {
            void loadMatieres(selectedNiveau);
          }
        }}
      />
      <EditModal
        isOpen={isEditOpen}
        id_matiere={matiereId}
        onClose={() => setIsEditOpen(false)}
        onSaved={() => {
          if (selectedNiveau) {
            void loadMatieres(selectedNiveau);
          }
        }}
      />
    </div>
  );
}
