"use client";

import { useRouter } from "next/navigation";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import DashboardPage from "../dashboard/page";
import EdtPage from "../edt/page";
import { clearSession } from "@/lib/session";

export default function EtudiantPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-lime-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-white/90 p-4 shadow-xl backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-center text-3xl font-bold text-teal-700">
              Espace etudiant
            </h1>
            <button
              onClick={() => {
                clearSession("student");
                router.push("/etudiant/login");
              }}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Se deconnecter
            </button>
          </div>

          <Tabs className="mt-6">
            <TabList className="flex flex-wrap justify-center gap-3">
              <Tab
                className="cursor-pointer rounded-2xl border border-teal-200 px-5 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                selectedClassName="!rounded-2xl !border-teal-600 !bg-teal-600 !text-white"
              >
                Dashboard
              </Tab>

              <Tab
                className="cursor-pointer rounded-2xl border border-teal-200 px-5 py-3 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                selectedClassName="!rounded-2xl !border-teal-600 !bg-teal-600 !text-white"
              >
                Emploi du temps
              </Tab>
            </TabList>

            <TabPanel className="mt-6">
              <DashboardPage />
            </TabPanel>
            <TabPanel className="mt-6">
              <EdtPage />
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
