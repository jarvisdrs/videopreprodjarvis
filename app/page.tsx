import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Film, Sparkles, Calendar, DollarSign, Users, MapPin, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Film className="h-6 w-6" />
              <span className="font-bold text-xl">VideoPreProd AI</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Link href="/api/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container py-24 sm:py-32">
          <div className="mx-auto max-w-[980px] text-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]">
              AI-Powered Video
              <br />
              Pre-Production
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Streamline your video production workflow with AI-assisted scripting,
              <br className="hidden sm:inline" />
              scheduling, budgeting, and team collaboration.
            </p>
            
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg">
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
            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI Scripting</CardTitle>
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

            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Scheduling</CardTitle>
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

            <Card>
              <CardHeader>
                <DollarSign className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Budget Management</CardTitle>
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

            <Card>
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Location Management</CardTitle>
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

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Team Collaboration</CardTitle>
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

            <Card>
              <CardHeader>
                <Film className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Export &amp; Deliver</CardTitle>
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
