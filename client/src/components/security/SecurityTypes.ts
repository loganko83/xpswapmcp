export interface SecurityStatus {
  overall: "secure" | "warning" | "critical";
  score: number;
  lastUpdated: number;
  systems: {
    reentrancy: boolean;
    mev_protection: boolean;
    circuit_breaker: boolean;
    slippage_protection: boolean;
    flash_loan_protection: boolean;
    governance_security: boolean;
    oracle_security: boolean;
    pause_mechanism: boolean;
  };
}

export interface SecurityAlert {
  id: string;
  type: "security" | "warning" | "info";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: number;
  source: string;
  action_required: boolean;
  resolved: boolean;
  affected_components: string[];
  resolution_steps?: string[];
}

export interface SecurityMetric {
  timestamp: string;
  threats_blocked: number;
  security_score: number;
  suspicious_activity: number;
  failed_attempts: number;
  successful_defenses: number;
}

export interface ThreatData {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  source: string;
  timestamp: number;
  status: "active" | "mitigated" | "investigating";
  affected_contracts: string[];
  mitigation_actions: string[];
}

export type TimeframeType = "1h" | "24h" | "7d" | "30d";
