import express, { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { UnifiedMCPServer, UserRole, SecurityContext } from '@uxin/mcp';
import { ACPCoordinationMessage } from '@uxin/types';
import { DatabaseService } from '../lib/db/service.js';

const router: Router = express.Router();

// Initialize the Unified MCP Server
const mcpServer = new UnifiedMCPServer();

/**
 * POST /api/v1/mcp/route
 * Routes a request to the appropriate MCP tool with RBAC check
 */
router.post('/route', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const db = DatabaseService.getInstance();
        if (!db.isAvailable()) {
            res.status(503).json({ success: false, message: '数据库连接不可用' });
            return;
        }

        const user = req.user;
        if (!user) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const body = req.body;
        const { message } = body as { message: ACPCoordinationMessage };

        if (!message || !message.body || !message.body.action) {
            res.status(400).json({ success: false, error: 'Invalid ACP message structure' });
            return;
        }

        // Map user role to MCP UserRole
        const userRoleMap: Record<string, UserRole> = {
            ADMIN: UserRole.ADMIN,
            MANAGER: UserRole.PROJECT_MANAGER,
            USER: UserRole.DEVELOPER,
            GUEST: UserRole.GUEST,
        };

        const securityContext: SecurityContext = {
            userId: user.id,
            role: userRoleMap[user.role || 'GUEST'] || UserRole.GUEST,
            projectId: message.body.context?.project_id,
        };

        // Route the message through the MCP server
        const result = await mcpServer.handleMessage(message, securityContext);

        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error('MCP Routing Error:', error);
        res.status(error.message?.includes('Permission denied') ? 403 : 500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
});

/**
 * GET /api/v1/mcp/health
 * Returns the health status of all registered MCP tools or dashboard data
 */
router.get('/health', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const db = DatabaseService.getInstance();
        if (!db.isAvailable()) {
            res.status(503).json({ success: false, message: '数据库连接不可用' });
            return;
        }

        const user = req.user;
        if (!user) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        const type = req.query.type as string;
        const projectId = req.query.projectId as string;

        if (type === 'dashboard') {
            const dashboardData = await mcpServer.getDashboardData(projectId || undefined);
            res.json({ success: true, data: dashboardData });
            return;
        }

        const healthStatus = await mcpServer.getHealthStatus();
        res.json({ success: true, data: healthStatus });
    } catch (error: any) {
        console.error('MCP Health Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
});

export default router;
