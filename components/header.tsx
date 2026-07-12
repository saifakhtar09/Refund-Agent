'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Moon,
  Sun,
  Bot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/policy', label: 'Refund Policy', icon: FileText },
];

export function Header() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">

        {/* Brand */}
        <div className="flex items-center gap-3 mr-10">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 shadow-lg shadow-indigo-500/20">
            <Bot className="h-5 w-5 text-white" />
            <span className="absolute inset-0 rounded-xl animate-pulse bg-white/10" />
          </div>

          <div className="leading-tight">
            <h1 className="text-sm font-semibold tracking-tight">
              AI Support Agent
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Refund Processing System
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative group flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active background pill */}
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 shadow-md" />
                )}

                {/* Hover glow */}
                <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-muted transition" />

                <item.icon className="h-4 w-4 relative z-10" />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(theme === 'dark' ? 'light' : 'dark')
            }
            className="relative h-9 w-9 rounded-xl hover:bg-muted transition"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {/* bottom glow line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
    </header>
  );
}