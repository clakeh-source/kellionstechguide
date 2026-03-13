import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HardDrive, Plus, Search, Filter, Monitor, Server, Smartphone, FileCode, AlertCircle, Trash2, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AtlasNav } from '@/components/atlas/AtlasNav';
import { useToolPage } from '@/hooks/useToolPage';
import { LiveDataBadge } from '@/components/ui/LiveDataBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface Asset {
  id: string;
  name: string;
  type: string;
  status: string;
  ip_address: string | null;
  location: string | null;
  manufacturer: string | null;
  model: string | null;
  assigned_to: string | null;
  created_at: string;
}

interface License {
  id: string;
  name: string;
  vendor: string | null;
  license_key: string | null;
  seats_total: number | null;
  seats_used: number | null;
  expires_at: string | null;
  cost_per_seat: number | null;
  category: string | null;
  notes: string | null;
  created_at: string;
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  desktop: Monitor,
  server: Server,
  mobile: Smartphone,
  network: HardDrive,
  device: HardDrive,
};

const AtlasAssetManager: React.FC = () => {
  useToolPage('atlas-assets', 'Atlas Asset Manager');
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'device',
    status: 'active',
    ip_address: '',
    location: '',
    manufacturer: '',
    model: ''
  });
  const [isLicenseDialogOpen, setIsLicenseDialogOpen] = useState(false);
  const [newLicense, setNewLicense] = useState({
    name: '',
    vendor: '',
    license_key: '',
    seats_total: 1,
    expires_at: '',
    cost_per_seat: '',
    category: 'software',
    notes: ''
  });

  // Fetch real assets from database
  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['atlas-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('atlas_assets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Asset[];
    }
  });

  // Fetch licenses from database
  const { data: licenses = [], isLoading: loadingLicenses } = useQuery({
    queryKey: ['atlas-licenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('atlas_licenses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as License[];
    }
  });

  // Create asset mutation
  const createAssetMutation = useMutation({
    mutationFn: async (asset: typeof newAsset) => {
      const { data, error } = await supabase
        .from('atlas_assets')
        .insert({
          name: asset.name,
          type: asset.type,
          status: asset.status,
          ip_address: asset.ip_address || null,
          location: asset.location || null,
          manufacturer: asset.manufacturer || null,
          model: asset.model || null
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atlas-assets'] });
      setNewAsset({ name: '', type: 'device', status: 'active', ip_address: '', location: '', manufacturer: '', model: '' });
      setIsCreateDialogOpen(false);
      toast({ title: 'Asset created', description: 'The new asset has been added successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const { error } = await supabase
        .from('atlas_assets')
        .delete()
        .eq('id', assetId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atlas-assets'] });
      toast({ title: 'Asset deleted', description: 'The asset has been removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Create license mutation
  const createLicenseMutation = useMutation({
    mutationFn: async (license: typeof newLicense) => {
      const { data, error } = await supabase
        .from('atlas_licenses')
        .insert({
          name: license.name,
          vendor: license.vendor || null,
          license_key: license.license_key || null,
          seats_total: license.seats_total || 1,
          expires_at: license.expires_at || null,
          cost_per_seat: license.cost_per_seat ? parseFloat(license.cost_per_seat) : null,
          category: license.category,
          notes: license.notes || null
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atlas-licenses'] });
      setNewLicense({ name: '', vendor: '', license_key: '', seats_total: 1, expires_at: '', cost_per_seat: '', category: 'software', notes: '' });
      setIsLicenseDialogOpen(false);
      toast({ title: 'License added', description: 'The software license has been added successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Delete license mutation
  const deleteLicenseMutation = useMutation({
    mutationFn: async (licenseId: string) => {
      const { error } = await supabase
        .from('atlas_licenses')
        .delete()
        .eq('id', licenseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atlas-licenses'] });
      toast({ title: 'License deleted', description: 'The license has been removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Filter assets based on search
  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.ip_address?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (asset.location?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate stats from real data
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === 'active').length;
  const maintenanceAssets = assets.filter(a => a.status === 'maintenance').length;

  const handleCreateAsset = () => {
    if (!newAsset.name.trim()) return;
    createAssetMutation.mutate(newAsset);
  };

  const handleCreateLicense = () => {
    if (!newLicense.name.trim()) return;
    createLicenseMutation.mutate(newLicense);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AtlasNav />
        <main className="flex-1">
          <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <HardDrive className="h-5 w-5 text-amber-400" />
                </div>
                <h1 className="text-lg font-semibold">Asset Manager</h1>
                <LiveDataBadge size="sm" source="Database" />
              </div>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Asset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="assetName">Asset Name *</Label>
                    <Input 
                      id="assetName" 
                      value={newAsset.name} 
                      onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Dell OptiPlex 7090"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={newAsset.type} onValueChange={(v) => setNewAsset(prev => ({ ...prev, type: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desktop">Desktop</SelectItem>
                          <SelectItem value="server">Server</SelectItem>
                          <SelectItem value="mobile">Mobile</SelectItem>
                          <SelectItem value="network">Network</SelectItem>
                          <SelectItem value="device">Other Device</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select value={newAsset.status} onValueChange={(v) => setNewAsset(prev => ({ ...prev, status: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ipAddress">IP Address</Label>
                      <Input 
                        id="ipAddress" 
                        value={newAsset.ip_address} 
                        onChange={(e) => setNewAsset(prev => ({ ...prev, ip_address: e.target.value }))}
                        placeholder="192.168.1.100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={newAsset.location} 
                        onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Building A, Room 101"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer">Manufacturer</Label>
                      <Input 
                        id="manufacturer" 
                        value={newAsset.manufacturer} 
                        onChange={(e) => setNewAsset(prev => ({ ...prev, manufacturer: e.target.value }))}
                        placeholder="Dell, HP, Cisco..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input 
                        id="model" 
                        value={newAsset.model} 
                        onChange={(e) => setNewAsset(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="Model number"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleCreateAsset} 
                    disabled={!newAsset.name.trim() || createAssetMutation.isPending}
                    className="w-full"
                  >
                    {createAssetMutation.isPending ? 'Adding...' : 'Add Asset'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
            {/* Search & Filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search assets..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Stats - Real data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{totalAssets}</p>
                  <p className="text-xs text-muted-foreground">Total Assets</p>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{activeAssets}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-amber-400">{maintenanceAssets}</p>
                  <p className="text-xs text-muted-foreground">Maintenance</p>
                </CardContent>
              </Card>
              <Card className="glass">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{assets.filter(a => a.type === 'server').length}</p>
                  <p className="text-xs text-muted-foreground">Servers</p>
                </CardContent>
              </Card>
            </div>

            {/* Asset Grid */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg">Hardware Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))
                  ) : filteredAssets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{searchQuery ? 'No assets match your search' : 'No assets registered'}</p>
                      <p className="text-xs">Add assets to start tracking your hardware inventory</p>
                    </div>
                  ) : (
                    filteredAssets.map((asset) => {
                      const Icon = typeIcons[asset.type] || HardDrive;
                      return (
                        <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-card/50 cursor-pointer transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-muted">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{asset.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {[asset.ip_address, asset.location].filter(Boolean).join(' · ') || 'No details'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={asset.status === 'active' ? 'default' : 'secondary'}>
                              {asset.status}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAssetMutation.mutate(asset.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Software Licenses */}
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Software Licenses
                </CardTitle>
                <Dialog open={isLicenseDialogOpen} onOpenChange={setIsLicenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Software License</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="licenseName">Software Name *</Label>
                        <Input 
                          id="licenseName" 
                          value={newLicense.name} 
                          onChange={(e) => setNewLicense(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Microsoft 365, Adobe Creative Cloud"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="vendor">Vendor</Label>
                          <Input 
                            id="vendor" 
                            value={newLicense.vendor} 
                            onChange={(e) => setNewLicense(prev => ({ ...prev, vendor: e.target.value }))}
                            placeholder="Microsoft, Adobe..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={newLicense.category} onValueChange={(v) => setNewLicense(prev => ({ ...prev, category: v }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="software">Software</SelectItem>
                              <SelectItem value="saas">SaaS</SelectItem>
                              <SelectItem value="cloud">Cloud Service</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                              <SelectItem value="development">Development</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="licenseKey">License Key</Label>
                        <Input 
                          id="licenseKey" 
                          value={newLicense.license_key} 
                          onChange={(e) => setNewLicense(prev => ({ ...prev, license_key: e.target.value }))}
                          placeholder="XXXXX-XXXXX-XXXXX"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="seats">Seats</Label>
                          <Input 
                            id="seats" 
                            type="number"
                            min="1"
                            value={newLicense.seats_total} 
                            onChange={(e) => setNewLicense(prev => ({ ...prev, seats_total: parseInt(e.target.value) || 1 }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="costPerSeat">Cost/Seat</Label>
                          <Input 
                            id="costPerSeat" 
                            type="number"
                            step="0.01"
                            value={newLicense.cost_per_seat} 
                            onChange={(e) => setNewLicense(prev => ({ ...prev, cost_per_seat: e.target.value }))}
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiresAt">Expires</Label>
                          <Input 
                            id="expiresAt" 
                            type="date"
                            value={newLicense.expires_at} 
                            onChange={(e) => setNewLicense(prev => ({ ...prev, expires_at: e.target.value }))}
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleCreateLicense} 
                        disabled={!newLicense.name.trim() || createLicenseMutation.isPending}
                        className="w-full"
                      >
                        {createLicenseMutation.isPending ? 'Adding...' : 'Add License'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loadingLicenses ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))
                  ) : licenses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileCode className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No software licenses tracked</p>
                      <p className="text-xs">Add licenses to track your software inventory</p>
                    </div>
                  ) : (
                    licenses.map((license) => {
                      const isExpired = license.expires_at && new Date(license.expires_at) < new Date();
                      const isExpiringSoon = license.expires_at && 
                        new Date(license.expires_at) > new Date() && 
                        new Date(license.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                      
                      return (
                        <div key={license.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-card/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-muted">
                              <FileCode className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{license.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {license.vendor || 'Unknown vendor'} · {license.seats_used || 0}/{license.seats_total} seats
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDate(license.expires_at)}
                              </div>
                              {license.cost_per_seat && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <DollarSign className="h-3 w-3" />
                                  {license.cost_per_seat}/seat
                                </div>
                              )}
                            </div>
                            <Badge variant={isExpired ? 'destructive' : isExpiringSoon ? 'secondary' : 'default'}>
                              {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring' : license.category}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteLicenseMutation.mutate(license.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
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

export default AtlasAssetManager;
