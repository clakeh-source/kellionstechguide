import { Link } from "react-router-dom";
import { Flame } from "lucide-react";
import { tracks } from "@/data/tracks";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-muted/30">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-forge text-primary-foreground">
              <Flame className="h-5 w-5" />
            </span>
            CertForge
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">Forge your networking certifications with hands-on labs and AI-guided study.</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Tracks</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {tracks.map((t) => (
              <li key={t.slug}><Link to={`/tracks/${t.slug}`} className="hover:text-foreground">{t.title}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Learn</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/labs" className="hover:text-foreground">Labs</Link></li>
            <li><Link to="/labs/practice-exams" className="hover:text-foreground">Practice exams</Link></li>
            <li><Link to="/tools" className="hover:text-foreground">Tools</Link></li>
            <li><Link to="/blog" className="hover:text-foreground">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Company</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} CertForge. All rights reserved.</p>
          <p>Forge your career — one cert at a time.</p>
        </div>
      </div>
    </footer>
  );
}
