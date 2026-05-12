export interface Niveau {
  id_niveau: number;
  niveau: string;
}

export interface Enseignant {
  id_enseignant: number;
  nom_enseignant: string;
  prenom_enseignant: string;
  matiere?: string;
  matieres?: string | null;
}

export interface Matiere {
  id_matiere: number;
  matiere: string;
  id_enseignant?: number;
  id_niveau?: number;
  nom_enseignant?: string;
  prenom_enseignant?: string;
}

export interface Salle {
  num_salle: number;
}

export interface Etudiant {
  id_etudiant: number;
  nom_etudiant: string;
  prenom_etudiant: string;
  id_niveau: number;
  email?: string | null;
  photo_etudiant: string;
  nombre_absences?: number;
  status?: string;
}

export interface StudentCourse {
  id_edt: number;
  date: string;
  heure: string;
  heure_fin: string;
  id_niveau: number;
  id_matiere: number;
  id_salle: number;
  matiere: string;
  nom_enseignant: string;
  prenom_enseignant: string;
  num_salle: string;
  isPresent?: {
    present: boolean;
    message?: string;
  };
  isEntranceOnly?: {
    entranceOnly: boolean;
    message?: string;
  };
}

export interface TeacherPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface TeacherPage {
  items: Enseignant[];
  pagination: TeacherPagination;
}

export interface TimetableFormValues {
  date: string;
  heure: string;
  heure_fin: string;
  id_niveau: number;
  id_matiere: number;
  id_salle: number;
}

export interface MatiereFormValues {
  matiere: string;
  id_enseignant: number;
  id_niveau: number;
}

export interface EnseignantFormValues {
  nom_enseignant: string;
  prenom_enseignant: string;
}

export interface EtudiantFormValues {
  nom_etudiant: string;
  prenom_etudiant: string;
  id_niveau: number;
  email: string;
  password?: string;
  photo_etudiant: string;
}
