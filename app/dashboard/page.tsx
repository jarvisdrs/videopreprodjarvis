// DASHBOARD PAGE - VERSION 2026-02-06-1435
'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, FileText, Calendar, DollarSign, TrendingUp, Clock, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { EmptyState } from '@/components/empty-state'
import { formatRelativeTime } from '@/lib/utils'

interface Project {
  id: string
  name: string
  description: string
  status: 'in_progress' | 'planning' | 'completed'
  updated_at: string
  scripts_count: number
  tasks_count: number
  budget: string
}

const stats = [
  { label: 'Active Projects', value: '5', icon: FileText, trend: '+2 this month', gradient: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Scripts', value: '12', icon: FileText, trend: '+5 this month', gradient: 'from-violet-500 to-violet-600', bgColor: 'bg-violet-50', iconColor: 'text-violet-600' },
  { label: 'Tasks', value: '45', icon: Calendar, trend: '85% completed', gradient: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { label: 'Budget', value: '$25.5k', icon: DollarSign, trend: 'On track', gradient: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50', iconColor: 'text-amber-600' },
]

const getStatusBadge = (status: string) => {
  const styles = {
    in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    planning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    completed: 'bg-green-500/10 text-green-600 border-green-500/20',
  }
  const labels = {
    in_progress: 'In Progress',
    planning: 'Planning',
    completed: 'Completed',
  }
  return (
    <Badge variant="outline" className={styles[status as keyof typeof styles] || styles.planning}>
      {labels[status as keyof typeof labels] || status}
    </Badge>
  )
}

function ProjectCardSkeleton() {
  return (
    <Card className="flex flex-col border-none shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="mt-auto pt-4 border-t">
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    fetch('/api/projects')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch projects')
        return res.json()
      })
      .then(data => {
        setProjects(data.slice(0, 3))
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])
  
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/50">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1.5 text-base">
            Welcome back, <span className="font-medium text-foreground">{session?.user?.name || 'User'}</span>! Here's what's happening with your projects.
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 group">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <CardDescription className="text-sm font-medium text-muted-foreground">{stat.label}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-600 font-medium">{stat.trend}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Recent Projects</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your latest video production projects
            </p>
          </div>
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </div>
        ) : error ? (
          <Card className="p-8">
            <EmptyState
              icon={FolderOpen}
              title="Error loading projects"
              description={error}
            />
          </Card>
        ) : projects.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={FolderOpen}
              title="No projects yet"
              description="Create your first project to get started with VideoPreProd AI."
              action={{ label: 'Create Project', href: '/dashboard/projects/new' }}
            />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col border border-border/50 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-all duration-300 hover:-translate-y-1 group overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary to-primary/60" />
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">{project.name}</CardTitle>
                  {getStatusBadge(project.status)}
                </div>
                <CardDescription className="line-clamp-2 mt-2 text-sm">
                  {project.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                    <FileText className="h-3.5 w-3.5" />
                    <span className="font-medium">{project.scripts_count} scripts</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="font-medium">{project.tasks_count} tasks</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span className="font-medium">{project.budget}</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated {formatRelativeTime(project.updated_at)}
                    </div>
                  </div>
                  
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground transition-colors">
                      View Project
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
