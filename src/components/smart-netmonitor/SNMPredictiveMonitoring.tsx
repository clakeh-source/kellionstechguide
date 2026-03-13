import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Activity,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Thermometer,
  RefreshCw,
  Play,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SNMNode } from '@/hooks/useSmartNetMonitor';

interface PredictionResult {
  nodeId: string;
  nodeName: string;
  metric: 'cpu' | 'memory' | 'disk' | 'network' | 'temperature';
  currentValue: number;
  predictedValue: number;
  timeToThreshold: number; // hours until critical
  confidence: number;
  trend: 'stable' | 'increasing' | 'decreasing' | 'volatile';
  recommendation: string;
}

interface WhatIfScenario {
  id: string;
  name: string;
  description: string;
  parameters: {
    loadIncrease?: number;
    nodeFailure?: string[];
    bandwidthReduction?: number;
  };
}

interface SNMPredictiveMonitoringProps {
  nodes: SNMNode[];
  onRefresh?: () => void;
}

export const SNMPredictiveMonitoring: React.FC<SNMPredictiveMonitoringProps> = ({
  nodes,
  onRefresh
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [simulationParams, setSimulationParams] = useState({
    loadIncrease: 20,
    bandwidthReduction: 0,
    failedNodes: [] as string[]
  });
  const [simulationResults, setSimulationResults] = useState<PredictionResult[] | null>(null);
  const [running, setRunning] = useState(false);

  // Generate time-to-failure predictions for nodes
  const predictions = useMemo<PredictionResult[]>(() => {
    return nodes.slice(0, 10).map(node => {
      // Simulate metrics based on node status
      const baseLoad = node.status === 'warning' ? 70 : node.status === 'critical' ? 85 : 45;
      const currentCpu = baseLoad + Math.random() * 20;
      const trend = currentCpu > 70 ? 'increasing' : currentCpu > 50 ? 'stable' : 'decreasing';
      
      // Predict future value based on trend
      const trendMultiplier = trend === 'increasing' ? 1.3 : trend === 'decreasing' ? 0.9 : 1.05;
      const predictedCpu = Math.min(100, currentCpu * trendMultiplier);
      
      // Calculate time to threshold (90% = critical)
      const threshold = 90;
      const rateOfChange = (predictedCpu - currentCpu) / 24; // per hour
      const timeToThreshold = rateOfChange > 0 
        ? Math.max(0, (threshold - currentCpu) / rateOfChange)
        : Infinity;

      const metrics: Array<'cpu' | 'memory' | 'disk' | 'network'> = ['cpu', 'memory', 'disk', 'network'];
      const metric = metrics[Math.floor(Math.random() * metrics.length)];

      return {
        nodeId: node.id,
        nodeName: node.name,
        metric,
        currentValue: Math.round(currentCpu),
        predictedValue: Math.round(predictedCpu),
        timeToThreshold: timeToThreshold === Infinity ? 999 : Math.round(timeToThreshold),
        confidence: 75 + Math.floor(Math.random() * 20),
        trend: trend as 'stable' | 'increasing' | 'decreasing' | 'volatile',
        recommendation: timeToThreshold < 12 
          ? 'Immediate attention required - consider load balancing or scaling'
          : timeToThreshold < 48 
          ? 'Schedule maintenance window for capacity planning'
          : 'Continue monitoring - no immediate action needed'
      };
    });
  }, [nodes]);

  // Sort by time to threshold (most urgent first)
  const sortedPredictions = useMemo(() => {
    return [...predictions].sort((a, b) => a.timeToThreshold - b.timeToThreshold);
  }, [predictions]);

  // Get critical predictions (< 24 hours)
  const criticalPredictions = sortedPredictions.filter(p => p.timeToThreshold < 24);
  const warningPredictions = sortedPredictions.filter(p => p.timeToThreshold >= 24 && p.timeToThreshold < 72);

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'cpu': return <Cpu className="h-4 w-4" />;
      case 'memory': return <Activity className="h-4 w-4" />;
      case 'disk': return <HardDrive className="h-4 w-4" />;
      case 'network': return <Wifi className="h-4 w-4" />;
      case 'temperature': return <Thermometer className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-destructive rotate-0" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-success rotate-180" />;
      case 'volatile': return <Activity className="h-4 w-4 text-warning" />;
      default: return <TrendingUp className="h-4 w-4 text-muted-foreground rotate-90" />;
    }
  };

  const formatTimeToThreshold = (hours: number) => {
    if (hours >= 999) return 'N/A';
    if (hours < 1) return '< 1 hour';
    if (hours < 24) return `${Math.round(hours)} hours`;
    if (hours < 168) return `${Math.round(hours / 24)} days`;
    return '> 1 week';
  };

  const runSimulation = () => {
    setRunning(true);
    
    // Simulate what-if scenario
    setTimeout(() => {
      const results = predictions.map(p => {
        const loadFactor = 1 + (simulationParams.loadIncrease / 100);
        const isFailedNode = simulationParams.failedNodes.includes(p.nodeId);
        
        // Redistribute load from failed nodes
        const redistributionFactor = simulationParams.failedNodes.length > 0 
          ? 1 + (simulationParams.failedNodes.length * 0.2)
          : 1;
        
        const newValue = isFailedNode 
          ? 0 
          : Math.min(100, p.currentValue * loadFactor * redistributionFactor);
        
        const newTimeToThreshold = newValue > 90 
          ? 0 
          : (90 - newValue) / ((newValue - p.currentValue) / 24 || 0.1);

        return {
          ...p,
          currentValue: Math.round(newValue),
          predictedValue: Math.min(100, Math.round(newValue * 1.2)),
          timeToThreshold: isFailedNode ? 0 : Math.max(0, Math.round(newTimeToThreshold)),
          trend: newValue > 80 ? 'increasing' as const : p.trend,
          recommendation: isFailedNode 
            ? 'Node failure simulated - failover activated'
            : newValue > 85 
            ? 'Critical load - immediate scaling required'
            : newValue > 70
            ? 'High load expected - prepare contingency'
            : p.recommendation
        };
      });
      
      setSimulationResults(results);
      setRunning(false);
      toast.success('Simulation complete');
    }, 2000);
  };

  const whatIfScenarios: WhatIfScenario[] = [
    {
      id: 'traffic-spike',
      name: 'Traffic Spike',
      description: 'Simulate 50% increase in network traffic',
      parameters: { loadIncrease: 50 }
    },
    {
      id: 'node-failure',
      name: 'Node Failure',
      description: 'Simulate failure of 2 random nodes',
      parameters: { nodeFailure: nodes.slice(0, 2).map(n => n.id) }
    },
    {
      id: 'bandwidth-constraint',
      name: 'Bandwidth Constraint',
      description: 'Simulate 30% bandwidth reduction',
      parameters: { bandwidthReduction: 30 }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Predictive Monitoring
          </h2>
          <p className="text-sm text-muted-foreground">
            Time-to-failure estimates and what-if simulations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={simulationOpen} onOpenChange={setSimulationOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                What-If
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>What-If Simulation</DialogTitle>
                <DialogDescription>
                  Simulate scenarios to understand potential impact on your infrastructure
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Quick Scenarios */}
                <div className="space-y-2">
                  <Label>Quick Scenarios</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {whatIfScenarios.map(scenario => (
                      <Button
                        key={scenario.id}
                        variant="outline"
                        className="justify-start h-auto py-3"
                        onClick={() => {
                          if (scenario.parameters.loadIncrease) {
                            setSimulationParams(p => ({ ...p, loadIncrease: scenario.parameters.loadIncrease! }));
                          }
                          if (scenario.parameters.nodeFailure) {
                            setSimulationParams(p => ({ ...p, failedNodes: scenario.parameters.nodeFailure! }));
                          }
                        }}
                      >
                        <div className="text-left">
                          <p className="font-medium">{scenario.name}</p>
                          <p className="text-xs text-muted-foreground">{scenario.description}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Parameters */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Load Increase: {simulationParams.loadIncrease}%</Label>
                    <Slider
                      value={[simulationParams.loadIncrease]}
                      onValueChange={([v]) => setSimulationParams(p => ({ ...p, loadIncrease: v }))}
                      max={100}
                      step={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Simulate Node Failures</Label>
                    <Select
                      value={simulationParams.failedNodes.length > 0 ? simulationParams.failedNodes[0] : 'none'}
                      onValueChange={(v) => {
                        if (v === 'none') {
                          setSimulationParams(p => ({ ...p, failedNodes: [] }));
                        } else {
                          setSimulationParams(p => ({ 
                            ...p, 
                            failedNodes: p.failedNodes.includes(v) 
                              ? p.failedNodes.filter(id => id !== v)
                              : [...p.failedNodes, v]
                          }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select nodes to fail" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No failures</SelectItem>
                        {nodes.slice(0, 5).map(node => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {simulationParams.failedNodes.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {simulationParams.failedNodes.length} node(s) will be simulated as failed
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSimulationOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => { runSimulation(); setSimulationOpen(false); }} disabled={running}>
                  {running ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Simulation
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={cn(
          "border-destructive/30",
          criticalPredictions.length > 0 && "bg-destructive/5"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {criticalPredictions.length}
                </p>
                <p className="text-xs text-muted-foreground">Critical ({"<"} 24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-warning/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20 text-warning">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">
                  {warningPredictions.length}
                </p>
                <p className="text-xs text-muted-foreground">Warning (24-72h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-success/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20 text-success">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {predictions.length - criticalPredictions.length - warningPredictions.length}
                </p>
                <p className="text-xs text-muted-foreground">Healthy ({">"} 72h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulation Results */}
      {simulationResults && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Play className="h-4 w-4" />
                Simulation Results
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSimulationResults(null)}
              >
                Clear
              </Button>
            </div>
            <CardDescription>
              Load +{simulationParams.loadIncrease}%
              {simulationParams.failedNodes.length > 0 && `, ${simulationParams.failedNodes.length} node(s) failed`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {simulationResults
                .filter(r => r.timeToThreshold < 72)
                .sort((a, b) => a.timeToThreshold - b.timeToThreshold)
                .map(result => (
                  <div 
                    key={result.nodeId}
                    className={cn(
                      "p-3 rounded-lg border bg-card",
                      result.timeToThreshold === 0 && "border-destructive/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{result.nodeName}</span>
                      </div>
                      <Badge variant="outline" className={cn(
                        result.timeToThreshold === 0 && "bg-destructive/20 text-destructive border-destructive/30",
                        result.timeToThreshold > 0 && result.timeToThreshold < 24 && "bg-warning/20 text-warning border-warning/30"
                      )}>
                        {result.timeToThreshold === 0 ? 'FAILED' : formatTimeToThreshold(result.timeToThreshold)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.recommendation}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictions Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Time-to-Failure Predictions</CardTitle>
          <CardDescription>
            Nodes sorted by urgency based on current trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedPredictions.map(prediction => (
              <div 
                key={prediction.nodeId}
                className={cn(
                  "p-4 rounded-lg border bg-card",
                  prediction.timeToThreshold < 24 && "border-destructive/50",
                  prediction.timeToThreshold >= 24 && prediction.timeToThreshold < 72 && "border-warning/50"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      prediction.timeToThreshold < 24 && "bg-destructive/20 text-destructive",
                      prediction.timeToThreshold >= 24 && prediction.timeToThreshold < 72 && "bg-warning/20 text-warning",
                      prediction.timeToThreshold >= 72 && "bg-muted text-muted-foreground"
                    )}>
                      {getMetricIcon(prediction.metric)}
                    </div>
                    <div>
                      <p className="font-medium">{prediction.nodeName}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {prediction.metric} utilization
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(prediction.trend)}
                      <span className={cn(
                        "font-bold",
                        prediction.timeToThreshold < 24 && "text-destructive",
                        prediction.timeToThreshold >= 24 && prediction.timeToThreshold < 72 && "text-warning"
                      )}>
                        {formatTimeToThreshold(prediction.timeToThreshold)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {prediction.confidence}% confidence
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current</span>
                    <span>{prediction.currentValue}%</span>
                  </div>
                  <Progress 
                    value={prediction.currentValue} 
                    className={cn(
                      "h-2",
                      prediction.currentValue > 80 && '[&>div]:bg-destructive',
                      prediction.currentValue > 60 && prediction.currentValue <= 80 && '[&>div]:bg-warning',
                      prediction.currentValue <= 60 && '[&>div]:bg-success'
                    )}
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Predicted ({selectedTimeframe})</span>
                    <span className={cn(
                      prediction.predictedValue > 90 && "text-destructive",
                      prediction.predictedValue > 70 && prediction.predictedValue <= 90 && "text-warning"
                    )}>
                      {prediction.predictedValue}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                  {prediction.recommendation}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
