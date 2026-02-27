import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { z } from 'zod';
import {
  saveDocument,
  getDocumentsById,
  deleteDocumentsByIdAfterTimestamp,
  getPublicDocuments,
  getDocumentsByChatId,
  updateDocumentStatus,
  batchUpdateDocumentStatusByChatId,
  ensureGuestUser,
  getDB,
} from '../lib/db/queries.js';
import { getDocumentsByUser } from '../lib/db/queries.js';
import { artifactKinds } from '../lib/artifacts/server.js';
import { DatabaseService } from '../lib/db/service.js';
import { generateUUID } from '../lib/utils.js';

import { generateText } from "ai";
import { myProvider } from "../lib/ai/providers.js";
import { createTasks } from "../lib/ai/tools/create-tasks.js";

export async function handleArtifactApproval(doc: any, db: any, _generateText = generateText) {
    try {
        const content = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;
        const kind = doc.kind;
        const userId = doc.userId;

        console.log(`[handleArtifactApproval] Handling approval for kind: ${kind}, docId: ${doc.id}`);

        switch (kind) {
            case 'project': {
                const projectData = {
                    userId: userId,
                    name: content.name || content.title || doc.title || 'Untitled Project',
                    description: content.description || '',
                    status: content.status || '进行中',
                    budgetMin: content.budgetMin || (typeof content.budget === 'number' ? content.budget : undefined),
                    budgetMax: content.budgetMax,
                    tags: Array.isArray(content.tags) ? content.tags.join(',') : content.tags,
                    location: content.location,
                    dueDate: content.dueDate ? new Date(content.dueDate) : undefined,
                };
                const project = await db.createProject(projectData);

                // Handle Agent Handoff: PM -> Technical Manager
                const pmAgentId = doc.agentId;
                if (pmAgentId) {
                    const pmAgent = await db.getAgentById(pmAgentId);
                    let techAgent = null;
                    if (pmAgent && (pmAgent as any).agents_B && (pmAgent as any).agents_B.length > 0) {
                        techAgent = (pmAgent as any).agents_B.find((a: any) => 
                            a.identifier?.includes('tech') || a.name?.includes('Technical') || a.name?.includes('技术')
                        );
                    }

                    if (techAgent) {
                        const users = await db.getUsers({}, { take: 5 });
                        const teamContext = users.map((u: any) => `- ${u.name} (${u.role || 'MEMBER'}) ID: ${u.id}`).join('\n');
                        const instructionContent = `@${techAgent.name} Project "${projectData.name}" has been approved. Based on your rules, please break down the requirements into tasks and assign them.`;
                        
                        await getDB().chatMessage.create({
                            data: {
                                id: generateUUID(),
                                chatId: doc.chatId!,
                                role: 'assistant',
                                content: instructionContent,
                                parts: [],
                                attachments: [],
                                createdAt: new Date(),
                                userId: userId,
                                agentId: pmAgent.id,
                            }
                        });

                        try {
                            const result = await _generateText({
                                model: myProvider.languageModel("chat-model"),
                                system: `You are ${techAgent.name}. ${techAgent.prompt || 'You are a helpful assistant.'} 
Your task is to break down the project requirements into specific tasks and create them using the available tools.
Project Name: ${projectData.name}
Description: ${projectData.description}

Available Team Members for Assignment:
${teamContext}
`,
                                messages: [{ role: 'user', content: instructionContent }],
                                tools: {
                                    createTasks: createTasks({ projectId: project.id, userId: userId })
                                },
                            });
                            
                            if (result.text) {
                                await getDB().chatMessage.create({
                                    data: {
                                        id: generateUUID(),
                                        chatId: doc.chatId!,
                                        role: 'assistant',
                                        content: result.text,
                                        parts: [],
                                        attachments: [],
                                        createdAt: new Date(Date.now() + 1000),
                                        userId: userId,
                                        agentId: techAgent.id, 
                                    }
                                });
                            }
                        } catch (err) {
                            console.error('[Agent Handoff] Tech Agent execution failed:', err);
                        }
                    }
                }
                break;
            }

            case 'requirement':
            case 'project-requirement': {
                await db.createProjectRequirement({ ...content, userId });
                break;
            }

            case 'task': {
                await db.createProjectTask({ ...content, userId });
                break;
            }

            case 'bug': {
                await db.createProjectDefect({ ...content, userId });
                break;
            }

            case 'iteration': {
                await db.createIteration({ ...content, userId });
                break;
            }

            case 'milestone': {
                await db.createProjectMilestone({ ...content, userId });
                break;
            }

            case 'risk': {
                await db.createProjectRisk({ ...content, userId });
                break;
            }

            // Freelancer related kinds
            case 'resume': {
                const resumeData = {
                    userId: userId,
                    name: content.name || content.candidateName || doc.title || '无名氏',
                    title: content.title || doc.title,
                    summary: content.summary || content.content || '',
                    skills: content.skills || [],
                    experiences: content.experiences || content.experience || [],
                    education: content.education || [],
                    status: 'ACTIVE'
                };
                await db.createResume(resumeData);
                break;
            }

            case 'freelancer_registration': {
                const profileData = {
                    userId: userId,
                    title: content.title,
                    bio: content.bio || content.description,
                    location: content.location,
                    skills: content.skills || [],
                    hourlyRateAmount: content.hourlyRateAmount || content.hourlyRate || content.price,
                    hourlyRateCurrency: content.hourlyRateCurrency || content.currency || 'CNY',
                    hourlyRateUnit: content.hourlyRateUnit || '/小时',
                    consultationEnabled: content.consultationEnabled ?? true,
                };
                await db.upsertWorkerProfile(profileData);
                break;
            }

            case 'service': {
                let workerId = content.workerId;
                
                if (!workerId || workerId === userId) {
                    const profile = await db.getWorkerProfileByUserId(userId);
                    if (profile) {
                        workerId = profile.id;
                    } else {
                        const newProfile = await db.upsertWorkerProfile({ userId });
                        workerId = newProfile.id;
                    }
                }

                const serviceData = {
                    workerId,
                    title: content.title || doc.title,
                    description: content.description || content.content || '',
                    priceAmount: content.priceAmount || content.price || 0,
                    priceCurrency: content.priceCurrency || content.currency || 'CNY',
                    category: content.category,
                    unit: content.unit || '次',
                    deliveryTime: content.deliveryTime,
                    status: 'PUBLISHED'
                };
                const createdService = await db.createWorkerService(serviceData);

                let quotation: any = null;
                try {
                    quotation = await db.createQuotation({
                        userId,
                        title: serviceData.title || '服务报价单',
                        description: serviceData.description || '',
                        category: serviceData.category || 'service',
                        priceType: 'FIXED',
                        priceAmount: serviceData.priceAmount,
                        deliveryTime: serviceData.deliveryTime,
                        serviceId: createdService.id,
                        status: 'ACTIVE',
                        aiGenerated: true,
                    });
                } catch (e) {
                    console.error('[handleArtifactApproval] Failed to create quotation for service', e);
                }

                if (quotation?.id) {
                    await getDB().workerService.update({
                        where: { id: createdService.id },
                        data: { quotationId: quotation.id }
                    });
                }

                const customerId = content.customerId || content.clientId || content.client_id || content.customer_id;
                if (customerId) {
                    const amount = Number(content.amount ?? content.priceAmount ?? content.price ?? serviceData.priceAmount ?? 0);
                    const currency = content.currency || serviceData.priceCurrency || 'CNY';
                    await db.createTransaction({
                        customerId,
                        providerId: userId,
                        amount,
                        currency,
                        quotationId: quotation?.id,
                        userId
                    });
                }
                break;
            }

            case 'transaction': {
                await db.createTransaction({ ...content, userId });
                break;
            }

            case 'contract': {
                await db.createContract({ ...content, userId });
                break;
            }

            default:
                console.log(`[handleArtifactApproval] No specific handler for kind: ${kind}`);
        }
    } catch (e) {
        console.error(`Failed to handle approval for document ${doc.id}`, e);
    }
}

const router: Router = Router();

// GET /api/v1/document/public
router.get('/public', async (req, res) => {
    try {
        const db = DatabaseService.getInstance();
        if (!db.isAvailable()) {
            return res.status(503).json({ success: false, message: '数据库连接不可用' });
        }
        const { kind } = req.query as { kind?: string };
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const filteredKind = typeof kind === 'string' ? (kind as any) : undefined;
        const docs = await getPublicDocuments({ kind: filteredKind, page, limit });
        return res.json({ success: true, data: docs, page, limit });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: 'Failed to fetch public document(s)' });
    }
});

// GET /api/v1/document?id=...
router.get('/', async (req: AuthenticatedRequest, res) => {
    try {
        const db = DatabaseService.getInstance();
        if (!db.isAvailable()) {
            return res.status(503).json({ success: false, message: '数据库连接不可用' });
        }
        const { id, kind } = req.query as { id?: string; kind?: string };

        // Handle guest user
        let userId = req.user?.id;
        if (!userId) {
            const guestId = 'guest-user-id';
            const guestEmail = 'guest@example.com';
            await ensureGuestUser(guestId, guestEmail);
            userId = guestId;
        }

        // If id is provided, fetch by id (single document or versions)
        if (id && typeof id === 'string') {
            const documents = await getDocumentsById({ id });
            
            if (documents.length === 0) {
                return res.status(404).json({ success: false, error: 'Document not found' });
            }

            const document = documents[0];
            if (!document) {
                return res.status(404).json({ success: false, error: 'Document not found' });
            }

            // Return full document for API requests, especially for Admin/AI Chat app
            return res.json(document);
        }

        // Otherwise, list documents for current user, optionally filtered by kind
        const filteredKind = typeof kind === 'string' ? (kind as any) : undefined;
        const docs = await getDocumentsByUser({ userId: userId as string, kind: filteredKind });
        return res.json({ success: true, data: docs });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: 'Failed to fetch document(s)' });
    }
});

// GET /api/v1/document/chat/:chatId
router.get('/chat/:chatId', async (req: AuthenticatedRequest, res) => {
    try {
        const db = DatabaseService.getInstance();
        if (!db.isAvailable()) {
            return res.status(503).json({ success: false, message: '数据库连接不可用' });
        }
        const { chatId } = req.params;
        if (!chatId) {
            return res.status(400).json({ success: false, error: 'Chat ID is required' });
        }
        const docs = await getDocumentsByChatId({ chatId });
        return res.json({ success: true, data: docs });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: 'Failed to fetch chat documents' });
    }
});

// PATCH /api/v1/document/:id/status
router.patch('/:id/status', async (req: AuthenticatedRequest, res) => {
    try {
        const db = DatabaseService.getInstance();
        if (!db.isAvailable()) {
            return res.status(503).json({ success: false, message: '数据库连接不可用' });
        }
        const { id } = req.params;
        const { status } = req.body;
        
        if (!id) {
            return res.status(400).json({ success: false, error: 'ID is required' });
        }

        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const updated = await updateDocumentStatus({ id, status });
        
        // Auto-create resources if document is approved
        if (status === 'APPROVED' && updated && updated.content) {
            await handleArtifactApproval(updated, db);
        }

        return res.json({ success: true, data: updated });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: 'Failed to update document status' });
    }
});

// PATCH /api/v1/document/chat/:chatId/status
router.patch('/chat/:chatId/status', async (req: AuthenticatedRequest, res) => {
    try {
        const db = DatabaseService.getInstance();
        if (!db.isAvailable()) {
            return res.status(503).json({ success: false, message: '数据库连接不可用' });
        }
        const { chatId } = req.params;
        const { status } = req.body;

        if (!chatId) {
            return res.status(400).json({ success: false, error: 'Chat ID is required' });
        }

        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        // Auto-create resources if documents are approved
        if (status === 'APPROVED') {
            try {
                const docs = await getDocumentsByChatId({ chatId });
                const pendingDocs = docs.filter(d => d.status === 'PENDING' && d.content);
                
                if (pendingDocs.length > 0) {
                    for (const doc of pendingDocs) {
                        await handleArtifactApproval(doc, db);
                    }
                }
            } catch (err) {
                console.error('Failed to process batch approval resource creation', err);
            }
        }

        const result = await batchUpdateDocumentStatusByChatId({ chatId, status });
        return res.json({ success: true, data: result });
    } catch (error: any) {
        return res.status(500).json({ success: false, error: 'Failed to batch update document status' });
    }
});

const postDocumentSchema = z.object({
    content: z.string(),
    title: z.string(),
    kind: z.enum(artifactKinds),
    agentId: z.string().optional(),
    reviewerId: z.string().optional(),
});

// POST /api/v1/document?id=...
router.post('/', async (req: AuthenticatedRequest, res) => {
    try {
        const db = DatabaseService.getInstance();
        if (!db.isAvailable()) {
            return res.status(503).json({ success: false, message: '数据库连接不可用' });
        }
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Parameter id is required' });
        }

        // Handle guest user
        let userId = req.user?.id;
        if (!userId) {
            const guestId = 'guest-user-id';
            const guestEmail = 'guest@example.com';
            await ensureGuestUser(guestId, guestEmail);
            userId = guestId;
        }

        const { content, title, kind, agentId, reviewerId } = postDocumentSchema.parse(req.body);

        const documents = await getDocumentsById({ id });
        if (documents.length > 0) {
            const document = documents[0];
            if (document && document.userId !== userId) {
                return res.status(403).json({ error: 'Unauthorized' });
            }
        }

        const document = await saveDocument({
            id,
            content,
            title,
            kind: kind as any,
            userId,
            agentId,
            status: 'PENDING', // Always start as pending when created via this API for artifacts
        });

        // If reviewerId is provided, create a notification
        if (reviewerId) {
            try {
                await db.createNotification({
                    userId: reviewerId,
                    title: '新文档待审核',
                    content: `您有一个新的 ${kind === 'requirement' ? '项目需求' : '文档'} "${title}" 需要审核。`,
                    type: 'APPROVAL',
                    metadata: {
                        documentId: id,
                        kind: kind,
                        actionUrl: `/ai-assistant?documentId=${id}` // Adjust jump link as needed
                    }
                });
            } catch (notifErr) {
                console.error('Failed to create reviewer notification:', notifErr);
            }
        }

        return res.json(document);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
             return res.status(400).json({ error: error.errors });
        } else {
             return res.status(500).json({ error: 'Failed to save document' });
        }
    }
});

// DELETE /api/v1/document?id=...&timestamp=...
router.delete('/', async (req: AuthenticatedRequest, res) => {
    try {
        const { id, timestamp } = req.query;
        
        if (!id || typeof id !== 'string') {
             return res.status(400).json({ error: 'Parameter id is required' });
        }
        if (!timestamp || typeof timestamp !== 'string') {
             return res.status(400).json({ error: 'Parameter timestamp is required' });
        }

        await deleteDocumentsByIdAfterTimestamp({
            id,
            timestamp: new Date(timestamp),
        });

        return res.json({ success: true });
    } catch (error: any) {
        return res.status(500).json({ error: 'Failed to delete documents' });
    }
});

export default router;
