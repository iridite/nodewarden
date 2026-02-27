import { Env, DEFAULT_DEV_SECRET } from '../types';
import { StorageService } from '../services/storage';
import { jsonResponse, htmlResponse } from '../utils/response';
import { renderRegisterPageHTML } from '../setup/pageTemplate';
import { LIMITS } from '../config/limits';

type JwtSecretState = 'missing' | 'default' | 'too_short';

function getJwtSecretState(env: Env): JwtSecretState | null {
  const secret = (env.JWT_SECRET || '').trim();
  if (!secret) return 'missing';
  // Block common "forgot to change" sample value (matches .dev.vars.example)
  if (secret === DEFAULT_DEV_SECRET) return 'default';
  if (secret.length < LIMITS.auth.jwtSecretMinLength) return 'too_short';
  return null;
}

async function handleRegisterPage(request: Request, env: Env, jwtState: JwtSecretState | null): Promise<Response> {
  void request;
  void env;
  return htmlResponse(renderRegisterPageHTML(jwtState));
}

// GET / - Setup page
export async function handleSetupPage(request: Request, env: Env): Promise<Response> {
  const jwtState = getJwtSecretState(env);
  return handleRegisterPage(request, env, jwtState);
}

// GET /setup/status
export async function handleSetupStatus(request: Request, env: Env): Promise<Response> {
  void request;
  const storage = new StorageService(env.DB);
  const registered = await storage.isRegistered();
  return jsonResponse({ registered });
}

// GET /setup/diagnostics - System diagnostics for setup page
export async function handleSetupDiagnostics(request: Request, env: Env): Promise<Response> {
  void request;
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Check JWT secret
  const jwtState = getJwtSecretState(env);
  diagnostics.checks.jwtSecret = {
    status: jwtState === null ? 'ok' : 'error',
    message: jwtState === null ? 'JWT secret is properly configured' : `JWT secret issue: ${jwtState}`,
  };

  // Check D1 database
  try {
    const start = Date.now();
    await env.DB.prepare('SELECT 1').first();
    diagnostics.checks.database = {
      status: 'ok',
      message: 'D1 database is accessible',
      responseTime: Date.now() - start,
    };
  } catch (error) {
    diagnostics.checks.database = {
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }

  // Check R2 storage
  try {
    const start = Date.now();
    await env.ATTACHMENTS.head('health-check-probe');
    diagnostics.checks.storage = {
      status: 'ok',
      message: 'R2 storage is accessible',
      responseTime: Date.now() - start,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Object Not Found')) {
      diagnostics.checks.storage = {
        status: 'ok',
        message: 'R2 storage is accessible',
        responseTime: Date.now() - start,
      };
    } else {
      diagnostics.checks.storage = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Storage connection failed',
      };
    }
  }

  // Check if user is registered
  try {
    const storage = new StorageService(env.DB);
    const registered = await storage.isRegistered();
    diagnostics.checks.registration = {
      status: 'info',
      message: registered ? 'User account exists' : 'No user account yet',
      registered,
    };
  } catch (error) {
    diagnostics.checks.registration = {
      status: 'error',
      message: 'Failed to check registration status',
    };
  }

  // Check TOTP configuration
  diagnostics.checks.totp = {
    status: 'info',
    message: env.TOTP_SECRET ? 'TOTP 2FA is enabled' : 'TOTP 2FA is not configured',
    enabled: !!env.TOTP_SECRET,
  };

  return jsonResponse(diagnostics);
}
