import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, ChevronDown, Flame, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { tracks } from "@/data/tracks";
import { cn } from "@/lib/utils";

const vendorLinks = [
  { to: "/tracks/cisco-ccna", label: "Cisco" },
  { to: "/tracks/juniper-jncia", label: "Juniper" },
  { to: "/tracks/fortinet-fca", label: "Fortinet" },
];

const primaryLinks = [
  { to: "/labs", label: "Labs" },
  { to: "/tools", label: "Tools" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
];

export function TopNav() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const initials = user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-forge text-primary-foreground shadow-md">
            <Flame className="h-5 w-5" />
          </span>
          CertForge
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1">
                Tracks <ChevronDown className="h-4 w-4 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel>Certification tracks</DropdownMenuLabel>
              {tracks.map((t) => (
                <DropdownMenuItem key={t.slug} asChild>
                  <Link to={`/tracks/${t.slug}`} className="flex flex-col items-start gap-0.5">
                    <span className="font-medium">{t.title}</span>
                    <span className="text-xs text-muted-foreground">{t.tagline}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/tracks">Compare all tracks →</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {vendorLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn("rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground")
              }
            >
              {l.label}
            </NavLink>
          ))}

          {primaryLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn("rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground")
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/app/dashboard">Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-forge text-primary-foreground">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="normal-case text-xs">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/app/dashboard">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/app/progress">My progress</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/app/profile">Profile</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => signOut()}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/auth"><LogIn className="h-4 w-4" /> Sign in</Link>
              </Button>
              <Button variant="forge" asChild className="hidden sm:inline-flex">
                <Link to="/auth?mode=signup">Start free</Link>
              </Button>
            </>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="mt-8 flex flex-col gap-1">
                <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tracks</p>
                {tracks.map((t) => (
                  <SheetClose asChild key={t.slug}>
                    <Link to={`/tracks/${t.slug}`} className="rounded-md px-3 py-2 text-sm hover:bg-accent">{t.title}</Link>
                  </SheetClose>
                ))}
                <div className="my-3 h-px bg-border" />
                {primaryLinks.map((l) => (
                  <SheetClose asChild key={l.to}>
                    <Link to={l.to} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">{l.label}</Link>
                  </SheetClose>
                ))}
                <div className="my-3 h-px bg-border" />
                {user ? (
                  <SheetClose asChild>
                    <Link to="/app/dashboard" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">Dashboard</Link>
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Link to="/auth" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">Sign in</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/auth?mode=signup" className="mt-2"><Button variant="forge" className="w-full">Start free</Button></Link>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
