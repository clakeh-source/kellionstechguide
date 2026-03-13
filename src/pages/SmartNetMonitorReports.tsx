import React, { useState, useMemo } from 'react';
import { useToolPage } from '@/hooks/useToolPage';
import { SidebarProvider } from '@/components/ui/sidebar';
import { 
  SNMSidebar, 
  SNMHeader 
} from '@/components/smart-netmonitor/SNMComponents';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText,
  Download,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  TrendingUp,
  Shield,
  Activity,
  Plus,
  Play,
  CheckCircle
} from 'lucide-react';
import { useSmartNetMonitor } from '@/hooks/useSmartNetMonitor';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'performance' | 'compliance' | 'executive';
  icon: React.ReactNode;
}

interface GeneratedReport {
  id: string;
  name: string;
  template: string;
  status: 'completed' | 'running' | 'scheduled';
  createdAt: Date;
  size?: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'security-summary',
    name: 'Security Summary',
    description: 'Overview of security incidents, alerts, and threat trends',
    category: 'security',
    icon: <Shield className="h-5 w-5" />
  },
  {
    id: 'incident-analysis',
    name: 'Incident Analysis',
    description: 'Detailed breakdown of incidents with root cause analysis',
    category: 'security',
    icon: <Activity className="h-5 w-5" />
  },
  {
    id: 'performance-metrics',
    name: 'Performance Metrics',
    description: 'Network and system performance statistics',
    category: 'performance',
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: 'node-health',
    name: 'Node Health Report',
    description: 'Health status and availability of all monitored nodes',
    category: 'performance',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    id: 'alert-summary',
    name: 'Alert Summary',
    description: 'Alert deduplication effectiveness and noise reduction metrics',
    category: 'compliance',
    icon: <PieChart className="h-5 w-5" />
  },
  {
    id: 'executive-dashboard',
    name: 'Executive Dashboard',
    description: 'High-level overview for stakeholders and management',
    category: 'executive',
    icon: <FileText className="h-5 w-5" />
  }
];

const SmartNetMonitorReports: React.FC = () => {
  useToolPage('smart-netmonitor-reports', 'Smart NetMonitor Reports');

  const { nodes, alerts, incidents, loading } = useSmartNetMonitor();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
    {
      id: '1',
      name: 'Weekly Security Summary',
      template: 'security-summary',
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000),
      size: '2.4 MB'
    },
    {
      id: '2',
      name: 'Monthly Incident Analysis',
      template: 'incident-analysis',
      status: 'completed',
      createdAt: new Date(Date.now() - 172800000),
      size: '5.1 MB'
    },
    {
      id: '3',
      name: 'Daily Performance Report',
      template: 'performance-metrics',
      status: 'scheduled',
      createdAt: new Date()
    }
  ]);

  const filteredTemplates = useMemo(() => 
    selectedCategory === 'all' 
      ? reportTemplates 
      : reportTemplates.filter(t => t.category === selectedCategory),
  [selectedCategory]);

  const generateReport = (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newReport: GeneratedReport = {
      id: crypto.randomUUID(),
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      template: templateId,
      status: 'running',
      createdAt: new Date()
    };

    setGeneratedReports(prev => [newReport, ...prev]);
    toast.info(`Generating ${template.name}...`);

    // Simulate report generation
    setTimeout(() => {
      setGeneratedReports(prev => 
        prev.map(r => r.id === newReport.id 
          ? { ...r, status: 'completed', size: `${(Math.random() * 5 + 1).toFixed(1)} MB` }
          : r
        )
      );
      toast.success(`${template.name} generated successfully`);
    }, 3000);
  };

  const downloadReport = (report: GeneratedReport) => {
    toast.info(`Downloading ${report.name}...`);
    // In production, this would trigger an actual download
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <SNMSidebar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="space-y-4">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-96" />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <SNMSidebar />
        
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <SNMHeader 
            title="Reports" 
            description="Generate and download network monitoring reports"
          >
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Report
              </Button>
            </div>
          </SNMHeader>

          {/* Report Templates */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>Select a template to generate a new report</CardDescription>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <Card key={template.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium mb-1">{template.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {template.category}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => generateReport(template.id)}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Generate
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generated Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>View and download previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedReports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{report.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          report.status === 'completed' ? 'default' :
                          report.status === 'running' ? 'secondary' : 'outline'
                        } className={cn(
                          report.status === 'completed' && 'bg-success/20 text-success border-success/30'
                        )}>
                          {report.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {report.status === 'running' && <Activity className="h-3 w-3 mr-1 animate-spin" />}
                          {report.status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {report.createdAt.toLocaleString()}
                      </TableCell>
                      <TableCell>{report.size || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          disabled={report.status !== 'completed'}
                          onClick={() => downloadReport(report)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SmartNetMonitorReports;
