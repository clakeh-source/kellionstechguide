import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Shield, User, GraduationCap, LayoutDashboard, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

interface DropdownItem {
  name: string;
  href: string;
  description?: string;
  disabled?: boolean;
}

interface NavDropdown {
  label: string;
  items: DropdownItem[];
}

const navDropdowns: NavDropdown[] = [
  {
    label: "Features",
    items: [
      { name: "Subnet Calculator", href: "/subnet-calculator", description: "CIDR, VLSM & IPv6 planning" },
      { name: "Speed Test", href: "/speed-test", description: "Analyze network performance" },
      { name: "DNS Lookup", href: "/tools", description: "Advanced DNS record analysis" },
      { name: "Port Scanner", href: "/tools", description: "Check open ports securely" },
      { name: "All Tools", href: "/tools", description: "View all 15+ network tools" },
    ],
  },
  {
    label: "AI Hub",
    items: [
      { name: "Cisco CLI Assistant", href: "/nextgen/cisco-cli", description: "AI-powered command help" },
      { name: "Switch Migration", href: "/nextgen/switch-migration", description: "Convert configs between platforms" },
      { name: "ACL Builder", href: "/nextgen/acl-builder", description: "Generate secure access lists" },
      { name: "Security Auditor", href: "/nextgen/security-audit", description: "Analyze firewall rules" },
      { name: "NextGen AI Hub", href: "/nextgen", description: "Explore all AI features" },
    ],
  },
  {
    label: "CCNA Prep",
    items: [
      { name: "Learning Lab", href: "/ccna-learning-lab", description: "Structured study roadmap" },
      { name: "Virtual Labs", href: "/labs/virtual-labs", description: "Hands-on CLI practice" },
      { name: "Packet Tracer Labs", href: "/labs/packet-tracer-labs", description: "Network simulations" },
      { name: "Practice Exams", href: "/labs/practice-exams", description: "Test your knowledge" },
    ],
  },
  {
    label: "Resources",
    items: [
      { name: "Network Intelligence", href: "/network-intelligence", description: "Global outage tracking" },
      { name: "Subnetting Guide", href: "/subnetting-guide", description: "Learn subnetting fast" },
      { name: "Blog & Guides", href: "/knowledge", description: "Networking tutorials" },
      { name: "About Us", href: "/about", description: "Our mission and team" },
    ],
  },
];

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const { isAdmin, user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setMobileMenuOpen(false);
      setOpenDropdown(null);
    }, 0);
  }, [location.pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleMouseEnter = useCallback((label: string) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpenDropdown(label);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, label: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpenDropdown((prev) => (prev === label ? null : label));
    }
    if (e.key === "Escape") setOpenDropdown(null);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" aria-label="TechGuide Home">
            <GraduationCap className="h-7 w-7 text-primary transition-transform duration-300 group-hover:scale-110" />
            <span className="text-xl font-bold text-foreground tracking-tight">
              Tech<span className="text-primary">Guide</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-1 list-none m-0 p-0">
            {navDropdowns.map((dropdown) => (
              <li
                key={dropdown.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(dropdown.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
                  aria-haspopup="true"
                  aria-expanded={openDropdown === dropdown.label}
                  onKeyDown={(e) => handleKeyDown(e, dropdown.label)}
                >
                  {dropdown.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      openDropdown === dropdown.label ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown panel */}
                <div
                  className={`absolute top-full left-0 pt-1 transition-all duration-200 ${
                    openDropdown === dropdown.label
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 -translate-y-1 pointer-events-none"
                  }`}
                >
                  <ul className="min-w-[280px] bg-background border border-border rounded-xl shadow-xl py-2 list-none m-0 p-0">
                    {dropdown.items.map((item) => (
                      <li key={item.name}>
                        {item.disabled ? (
                          <span className="block px-4 py-3 text-sm text-muted-foreground/50 cursor-default">
                            <span className="font-medium text-foreground/50 block">{item.name}</span>
                            {item.description && <span className="text-xs mt-0.5 block">{item.description}</span>}
                          </span>
                        ) : (
                          <Link
                            to={item.href}
                            className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            title={item.description || item.name}
                          >
                            <span className="font-medium text-foreground block">{item.name}</span>
                            {item.description && <span className="text-xs mt-0.5 block">{item.description}</span>}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}

            {/* Pricing — direct link */}
            <li>
              <Link
                to="/pricing"
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  location.pathname === "/pricing"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="View Pricing Plans"
              >
                Pricing
              </Link>
            </li>
          </ul>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            {user && <NotificationCenter />}
            {user && isAdmin && (
              <Link to="/admin" title="Admin Dashboard">
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}

            {loading ? (
              <div className="h-9 w-24 bg-secondary/50 animate-pulse rounded-md" />
            ) : user ? (
              <Link to="/dashboard" title="Go to Dashboard">
                <Button size="sm" className="gap-2 bg-gradient-primary hover:opacity-90 shadow-glow">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2"
                  title="Sign In to your account"
                >
                  Sign In
                </Link>
                <Link to="/auth" title="Start your free trial">
                  <Button size="sm" className="bg-gradient-primary hover:opacity-90 shadow-glow gap-2 group">
                    Get Started Free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background z-40 overflow-y-auto">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-2" aria-label="Mobile navigation">
            {navDropdowns.map((dropdown) => (
              <div key={dropdown.label} className="border-b border-border/50 pb-2">
                <button
                  className="flex items-center justify-between w-full px-3 py-3 text-base font-medium text-foreground"
                  onClick={() =>
                    setMobileExpanded((prev) => (prev === dropdown.label ? null : dropdown.label))
                  }
                  aria-expanded={mobileExpanded === dropdown.label}
                >
                  {dropdown.label}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      mobileExpanded === dropdown.label ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {mobileExpanded === dropdown.label && (
                  <ul className="ml-2 mb-2 space-y-1 list-none p-0">
                    {dropdown.items.map((item) => (
                      <li key={item.name}>
                        {item.disabled ? (
                          <span className="block px-4 py-2 text-sm text-muted-foreground/50">
                            {item.name}
                          </span>
                        ) : (
                          <Link
                            to={item.href}
                            className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <span className="font-medium block">{item.name}</span>
                            {item.description && <span className="text-xs opacity-70">{item.description}</span>}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <Link
              to="/pricing"
              className="px-3 py-4 text-base font-medium text-foreground border-b border-border/50"
            >
              Pricing
            </Link>

            <div className="mt-6 flex flex-col gap-3">
              {user && isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" className="w-full gap-2 text-primary border-primary">
                    <Shield className="h-4 w-4" />
                    Admin Panel
                  </Button>
                </Link>
              )}

              {loading ? (
               <div className="h-12 w-full bg-secondary/50 animate-pulse rounded-md" />
              ) : user ? (
                <Link to="/dashboard">
                  <Button className="w-full gap-2 bg-gradient-primary py-6 text-base">
                    <LayoutDashboard className="h-5 w-5" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" className="w-full py-6 text-base">Sign In</Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="w-full bg-gradient-primary gap-2 text-base py-6 group">
                      Get Started Free
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
