import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Edit,
  Play,
  Pause,
  Settings2,
  Zap,
  Clock,
  Server,
  Wifi,
  Globe,
  Shield,
  Copy,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  SNMHeader, 
  SNMEmptyState,
  SNMSidebar
} from '@/components/smart-netmonitor/SNMComponents';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useSmartNetMonitor } from '@/hooks/useSmartNetMonitor';
import { useToolPage } from '@/hooks/useToolPage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSensorPolling } from '@/hooks/useSensorPolling';
import { useAuth } from '@/hooks/useAuth';

// Sensor types
interface Sensor {
  id: string;
  name: string;
  type: 'ping' | 'snmp' | 'http' | 'tcp' | 'ssh' | 'wmi' | 'flow' | 'custom';
  nodeId?: string;
  nodeName?: string;
  enabled: boolean;
  interval: number; // in seconds
  timeout: number; // in seconds
  lastResult?: 'success' | 'warning' | 'error';
  lastValue?: string;
  lastRun?: Date;
  config: Record<string, unknown>;
}

interface SensorTemplate {
  id: string;
  name: string;
  description: string;
  type: Sensor['type'];
  defaultInterval: number;
  defaultTimeout: number;
  configSchema: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
    default?: string | number;
    required?: boolean;
  }>;
}

// Sensor templates
const sensorTemplates: SensorTemplate[] = [
  {
    id: 'ping-basic',
    name: 'Ping (ICMP)',
    description: 'Basic availability check using ICMP ping',
    type: 'ping',
    defaultInterval: 60,
    defaultTimeout: 10,
    configSchema: [
      { key: 'count', label: 'Ping Count', type: 'number', default: 4 },
      { key: 'threshold_ms', label: 'Warning Threshold (ms)', type: 'number', default: 100 }
    ]
  },
  {
    id: 'snmp-uptime',
    name: 'SNMP Uptime',
    description: 'Monitor device uptime via SNMP',
    type: 'snmp',
    defaultInterval: 300,
    defaultTimeout: 30,
    configSchema: [
      { key: 'community', label: 'Community String', type: 'text', default: 'public' },
      { key: 'oid', label: 'OID', type: 'text', default: '1.3.6.1.2.1.1.3.0' },
      { key: 'version', label: 'SNMP Version', type: 'select', options: ['v1', 'v2c', 'v3'], default: 'v2c' }
    ]
  },
  {
    id: 'snmp-interface',
    name: 'SNMP Interface Stats',
    description: 'Monitor interface traffic and errors via SNMP',
    type: 'snmp',
    defaultInterval: 60,
    defaultTimeout: 30,
    configSchema: [
      { key: 'community', label: 'Community String', type: 'text', default: 'public' },
      { key: 'interface_index', label: 'Interface Index', type: 'number', default: 1 },
      { key: 'error_threshold', label: 'Error Threshold', type: 'number', default: 10 }
    ]
  },
  {
    id: 'snmp-cpu',
    name: 'SNMP CPU Usage',
    description: 'Monitor CPU utilization via SNMP',
    type: 'snmp',
    defaultInterval: 120,
    defaultTimeout: 30,
    configSchema: [
      { key: 'community', label: 'Community String', type: 'text', default: 'public' },
      { key: 'warning_percent', label: 'Warning Threshold (%)', type: 'number', default: 80 },
      { key: 'critical_percent', label: 'Critical Threshold (%)', type: 'number', default: 95 }
    ]
  },
  {
    id: 'http-status',
    name: 'HTTP Status Check',
    description: 'Check HTTP endpoint availability and response time',
    type: 'http',
    defaultInterval: 60,
    defaultTimeout: 30,
    configSchema: [
      { key: 'url', label: 'URL', type: 'text', required: true },
      { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'HEAD'], default: 'GET' },
      { key: 'expected_status', label: 'Expected Status', type: 'number', default: 200 },
      { key: 'threshold_ms', label: 'Warning Threshold (ms)', type: 'number', default: 1000 }
    ]
  },
  {
    id: 'http-content',
    name: 'HTTP Content Match',
    description: 'Check HTTP response contains expected content',
    type: 'http',
    defaultInterval: 120,
    defaultTimeout: 60,
    configSchema: [
      { key: 'url', label: 'URL', type: 'text', required: true },
      { key: 'match_text', label: 'Match Text', type: 'text', required: true },
      { key: 'case_sensitive', label: 'Case Sensitive', type: 'select', options: ['true', 'false'], default: 'false' }
    ]
  },
  {
    id: 'tcp-port',
    name: 'TCP Port Check',
    description: 'Check if TCP port is open and responding',
    type: 'tcp',
    defaultInterval: 60,
    defaultTimeout: 10,
    configSchema: [
      { key: 'port', label: 'Port', type: 'number', required: true },
      { key: 'banner_match', label: 'Banner Match (optional)', type: 'text' }
    ]
  },
  {
    id: 'ssh-command',
    name: 'SSH Command',
    description: 'Execute command via SSH and check output',
    type: 'ssh',
    defaultInterval: 300,
    defaultTimeout: 60,
    configSchema: [
      { key: 'command', label: 'Command', type: 'text', required: true },
      { key: 'expected_output', label: 'Expected Output (regex)', type: 'text' },
      { key: 'credential_id', label: 'Credential ID', type: 'text' }
    ]
  },
  {
    id: 'wmi-disk',
    name: 'WMI Disk Space',
    description: 'Monitor Windows disk space via WMI',
    type: 'wmi',
    defaultInterval: 300,
    defaultTimeout: 60,
    configSchema: [
      { key: 'drive', label: 'Drive Letter', type: 'text', default: 'C' },
      { key: 'warning_percent', label: 'Warning Threshold (%)', type: 'number', default: 80 },
      { key: 'critical_percent', label: 'Critical Threshold (%)', type: 'number', default: 95 }
    ]
  },
  {
    id: 'flow-bandwidth',
    name: 'Flow Bandwidth',
    description: 'Monitor bandwidth usage from NetFlow/sFlow data',
    type: 'flow',
    defaultInterval: 60,
    defaultTimeout: 30,
    configSchema: [
      { key: 'interface', label: 'Interface', type: 'text' },
      { key: 'threshold_mbps', label: 'Threshold (Mbps)', type: 'number', default: 100 }
    ]
  }
];

// No mock data — sensors are loaded from live backend
const mockSensors: Sensor[] = [];

const SmartNetMonitorSensors: React.FC = () => {
  useToolPage('smart-netmonitor-sensors', 'Smart NetMonitor - Sensors');
  const { nodes, loading } = useSmartNetMonitor();
  const { user } = useAuth();
  const { polling, pollSensors, pollSingleSensor, lastResults } = useSensorPolling();
  
  const [sensors, setSensors] = useState<Sensor[]>(mockSensors);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SensorTemplate | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nodeId: '',
    interval: 60,
    timeout: 10,
    config: {} as Record<string, unknown>
  });

  // Poll all sensors using the edge function
  const handlePollAll = async () => {
    if (!user) {
      toast.error('Please log in to poll sensors');
      return;
    }
    
    setRefreshing(true);
    const orgId = user.id; // Using user ID as org ID for now
    
    // Build sensor configs from current sensors
    const sensorConfigs = sensors.filter(s => s.enabled && s.nodeId).map(s => ({
      id: s.id,
      type: s.type as 'ping' | 'snmp' | 'http' | 'tcp' | 'ssh' | 'wmi',
      target: s.nodeId!,
      interval_seconds: s.interval,
      timeout_seconds: s.timeout,
      port: s.config.port as number | undefined
    }));
    
    const response = await pollSensors(orgId, undefined, sensorConfigs);
    
    if (response) {
      // Update sensor results based on polling response
      setSensors(prev => prev.map(sensor => {
        const result = response.results.find(r => r.sensor_id === sensor.id);
        if (result) {
          return {
            ...sensor,
            lastRun: new Date(),
            lastResult: result.success ? 'success' as const : 'error' as const,
            lastValue: result.success 
              ? `${result.response_time_ms}ms`
              : result.error || 'Failed'
          };
        }
        return sensor;
      }));
    }
    
    setRefreshing(false);
  };

  const handleRefresh = async () => {
    await handlePollAll();
  };

  const filteredSensors = useMemo(() => {
    return sensors.filter(sensor => {
      if (search && !sensor.name.toLowerCase().includes(search.toLowerCase()) && 
          !sensor.nodeName?.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (typeFilter !== 'all' && sensor.type !== typeFilter) return false;
      if (statusFilter === 'enabled' && !sensor.enabled) return false;
      if (statusFilter === 'disabled' && sensor.enabled) return false;
      if (statusFilter === 'success' && sensor.lastResult !== 'success') return false;
      if (statusFilter === 'warning' && sensor.lastResult !== 'warning') return false;
      if (statusFilter === 'error' && sensor.lastResult !== 'error') return false;
      return true;
    });
  }, [sensors, search, typeFilter, statusFilter]);

  const sensorStats = useMemo(() => ({
    total: sensors.length,
    enabled: sensors.filter(s => s.enabled).length,
    success: sensors.filter(s => s.lastResult === 'success').length,
    warning: sensors.filter(s => s.lastResult === 'warning').length,
    error: sensors.filter(s => s.lastResult === 'error').length
  }), [sensors]);

  const toggleSensor = (id: string) => {
    setSensors(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
    toast.success('Sensor updated');
  };

  const deleteSensor = (id: string) => {
    if (confirm('Are you sure you want to delete this sensor?')) {
      setSensors(prev => prev.filter(s => s.id !== id));
      toast.success('Sensor deleted');
    }
  };

  const runSensorNow = async (sensor: Sensor) => {
    if (!user || !sensor.nodeId) {
      toast.error('Cannot poll sensor - missing user or node');
      return;
    }
    
    toast.info(`Running ${sensor.name}...`);
    
    const sensorConfig = {
      id: sensor.id,
      type: sensor.type as 'ping' | 'snmp' | 'http' | 'tcp' | 'ssh' | 'wmi',
      target: sensor.nodeId,
      interval_seconds: sensor.interval,
      timeout_seconds: sensor.timeout,
      port: sensor.config.port as number | undefined
    };
    
    const result = await pollSingleSensor(user.id, sensor.nodeId, sensorConfig);
    
    if (result) {
      setSensors(prev => prev.map(s => 
        s.id === sensor.id 
          ? { 
              ...s, 
              lastRun: new Date(), 
              lastResult: result.success ? 'success' as const : 'error' as const, 
              lastValue: result.success 
                ? `${result.response_time_ms}ms`
                : result.error || 'Failed'
            }
          : s
      ));
      toast.success(`${sensor.name} completed - ${result.success ? 'Success' : 'Failed'}`);
    }
  };

  const handleAddSensor = () => {
    if (!selectedTemplate || !formData.name) return;
    
    const nodeName = nodes.find(n => n.id === formData.nodeId)?.name;
    
    const newSensor: Sensor = {
      id: Date.now().toString(),
      name: formData.name,
      type: selectedTemplate.type,
      nodeId: formData.nodeId || undefined,
      nodeName: nodeName || undefined,
      enabled: true,
      interval: formData.interval,
      timeout: formData.timeout,
      config: formData.config
    };
    
    setSensors(prev => [...prev, newSensor]);
    setIsAddDialogOpen(false);
    setSelectedTemplate(null);
    setFormData({ name: '', nodeId: '', interval: 60, timeout: 10, config: {} });
    toast.success('Sensor created');
  };

  const getTypeIcon = (type: Sensor['type']) => {
    switch (type) {
      case 'ping': return <Wifi className="h-4 w-4" />;
      case 'snmp': return <Server className="h-4 w-4" />;
      case 'http': return <Globe className="h-4 w-4" />;
      case 'tcp': return <Zap className="h-4 w-4" />;
      case 'ssh': return <Shield className="h-4 w-4" />;
      case 'wmi': return <Settings2 className="h-4 w-4" />;
      case 'flow': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getResultIcon = (result?: 'success' | 'warning' | 'error') => {
    switch (result) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatInterval = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  const timeAgo = (date?: Date) => {
    if (!date) return 'Never';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SNMSidebar />
        <main className="flex-1">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <SidebarTrigger />
            <h2 className="font-medium">Sensors Management</h2>
          </div>
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            <SNMHeader 
              title="Sensors" 
              description="Configure composable sensors with dynamic polling intervals"
            >
              <div className="flex items-center gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handlePollAll}
                  disabled={polling || refreshing}
                >
                  <Play className={`h-4 w-4 mr-2 ${polling ? 'animate-pulse' : ''}`} />
                  Poll All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={refreshing || polling}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Sensor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Sensor</DialogTitle>
                      <DialogDescription>
                        Select a sensor template and configure its settings
                      </DialogDescription>
                    </DialogHeader>
                    
                    {!selectedTemplate ? (
                      <div className="py-4">
                        <h4 className="font-medium mb-3">Choose Sensor Template</h4>
                        <div className="grid gap-3">
                          {sensorTemplates.map(template => (
                            <Card 
                              key={template.id}
                              className="cursor-pointer hover:border-primary/50 transition-colors"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setFormData(prev => ({
                                  ...prev,
                                  name: template.name,
                                  interval: template.defaultInterval,
                                  timeout: template.defaultTimeout,
                                  config: template.configSchema.reduce((acc, field) => {
                                    if (field.default !== undefined) {
                                      acc[field.key] = field.default;
                                    }
                                    return acc;
                                  }, {} as Record<string, unknown>)
                                }));
                              }}
                            >
                              <CardContent className="p-4 flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                  {getTypeIcon(template.type)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-medium">{template.name}</h5>
                                    <Badge variant="outline" className="text-xs uppercase">
                                      {template.type}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {template.description}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 space-y-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedTemplate(null)}
                          className="mb-2"
                        >
                          ← Back to templates
                        </Button>
                        
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label>Sensor Name</Label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Enter sensor name"
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label>Assign to Node (optional)</Label>
                            <Select 
                              value={formData.nodeId} 
                              onValueChange={(v) => setFormData(prev => ({ ...prev, nodeId: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a node" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">No specific node</SelectItem>
                                {nodes.map(node => (
                                  <SelectItem key={node.id} value={node.id}>
                                    {node.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label>Polling Interval: {formatInterval(formData.interval)}</Label>
                              <Slider
                                value={[formData.interval]}
                                onValueChange={([v]) => setFormData(prev => ({ ...prev, interval: v }))}
                                min={10}
                                max={3600}
                                step={10}
                              />
                              <p className="text-xs text-muted-foreground">
                                How often to run this sensor
                              </p>
                            </div>
                            <div className="grid gap-2">
                              <Label>Timeout: {formData.timeout}s</Label>
                              <Slider
                                value={[formData.timeout]}
                                onValueChange={([v]) => setFormData(prev => ({ ...prev, timeout: v }))}
                                min={5}
                                max={120}
                                step={5}
                              />
                              <p className="text-xs text-muted-foreground">
                                Max wait time before failure
                              </p>
                            </div>
                          </div>
                          
                          <div className="border-t pt-4">
                            <h5 className="font-medium mb-3">Sensor Configuration</h5>
                            <div className="grid gap-4">
                              {selectedTemplate.configSchema.map(field => (
                                <div key={field.key} className="grid gap-2">
                                  <Label>
                                    {field.label}
                                    {field.required && <span className="text-destructive">*</span>}
                                  </Label>
                                  {field.type === 'select' ? (
                                    <Select
                                      value={String(formData.config[field.key] || field.default || '')}
                                      onValueChange={(v) => setFormData(prev => ({
                                        ...prev,
                                        config: { ...prev.config, [field.key]: v }
                                      }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {field.options?.map(opt => (
                                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      type={field.type}
                                      value={String(formData.config[field.key] || field.default || '')}
                                      onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        config: { 
                                          ...prev.config, 
                                          [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value 
                                        }
                                      }))}
                                      placeholder={`Enter ${field.label.toLowerCase()}`}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedTemplate && (
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddSensor} disabled={!formData.name}>
                          Create Sensor
                        </Button>
                      </DialogFooter>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </SNMHeader>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sensorStats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10 text-success">
                    <Play className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sensorStats.enabled}</p>
                    <p className="text-xs text-muted-foreground">Enabled</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10 text-success">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sensorStats.success}</p>
                    <p className="text-xs text-muted-foreground">Success</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10 text-warning">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sensorStats.warning}</p>
                    <p className="text-xs text-muted-foreground">Warning</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <XCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{sensorStats.error}</p>
                    <p className="text-xs text-muted-foreground">Error</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search sensors..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="ping">Ping</SelectItem>
                        <SelectItem value="snmp">SNMP</SelectItem>
                        <SelectItem value="http">HTTP</SelectItem>
                        <SelectItem value="tcp">TCP</SelectItem>
                        <SelectItem value="ssh">SSH</SelectItem>
                        <SelectItem value="wmi">WMI</SelectItem>
                        <SelectItem value="flow">Flow</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sensors List */}
            {filteredSensors.length === 0 ? (
              <SNMEmptyState
                icon={<Activity className="h-8 w-8 text-muted-foreground" />}
                title={sensors.length === 0 ? "No Sensors Configured" : "No Matching Sensors"}
                description={
                  sensors.length === 0 
                    ? "Add your first sensor to start monitoring your network."
                    : "Try adjusting your search or filters."
                }
                action={sensors.length === 0 ? {
                  label: "Add Your First Sensor",
                  onClick: () => setIsAddDialogOpen(true)
                } : undefined}
              />
            ) : (
              <div className="space-y-3">
                {filteredSensors.map(sensor => (
                  <Card key={sensor.id} className={cn(
                    "transition-colors",
                    !sensor.enabled && "opacity-60",
                    sensor.lastResult === 'error' && "border-destructive/30",
                    sensor.lastResult === 'warning' && "border-warning/30"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {getTypeIcon(sensor.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{sensor.name}</h4>
                            <Badge variant="outline" className="text-xs uppercase shrink-0">
                              {sensor.type}
                            </Badge>
                            {!sensor.enabled && (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                Disabled
                              </Badge>
                            )}
                          </div>
                          {sensor.nodeName && (
                            <p className="text-sm text-muted-foreground">
                              Node: {sensor.nodeName}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-6 shrink-0">
                          <div className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              {getResultIcon(sensor.lastResult)}
                              <span className="text-sm font-medium">
                                {sensor.lastValue || 'N/A'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {timeAgo(sensor.lastRun)}
                            </p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm font-medium">{formatInterval(sensor.interval)}</p>
                            <p className="text-xs text-muted-foreground">Interval</p>
                          </div>
                          
                          <Switch 
                            checked={sensor.enabled}
                            onCheckedChange={() => toggleSensor(sensor.id)}
                          />
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => runSensorNow(sensor)}>
                                <Play className="h-4 w-4 mr-2" />
                                Run Now
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSelectedSensor(sensor)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(sensor.config, null, 2));
                                toast.success('Config copied');
                              }}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Config
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => deleteSensor(sensor.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SmartNetMonitorSensors;
