"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import Swal from "sweetalert2";

import AjoutModal from "./modal/ajout";
import EditModal from "./modal/edit";
import {
  deleteEnseignant,
  getEnseignantsPage,
  unwrapError,
} from "@/lib/api";
import type { Enseignant, TeacherPagination } from "@/lib/types";

const PAGE_SIZE = 10;

const emptyPagination: TeacherPagination = {
  page: 1,
  limit: PAGE_SIZE,
  totalItems: 0,
  totalPages: 1,
};

export default function ListProf() {
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [pagination, setPagination] = useState<TeacherPagination>(emptyPagination);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [enseignantId, setEnseignantId] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadPage(page: number) {
    try {
      setLoading(true);
      const data = await getEnseignantsPage(page, PAGE_SIZE);
      setEnseignants(data.items);
      setPagination(data.pagination);
      setCurrentPage(data.pagination.page);
    } catch (error) {
      Swal.fire("Erreur", unwrapError(error, "Impossible de charger les enseignants"), "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPage(1);
  }, []);

  const filteredEnseignants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return enseignants;
    }

    return enseignants.filter((enseignant) =>
      `${enseignant.nom_enseignant} ${enseignant.prenom_enseignant} ${enseignant.matieres ?? enseignant.matiere ?? ""}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [enseignants, search]);

  async function handleDelete(id: number) {
    const result = await Swal.fire({
      title: "Supprimer cet enseignant ?",
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
      await deleteEnseignant(id);
      await loadPage(currentPage);
      await Swal.fire("Succes", "Enseignant supprime", "success");
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
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Enseignants</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un enseignant"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500"
          />
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
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
              <th className="px-6 py-4">Nom complet</th>
              <th className="px-6 py-4">Matieres</th>
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
            ) : filteredEnseignants.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-sm text-slate-500">
                  Aucun enseignant trouve.
                </td>
              </tr>
            ) : (
              filteredEnseignants.map((enseignant) => (
                <tr key={enseignant.id_enseignant} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {enseignant.nom_enseignant} {enseignant.prenom_enseignant}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {enseignant.matieres || enseignant.matiere || "Aucune matiere"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEnseignantId(enseignant.id_enseignant);
                          setIsEditOpen(true);
                        }}
                        className="rounded-xl bg-sky-50 p-2 text-sky-700 transition hover:bg-sky-100"
                        aria-label="Modifier"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => void handleDelete(enseignant.id_enseignant)}
                        className="rounded-xl bg-rose-50 p-2 text-rose-700 transition hover:bg-rose-100"
                        aria-label="Supprimer"
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

      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
        <p className="text-sm text-slate-600">
          Page {pagination.page} sur {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => void loadPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDoubleLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => void loadPage(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronDoubleRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AjoutModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSaved={() => void loadPage(currentPage)}
      />
      <EditModal
        isOpen={isEditOpen}
        id_enseignant={enseignantId}
        onClose={() => setIsEditOpen(false)}
        onSaved={() => void loadPage(currentPage)}
      />
    </div>
  );
}
