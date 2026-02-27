import { Env } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';
import { StorageService } from '../services/storage';

// Batch delete ciphers
export async function handleBatchDeleteCiphers(
  request: Request,
  env: Env,
  userId: string
): Promise<Response> {
  try {
    const body = await request.json();
    const ids = body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse('Invalid request: ids array is required', 400);
    }

    if (ids.length > 100) {
      return errorResponse('Cannot delete more than 100 items at once', 400);
    }

    const storage = new StorageService(env.DB);
    let deletedCount = 0;

    for (const id of ids) {
      try {
        const cipher = await storage.getCipher(id);
        if (cipher && cipher.userId === userId) {
          cipher.deletedAt = new Date().toISOString();
          await storage.saveCipher(cipher);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Failed to delete cipher ${id}:`, error);
      }
    }

    return jsonResponse({
      success: true,
      deletedCount,
      totalRequested: ids.length,
    });
  } catch (error) {
    console.error('Batch delete error:', error);
    return errorResponse('Failed to delete ciphers', 500);
  }
}

// Batch restore ciphers
export async function handleBatchRestoreCiphers(
  request: Request,
  env: Env,
  userId: string
): Promise<Response> {
  try {
    const body = await request.json();
    const ids = body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse('Invalid request: ids array is required', 400);
    }

    if (ids.length > 100) {
      return errorResponse('Cannot restore more than 100 items at once', 400);
    }

    const storage = new StorageService(env.DB);
    let restoredCount = 0;

    for (const id of ids) {
      try {
        const cipher = await storage.getCipher(id);
        if (cipher && cipher.userId === userId && cipher.deletedAt) {
          cipher.deletedAt = null;
          await storage.saveCipher(cipher);
          restoredCount++;
        }
      } catch (error) {
        console.error(`Failed to restore cipher ${id}:`, error);
      }
    }

    return jsonResponse({
      success: true,
      restoredCount,
      totalRequested: ids.length,
    });
  } catch (error) {
    console.error('Batch restore error:', error);
    return errorResponse('Failed to restore ciphers', 500);
  }
}

// Batch permanent delete ciphers
export async function handleBatchPermanentDeleteCiphers(
  request: Request,
  env: Env,
  userId: string
): Promise<Response> {
  try {
    const body = await request.json();
    const ids = body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse('Invalid request: ids array is required', 400);
    }

    if (ids.length > 100) {
      return errorResponse('Cannot permanently delete more than 100 items at once', 400);
    }

    const storage = new StorageService(env.DB);
    let deletedCount = 0;

    for (const id of ids) {
      try {
        await storage.deleteCipher(id, userId);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to permanently delete cipher ${id}:`, error);
      }
    }

    return jsonResponse({
      success: true,
      deletedCount,
      totalRequested: ids.length,
    });
  } catch (error) {
    console.error('Batch permanent delete error:', error);
    return errorResponse('Failed to permanently delete ciphers', 500);
  }
}
