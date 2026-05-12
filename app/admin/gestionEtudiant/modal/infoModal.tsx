"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import ModalShell from "@/components/ui/ModalShell";
import { formatDisplayDate } from "@/lib/date";
import { getEtudiantAbsences, unwrapError } from "@/lib/api";
import type { StudentCourse } from "@/lib/types";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  id_etudiant: number;
}

export default function InfoModal({ isOpen, onClose, id_etudiant }: ModalProps) {
  const [absentTimetable, setAbsentTimetable] = useState<StudentCourse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAbsences() {
      if (!isOpen || !id_etudiant) {
        return;
      }

      try {
        setLoading(true);
        setAbsentTimetable(await getEtudiantAbsences(id_etudiant));
      } catch (error) {
        Swal.fire("Erreur", unwrapError(error, "Chargement impossible"), "error");
      } finally {
        setLoading(false);
      }
    }

    void loadAbsences();
  }, [id_etudiant, isOpen]);

  return (
    <ModalShell
      isOpen={isOpen}
      title="Cours non assistes"
      footer={
        <button
          onClick={onClose}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Fermer
        </button>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : absentTimetable.length === 0 ? (
        <p className="text-sm text-slate-500">Aucune absence detaillee pour cet etudiant.</p>
      ) : (
        <div className="space-y-3">
          {absentTimetable.map((course) => (
            <div key={course.id_edt} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Le {formatDisplayDate(course.date)} a {course.heure}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {course.matiere}
              </p>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}
