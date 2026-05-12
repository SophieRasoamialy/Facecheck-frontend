"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { addDays, endOfWeek, format, startOfWeek } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import Webcam from "react-webcam";
import Swal from "sweetalert2";

import ModalShell from "@/components/ui/ModalShell";
import {
  closePointage,
  createPointage,
  getEtudiant,
  getEtudiantPhotoPath,
  getNiveau,
  getStudentTimetable,
  unwrapError,
} from "@/lib/api";
import { toApiDate, toApiDateTime } from "@/lib/date";
import { compareFaceImages } from "@/lib/faceRecognition";
import type { StudentCourse } from "@/lib/types";

type AttendanceMode = "entry" | "exit" | null;

export default function EdtPage() {
  const params = useParams<{ id: string }>();
  const studentId = params?.id;
  const webcamRef = useRef<Webcam>(null);
  const [niveauId, setNiveauId] = useState<number | null>(null);
  const [niveauLabel, setNiveauLabel] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [attendanceMode, setAttendanceMode] = useState<AttendanceMode>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const weekStart = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );
  const weekEnd = useMemo(
    () => endOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );

  const loadCourses = useCallback(
    async (niveau: number, start: Date, end: Date) => {
      if (!studentId) {
        return;
      }

      try {
        setLoading(true);
        setCourses(
          await getStudentTimetable(niveau, studentId, toApiDate(start), toApiDate(end))
        );
      } catch (error) {
        Swal.fire("Erreur", unwrapError(error, "Impossible de charger l'emploi du temps"), "error");
      } finally {
        setLoading(false);
      }
    },
    [studentId]
  );

  const loadStudentContext = useCallback(async () => {
    if (!studentId) {
      return;
    }

    try {
      const etudiant = await getEtudiant(studentId);
      const niveau = await getNiveau(etudiant.id_niveau);
      setNiveauId(etudiant.id_niveau);
      setNiveauLabel(niveau.niveau);
      await loadCourses(etudiant.id_niveau, weekStart, weekEnd);
    } catch (error) {
      Swal.fire("Erreur", unwrapError(error, "Impossible de charger l'etudiant"), "error");
    }
  }, [loadCourses, studentId, weekEnd, weekStart]);

  useEffect(() => {
    void loadStudentContext();
  }, [loadStudentContext]);

  useEffect(() => {
    if (niveauId) {
      void loadCourses(niveauId, weekStart, weekEnd);
    }
  }, [loadCourses, niveauId, weekStart, weekEnd]);

  async function handleAttendance() {
    if (!selectedCourseId || !attendanceMode || !studentId) {
      return;
    }

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      Swal.fire("Erreur", "Impossible de capturer l'image.", "error");
      return;
    }

    try {
      setLoading(true);
      setCapturedImage(imageSrc);
      const photoPath = await getEtudiantPhotoPath(studentId);
      const isMatch = await compareFaceImages(photoPath, imageSrc);

      if (!isMatch) {
        Swal.fire("Erreur", "Verification faciale echouee.", "error");
        return;
      }

      if (attendanceMode === "entry") {
        await createPointage({
          id_edt: selectedCourseId,
          id_etudiant: studentId,
          pointage_entre: toApiDateTime(new Date()),
        });
      } else {
        await closePointage({
          id_edt: selectedCourseId,
          id_etudiant: studentId,
          pointage_sortie: toApiDateTime(new Date()),
        });
      }

      await Swal.fire("Succes", "Pointage enregistre", "success");
      if (niveauId) {
        await loadCourses(niveauId, weekStart, weekEnd);
      }
      closeModal();
    } catch (error) {
      Swal.fire("Erreur", unwrapError(error, "Pointage impossible"), "error");
    } finally {
      setLoading(false);
      setTimeout(() => setCapturedImage(null), 1200);
    }
  }

  function openModal(courseId: number, mode: AttendanceMode) {
    setSelectedCourseId(courseId);
    setAttendanceMode(mode);
  }

  function closeModal() {
    setSelectedCourseId(null);
    setAttendanceMode(null);
    setCapturedImage(null);
  }

  function getActionForCourse(course: StudentCourse) {
    if (course.isPresent?.present) {
      return {
        label: "Presence validee",
        disabled: true,
      };
    }

    if (course.isEntranceOnly?.entranceOnly) {
      return {
        label: "Pointer sortie",
        disabled: false,
        mode: "exit" as const,
      };
    }

    return {
      label: "Pointer entree",
      disabled: false,
      mode: "entry" as const,
    };
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-r from-teal-600 to-emerald-500 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-50">
              Emploi du temps
            </p>
            <h2 className="mt-2 text-3xl font-bold">{niveauLabel || "Chargement..."}</h2>
            <p className="mt-3 text-sm text-teal-50">
              Semaine du {format(weekStart, "dd/MM/yyyy")} au {format(weekEnd, "dd/MM/yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(addDays(weekStart, -7))}
              className="rounded-xl bg-white/15 p-2 text-white"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentDate(addDays(weekStart, 7))}
              className="rounded-xl bg-white/15 p-2 text-white"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {loading && courses.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-6 text-sm text-slate-500 shadow-lg">
            Chargement...
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-6 text-sm text-slate-500 shadow-lg">
            Aucun cours pour cette semaine.
          </div>
        ) : (
          courses.map((course) => {
            const action = getActionForCourse(course);

            return (
              <div
                key={course.id_edt}
                className="rounded-[2rem] bg-white p-6 shadow-lg"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {format(new Date(course.date), "dd/MM/yyyy")} • {course.heure} - {course.heure_fin}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">{course.matiere}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {course.nom_enseignant} {course.prenom_enseignant} • Salle {course.num_salle}
                    </p>
                  </div>

                  <button
                    onClick={() => action.mode && openModal(course.id_edt, action.mode)}
                    disabled={action.disabled}
                    className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    {action.label}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ModalShell
        isOpen={attendanceMode !== null}
        title={attendanceMode === "entry" ? "Pointage entree" : "Pointage sortie"}
        footer={
          <>
            <button
              onClick={closeModal}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Fermer
            </button>
            <button
              onClick={() => void handleAttendance()}
              disabled={loading}
              className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Verification..." : "Valider"}
            </button>
          </>
        }
      >
        <div className="overflow-hidden rounded-[1.5rem] bg-slate-900">
          {capturedImage ? (
            <Image
              src={capturedImage}
              alt="Capture webcam"
              width={640}
              height={420}
              className="h-[320px] w-full object-cover"
              unoptimized
            />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="h-[320px] w-full object-cover"
            />
          )}
        </div>
      </ModalShell>
    </div>
  );
}
