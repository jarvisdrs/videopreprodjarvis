'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  FileText,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import * as Tooltip from '@radix-ui/react-tooltip'

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Scripting', href: '/dashboard/scripting', icon: FileText },
  { name: 'Scheduling', href: '/dashboard/scheduling', icon: Calendar },
  { name: 'Budget', href: '/dashboard/budget', icon: DollarSign },
  { name: 'Locations', href: '/dashboard/locations', icon: MapPin },
  { name: 'Team', href: '/dashboard/team', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Tooltip.Provider delayDuration={0}>
      <div
        className={cn(
          'relative flex h-screen flex-col border-r border-border/50 bg-white/80 backdrop-blur-xl transition-all duration-300 dark:bg-slate-950/80',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
          {!collapsed && <span className="font-semibold text-sm text-muted-foreground">Menu</span>}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-accent"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            
            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', !collapsed && 'mr-3')} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
            
            return collapsed ? (
              <Tooltip.Root key={item.name}>
                <Tooltip.Trigger asChild>
                  {linkContent}
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    className="z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                  >
                    {item.name}
                    <Tooltip.Arrow className="fill-primary" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            ) : (
              <div key={item.name}>{linkContent}</div>
            )
          })}
        </nav>
      </div>
    </Tooltip.Provider>
  )
}
