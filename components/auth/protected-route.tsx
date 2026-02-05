"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  allowedRoles,
  fallback,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    if (allowedRoles && !allowedRoles.includes(session.user?.role as string)) {
      router.push("/dashboard")
    }
  }, [session, status, router, allowedRoles])

  if (status === "loading") {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      )
    )
  }

  if (!session) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(session.user?.role as string)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Accesso Negato</h1>
          <p className="text-muted-foreground">
            Non hai i permessi necessari per accedere a questa pagina.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
