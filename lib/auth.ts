import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "./prisma"

/**
 * Ottiene l'utente corrente dalla sessione
 * @returns L'utente corrente o null se non autenticato
 */
export async function getCurrentUser() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      accounts: {
        select: {
          provider: true,
          providerAccountId: true,
        },
      },
    },
  })

  return user
}

/**
 * Richiede autenticazione, altrimenti redirect al login
 * @param redirectTo - URL a cui reindirizzare dopo il login (default: /login)
 * @returns L'utente corrente
 */
export async function requireAuth(redirectTo: string = "/login") {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect(redirectTo)
  }

  return user
}

/**
 * Verifica se l'utente ha un ruolo specifico
 * @param allowedRoles - Array di ruoli consentiti
 * @returns true se l'utente ha uno dei ruoli consentiti
 */
export async function checkRole(allowedRoles: string[]) {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }

  return allowedRoles.includes(user.role)
}

/**
 * Richiede un ruolo specifico, altrimenti redirect
 * @param allowedRoles - Array di ruoli consentiti
 * @param fallbackUrl - URL a cui reindirizzare se non autorizzato (default: /dashboard)
 * @returns L'utente corrente
 */
export async function requireRole(
  allowedRoles: string[],
  fallbackUrl: string = "/dashboard"
) {
  const user = await requireAuth()
  
  if (!allowedRoles.includes(user.role)) {
    redirect(fallbackUrl)
  }

  return user
}

/**
 * Verifica se l'utente è un amministratore
 * @returns true se l'utente è ADMIN
 */
export async function isAdmin() {
  return checkRole(["ADMIN"])
}

/**
 * Richiede privilegi di amministratore
 * @param fallbackUrl - URL a cui reindirizzare se non admin
 * @returns L'utente corrente (admin)
 */
export async function requireAdmin(fallbackUrl: string = "/dashboard") {
  return requireRole(["ADMIN"], fallbackUrl)
}

/**
 * Verifica se l'utente è un manager o superiore
 * @returns true se l'utente è ADMIN o MANAGER
 */
export async function isManager() {
  return checkRole(["ADMIN", "MANAGER"])
}

/**
 * Richiede privilegi di manager o superiore
 * @param fallbackUrl - URL a cui reindirizzare se non manager
 * @returns L'utente corrente (manager o admin)
 */
export async function requireManager(fallbackUrl: string = "/dashboard") {
  return requireRole(["ADMIN", "MANAGER"], fallbackUrl)
}

/**
 * Tipo dell'utente con sessione estesa
 */
export type AuthenticatedUser = NonNullable<
  Awaited<ReturnType<typeof getCurrentUser>>
>

/**
 * Hook lato server per proteggere API routes
 * @returns Sessione utente validata
 */
export async function getServerSession() {
  const session = await auth()
  
  if (!session?.user) {
    return null
  }
  
  return session
}

/**
 * Verifica se l'utente è proprietario di una risorsa
 * @param resourceOwnerId - ID del proprietario della risorsa
 * @returns true se l'utente è il proprietario o è admin
 */
export async function isResourceOwner(resourceOwnerId: string) {
  const user = await getCurrentUser()
  
  if (!user) {
    return false
  }

  // Admin può accedere a tutto
  if (user.role === "ADMIN") {
    return true
  }

  return user.id === resourceOwnerId
}
