"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import { addDays, endOfWeek, format, startOfWeek } from "date-fns";
import Swal from "sweetalert2";

import AjoutModal from "./modal/ajoutModal";
import EditModal from "./modal/editModal";
import {
  deleteTimetableEntry,
  getNiveaux,
  getTimetableByNiveau,
  unwrapError,
} from "@/lib/api";
import { toApiDate } from "@/lib/date";
import type { Niveau, StudentCourse } from "@/lib/types";

export default function EdtPage() {
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [selectedNiveau, setSelectedNiveau] = useState("");
  const [edts, setEdts] = useState<StudentCourse[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [edtId, setEdtId] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );
  const weekEnd = useMemo(
    () => endOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );

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

  async function loadTimetable(niveauId: string, start = weekStart, end = weekEnd) {
    try {
      setLoading(true);
      setEdts(await getTimetableByNiveau(niveauId, toApiDate(start), toApiDate(end)));
    } catch (error) {
      Swal.fire("Erreur", unwrapError(error, "Impossible de charger l'emploi du temps"), "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    const result = await Swal.fire({
      title: "Supprimer ce cours ?",
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
      await deleteTimetableEntry(id);
      if (selectedNiveau) {
        await loadTimetable(selectedNiveau);
      }
      await Swal.fire("Succes", "Cours supprime", "success");
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
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Emploi du temps</h2>
          <p className="mt-2 text-sm text-slate-600">
            Semaine du {format(weekStart, "dd/MM/yyyy")} au {format(weekEnd, "dd/MM/yyyy")}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextDate = addDays(weekStart, -7);
                setCurrentDate(nextDate);
                if (selectedNiveau) {
                  void loadTimetable(selectedNiveau, nextDate, endOfWeek(nextDate, { weekStartsOn: 1 }));
                }
              }}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                const nextDate = addDays(weekStart, 7);
                setCurrentDate(nextDate);
                if (selectedNiveau) {
                  void loadTimetable(selectedNiveau, nextDate, endOfWeek(nextDate, { weekStartsOn: 1 }));
                }
              }}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          <select
            value={selectedNiveau}
            onChange={(event) => {
              const value = event.target.value;
              setSelectedNiveau(value);
              if (value) {
                void loadTimetable(value);
              } else {
                setEdts([]);
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
          <button
            onClick={() => setIsCreateOpen(true)}
            disabled={!selectedNiveau}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5" />
            Nouveau cours
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Horaire</th>
              <th className="px-6 py-4">Matiere</th>
              <th className="px-6 py-4">Enseignant</th>
              <th className="px-6 py-4">Salle</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  Chargement...
                </td>
              </tr>
            ) : edts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  Selectionnez un niveau pour afficher les cours de la semaine.
                </td>
              </tr>
            ) : (
              edts.map((edt) => (
                <tr key={edt.id_edt} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {format(new Date(edt.date), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {edt.heure} - {edt.heure_fin}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {edt.matiere}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {edt.nom_enseignant} {edt.prenom_enseignant}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{edt.num_salle}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setEdtId(edt.id_edt);
                          setIsEditOpen(true);
                        }}
                        className="rounded-xl bg-sky-50 p-2 text-sky-700 transition hover:bg-sky-100"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => void handleDelete(edt.id_edt)}
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
        defaultNiveauId={selectedNiveau}
        onClose={() => setIsCreateOpen(false)}
        onSaved={() => {
          if (selectedNiveau) {
            void loadTimetable(selectedNiveau);
          }
        }}
      />
      <EditModal
        isOpen={isEditOpen}
        edtId={edtId}
        onClose={() => setIsEditOpen(false)}
        onSaved={() => {
          if (selectedNiveau) {
            void loadTimetable(selectedNiveau);
          }
        }}
      />
    </div>
  );
}
