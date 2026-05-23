import { auth } from "@churchflow/auth";
import { NextResponse } from "next/server";

export type AuthenticatedUser = {
  churchId: string;
  roles: string[];
  userId: string;
};

export interface SessionLike {
  user?: {
    churchId?: unknown;
    roles?: unknown;
    id?: unknown;
  };
}

/**
 * Extracts the authenticated user context from a session object.
 * Returns null if the session is missing or contains no churchId.
 */
export function getAuthUser(session: SessionLike | null): AuthenticatedUser | null {
  if (!session?.user) return null;
  const user = session.user;
  if (typeof user.churchId !== "string" || !user.churchId) return null;
  return {
    churchId: user.churchId,
    roles: Array.isArray(user.roles) ? (user.roles as string[]) : [],
    userId: typeof user.id === "string" ? user.id : "",
  };
}

/** Standard 401 Unauthorized JSON response */
export const unauthorized = () =>
  NextResponse.json(
    { success: false, error: "Non autorisé : session invalide ou expirée" },
    { status: 401 }
  );

/** Standard 403 Forbidden JSON response */
export const forbidden = () =>
  NextResponse.json(
    { success: false, error: "Accès refusé : droits insuffisants" },
    { status: 403 }
  );

export { auth };
