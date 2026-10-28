export interface HealthResult {
  name: string;
  ok: boolean;
  details?: unknown;
}

export interface HealthCheck {
  check(): Promise<HealthResult>;
}
