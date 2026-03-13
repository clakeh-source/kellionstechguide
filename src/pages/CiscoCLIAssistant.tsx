import React, { useState, useEffect } from 'react';
import { useToolPage } from '@/hooks/useToolPage';
import { Terminal, Search, Clock, BookOpen, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  NextGenCard, 
  NextGenButton, 
  AIInsightPanel, 
  ToolHeader 
} from '@/components/nextgen/NextGenComponents';
import { parseInput, calculateIPv4Subnet, calculateIPv6Subnet } from '@/lib/subnetUtils';

const quickCommands = [
  { command: 'show ip route', category: 'Routing' },
  { command: 'show running-config', category: 'Config' },
  { command: 'show interfaces', category: 'Interface' },
  { command: 'show vlan brief', category: 'VLAN' },
  { command: 'show ip interface brief', category: 'Interface' },
  { command: 'switchport mode trunk', category: 'Switching' },
  { command: 'subnet calc 192.168.1.0/24', category: 'Subnetting' },
  { command: 'copy running-config startup-config', category: 'Config' },
];

const categories = [
  { id: 'routing', name: 'Routing', icon: '🛣️', examples: ['show ip route', 'router ospf', 'ip route'] },
  { id: 'switching', name: 'Switching', icon: '🔀', examples: ['switchport mode', 'spanning-tree', 'vlan'] },
  { id: 'interface', name: 'Interfaces', icon: '🔌', examples: ['interface', 'show interfaces', 'ip address'] },
  { id: 'security', name: 'Security', icon: '🔒', examples: ['access-list', 'enable secret', 'ssh'] },
  { id: 'subnetting', name: 'Subnetting', icon: '🧮', examples: ['subnet calc 10.0.0.0/8', 'subnet calc 192.168.1.0 255.255.255.0'] },
];

const CiscoCLIAssistant: React.FC = () => {
  useToolPage('cisco-cli-assistant', 'Cisco CLI Assistant');
  const [command, setCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cisco-cli-history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (cmd: string) => {
    const newHistory = [cmd, ...history.filter(h => h !== cmd)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('cisco-cli-history', JSON.stringify(newHistory));
  };

  const handleSearch = async (searchCommand?: string) => {
    const cmdToSearch = searchCommand || command.trim();
    
    if (!cmdToSearch) {
      toast.error('Please enter a command to learn about');
      return;
    }

    setCommand(cmdToSearch);
    setIsLoading(true);
    setResult('');

    // Check for subnet calculation command
    if (cmdToSearch.toLowerCase().startsWith('subnet calc ')) {
      const inputToCalc = cmdToSearch.substring(12).trim();
      const parsed = parseInput(inputToCalc);
      
      if (parsed.type === 'invalid') {
        setResult(`### ❌ Invalid Subnet Format\n\n**Error:** ${parsed.error}\n\n**Examples:**\n- \`subnet calc 192.168.1.0/24\`\n- \`subnet calc 10.0.0.0 255.255.0.0\`\n- \`subnet calc 2001:db8::/64\``);
        setIsLoading(false);
        saveToHistory(cmdToSearch);
        return;
      }

      let markdownResult = '';
      if (parsed.type === 'ipv4-cidr' || parsed.type === 'ipv4-mask') {
        const res = calculateIPv4Subnet(parsed.ip!, parsed.mask!);
        markdownResult = `### 🧮 IPv4 Subnet Calculation Results

**Input:** \`${inputToCalc}\`

| Property | Value |
| :--- | :--- |
| **Network Address** | \`${res.networkAddress}\` |
| **Broadcast Address** | \`${res.broadcastAddress}\` |
| **First Usable IP** | \`${res.firstUsableIP}\` |
| **Last Usable IP** | \`${res.lastUsableIP}\` |
| **Total Hosts** | \`${res.totalHosts}\` |
| **Usable Hosts** | \`${res.usableHosts}\` |
| **Subnet Mask** | \`${res.subnetMask}\` |
| **CIDR Notation** | \`/${res.cidrNotation}\` |
| **Wildcard Mask** | \`${res.wildcardMask}\` |
| **Network Class** | \`${res.networkClass}\` |
| **Type** | \`${res.isPrivate ? 'Private' : 'Public'}\` |

#### Binary Representation
- **IP:** \`${res.ipBinary}\`
- **Mask:** \`${res.maskBinary}\`
`;
      } else if (parsed.type === 'ipv6-cidr') {
        const res = calculateIPv6Subnet(parsed.ip!, parsed.mask as number);
        markdownResult = `### 🧮 IPv6 Subnet Calculation Results

**Input:** \`${inputToCalc}\`

| Property | Value |
| :--- | :--- |
| **Network Prefix** | \`${res.networkPrefix}\` |
| **Interface ID Range** | \`${res.interfaceIdRange}\` |
| **Subnet Size** | \`${res.subnetSizeBits} bits\` |
| **Total Addresses** | \`${res.subnetSizeAddresses}\` |

#### Addressing Tips
${res.addressingTips.map(tip => `- ${tip}`).join('\n')}
`;
      }

      setResult(markdownResult);
      setIsLoading(false);
      saveToHistory(cmdToSearch);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('nextgen-ai', {
        body: {
          toolType: 'cisco-cli-assistant',
          input: cmdToSearch,
        },
      });

      if (error) throw error;
      setResult(data.result);
      saveToHistory(cmdToSearch);
    } catch (error) {
      console.error('Failed to get command info:', error);
      toast.error('Failed to get command information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ToolHeader
          title="Cisco CLI Assistant"
          description="Learn Cisco commands interactively with AI-powered explanations"
          icon={<Terminal className="h-6 w-6" />}
          backLink="/nextgen"
        />

        {/* Search Bar */}
        <NextGenCard glow="violet">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter a Cisco command (e.g., show ip route, switchport mode trunk)"
                className="w-full pl-12 pr-4 py-4 rounded-lg bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 font-mono"
              />
            </div>
            <NextGenButton onClick={() => handleSearch()} loading={isLoading} disabled={isLoading}>
              <Zap className="h-4 w-4 mr-2" />
              Explain
            </NextGenButton>
          </div>
        </NextGenCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Commands */}
            {!result && !isLoading && (
              <NextGenCard glow="none">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-violet-400" />
                  Popular Commands
                </h3>
                <div className="flex flex-wrap gap-2">
                  {quickCommands.map((cmd) => (
                    <button
                      key={cmd.command}
                      onClick={() => handleSearch(cmd.command)}
                      className="px-3 py-2 rounded-lg bg-background/50 border border-border hover:border-violet-500/50 hover:bg-violet-500/10 transition-all group"
                    >
                      <code className="text-sm text-foreground group-hover:text-violet-400 font-mono">
                        {cmd.command}
                      </code>
                    </button>
                  ))}
                </div>
              </NextGenCard>
            )}

            {/* Results */}
            {(result || isLoading) && (
              <AIInsightPanel 
                content={result} 
                loading={isLoading} 
                title={`Command: ${command}`}
              />
            )}

            {/* Categories */}
            {!result && !isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <NextGenCard key={cat.id} glow="none" className="hover:border-violet-500/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <h4 className="font-semibold text-foreground">{cat.name}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.examples.map((ex) => (
                        <button
                          key={ex}
                          onClick={() => handleSearch(ex)}
                          className="px-2 py-1 rounded text-xs bg-muted/50 text-muted-foreground hover:text-violet-400 hover:bg-violet-500/10 transition-colors font-mono"
                        >
                          {ex}
                        </button>
                      ))}
                    </div>
                  </NextGenCard>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* History */}
            <NextGenCard glow="none">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Recent Searches
              </h3>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent searches</p>
              ) : (
                <div className="space-y-2">
                  {history.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSearch(cmd)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-background/30 hover:bg-violet-500/10 hover:border-violet-500/30 border border-transparent transition-all group"
                    >
                      <code className="text-sm text-muted-foreground group-hover:text-violet-400 font-mono">
                        {cmd}
                      </code>
                    </button>
                  ))}
                </div>
              )}
            </NextGenCard>

            {/* Tips */}
            <NextGenCard glow="none">
              <h3 className="text-lg font-semibold text-foreground mb-4">💡 Tips</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-violet-400">•</span>
                  <span>Type any Cisco IOS command to get a detailed explanation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-400">•</span>
                  <span>Include options like &quot;show ip route ospf&quot; for specific info</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-400">•</span>
                  <span>Ask about concepts like &quot;what is HSRP&quot; or &quot;how does STP work&quot;</span>
                </li>
              </ul>
            </NextGenCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CiscoCLIAssistant;
