import React, { useState, useMemo } from 'react';
import { useToolPage } from '@/hooks/useToolPage';
import { SidebarProvider } from '@/components/ui/sidebar';
import { 
  SNMSidebar, 
  SNMHeader, 
  SNMStatCard 
} from '@/components/smart-netmonitor/SNMComponents';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard,
  Map,
  Globe,
  Monitor,
  Activity,
  AlertTriangle,
  Server,
  Shield,
  TrendingUp,
  Clock,
  Maximize2,
  Plus,
  Settings
} from 'lucide-react';
import { useSmartNetMonitor } from '@/hooks/useSmartNetMonitor';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { cn } from '@/lib/utils';

const SmartNetMonitorDashboards: React.FC = () => {
  useToolPage('smart-netmonitor-dashboards', 'Smart NetMonitor Dashboards');

  const { nodes, alerts, incidents, stats, loading } = useSmartNetMonitor();
  const [isNocMode, setIsNocMode] = useState(false);

  // Generate sample time series data for charts
  const timeSeriesData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${(now.getHours() - 23 + i + 24) % 24}:00`,
      events: Math.floor(Math.random() * 100) + 20,
      alerts: Math.floor(Math.random() * 20) + 5,
      incidents: Math.floor(Math.random() * 5),
    }));
  }, []);

  const statusDistribution = useMemo(() => [
    { name: 'Online', value: nodes.filter(n => n.status === 'online').length, color: 'hsl(var(--success))' },
    { name: 'Warning', value: nodes.filter(n => n.status === 'warning').length, color: 'hsl(var(--warning))' },
    { name: 'Critical', value: nodes.filter(n => n.status === 'critical').length, color: 'hsl(var(--destructive))' },
    { name: 'Offline', value: nodes.filter(n => n.status === 'offline').length, color: 'hsl(var(--muted))' },
  ].filter(d => d.value > 0), [nodes]);

  const severityDistribution = useMemo(() => [
    { name: 'Critical', value: alerts.filter(a => a.severity === 'critical').length, color: 'hsl(var(--destructive))' },
    { name: 'High', value: alerts.filter(a => a.severity === 'high').length, color: 'hsl(var(--warning))' },
    { name: 'Medium', value: alerts.filter(a => a.severity === 'medium').length, color: 'hsl(var(--primary))' },
    { name: 'Low', value: alerts.filter(a => a.severity === 'low').length, color: 'hsl(var(--muted-foreground))' },
  ].filter(d => d.value > 0), [alerts]);

  const recentAlerts = useMemo(() => 
    alerts.slice(0, 5).map(a => ({
      title: a.title,
      severity: a.severity,
      time: new Date(a.first_seen_at).toLocaleTimeString(),
    })),
  [alerts]);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <SNMSidebar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="space-y-4">
              <Skeleton className="h-12 w-64" />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-72" />
                <Skeleton className="h-72" />
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className={cn(
        "min-h-screen flex w-full",
        isNocMode ? "bg-black" : "bg-background"
      )}>
        {!isNocMode && <SNMSidebar />}
        
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {!isNocMode && (
            <SNMHeader 
              title="Dashboards" 
              description="Visualize network health and performance metrics"
            >
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsNocMode(true)}>
                  <Maximize2 className="h-4 w-4 mr-2" />
                  NOC Mode
                </Button>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Widget
                </Button>
              </div>
            </SNMHeader>
          )}

          {isNocMode && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Monitor className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Network Operations Center</h1>
                  <p className="text-gray-400">Real-time monitoring dashboard</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setIsNocMode(false)}>
                Exit NOC Mode
              </Button>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <SNMStatCard
              title="Total Nodes"
              value={stats?.totalNodes || nodes.length}
              icon={<Server className="h-5 w-5" />}
            />
            <SNMStatCard
              title="Online"
              value={nodes.filter(n => n.status === 'online').length}
              icon={<Activity className="h-5 w-5" />}
              variant="success"
            />
            <SNMStatCard
              title="Critical"
              value={alerts.filter(a => a.severity === 'critical').length}
              icon={<AlertTriangle className="h-5 w-5" />}
              variant="destructive"
            />
            <SNMStatCard
              title="Open Incidents"
              value={incidents.filter(i => i.status === 'open').length}
              icon={<Shield className="h-5 w-5" />}
              variant="warning"
            />
            <SNMStatCard
              title="Events/Hour"
              value={150 + (alerts.length * 10)}
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <SNMStatCard
              title="Uptime"
              value="99.9%"
              icon={<Clock className="h-5 w-5" />}
              variant="success"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Event Timeline */}
            <Card className={isNocMode ? "bg-gray-900 border-gray-800" : ""}>
              <CardHeader>
                <CardTitle className={isNocMode ? "text-white" : ""}>Event Timeline</CardTitle>
                <CardDescription className={isNocMode ? "text-gray-400" : ""}>
                  Events, alerts, and incidents over the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isNocMode ? "#333" : "#e5e5e5"} />
                    <XAxis dataKey="time" stroke={isNocMode ? "#888" : "#666"} />
                    <YAxis stroke={isNocMode ? "#888" : "#666"} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isNocMode ? '#1f2937' : '#fff',
                        border: '1px solid ' + (isNocMode ? '#374151' : '#e5e5e5'),
                        color: isNocMode ? '#fff' : '#000'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="events" 
                      stackId="1"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary) / 0.3)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="alerts" 
                      stackId="2"
                      stroke="hsl(var(--warning))" 
                      fill="hsl(var(--warning) / 0.3)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="incidents" 
                      stackId="3"
                      stroke="hsl(var(--destructive))" 
                      fill="hsl(var(--destructive) / 0.3)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Node Status Distribution */}
            <Card className={isNocMode ? "bg-gray-900 border-gray-800" : ""}>
              <CardHeader>
                <CardTitle className={isNocMode ? "text-white" : ""}>Node Status</CardTitle>
                <CardDescription className={isNocMode ? "text-gray-400" : ""}>
                  Distribution of node health states
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-8">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {statusDistribution.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <span className={isNocMode ? "text-white" : ""}>{item.name}</span>
                        <span className="font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alert Severity */}
            <Card className={isNocMode ? "bg-gray-900 border-gray-800" : ""}>
              <CardHeader>
                <CardTitle className={isNocMode ? "text-white" : ""}>Alert Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={severityDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={isNocMode ? "#333" : "#e5e5e5"} />
                    <XAxis type="number" stroke={isNocMode ? "#888" : "#666"} />
                    <YAxis dataKey="name" type="category" stroke={isNocMode ? "#888" : "#666"} width={60} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {severityDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Alerts Feed */}
            <Card className={cn("lg:col-span-2", isNocMode ? "bg-gray-900 border-gray-800" : "")}>
              <CardHeader>
                <CardTitle className={isNocMode ? "text-white" : ""}>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.length === 0 ? (
                    <p className={cn("text-center py-8", isNocMode ? "text-gray-400" : "text-muted-foreground")}>
                      No recent alerts
                    </p>
                  ) : (
                    recentAlerts.map((alert, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg",
                          isNocMode ? "bg-gray-800" : "bg-muted/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            alert.severity === 'critical' && "bg-destructive",
                            alert.severity === 'high' && "bg-warning",
                            alert.severity === 'medium' && "bg-primary",
                            alert.severity === 'low' && "bg-muted-foreground"
                          )} />
                          <span className={isNocMode ? "text-white" : ""}>{alert.title}</span>
                        </div>
                        <span className={isNocMode ? "text-gray-400" : "text-muted-foreground"}>
                          {alert.time}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SmartNetMonitorDashboards;
