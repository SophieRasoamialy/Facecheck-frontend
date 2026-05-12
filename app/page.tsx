"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [activePortal, setActivePortal] = useState<"student" | "admin" | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePortalClick(portal: "student" | "admin", href: string) {
    setActivePortal(portal);
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-100 to-white">
      {isPending ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-8 py-6 shadow-xl">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
            <p className="text-sm font-medium text-slate-700">
              Ouverture du portail {activePortal === "admin" ? "administrateur" : "etudiant"}...
            </p>
          </div>
        </div>
      ) : null}

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-teal-600 mb-6"
          >
            Bienvenue sur iPresencia
            
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 mb-12"
          >
            Plateforme de gestion des presences, des emplois du temps et du suivi etudiant pour les administrateurs et les etudiants.
          </motion.p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                type="button"
                onClick={() => handlePortalClick("student", "/etudiant/login")}
                disabled={isPending}
                className="inline-flex min-w-[220px] items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-teal-300 to-lime-300 px-8 py-4 text-black shadow-lg transition-all duration-300 hover:bg-gradient-to-l hover:from-teal-400 hover:to-lime-400 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isPending && activePortal === "student" ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                ) : null}
                <span>Portail etudiant</span>
              </button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                type="button"
                onClick={() => handlePortalClick("admin", "/admin/login")}
                disabled={isPending}
                className="inline-flex min-w-[220px] items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isPending && activePortal === "admin" ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : null}
                <span>Portail administrateur</span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-semibold mb-3">Authentification et acces</h3>
            <p className="text-gray-600">Connexion admin et etudiant avec mot de passe, mot de passe oublie et reinitialisation integres.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-semibold mb-3">Gestion academique</h3>
            <p className="text-gray-600">Administration des etudiants, enseignants, matieres et emplois du temps depuis une interface unique.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <h3 className="text-xl font-semibold mb-3">Presence et suivi</h3>
            <p className="text-gray-600">Pointage entree/sortie, suivi de presence par cours et visualisation des absences et de l&apos;assiduite.</p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
