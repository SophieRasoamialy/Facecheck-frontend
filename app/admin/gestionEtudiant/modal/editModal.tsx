"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import ModalShell from "@/components/ui/ModalShell";
import s3 from "@/aws-config";
import {
  getEtudiant,
  getNiveaux,
  unwrapError,
  updateEtudiant,
} from "@/lib/api";
import type { Niveau } from "@/lib/types";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  id_etudiant: number;
  onSaved: () => void;
}

async function uploadStudentPhoto(studentPhoto: File | null) {
  if (!studentPhoto) {
    return undefined;
  }

  const uploadResult = await s3
    .upload({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: `students/${Date.now()}_${studentPhoto.name}`,
      Body: studentPhoto,
      ContentType: studentPhoto.type,
    })
    .promise();

  return uploadResult.Location;
}

export default function EditModal({
  isOpen,
  onClose,
  id_etudiant,
  onSaved,
}: ModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedNiveau, setSelectedNiveau] = useState("");
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [studentPhoto, setStudentPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadForm() {
      if (!isOpen || !id_etudiant) {
        return;
      }

      try {
        setLoading(true);
        const [loadedNiveaux, etudiant] = await Promise.all([
          getNiveaux(),
          getEtudiant(id_etudiant),
        ]);
        setNiveaux(loadedNiveaux);
        setFirstName(etudiant.nom_etudiant);
        setLastName(etudiant.prenom_etudiant);
        setEmail(etudiant.email ?? "");
        setSelectedNiveau(String(etudiant.id_niveau));
      } catch (error) {
        Swal.fire("Erreur", unwrapError(error, "Chargement impossible"), "error");
      } finally {
        setLoading(false);
      }
    }

    void loadForm();
  }, [id_etudiant, isOpen]);

  async function handleSave() {
    try {
      setSaving(true);
      const photoUrl = await uploadStudentPhoto(studentPhoto);
      await updateEtudiant(id_etudiant, {
        nom_etudiant: firstName.trim(),
        prenom_etudiant: lastName.trim(),
        email: email.trim(),
        id_niveau: Number(selectedNiveau),
        ...(password ? { password } : {}),
        ...(photoUrl ? { photo_etudiant: photoUrl } : {}),
      });
      await Swal.fire("Succes", "Etudiant mis a jour", "success");
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
      title="Modifier etudiant"
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
            disabled={loading || saving || !firstName.trim() || !lastName.trim() || !email.trim() || !selectedNiveau}
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
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Nom
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Prenom
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Nouveau mot de passe
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
              placeholder="Laisser vide pour conserver l'ancien"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Nouvelle photo
            <input
              type="file"
              onChange={(event) => setStudentPhoto(event.target.files?.[0] ?? null)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Niveau
            <select
              value={selectedNiveau}
              onChange={(event) => setSelectedNiveau(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
            >
              <option value="">Choisir un niveau</option>
              {niveaux.map((niveau) => (
                <option key={niveau.id_niveau} value={niveau.id_niveau}>
                  {niveau.niveau}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </ModalShell>
  );
}
