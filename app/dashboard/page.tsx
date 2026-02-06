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
  { label: 'Active Projects', value: '5', icon: FileText, trend: '+2 this month', color: 'bg-blue-500/10 text-blue-600' },
  { label: 'Scripts', value: '12', icon: FileText, trend: '+5 this month', color: 'bg-purple-500/10 text-purple-600' },
  { label: 'Tasks', value: '45', icon: Calendar, trend: '85% completed', color: 'bg-green-500/10 text-green-600' },
  { label: 'Budget', value: '$25.5k', icon: DollarSign, trend: 'On track', color: 'bg-amber-500/10 text-amber-600' },
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session?.user?.name || 'User'}! Here's what's happening with your projects.
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
            <div className={`absolute top-0 right-0 p-3 rounded-bl-xl ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="text-sm font-medium">{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Recent Projects</h2>
            <p className="text-sm text-muted-foreground">
              Your latest video production projects
            </p>
          </div>
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm">
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
              <Card key={project.id} className="flex flex-col border-none shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                    {getStatusBadge(project.status)}
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {project.scripts_count} scripts
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {project.tasks_count} tasks
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {project.budget}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated {formatRelativeTime(project.updated_at)}
                      </div>
                    </div>
                    
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="outline" className="w-full">
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
