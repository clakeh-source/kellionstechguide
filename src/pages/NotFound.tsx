import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="Page not found — CertForge" />
      <section className="container py-24 text-center max-w-md mx-auto">
        <p className="text-sm font-medium text-primary">404</p>
        <h1 className="mt-2 text-4xl font-display font-bold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">That route doesn't exist (yet). Head back to the homepage or pick a track.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline"><Link to="/">Home</Link></Button>
          <Button asChild variant="forge"><Link to="/tracks">Browse tracks</Link></Button>
        </div>
      </section>
    </>
  );
}
