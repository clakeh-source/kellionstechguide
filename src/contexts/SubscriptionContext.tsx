import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type PlanType = 'basic' | 'pro' | 'enterprise';

export interface SubscriptionState {
  plan: PlanType;
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  trialEnd: string | null;
  isTrialing: boolean;
  loading: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  checkSubscription: () => Promise<void>;
  createCheckout: () => Promise<string | null>;
  openCustomerPortal: () => Promise<string | null>;
  canAccessFeature: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

// Features available per plan
const PLAN_FEATURES: Record<PlanType, string[]> = {
  basic: [
    'general-questions',
    'cidr-cheat-sheet',
    'vlsm-training',
    'basic-subnet-calculator',
    'knowledge-base',
    // PacketScope Basic
    'packetscope-live-capture',
    'packetscope-basic-decode',
    'packetscope-learning-mode',
    'packetscope-pcap-import',
  ],
  pro: [
    'general-questions',
    'cidr-cheat-sheet',
    'vlsm-training',
    'basic-subnet-calculator',
    'knowledge-base',
    'full-subnet-calculator',
    'remote-troubleshooting',
    'log-analyzer',
    'diagnostic-scripts',
    'firewall-guidance',
    'cloud-guidance',
    'devops-guidance',
    'save-sessions',
    'export-features',
    // PacketScope Pro
    'packetscope-live-capture',
    'packetscope-basic-decode',
    'packetscope-learning-mode',
    'packetscope-pcap-import',
    'packetscope-root-cause',
    'packetscope-visual-timeline',
    'packetscope-smart-filters',
    'packetscope-app-profiling',
    'packetscope-protocol-validation',
    'packetscope-baseline-drift',
    'packetscope-diagnostic-export',
  ],
  enterprise: [
    'general-questions',
    'cidr-cheat-sheet',
    'vlsm-training',
    'basic-subnet-calculator',
    'knowledge-base',
    'full-subnet-calculator',
    'remote-troubleshooting',
    'log-analyzer',
    'diagnostic-scripts',
    'firewall-guidance',
    'cloud-guidance',
    'devops-guidance',
    'save-sessions',
    'export-features',
    'unlimited-usage',
    'team-access',
    'shared-sessions',
    'escalation-workflows',
    'priority-support',
    // PacketScope Enterprise (all features)
    'packetscope-live-capture',
    'packetscope-basic-decode',
    'packetscope-learning-mode',
    'packetscope-pcap-import',
    'packetscope-root-cause',
    'packetscope-visual-timeline',
    'packetscope-smart-filters',
    'packetscope-app-profiling',
    'packetscope-protocol-validation',
    'packetscope-baseline-drift',
    'packetscope-diagnostic-export',
    'packetscope-multi-source',
    'packetscope-security-fusion',
    'packetscope-performance-budgets',
    'packetscope-collaboration',
  ],
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, session, loading: authLoading, isAdmin } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    plan: 'basic',
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
    trialEnd: null,
    isTrialing: false,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setState(prev => ({ 
        ...prev, 
        plan: 'basic',
        subscribed: false,
        loading: false 
      }));
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      setState({
        plan: data.plan || 'basic',
        subscribed: data.subscribed || false,
        productId: data.product_id || null,
        subscriptionEnd: data.subscription_end || null,
        trialEnd: data.trial_end || null,
        isTrialing: data.is_trialing || false,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [session?.access_token]);

  const createCheckout = useCallback(async (): Promise<string | null> => {
    if (!session?.access_token) {
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      return null;
    }
  }, [session?.access_token]);

  const openCustomerPortal = useCallback(async (): Promise<string | null> => {
    if (!session?.access_token) {
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data.url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      return null;
    }
  }, [session?.access_token]);

  const canAccessFeature = useCallback((feature: string): boolean => {
    // Admins have full access to all features
    if (isAdmin) return true;
    return PLAN_FEATURES[state.plan]?.includes(feature) || false;
  }, [isAdmin, state.plan]);

  // Check subscription on auth change
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        checkSubscription();
      } else {
        setState({
          plan: 'basic',
          subscribed: false,
          productId: null,
          subscriptionEnd: null,
          trialEnd: null,
          isTrialing: false,
          loading: false,
        });
      }
    }
  }, [user, authLoading, checkSubscription]);

  // Auto-refresh subscription every 60 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return (
    <SubscriptionContext.Provider value={{
      ...state,
      checkSubscription,
      createCheckout,
      openCustomerPortal,
      canAccessFeature,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
