"use client"

import Link from 'next/link'
import { useSession } from "next-auth/react"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Film, Sparkles, Calendar, DollarSign, Users, MapPin, ArrowRight } from 'lucide-react'
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Reindirizza automaticamente se loggato
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2 group">
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Film className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-xl">VideoPreProd AI</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            {status === "authenticated" ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="shadow-lg shadow-primary/25">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="container py-24 sm:py-32">
          <div className="mx-auto max-w-[980px] text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              <span>Powered by AI</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]">
              AI-Powered Video
              <br />
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Pre-Production</span>
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground md:text-xl max-w-[600px] mx-auto">
              Streamline your video production workflow with AI-assisted scripting,
              scheduling, budgeting, and team collaboration.
            </p>
            
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section className="container py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
              <div className="h-1 bg-gradient-to-r from-primary to-violet-500" />
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">AI Scripting</CardTitle>
                <CardDescription>
                  Generate professional video scripts and outlines with AI assistance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  From concept to full script in minutes. Export in multiple formats.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Scheduling</CardTitle>
                <CardDescription>
                  Plan your production timeline with intuitive scheduling tools.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track milestones, deadlines, and team availability.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">Budget Management</CardTitle>
                <CardDescription>
                  Keep your production on budget with expense tracking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor costs, generate reports, and forecast spending.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
              <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Location Management</CardTitle>
                <CardDescription>
                  Organize filming locations and permits.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Store location details, contacts, and requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
              <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle className="text-xl">Team Collaboration</CardTitle>
                <CardDescription>
                  Work together with your production team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Assign tasks, share files, and communicate in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Film className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-xl">Export & Deliver</CardTitle>
                <CardDescription>
                  Export your pre-production documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Download scripts, schedules, and budgets in various formats.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
