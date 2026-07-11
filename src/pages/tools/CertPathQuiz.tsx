import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";

type Track = "ccna" | "jncia" | "fca" | "nse4";

interface Choice { label: string; weights: Partial<Record<Track, number>> }
interface Question { q: string; choices: Choice[] }

const questions: Question[] = [
  {
    q: "What best describes your current experience?",
    choices: [
      { label: "New to networking — I want strong foundations.", weights: { ccna: 3, jncia: 2, fca: 2 } },
      { label: "Comfortable with the basics — I want a job-ready cert.", weights: { ccna: 3, fca: 2, jncia: 1 } },
      { label: "I already work in networking — I want to specialize.", weights: { nse4: 3, jncia: 2 } },
    ],
  },
  {
    q: "Which vendor dominates the job market you're targeting?",
    choices: [
      { label: "Cisco — most postings I see mention it.", weights: { ccna: 4 } },
      { label: "Juniper — service-provider or data-center focus.", weights: { jncia: 4 } },
      { label: "Fortinet — security-first shops and MSPs.", weights: { fca: 3, nse4: 3 } },
      { label: "Not sure yet.", weights: { ccna: 2, fca: 1, jncia: 1 } },
    ],
  },
  {
    q: "How much time can you commit each week?",
    choices: [
      { label: "5 hours or less — I need a shorter path.", weights: { fca: 3, jncia: 2 } },
      { label: "6–10 hours.", weights: { ccna: 2, jncia: 2, fca: 2 } },
      { label: "10+ hours — I'm going hard.", weights: { ccna: 3, nse4: 3 } },
    ],
  },
  {
    q: "What excites you most?",
    choices: [
      { label: "Routing, switching, and CLI configuration.", weights: { ccna: 3, jncia: 3 } },
      { label: "Firewalls, VPNs, and network security.", weights: { fca: 3, nse4: 3 } },
      { label: "Automation and modern network operations.", weights: { ccna: 2, jncia: 2 } },
    ],
  },
  {
    q: "Which best describes your goal?",
    choices: [
      { label: "First networking job or internship.", weights: { ccna: 3, fca: 2 } },
      { label: "Promotion at my current company.", weights: { nse4: 2, ccna: 2, jncia: 2 } },
      { label: "Career pivot into cybersecurity.", weights: { fca: 3, nse4: 3 } },
    ],
  },
];

const trackInfo: Record<Track, { title: string; blurb: string; to: string }> = {
  ccna: { title: "Cisco CCNA 200-301", blurb: "The most respected entry-level networking cert. Broad, deep, and job-friendly.", to: "/tracks/cisco-ccna" },
  jncia: { title: "Juniper JNCIA-Junos", blurb: "The fastest path into service-provider and Juniper-shop networking.", to: "/tracks/juniper-jncia" },
  fca: { title: "Fortinet FCA / FCF", blurb: "Cybersecurity foundations plus FortiGate fundamentals. Short, focused, high value.", to: "/tracks/fortinet-fca" },
  nse4: { title: "Fortinet NSE 4 / FCP", blurb: "Professional-level FortiGate security & infrastructure. Best if you already work with firewalls.", to: "/tracks/fortinet-nse4" },
};

export default function CertPathQuiz() {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));

  const result = useMemo(() => {
    if (answers.some((a) => a === null)) return null;
    const totals: Record<Track, number> = { ccna: 0, jncia: 0, fca: 0, nse4: 0 };
    answers.forEach((choiceIndex, qIndex) => {
      const choice = questions[qIndex].choices[choiceIndex!];
      for (const [track, weight] of Object.entries(choice.weights)) {
        totals[track as Track] += weight as number;
      }
    });
    const winner = (Object.entries(totals) as [Track, number][]).sort((a, b) => b[1] - a[1])[0][0];
    return { winner, totals };
  }, [answers]);

  const answered = answers.filter((a) => a !== null).length;

  return (
    <>
      <SEO title="Certification Path Quiz — Free Tools — CertForge" description="Answer five quick questions and get a tailored networking certification recommendation." />
      <section className="container py-10">
        <Link to="/free-tools" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All free tools
        </Link>
      </section>
      <section className="container pb-16 space-y-6 max-w-3xl">
        <header className="space-y-3">
          <Badge variant="outline">Free tool</Badge>
          <h1 className="text-3xl font-display font-bold tracking-tight">Which certification should I study for?</h1>
          <p className="text-muted-foreground">Five quick questions. One clear recommendation. Your answers stay in this browser.</p>
          <p className="text-xs text-muted-foreground">{answered} of {questions.length} answered</p>
        </header>

        <div className="space-y-4">
          {questions.map((question, qi) => (
            <Card key={qi}>
              <CardHeader><CardTitle className="text-base">Q{qi + 1}. {question.q}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {question.choices.map((choice, ci) => {
                  const active = answers[qi] === ci;
                  return (
                    <button
                      key={ci}
                      onClick={() => setAnswers((prev) => prev.map((v, i) => (i === qi ? ci : v)))}
                      className={cn(
                        "w-full text-left rounded-md border px-3 py-2 text-sm transition-colors",
                        active ? "border-primary bg-accent/40 text-foreground" : "border-border hover:border-primary/40 text-muted-foreground"
                      )}
                    >
                      {choice.label}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {result && (
          <Card className="border-primary/40">
            <CardHeader>
              <Badge variant="outline" className="w-fit border-primary/40 text-primary">Recommended track</Badge>
              <CardTitle className="mt-2">{trackInfo[result.winner].title}</CardTitle>
              <CardDescription>{trackInfo[result.winner].blurb}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="forge" asChild><Link to={trackInfo[result.winner].to}>View this track</Link></Button>
              <Button variant="outline" onClick={() => setAnswers(questions.map(() => null))}>
                <RotateCcw className="h-4 w-4" /> Retake quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  );
}
