export type Vendor = "cisco-ccna" | "juniper-jncia" | "fortinet-fca" | "fortinet-nse4";

export interface Track {
  slug: Vendor;
  vendor: "Cisco" | "Juniper" | "Fortinet";
  exam: string;
  title: string;
  tagline: string;
  accent: "cisco" | "juniper" | "fortinet";
  duration: string;
  modules: { title: string; topics: string[] }[];
}

export const tracks: Track[] = [
  {
    slug: "cisco-ccna",
    vendor: "Cisco",
    exam: "200-301",
    title: "Cisco CCNA 200-301",
    tagline: "The world's most respected entry-level networking certification.",
    accent: "cisco",
    duration: "10–14 weeks",
    modules: [
      { title: "Network Fundamentals", topics: ["OSI & TCP/IP", "Cabling & topologies", "IPv4 & IPv6 addressing", "Subnetting & VLSM"] },
      { title: "Network Access", topics: ["VLANs & trunking", "EtherChannel / LACP", "STP & RSTP", "Wireless fundamentals (WLC)"] },
      { title: "IP Connectivity", topics: ["Static routing", "OSPFv2 single-area", "FHRP (HSRP/VRRP/GLBP)", "Routing decision process"] },
      { title: "IP Services", topics: ["NAT/PAT", "NTP, DHCP, DNS", "SNMP, Syslog", "QoS basics"] },
      { title: "Security Fundamentals", topics: ["AAA, 802.1X", "Port security & DHCP snooping", "ACLs (standard & extended)", "Site-to-site VPN concepts"] },
      { title: "Automation & Programmability", topics: ["SDN concepts", "REST APIs & JSON", "Python / Netmiko basics", "Ansible & Git"] },
    ],
  },
  {
    slug: "juniper-jncia",
    vendor: "Juniper",
    exam: "JN0-105",
    title: "Juniper JNCIA-Junos",
    tagline: "Master Junos OS — the foundation of every Juniper certification.",
    accent: "juniper",
    duration: "6–8 weeks",
    modules: [
      { title: "Networking Fundamentals", topics: ["Protocol stack", "Ethernet & switching", "IPv4/IPv6", "Routing basics"] },
      { title: "Junos OS Fundamentals", topics: ["Architecture", "Software releases", "Routing engine vs PFE"] },
      { title: "User Interfaces", topics: ["CLI modes & operators", "J-Web overview", "Configuration hierarchy"] },
      { title: "Configuration Basics", topics: ["Candidate vs active config", "Commit, rollback, compare", "Interfaces & logical units"] },
      { title: "Operational Monitoring", topics: ["show commands", "monitor traffic", "Syslog & SNMP"] },
      { title: "Routing Fundamentals", topics: ["Routing tables", "Static routes", "OSPF basics on Junos"] },
    ],
  },
  {
    slug: "fortinet-fca",
    vendor: "Fortinet",
    exam: "FCA / FCF",
    title: "Fortinet FCA / FCF",
    tagline: "Cybersecurity foundations and the FortiGate fundamentals.",
    accent: "fortinet",
    duration: "4–6 weeks",
    modules: [
      { title: "Cybersecurity Foundations", topics: ["Threat landscape", "Attack types", "Defense in depth"] },
      { title: "FortiGate Introduction", topics: ["Initial setup (GUI & CLI)", "Administrative access", "Firmware management"] },
      { title: "Firewall Policies", topics: ["Policy structure", "NAT", "Logging & monitoring"] },
      { title: "Security Profiles", topics: ["Antivirus", "Web filter", "Application control"] },
      { title: "User Authentication", topics: ["Local users", "LDAP / RADIUS", "Captive portal"] },
      { title: "SSL & IPsec VPN basics", topics: ["SSL VPN portals", "Site-to-site IPsec", "Troubleshooting"] },
    ],
  },
  {
    slug: "fortinet-nse4",
    vendor: "Fortinet",
    exam: "NSE 4 / FCP",
    title: "Fortinet NSE 4 / FCP",
    tagline: "FortiGate Security & Infrastructure — the professional-level firewall cert.",
    accent: "fortinet",
    duration: "8–12 weeks",
    modules: [
      { title: "System & Networking", topics: ["Routing on FortiGate", "SD-WAN", "HA clusters"] },
      { title: "Firewall & NAT", topics: ["Central NAT", "Virtual IPs", "Policy routing"] },
      { title: "Authentication", topics: ["FSSO", "Two-factor (FortiToken)", "Certificate-based auth"] },
      { title: "SSL/IPsec VPN", topics: ["Dial-up VPN", "Hub-and-spoke", "ADVPN"] },
      { title: "Security Profiles (deep dive)", topics: ["IPS", "DLP", "SSL inspection"] },
      { title: "Diagnostics & Logging", topics: ["diag commands", "Packet sniffer", "FortiAnalyzer integration"] },
    ],
  },
];

export const tracksBySlug = Object.fromEntries(tracks.map((t) => [t.slug, t]));
