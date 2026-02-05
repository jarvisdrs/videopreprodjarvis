export const dynamic = 'force-dynamic'

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { GoogleSignInButton } from "@/components/auth/google-signin-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LoginPage() {
  const session = await auth()
  
  // Se l'utente è già autenticato, redirect alla dashboard
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">VideoPreProd AI</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered video pre-production platform
          </p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Benvenuto
            </CardTitle>
            <CardDescription className="text-center">
              Accedi per gestire i tuoi progetti video
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GoogleSignInButton />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Sicuro e veloce
                </span>
              </div>
            </div>
            
            <p className="text-center text-xs text-muted-foreground">
              Continuando accetti i nostri{" "}
              <a href="#" className="underline hover:text-primary">
                Termini di Servizio
              </a>{" "}
              e{" "}
              <a href="#" className="underline hover:text-primary">
                Privacy Policy
              </a>
            </p>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-8">
          © {new Date().getFullYear()} VideoPreProd AI. Tutti i diritti riservati.
        </p>
      </div>
    </div>
  )
}
