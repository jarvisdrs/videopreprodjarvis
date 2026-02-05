'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Calendar, DollarSign, Users } from 'lucide-react'
import Link from 'next/link'

const recentProjects = [
  {
    id: '1',
    name: 'Brand Awareness Campaign',
    description: 'Q1 video series for social media promotion',
    status: 'in_progress',
    updated_at: '2024-01-15T10:00:00Z',
    scripts_count: 3,
    tasks_count: 12,
  },
  {
    id: '2',
    name: 'Product Launch Video',
    description: 'Main product launch video for spring collection',
    status: 'planning',
    updated_at: '2024-01-14T15:30:00Z',
    scripts_count: 1,
    tasks_count: 5,
  },
  {
    id: '3',
    name: 'Tutorial Series',
    description: 'How-to video series for new features',
    status: 'completed',
    updated_at: '2024-01-10T09:00:00Z',
    scripts_count: 5,
    tasks_count: 20,
  },
]

const stats = [
  { label: 'Active Projects', value: '5', icon: FileText },
  { label: 'Scripts', value: '12', icon: FileText },
  { label: 'Tasks', value: '45', icon: Calendar },
  { label: 'Budget Used', value: '$12.5k', icon: DollarSign },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your video production projects.
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      project.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : project.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {project.scripts_count} scripts
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {project.tasks_count} tasks
                  </div>
                </div>
                <div className="mt-4">
                  <Link href={`/dashboard/projects/${project.id}`}>
                    <Button variant="outline" className="w-full">View Project</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
