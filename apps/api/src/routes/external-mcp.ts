import express, { Router, Response } from 'express';
import { UnifiedMCPServer, UserRole, SecurityContext } from '@uxin/mcp';
import { ACPCoordinationMessage } from '@uxin/types';
import { DatabaseService } from '../lib/db/service.js';
import { ApiTokenRequest, apiRateLimit, authenticateApiToken, recordApiUsage } from '../middleware/api-token.js';

const router: Router = express.Router();
const mcpServer = new UnifiedMCPServer();

router.post(
  '/route',
  authenticateApiToken,
  apiRateLimit(),
  recordApiUsage(),
  async (req: ApiTokenRequest, res: Response): Promise<void> => {
    try {
      const db = DatabaseService.getInstance();
      if (!db.isAvailable()) {
        res.status(503).json({ success: false, message: '数据库连接不可用' });
        return;
      }
      const body = req.body;
      const { message } = body as { message: ACPCoordinationMessage };
      if (!message || !message.body || !message.body.action) {
        res.status(400).json({ success: false, error: 'Invalid ACP message structure' });
        return;
      }
      const securityContext: SecurityContext = {
        userId: `api:${req.apiClient?.id || 'external'}`,
        role: UserRole.DEVELOPER,
        projectId: message.body.context?.project_id,
      };
      const result = await mcpServer.handleMessage(message, securityContext);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.message?.includes('Permission denied') ? 403 : 500).json({
        success: false,
        error: error.message || 'Internal Server Error',
      });
    }
  },
);

router.get(
  '/config',
  authenticateApiToken,
  apiRateLimit(),
  async (req: ApiTokenRequest, res: Response): Promise<void> => {
    const host = req.headers.host || 'localhost:3000';
    const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
    const endpoint = `${protocol}://${host}/api/v1/external/mcp/route`;
    res.json({
      success: true,
      data: {
        mcpServers: {
          'uxin-mcp': {
            command: 'npx',
            args: ['mcporter', 'call', endpoint],
            env: {
              UXIN_API_TOKEN: '<YOUR_API_TOKEN>',
            },
          },
        },
        endpoint,
        client: req.apiClient,
      },
    });
  },
);

export default router;
