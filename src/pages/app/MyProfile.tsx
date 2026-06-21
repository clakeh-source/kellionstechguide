import { SEO } from "@/components/SEO";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export default function MyProfile() {
  const { user } = useAuth();
  return (
    <>
      <SEO title="Profile — CertForge" />
      <section className="container py-10 space-y-6 max-w-2xl">
        <h1 className="text-3xl font-display font-bold">Profile</h1>
        <Card>
          <CardHeader><CardTitle className="text-lg">Account</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-gradient-forge text-primary-foreground text-lg">
                {user?.email?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-muted-foreground">Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : ""}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
