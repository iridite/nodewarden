import { Env } from '../types';
import { jsonResponse, errorResponse } from '../utils/response';
import { StorageService } from '../services/storage';

// Export vault data (encrypted backup)
export async function handleExportVault(
  request: Request,
  env: Env,
  userId: string
): Promise<Response> {
  try {
    const storage = new StorageService(env.DB);

    // Get all user data
    const user = await storage.getUserById(userId);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const ciphers = await storage.getAllCiphers(userId);
    const folders = await storage.getAllFolders(userId);
    const devices = await storage.getDevicesByUserId(userId);

    // Get attachment metadata (not the actual files)
    const attachmentMetadata: any[] = [];
    for (const cipher of ciphers) {
      const attachments = await storage.getAttachmentsByCipher(cipher.id);
      if (attachments.length > 0) {
        attachmentMetadata.push({
          cipherId: cipher.id,
          attachments: attachments.map(a => ({
            id: a.id,
            fileName: a.fileName,
            size: a.size,
          })),
        });
      }
    }

    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      serverVersion: '2026.1.0',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        kdfType: user.kdfType,
        kdfIterations: user.kdfIterations,
        kdfMemory: user.kdfMemory,
        kdfParallelism: user.kdfParallelism,
      },
      ciphers: ciphers.map(c => ({
        id: c.id,
        type: c.type,
        folderId: c.folderId,
        name: c.name,
        notes: c.notes,
        favorite: c.favorite,
        data: c.data,
        reprompt: c.reprompt,
        key: c.key,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        deletedAt: c.deletedAt,
      })),
      folders: folders.map(f => ({
        id: f.id,
        name: f.name,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
      devices: devices.map(d => ({
        identifier: d.deviceIdentifier,
        name: d.name,
        type: d.type,
        createdAt: d.createdAt,
      })),
      attachmentMetadata,
    };

    return jsonResponse(exportData);
  } catch (error) {
    console.error('Export vault error:', error);
    return errorResponse('Failed to export vault', 500);
  }
}

// Get export summary (counts only, no sensitive data)
export async function handleExportSummary(
  request: Request,
  env: Env,
  userId: string
): Promise<Response> {
  try {
    const storage = new StorageService(env.DB);
    const stats = await storage.getVaultStats(userId);

    return jsonResponse({
      summary: {
        totalCiphers: stats.ciphers.total,
        totalFolders: stats.folders,
        totalAttachments: stats.attachments.count,
        totalSizeMB: stats.attachments.totalSizeMB,
      },
      exportDate: new Date().toISOString(),
      note: 'Use POST /api/vault/export to download full encrypted backup',
    });
  } catch (error) {
    console.error('Export summary error:', error);
    return errorResponse('Failed to get export summary', 500);
  }
}
