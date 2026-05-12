import axios from "axios";

import type {
  Enseignant,
  EnseignantFormValues,
  Etudiant,
  EtudiantFormValues,
  Matiere,
  MatiereFormValues,
  Niveau,
  Salle,
  StudentCourse,
  TeacherPage,
  TimetableFormValues,
} from "@/lib/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACK_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function unwrapError(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message =
      (typeof error.response?.data === "object" &&
        error.response?.data &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string" &&
        error.response.data.message) ||
      error.message;

    return message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export { unwrapError };

export async function getNiveaux() {
  const { data } = await api.get<Niveau[]>("/api/niveaux");
  return data;
}

export async function getNiveau(id: number | string) {
  const { data } = await api.get<Niveau>(`/api/niveaux/${id}`);
  return data;
}

export async function getEnseignantsPage(page = 1, limit = 10) {
  const { data } = await api.get<TeacherPage>("/api/enseignants", {
    params: { page, limit },
  });
  return data;
}

export async function getEnseignantsList() {
  const { data } = await api.get<Enseignant[]>("/api/enseignants/list");
  return data;
}

export async function getEnseignant(id: number) {
  const { data } = await api.get<Enseignant>(`/api/enseignants/${id}`);
  return data;
}

export async function createEnseignant(payload: EnseignantFormValues) {
  const { data } = await api.post<Enseignant>("/api/enseignants", payload);
  return data;
}

export async function updateEnseignant(id: number, payload: EnseignantFormValues) {
  const { data } = await api.put<Enseignant>(`/api/enseignants/${id}`, payload);
  return data;
}

export async function deleteEnseignant(id: number) {
  const { data } = await api.delete(`/api/enseignants/${id}`);
  return data;
}

export async function getMatieresByNiveau(niveauId: number | string) {
  const { data } = await api.get<Matiere[]>(`/api/matieres/niveau/${niveauId}`);
  return data;
}

export async function getMatiere(id: number) {
  const { data } = await api.get<Matiere>(`/api/matieres/${id}`);
  return data;
}

export async function createMatiere(payload: MatiereFormValues) {
  const { data } = await api.post<Matiere>("/api/matieres", payload);
  return data;
}

export async function updateMatiere(id: number, payload: MatiereFormValues) {
  const { data } = await api.put<Matiere>(`/api/matieres/${id}`, payload);
  return data;
}

export async function deleteMatiere(id: number) {
  const { data } = await api.delete(`/api/matieres/${id}`);
  return data;
}

export async function getSalles() {
  const { data } = await api.get<Salle[]>("/api/salles");
  return data;
}

export async function getTimetableByNiveau(
  niveauId: number | string,
  date1: string,
  date2: string
) {
  const { data } = await api.get<StudentCourse[]>(`/api/edt/${niveauId}`, {
    params: { date1, date2 },
  });
  return data;
}

export async function getStudentTimetable(
  niveauId: number | string,
  etudiantId: number | string,
  date1: string,
  date2: string
) {
  const { data } = await api.get<StudentCourse[]>(`/api/edt/etudiant/${niveauId}`, {
    params: { date1, date2, id_etudiant: etudiantId },
  });
  return data;
}

export async function getTimetableEntry(id: number) {
  const { data } = await api.get<TimetableFormValues & { id_edt: number }>(`/api/edt/id/${id}`);
  return data;
}

export async function createTimetableEntry(payload: TimetableFormValues) {
  const { data } = await api.post("/api/edt", payload);
  return data;
}

export async function updateTimetableEntry(id: number, payload: TimetableFormValues) {
  const { data } = await api.put(`/api/edt/id/${id}`, payload);
  return data;
}

export async function deleteTimetableEntry(id: number) {
  const { data } = await api.delete(`/api/edt/id/${id}`);
  return data;
}

export async function getEtudiant(id: number | string) {
  const { data } = await api.get<Etudiant>(`/api/etudiants/${id}`);
  return data;
}

export async function getEtudiantsByNiveau(niveauId: number | string) {
  const { data } = await api.get<Etudiant[]>(`/api/etudiants/niveau/${niveauId}/etudiants`);
  return data;
}

export async function getEtudiantAbsences(id: number | string) {
  const { data } = await api.get<StudentCourse[]>(`/api/etudiants/etudiant/${id}/absences`);
  return data;
}

export async function getUnattendedCourses(id: number | string) {
  const { data } = await api.get<StudentCourse[]>(`/api/etudiants/etudiant/${id}/unattended-courses`);
  return data;
}

export async function checkEtudiantExists(id: number | string) {
  const { data } = await api.get<{ exists: boolean; message: string }>(`/api/etudiants/check/${id}`);
  return data;
}

export async function getEtudiantPhotoPath(id: number | string) {
  const { data } = await api.get<{ photoPath: string }>(`/api/etudiants/${id}/photo`);
  return data.photoPath;
}

export async function createEtudiant(payload: EtudiantFormValues) {
  const { data } = await api.post<Etudiant>("/api/etudiants", payload);
  return data;
}

export async function updateEtudiant(id: number, payload: Partial<EtudiantFormValues>) {
  const { data } = await api.put<Etudiant>(`/api/etudiants/${id}`, payload);
  return data;
}

export async function loginAdmin(payload: { email: string; password: string }) {
  const { data } = await api.post<{ id: number; email: string; role: "admin" }>(
    "/api/admins/login",
    payload
  );
  return data;
}

export async function forgotAdminPassword(payload: { email: string }) {
  const { data } = await api.post<{
    message: string;
    resetToken?: string;
    expiresAt?: string;
  }>("/api/admins/forgot-password", payload);
  return data;
}

export async function resetAdminPassword(payload: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const { data } = await api.post<{ message: string }>("/api/admins/reset-password", payload);
  return data;
}

export async function loginStudent(payload: { email: string; password: string }) {
  const { data } = await api.post<{
    id_etudiant: number;
    email: string;
    nom_etudiant: string;
    prenom_etudiant: string;
    role: "student";
  }>("/api/etudiants/auth/login", payload);
  return data;
}

export async function forgotStudentPassword(payload: { email: string }) {
  const { data } = await api.post<{
    message: string;
    resetToken?: string;
    expiresAt?: string;
  }>("/api/etudiants/auth/forgot-password", payload);
  return data;
}

export async function resetStudentPassword(payload: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const { data } = await api.post<{ message: string }>(
    "/api/etudiants/auth/reset-password",
    payload
  );
  return data;
}

export async function deleteEtudiant(id: number) {
  const { data } = await api.delete(`/api/etudiants/${id}`);
  return data;
}

export async function createPointage(payload: {
  id_edt: number;
  id_etudiant: number | string;
  pointage_entre: string;
}) {
  const { data } = await api.post("/api/pointages", payload);
  return data;
}

export async function closePointage(payload: {
  id_edt: number;
  id_etudiant: number | string;
  pointage_sortie: string;
}) {
  const { data } = await api.put("/api/pointages", payload);
  return data;
}
