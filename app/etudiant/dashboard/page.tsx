"use client";

import "chart.js/auto";
import { Chart, type ChartType, registerables } from "chart.js";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";

import {
  getEtudiant,
  getNiveau,
  getUnattendedCourses,
  unwrapError,
} from "@/lib/api";
import { formatDisplayDate } from "@/lib/date";
import type { StudentCourse } from "@/lib/types";

Chart.register(...registerables);

export default function DashboardPage() {
  const params = useParams<{ id: string }>();
  const studentId = params?.id;
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [niveau, setNiveau] = useState("");
  const [absence, setAbsence] = useState(0);
  const [assiduite, setAssiduite] = useState(100);
  const [unattendedCourses, setUnattendedCourses] = useState<StudentCourse[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      if (!studentId) {
        return;
      }

      try {
        const etudiant = await getEtudiant(studentId);
        const [niveauData, unattended] = await Promise.all([
          getNiveau(etudiant.id_niveau),
          getUnattendedCourses(studentId),
        ]);

        setNiveau(niveauData.niveau);
        setUnattendedCourses(unattended);
        setAbsence(unattended.length);
        setAssiduite(Math.max(0, 100 - unattended.length * 5));
      } catch (error) {
        Swal.fire("Erreur", unwrapError(error, "Impossible de charger le dashboard"), "error");
      }
    }

    void loadDashboard();
  }, [studentId]);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) {
      return;
    }

    chartInstanceRef.current?.destroy();
    chartInstanceRef.current = new Chart(ctx, {
      type: "doughnut" as ChartType,
      data: {
        labels: ["Assiduite", "Absence"],
        datasets: [
          {
            data: [assiduite, Math.max(100 - assiduite, 0)],
            backgroundColor: ["#0f766e", "#f59e0b"],
          },
        ],
      },
    });

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [assiduite]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-gradient-to-r from-teal-600 to-emerald-500 p-6 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-50">
          Dashboard
        </p>
        <h2 className="mt-2 text-3xl font-bold">Suivi de presence</h2>
        <p className="mt-3 text-sm text-teal-50">Niveau courant: {niveau || "Chargement..."}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900">Assiduite estimee</h3>
          <div className="mx-auto mt-6 max-w-[260px]">
            <canvas ref={chartRef} />
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900">Resume</h3>
          <div className="mt-6 grid gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Nombre d&apos;absences connues</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{absence}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Taux d&apos;assiduite estime</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">{assiduite}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-slate-900">Cours non suivis</h3>
        <div className="mt-5 space-y-3">
          {unattendedCourses.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun cours manquant detecte.</p>
          ) : (
            unattendedCourses.map((course) => (
              <div key={course.id_edt} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  {formatDisplayDate(course.date)} • {course.heure} - {course.heure_fin}
                </p>
                <p className="mt-1 font-semibold text-slate-900">{course.matiere}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {course.nom_enseignant} {course.prenom_enseignant}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
