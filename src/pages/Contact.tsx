import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Contact() {
  return (
    <>
      <SEO title="Contact — CertForge" description="Get in touch with the CertForge team." />
      <section className="container py-16 max-w-xl">
        <Badge variant="outline">Contact</Badge>
        <h1 className="mt-3 text-4xl font-display font-bold tracking-tight">Talk to us</h1>
        <p className="mt-2 text-muted-foreground">Questions about tracks, teams, or partnerships — we usually reply within a business day.</p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Thanks — we'll get back to you shortly.");
            (e.target as HTMLFormElement).reset();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <textarea id="message" required rows={5} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <Button type="submit" variant="forge">Send message</Button>
        </form>
      </section>
    </>
  );
}
