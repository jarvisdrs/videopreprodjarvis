import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Protezione: redirect al login se non autenticato
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar user={session.user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
