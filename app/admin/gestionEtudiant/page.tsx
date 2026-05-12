"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  InformationCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import Swal from "sweetalert2";

import AjoutModal from "./modal/ajoutModal";
import EditModal from "./modal/editModal";
import InfoModal from "./modal/infoModal";
import {
  deleteEtudiant,
  getEtudiantsByNiveau,
  getNiveaux,
  unwrapError,
} from "@/lib/api";
import type { Etudiant, Niveau } from "@/lib/types";

export default function ListEtudiant() {
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [selectedNiveau, setSelectedNiveau] = useState("");
  const [search, setSearch] = useState("");
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [etudiantId, setEtudiantId] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
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

  async function loadStudents(levelId: string) {
    try {
      setLoading(true);
      setEtudiants(await getEtudiantsByNiveau(levelId));
    } catch (error) {
      Swal.fire("Erreur", unwrapError(error, "Impossible de charger les etudiants"), "error");
    } finally {
      setLoading(false);
    }
  }

  const filteredEtudiants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return etudiants;
    }

    return etudiants.filter((etudiant) =>
      `${etudiant.id_etudiant} ${etudiant.nom_etudiant} ${etudiant.prenom_etudiant}`
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [etudiants, search]);

  async function handleDelete(id: number) {
    const result = await Swal.fire({
      title: "Supprimer cet etudiant ?",
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
      await deleteEtudiant(id);
      if (selectedNiveau) {
        await loadStudents(selectedNiveau);
      }
      await Swal.fire("Succes", "Etudiant supprime", "success");
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
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Etudiants</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedNiveau}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedNiveau(value);
              if (value) {
                void loadStudents(value);
              } else {
                setEtudiants([]);
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
            placeholder="Rechercher un etudiant"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500"
          />
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white"
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
              <th className="px-6 py-4">Matricule</th>
              <th className="px-6 py-4">Etudiant</th>
              <th className="px-6 py-4">Absences</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                  Chargement...
                </td>
              </tr>
            ) : filteredEtudiants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                  Selectionnez un niveau pour afficher les etudiants.
                </td>
              </tr>
            ) : (
              filteredEtudiants.map((etudiant) => (
                <tr key={etudiant.id_etudiant} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {etudiant.id_etudiant}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={etudiant.photo_etudiant || "/vercel.svg"}
                        alt={`${etudiant.nom_etudiant} ${etudiant.prenom_etudiant}`}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-full object-cover"
                        unoptimized
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {etudiant.nom_etudiant} {etudiant.prenom_etudiant}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {etudiant.nombre_absences ?? 0}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                      {etudiant.status ?? "Inconnu"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEtudiantId(etudiant.id_etudiant);
                          setIsInfoOpen(true);
                        }}
                        className="rounded-xl bg-amber-50 p-2 text-amber-700 transition hover:bg-amber-100"
                      >
                        <InformationCircleIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setEtudiantId(etudiant.id_etudiant);
                          setIsEditOpen(true);
                        }}
                        className="rounded-xl bg-sky-50 p-2 text-sky-700 transition hover:bg-sky-100"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => void handleDelete(etudiant.id_etudiant)}
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
        onClose={() => setIsCreateOpen(false)}
        onSaved={() => {
          if (selectedNiveau) {
            void loadStudents(selectedNiveau);
          }
        }}
      />
      <EditModal
        isOpen={isEditOpen}
        id_etudiant={etudiantId}
        onClose={() => setIsEditOpen(false)}
        onSaved={() => {
          if (selectedNiveau) {
            void loadStudents(selectedNiveau);
          }
        }}
      />
      <InfoModal
        isOpen={isInfoOpen}
        id_etudiant={etudiantId}
        onClose={() => setIsInfoOpen(false)}
      />
    </div>
  );
}
