import { Env } from '../types';
import { jsonResponse } from '../utils/response';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      responseTime?: number;
      error?: string;
    };
    storage: {
      status: 'ok' | 'error';
      responseTime?: number;
      error?: string;
    };
  };
}

export async function handleHealthCheck(request: Request, env: Env): Promise<Response> {
  const startTime = Date.now();
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2026.1.0',
    checks: {
      database: { status: 'ok' },
      storage: { status: 'ok' },
    },
  };

  // Check D1 database
  try {
    const dbStart = Date.now();
    await env.DB.prepare('SELECT 1').first();
    result.checks.database.responseTime = Date.now() - dbStart;
  } catch (error) {
    result.checks.database.status = 'error';
    result.checks.database.error = error instanceof Error ? error.message : 'Unknown error';
    result.status = 'unhealthy';
  }

  // Check R2 storage
  try {
    const r2Start = Date.now();
    await env.ATTACHMENTS.head('health-check-probe');
    result.checks.storage.responseTime = Date.now() - r2Start;
  } catch (error) {
    // R2 head() throws if object doesn't exist, which is fine for health check
    if (error instanceof Error && error.message.includes('Object Not Found')) {
      result.checks.storage.responseTime = Date.now() - Date.now();
    } else {
      result.checks.storage.status = 'error';
      result.checks.storage.error = error instanceof Error ? error.message : 'Unknown error';
      result.status = result.status === 'unhealthy' ? 'unhealthy' : 'degraded';
    }
  }

  const statusCode = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 200 : 503;
  return jsonResponse(result, statusCode);
}
