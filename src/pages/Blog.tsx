import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

const posts = [
  { title: "How to subnet in under 60 seconds", excerpt: "A repeatable mental model that works on every CCNA question.", tag: "Cisco" },
  { title: "Junos commit confirmed: the safety net you should always use", excerpt: "Roll back automatically if you lock yourself out.", tag: "Juniper" },
  { title: "FortiGate policy ordering: top-down really matters", excerpt: "The most common policy bug, and how to avoid it.", tag: "Fortinet" },
];

export default function Blog() {
  return (
    <>
      <SEO title="Blog — CertForge" description="Networking tips, certification study guides, and vendor deep-dives." />
      <section className="container py-16">
        <header className="max-w-2xl mb-12 space-y-3">
          <Badge variant="outline">Blog</Badge>
          <h1 className="text-4xl font-display font-bold tracking-tight">Field notes from the network</h1>
          <p className="text-muted-foreground">Short, vendor-accurate posts that compound into real skill.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((p) => (
            <Card key={p.title}>
              <CardHeader>
                <Badge variant="outline" className="w-fit">{p.tag}</Badge>
                <CardTitle className="mt-2 text-lg">{p.title}</CardTitle>
                <CardDescription>{p.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">Full archive coming soon.</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
