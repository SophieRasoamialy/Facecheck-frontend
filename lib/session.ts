export interface StoredSession {
  role: "admin" | "student";
  id?: number;
  email: string;
}

const ADMIN_KEY = "facecheck_admin_session";
const STUDENT_KEY = "facecheck_student_session";

function getStorageKey(role: StoredSession["role"]) {
  return role === "admin" ? ADMIN_KEY : STUDENT_KEY;
}

export function saveSession(session: StoredSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getStorageKey(session.role), JSON.stringify(session));
}

export function readSession(role: StoredSession["role"]) {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(getStorageKey(role));
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession(role: StoredSession["role"]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getStorageKey(role));
}
