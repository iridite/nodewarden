import { Env } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';
import { StorageService } from '../services/storage';

interface SecurityLog {
  id: string;
  userId: string;
  eventType: 'login_success' | 'login_failed' | 'token_refresh' | 'password_change';
  ip: string;
  userAgent: string;
  deviceName?: string;
  deviceType?: number;
  timestamp: string;
}

export async function handleGetSecurityLogs(
  request: Request,
  env: Env,
  userId: string
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const storage = new StorageService(env.DB);
    const logs = await storage.getSecurityLogs(userId, limit, offset);

    return jsonResponse({
      data: logs,
      object: 'list',
      continuationToken: logs.length === limit ? (offset + limit).toString() : null,
    });
  } catch (error) {
    console.error('Get security logs error:', error);
    return errorResponse('Failed to retrieve security logs', 500);
  }
}

export async function handleGetSecurityStats(
  request: Request,
  env: Env,
  userId: string
): Promise<Response> {
  try {
    const storage = new StorageService(env.DB);
    const stats = await storage.getSecurityStats(userId);

    return jsonResponse(stats);
  } catch (error) {
    console.error('Get security stats error:', error);
    return errorResponse('Failed to retrieve security stats', 500);
  }
}
