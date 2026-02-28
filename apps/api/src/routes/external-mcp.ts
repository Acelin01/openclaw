import express, { Router, Response } from 'express';
import { UnifiedMCPServer, UserRole, SecurityContext } from '@uxin/mcp/server';
import { ACPCoordinationMessage } from '@uxin/types';
import { DatabaseService } from '../lib/db/service.js';
import { toolRegistry } from '../lib/ai/tools/mcp/registry.js';
import { ApiTokenRequest, apiRateLimit, authenticateApiToken, recordApiUsage } from '../middleware/api-token.js';
import { resolveDefaultAllowlist, resolveMcpPermission } from '../lib/mcp/permissions.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router: Router = express.Router();
const mcpServer = new UnifiedMCPServer();
toolRegistry.getAllTools().forEach((tool) => {
  mcpServer.getRegistry().register(tool);
});

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
      const tool = message.body.action;
      const toolAllowlist = Array.isArray(req.apiClient?.toolAllowlist)
        ? (req.apiClient?.toolAllowlist as string[])
        : resolveDefaultAllowlist();
      if (toolAllowlist.length > 0 && !toolAllowlist.includes(tool)) {
        res.status(403).json({ success: false, error: 'Tool not allowed' });
        return;
      }
      const permissionKey = resolveMcpPermission(tool);
      const permissionAllowlist = Array.isArray(req.apiClient?.permissionAllowlist)
        ? (req.apiClient?.permissionAllowlist as string[])
        : [];
      if (permissionAllowlist.length > 0 && !permissionAllowlist.includes(permissionKey)) {
        res.status(403).json({ success: false, error: 'Permission denied' });
        return;
      }
      const defaultProjectId = req.apiClient?.defaultProjectId;
      const defaultTeamId = req.apiClient?.defaultTeamId;
      const context = (message.body.context ?? ({} as unknown)) as {
        project_id?: string;
        team_id?: string;
      } & Record<string, unknown>;
      message.body.context = context as unknown as typeof message.body.context;
      if (!context.project_id && defaultProjectId) {
        context.project_id = defaultProjectId;
      }
      if (!context.team_id && defaultTeamId) {
        context.team_id = defaultTeamId;
      }
      const securityContext: SecurityContext = {
        userId: `api:${req.apiClient?.id || 'external'}`,
        role: UserRole.PROJECT_MANAGER,
        projectId: message.body.context?.project_id,
      };
      const result = await mcpServer.handleMessage(message, securityContext);
      res.json({ success: true, data: result });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : typeof error === 'string' ? error : 'Internal Server Error';
      res.status(String(message).includes('Permission denied') ? 403 : 500).json({
        success: false,
        error: message,
      });
    }
  },
);

/**
 * GET /api/v1/external/mcp/config
 * Returns the MCP configuration for external clients
 */
router.get(
  '/config',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const host = req.headers.host || 'localhost:8000';
      const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https';
      const apiBaseUrl = `${protocol}://${host}`;
      const endpoint = `${apiBaseUrl}/api/v1/external/mcp/route`;

      res.json({
        success: true,
        data: {
          mcpServers: {
            'uxin-mcp': {
              command: 'npx',
              args: ['mcporter', 'call', endpoint],
              env: {
                UXIN_API_TOKEN: '<YOUR_API_TOKEN>',
                API_BASE_URL: apiBaseUrl,
              },
            },
          },
          endpoint,
          apiBaseUrl,
          user: {
            id: req.user?.id,
            email: req.user?.email,
            role: req.user?.role,
          },
        },
      });
    } catch (error: any) {
      console.error('MCP Config Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Internal Server Error',
      });
    }
  },
);

export default router;
