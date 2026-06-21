import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { RootLayout } from "@/components/layout/RootLayout";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Skeleton } from "@/components/ui/skeleton";

const Home = lazy(() => import("@/pages/Home"));
const TracksIndex = lazy(() => import("@/pages/TracksIndex"));
const TrackPage = lazy(() => import("@/pages/TrackPage"));
const Labs = lazy(() => import("@/pages/Labs"));
const LabsVirtual = lazy(() => import("@/pages/LabsVirtual"));
const LabsPacketTracer = lazy(() => import("@/pages/LabsPacketTracer"));
const LabsExams = lazy(() => import("@/pages/LabsExams"));
const Tools = lazy(() => import("@/pages/Tools"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const About = lazy(() => import("@/pages/About"));
const Blog = lazy(() => import("@/pages/Blog"));
const Contact = lazy(() => import("@/pages/Contact"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const Auth = lazy(() => import("@/pages/Auth"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const Dashboard = lazy(() => import("@/pages/app/Dashboard"));
const MyTracks = lazy(() => import("@/pages/app/MyTracks"));
const MyTrack = lazy(() => import("@/pages/app/MyTrack"));
const MyLabs = lazy(() => import("@/pages/app/MyLabs"));
const MyExams = lazy(() => import("@/pages/app/MyExams"));
const MyNotes = lazy(() => import("@/pages/app/MyNotes"));
const MyProgress = lazy(() => import("@/pages/app/MyProgress"));
const MyTools = lazy(() => import("@/pages/app/MyTools"));
const MyProfile = lazy(() => import("@/pages/app/MyProfile"));
const MySettings = lazy(() => import("@/pages/app/MySettings"));

const queryClient = new QueryClient();

function Loading() {
  return (
    <div className="container py-16 space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<Home />} />
              <Route path="tracks" element={<TracksIndex />} />
              <Route path="tracks/:slug" element={<TrackPage />} />
              <Route path="labs" element={<Labs />} />
              <Route path="labs/virtual" element={<LabsVirtual />} />
              <Route path="labs/packet-tracer" element={<LabsPacketTracer />} />
              <Route path="labs/practice-exams" element={<LabsExams />} />
              <Route path="tools" element={<Tools />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="about" element={<About />} />
              <Route path="blog" element={<Blog />} />
              <Route path="contact" element={<Contact />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="auth" element={<Auth />} />
            </Route>

            <Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tracks" element={<MyTracks />} />
              <Route path="tracks/:slug" element={<MyTrack />} />
              <Route path="labs" element={<MyLabs />} />
              <Route path="exams" element={<MyExams />} />
              <Route path="notes" element={<MyNotes />} />
              <Route path="progress" element={<MyProgress />} />
              <Route path="tools" element={<MyTools />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="settings" element={<MySettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
