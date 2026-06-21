import { SEO } from "@/components/SEO";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function MySettings() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  async function handleSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }
  return (
    <>
      <SEO title="Settings — CertForge" />
      <section className="container py-10 space-y-6 max-w-2xl">
        <h1 className="text-3xl font-display font-bold">Settings</h1>
        <Card>
          <CardHeader><CardTitle className="text-lg">Session</CardTitle></CardHeader>
          <CardContent><Button variant="outline" onClick={handleSignOut}>Sign out</Button></CardContent>
        </Card>
      </section>
    </>
  );
}
