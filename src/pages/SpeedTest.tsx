import { useState, useRef, useCallback, useEffect } from "react";
import { useToolPage } from '@/hooks/useToolPage';
import { SEOHead } from "@/components/SEOHead";
import { getSEO } from "@/data/seoData";
import { useSpeedTestHistory } from '@/hooks/useSpeedTestHistory';
import { useISPServerAffinity } from '@/hooks/useISPServerAffinity';
import { useTracerouteValidator } from '@/hooks/useTracerouteValidator';
import { NetworkDiagnosticsPanel } from '@/components/speedtest/NetworkDiagnosticsPanel';
import { SpeedTestHistory } from '@/components/speedtest/SpeedTestHistory';
import { ServerHealthDashboard } from '@/components/speedtest/ServerHealthDashboard';
import { SmartSpeedSettings } from '@/components/speedtest/SmartSpeedSettings';
import { 
  ArrowLeft, Download, Upload, Clock, Activity, Play, RotateCcw, Wifi, Server,
  Gauge, AlertTriangle, CheckCircle2, XCircle, TrendingUp, TrendingDown,
  Shield, Zap, Globe, FileJson, FileText, Share2, Info, Brain, Signal, Settings, Crown
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SpeedResult {
  download: number;
  upload: number;
  latency: number;
  jitter: number;
  packetLoss: number;
  latencyUnderLoad: number;
  stabilityScore: number;
  burstSpeed: number;
  sustainedSpeed: number;
  timestamp: Date;
  proMode?: boolean;
  passNumber?: number;
  totalPasses?: number;
  latencyIdle?: number;
  latencyDownload?: number;
  latencyUpload?: number;
  linkSaturated?: boolean;
  limitingFactor?: string;
  ispInfo?: ISPInfo;
  serverUsed?: ServerCandidate;
  validation?: ValidationResult;
}

interface DataPoint {
  time: number;
  speed: number;
  latency?: number;
}

interface AIAnalysis {
  overallGrade: string;
  confidenceScore: number;
  diagnosis: string;
  detectedIssues: Array<{ issue: string; severity: string; explanation: string }>;
  recommendations: Array<{ category: string; action: string }>;
  comparison: { vsGlobalAverage: string; suitableFor: string[] };
  technicalNotes: string;
}

interface StreamMetrics {
  bytesReceived: number;
  startTime: number;
  lastUpdateTime: number;
  samples: number[];
}

interface PassResult {
  pass: number;
  download: number;
  upload: number;
  latency: number;
  stability: number;
}

interface ISPInfo {
  ip: string;
  isp: string;
  org: string;
  asn: string;
  asnName: string;
  connectionType: string;
  isVPN: boolean;
  isCGNAT: boolean;
  isProxy: boolean;
  country: string;
  region: string;
  city: string;
  expectedSpeed: {
    download: { min: number; max: number; typical: number };
    upload: { min: number; max: number; typical: number };
  };
  expectedLatency: { min: number; max: number; typical: number };
  warnings: string[];
}

interface ServerCandidate {
  id: string;
  name: string;
  city: string;
  country: string;
  region?: string;
  operator: string;
  url: string;
  estimatedDistance: number;
  minPhysicalRTT?: number;
  latency?: number;
  jitter?: number;
  packetLoss?: number;
  rampScore?: number;
  weightedScore?: number;
  status?: 'probing' | 'online' | 'offline' | 'selected' | 'failed' | 'suspect' | 'quarantined';
  selectionReason?: string;
  latencyValid?: boolean;
  downloadVerified?: boolean;
  eligibilityReason?: string;
}

// Connection constraints from server
interface ConnectionConstraints {
  maxDistanceKm: number;
  preferSameCountry: boolean;
  preferSameRegion: boolean;
  maxConcurrentStreams: number;
  maxChunkSizeMB: number;
}

interface ValidationResult {
  downloadStatus: 'below' | 'normal' | 'above';
  uploadStatus: 'below' | 'normal' | 'above';
  diagnosis: string;
  confidence: number;
  recommendations: string[];
}

// Network failure classification
interface NetworkFailure {
  isFailure: boolean;
  failureType: 'none' | 'download_path_failure' | 'severe_instability' | 'server_unreachable' | 'routing_failure';
  severity: 'none' | 'warning' | 'critical';
  diagnosis: string;
  possibleCauses: string[];
  recommendedActions: string[];
  shouldRetry: boolean;
  retryWithDifferentServer: boolean;
}

type TestPhase = "idle" | "detecting" | "probing" | "ready" | "connecting" | "latency" | "download" | "upload" | "cooldown" | "analyzing" | "validating" | "diagnosing" | "retrying" | "complete" | "failure" | "error";

const SPEED_TEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speed-test`;
const SPEED_UPLOAD_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speed-upload`;
const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speed-analyze`;
const CONNECTION_INTEL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/connection-intelligence`;
const CDN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/speed-test`;

// Fixed line capability profile — determined once, never recalculated mid-test
const LINE_PROFILE = {
  maxDownloadMbps: 500,
  maxUploadMbps: 75,
  region: 'Europe',
  connectionType: 'FTTC/FTTP',
};

// Adaptive payload selection based on expected speed
function selectCDNPayload(expectedMbps: number): { file: string; sizeMB: number } {
  if (expectedMbps >= 500) return { file: '100mb.bin', sizeMB: 100 };
  if (expectedMbps >= 100) return { file: '50mb.bin', sizeMB: 50 };
  return { file: '25mb.bin', sizeMB: 25 };
}

// Standard configuration - CDN-based download with reasonable streams
const STANDARD_CONFIG = {
  INITIAL_STREAMS: 4,          // 4 parallel CDN streams
  MAX_STREAMS: 8,              // Scale to 8 if speed > 400 Mbps
  STREAM_CHUNK_SIZE: 50,       // CDN file size (adaptive)
  WARM_UP_DURATION: 500,       // 500ms warm-up exclusion
  MIN_TEST_DURATION: 5000,     // 5 seconds minimum
  SAMPLE_INTERVAL: 50,         // 50ms sampling for accuracy
  UPLOAD_STREAMS: 4,            // Reduced from 6 — prevents burst inflation
  UPLOAD_CHUNK_SIZE: 4,        // 4MB upload chunks
  UPLOAD_PHASE_DURATION: 5000, // Fixed 5-second upload window
  SCALE_UP_THRESHOLD: 0.90,
  PACKET_LOSS_THRESHOLD: 0.02,
  LATENCY_SPIKE_THRESHOLD: 2.0,
  TEST_PASSES: 1,
  COOL_DOWN_DURATION: 0,
  XHR_TIMEOUT: 30000,
  GARBAGE_COLLECT_INTERVAL: 500,
  TAIL_TRIM_DURATION: 300,     // Exclude last 300ms
};

// Pro Accuracy configuration - CDN-based with adaptive scaling
const PRO_CONFIG = {
  INITIAL_STREAMS: 6,          // Start with 6 CDN streams
  MAX_STREAMS: 8,              // Max 8 streams
  STREAM_CHUNK_SIZE: 100,      // Larger CDN files for Pro
  WARM_UP_DURATION: 500,       // 500ms warm-up
  MIN_TEST_DURATION: 8000,     // 8 seconds
  SAMPLE_INTERVAL: 25,         // 25ms sampling
  UPLOAD_STREAMS: 4,            // Reduced from 8 — server-authoritative now
  UPLOAD_CHUNK_SIZE: 4,        // 4MB chunks
  UPLOAD_PHASE_DURATION: 8000, // 8-second upload window for Pro
  SCALE_UP_THRESHOLD: 0.85,
  PACKET_LOSS_THRESHOLD: 0.03,
  LATENCY_SPIKE_THRESHOLD: 2.5,
  TEST_PASSES: 2,
  COOL_DOWN_DURATION: 500,
  XHR_TIMEOUT: 30000,
  GARBAGE_COLLECT_INTERVAL: 250,
  TAIL_TRIM_DURATION: 300,
};

// DSL-specific Pro config - conservative
const DSL_PRO_CONFIG = {
  INITIAL_STREAMS: 2,
  MAX_STREAMS: 4,
  STREAM_CHUNK_SIZE: 25,
  WARM_UP_DURATION: 1000,
  MIN_TEST_DURATION: 10000,
  SAMPLE_INTERVAL: 50,
  UPLOAD_STREAMS: 2,
  UPLOAD_CHUNK_SIZE: 2,
  UPLOAD_PHASE_DURATION: 10000, // Longer window for DSL
  SCALE_UP_THRESHOLD: 0.90,
  PACKET_LOSS_THRESHOLD: 0.02,
  LATENCY_SPIKE_THRESHOLD: 2.0,
  TEST_PASSES: 2,
  COOL_DOWN_DURATION: 1000,
  XHR_TIMEOUT: 45000,
  GARBAGE_COLLECT_INTERVAL: 500,
  TAIL_TRIM_DURATION: 300,
};

// Server switch event tracking
interface ServerSwitchEvent {
  timestamp: Date;
  fromServer: string;
  toServer: string;
  reason: string;
}

const SpeedTest = () => {
  useToolPage('speed-test', 'Kellions SmartSpeed');
  
  // Persistent history hook
  const speedTestHistory = useSpeedTestHistory();
  
  // ISP Server Affinity hook
  const ispAffinity = useISPServerAffinity();
  
  // Traceroute Validator hook
  const tracerouteValidator = useTracerouteValidator();
  
  const [phase, setPhase] = useState<TestPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [result, setResult] = useState<SpeedResult | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SpeedResult[]>([]);
  const [downloadData, setDownloadData] = useState<DataPoint[]>([]);
  const [uploadData, setUploadData] = useState<DataPoint[]>([]);
  const [latencyData, setLatencyData] = useState<DataPoint[]>([]);
  const [serverInfo, setServerInfo] = useState<{ server: string; region: string } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [testLog, setTestLog] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeStreams, setActiveStreams] = useState(0);
  
  // Pro Mode states
  const [proMode, setProMode] = useState(false);
  const [showProWarning, setShowProWarning] = useState(false);
  const [currentPass, setCurrentPass] = useState(0);
  const [passResults, setPassResults] = useState<PassResult[]>([]);
  const [linkSaturated, setLinkSaturated] = useState(false);
  const [limitingFactor, setLimitingFactor] = useState<string | null>(null);
  
  // Pre-test intelligence states (Pro Mode only)
  const [ispInfo, setIspInfo] = useState<ISPInfo | null>(null);
  const [servers, setServers] = useState<ServerCandidate[]>([]);
  const [selectedServer, setSelectedServer] = useState<ServerCandidate | null>(null);
  const [showPreTestConfirm, setShowPreTestConfirm] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [serverSwitches, setServerSwitches] = useState<ServerSwitchEvent[]>([]);
  const [currentSwitchReason, setCurrentSwitchReason] = useState<string | null>(null);
  const [networkFailure, setNetworkFailure] = useState<NetworkFailure | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Settings states
  const [showServerHealth, setShowServerHealth] = useState(false);
  const [enableISPAffinity, setEnableISPAffinity] = useState(() => {
    try {
      return localStorage.getItem('kellions_enable_isp_affinity') !== 'false';
    } catch { return true; }
  });
  const [enableTracerouteValidation, setEnableTracerouteValidation] = useState(() => {
    try {
      return localStorage.getItem('kellions_enable_traceroute_validation') === 'true';
    } catch { return false; }
  });
  
  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('kellions_enable_isp_affinity', String(enableISPAffinity));
    } catch {}
  }, [enableISPAffinity]);
  
  useEffect(() => {
    try {
      localStorage.setItem('kellions_enable_traceroute_validation', String(enableTracerouteValidation));
    } catch {}
  }, [enableTracerouteValidation]);
  
  // Get preferred server from ISP affinity
  const preferredServer = ispInfo && enableISPAffinity 
    ? ispAffinity.getPreferredServer(ispInfo.isp, ispInfo.asn, ispInfo.connectionType)
    : null;
  
  const abortRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const testStartTime = useRef<number>(0);
  const metricsRef = useRef<StreamMetrics>({
    bytesReceived: 0,
    startTime: 0,
    lastUpdateTime: 0,
    samples: []
  });

  // Get current config based on mode
  const CONFIG = proMode ? PRO_CONFIG : STANDARD_CONFIG;

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  // CDN-based latency test — measures pure network RTT, not Edge Function overhead
  const runLatencyTest = useCallback(async (sampleCount: number = 20): Promise<{ latency: number; jitter: number; packetLoss: number; samples: number[] }> => {
    const WARMUP_SAMPLES = 2;
    const totalSamples = sampleCount + WARMUP_SAMPLES;
    addLog(`Starting CDN latency measurement (${sampleCount} samples + ${WARMUP_SAMPLES} warm-up)...`);
    const allSamples: number[] = [];
    let failed = 0;
    
    for (let i = 0; i < totalSamples; i++) {
      if (abortRef.current) throw new Error("Aborted");
      
      const pingStart = performance.now();
      try {
        const pingUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/speed-test/ping.txt?t=${Date.now()}&r=${Math.random()}`;
        if (i === 0) addLog(`Latency probe URL: ${pingUrl.split('?')[0]}`);
        const response = await fetch(pingUrl, {
          method: 'GET',
          cache: 'no-store',
          mode: 'cors',
        });
        
        if (response.ok) {
          if (response.status >= 300) {
            if (i === 0) addLog(`⚠ Latency probe returned ${response.status} — misconfigured`);
            failed++;
            continue;
          }
          await response.text(); // consume body
          const rtt = performance.now() - pingStart;
          allSamples.push(rtt);
          
          if (i >= WARMUP_SAMPLES) {
            setLatencyData(prev => [...prev, { time: i - WARMUP_SAMPLES, speed: 0, latency: rtt }]);
          }
          if (i % 5 === 0) {
            const label = i < WARMUP_SAMPLES ? ' (warm-up)' : '';
            addLog(`Ping ${i + 1}/${totalSamples}: ${rtt.toFixed(1)}ms${label}`);
          }
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
      
      setProgress(((i + 1) / totalSamples) * 100);
      await new Promise(r => setTimeout(r, proMode ? 25 : 50));
    }
    
    // Drop warm-up samples
    const samples = allSamples.slice(WARMUP_SAMPLES);
    
    if (samples.length === 0) {
      throw new Error("All ping requests failed - cannot measure latency");
    }
    
    // Use median instead of mean for resilience against outliers
    const sorted = [...samples].sort((a, b) => a - b);
    const latency = sorted[Math.floor(sorted.length / 2)];
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance = samples.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / samples.length;
    const jitter = Math.sqrt(variance);
    const packetLoss = (failed / totalSamples) * 100;
    
    addLog(`Network latency (CDN RTT): ${latency.toFixed(1)}ms, Jitter: ${jitter.toFixed(2)}ms, Loss: ${packetLoss.toFixed(1)}%`);
    
    return { latency, jitter, packetLoss, samples };
  }, [addLog, proMode]);

  // CDN-based multi-stream download test with XHR for accurate byte tracking
  const runDownloadTest = useCallback(async (): Promise<{ 
    speed: number; burstSpeed: number; sustainedSpeed: number; stability: number;
    maxStreamsUsed: number; linkSaturated: boolean; limitingFactor: string | null;
    latencyDuringDownload: number;
    serverSwitchRequired?: boolean;
    switchReason?: string;
  }> => {
    addLog(proMode ? "Starting CDN-based PRO download test..." : "Starting CDN-based download test...");
    
    // Select CDN payload based on expected speed
    const expectedSpeed = ispInfo?.expectedSpeed?.download?.typical || 100;
    const payload = selectCDNPayload(expectedSpeed);
    const cdnUrl = `${CDN_BASE}/${payload.file}`;
    
    addLog(`CDN payload: ${payload.file} (${payload.sizeMB}MB) for expected ${expectedSpeed} Mbps`);
    addLog(`Configuration: ${CONFIG.INITIAL_STREAMS} streams, adaptive scaling to ${CONFIG.MAX_STREAMS}`);
    setDownloadData([]);
    
    let totalBytesReceived = 0;
    let streamCount = CONFIG.INITIAL_STREAMS;
    let maxStreamsUsed = streamCount;
    const speedSamples: number[] = [];
    const startTime = performance.now();
    let warmUpComplete = false;
    let maxInstantSpeed = 0;
    let testComplete = false;
    let detectedLimitingFactor: string | null = null;
    let hasScaledUp = false;
    const downloadLatencies: number[] = [];
    
    // Server switching detection (Pro mode)
    let serverSwitchRequired = false;
    let switchReason = '';
    let consecutiveStalls = 0;
    let consecutiveLatencySpikes = 0;
    let baselineLatency: number | null = null;
    const STALL_THRESHOLD = 5;
    const LATENCY_SPIKE_MULTIPLIER = 3;
    const LATENCY_SPIKE_THRESHOLD_COUNT = 3;
    const RAMP_UP_CHECK_SAMPLES = 20;
    const MIN_RAMP_UP_SPEED = 0.5;
    
    setActiveStreams(streamCount);
    
    // Active XHR tracking for cleanup
    const activeXHRs: XMLHttpRequest[] = [];
    
    // CDN-based XHR download with progress tracking
    const createDownloadXHR = (streamId: number): void => {
      if (abortRef.current || testComplete) return;
      
      const xhr = new XMLHttpRequest();
      activeXHRs.push(xhr);
      
      // Use CDN storage URL with cache-busting query params
      const url = `${cdnUrl}?t=${Date.now()}&s=${streamId}&r=${Math.random()}`;
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.timeout = CONFIG.XHR_TIMEOUT;
      
      let lastLoaded = 0;
      
      xhr.onprogress = (e) => {
        if (e.loaded > lastLoaded) {
          totalBytesReceived += (e.loaded - lastLoaded);
          lastLoaded = e.loaded;
        }
      };
      
      xhr.onload = () => {
        // Restart immediately for continuous saturation (re-download same CDN file)
        if (!abortRef.current && !testComplete) {
          setTimeout(() => createDownloadXHR(streamId), 0);
        }
      };
      
      xhr.onerror = xhr.ontimeout = () => {
        // Retry on error
        if (!abortRef.current && !testComplete) {
          setTimeout(() => createDownloadXHR(streamId), 100);
        }
      };
      
      xhr.send();
    };
    
    // Start initial streams - parallel CDN downloads
    for (let i = 0; i < streamCount; i++) {
      createDownloadXHR(i);
    }
    
    addLog(`Started ${streamCount} parallel CDN download streams`);
    
    // Latency during download (for server switch detection in Pro mode)
    const latencyDuringTest = async (): Promise<void> => {
      while (!abortRef.current && !testComplete && !serverSwitchRequired) {
        await new Promise(r => setTimeout(r, proMode ? 200 : 500));
        const pingStart = performance.now();
        try {
           const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/speed-test/ping.txt?t=${Date.now()}&r=${Math.random()}`, { 
            method: 'GET', 
            cache: 'no-store',
            mode: 'cors',
          });
          if (resp.ok) {
            const latency = performance.now() - pingStart;
            downloadLatencies.push(latency);
            
            if (baselineLatency === null && downloadLatencies.length >= 3) {
              baselineLatency = downloadLatencies.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
            }
            
            if (proMode && baselineLatency !== null && warmUpComplete) {
              if (latency > baselineLatency * LATENCY_SPIKE_MULTIPLIER) {
                consecutiveLatencySpikes++;
                if (consecutiveLatencySpikes >= LATENCY_SPIKE_THRESHOLD_COUNT) {
                  serverSwitchRequired = true;
                  switchReason = `Latency spikes (${latency.toFixed(0)}ms vs ${baselineLatency.toFixed(0)}ms)`;
                  addLog(`⚠ Server switch: ${switchReason}`);
                }
              } else {
                consecutiveLatencySpikes = 0;
              }
            }
          }
        } catch { /* ignore */ }
      }
    };
    
    if (proMode) latencyDuringTest();
    
    // High-frequency measurement loop
    let lastBytesReceived = 0;
    let lastMeasureTime = performance.now();
    let sampleIndex = 0;
    let consecutiveStableSamples = 0;
    let lastSpeed = 0;
    
    while (!abortRef.current && !testComplete && !serverSwitchRequired) {
      await new Promise(r => setTimeout(r, CONFIG.SAMPLE_INTERVAL));
      
      const now = performance.now();
      const elapsed = now - startTime;
      const intervalElapsed = (now - lastMeasureTime) / 1000;
      const intervalBytes = totalBytesReceived - lastBytesReceived;
      
      // Calculate instant speed in Mbps
      const instantSpeed = (intervalBytes * 8) / (intervalElapsed * 1000000);
      
      if (elapsed > CONFIG.WARM_UP_DURATION) {
        if (!warmUpComplete) {
          warmUpComplete = true;
          addLog("Warm-up complete, measuring peak throughput via CDN...");
        }
        speedSamples.push(instantSpeed);
        maxInstantSpeed = Math.max(maxInstantSpeed, instantSpeed);
        
        // Dynamic scaling - add more streams if speed > 400 Mbps and not saturated
        if (!hasScaledUp && speedSamples.length >= 15) {
          const recentSamples = speedSamples.slice(-15);
          const avgRecent = recentSamples.reduce((a, b) => a + b, 0) / recentSamples.length;
          const speedVariance = recentSamples.reduce((sum, s) => sum + Math.pow(s - avgRecent, 2), 0) / recentSamples.length;
          const speedCV = Math.sqrt(speedVariance) / (avgRecent || 1);
          
          // Scale up if speed > 400 Mbps and stable, or if not saturated
          if (speedCV < 0.2 && streamCount < CONFIG.MAX_STREAMS && avgRecent > 400) {
            const newStreams = Math.min(4, CONFIG.MAX_STREAMS - streamCount);
            addLog(`Scaling: +${newStreams} CDN streams (${avgRecent.toFixed(0)} Mbps stable)`);
            
            for (let i = 0; i < newStreams; i++) {
              createDownloadXHR(streamCount + i);
            }
            streamCount += newStreams;
            maxStreamsUsed = Math.max(maxStreamsUsed, streamCount);
            setActiveStreams(streamCount);
            hasScaledUp = true;
          }
        }
        
        // Detect link saturation
        if (Math.abs(instantSpeed - lastSpeed) / Math.max(instantSpeed, 1) < 0.1) {
          consecutiveStableSamples++;
        } else {
          consecutiveStableSamples = 0;
        }
        
        // Pro mode: Detect stalls
        if (proMode && warmUpComplete && instantSpeed < MIN_RAMP_UP_SPEED) {
          consecutiveStalls++;
          if (consecutiveStalls >= STALL_THRESHOLD) {
            serverSwitchRequired = true;
            switchReason = `Throughput stalled (${instantSpeed.toFixed(2)} Mbps)`;
            addLog(`⚠ Server switch: ${switchReason}`);
          }
        } else {
          consecutiveStalls = 0;
        }
        
        // Check ramp-up (Pro mode)
        if (proMode && speedSamples.length === RAMP_UP_CHECK_SAMPLES && !serverSwitchRequired) {
          const avgRampUp = speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length;
          if (avgRampUp < MIN_RAMP_UP_SPEED * 2) {
            serverSwitchRequired = true;
            switchReason = `Ramp-up failed (${avgRampUp.toFixed(2)} Mbps)`;
            addLog(`⚠ Server switch: ${switchReason}`);
          }
        }
        
        lastSpeed = instantSpeed;
      }
      
      setCurrentSpeed(instantSpeed);
      setDownloadData(prev => [...prev.slice(-100), { time: sampleIndex++, speed: instantSpeed }]);
      
      const progressPct = Math.min(100, (elapsed / CONFIG.MIN_TEST_DURATION) * 100);
      setProgress(progressPct);
      
      // Completion check
      const minSamples = proMode ? 80 : 40;
      if (elapsed >= CONFIG.MIN_TEST_DURATION && speedSamples.length >= minSamples) {
        testComplete = true;
      }
      
      lastBytesReceived = totalBytesReceived;
      lastMeasureTime = now;
    }
    
    // Cleanup all XHRs
    testComplete = true;
    activeXHRs.forEach(xhr => {
      try { xhr.abort(); } catch { /* ignore */ }
    });
    setActiveStreams(0);
    
    // Server switch return
    if (serverSwitchRequired) {
      addLog(`Download aborted: ${switchReason}`);
      return {
        speed: 0, burstSpeed: 0, sustainedSpeed: 0, stability: 0,
        maxStreamsUsed, linkSaturated: false, limitingFactor: switchReason,
        latencyDuringDownload: downloadLatencies.length > 0 
          ? downloadLatencies.reduce((a, b) => a + b, 0) / downloadLatencies.length : 0,
        serverSwitchRequired: true, switchReason
      };
    }
    
    if (speedSamples.length === 0) throw new Error("No speed samples collected");
    
    // Trim tail samples (last 300ms worth)
    const tailTrimCount = Math.floor((CONFIG as any).TAIL_TRIM_DURATION / CONFIG.SAMPLE_INTERVAL);
    const trimmedSamples = speedSamples.length > tailTrimCount + 10
      ? speedSamples.slice(0, speedSamples.length - tailTrimCount)
      : speedSamples;
    
    // Calculate final metrics using trimmed samples
    const sortedSamples = [...trimmedSamples].sort((a, b) => a - b);
    const avgSpeed = trimmedSamples.reduce((a, b) => a + b, 0) / trimmedSamples.length;
    
    // Use P90 as the reported speed
    const p90Index = Math.floor(sortedSamples.length * 0.90);
    const reportedSpeed = sortedSamples[p90Index] || avgSpeed;
    
    const p75Index = Math.floor(sortedSamples.length * 0.75);
    const sustainedSpeed = sortedSamples[p75Index] || avgSpeed;
    
    const p95Index = Math.floor(sortedSamples.length * 0.95);
    const burstSpeed = sortedSamples[p95Index] || maxInstantSpeed;
    
    const mean = avgSpeed;
    const variance = trimmedSamples.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / trimmedSamples.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;
    const stability = Math.max(0, Math.min(100, (1 - cv) * 100));
    
    const linkWasSaturated = consecutiveStableSamples >= 20 || (proMode && stability >= 85);
    
    if (!linkWasSaturated && proMode) {
      if (streamCount >= CONFIG.MAX_STREAMS) {
        detectedLimitingFactor = "Max streams reached";
      } else if (stability < 60) {
        detectedLimitingFactor = "Network congestion detected";
      }
    }
    
    const latencyDuringDownload = downloadLatencies.length > 0 
      ? downloadLatencies.reduce((a, b) => a + b, 0) / downloadLatencies.length : 0;
    
    addLog(`Download: ${reportedSpeed.toFixed(1)} Mbps (P90), Peak: ${burstSpeed.toFixed(1)} Mbps`);
    addLog(`Data: ${(totalBytesReceived / (1024 * 1024)).toFixed(1)} MB via CDN, Streams: ${maxStreamsUsed}`);
    
    return { 
      speed: reportedSpeed, burstSpeed, sustainedSpeed, stability,
      maxStreamsUsed, linkSaturated: linkWasSaturated, limitingFactor: detectedLimitingFactor,
      latencyDuringDownload, serverSwitchRequired: false
    };
  }, [addLog, CONFIG, proMode, ispInfo]);

  // Generate random data efficiently
  const generateRandomData = useCallback((size: number): ArrayBuffer => {
    const buffer = new ArrayBuffer(size);
    const view = new Uint8Array(buffer);
    const chunkSize = 65536;
    for (let offset = 0; offset < size; offset += chunkSize) {
      const length = Math.min(chunkSize, size - offset);
      crypto.getRandomValues(new Uint8Array(buffer, offset, length));
    }
    return buffer;
  }, []);

// Server-authoritative upload test using dedicated speed-upload endpoint
  // Only counts streams with valid server ACKs — never uses client timers for speed math
  const runUploadTest = useCallback(async (baseLatency: number, downloadSpeed?: number): Promise<{ 
    speed: number | null; latencyUnderLoad: number; latencyDuringUpload: number;
    validationStatus?: 'valid' | 'suspicious' | 'invalid' | 'failed';
    validationMessage?: string;
  }> => {
    addLog("=== SERVER-AUTHORITATIVE UPLOAD ENGINE ===");
    addLog(`Fixed line profile: ${LINE_PROFILE.maxUploadMbps} Mbps upload cap`);
    setUploadData([]);
    
    const maxUploadMbps = LINE_PROFILE.maxUploadMbps;
    const uploadPhaseDuration = (CONFIG as any).UPLOAD_PHASE_DURATION || 5000;
    const loadLatencies: number[] = [];
    
    // Pre-generate upload chunks
    const chunkSizeMB = CONFIG.UPLOAD_CHUNK_SIZE;
    const chunkSize = chunkSizeMB * 1024 * 1024;
    const numChunks = 2;
    const uploadChunks: ArrayBuffer[] = [];
    
    addLog(`Generating ${numChunks} × ${chunkSizeMB}MB test chunks...`);
    for (let i = 0; i < numChunks; i++) {
      uploadChunks.push(generateRandomData(chunkSize));
    }
    
    // Strict ACK tracking
    interface ValidACK {
      bytes_received: number;
      server_ms: number;
      server_mbps: number;
      stream_id: string;
    }
    const validAcks: ValidACK[] = [];
    let failedRequests = 0;
    let invalidSamples = 0;
    let lastHttpStatus = 0;
    let lastErrorReason = '';
    let testComplete = false;
    const activeControllers: AbortController[] = [];
    const phaseStart = performance.now();
    
    // Determine initial stream count
    let streamCount = CONFIG.UPLOAD_STREAMS;
    let hasScaled = false;
    
    setActiveStreams(streamCount);
    addLog(`Starting ${streamCount} upload streams (${uploadPhaseDuration / 1000}s window)...`);
    
    // Single upload request to dedicated endpoint
    const sendUpload = async (streamId: number): Promise<void> => {
      while (!abortRef.current && !testComplete) {
        const controller = new AbortController();
        activeControllers.push(controller);
        
        const chunk = uploadChunks[streamId % uploadChunks.length];
        
        try {
          const response = await fetch(
            `${SPEED_UPLOAD_URL}?s=${streamId}&t=${Date.now()}`,
            {
              method: 'POST',
              body: chunk,
              signal: controller.signal,
              headers: { 'Content-Type': 'application/octet-stream' },
            }
          );
          
          lastHttpStatus = response.status;
          
          if (!response.ok) {
            // HTTP error — log and count as failed, do NOT compute Mbps
            const errorBody = await response.text().catch(() => 'unknown');
            lastErrorReason = `HTTP ${response.status}: ${errorBody}`;
            failedRequests++;
            addLog(`Upload stream ${streamId} failed: ${lastErrorReason}`);
            // Brief backoff before retry
            await new Promise(r => setTimeout(r, 200));
            continue;
          }
          
          const result = await response.json();
          
          // Strict ACK validation: all fields must be present and sane
          if (
            result.ok !== true ||
            !result.bytes_received || result.bytes_received <= 0 ||
            !result.server_ms || result.server_ms < 1
          ) {
            // Invalid ACK — missing fields or bogus timing
            invalidSamples++;
            continue;
          }
          
          // Compute stream Mbps ONLY from server values
          const streamMbps = (result.bytes_received * 8) / (result.server_ms / 1000) / 1_000_000;
          
          // Anomaly filter: discard if single stream > 2× line cap
          if (streamMbps > maxUploadMbps * 2) {
            invalidSamples++;
            continue;
          }
          
          validAcks.push({
            bytes_received: result.bytes_received,
            server_ms: result.server_ms,
            server_mbps: streamMbps,
            stream_id: result.stream_id || String(streamId),
          });
        } catch (err: any) {
          if (!abortRef.current && !testComplete) {
            failedRequests++;
            lastErrorReason = err?.message || 'Network error';
            await new Promise(r => setTimeout(r, 100));
          }
        }
      }
    };
    
    // Latency under load measurement
    const latencyMeasurement = async (): Promise<void> => {
      while (!abortRef.current && !testComplete) {
        await new Promise(r => setTimeout(r, proMode ? 300 : 500));
        const pingStart = performance.now();
        try {
          const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/speed-test/ping.txt?t=${Date.now()}&r=${Math.random()}`, { method: 'GET', cache: 'no-store', mode: 'cors' });
          if (resp.ok) await resp.text();
          loadLatencies.push(performance.now() - pingStart);
        } catch {
          loadLatencies.push(baseLatency * 2);
        }
      }
    };
    
    // Start all streams + latency measurement
    const streamPromises: Promise<void>[] = [];
    for (let i = 0; i < streamCount; i++) {
      streamPromises.push(sendUpload(i));
    }
    latencyMeasurement();
    
    // Progress tracking loop — UI updates only
    let sampleIndex = 0;
    const progressLoop = async (): Promise<void> => {
      while (!abortRef.current && !testComplete) {
        await new Promise(r => setTimeout(r, 200));
        
        const elapsed = performance.now() - phaseStart;
        const progressPct = Math.min(100, (elapsed / uploadPhaseDuration) * 100);
        setProgress(progressPct);
        
        // Show live estimate from valid ACKs (for UI only)
        if (validAcks.length > 0) {
          const totalBytes = validAcks.reduce((sum, r) => sum + r.bytes_received, 0);
          const elapsedSec = elapsed / 1000;
          const liveMbps = elapsedSec > 0 ? (totalBytes * 8) / (elapsedSec * 1_000_000) : 0;
          setCurrentSpeed(liveMbps);
          setUploadData(prev => [...prev.slice(-100), { time: sampleIndex++, speed: liveMbps }]);
        }
        
        // Adaptive scaling: if > 60 Mbps after 2s and haven't scaled yet
        if (!hasScaled && elapsed > 2000 && validAcks.length >= 4) {
          const totalBytes = validAcks.reduce((sum, r) => sum + r.bytes_received, 0);
          const currentMbps = (totalBytes * 8) / ((elapsed / 1000) * 1_000_000);
          if (currentMbps > 60 && streamCount < 6) {
            const extraStreams = 2;
            addLog(`Scaling: +${extraStreams} upload streams (${currentMbps.toFixed(0)} Mbps detected)`);
            for (let i = 0; i < extraStreams; i++) {
              streamPromises.push(sendUpload(streamCount + i));
            }
            streamCount += extraStreams;
            setActiveStreams(streamCount);
            hasScaled = true;
          }
        }
        
        // End after phase duration
        if (elapsed >= uploadPhaseDuration) {
          testComplete = true;
        }
      }
    };
    
    await progressLoop();
    
    // Cleanup
    testComplete = true;
    activeControllers.forEach(ctrl => {
      try { ctrl.abort(); } catch { /* ignore */ }
    });
    setActiveStreams(0);
    
    // === SUMMARY LOGGING ===
    addLog(`Upload summary: valid_acks=${validAcks.length}, failed_requests=${failedRequests}, invalid_samples=${invalidSamples}`);
    
    // === 0-ACK END CONDITION ===
    if (validAcks.length === 0) {
      const errorMsg = `Upload endpoint not reachable or rejecting requests. Last HTTP status: ${lastHttpStatus || 'none'}, reason: ${lastErrorReason || 'unknown'}`;
      addLog(`❌ ${errorMsg}`);
      
      const latencyUnderLoad = loadLatencies.length > 0 
        ? loadLatencies.reduce((a, b) => a + b, 0) / loadLatencies.length : baseLatency;
      
      return {
        speed: null,
        latencyUnderLoad,
        latencyDuringUpload: latencyUnderLoad,
        validationStatus: 'failed',
        validationMessage: errorMsg,
      };
    }
    
    // === SERVER-AUTHORITATIVE AGGREGATION ===
    // total_bytes = sum(bytes_received_i) / phase_time = fixed window → upload_mbps
    const phaseDurationSec = uploadPhaseDuration / 1000;
    const totalServerBytes = validAcks.reduce((sum, r) => sum + r.bytes_received, 0);
    let reportedSpeed = (totalServerBytes * 8) / (phaseDurationSec * 1_000_000);
    
    addLog(`Server-verified: ${validAcks.length} ACKs, ${(totalServerBytes / (1024 * 1024)).toFixed(1)} MB in ${phaseDurationSec}s`);
    addLog(`Raw upload: ${reportedSpeed.toFixed(1)} Mbps`);
    
    // === VALIDATION — single pass, single message ===
    let validationStatus: 'valid' | 'suspicious' | 'invalid' = 'valid';
    let validationMessage = '';
    
    // Cap to line profile if exceeded
    if (reportedSpeed > maxUploadMbps * 1.2) {
      validationStatus = 'suspicious';
      validationMessage = `Upload exceeded provisioned line rate (${maxUploadMbps} Mbps). Value normalized.`;
      addLog(`⚠️ ${validationMessage}`);
      reportedSpeed = maxUploadMbps;
    }
    
    // Impossible asymmetry check
    if (downloadSpeed && downloadSpeed < 10 && reportedSpeed > 100) {
      validationStatus = 'invalid';
      validationMessage = `Impossible asymmetry: Download ${downloadSpeed.toFixed(1)} vs Upload ${reportedSpeed.toFixed(0)} Mbps`;
      addLog(`⚠️ INVALID: ${validationMessage}`);
      reportedSpeed = Math.max(downloadSpeed * 0.3, 1);
    }
    
    const latencyUnderLoad = loadLatencies.length > 0 
      ? loadLatencies.reduce((a, b) => a + b, 0) / loadLatencies.length : baseLatency;
    
    addLog(`Upload (final): ${reportedSpeed.toFixed(1)} Mbps | Validation: ${validationStatus.toUpperCase()}`);
    
    return { 
      speed: reportedSpeed, 
      latencyUnderLoad, 
      latencyDuringUpload: latencyUnderLoad,
      validationStatus,
      validationMessage,
    };
  }, [addLog, CONFIG, proMode, generateRandomData]);

  // Get AI analysis
  const getAIAnalysis = useCallback(async (results: SpeedResult) => {
    addLog("Requesting AI analysis...");
    
    try {
      const { data, error } = await supabase.functions.invoke('speed-analyze', {
        body: { results, proMode }
      });
      
      if (error) throw error;
      
      if (data?.analysis) {
        setAiAnalysis(data.analysis);
        addLog("AI analysis complete");
      }
    } catch (error) {
      addLog(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [addLog, proMode]);

  // CRITICAL: Detect network path failure (zero download with high latency/jitter)
  const detectNetworkFailure = useCallback((
    download: number,
    upload: number,
    latency: number,
    jitter: number,
    stability: number,
    burstSpeed: number,
    sustainedSpeed: number
  ): NetworkFailure => {
    // Default: no failure
    const noFailure: NetworkFailure = {
      isFailure: false,
      failureType: 'none',
      severity: 'none',
      diagnosis: '',
      possibleCauses: [],
      recommendedActions: [],
      shouldRetry: false,
      retryWithDifferentServer: false
    };

    // CRITICAL: Zero download with any latency = complete download path failure
    const isZeroDownload = download < 0.1 && burstSpeed < 0.1 && sustainedSpeed < 0.1;
    const isHighLatency = latency > 100;
    const isExtremeJitter = jitter > 100 || jitter > latency * 0.8;
    const isZeroStability = stability < 5;
    
    // Case 1: Complete download path failure
    if (isZeroDownload) {
      const possibleCauses: string[] = [];
      const recommendedActions: string[] = [];
      
      if (isHighLatency && isExtremeJitter) {
        possibleCauses.push("Severe routing instability between you and test server");
        possibleCauses.push("Wireless link collapse (if on WiFi)");
        possibleCauses.push("VPN tunnel disruption");
        possibleCauses.push("ISP-side inbound traffic blocking or DPI");
      } else if (isHighLatency) {
        possibleCauses.push("Test server endpoint failure");
        possibleCauses.push("Firewall blocking inbound traffic");
        possibleCauses.push("Severe packet loss on receive path");
      } else {
        possibleCauses.push("Download endpoint not delivering payload");
        possibleCauses.push("Browser or OS blocking large downloads");
        possibleCauses.push("Local security software interference");
      }
      
      recommendedActions.push("Switch to a different test server");
      recommendedActions.push("Check if VPN or proxy is interfering");
      recommendedActions.push("Try disabling browser extensions temporarily");
      recommendedActions.push("Test on a different device or network");
      
      return {
        isFailure: true,
        failureType: 'download_path_failure',
        severity: 'critical',
        diagnosis: `Your connection cannot reliably receive data. Download traffic is failing entirely (0.00 Mbps) with ${isHighLatency ? 'high latency' : 'normal latency'} (${latency.toFixed(0)}ms) and ${isExtremeJitter ? 'extreme jitter' : 'normal jitter'} (${jitter.toFixed(0)}ms). This is a network failure, not a speed issue.`,
        possibleCauses,
        recommendedActions,
        shouldRetry: true,
        retryWithDifferentServer: true
      };
    }
    
    // Case 2: Severe instability (very low download with extreme metrics)
    if (download < 1 && (isExtremeJitter || isZeroStability)) {
      return {
        isFailure: true,
        failureType: 'severe_instability',
        severity: 'critical',
        diagnosis: `Severe network instability detected. Download speed (${download.toFixed(2)} Mbps) is near zero with ${stability.toFixed(0)}% stability and ${jitter.toFixed(0)}ms jitter. The connection is too unstable for accurate measurement.`,
        possibleCauses: [
          "Wireless interference or signal degradation",
          "Network congestion at ISP level",
          "Failing network hardware",
          "Mobile connection switching towers"
        ],
        recommendedActions: [
          "Move closer to WiFi router if on wireless",
          "Try a wired connection",
          "Wait and retry in a few minutes",
          "Contact ISP if issue persists"
        ],
        shouldRetry: true,
        retryWithDifferentServer: true
      };
    }
    
    // Case 3: Routing failure indicators (high latency, moderate jitter, low throughput)
    if (download < 5 && latency > 150 && jitter > 50) {
      return {
        isFailure: true,
        failureType: 'routing_failure',
        severity: 'warning',
        diagnosis: `Possible routing issues detected. Very low throughput (${download.toFixed(1)} Mbps) with high latency (${latency.toFixed(0)}ms) and significant jitter (${jitter.toFixed(0)}ms) suggests path instability.`,
        possibleCauses: [
          "Suboptimal routing to test server",
          "Network path congestion",
          "Geographical distance to server"
        ],
        recommendedActions: [
          "Try a different test server closer to your location",
          "Check for ISP issues in your area",
          "Try testing at different time of day"
        ],
        shouldRetry: true,
        retryWithDifferentServer: true
      };
    }
    
    return noFailure;
  }, []);

  // Detect ISP and connection information (Pro Mode)
  const runConnectionDetection = useCallback(async (): Promise<ISPInfo | null> => {
    addLog("=== PRE-TEST INTELLIGENCE PHASE ===");
    addLog("Detecting ISP and connection type...");
    
    try {
      const response = await fetch(`${CONNECTION_INTEL_URL}?action=detect&t=${Date.now()}`);
      if (!response.ok) throw new Error("Connection detection failed");
      
      const info: ISPInfo = await response.json();
      setIspInfo(info);
      
      addLog(`ISP: ${info.isp} (${info.asn})`);
      addLog(`Connection Type: ${info.connectionType}`);
      const normalizedRegion = (info as any).normalizedRegion || info.region;
      addLog(`Location: ${info.city}, ${info.country}`);
      addLog(`Raw region: ${info.region} → Normalized region: ${normalizedRegion} (country=${info.country})`);
      addLog(`Expected Download: ${info.expectedSpeed.download.min}-${info.expectedSpeed.download.max} Mbps (typical: ${info.expectedSpeed.download.typical} Mbps)`);
      addLog(`Expected Upload: ${info.expectedSpeed.upload.min}-${info.expectedSpeed.upload.max} Mbps (typical: ${info.expectedSpeed.upload.typical} Mbps)`);
      addLog(`Expected Latency: ${info.expectedLatency.min}-${info.expectedLatency.max} ms`);
      
      if (info.warnings.length > 0) {
        info.warnings.forEach(w => addLog(`⚠ ${w}`));
      }
      
      return info;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Detection failed';
      addLog(`Connection detection failed: ${msg}`);
      return null;
    }
  }, [addLog]);

  // CDN endpoint health check - verify storage files are accessible
  const verifyCDNEndpoint = useCallback(async (): Promise<{
    reachable: boolean;
    bytesReceived: number;
    latency: number;
    error?: string;
  }> => {
    addLog("  Verifying CDN download endpoint...");
    
    // Try files in order of preference
    const filesToTry = ['50mb.bin', '25mb.bin', '10mb.bin'];
    
    for (const file of filesToTry) {
      try {
        const startTime = performance.now();
        const response = await fetch(`${CDN_BASE}/${file}`, { method: 'HEAD', cache: 'no-store' });
        const latency = performance.now() - startTime;
        
        if (response.ok) {
          const contentLength = parseInt(response.headers.get('content-length') || '0');
          addLog(`    ✓ Download endpoint validation successful via CDN (${file}, ${(contentLength / 1024 / 1024).toFixed(0)}MB, ${latency.toFixed(0)}ms)`);
          return { reachable: true, bytesReceived: contentLength, latency };
        }
      } catch {
        // Try next file
      }
    }
    
    return { reachable: false, bytesReceived: 0, latency: 0, error: 'CDN files not accessible' };
  }, [addLog]);

  // Real-time server selection with physics-based validation and region locking
  const runRealTimeServerSelection = useCallback(async (ispInfo: ISPInfo): Promise<ServerCandidate | null> => {
    addLog("=== REAL-TIME SERVER SELECTION ===");
    addLog(`Connection type: ${ispInfo.connectionType}`);
    addLog(`Location: ${ispInfo.city}, ${ispInfo.country}`);
    addLog("Applying physics-based validation and region locking...");
    
    try {
      // Get server list with connection-type constraints
      const serversResponse = await fetch(
        `${CONNECTION_INTEL_URL}?action=servers&country=${ispInfo.country}&city=${ispInfo.city}&connectionType=${encodeURIComponent(ispInfo.connectionType)}&t=${Date.now()}`
      );
      
      if (!serversResponse.ok) throw new Error("Server discovery failed");
      
      const serverData = await serversResponse.json();
      const serverList = serverData.servers || [];
      const constraints = serverData.constraints;
      const filtered = serverData.filtered || [];
      
      // Log constraints and filtered servers
      if (constraints) {
        addLog(`Constraints: max ${constraints.maxDistanceKm}km, ${constraints.maxConcurrentStreams} streams`);
      }
      
      if (filtered.length > 0) {
        addLog(`Filtered out ${filtered.length} servers:`);
        filtered.slice(0, 3).forEach((f: any) => addLog(`  ✗ ${f.name}: ${f.reason}`));
        if (filtered.length > 3) addLog(`  ... and ${filtered.length - 3} more`);
      }
      
      if (serverList.length === 0) {
        addLog("🚫 CRITICAL: No valid servers for your connection type!");
        addLog("Cannot proceed with Pro Mode - falling back to standard mode");
        toast.error("No valid test servers available for your connection type");
        return null;
      }
      
      // Log client region info
      if (serverData.clientLocation) {
        addLog(`Client region: ${serverData.clientLocation.region}`);
      }
      
      addLog(`Found ${serverList.length} eligible servers`);
      
      // Check for logical nodes (all same URL)
      const uniqueUrls = new Set(serverList.map((s: any) => s.url));
      if (uniqueUrls.size === 1 && serverList.length > 1) {
        addLog(`ℹ All ${serverList.length} servers are logical nodes (single endpoint)`);
      }
      
      // Check for ISP affinity preferred server
      if (enableISPAffinity) {
        const preferred = ispAffinity.getPreferredServer(ispInfo.isp, ispInfo.asn, ispInfo.connectionType);
        if (preferred) {
          addLog(`ISP Affinity: Preferred server "${preferred.serverName}" (${preferred.confidence}% confidence)`);
          // Move preferred server to front of list if it exists
          const preferredIndex = serverList.findIndex((s: any) => s.id === preferred.serverId);
          if (preferredIndex > 0) {
            const [preferredServer] = serverList.splice(preferredIndex, 1);
            serverList.unshift(preferredServer);
            addLog(`  ↑ Boosted to top of selection queue`);
          }
        }
      }
      
      // Probe servers with physics-based RTT validation
      const probedServers: ServerCandidate[] = [];
      const quarantinedServers: ServerCandidate[] = [];
      
      for (const server of serverList) {
        if (abortRef.current) throw new Error("Aborted");
        
        setServers(prev => [...prev.filter(s => s.id !== server.id), { ...server, status: 'probing' }]);
        
        try {
          // Probe with client location for physics validation
          const probeResponse = await fetch(
            `${CONNECTION_INTEL_URL}?action=probe&server=${server.id}&comprehensive=true&clientCity=${encodeURIComponent(ispInfo.city)}&minRTT=${server.minPhysicalRTT || 0}&t=${Date.now()}`
          );
          
          if (probeResponse.ok) {
            const probeResult = await probeResponse.json();
            
            // Check for physics violation (impossible latency)
            if (probeResult.latencyValid === false) {
              addLog(`  ⚠ ${server.name}: PHYSICS VIOLATION - ${probeResult.validationMessage}`);
              quarantinedServers.push({
                ...server,
                latency: probeResult.latency,
                status: 'quarantined' as const,
                latencyValid: false,
                selectionReason: probeResult.validationMessage
              });
              continue; // Skip this server
            }
            
            // Calculate weighted score
            const latencyScore = Math.max(0, 100 - probeResult.latency);
            const jitterScore = Math.max(0, 50 - (probeResult.jitter * 10));
            const rampScore = probeResult.rampScore || 50;
            const stabilityScore = probeResult.stability || 80;
            const weightedScore = (latencyScore * 0.4) + (jitterScore * 0.2) + (rampScore * 0.3) + (stabilityScore * 0.1);
            
            const probedServer: ServerCandidate = {
              ...server,
              latency: probeResult.latency,
              jitter: probeResult.jitter,
              packetLoss: probeResult.packetLoss || 0,
              rampScore,
              weightedScore,
              latencyValid: probeResult.latencyValid !== false,
              minPhysicalRTT: probeResult.physicsMinRTT,
              status: 'online' as const
            };
            
            probedServers.push(probedServer);
            addLog(`  ✓ ${server.name}: ${probeResult.latency.toFixed(1)}ms (min ${probeResult.physicsMinRTT?.toFixed(1) || '?'}ms), score: ${weightedScore.toFixed(0)}`);
          } else {
            addLog(`  ✗ ${server.name}: OFFLINE`);
          }
        } catch {
          addLog(`  ✗ ${server.name}: UNREACHABLE`);
        }
      }
      
      // Report quarantined servers
      if (quarantinedServers.length > 0) {
        addLog(`⚠ ${quarantinedServers.length} server(s) quarantined for physics violations`);
      }
      
      // Sort by weighted score (highest = best)
      const onlineServers = probedServers
        .filter(s => s.status === 'online' && s.latencyValid !== false)
        .sort((a, b) => (b.weightedScore || 0) - (a.weightedScore || 0));
      
      if (onlineServers.length === 0) {
        addLog("🚫 No servers passed validation - cannot proceed");
        addLog("All available servers either offline or reporting impossible latency");
        toast.error("No valid test servers available", {
          description: "Server selection failed due to physics validation"
        });
        return null;
      }
      
      // CRITICAL: Verify CDN download endpoint before selection
      addLog("\n=== DOWNLOAD ENDPOINT VERIFICATION (CDN) ===");
      const cdnCheck = await verifyCDNEndpoint();
      
      if (!cdnCheck.reachable) {
        addLog("⚠ CDN download endpoint unavailable");
        addLog("Download infrastructure unavailable. Please retry shortly.");
        toast.error("Download infrastructure unavailable", {
          description: "CDN files not accessible. Please retry shortly."
        });
        return null;
      }
      
      let selectedServer: ServerCandidate | null = null;
      
      for (const server of onlineServers) {
        addLog(`Testing: ${server.name}...`);
        
        // Traceroute validation (if enabled in Pro mode)
        if (enableTracerouteValidation && proMode) {
          addLog(`  Running traceroute validation...`);
          try {
            const traceResult = await tracerouteValidator.runTraceroute(
              CONNECTION_INTEL_URL,
              server.id,
              server.name,
              server.city,
              server.country,
              ispInfo.city,
              ispInfo.country,
              server.estimatedDistance,
              ispInfo.connectionType,
              ispInfo.asn
            );
            
            if (tracerouteValidator.shouldDisqualifyServer(traceResult)) {
              addLog(`  ✗ Traceroute FAILED: ${traceResult.disqualifyReason}`);
              
              if (enableISPAffinity) {
                ispAffinity.markServerProblematic(
                  ispInfo.isp,
                  ispInfo.asn,
                  ispInfo.connectionType,
                  server.id,
                  'physics_violation'
                );
              }
              continue;
            }
            
            addLog(`  ✓ Traceroute valid: ${traceResult.totalHops} hops, score ${traceResult.validationScore}`);
          } catch (traceError) {
            addLog(`  ⚠ Traceroute check skipped: ${traceError instanceof Error ? traceError.message : 'Unknown error'}`);
          }
        }
        
        selectedServer = {
          ...server,
          downloadVerified: true,
          status: 'selected' as const,
          selectionReason: `Physics-validated (${server.latency?.toFixed(1)}ms ≥ ${server.minPhysicalRTT?.toFixed(1)}ms min) + CDN download verified${enableTracerouteValidation ? ' + traceroute validated' : ''}`
        };
        break;
      }
      
      if (!selectedServer) {
        addLog("⚠ Download infrastructure unavailable. Please retry shortly.");
        toast.error("Server selection failed", {
          description: "No servers passed validation. Please retry shortly."
        });
        return null;
      }
      
      setSelectedServer(selectedServer);
      setServers(onlineServers.map(s => s.id === selectedServer!.id ? selectedServer! : s));
      
      addLog(`\n✓ Selected: ${selectedServer.name}`);
      addLog(`  Location: ${selectedServer.city}, ${selectedServer.country}`);
      addLog(`  Distance: ${selectedServer.estimatedDistance}km`);
      addLog(`  Latency: ${selectedServer.latency?.toFixed(1)}ms (physics min: ${selectedServer.minPhysicalRTT?.toFixed(1)}ms)`);
      addLog(`  Download: Pre-verified ✓`);
      addLog(`  Reason: ${selectedServer.selectionReason}`);
      
      return selectedServer;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Server selection failed';
      addLog(`Server selection failed: ${msg}`);
      return null;
    }
  }, [addLog, verifyCDNEndpoint, enableTracerouteValidation, tracerouteValidator, enableISPAffinity, ispAffinity, proMode]);

  // Automatic server switching if throughput stalls
  const switchToNextBestServer = useCallback(async (
    currentServerId: string, 
    reason: string,
    availableServers: ServerCandidate[]
  ): Promise<ServerCandidate | null> => {
    addLog(`⚠ Server switch triggered: ${reason}`);
    
    // Mark current server as failed
    const updatedServers = availableServers.map(s => 
      s.id === currentServerId ? { ...s, status: 'failed' as const } : s
    );
    
    // Find next best online server
    const nextBest = updatedServers
      .filter(s => s.status === 'online')
      .sort((a, b) => (b.weightedScore || 0) - (a.weightedScore || 0))[0];
    
    if (!nextBest) {
      addLog("⚠ No alternative servers available");
      return null;
    }
    
    const switchedServer: ServerCandidate = {
      ...nextBest,
      status: 'selected' as const,
      selectionReason: `Switched from ${currentServerId} - ${reason}`
    };
    
    setSelectedServer(switchedServer);
    setServers(updatedServers.map(s => s.id === nextBest.id ? switchedServer : s));
    
    addLog(`✓ Switched to: ${switchedServer.name} (${switchedServer.latency?.toFixed(1)}ms)`);
    
    return switchedServer;
  }, [addLog]);

  // Legacy server probing for compatibility (used if runRealTimeServerSelection is not called)
  const runServerProbing = useCallback(async (ispInfo: ISPInfo): Promise<ServerCandidate[]> => {
    const bestServer = await runRealTimeServerSelection(ispInfo);
    return bestServer ? [bestServer] : [];
  }, [runRealTimeServerSelection]);

  // Validate results against expectations (Pro Mode)
  const validateResults = useCallback(async (measured: SpeedResult, ispInfo: ISPInfo): Promise<ValidationResult | null> => {
    addLog("Validating results against expectations...");
    
    try {
      const response = await fetch(`${CONNECTION_INTEL_URL}?action=validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          measured: {
            download: measured.download,
            upload: measured.upload,
            latency: measured.latency,
            jitter: measured.jitter
          },
          expected: ispInfo.expectedSpeed,
          connectionType: ispInfo.connectionType,
          isp: ispInfo.isp,
          isVPN: ispInfo.isVPN,
          lineProfile: {
            maxDownloadMbps: LINE_PROFILE.maxDownloadMbps,
            maxUploadMbps: LINE_PROFILE.maxUploadMbps,
            connectionType: LINE_PROFILE.connectionType,
          },
        })
      });
      
      if (!response.ok) throw new Error("Validation failed");
      
      const validation: ValidationResult = await response.json();
      setValidationResult(validation);
      
      addLog(`Validation: ${validation.diagnosis}`);
      addLog(`Confidence: ${validation.confidence}%`);
      
      if (validation.downloadStatus === 'below' || validation.uploadStatus === 'below') {
        addLog(`⚠ Performance below expected range`);
        validation.recommendations.forEach(r => addLog(`  → ${r}`));
      } else if (validation.downloadStatus === 'above') {
        addLog(`✓ Performance exceeds expectations`);
      } else {
        addLog(`✓ Performance matches expected range`);
      }
      
      return validation;
    } catch (error) {
      addLog(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }, [addLog]);

  // Get tuned config based on ISP detection
  const getTunedConfig = useCallback((ispInfo: ISPInfo) => {
    const baseConfig = proMode ? { ...PRO_CONFIG } : { ...STANDARD_CONFIG };
    
    // Tune based on expected speed (CDN-appropriate stream counts)
    const expectedDownload = ispInfo.expectedSpeed.download.typical;
    
    if (expectedDownload >= 1000) {
      // Gigabit+ connections
      baseConfig.INITIAL_STREAMS = proMode ? 8 : 6;
      baseConfig.MAX_STREAMS = 8;
      baseConfig.UPLOAD_STREAMS = proMode ? 8 : 6;
    } else if (expectedDownload >= 500) {
      // 500Mbps+ connections
      baseConfig.INITIAL_STREAMS = proMode ? 6 : 4;
      baseConfig.MAX_STREAMS = 8;
      baseConfig.UPLOAD_STREAMS = proMode ? 8 : 6;
    } else if (expectedDownload >= 100) {
      // 100Mbps+ connections
      baseConfig.INITIAL_STREAMS = proMode ? 4 : 4;
      baseConfig.MAX_STREAMS = proMode ? 8 : 6;
    }
    
    // DSL-specific tuning
    if (ispInfo.connectionType.toLowerCase().includes('dsl')) {
      baseConfig.INITIAL_STREAMS = proMode ? 2 : 2;
      baseConfig.MAX_STREAMS = proMode ? 4 : 4;
      baseConfig.UPLOAD_STREAMS = proMode ? 4 : 2;
      baseConfig.MIN_TEST_DURATION = proMode ? 10000 : 8000;
      baseConfig.WARM_UP_DURATION = 1000;
    }
    
    // Adjust for variable connections
    if (ispInfo.connectionType.includes('Mobile') || ispInfo.connectionType.includes('Satellite')) {
      baseConfig.MIN_TEST_DURATION = proMode ? 15000 : 10000;
      baseConfig.WARM_UP_DURATION = proMode ? 2000 : 1000;
    }
    
    addLog(`CDN Tuned Config: ${baseConfig.INITIAL_STREAMS}-${baseConfig.MAX_STREAMS} streams`);
    
    return baseConfig;
  }, [addLog, proMode]);

  // Connect to server
  const connectToServer = useCallback(async () => {
    addLog("Connecting to Kellion SmartSpeed CDN...");
    
    try {
      const response = await fetch(`${SPEED_TEST_URL}?action=info&t=${Date.now()}`);
      if (!response.ok) throw new Error("Failed to connect to test server");
      
      const info = await response.json();
      setServerInfo({ server: info.server, region: info.region });
      addLog(`Connected to ${info.server} (${info.region})`);
      addLog(`Architecture: ${info.architecture || 'CDN'}`);
      addLog(`Download method: ${info.downloadMethod || 'Supabase Storage CDN'}`);
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Connection failed';
      addLog(`Server connection failed: ${msg}`);
      throw new Error(msg);
    }
  }, [addLog]);

  // Run a single test pass with automatic server switching
  const runSinglePass = useCallback(async (
    passNumber: number, 
    baseLatency?: number,
    maxServerSwitches: number = 2
  ): Promise<(PassResult & { 
    fullResult: Omit<SpeedResult, 'timestamp' | 'proMode' | 'passNumber' | 'totalPasses'>;
    serverSwitched?: boolean;
    switchCount?: number;
  }) | null> => {
    addLog(`\n=== PASS ${passNumber}/${CONFIG.TEST_PASSES} ===`);
    
    let switchCount = 0;
    let downloadResult: Awaited<ReturnType<typeof runDownloadTest>>;
    
    // Latency test (only on first pass or if Pro mode)
    let latency: number, jitter: number, packetLoss: number;
    
    if (passNumber === 1 || proMode) {
      setPhase("latency");
      setProgress(0);
      const latencyResult = await runLatencyTest(proMode ? 30 : 20);
      latency = latencyResult.latency;
      jitter = latencyResult.jitter;
      packetLoss = latencyResult.packetLoss;
    } else {
      latency = baseLatency || 0;
      jitter = 0;
      packetLoss = 0;
    }
    
    // Download test with automatic server switching loop
    while (true) {
      setPhase("download");
      setProgress(0);
      downloadResult = await runDownloadTest();
      
      // Check if server switch is required (Pro mode only)
      if (proMode && downloadResult.serverSwitchRequired && switchCount < maxServerSwitches) {
        switchCount++;
        addLog(`\n⚡ AUTO SERVER SWITCH ${switchCount}/${maxServerSwitches}`);
        addLog(`Reason: ${downloadResult.switchReason}`);
        
        // Update UI state with switch reason
        setCurrentSwitchReason(downloadResult.switchReason || 'Performance issue detected');
        
        // Switch to next best server
        const currentServerId = selectedServer?.id || '';
        const currentServerName = selectedServer?.name || 'Unknown';
        const newServer = await switchToNextBestServer(currentServerId, downloadResult.switchReason || 'Unknown', servers);
        
        if (newServer) {
          // Track server switch event for UI
          setServerSwitches(prev => [...prev, {
            timestamp: new Date(),
            fromServer: currentServerName,
            toServer: newServer.name,
            reason: downloadResult.switchReason || 'Unknown'
          }]);
          
          addLog(`Switched to: ${newServer.name} (${newServer.city})`);
          addLog(`Latency: ${newServer.latency?.toFixed(1)}ms`);
          addLog("Restarting download test...");
          
          // Small delay before restart
          await new Promise(r => setTimeout(r, 300));
          
          // Clear switch reason after short display
          setTimeout(() => setCurrentSwitchReason(null), 2000);
          
          // Clear download data for fresh start
          setDownloadData([]);
          continue;  // Retry download with new server
        } else {
          setCurrentSwitchReason(null);
          addLog("⚠ No alternative servers available - continuing with current results");
          break;
        }
      } else {
        setCurrentSwitchReason(null);
        break;  // Test completed successfully or no more switches allowed
      }
    }
    
    // If we exhausted switches and still have problems, log it
    if (proMode && downloadResult.serverSwitchRequired && switchCount >= maxServerSwitches) {
      addLog(`⚠ Max server switches (${maxServerSwitches}) reached - using best available result`);
    }
    
    // CRITICAL: Check for network path failure BEFORE proceeding to upload
    const downloadFailure = detectNetworkFailure(
      downloadResult.speed,
      0, // upload not yet measured
      latency,
      jitter,
      downloadResult.stability,
      downloadResult.burstSpeed,
      downloadResult.sustainedSpeed
    );
    
    if (downloadFailure.isFailure && downloadFailure.severity === 'critical') {
      addLog(`\n🚫 NETWORK PATH FAILURE DETECTED`);
      addLog(`Type: ${downloadFailure.failureType.replace(/_/g, ' ').toUpperCase()}`);
      addLog(`Diagnosis: ${downloadFailure.diagnosis}`);
      downloadFailure.possibleCauses.forEach(cause => addLog(`  • ${cause}`));
      
      // Return null to signal failure - caller will handle retry
      return null;
    }
    
    // === POST-DOWNLOAD RECLASSIFICATION ===
    // If ISP was classified as DSL but download exceeds DSL capability, reclassify
    if (downloadResult.speed > 200 && ispInfo?.connectionType?.toLowerCase().includes('dsl')) {
      const oldType = ispInfo.connectionType;
      addLog(`⚡ Reclassified: ${oldType} → FTTC/FTTP or Cable (measured ${downloadResult.speed.toFixed(0)} Mbps exceeds DSL capability)`);
      // Update LINE_PROFILE dynamically for this test run
      LINE_PROFILE.maxDownloadMbps = downloadResult.speed > 400 ? 500 : 500;
      LINE_PROFILE.maxUploadMbps = 75;
      LINE_PROFILE.connectionType = 'FTTC/FTTP';
      // Update ispInfo so validation and UI use FTTC/FTTP expectations, not DSL
      ispInfo.connectionType = 'FTTC/FTTP or Cable';
      ispInfo.expectedSpeed = {
        download: { min: 100, max: 500, typical: 300 },
        upload: { min: 20, max: 75, typical: 50 },
      };
      ispInfo.expectedLatency = { min: 10, max: 30, typical: 18 };
      setIspInfo({ ...ispInfo });
      addLog(`  Updated expected ranges: DL 100–500 Mbps, UL 20–75 Mbps, Latency 10–30 ms`);
    }

    // === PRE-UPLOAD ENDPOINT CHECK (GET health) ===
    addLog("Pre-checking upload endpoint...");
    let uploadEndpointReachable = true;
    try {
      const probe = await fetch(`${SPEED_UPLOAD_URL}?action=health&t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
      });
      if (!probe.ok) {
        addLog(`❌ Upload endpoint pre-check failed: HTTP ${probe.status}`);
        uploadEndpointReachable = false;
      } else {
        const probeResult = await probe.json();
        if (probeResult.ok) {
          addLog(`✓ Upload endpoint reachable (service=${probeResult.service}, region=${probeResult.region})`);
        } else {
          addLog(`❌ Upload endpoint returned error: ${probeResult.error}`);
          uploadEndpointReachable = false;
        }
      }
    } catch (err) {
      addLog(`❌ Upload endpoint pre-check failed: ${err instanceof Error ? err.message : 'Network error'}`);
      uploadEndpointReachable = false;
    }

    // Upload test - skip if endpoint unreachable
    let uploadResult: Awaited<ReturnType<typeof runUploadTest>>;
    if (!uploadEndpointReachable) {
      addLog("⚠️ Skipping upload phase — endpoint unreachable");
      uploadResult = {
        speed: null,
        latencyUnderLoad: latency,
        latencyDuringUpload: latency,
        validationStatus: 'failed',
        validationMessage: 'Upload endpoint unreachable or rejecting requests',
      };
    } else {
      setPhase("upload");
      setProgress(0);
      uploadResult = await runUploadTest(latency, downloadResult.speed);
    }
    
    // Handle upload failure (0 ACKs)
    const uploadSpeed = uploadResult.speed ?? 0;
    const uploadFailed = uploadResult.speed === null;
    
    if (uploadFailed) {
      addLog(`⚠️ Upload measurement failed: ${uploadResult.validationMessage || 'No valid ACKs received'}`);
    }
    
    // Final network failure check with all metrics
    const finalFailure = detectNetworkFailure(
      downloadResult.speed,
      uploadSpeed,
      latency,
      jitter,
      downloadResult.stability,
      downloadResult.burstSpeed,
      downloadResult.sustainedSpeed
    );
    
    // Store failure info for potential UI display
    if (finalFailure.isFailure) {
      setNetworkFailure(finalFailure);
    }
    
    const passResult: PassResult = {
      pass: passNumber,
      download: downloadResult.speed,
      upload: uploadSpeed,
      latency,
      stability: downloadResult.stability
    };
    
    const switchInfo = switchCount > 0 ? ` (${switchCount} server switch${switchCount > 1 ? 'es' : ''})` : '';
    const uploadLabel = uploadFailed ? 'unavailable' : `${uploadSpeed.toFixed(1)} Mbps`;
    addLog(`Pass ${passNumber} complete: ↓${downloadResult.speed.toFixed(1)} Mbps ↑${uploadLabel}${switchInfo}`);
    
    return {
      ...passResult,
      fullResult: {
        download: downloadResult.speed,
        upload: uploadSpeed,
        latency,
        jitter,
        packetLoss,
        latencyUnderLoad: uploadResult.latencyUnderLoad,
        stabilityScore: downloadResult.stability,
        burstSpeed: downloadResult.burstSpeed,
        sustainedSpeed: downloadResult.sustainedSpeed,
        latencyIdle: latency,
        latencyDownload: downloadResult.latencyDuringDownload,
        latencyUpload: uploadResult.latencyDuringUpload,
        linkSaturated: downloadResult.linkSaturated,
        limitingFactor: downloadResult.limitingFactor || undefined
      },
      serverSwitched: switchCount > 0,
      switchCount
    };
  }, [CONFIG, proMode, runLatencyTest, runDownloadTest, runUploadTest, selectedServer, servers, switchToNextBestServer, detectNetworkFailure, addLog, ispInfo]);

  // Main test runner
  const runTest = async () => {
    abortRef.current = false;
    testStartTime.current = Date.now();
    setResult(null);
    setCurrentSpeed(0);
    setDownloadData([]);
    setUploadData([]);
    setLatencyData([]);
    setTestLog([]);
    setAiAnalysis(null);
    setErrorMessage(null);
    setActiveStreams(0);
    setCurrentPass(0);
    setPassResults([]);
    setLinkSaturated(false);
    setLimitingFactor(null);
    setIspInfo(null);
    setServers([]);
    setSelectedServer(null);
    setValidationResult(null);
    setServerSwitches([]);
    setCurrentSwitchReason(null);
    setNetworkFailure(null);
    setRetryCount(0);
    
    const modeLabel = proMode ? "SMARTSPEED PRO" : "SMARTSPEED";
    addLog(`=== KELLIONS ${modeLabel} ===`);
    
    try {
      // ISP detection for validation (both modes now)
      let detectedIspInfo: ISPInfo | null = null;
      let tunedConfig = CONFIG;
      
      // Quick ISP detection for Standard mode (needed for validation)
      if (!proMode) {
        addLog("Detecting connection type for validation...");
        try {
          const response = await fetch(`${CONNECTION_INTEL_URL}?action=detect&t=${Date.now()}`);
          if (response.ok) {
            detectedIspInfo = await response.json();
            setIspInfo(detectedIspInfo);
            addLog(`Connection: ${detectedIspInfo?.connectionType || 'Unknown'} (${detectedIspInfo?.isp || 'Unknown ISP'})`);
            addLog(`Expected upload max: ${detectedIspInfo?.expectedSpeed?.upload?.max || 'Unknown'} Mbps`);
          }
        } catch {
          addLog("Connection detection failed - using default validation rules");
        }
      }
      
      if (proMode) {
        // Phase 1: ISP Detection
        setPhase("detecting");
        setProgress(25);
        detectedIspInfo = await runConnectionDetection();
        
        if (abortRef.current) throw new Error("Aborted");
        
        // Phase 2: Real-Time Server Selection (fresh each test)
        if (detectedIspInfo) {
          setPhase("probing");
          setProgress(50);
          
          // Run real-time server selection - no cached choices
          const selectedSrv = await runRealTimeServerSelection(detectedIspInfo);
          if (!selectedSrv) {
            throw new Error("No available servers - cannot proceed with test");
          }
          
          if (abortRef.current) throw new Error("Aborted");
          
          // Tune config based on detection
          tunedConfig = getTunedConfig(detectedIspInfo);
        }
        
        setPhase("ready");
        setProgress(100);
        addLog("Real-time server selection complete.");
        addLog("Test will execute against best available server at runtime.");
        await new Promise(r => setTimeout(r, 500));
      }
      
      addLog(`Engine: Multi-stream parallel transfer${proMode ? ' (Pro Mode)' : ''}`);
      addLog("All measurements from real network traffic");
      addLog(`Download: ${tunedConfig.INITIAL_STREAMS}-${tunedConfig.MAX_STREAMS} streams × ${tunedConfig.STREAM_CHUNK_SIZE}MB`);
      addLog(`Upload: ${tunedConfig.UPLOAD_STREAMS} streams × ${tunedConfig.UPLOAD_CHUNK_SIZE}MB`);
      addLog(`Test duration: ${tunedConfig.MIN_TEST_DURATION / 1000}s per phase`);
      if (proMode) {
        addLog(`Multi-pass verification: ${tunedConfig.TEST_PASSES} passes`);
      }
      
      // Connect to server
      setPhase("connecting");
      setProgress(0);
      await connectToServer();
      
      const allPassResults: (PassResult & { fullResult: any; serverSwitched?: boolean; switchCount?: number })[] = [];
      let totalServerSwitches = 0;
      let networkFailureRetries = 0;
      const MAX_FAILURE_RETRIES = 2;
      
      // Run test passes with network failure retry logic
      for (let pass = 1; pass <= CONFIG.TEST_PASSES; pass++) {
        if (abortRef.current) throw new Error("Aborted");
        
        setCurrentPass(pass);
        let passResult = await runSinglePass(pass, allPassResults[0]?.fullResult?.latency);
        
        // CRITICAL: Handle network path failure with retry
        if (passResult === null && networkFailureRetries < MAX_FAILURE_RETRIES) {
          networkFailureRetries++;
          setRetryCount(networkFailureRetries);
          setPhase("retrying");
          
          addLog(`\n🔄 AUTOMATIC RETRY ${networkFailureRetries}/${MAX_FAILURE_RETRIES}`);
          addLog("Attempting recovery with different configuration...");
          
          // Try switching to a different server if available
          if (proMode && servers.length > 1) {
            addLog("Switching to alternative test server...");
            const currentServerId = selectedServer?.id || '';
            const newServer = await switchToNextBestServer(currentServerId, 'Network path failure', servers);
            
            if (newServer) {
              addLog(`Switched to: ${newServer.name}`);
              setServerSwitches(prev => [...prev, {
                timestamp: new Date(),
                fromServer: selectedServer?.name || 'Unknown',
                toServer: newServer.name,
                reason: 'Network path failure recovery'
              }]);
            }
          }
          
          // Clear data for fresh retry
          setDownloadData([]);
          setUploadData([]);
          await new Promise(r => setTimeout(r, 1000));
          
          // Retry the pass
          passResult = await runSinglePass(pass, allPassResults[0]?.fullResult?.latency);
        }
        
        // If still failing after retries, show failure state
        if (passResult === null) {
          addLog(`\n🚫 NETWORK PATH FAILURE - CANNOT COMPLETE TEST`);
          addLog("Your connection cannot reliably receive data.");
          addLog("This is a network failure, not a speed issue.");
          
          setPhase("failure");
          setErrorMessage("Network path failure detected. Your connection cannot reliably receive data. This is not a speed issue - the download path is broken.");
          
          toast.error("Network path failure detected - cannot complete speed test", {
            description: "Your download path appears to be blocked or severely degraded. Try again later or check your network."
          });
          
          return; // Exit without showing invalid results
        }
        
        if (passResult) {
          allPassResults.push(passResult);
          
          // Track total server switches
          if (passResult.switchCount) {
            totalServerSwitches += passResult.switchCount;
          }
          
          setPassResults(prev => [...prev, {
            pass: passResult.pass,
            download: passResult.download,
            upload: passResult.upload,
            latency: passResult.latency,
            stability: passResult.stability
          }]);
        }
        
        // Cool-down between passes
        if (proMode && pass < CONFIG.TEST_PASSES && CONFIG.COOL_DOWN_DURATION > 0) {
          setPhase("cooldown");
          addLog(`Cool-down phase (${CONFIG.COOL_DOWN_DURATION / 1000}s)...`);
          await new Promise(r => setTimeout(r, CONFIG.COOL_DOWN_DURATION));
        }
      }
      
      // Log server switch summary for Pro mode
      if (proMode && totalServerSwitches > 0) {
        addLog(`\n=== SERVER SWITCH SUMMARY ===`);
        addLog(`Total automatic switches: ${totalServerSwitches}`);
        addLog(`Final server: ${selectedServer?.name || 'Unknown'}`);
      }
      
      // Log retry summary if any
      if (networkFailureRetries > 0) {
        addLog(`Network failure retries used: ${networkFailureRetries}/${MAX_FAILURE_RETRIES}`);
      }
      
      // Safety check for empty results
      if (allPassResults.length === 0) {
        setPhase("failure");
        setErrorMessage("All test passes failed. Your network cannot complete the speed test.");
        toast.error("Speed test failed - no valid results obtained");
        return;
      }
      
      // Calculate final results (average of all passes for Pro mode)
      let finalDownload: number, finalUpload: number, finalLatency: number;
      let finalStability: number, finalBurst: number, finalSustained: number;
      let finalResult: any;
      
      if (proMode && allPassResults.length > 1) {
        // Multi-pass averaging with outlier detection
        const downloads = allPassResults.map(p => p.download);
        const uploads = allPassResults.map(p => p.upload);
        
        // Check consistency between passes
        const downloadVariance = Math.max(...downloads) - Math.min(...downloads);
        const uploadVariance = Math.max(...uploads) - Math.min(...uploads);
        const avgDownload = downloads.reduce((a, b) => a + b, 0) / downloads.length;
        const avgUpload = uploads.reduce((a, b) => a + b, 0) / uploads.length;
        
        const downloadConsistency = (1 - (downloadVariance / avgDownload)) * 100;
        const uploadConsistency = (1 - (uploadVariance / avgUpload)) * 100;
        
        addLog(`\n=== MULTI-PASS ANALYSIS ===`);
        addLog(`Download consistency: ${downloadConsistency.toFixed(0)}%`);
        addLog(`Upload consistency: ${uploadConsistency.toFixed(0)}%`);
        
        if (downloadConsistency < 80 || uploadConsistency < 80) {
          addLog("⚠️ High variance detected between passes - results may be affected by network instability");
        }
        
        // Use the best pass (highest download) as reference
        const bestPass = allPassResults.reduce((best, current) => 
          current.download > best.download ? current : best
        );
        
        finalDownload = avgDownload;
        finalUpload = avgUpload;
        finalLatency = allPassResults[0].fullResult.latency;
        finalStability = bestPass.stability;
        finalBurst = bestPass.fullResult.burstSpeed;
        finalSustained = bestPass.fullResult.sustainedSpeed;
        finalResult = bestPass.fullResult;
        
        // Update saturation status
        setLinkSaturated(bestPass.fullResult.linkSaturated);
        if (bestPass.fullResult.limitingFactor) {
          setLimitingFactor(bestPass.fullResult.limitingFactor);
        }
      } else {
        const singleResult = allPassResults[0];
        finalDownload = singleResult.download;
        finalUpload = singleResult.upload;
        finalLatency = singleResult.fullResult.latency;
        finalStability = singleResult.stability;
        finalBurst = singleResult.fullResult.burstSpeed;
        finalSustained = singleResult.fullResult.sustainedSpeed;
        finalResult = singleResult.fullResult;
        setLinkSaturated(singleResult.fullResult.linkSaturated);
        if (singleResult.fullResult.limitingFactor) {
          setLimitingFactor(singleResult.fullResult.limitingFactor);
        }
      }
      
      // ========================================
      // FINAL REALITY VALIDATION (MANDATORY)
      // ========================================
      addLog("\n=== REALITY VALIDATION ===");
      
      // Get line capability from LINE_PROFILE (single source of truth)
      const expectedMaxDownload = LINE_PROFILE.maxDownloadMbps;
      const expectedMaxUpload = LINE_PROFILE.maxUploadMbps;
      const isFiber = LINE_PROFILE.connectionType?.toLowerCase().includes('ftt') || 
                      detectedIspInfo?.connectionType?.toLowerCase().includes('fiber');
      
      let validatedDownload = finalDownload;
      let validatedUpload = finalUpload;
      const validationWarnings: string[] = [];
      let resultsInvalid = false;
      
      // Check if upload failed entirely — skip upload validation rules
      const uploadMeasurementFailed = allPassResults.some(p => p.upload === 0 && p.fullResult?.latencyUpload === p.fullResult?.latency);
      
      // Rule 1: Line capability enforcement
      if (!uploadMeasurementFailed && finalUpload > expectedMaxUpload * 1.2) {
        validationWarnings.push(`Upload exceeded provisioned line rate (${expectedMaxUpload} Mbps). Value normalized.`);
        validatedUpload = expectedMaxUpload;
        addLog(`⚠️ Upload exceeded provisioned line rate (${expectedMaxUpload} Mbps). Value normalized.`);
      }
      
      if (finalDownload > expectedMaxDownload * 1.2) {
        validationWarnings.push(`Download ${finalDownload.toFixed(0)} Mbps exceeds line capability ${expectedMaxDownload.toFixed(0)} Mbps - capped`);
        validatedDownload = expectedMaxDownload;
        addLog(`⚠️ Download exceeds line max (${expectedMaxDownload.toFixed(0)} Mbps). Value normalized.`);
      }
      
      // Handle null/failed upload
      if (uploadMeasurementFailed || finalUpload === 0) {
        validationWarnings.push("Upload measurement failed — endpoint unreachable");
        addLog("⚠️ Upload measurement failed — skipping upload validation");
      }
      
      // Rule 2: Upload/Download ratio check
      const uploadRatio = validatedUpload / Math.max(validatedDownload, 1);
      const maxAllowedRatio = isFiber ? 1.2 : 0.6; // Fiber can be symmetric
      
      if (uploadRatio > maxAllowedRatio * 1.5 && validatedDownload > 5) {
        validationWarnings.push(`Upload/Download ratio (${uploadRatio.toFixed(1)}x) is unrealistic for ${detectedIspInfo?.connectionType || 'this connection'}`);
        validatedUpload = Math.min(validatedUpload, validatedDownload * maxAllowedRatio * 1.5);
        addLog(`⚠️ CAPPED: Upload ratio unrealistic for connection type`);
      }
      
      // Rule 3: Catastrophic asymmetry detection
      if (validatedDownload < 5 && finalUpload > 100) {
        resultsInvalid = true;
        validationWarnings.push(`INVALID: Download ${validatedDownload.toFixed(1)} Mbps with Upload ${finalUpload.toFixed(0)} Mbps is physically impossible`);
        addLog(`🚫 INVALID TEST: Catastrophic asymmetry detected`);
        validatedUpload = Math.max(validatedDownload * 0.5, 0.5);
      }
      
      // Rule 4: Zero download check
      if (validatedDownload < 0.1) {
        resultsInvalid = true;
        validationWarnings.push(`INVALID: Download speed too low to be real (${validatedDownload.toFixed(2)} Mbps)`);
        addLog(`🚫 INVALID TEST: Download path failure detected`);
      }
      
      // Apply validated speeds
      finalDownload = validatedDownload;
      finalUpload = validatedUpload;
      
      if (validationWarnings.length > 0) {
        addLog(`Validation applied ${validationWarnings.length} correction(s)`);
        validationWarnings.forEach(w => addLog(`  → ${w}`));
      } else {
        addLog("✓ Results pass all reality checks");
      }
      
      // Pro Mode: Validate results against expectations
      let validation: ValidationResult | null = null;
      if (proMode && detectedIspInfo) {
        setPhase("validating");
        const tempResult = {
          download: finalDownload,
          upload: finalUpload,
          latency: finalLatency,
          jitter: finalResult.jitter
        } as SpeedResult;
        validation = await validateResults(tempResult, detectedIspInfo);
      }

      const newResult: SpeedResult = {
        download: finalDownload,
        upload: finalUpload,
        latency: finalLatency,
        jitter: finalResult.jitter,
        packetLoss: finalResult.packetLoss,
        latencyUnderLoad: finalResult.latencyUnderLoad,
        stabilityScore: finalStability,
        burstSpeed: Math.min(finalBurst, expectedMaxDownload * 1.1), // Cap burst too
        sustainedSpeed: Math.min(finalSustained, expectedMaxDownload * 1.1),
        timestamp: new Date(),
        proMode,
        passNumber: CONFIG.TEST_PASSES,
        totalPasses: CONFIG.TEST_PASSES,
        latencyIdle: finalResult.latencyIdle,
        latencyDownload: finalResult.latencyDownload,
        latencyUpload: finalResult.latencyUpload,
        linkSaturated: finalResult.linkSaturated,
        limitingFactor: resultsInvalid ? 'Test invalid - results corrected' : finalResult.limitingFactor,
        ispInfo: detectedIspInfo || undefined,
        serverUsed: selectedServer || undefined,
        validation: validation || undefined,
      };
      
      setResult(newResult);
      setSessionHistory(prev => [newResult, ...prev.slice(0, 9)]);
      
      // Save to persistent history
      speedTestHistory.addResult({
        timestamp: newResult.timestamp.toISOString(),
        download: newResult.download,
        upload: newResult.upload,
        latency: newResult.latency,
        jitter: newResult.jitter,
        packetLoss: newResult.packetLoss,
        stabilityScore: newResult.stabilityScore,
        burstSpeed: newResult.burstSpeed,
        sustainedSpeed: newResult.sustainedSpeed,
        proMode: proMode,
        isp: newResult.ispInfo?.isp,
        connectionType: newResult.ispInfo?.connectionType,
        location: newResult.ispInfo ? `${newResult.ispInfo.city}, ${newResult.ispInfo.country}` : undefined,
        serverName: newResult.serverUsed?.name,
        serverLocation: newResult.serverUsed ? `${newResult.serverUsed.city}, ${newResult.serverUsed.country}` : undefined,
        aiGrade: aiAnalysis?.overallGrade,
        validated: !resultsInvalid,
      });
      
      // Record ISP affinity data
      if (enableISPAffinity && detectedIspInfo && selectedServer) {
        ispAffinity.recordTestResult(
          detectedIspInfo.isp,
          detectedIspInfo.asn,
          detectedIspInfo.connectionType,
          detectedIspInfo.country,
          detectedIspInfo.region,
          selectedServer.id,
          selectedServer.name,
          {
            success: !resultsInvalid && newResult.download > 0.5,
            download: newResult.download,
            upload: newResult.upload,
            latency: newResult.latency,
            jitter: newResult.jitter,
            physicsViolation: selectedServer.latencyValid === false,
            quarantined: selectedServer.status === 'quarantined',
          }
        );
        addLog("ISP affinity data recorded for future server selection");
      }
      
      // AI Analysis
      setPhase("analyzing");
      await getAIAnalysis(newResult);
      
      setPhase("complete");
      setCurrentSpeed(0);
      addLog("\n=== TEST COMPLETE ===");
      const uploadFinalLabel = (uploadMeasurementFailed || finalUpload === 0) ? 'unavailable' : `${finalUpload.toFixed(1)} Mbps`;
      addLog(`Final (validated): ↓${finalDownload.toFixed(1)} Mbps ↑${uploadFinalLabel} ⏱${finalLatency.toFixed(0)}ms`);
      
      if (resultsInvalid) {
        addLog("⚠️ Original results were invalid and have been corrected.");
        addLog("Consider retesting or checking your network configuration.");
        toast.warning("Test results required correction - original values were invalid");
      } else if (validationWarnings.length > 0) {
        addLog("⚠️ Some results were adjusted for accuracy.");
        toast.success(`SmartSpeed ${proMode ? 'Pro' : ''} test complete (with corrections)`);
      } else {
        addLog("✓ All results validated against physical constraints.");
        toast.success(`SmartSpeed ${proMode ? 'Pro' : ''} test complete!`);
      }
      
      if (proMode) {
        if (finalResult.linkSaturated && !resultsInvalid) {
          addLog("✓ Link fully saturated. Results validated.");
        } else if (finalResult.limitingFactor) {
          addLog(`⚠ ${finalResult.limitingFactor}`);
        }
      }
      
      toast.success(`SmartSpeed ${proMode ? 'Pro' : ''} test complete!`);
      
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Test failed';
      if (msg !== "Aborted") {
        setErrorMessage(msg);
        setPhase("error");
        addLog(`ERROR: ${msg}`);
        toast.error(`Test failed: ${msg}`);
      } else {
        setPhase("idle");
      }
    }
  };

  const resetTest = () => {
    abortRef.current = true;
    abortControllerRef.current?.abort();
    setPhase("idle");
    setProgress(0);
    setCurrentSpeed(0);
    setResult(null);
    setAiAnalysis(null);
    setErrorMessage(null);
    setTestLog([]);
    setActiveStreams(0);
    setCurrentPass(0);
    setPassResults([]);
    setNetworkFailure(null);
    setRetryCount(0);
  };

  const handleProModeToggle = (enabled: boolean) => {
    if (enabled) {
      setShowProWarning(true);
    } else {
      setProMode(false);
    }
  };

  const confirmProMode = () => {
    setProMode(true);
    setShowProWarning(false);
    toast.success("Pro Accuracy Mode enabled");
  };

  const getGradeColor = (grade: string): string => {
    if (grade.startsWith('A')) return 'text-green-500';
    if (grade.startsWith('B')) return 'text-blue-500';
    if (grade.startsWith('C')) return 'text-yellow-500';
    if (grade.startsWith('D')) return 'text-orange-500';
    return 'text-red-500';
  };

  const getSeverityColor = (severity: string): string => {
    if (severity === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (severity === 'medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const exportResults = (format: 'json' | 'text') => {
    if (!result) return;
    
    const data = {
      testDate: result.timestamp.toISOString(),
      mode: proMode ? 'SmartSpeed Pro' : 'SmartSpeed',
      results: {
        download: `${result.download.toFixed(2)} Mbps`,
        upload: `${result.upload.toFixed(2)} Mbps`,
        latency: `${result.latency.toFixed(1)} ms`,
        jitter: `${result.jitter.toFixed(2)} ms`,
        packetLoss: `${result.packetLoss.toFixed(1)}%`,
        stabilityScore: `${result.stabilityScore.toFixed(0)}%`,
        burstSpeed: `${result.burstSpeed.toFixed(2)} Mbps`,
        sustainedSpeed: `${result.sustainedSpeed.toFixed(2)} Mbps`,
      },
      ...(proMode && {
        proModeDetails: {
          passes: passResults,
          linkSaturated: result.linkSaturated,
          limitingFactor: result.limitingFactor,
          latencyIdle: result.latencyIdle,
          latencyDownload: result.latencyDownload,
          latencyUpload: result.latencyUpload,
        }
      }),
      ...(result.ispInfo && {
        connectionIntelligence: {
          isp: result.ispInfo.isp,
          connectionType: result.ispInfo.connectionType,
          location: `${result.ispInfo.city}, ${result.ispInfo.country}`,
          asn: result.ispInfo.asn,
        }
      }),
      ...(result.serverUsed && {
        serverSelection: {
          server: result.serverUsed.name,
          location: `${result.serverUsed.city}, ${result.serverUsed.country}`,
          latency: result.serverUsed.latency,
          selectionReason: result.serverUsed.selectionReason || 'Best available server at runtime',
        }
      }),
      analysis: aiAnalysis,
      server: serverInfo,
      testConfig: {
        mode: proMode ? 'SmartSpeed Pro' : 'SmartSpeed',
        downloadStreams: `${CONFIG.INITIAL_STREAMS}-${CONFIG.MAX_STREAMS}`,
        uploadStreams: CONFIG.UPLOAD_STREAMS,
        chunkSize: `${CONFIG.STREAM_CHUNK_SIZE}MB`,
        testDuration: `${CONFIG.MIN_TEST_DURATION / 1000}s`,
        passes: CONFIG.TEST_PASSES,
      },
    };
    
    const content = format === 'json' 
      ? JSON.stringify(data, null, 2)
      : `Kellions SmartSpeed ${proMode ? 'Pro' : ''} Test Results\n${'='.repeat(50)}\nDate: ${result.timestamp.toLocaleString()}\nMode: ${proMode ? 'SmartSpeed Pro' : 'SmartSpeed'}\n\nDownload: ${result.download.toFixed(2)} Mbps\nUpload: ${result.upload.toFixed(2)} Mbps\nLatency: ${result.latency.toFixed(1)} ms\nJitter: ${result.jitter.toFixed(2)} ms\nPacket Loss: ${result.packetLoss.toFixed(1)}%\nStability: ${result.stabilityScore.toFixed(0)}%\nBurst Speed: ${result.burstSpeed.toFixed(2)} Mbps\nSustained Speed: ${result.sustainedSpeed.toFixed(2)} Mbps\n${result.ispInfo ? `\nConnection:\n- ISP: ${result.ispInfo.isp}\n- Type: ${result.ispInfo.connectionType}\n- Location: ${result.ispInfo.city}, ${result.ispInfo.country}\n` : ''}${result.serverUsed ? `\nServer:\n- ${result.serverUsed.name}\n- ${result.serverUsed.city}, ${result.serverUsed.country}\n- Latency: ${result.serverUsed.latency?.toFixed(0)}ms\n- Selection: Best available server at runtime\n` : ''}${proMode ? `\nPro Mode Details:\n- Passes: ${CONFIG.TEST_PASSES}\n- Link Saturated: ${result.linkSaturated ? 'Yes' : 'No'}\n${result.limitingFactor ? `- Limiting Factor: ${result.limitingFactor}\n` : ''}- Latency (Idle): ${result.latencyIdle?.toFixed(1)} ms\n- Latency (Download): ${result.latencyDownload?.toFixed(1)} ms\n- Latency (Upload): ${result.latencyUpload?.toFixed(1)} ms\n` : ''}\n${aiAnalysis ? `AI Analysis: ${aiAnalysis.diagnosis}` : ''}`;
    
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kellion-${proMode ? 'pro-' : ''}speedtest-${Date.now()}.${format === 'json' ? 'json' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Results exported as ${format.toUpperCase()}`);
  };

  const phaseLabels: Record<TestPhase, string> = {
    idle: "Ready to test",
    detecting: "Detecting your connection...",
    probing: "Real-time server selection...",
    ready: "Server selected - Ready to start",
    connecting: "Connecting to best available server...",
    latency: proMode ? `LIVE: Measuring latency (Pass ${currentPass}/${CONFIG.TEST_PASSES})` : "LIVE: Measuring latency...",
    download: proMode ? `LIVE: Download test (Pass ${currentPass}/${CONFIG.TEST_PASSES}, ${activeStreams} streams)` : `LIVE: Download test (${activeStreams} streams)`,
    upload: proMode ? `LIVE: Upload test (Pass ${currentPass}/${CONFIG.TEST_PASSES}, ${activeStreams} streams)` : `LIVE: Upload test (${activeStreams} streams)`,
    cooldown: `Cool-down before pass ${currentPass + 1}...`,
    analyzing: "AI analyzing results...",
    validating: "Validating against expectations...",
    diagnosing: "Diagnosing network path failure...",
    retrying: "Retrying with different configuration...",
    complete: "Test executed against best available server",
    failure: "Network path failure detected",
    error: "Test failed",
  };

  const isRunning = phase !== "idle" && phase !== "complete" && phase !== "error" && phase !== "failure";

  const seo = getSEO("/speed-test");
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={seo.title} description={seo.description} canonical="https://kellionstechguide.lovable.app/speed-test" jsonLd={seo.jsonLd} />
      {/* Pro Mode Warning Dialog */}
      <AlertDialog open={showProWarning} onOpenChange={setShowProWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Enable Pro Accuracy Mode?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>Pro Accuracy Mode is designed for maximum precision and will:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Use more data</strong> (~200-500MB per test)</li>
                  <li><strong>Run longer</strong> (~2-3 minutes total)</li>
                  <li><strong>Run multiple passes</strong> (3 verification passes)</li>
                  <li><strong>Use more connections</strong> (up to 20 parallel streams)</li>
                  <li><strong>May impact active connections</strong></li>
                </ul>
                <p className="text-muted-foreground">
                  This mode is intended for professionals who need verified, repeatable results.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmProMode} className="gap-2">
              <Crown className="h-4 w-4" />
              Enable Pro Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/tools">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  Kellions SmartSpeed
                  {proMode && (
                    <Badge className="ml-2 bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro Mode
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {proMode ? 'Real-time server selection • Pro Accuracy verification' : 'Smart multi-stream engine'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Pro Mode Toggle */}
              <div className="flex items-center gap-2">
                <Label htmlFor="pro-mode" className="text-sm text-muted-foreground">Pro Mode</Label>
                <Switch
                  id="pro-mode"
                  checked={proMode}
                  onCheckedChange={handleProModeToggle}
                  disabled={isRunning}
                />
              </div>
              
              {activeStreams > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Activity className="h-3 w-3" />
                  {activeStreams} streams
                </Badge>
              )}
              {proMode && currentPass > 0 && (
                <Badge variant="outline" className="gap-1 border-yellow-500/50 text-yellow-500">
                  Pass {currentPass}/{CONFIG.TEST_PASSES}
                </Badge>
              )}
              {serverInfo && (
                <Badge variant="outline" className="gap-1">
                  <Globe className="h-3 w-3" />
                  {serverInfo.region}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Live Test Banner */}
        {isRunning && (
          <Card className={`mb-4 ${proMode ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-primary/50 bg-primary/5'}`}>
            <CardContent className="py-3 flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${proMode ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} />
              <span className={`font-medium ${proMode ? 'text-yellow-500' : 'text-primary'}`}>
                {proMode ? 'PRO ACCURACY TEST IN PROGRESS' : 'LIVE TEST IN PROGRESS'}
              </span>
              <span className="text-sm text-muted-foreground">
                {proMode 
                  ? `Pass ${currentPass}/${CONFIG.TEST_PASSES} • ${activeStreams > 0 ? `${activeStreams} connections` : 'Initializing...'}`
                  : `Multi-stream parallel transfer • ${activeStreams > 0 ? `${activeStreams} active connections` : 'Initializing...'}`
                }
              </span>
            </CardContent>
          </Card>
        )}

        {/* ISP Info Card - Pro Mode Connection Intelligence (shown throughout test) */}
        {proMode && ispInfo && (
          <Card className="mb-4 border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-yellow-500" />
                Connection Intelligence
                <Badge variant="outline" className="ml-auto border-yellow-500/50 text-yellow-500 text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro Mode
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ISP Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium">ISP</p>
                  <p className="text-sm font-semibold text-foreground">{ispInfo.isp}</p>
                  {ispInfo.org !== ispInfo.isp && (
                    <p className="text-xs text-muted-foreground">{ispInfo.org}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Connection Type</p>
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold text-foreground">{ispInfo.connectionType}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium">Location</p>
                  <p className="text-sm font-semibold text-foreground">
                    {ispInfo.city}, {ispInfo.country}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-medium">ASN</p>
                  <p className="text-sm font-mono text-foreground">{ispInfo.asn}</p>
                </div>
              </div>

              {/* Expected Speeds */}
              <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Download className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Expected Download</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {ispInfo.expectedSpeed.download.min}-{ispInfo.expectedSpeed.download.max}
                  </p>
                  <p className="text-xs text-muted-foreground">Mbps (typical: {ispInfo.expectedSpeed.download.typical})</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Upload className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-muted-foreground">Expected Upload</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {ispInfo.expectedSpeed.upload.min}-{ispInfo.expectedSpeed.upload.max}
                  </p>
                  <p className="text-xs text-muted-foreground">Mbps (typical: {ispInfo.expectedSpeed.upload.typical})</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">Expected Latency</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">
                    {ispInfo.expectedLatency.min}-{ispInfo.expectedLatency.max}
                  </p>
                  <p className="text-xs text-muted-foreground">ms (typical: {ispInfo.expectedLatency.typical})</p>
                </div>
              </div>

              {/* Warnings */}
              {ispInfo.warnings.length > 0 && (
                <div className="space-y-2">
                  {ispInfo.warnings.map((warning, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-yellow-200">{warning}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Network Flags */}
              <div className="flex flex-wrap gap-2">
                {ispInfo.isVPN && (
                  <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                    <Shield className="h-3 w-3 mr-1" />
                    VPN Detected
                  </Badge>
                )}
                {ispInfo.isCGNAT && (
                  <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    CGNAT Detected
                  </Badge>
                )}
                {ispInfo.isProxy && (
                  <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                    <Globe className="h-3 w-3 mr-1" />
                    Proxy Detected
                  </Badge>
                )}
                {!ispInfo.isVPN && !ispInfo.isCGNAT && !ispInfo.isProxy && (
                  <Badge variant="outline" className="border-green-500/50 text-green-400">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Direct Connection
                  </Badge>
                )}
              </div>

              {/* Selected Server */}
              {selectedServer && (
                <div className="p-3 rounded-lg bg-muted/50 border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Server className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{selectedServer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedServer.city}, {selectedServer.country} • {selectedServer.operator}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{selectedServer.latency?.toFixed(0) || '-'} ms</p>
                      <p className="text-xs text-muted-foreground">{selectedServer.estimatedDistance} km</p>
                    </div>
                  </div>
                  {selectedServer.weightedScore !== undefined && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Weighted Score</span>
                      <span className="font-medium text-yellow-500">{selectedServer.weightedScore.toFixed(0)}/100</span>
                    </div>
                  )}
                  {selectedServer.selectionReason && (
                    <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {selectedServer.selectionReason}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Test Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Speed Gauge Card */}
            <Card className={`overflow-hidden ${proMode ? 'border-yellow-500/20' : ''}`}>
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  {/* Central Display */}
                  <div className="relative w-56 h-56 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted"
                        strokeDasharray="283"
                        strokeDashoffset="70"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="50" cy="50" r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className={phase === "error" ? "text-destructive" : proMode ? "text-yellow-500" : "text-primary"}
                        strokeDasharray="283"
                        strokeDashoffset={283 - (213 * (progress / 100))}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.2s ease-out' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      {phase === "idle" && (
                        <Wifi className="h-16 w-16 text-muted-foreground" />
                      )}
                      {(phase === "download" || phase === "upload") && (
                        <>
                          <span className="text-4xl font-bold text-foreground">
                            {currentSpeed.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">Mbps</span>
                          {activeStreams > 0 && (
                            <span className={`text-xs mt-1 ${proMode ? 'text-yellow-500' : 'text-primary'}`}>
                              {activeStreams} streams
                            </span>
                          )}
                        </>
                      )}
                      {phase === "latency" && (
                        <>
                          <Signal className={`h-12 w-12 animate-pulse ${proMode ? 'text-yellow-500' : 'text-primary'}`} />
                          <span className="text-sm text-muted-foreground mt-2">Measuring RTT...</span>
                        </>
                      )}
                      {phase === "connecting" && (
                        <>
                          <Server className={`h-12 w-12 animate-pulse ${proMode ? 'text-yellow-500' : 'text-primary'}`} />
                          <span className="text-sm text-muted-foreground mt-2">Connecting...</span>
                        </>
                      )}
                      {phase === "cooldown" && (
                        <>
                          <Clock className="h-12 w-12 text-yellow-500 animate-pulse" />
                          <span className="text-sm text-muted-foreground mt-2">Cooling down...</span>
                        </>
                      )}
                      {phase === "analyzing" && (
                        <>
                          <Brain className={`h-12 w-12 animate-pulse ${proMode ? 'text-yellow-500' : 'text-primary'}`} />
                          <span className="text-sm text-muted-foreground mt-2">Analyzing...</span>
                        </>
                      )}
                      {phase === "complete" && result && (
                        <>
                          <CheckCircle2 className="h-12 w-12 text-green-500" />
                          <span className="text-sm text-muted-foreground mt-2">
                            {proMode ? 'Pro Verified' : 'Verified'}
                          </span>
                        </>
                      )}
                      {phase === "error" && (
                        <>
                          <XCircle className="h-12 w-12 text-destructive" />
                          <span className="text-sm text-destructive mt-2">Failed</span>
                        </>
                      )}
                      {phase === "failure" && (
                        <>
                          <AlertTriangle className="h-12 w-12 text-destructive" />
                          <span className="text-sm text-destructive mt-2">Network Failure</span>
                        </>
                      )}
                      {(phase === "retrying" || phase === "diagnosing") && (
                        <>
                          <RotateCcw className={`h-12 w-12 animate-spin ${proMode ? 'text-yellow-500' : 'text-primary'}`} />
                          <span className="text-sm text-muted-foreground mt-2">
                            {phase === "retrying" ? `Retry ${retryCount}/2...` : 'Diagnosing...'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <p className="text-lg font-medium text-foreground mb-2">{phaseLabels[phase]}</p>
                  
                  {isRunning && (
                    <Progress value={progress} className={`max-w-sm mx-auto mb-4 ${proMode ? '[&>div]:bg-yellow-500' : ''}`} />
                  )}
                  
                  {/* Server Switch Indicator */}
                  {currentSwitchReason && proMode && (
                    <div className="max-w-sm mx-auto mb-4 p-3 rounded-lg bg-orange-500/20 border border-orange-500/50 animate-pulse">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-orange-400">Auto Server Switch</p>
                          <p className="text-xs text-orange-300">{currentSwitchReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Server Switch History (during test) */}
                  {serverSwitches.length > 0 && isRunning && proMode && (
                    <div className="max-w-sm mx-auto mb-4 p-2 rounded-lg bg-muted/50 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Server switches: {serverSwitches.length}</p>
                      <div className="space-y-1">
                        {serverSwitches.slice(-2).map((sw, i) => (
                          <div key={i} className="text-xs flex items-center gap-1">
                            <Zap className="h-3 w-3 text-yellow-500" />
                            <span className="text-muted-foreground">{sw.fromServer}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-green-400">{sw.toServer}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {errorMessage && (
                    <p className="text-sm text-destructive mb-4">{errorMessage}</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-center gap-3 mt-6">
                    {(phase === "idle" || phase === "error" || phase === "failure") && (
                      <Button 
                        size="lg" 
                        onClick={runTest} 
                        className={`gap-2 ${proMode ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}`}
                      >
                        {proMode ? <Crown className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        {phase === "failure" ? 'Retry SmartSpeed Test' : proMode ? 'Start SmartSpeed Pro' : 'Start SmartSpeed Test'}
                      </Button>
                    )}
                    {isRunning && (
                      <Button size="lg" variant="destructive" onClick={resetTest} className="gap-2">
                        <RotateCcw className="h-5 w-5" />
                        Cancel
                      </Button>
                    )}
                    {phase === "complete" && (
                      <>
                        <Button 
                          size="lg" 
                          onClick={runTest} 
                          className={`gap-2 ${proMode ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}`}
                        >
                          <RotateCcw className="h-5 w-5" />
                          Test Again
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => exportResults('json')} className="gap-2">
                          <FileJson className="h-4 w-4" />
                          JSON
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => exportResults('text')} className="gap-2">
                          <FileText className="h-4 w-4" />
                          Text
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Graphs */}
            {(downloadData.length > 0 || uploadData.length > 0) && (
              <Card className={proMode ? 'border-yellow-500/20' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Real-Time Speed Graph
                    <Badge variant="outline" className="ml-2 text-xs">
                      {phase === "download" ? "Download" : "Upload"}
                    </Badge>
                    {proMode && currentPass > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Pass {currentPass}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={phase === "download" || phase === "upload" ? (phase === "download" ? downloadData : uploadData) : downloadData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                        <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          labelStyle={{ color: 'hsl(var(--foreground))' }}
                          formatter={(value: number) => [`${value.toFixed(1)} Mbps`, 'Speed']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="speed" 
                          stroke={proMode ? "rgb(234 179 8)" : "hsl(var(--primary))"} 
                          fill={proMode ? "rgb(234 179 8)" : "hsl(var(--primary))"} 
                          fillOpacity={0.2}
                          strokeWidth={2}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Grid */}
            {result && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4 pb-4 text-center">
                    <Download className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold text-foreground">{result.download.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Mbps Download</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4 pb-4 text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold text-foreground">{result.upload.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Mbps Upload</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4 pb-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold text-foreground">{result.latency.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">ms Latency</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-4 pb-4 text-center">
                    <Activity className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold text-foreground">{result.jitter.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">ms Jitter</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ISP & Server Info - Compact Results Display */}
            {result && (result.ispInfo || result.serverUsed) && (
              <Card className={proMode ? 'border-yellow-500/20' : 'border-border'}>
                <CardContent className="py-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {result.ispInfo && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{result.ispInfo.isp}</p>
                          <p className="text-xs text-muted-foreground">
                            {result.ispInfo.connectionType} • {result.ispInfo.city}, {result.ispInfo.country}
                          </p>
                        </div>
                      </div>
                    )}
                    {result.serverUsed && (
                      <div className="flex items-center gap-3">
                        <Server className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{result.serverUsed.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {result.serverUsed.city}, {result.serverUsed.country} • {result.serverUsed.latency?.toFixed(0) || '-'} ms
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {result && (
              <Card className={proMode ? 'border-yellow-500/20' : ''}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Advanced Metrics
                    {proMode && <Badge variant="secondary" className="text-xs">Pro Mode</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid ${proMode ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-5'} gap-4 text-center text-sm`}>
                    <div>
                      <p className="text-muted-foreground">Packet Loss</p>
                      <p className={`text-lg font-bold ${result.packetLoss > 1 ? 'text-red-500' : 'text-green-500'}`}>
                        {result.packetLoss.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Stability</p>
                      <p className={`text-lg font-bold ${result.stabilityScore >= 80 ? 'text-green-500' : result.stabilityScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {result.stabilityScore.toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Burst Speed</p>
                      <p className="text-lg font-bold text-foreground">{result.burstSpeed.toFixed(1)} Mbps</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sustained</p>
                      <p className="text-lg font-bold text-foreground">{result.sustainedSpeed.toFixed(1)} Mbps</p>
                    </div>
                    {!proMode && (
                      <div>
                        <p className="text-muted-foreground">Loaded Latency</p>
                        <p className={`text-lg font-bold ${result.latencyUnderLoad > result.latency * 2 ? 'text-red-500' : 'text-foreground'}`}>
                          {result.latencyUnderLoad.toFixed(0)} ms
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Pro Mode: Latency under load breakdown */}
                  {proMode && result.latencyIdle !== undefined && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-3">Latency Under Load Analysis</p>
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <p className="text-muted-foreground">Idle</p>
                          <p className="text-lg font-bold text-foreground">{result.latencyIdle?.toFixed(0)} ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">During Download</p>
                          <p className={`text-lg font-bold ${(result.latencyDownload || 0) > (result.latencyIdle || 0) * 2 ? 'text-red-500' : 'text-foreground'}`}>
                            {result.latencyDownload?.toFixed(0) || '-'} ms
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">During Upload</p>
                          <p className={`text-lg font-bold ${(result.latencyUpload || 0) > (result.latencyIdle || 0) * 2 ? 'text-red-500' : 'text-foreground'}`}>
                            {result.latencyUpload?.toFixed(0) || '-'} ms
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pro Mode: Multi-Pass Results */}
            {proMode && passResults.length > 0 && (
              <Card className="border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    Multi-Pass Verification Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {passResults.map((pass, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
                            Pass {pass.pass}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3 text-blue-500" />
                            {pass.download.toFixed(1)} Mbps
                          </span>
                          <span className="flex items-center gap-1">
                            <Upload className="h-3 w-3 text-green-500" />
                            {pass.upload.toFixed(1)} Mbps
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-yellow-500" />
                            {pass.latency.toFixed(0)} ms
                          </span>
                          <span className={`font-medium ${pass.stability >= 80 ? 'text-green-500' : pass.stability >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {pass.stability.toFixed(0)}% stable
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Network Diagnostics Panel - shown on failure */}
            {phase === "failure" && networkFailure && (
              <NetworkDiagnosticsPanel
                networkFailure={networkFailure}
                onRetryTest={runTest}
                isRetrying={false}
              />
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* SmartSpeed Settings */}
            <SmartSpeedSettings
              proMode={proMode}
              showServerHealth={showServerHealth}
              onShowServerHealthChange={setShowServerHealth}
              enableISPAffinity={enableISPAffinity}
              onEnableISPAffinityChange={setEnableISPAffinity}
              enableTracerouteValidation={enableTracerouteValidation}
              onEnableTracerouteValidationChange={setEnableTracerouteValidation}
              totalISPs={ispAffinity.totalISPs}
              preferredServer={preferredServer}
              onClearAffinityData={() => {
                ispAffinity.clearAllData();
                toast.success("ISP affinity data cleared");
              }}
            />
            
            {/* Server Health Dashboard (collapsible) */}
            {showServerHealth && (
              <ServerHealthDashboard
                connectionIntelUrl={CONNECTION_INTEL_URL}
                clientCity={ispInfo?.city}
                clientCountry={ispInfo?.country}
                connectionType={ispInfo?.connectionType}
                onServerSelect={(serverId) => {
                  addLog(`Manually selected server: ${serverId}`);
                  const server = servers.find(s => s.id === serverId);
                  if (server) {
                    setSelectedServer({ ...server, status: 'selected', selectionReason: 'Manually selected' });
                    toast.success(`Server ${server.name} selected`);
                  }
                }}
              />
            )}
            
            {/* Test History */}
            <SpeedTestHistory />

            {/* Test Configuration */}
            <Card className={proMode ? 'border-yellow-500/20' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {proMode ? <Crown className="h-4 w-4 text-yellow-500" /> : <Zap className="h-4 w-4 text-primary" />}
                  {proMode ? 'Pro Accuracy Configuration' : 'Engine Configuration'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Download Streams</span>
                  <span className="font-medium">{CONFIG.INITIAL_STREAMS}-{CONFIG.MAX_STREAMS}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Upload Streams</span>
                  <span className="font-medium">{CONFIG.UPLOAD_STREAMS}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chunk Size</span>
                  <span className="font-medium">{CONFIG.STREAM_CHUNK_SIZE}MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test Duration</span>
                  <span className="font-medium">{CONFIG.MIN_TEST_DURATION / 1000}s+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Warm-up</span>
                  <span className="font-medium">{CONFIG.WARM_UP_DURATION / 1000}s (excluded)</span>
                </div>
                {proMode && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verification Passes</span>
                      <span className="font-medium text-yellow-500">{CONFIG.TEST_PASSES}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sample Rate</span>
                      <span className="font-medium">{1000 / CONFIG.SAMPLE_INTERVAL} Hz</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis */}
            {aiAnalysis && (
              <Card className={`${proMode ? 'border-yellow-500/30' : 'border-primary/30'}`}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className={`h-4 w-4 ${proMode ? 'text-yellow-500' : 'text-primary'}`} />
                    AI Network Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Grade</span>
                    <span className={`text-3xl font-bold ${getGradeColor(aiAnalysis.overallGrade)}`}>
                      {aiAnalysis.overallGrade}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">{aiAnalysis.confidenceScore}%</span>
                  </div>
                  
                  <p className="text-sm text-foreground">{aiAnalysis.diagnosis}</p>
                  
                  {aiAnalysis.detectedIssues.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Detected Issues</p>
                      {aiAnalysis.detectedIssues.map((issue, i) => (
                        <div key={i} className={`p-2 rounded text-xs border ${getSeverityColor(issue.severity)}`}>
                          <p className="font-medium">{issue.issue}</p>
                          <p className="opacity-80">{issue.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {aiAnalysis.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Recommendations</p>
                      {aiAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                          <span>{rec.action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {aiAnalysis.comparison.suitableFor.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {aiAnalysis.comparison.suitableFor.map((activity, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{activity}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Test Log */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Test Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="font-mono text-xs space-y-1">
                    {testLog.length === 0 && (
                      <p className="text-muted-foreground">Waiting for test to start...</p>
                    )}
                    {testLog.map((log, i) => (
                      <p key={i} className={
                        log.includes('ERROR') ? 'text-red-400' : 
                        log.includes('complete') || log.includes('Complete') ? 'text-green-400' : 
                        log.includes('===') ? 'text-primary font-bold' :
                        log.includes('streams') ? 'text-blue-400' :
                        log.includes('PRO') || log.includes('Pass') ? 'text-yellow-400' :
                        log.includes('saturated') || log.includes('✓') ? 'text-green-400' :
                        log.includes('⚠') ? 'text-yellow-400' :
                        'text-muted-foreground'
                      }>
                        {log}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Verified Badge */}
            {phase === "complete" && (
              <Card className={proMode 
                ? "bg-yellow-500/10 border-yellow-500/30" 
                : "bg-green-500/10 border-green-500/30"
              }>
                <CardContent className="py-4 text-center">
                  {proMode ? (
                    <>
                      <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p className="font-medium text-yellow-500">Pro Accuracy Verified</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {CONFIG.TEST_PASSES}-pass multi-stream verification
                      </p>
                      {result?.linkSaturated ? (
                        <p className="text-xs text-green-500 mt-1">
                          ✓ Link fully saturated
                        </p>
                      ) : result?.limitingFactor && (
                        <p className="text-xs text-yellow-500 mt-1">
                          ⚠ {result.limitingFactor}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="font-medium text-green-500">Verified Real-Time Test</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Multi-stream high-throughput measurement
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {CONFIG.INITIAL_STREAMS} parallel connections
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpeedTest;
