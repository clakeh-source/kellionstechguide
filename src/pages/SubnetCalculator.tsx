import { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { useToolPage } from '@/hooks/useToolPage';
import { Link } from 'react-router-dom';
import { ArrowLeft, Network, Globe, Server, Binary, Shield, Bookmark, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  SubnetInput,
  ResultCard,
  ResultsSection,
  VLSMCalculator,
  SupernetCalculator,
  ExportButton,
  CopyAllButton,
  BeginnerToggle,
  VLSMResults,
  CalculatorTabs,
  TabsContent,
} from '@/components/subnet/SubnetComponents';
import {
  parseInput,
  calculateIPv4Subnet,
  calculateIPv6Subnet,
  calculateVLSM,
  calculateSupernet,
  explanations,
  type IPv4Result,
  type IPv6Result,
  type VLSMSubnet,
} from '@/lib/subnetUtils';

function SubnetVisualizer({ result }: { result: IPv4Result }) {
  const totalHosts = parseInt(result.totalHosts.replace(/,/g, ''));
  
  // Only visualize if it's a reasonable size (e.g., /24 or smaller)
  if (totalHosts > 256) {
    return (
      <Card className="mt-6 border-dashed">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <LayoutGrid className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Visualizer is only available for subnets with 256 or fewer hosts (e.g., /24 to /32).</p>
          <p className="text-sm mt-1">This subnet has {result.totalHosts} hosts.</p>
        </CardContent>
      </Card>
    );
  }

  const networkIpNum = ipToNum(result.networkAddress);
  const blocks = Array.from({ length: totalHosts }, (_, i) => {
    const ip = numToIp(networkIpNum + i);
    let type = 'host';
    if (i === 0) type = 'network';
    else if (i === totalHosts - 1) type = 'broadcast';

    return { ip, type };
  });

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          Subnet Visualizer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Network Address</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Usable Host</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Broadcast Address</span>
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-16 gap-1">
          {blocks.map((block, i) => (
            <div
              key={i}
              title={block.ip}
              className={`aspect-square rounded-sm border flex items-center justify-center text-[8px] sm:text-[10px] cursor-help transition-colors ${
                block.type === 'network' ? 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300' :
                block.type === 'broadcast' ? 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-300' :
                'bg-green-500/10 border-green-500/30 hover:bg-green-500/30 text-green-700 dark:text-green-300'
              }`}
            >
              {block.ip.split('.')[3]}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ipToNum(ip: string): number {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function numToIp(num: number): string {
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.');
}

export default function SubnetCalculator() {
  useToolPage('subnet-calculator', 'Subnet Calculator');
  
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [ipv4Result, setIPv4Result] = useState<IPv4Result | null>(null);
  const [ipv6Result, setIPv6Result] = useState<IPv6Result | null>(null);
  const [vlsmResults, setVLSMResults] = useState<VLSMSubnet[]>([]);
  const [supernetResult, setSupernetResult] = useState<string | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);

  const handleCalculate = () => {
    setError('');
    setIPv4Result(null);
    setIPv6Result(null);

    const parsed = parseInput(input);
    
    if (parsed.type === 'invalid') {
      setError(parsed.error || 'Invalid input');
      return;
    }

    if (parsed.type === 'ipv4-cidr' && parsed.ip && typeof parsed.mask === 'number') {
      const result = calculateIPv4Subnet(parsed.ip, parsed.mask);
      setIPv4Result(result);
    } else if (parsed.type === 'ipv4-mask' && parsed.ip && typeof parsed.mask === 'string') {
      const result = calculateIPv4Subnet(parsed.ip, parsed.mask);
      setIPv4Result(result);
    } else if (parsed.type === 'ipv6-cidr' && parsed.ip && typeof parsed.mask === 'number') {
      const result = calculateIPv6Subnet(parsed.ip, parsed.mask);
      setIPv6Result(result);
    }
  };

  const handleVLSM = (baseNetwork: string, requirements: { name: string; hosts: number }[]) => {
    const parsed = parseInput(baseNetwork + '/24');
    if (parsed.type === 'ipv4-cidr' && parsed.ip) {
      const results = calculateVLSM(parsed.ip, parsed.mask as number, requirements);
      setVLSMResults(results);
    }
  };

  const handleSupernet = (networks: string[]) => {
    const result = calculateSupernet(networks);
    setSupernetResult(result);
  };

  const generateExportText = (): string => {
    let text = '=== Subnet Calculator Results ===\n\n';
    
    if (ipv4Result) {
      text += 'IPv4 Subnet Calculation\n';
      text += '-'.repeat(30) + '\n';
      text += `Network Address: ${ipv4Result.networkAddress}\n`;
      text += `Broadcast Address: ${ipv4Result.broadcastAddress}\n`;
      text += `First Usable IP: ${ipv4Result.firstUsableIP}\n`;
      text += `Last Usable IP: ${ipv4Result.lastUsableIP}\n`;
      text += `Total Hosts: ${ipv4Result.totalHosts}\n`;
      text += `Usable Hosts: ${ipv4Result.usableHosts}\n`;
      text += `Subnet Mask: ${ipv4Result.subnetMask}\n`;
      text += `CIDR Notation: /${ipv4Result.cidrNotation}\n`;
      text += `Wildcard Mask: ${ipv4Result.wildcardMask}\n`;
      text += `Network Class: ${ipv4Result.networkClass}\n`;
      text += `Type: ${ipv4Result.isPrivate ? 'Private' : 'Public'}\n`;
      text += `Reverse DNS: ${ipv4Result.reverseDNS}\n`;
      text += `\nBinary Representations:\n`;
      text += `IP: ${ipv4Result.ipBinary}\n`;
      text += `Mask: ${ipv4Result.maskBinary}\n`;
    }

    if (ipv6Result) {
      text += 'IPv6 Subnet Calculation\n';
      text += '-'.repeat(30) + '\n';
      text += `Network Prefix: ${ipv6Result.networkPrefix}\n`;
      text += `Interface ID Range: ${ipv6Result.interfaceIdRange}\n`;
      text += `Subnet Size: ${ipv6Result.subnetSizeBits} bits (${ipv6Result.subnetSizeAddresses} addresses)\n`;
      text += `Reverse DNS: ${ipv6Result.reverseDNS}\n`;
      text += `\nAddressing Tips:\n`;
      ipv6Result.addressingTips.forEach(tip => {
        text += `  ${tip}\n`;
      });
    }

    if (vlsmResults.length > 0) {
      text += '\nVLSM Breakdown\n';
      text += '-'.repeat(30) + '\n';
      vlsmResults.forEach(r => {
        text += `${r.name}: ${r.networkAddress}/${r.cidr} (${r.allocatedHosts} hosts)\n`;
        text += `  Range: ${r.firstUsable} - ${r.lastUsable}\n`;
      });
    }

    if (supernetResult) {
      text += `\nSupernet Result: ${supernetResult}\n`;
    }

    return text;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Subnet Calculator — CIDR, VLSM & Supernetting | TechGuide"
        description="Free online subnet calculator with CIDR notation, VLSM planning, supernet aggregation, and IPv6 support. Built for network engineers."
      />
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <Network className="w-5 h-5 text-primary" />
                  Subnet Calculator
                </h1>
                <p className="text-sm text-muted-foreground">IPv4 & IPv6 subnet calculations made easy</p>
              </div>
            </div>
            <BeginnerToggle 
              enabled={showExplanations} 
              onToggle={() => setShowExplanations(!showExplanations)} 
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <CalculatorTabs>
          {/* Main Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enter IP Address or Subnet</CardTitle>
              </CardHeader>
              <CardContent>
                <SubnetInput
                  value={input}
                  onChange={setInput}
                  onCalculate={handleCalculate}
                  error={error}
                />
              </CardContent>
            </Card>

            {/* IPv4 Results */}
            {ipv4Result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      IPv4
                    </Badge>
                    <Badge variant={ipv4Result.isPrivate ? "secondary" : "default"}>
                      {ipv4Result.isPrivate ? 'Private' : 'Public'}
                    </Badge>
                    <Badge variant="outline">
                      Class {ipv4Result.networkClass}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <CopyAllButton data={generateExportText()} />
                    <ExportButton data={generateExportText()} />
                  </div>
                </div>

                <ResultsSection 
                  title="Address Information" 
                  icon={<Globe className="w-5 h-5 text-primary" />}
                >
                  <ResultCard
                    label="Network Address"
                    value={ipv4Result.networkAddress}
                    explanation={explanations.networkAddress}
                    showExplanations={showExplanations}
                  />
                  <ResultCard
                    label="Broadcast Address"
                    value={ipv4Result.broadcastAddress}
                    explanation={explanations.broadcastAddress}
                    showExplanations={showExplanations}
                  />
                  <ResultCard
                    label="First Usable IP"
                    value={ipv4Result.firstUsableIP}
                    explanation={explanations.firstUsableIP}
                    showExplanations={showExplanations}
                  />
                  <ResultCard
                    label="Last Usable IP"
                    value={ipv4Result.lastUsableIP}
                    explanation={explanations.lastUsableIP}
                    showExplanations={showExplanations}
                  />
                </ResultsSection>

                <ResultsSection 
                  title="Host Information" 
                  icon={<Server className="w-5 h-5 text-primary" />}
                >
                  <ResultCard
                    label="Total Hosts"
                    value={ipv4Result.totalHosts}
                    explanation={explanations.totalHosts}
                    showExplanations={showExplanations}
                  />
                  <ResultCard
                    label="Usable Hosts"
                    value={ipv4Result.usableHosts}
                    explanation={explanations.usableHosts}
                    showExplanations={showExplanations}
                  />
                </ResultsSection>

                <ResultsSection 
                  title="Subnet Masks" 
                  icon={<Shield className="w-5 h-5 text-primary" />}
                >
                  <ResultCard
                    label="Subnet Mask"
                    value={ipv4Result.subnetMask}
                    explanation={explanations.subnetMask}
                    showExplanations={showExplanations}
                  />
                  <ResultCard
                    label="CIDR Notation"
                    value={`/${ipv4Result.cidrNotation}`}
                    explanation={explanations.cidrNotation}
                    showExplanations={showExplanations}
                  />
                  <ResultCard
                    label="Wildcard Mask"
                    value={ipv4Result.wildcardMask}
                    explanation={explanations.wildcardMask}
                    showExplanations={showExplanations}
                  />
                </ResultsSection>

                <ResultsSection 
                  title="Binary Representations" 
                  icon={<Binary className="w-5 h-5 text-primary" />}
                  defaultOpen={false}
                >
                  <ResultCard
                    label="IP Address (Binary)"
                    value={ipv4Result.ipBinary}
                    showExplanations={showExplanations}
                    isBinary
                    className="md:col-span-2"
                  />
                  <ResultCard
                    label="Subnet Mask (Binary)"
                    value={ipv4Result.maskBinary}
                    showExplanations={showExplanations}
                    isBinary
                    className="md:col-span-2"
                  />
                </ResultsSection>

                <ResultsSection 
                  title="Classification & DNS" 
                  icon={<Bookmark className="w-5 h-5 text-primary" />}
                >
                  <ResultCard
                    label="Network Class"
                    value={ipv4Result.networkClass}
                    explanation={explanations.networkClass}
                    showExplanations={showExplanations}
                  />
                  <ResultCard
                    label="Address Type"
                    value={ipv4Result.isPrivate}
                    explanation={explanations.isPrivate}
                    showExplanations={showExplanations}
                  />
                  <ResultCard
                    label="Reverse DNS Zone"
                    value={ipv4Result.reverseDNS}
                    explanation={explanations.reverseDNS}
                    showExplanations={showExplanations}
                    className="md:col-span-2"
                  />
                </ResultsSection>

                <SubnetVisualizer result={ipv4Result} />
              </div>
            )}

            {/* IPv6 Results */}
            {ipv6Result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-sm">IPv6</Badge>
                  <div className="flex gap-2">
                    <CopyAllButton data={generateExportText()} />
                    <ExportButton data={generateExportText()} />
                  </div>
                </div>

                <ResultsSection 
                  title="Network Information" 
                  icon={<Globe className="w-5 h-5 text-primary" />}
                >
                  <ResultCard
                    label="Network Prefix"
                    value={ipv6Result.networkPrefix}
                    showExplanations={showExplanations}
                    className="md:col-span-2"
                  />
                  <ResultCard
                    label="Interface ID Range"
                    value={ipv6Result.interfaceIdRange}
                    showExplanations={showExplanations}
                    className="md:col-span-2"
                  />
                  <ResultCard
                    label="Subnet Size (bits)"
                    value={`${ipv6Result.subnetSizeBits} host bits`}
                    showExplanations={showExplanations}
                  />
                  <ResultCard
                    label="Total Addresses"
                    value={ipv6Result.subnetSizeAddresses}
                    showExplanations={showExplanations}
                  />
                  <ResultCard
                    label="Reverse DNS Zone"
                    value={ipv6Result.reverseDNS}
                    showExplanations={showExplanations}
                    className="md:col-span-2"
                  />
                </ResultsSection>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Addressing Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {ipv6Result.addressingTips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{tip}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* VLSM Tab */}
          <TabsContent value="vlsm" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Variable Length Subnet Masking (VLSM)</CardTitle>
              </CardHeader>
              <CardContent>
                <VLSMCalculator onCalculate={handleVLSM} />
              </CardContent>
            </Card>

            {vlsmResults.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">VLSM Breakdown Results</CardTitle>
                    <div className="flex gap-2">
                      <CopyAllButton data={generateExportText()} />
                      <ExportButton data={generateExportText()} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <VLSMResults results={vlsmResults} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Supernet Tab */}
          <TabsContent value="supernet" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CIDR Aggregation (Supernetting)</CardTitle>
              </CardHeader>
              <CardContent>
                <SupernetCalculator onCalculate={handleSupernet} />
              </CardContent>
            </Card>

            {supernetResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Aggregated Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Supernet</p>
                    <p className="text-2xl font-mono font-semibold">{supernetResult}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    This single route summarizes all the networks you entered, reducing routing table size.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </CalculatorTabs>
      </main>
    </div>
  );
}
