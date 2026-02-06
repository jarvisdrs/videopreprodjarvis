'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/auth/user-menu'

interface NavbarProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

export function Navbar({ user }: NavbarProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:bg-slate-950/80">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <a href="/dashboard" className="mr-6 flex items-center space-x-2 group">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Film className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl">VideoPreProd AI</span>
          </a>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-pressed={theme === 'dark'}
              aria-label="Toggle dark mode"
              className="hover:bg-accent"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {user && <UserMenu user={user} />}
          </div>
        </div>
      </div>
    </header>
  )
}
