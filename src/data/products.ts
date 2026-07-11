import { FlaskConical, FileQuestion, Network, LucideIcon } from "lucide-react";

export type ProductSlug = "cisco-network-simulator" | "cisco-practice-exams" | "cisco-practice-labs";

export interface PricingTier {
  id: string;
  name: string;
  priceCents: number;
  description: string;
  highlighted?: boolean;
}

export interface Product {
  slug: ProductSlug;
  name: string;
  tagline: string;
  summary: string;
  icon: LucideIcon;
  accent: "cisco";
  fromPriceCents: number;
  features: string[];
  details: { heading: string; body: string }[];
  tiers: PricingTier[];
  extras?: Record<string, string | string[]>;
}

export const products: Product[] = [
  {
    slug: "cisco-network-simulator",
    name: "Cisco Network Simulator",
    tagline: "Build topologies. Break things. Fix them. No rack required.",
    summary:
      "A browser-based virtual lab environment for practicing Cisco router and switch configurations without physical hardware.",
    icon: Network,
    accent: "cisco",
    fromPriceCents: 4900,
    features: [
      "Drag-and-drop topology builder",
      "Realistic IOS CLI simulation",
      "Pre-built labs for common scenarios",
      "Save, load, and share configs",
      "Instant device recovery — no boot waits",
    ],
    details: [
      { heading: "Topology builder", body: "Drop routers, switches, and end hosts on a canvas, then wire them up. Devices boot in seconds." },
      { heading: "CLI simulation", body: "A vendor-accurate IOS-style parser. Prompt modes, help text, and error messages match the real gear." },
      { heading: "Pre-built labs", body: "Twenty starter labs covering interfaces, VLANs, routing, and ACLs — ready to open with one click." },
      { heading: "Save / load configs", body: "Snapshot any device or the whole topology. Export as text for portfolio work or handoffs." },
    ],
    tiers: [
      { id: "single", name: "Single license", priceCents: 4900, description: "One learner. All features." },
      { id: "pair", name: "3-license bundle", priceCents: 11900, description: "Save 20% for study groups.", highlighted: true },
      { id: "team", name: "10-license team", priceCents: 34900, description: "Best for cohorts and small teams." },
    ],
  },
  {
    slug: "cisco-practice-exams",
    name: "Cisco Practice Exams",
    tagline: "Timed, blueprint-mapped mock exams for the Cisco tracks that hire.",
    summary:
      "Full-length practice tests mapped to Cisco certification blueprints, with detailed score history and weak-area analysis.",
    icon: FileQuestion,
    accent: "cisco",
    fromPriceCents: 2900,
    features: [
      "1,200+ questions across CCNA and CCNP tracks",
      "Practice mode with explanations",
      "Timed / simulated exam mode",
      "Score history and weak-area tracking",
      "Sample question preview before you buy",
    ],
    details: [
      { heading: "Exam modes", body: "Practice mode reveals answers and explanations as you go. Simulated mode mirrors the real timer and scoring." },
      { heading: "Performance tracking", body: "Every attempt is stored. Trend lines by domain show exactly where to spend the next hour." },
      { heading: "Sample preview", body: "Try five sample questions from each track before purchase — no signup needed." },
    ],
    tiers: [
      { id: "ccna", name: "CCNA question bank", priceCents: 2900, description: "600+ questions, 4 full mocks." },
      { id: "ccnp", name: "CCNP question bank", priceCents: 4900, description: "600+ questions, 4 full mocks.", highlighted: true },
      { id: "bundle", name: "CCNA + CCNP bundle", priceCents: 6900, description: "Everything, save 15%." },
    ],
    extras: {
      questionCount: "1,200+",
      modes: ["Practice (with explanations)", "Timed simulation", "Custom domain drills"],
    },
  },
  {
    slug: "cisco-practice-labs",
    name: "Cisco Practice Labs",
    tagline: "Structured, guided lab exercises with objectives and validation checks.",
    summary:
      "Step-by-step guided labs for Cisco certification paths — objectives, hints, and automatic validation on every task.",
    icon: FlaskConical,
    accent: "cisco",
    fromPriceCents: 3900,
    features: [
      "80+ guided lab modules",
      "Skill-level indicator per lab (Foundations → Pro)",
      "Objective-based tasks with validation checks",
      "Progress tracking across the whole track",
      "Downloadable lab guides (PDF)",
    ],
    details: [
      { heading: "Lab topics", body: "Covers VLANs & trunking, EtherChannel, STP, OSPF, EIGRP, NAT, ACLs, DHCP, wireless, and automation basics." },
      { heading: "Skill levels", body: "Every lab is tagged Foundations, Practitioner, or Pro so you always know what you're stepping into." },
      { heading: "Progress tracking", body: "A dashboard shows completed tasks, current lab, and a suggested next lab based on your track." },
    ],
    tiers: [
      { id: "ccna-labs", name: "CCNA lab set", priceCents: 3900, description: "40 guided labs for CCNA 200-301." },
      { id: "ccnp-labs", name: "CCNP lab set", priceCents: 5900, description: "40 guided labs for CCNP ENCOR/ENARSI.", highlighted: true },
      { id: "all-labs", name: "All Cisco labs", priceCents: 8900, description: "Both sets, save 10%." },
    ],
  },
];

export const productsBySlug = Object.fromEntries(products.map((p) => [p.slug, p])) as Record<ProductSlug, Product>;

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100);
}
