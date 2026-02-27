import { Env } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';
import { StorageService } from '../services/storage';

export async function handleGetVaultStats(
  request: Request,
  env: Env,
  userId: string
): Promise<Response> {
  try {
    const storage = new StorageService(env.DB);
    const stats = await storage.getVaultStats(userId);

    return jsonResponse(stats);
  } catch (error) {
    console.error('Get vault stats error:', error);
    return errorResponse('Failed to retrieve vault statistics', 500);
  }
}
