import { Link } from "react-router-dom";
import { GraduationCap, ExternalLink, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  features: [
    { name: "Subnet Calculator", href: "/subnet-calculator", title: "Calculate IPv4 and IPv6 subnets" },
    { name: "Speed Test", href: "/speed-test", title: "Test your network speed" },
    { name: "DNS Lookup", href: "/tools", title: "Perform advanced DNS lookups" },
    { name: "Port Scanner", href: "/tools", title: "Scan for open network ports" },
    { name: "All Network Tools", href: "/tools", title: "View all networking tools" },
  ],
  aiHub: [
    { name: "Cisco CLI Assistant", href: "/nextgen/cisco-cli", title: "AI-powered Cisco CLI help" },
    { name: "Switch Migration", href: "/nextgen/switch-migration", title: "Migrate switch configurations" },
    { name: "ACL Builder", href: "/nextgen/acl-builder", title: "Generate Access Control Lists" },
    { name: "Security Auditor", href: "/nextgen/security-audit", title: "Audit network security rules" },
    { name: "NextGen AI Hub", href: "/nextgen", title: "Explore all AI networking features" },
  ],
  ccnaPrep: [
    { name: "CCNA Learning Lab", href: "/ccna-learning-lab", title: "Comprehensive CCNA study roadmap" },
    { name: "Virtual Labs", href: "/labs/virtual-labs", title: "Hands-on virtual networking labs" },
    { name: "Packet Tracer Labs", href: "/labs/packet-tracer-labs", title: "Cisco Packet Tracer scenarios" },
    { name: "Practice Exams", href: "/labs/practice-exams", title: "CCNA practice tests and quizzes" },
    { name: "Subnetting Guide", href: "/subnetting-guide", title: "Learn subnetting step-by-step" },
  ],
  company: [
    { name: "About Us", href: "/about", title: "Learn about TechGuide" },
    { name: "Pricing", href: "/pricing", title: "View our pricing plans" },
    { name: "Blog & Guides", href: "/knowledge", title: "Networking blog and study guides" },
    { name: "Contact & Support", href: "/contact", title: "Get in touch with our support team" },
    { name: "Privacy Policy", href: "/privacy", title: "Read our privacy policy" },
    { name: "Terms of Service", href: "/terms", title: "Read our terms of service" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4" title="TechGuide Home">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground tracking-tight">
                Tech<span className="text-primary">Guide</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              Your ultimate CCNA certification partner. Study smarter with guided learning paths, 
              hands-on labs, AI-powered tools, and comprehensive exam prep.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link to="/auth" title="Start your free trial">
                <Button className="bg-gradient-primary hover:opacity-90 shadow-glow gap-2 group w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            <a
              href="mailto:support@kellions.com"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              title="Email Support"
            >
              <Mail className="h-4 w-4" />
              support@kellions.com
            </a>
          </div>

          {/* Features & Tools */}
          <nav aria-label="Features and Tools">
            <h4 className="font-semibold text-foreground mb-4">Features</h4>
            <ul className="space-y-2.5 list-none m-0 p-0">
              {footerLinks.features.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} title={link.title} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* AI Hub */}
          <nav aria-label="AI Hub">
            <h4 className="font-semibold text-foreground mb-4">AI Hub</h4>
            <ul className="space-y-2.5 list-none m-0 p-0">
              {footerLinks.aiHub.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} title={link.title} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* CCNA Prep */}
          <nav aria-label="CCNA Preparation">
            <h4 className="font-semibold text-foreground mb-4">CCNA Prep</h4>
            <ul className="space-y-2.5 list-none m-0 p-0">
              {footerLinks.ccnaPrep.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} title={link.title} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company & Resources */}
          <nav aria-label="Company and Resources">
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2.5 list-none m-0 p-0">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} title={link.title} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TechGuide by Kellions. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://www.facebook.com/222761610914577"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Follow us on Facebook"
                title="TechGuide Facebook Page"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://kellions.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                title="Visit Kellions Corporate Site"
              >
                kellions.com
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
