"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import ModalShell from "@/components/ui/ModalShell";
import {
  getMatieresByNiveau,
  getNiveaux,
  getSalles,
  getTimetableEntry,
  unwrapError,
  updateTimetableEntry,
} from "@/lib/api";
import type { Matiere, Niveau, Salle } from "@/lib/types";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  edtId: number;
  onSaved: () => void;
}

export default function EditModal({ isOpen, onClose, edtId, onSaved }: ModalProps) {
  const [date, setDate] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [niveau, setNiveau] = useState("");
  const [matiere, setMatiere] = useState("");
  const [salle, setSalle] = useState("");
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadReferencesAndEntry() {
      if (!isOpen || !edtId) {
        return;
      }

      try {
        setLoading(true);
        const [loadedNiveaux, loadedSalles, entry] = await Promise.all([
          getNiveaux(),
          getSalles(),
          getTimetableEntry(edtId),
        ]);
        setNiveaux(loadedNiveaux);
        setSalles(loadedSalles);
        setDate(entry.date);
        setHeureDebut(entry.heure);
        setHeureFin(entry.heure_fin);
        setNiveau(String(entry.id_niveau));
        setMatiere(String(entry.id_matiere));
        setSalle(String(entry.id_salle));
        setMatieres(await getMatieresByNiveau(entry.id_niveau));
      } catch (error) {
        Swal.fire("Erreur", unwrapError(error, "Chargement impossible"), "error");
      } finally {
        setLoading(false);
      }
    }

    void loadReferencesAndEntry();
  }, [edtId, isOpen]);

  useEffect(() => {
    async function loadMatieres() {
      if (!niveau) {
        setMatieres([]);
        setMatiere("");
        return;
      }

      try {
        setMatieres(await getMatieresByNiveau(niveau));
      } catch (error) {
        Swal.fire("Erreur", unwrapError(error, "Chargement des matieres impossible"), "error");
      }
    }

    if (isOpen) {
      void loadMatieres();
    }
  }, [isOpen, niveau]);

  async function handleSave() {
    try {
      setSaving(true);
      await updateTimetableEntry(edtId, {
        date,
        heure: heureDebut,
        heure_fin: heureFin,
        id_niveau: Number(niveau),
        id_matiere: Number(matiere),
        id_salle: Number(salle),
      });
      await Swal.fire("Succes", "Cours mis a jour", "success");
      onSaved();
      onClose();
    } catch (error) {
      Swal.fire("Erreur", unwrapError(error, "Mise a jour impossible"), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell
      isOpen={isOpen}
      title="Modifier cours"
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Fermer
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={loading || saving || !date || !heureDebut || !heureFin || !niveau || !matiere || !salle}
            className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Mettre a jour"}
          </button>
        </>
      }
    >
      {loading ? (
        <p className="text-sm text-slate-500">Chargement...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Niveau
            <select
              value={niveau}
              onChange={(event) => setNiveau(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            >
              <option value="">Choisir un niveau</option>
              {niveaux.map((item) => (
                <option key={item.id_niveau} value={item.id_niveau}>
                  {item.niveau}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Heure de debut
            <input
              type="time"
              value={heureDebut}
              onChange={(event) => setHeureDebut(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Heure de fin
            <input
              type="time"
              value={heureFin}
              onChange={(event) => setHeureFin(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Matiere
            <select
              value={matiere}
              onChange={(event) => setMatiere(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            >
              <option value="">Choisir une matiere</option>
              {matieres.map((item) => (
                <option key={item.id_matiere} value={item.id_matiere}>
                  {item.matiere}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Salle
            <select
              value={salle}
              onChange={(event) => setSalle(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            >
              <option value="">Choisir une salle</option>
              {salles.map((item) => (
                <option key={item.num_salle} value={item.num_salle}>
                  {item.num_salle}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </ModalShell>
  );
}
