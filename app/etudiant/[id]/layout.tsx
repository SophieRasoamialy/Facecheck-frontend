"use client"
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { readSession } from "@/lib/session";

export default function EtudiantLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
      const session = readSession("student");
      if (!session || String(session.id) !== params?.id) {
        router.replace("/etudiant/login");
        return;
      }

      setAllowed(true);
    }, [params?.id, router]);

    if (!allowed) {
      return null;
    }

    return <section>{children}</section>
  }
