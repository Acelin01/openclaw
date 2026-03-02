import { prisma } from './index.js';
import type { Transaction } from '@uxin/types';
import { TestCaseService } from './test-case-service.js';
import { DocumentService } from './document-service.js';
import { IterationService } from './iteration-service.js';

// 数据库服务包装器
export class DatabaseService {
  private static instance: DatabaseService;
  public testCaseService: TestCaseService;
  public documentService: DocumentService;
  public iterationService: IterationService;
  
  private constructor() {
    console.log('[DatabaseService] Initializing...');
    try {
      this.testCaseService = new TestCaseService();
      this.documentService = new DocumentService();
      this.iterationService = new IterationService();
      console.log('[DatabaseService] Service sections initialized successfully');
    } catch (error: any) {
      console.error('[DatabaseService] Failed to initialize service sections:', error.message);
      throw error;
    }
  }
  
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      console.log('[DatabaseService] Creating new instance...');
      DatabaseService.instance = new DatabaseService();
    } else {
      console.log('[DatabaseService] Returning existing instance');
    }
    return DatabaseService.instance;
  }

  // 检查数据库是否可用
  isAvailable() {
    const available = prisma !== null;
    console.log(`[DatabaseService] isAvailable: ${available}`);
    return available;
  }

  // 获取用户相关数据
  async getUserById(id: string) {
    if (!prisma) return null;
    const user = await prisma.user.findUnique({ where: { id } });
    return user as any;
  }

  async getUserByEmail(email: string) {
    if (!prisma) return null;
    return prisma.user.findUnique({ where: { email } });
  }

  async getUsers(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    return prisma.user.findMany({ where, ...options });
  }

  async createUser(data: any) {
    if (!prisma) throw new Error('Database not available');
    return prisma.user.create({ data });
  }

  async updateUser(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    return prisma.user.update({ where: { id }, data });
  }

  async updateUserIfExists(id: string, data: any) {
    if (!prisma) return null;
    return prisma.user.updateMany({ where: { id }, data });
  }

  // 获取报价单相关数据
  async getQuotations(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 10, sortBy, sortOrder } = options || {};
    const query: any = { where: { ...where }, skip, take };
    if (sortBy) {
      query.orderBy = { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' };
    }
    if ((query.where as any).search) {
      const search = (query.where as any).search;
      delete (query.where as any).search;
      query.where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }
    return prisma.quotation.findMany(query);
  }

  async getQuotationById(id: string) {
    if (!prisma) return null;
    return prisma.quotation.findUnique({ where: { id } });
  }

  async createQuotation(data: any) {
    if (!prisma) throw new Error('Database not available');
    const mapped: any = {
      userId: data.userId,
      title: data.title,
      description: data.description,
      category: data.category,
      priceType: data.priceType ?? 'FIXED',
      priceAmount: data.priceAmount ?? null,
      priceRangeMin: data.priceRangeMin ?? null,
      priceRangeMax: data.priceRangeMax ?? null,
      deliveryTime: data.deliveryTime ?? null,
      includes: data.includes ?? [],
      excludes: data.excludes ?? [],
      requirements: data.requirements ?? [],
      status: data.status ?? 'ACTIVE',
      aiGenerated: data.aiGenerated ?? false,
      aiConversationId: data.aiConversationId ?? null,
      templateId: data.templateId ?? null,
    };
    return prisma.quotation.create({ data: mapped });
  }

  // 获取询价单相关数据
  async getInquiries(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 10, sortBy, sortOrder } = options || {};
    const query: any = { where: { ...where }, skip, take };
    if (sortBy) {
      query.orderBy = { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' };
    }
    if ((query.where as any).search) {
      const search = (query.where as any).search;
      delete (query.where as any).search;
      query.where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }
    return prisma.inquiry.findMany(query);
  }

  async getInquiriesCount(where: any = {}) {
    if (!prisma) return 0;
    const queryWhere: any = { ...where };
    if ((queryWhere as any).search) {
      const search = (queryWhere as any).search;
      delete (queryWhere as any).search;
      queryWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }
    return prisma.inquiry.count({ where: queryWhere });
  }

  async getInquiryById(id: string) {
    if (!prisma) return null;
    return prisma.inquiry.findUnique({ where: { id } });
  }

  async getProjectById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.project.findUnique({ 
      where: { id },
      include: {
        requirements: true,
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        risks: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        },
        conversations: true,
        schedules: true,
        projectDocuments: true,
        positions: true,
        transactions: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true
              }
            },
            agent: {
              select: {
                id: true,
                name: true,
                identifier: true,
                prompt: true,
                mermaid: true
              }
            }
          }
        },
        milestonesList: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        approvals: true,
        financials: true,
        qna: true,
        financialReports: true,
      }
    });
  }

  async getProjectMembers(projectId: string) {
    if (!prisma) return [];
    const p: any = prisma;
    return p.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true
          }
        },
        agent: {
          select: {
            id: true,
            name: true,
            identifier: true,
            prompt: true,
            mermaid: true
          }
        }
      }
    });
  }

  // 获取项目风险
  async getProjectRisks(projectId: string) {
    if (!prisma) return [];
    return (prisma as any).projectRisk.findMany({
      where: { projectId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getProjectRiskById(id: string) {
    if (!prisma) return null;
    return (prisma as any).projectRisk.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        project: true
      }
    });
  }

  // 获取项目缺陷
  async getProjectDefects(projectId: string) {
    if (!prisma) return [];
    return (prisma as any).projectDefect.findMany({
      where: { projectId },
      include: {
        reporter: {
          select: { id: true, name: true, avatarUrl: true }
        },
        assignee: {
          select: { id: true, name: true, avatarUrl: true }
        },
        iteration: true
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async createProjectDefect(data: any) {
    if (!prisma) throw new Error('Database not available');
    return (prisma as any).projectDefect.create({
      data: {
        projectId: data.projectId,
        iterationId: data.iterationId,
        title: data.title,
        description: data.description,
        status: data.status || 'OPEN',
        severity: data.severity || 'MEDIUM',
        priority: data.priority || 'MEDIUM',
        reporterId: data.reporterId,
        assigneeId: data.assigneeId
      }
    });
  }

  async updateProjectDefect(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    return (prisma as any).projectDefect.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        severity: data.severity,
        priority: data.priority,
        assigneeId: data.assigneeId,
        iterationId: data.iterationId
      }
    });
  }

  async deleteProjectDefect(id: string) {
    if (!prisma) throw new Error('Database not available');
    return (prisma as any).projectDefect.delete({
      where: { id }
    });
  }

  // 获取项目里程碑
  async getProjectMilestones(projectId: string) {
    if (!prisma) return [];
    return (prisma as any).projectMilestone.findMany({
      where: { projectId },
      orderBy: { dueDate: 'asc' }
    });
  }

  // 里程碑管理方法
  async getMilestones(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 50, orderBy = { dueDate: 'asc' } } = options || {};
    const p: any = prisma;
    return p.projectMilestone.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });
  }

  async getMilestoneById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.projectMilestone.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        requirements: true,
        tasks: true
      }
    });
  }

  async getMilestoneById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.projectMilestone.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        requirements: true,
        tasks: true
      }
    });
  }

  async createMilestone(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.projectMilestone.create({
      data: {
        projectId: data.project_id || data.projectId,
        title: data.title,
        description: data.description || '',
        assigneeId: data.assignee_id || data.assigneeId,
        dueDate: data.due_date || data.dueDate ? new Date(data.due_date || data.dueDate) : null,
        status: data.status || 'notstarted'
      }
    });
  }

  async updateMilestone(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.assignee_id || data.assigneeId) updateData.assigneeId = data.assignee_id || data.assigneeId;
    if (data.due_date || data.dueDate) updateData.dueDate = new Date(data.due_date || data.dueDate);
    if (data.status) updateData.status = data.status;
    
    return p.projectMilestone.update({
      where: { id },
      data: updateData
    });
  }

  async deleteMilestone(id: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.projectMilestone.delete({
      where: { id }
    });
  }

  async createProjectMilestone(data: any) {
    if (!prisma) throw new Error('Database not available');
    return (prisma as any).projectMilestone.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status || 'PENDING'
      }
    });
  }

  async updateProjectMilestone(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    return (prisma as any).projectMilestone.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status
      }
    });
  }

  async deleteProjectMilestone(id: string) {
    if (!prisma) throw new Error('Database not available');
    return (prisma as any).projectMilestone.delete({
      where: { id }
    });
  }

  async createProjectRisk(data: any) {
    if (!prisma) throw new Error('Database not available');
    return (prisma as any).projectRisk.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        level: data.level || 'MEDIUM',
        status: data.status || 'OPEN',
        ownerId: data.ownerId,
        probability: data.probability || 'MEDIUM',
        impact: data.impact || 'MEDIUM',
        mitigationPlan: data.mitigationPlan
      }
    });
  }

  async updateProjectRisk(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    return (prisma as any).projectRisk.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        level: data.level,
        status: data.status,
        ownerId: data.ownerId,
        probability: data.probability,
        impact: data.impact,
        mitigationPlan: data.mitigationPlan
      }
    });
  }

  async deleteProjectRisk(id: string) {
    if (!prisma) throw new Error('Database not available');
    return (prisma as any).projectRisk.delete({
      where: { id }
    });
  }

  async updateProject(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    return prisma.project.update({ where: { id }, data });
  }

  async deleteProject(id: string) {
    if (!prisma) throw new Error('Database not available');
    await prisma.project.delete({ where: { id } });
    return { id };
  }

  async getPositionById(id: string) {
    if (!prisma) return null;
    return prisma.position.findUnique({ where: { id } });
  }

  async getResumeById(id: string) {
    if (!prisma) return null;
    return prisma.resume.findUnique({ where: { id } });
  }

  async getTaskById(id: string) {
    if (!prisma) return null;
    return prisma.projectTask.findUnique({ where: { id } });
  }

  // Agent methods
  async getAgents(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    return (prisma as any).agent.findMany({ 
      where, 
      ...options,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        projects: true,
        mcpTools: true
      }
    });
  }

  async getAgentById(id: string) {
    if (!prisma) return null;
    return (prisma as any).agent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        projects: true,
        requirements: true,
        tasks: true,
        chats: true,
        agentDocuments: {
          include: {
            document: true
          }
        },
        mcpTools: true,
        agents_B: true
      }
    });
  }

  async getAgentsByUserId(userId: string) {
    if (!prisma) return [];
    return (prisma as any).agent.findMany({
      where: {
        OR: [
          { userId: userId },
          { userId: 'system' }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });
  }

  async createAgent(data: any) {
    if (!prisma) throw new Error('Database not available');
    const { 
      projectIds, 
      requirementIds, 
      taskIds, 
      chatIds, 
      associatedUserIds,
      documentIds,
      skillIds,
      mcpToolIds,
      ...agentData 
    } = data;

    const createData: any = {
      ...agentData,
      projects: projectIds ? {
        connect: projectIds.map((id: string) => ({ id }))
      } : undefined,
      requirements: requirementIds ? {
        connect: requirementIds.map((id: string) => ({ id }))
      } : undefined,
      tasks: taskIds ? {
        connect: taskIds.map((id: string) => ({ id }))
      } : undefined,
      chats: chatIds ? {
        connect: chatIds.map((id: string) => ({ id }))
      } : undefined,
      associatedUsers: associatedUserIds ? {
        connect: associatedUserIds.map((id: string) => ({ id }))
      } : undefined,
      agents_B: skillIds ? {
        connect: skillIds.map((id: string) => ({ id }))
      } : undefined,
      mcpTools: mcpToolIds ? {
        connect: mcpToolIds.map((id: string) => ({ id }))
      } : undefined,
    };

    return (prisma as any).agent.create({ data: createData });
  }

  async updateAgent(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const { 
      projectIds, 
      requirementIds, 
      taskIds, 
      chatIds, 
      associatedUserIds,
      documentIds,
      skillIds,
      mcpToolIds,
      ...agentData 
    } = data;

    const updateData: any = {
      ...agentData,
      projects: projectIds ? {
        set: projectIds.map((id: string) => ({ id }))
      } : undefined,
      requirements: requirementIds ? {
        set: requirementIds.map((id: string) => ({ id }))
      } : undefined,
      tasks: taskIds ? {
        set: taskIds.map((id: string) => ({ id }))
      } : undefined,
      chats: chatIds ? {
        set: chatIds.map((id: string) => ({ id }))
      } : undefined,
      associatedUsers: associatedUserIds ? {
        set: associatedUserIds.map((id: string) => ({ id }))
      } : undefined,
      agents_B: skillIds ? {
        set: skillIds.map((id: string) => ({ id }))
      } : undefined,
      mcpTools: mcpToolIds ? {
        set: mcpToolIds.map((id: string) => ({ id }))
      } : undefined,
    };

    return (prisma as any).agent.update({ where: { id }, data: updateData });
  }

  async deleteAgent(id: string) {
    if (!prisma) throw new Error('Database not available');
    return (prisma as any).agent.delete({ where: { id } });
  }

  // MCPTool methods
  async getMCPTools(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const p: any = prisma;
    return p.mCPTool.findMany({
      where,
      ...options,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        agents: true,
        mcp_tools_A: true,
        mcp_tools_B: true
      }
    });
  }

  async getMCPToolById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.mCPTool.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        agents: true,
        mcp_tools_A: true,
        mcp_tools_B: true
      }
    });
  }

  async createMCPTool(data: any) {
    if (!prisma) throw new Error('Database not available');
    const { agentIds, relatedToolIds, ...toolData } = data;
    const p: any = prisma;
    return p.mCPTool.create({
      data: {
        ...toolData,
        agents: agentIds ? {
          connect: agentIds.map((id: string) => ({ id }))
        } : undefined,
        mcp_tools_A: relatedToolIds ? {
          connect: relatedToolIds.map((id: string) => ({ id }))
        } : undefined
      }
    });
  }

  async updateMCPTool(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const { agentIds, relatedToolIds, ...toolData } = data;
    const p: any = prisma;
    return p.mCPTool.update({
      where: { id },
      data: {
        ...toolData,
        agents: agentIds ? {
          set: agentIds.map((id: string) => ({ id }))
        } : undefined,
        mcp_tools_A: relatedToolIds ? {
          set: relatedToolIds.map((id: string) => ({ id }))
        } : undefined
      }
    });
  }

  async deleteMCPTool(id: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.mCPTool.delete({ where: { id } });
  }

  // Skill methods
  async getSkills(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const p: any = prisma;
    return p.skill.findMany({
      where,
      ...options,
      include: {
        mcpTool: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async getSkillById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.skill.findUnique({
      where: { id },
      include: {
        mcpTool: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async createSkill(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.skill.create({
      data
    });
  }

  async updateSkill(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.skill.update({
      where: { id },
      data
    });
  }

  async deleteSkill(id: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.skill.delete({ where: { id } });
  }

  // AIApp methods
  async getAIApps(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const p: any = prisma;
    return p.aIApp.findMany({
      where,
      ...options,
      include: {
        AIAppAgents: {
          include: {
            agents: {
              include: {
                mcpTools: true
              }
            }
          }
        },
        mcpTools: true
      }
    });
  }

  async getAIAppById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.aIApp.findUnique({
      where: { id },
      include: {
        AIAppAgents: {
          include: {
            agents: {
              include: {
                mcpTools: true
              }
            }
          }
        },
        mcpTools: true
      }
    });
  }

  async createAIApp(data: any) {
    if (!prisma) throw new Error('Database not available');
    const { agentIds, mcpToolIds, ...appData } = data;
    const p: any = prisma;
    return p.aIApp.create({
      data: {
        ...appData,
        AIAppAgents: agentIds ? {
          create: agentIds.map((id: string) => ({
            agents: { connect: { id } }
          }))
        } : undefined,
        mcpTools: mcpToolIds ? {
          connect: mcpToolIds.map((id: string) => ({ id }))
        } : undefined
      }
    });
  }

  async updateAIApp(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const { agentIds, mcpToolIds, ...appData } = data;
    const p: any = prisma;
    // If agentIds is provided, we need to handle the many-to-many relation manually
    if (agentIds) {
      // First delete existing relations
      await p.aIAppAgents.deleteMany({
        where: { A: id }
      });
      
      // Then create new ones
      if (agentIds.length > 0) {
        await p.aIAppAgents.createMany({
          data: agentIds.map((agentId: string) => ({
            A: id,
            B: agentId
          }))
        });
      }
    }

    return p.aIApp.update({
      where: { id },
      data: {
        ...appData,
        mcpTools: mcpToolIds ? {
          set: mcpToolIds.map((id: string) => ({ id }))
        } : undefined
      }
    });
  }

  async deleteAIApp(id: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.aIApp.delete({ where: { id } });
  }

  async getUserAIApps(userId: string) {
    if (!prisma) return [];
    const p: any = prisma;
    return p.userAIApp.findMany({
      where: { userId },
      include: {
        app: {
          include: {
            AIAppAgents: {
              include: {
                agents: true
              }
            },
            mcpTools: true
          }
        }
      }
    });
  }

  async addUserAIApp(userId: string, appId: string, isDefault: boolean = false) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    
    // 如果设置为默认，先取消其他默认
    if (isDefault) {
      await p.userAIApp.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    // 获取应用关联的智能体
    const app = await p.aIApp.findUnique({
      where: { id: appId },
      include: { 
        AIAppAgents: {
          include: {
            agents: true
          }
        } 
      }
    });

    if (app && app.AIAppAgents && app.AIAppAgents.length > 0) {
      // 将智能体添加到用户联系人
      for (const item of app.AIAppAgents) {
        const agent = item.agents;
        if (!agent) continue;
        await p.userContact.upsert({
          where: { userId_agentId: { userId, agentId: agent.id } },
          update: {},
          create: {
            userId,
            agentId: agent.id,
            groupName: '应用推荐',
            isStarred: isDefault
          }
        });
      }
    }

    return p.userAIApp.upsert({
      where: { userId_appId: { userId, appId } },
      update: { isDefault },
      create: { userId, appId, isDefault }
    });
  }

  async removeUserAIApp(userId: string, appId: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.userAIApp.delete({
      where: { userId_appId: { userId, appId } }
    });
  }

  async setUserDefaultAIApp(userId: string, appId: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    
    await p.userAIApp.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });

    return p.userAIApp.update({
      where: { userId_appId: { userId, appId } },
      data: { isDefault: true }
    });
  }

  async updateInquiry(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const updateData: any = {
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      category: data.category ?? undefined,
      budgetMin: data.budgetMin ?? data.budget ?? undefined,
      budgetMax: data.budgetMax ?? undefined,
      deadline: data.deadline ?? undefined,
      status: data.status ?? undefined,
      deliverables: data.deliverables ?? undefined,
      requirements: data.requirements ?? undefined,
      location: data.location ?? undefined,
    };
    return prisma.inquiry.update({ where: { id }, data: updateData });
  }

  async deleteInquiry(id: string) {
    if (!prisma) throw new Error('Database not available');
    await prisma.inquiry.delete({ where: { id } });
    return { id };
  }

  // 获取报价数量
  async getQuotationsCount(where: any = {}) {
    if (!prisma) return 0;
    const queryWhere: any = { ...where };
    if ((queryWhere as any).search) {
      const search = (queryWhere as any).search;
      delete (queryWhere as any).search;
      queryWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }
    return prisma.quotation.count({ where: queryWhere });
  }

  async createService(data: any) {
    if (!prisma) throw new Error('Database not available');
    
    // If it has workerId, it's a WorkerService (freelancer offer)
    if (data.workerId || data.worker_id) {
      const { worker_id, ...rest } = data;
      return this.createWorkerService({
        ...rest,
        workerId: data.workerId || worker_id
      });
    }
    
    // Otherwise it's a general Quotation
    return this.createQuotation(data);
  }

  // 获取分类列表
  async getQuotationCategories() {
    if (!prisma) return [];
    const categories = await prisma.quotation.findMany({
      select: { category: true },
      distinct: ['category']
    });
    return categories.map((c: any) => c.category);
  }

  async getInquiryCategories() {
    if (!prisma) return [];
    const categories = await prisma.inquiry.findMany({
      select: { category: true },
      distinct: ['category']
    });
    return categories.map((c: any) => c.category);
  }

  async getModules() {
    if (!prisma) return [];
    const p: any = prisma;
    if (p.module) {
      return p.module.findMany({ orderBy: { createdAt: 'desc' } });
    }
    return [];
  }

  async createModule(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    if (p.module) {
      return p.module.create({ data });
    }
    throw new Error('Module model not available');
  }

  async updateModule(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    if (p.module) {
      return p.module.update({ where: { id }, data });
    }
    throw new Error('Module model not available');
  }

  async deleteModule(id: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    if (p.module) {
      await p.module.delete({ where: { id } });
      return { id };
    }
    throw new Error('Module model not available');
  }

  // 增加浏览量 - 由于数据库schema中没有views字段，暂时移除这些功能
  async incrementQuotationViews(id: string) {
    if (!prisma) return null;
    return prisma.quotation.findUnique({
      where: { id }
    });
  }

  async incrementInquiryViews(id: string) {
    if (!prisma) return null;
    return prisma.inquiry.findUnique({
      where: { id }
    });
  }

  // 收藏功能 - 由于数据库schema中没有favorite表，暂时注释掉这些功能
  async addFavoriteQuotation(_userId: string, _quotationId: string) {
    return null;
  }

  async removeFavoriteQuotation(_userId: string, _quotationId: string) {
    return { count: 0 };
  }

  async toggleFavoriteQuotation(_userId: string, _quotationId: string) {
    return { action: 'none' };
  }

  async addFavoriteInquiry(_userId: string, _inquiryId: string) {
    return null;
  }

  async removeFavoriteInquiry(_userId: string, _inquiryId: string) {
    return { count: 0 };
  }

  async toggleFavoriteInquiry(_userId: string, _inquiryId: string) {
    return { action: 'none' };
  }

  async isQuotationFavorite(_userId: string, _quotationId: string) {
    return false;
  }

  async isInquiryFavorite(_userId: string, _inquiryId: string) {
    return false;
  }
  async getFavoriteQuotations(_userId: string) {
    return [];
  }

  async getFavoriteInquiries(_userId: string) {
    return [];
  }

  async createInquiry(data: any) {
    if (!prisma) throw new Error('Database not available');
    const mapped: any = {
      userId: data.userId ?? data.customerId,
      title: data.title,
      description: data.description,
      category: data.category,
      budgetMin: data.budgetMin ?? (typeof data.budget === 'number' ? data.budget : null),
      budgetMax: data.budgetMax ?? null,
      deadline: data.deadline ?? null,
      requirements: data.requirements ?? [],
      deliverables: data.deliverables ?? [],
      location: data.location ?? null,
      status: data.status ?? 'ACTIVE',
    };
    return prisma.inquiry.create({ data: mapped });
  }

  // 获取交易相关数据
  async getTransactions(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    return prisma.transaction.findMany({ where, ...options });
  }

  // 获取AI对话相关数据
  async getAIConversations(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    return prisma.aIConversation.findMany({ where, ...options });
  }

  async getChats(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const p: any = prisma;
    return p.chat.findMany({ where, ...options });
  }

  async createChat(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.chat.create({ data });
  }

  async markMessagesAsRead(chatId: string, userId: string) {
    if (!prisma) return { success: false };
    const p: any = prisma;
    // 同时更新 AI Chat 消息和用户直连消息
    await p.message.updateMany({ 
      where: { 
        OR: [
          { chatId, receiverId: userId, read: false },
          { senderId: chatId, receiverId: userId, read: false }
        ]
      }, 
      data: { read: true, readAt: new Date() } 
    });
    return { success: true };
  }

  async markChatNotificationsAsRead(userId: string, chatId: string) {
    if (!prisma) return { success: false };
    const p: any = prisma;
    await p.notification.updateMany({ where: { userId, type: 'MESSAGE', read: false, content: chatId }, data: { read: true } });
    return { success: true };
  }

  async getAIConversationById(id: string) {
    if (!prisma) return null;
    return prisma.aIConversation.findUnique({ where: { id } });
  }

  async createNotification(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        content: data.content,
        type: data.type || 'SYSTEM',
        metadata: data.metadata || {},
        read: false
      }
    });
  }

  async createAIConversation(data: any) {
    if (!prisma) throw new Error('Database not available');
    return prisma.aIConversation.create({ data });
  }

  async updateAIConversation(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    return prisma.aIConversation.update({ where: { id }, data });
  }

  // 获取消息相关数据
  async getMessages(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    try {
      const results = await prisma.message.findMany({ where, ...options });
      return results;
    } catch (error) {
      console.error('[DatabaseService] getMessages error:', error);
      return [];
    }
  }

  async createMessage(data: any) {
    if (!prisma) throw new Error('Database not available');
    return prisma.message.create({ data });
  }

  async getTasks(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 10, sortBy, sortOrder } = options || {};
    const query: any = { where: { ...where }, skip, take };
    if (sortBy) {
      query.orderBy = { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' };
    }
    const p: any = prisma;
    return p.task.findMany(query);
  }
  async createTask(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    const mapped: any = {
      type: data.type,
      status: data.status || 'PENDING',
      priority: typeof data.priority === 'number' ? data.priority : 0,
      payload: data.payload ?? {},
      result: data.result ?? null,
    };
    return p.task.create({ data: mapped });
  }

  // -------------------------------------------------------------------------
  // 自由职业者相关方法 (Worker/Freelancer)
  // -------------------------------------------------------------------------
  
  async createProject(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    
    // 确保 userId 存在
    const userId = data.user_id || data.userId || data.owner_id || '19e0a8e1-cad9-420d-9d10-5cc5be8fb2f0';
    
    const project = await p.project.create({
      data: {
        user: {
          connect: { id: userId }
        },
        name: data.name,
        description: data.description || '',
        status: data.status || 'active',
        startDate: data.start_date ? new Date(data.start_date) : null,
        endDate: data.end_date ? new Date(data.end_date) : null,
        budget: data.budget || null
      }
    });
    
    // Automatically create a ProjectCollaboration for every new project
    try {
      await p.projectCollaboration.create({
        data: {
          projectId: project.id
        }
      });
    } catch (e) {
      console.warn('Failed to create project collaboration automatically:', e);
    }
    
    return project;
  }

  // Helper to get collaboration ID by project ID
  async getCollaborationIdByProjectId(projectId: string) {
    if (!prisma) return null;
    const p: any = prisma;
    const coll = await p.projectCollaboration.findUnique({
      where: { projectId }
    });
    return coll?.id;
  }

  // ============================================
  // 需求管理方法
  // ============================================
  async getRequirements(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 50, orderBy = { createdAt: 'desc' } } = options || {};
    const p: any = prisma;
    return p.projectRequirement.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        tasks: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async getRequirementById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.projectRequirement.findUnique({
      where: { id },
      include: {
        tasks: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
  }

  async createRequirement(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    
    const { projectId, project_id, assigneeId, assignee_id, ...rest } = data;
    const pid = projectId || project_id;
    const aid = assigneeId || assignee_id;
    
    if (pid) {
      rest.projectId = pid;
      if (!rest.collaborationId) {
        const collaborationId = await this.getCollaborationIdByProjectId(pid);
        if (collaborationId) {
          rest.collaborationId = collaborationId;
        }
      }
    }
    
    if (aid) {
      rest.assigneeId = aid;
    }
    
    return p.projectRequirement.create({ data: rest });
  }

  async updateRequirement(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.projectRequirement.update({
      where: { id },
      data
    });
  }

  async deleteRequirement(id: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.projectRequirement.delete({
      where: { id }
    });
  }

  // ============================================
  // 任务管理方法
  // ============================================
  async getTasks(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 50, orderBy = { createdAt: 'desc' } } = options || {};
    const p: any = prisma;
    return p.projectTask.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        requirement: {
          select: {
            id: true,
            title: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });
  }

  async getTaskById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.projectTask.findUnique({
      where: { id },
      include: {
        project: true,
        requirement: true,
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });
  }

  async createTask(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    
    const { 
      projectId, project_id, 
      assigneeId, assignee_id, 
      estimatedHours, estimated_hours,
      startDate, start_date,
      endDate, end_date,
      dueDate, due_date,
      ...rest 
    } = data;
    
    const pid = projectId || project_id;
    const aid = assigneeId || assignee_id;
    const eh = estimatedHours || estimated_hours;
    const sd = startDate || start_date;
    const ed = endDate || end_date;
    const dd = dueDate || due_date;
    
    const createData: any = { ...rest };
    
    delete createData.project_id;
    delete createData.assignee_id;
    delete createData.estimated_hours;
    delete createData.start_date;
    delete createData.end_date;
    delete createData.due_date;
    
    if (pid) {
      createData.projectId = pid;
      if (!createData.collaborationId) {
        const collaborationId = await this.getCollaborationIdByProjectId(pid);
        if (collaborationId) {
          createData.collaborationId = collaborationId;
        }
      }
    }
    
    if (aid) createData.assigneeId = aid;
    if (eh !== undefined && eh !== null) createData.estimatedHours = Number(eh);
    if (sd) createData.startDate = new Date(sd);
    if (ed) createData.endDate = new Date(ed);
    if (dd) createData.dueDate = new Date(dd);
    
    return p.projectTask.create({ data: createData });
  }

  async updateTask(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    
    const { 
      projectId, project_id, 
      assigneeId, assignee_id, 
      estimatedHours, estimated_hours,
      startDate, start_date,
      endDate, end_date,
      dueDate, due_date,
      ...rest 
    } = data;
    
    const updateData: any = { ...rest };
    
    const pid = projectId || project_id;
    const aid = assigneeId || assignee_id;
    const eh = estimatedHours || estimated_hours;
    const sd = startDate || start_date;
    const ed = endDate || end_date;
    const dd = dueDate || due_date;
    
    delete updateData.project_id;
    delete updateData.assignee_id;
    delete updateData.estimated_hours;
    delete updateData.start_date;
    delete updateData.end_date;
    delete updateData.due_date;
    
    if (pid) updateData.projectId = pid;
    if (aid) updateData.assigneeId = aid;
    if (eh !== undefined && eh !== null) updateData.estimatedHours = Number(eh);
    if (sd) updateData.startDate = new Date(sd);
    if (ed) updateData.endDate = new Date(ed);
    if (dd) updateData.dueDate = new Date(dd);
    
    return p.projectTask.update({
      where: { id },
      data: updateData
    });
  }

  async deleteTask(id: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.projectTask.delete({
      where: { id }
    });
  }

  async updateTaskStatus(id: string, status: string, progress?: number) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    const updateData: any = { status };
    if (progress !== undefined) updateData.progress = progress;
    return p.projectTask.update({
      where: { id },
      data: updateData
    });
  }

  // ============================================
  // 缺陷管理方法
  // ============================================
  async getDefects(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 50, orderBy = { createdAt: 'desc' } } = options || {};
    const p: any = prisma;
    return p.projectDefect.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        iteration: {
          select: {
            id: true,
            title: true
          }
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });
  }

  async getDefectById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.projectDefect.findUnique({
      where: { id },
      include: {
        project: true,
        iteration: true,
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });
  }

  async createDefect(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    
    const { 
      projectId, project_id, 
      iterationId, iteration_id,
      reporterId, reporter_id,
      assigneeId, assignee_id,
      ...rest 
    } = data;
    
    const createData: any = { ...rest };
    
    delete createData.project_id;
    delete createData.iteration_id;
    delete createData.reporter_id;
    delete createData.assignee_id;
    
    if (projectId || project_id) createData.projectId = projectId || project_id;
    if (iterationId || iteration_id) createData.iterationId = iterationId || iteration_id;
    if (reporterId || reporter_id) createData.reporterId = reporterId || reporter_id;
    if (assigneeId || assignee_id) createData.assigneeId = assigneeId || assignee_id;
    
    return p.projectDefect.create({ data: createData });
  }

  async updateDefect(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.projectDefect.update({
      where: { id },
      data
    });
  }

  async deleteDefect(id: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.projectDefect.delete({
      where: { id }
    });
  }

  // Project Requirements
  async getProjectRequirements(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 50 } = options || {};
    const p: any = prisma;
    return p.projectRequirement.findMany({
      where,
      skip,
      take,
      include: { tasks: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createProjectRequirement(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    
    const { projectId, project_id, assigneeId, assignee_id, ...rest } = data;
    const pid = projectId || project_id;
    const aid = assigneeId || assignee_id;
    
    if (pid) {
      rest.projectId = pid;
      if (!rest.collaborationId) {
        const collaborationId = await this.getCollaborationIdByProjectId(pid);
        if (collaborationId) {
          rest.collaborationId = collaborationId;
        }
      }
    }
    
    if (aid) {
      rest.assigneeId = aid;
    }
    
    return p.projectRequirement.create({ data: rest });
  }

  async updateProjectRequirement(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.projectRequirement.update({ where: { id }, data });
  }

  // Project Tasks
  async getProjectTasks(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 50 } = options || {};
    const p: any = prisma;
    return p.projectTask.findMany({
      where,
      skip,
      take,
      include: { project: true, requirement: true, assignee: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getProjectTasksCount(where: any = {}) {
    if (!prisma) return 0;
    const p: any = prisma;
    return p.projectTask.count({ where });
  }

  async getProjectTaskById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.projectTask.findUnique({
      where: { id },
      include: { project: true, requirement: true, assignee: true }
    });
  }

  async createProjectTask(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    
    // Explicitly extract and ignore snake_case fields to prevent Prisma errors
    const { 
      projectId, project_id, 
      assigneeId, assignee_id, 
      estimatedHours, estimated_hours,
      startDate, start_date,
      endDate, end_date,
      dueDate, due_date,
      ...rest 
    } = data;
    
    const pid = projectId || project_id;
    const aid = assigneeId || assignee_id;
    const eh = estimatedHours || estimated_hours;
    const sd = startDate || start_date;
    const ed = endDate || end_date;
    const dd = dueDate || due_date;
    
    const createData: any = { ...rest };
    
    // Ensure snake_case fields are NOT in createData
    delete createData.project_id;
    delete createData.assignee_id;
    delete createData.estimated_hours;
    delete createData.start_date;
    delete createData.end_date;
    delete createData.due_date;
    
    if (pid) {
      createData.projectId = pid;
      if (!createData.collaborationId) {
        const collaborationId = await this.getCollaborationIdByProjectId(pid);
        if (collaborationId) {
          createData.collaborationId = collaborationId;
        }
      }
    }
    
    if (aid) createData.assigneeId = aid;
    if (eh !== undefined && eh !== null) createData.estimatedHours = Number(eh);
    if (sd) createData.startDate = new Date(sd);
    if (ed) createData.endDate = new Date(ed);
    if (dd) createData.dueDate = new Date(dd);
    
    return p.projectTask.create({ data: createData });
  }

  async updateProjectTask(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    
    const { 
      projectId, project_id, 
      assigneeId, assignee_id, 
      estimatedHours, estimated_hours,
      startDate, start_date,
      endDate, end_date,
      dueDate, due_date,
      ...rest 
    } = data;
    
    const updateData: any = { ...rest };
    
    const pid = projectId || project_id;
    const aid = assigneeId || assignee_id;
    const eh = estimatedHours || estimated_hours;
    const sd = startDate || start_date;
    const ed = endDate || end_date;
    const dd = dueDate || due_date;
    
    // Ensure snake_case fields are NOT in updateData
    delete updateData.project_id;
    delete updateData.assignee_id;
    delete updateData.estimated_hours;
    delete updateData.start_date;
    delete updateData.end_date;
    delete updateData.due_date;
    
    if (pid) updateData.projectId = pid;
    if (aid) updateData.assigneeId = aid;
    if (eh !== undefined && eh !== null) updateData.estimatedHours = Number(eh);
    if (sd) updateData.startDate = new Date(sd);
    if (ed) updateData.endDate = new Date(ed);
    if (dd) updateData.dueDate = new Date(dd);
    
    return p.projectTask.update({ where: { id }, data: updateData });
  }

  async createResume(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.resume.create({ data });
  }

  async createPosition(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.position.create({ data });
  }

  async upsertWorkerProfile(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    const { userId, ...profileData } = data;
    return p.workerProfile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: profileData
    });
  }

  async getWorkerProfileByUserId(userId: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.workerProfile.findUnique({
      where: { userId }
    });
  }

  async createWorkerService(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.workerService.create({ data });
  }

  async createContract(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    const title = data.title ?? data.name ?? '合同';
    const rawContent = data.content ?? data.terms ?? null;
    const content = typeof rawContent === 'string' || rawContent === null ? rawContent : JSON.stringify(rawContent);
    return p.document.create({
      data: {
        title,
        content,
        userId: data.userId ?? data.user_id,
        kind: 'contract',
        chatId: data.chatId ?? data.chat_id,
        projectId: data.projectId ?? data.project_id,
        serviceId: data.serviceId ?? data.service_id,
        agentId: data.agentId ?? data.agent_id,
        messageId: data.messageId ?? data.message_id,
        createdAt: new Date(),
      }
    });
  }

  async createMatching(data: any) {
    if (!prisma) throw new Error('Database not available');
    return this.createTask({
      type: 'PROJECT_RESUME_MATCHING',
      payload: data,
      status: 'COMPLETED'
    });
  }

  // 项目管理方法
  async getProjects(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 50, sortBy, sortOrder } = options || {};
    const queryWhere: any = { ...where };
    if (queryWhere.search) {
      const search = queryWhere.search;
      delete queryWhere.search;
      queryWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    const query: any = { 
      where: queryWhere, 
      skip, 
      take,
      include: {
        risks: true,
        conversations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: true
              }
            },
            agent: {
              select: {
                id: true,
                name: true,
                identifier: true,
                prompt: true,
                mermaid: true
              }
            }
          }
        }
      }
    };
    if (sortBy) query.orderBy = { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' };
    const p: any = prisma;
    return p.project.findMany(query);
  }

  async getProjectById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.project.findUnique({
      where: { id },
      include: {
        risks: true,
        tasks: true,
        requirements: true,
        milestonesList: true,
        defects: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });
  }

  async createProject(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    
    // 确保 userId 存在
    const userId = data.user_id || data.userId || data.owner_id || '19e0a8e1-cad9-420d-9d10-5cc5be8fb2f0';
    
    const project = await p.project.create({
      data: {
        user: {
          connect: { id: userId }
        },
        name: data.name,
        description: data.description || '',
        status: data.status || 'active',
        startDate: data.start_date ? new Date(data.start_date) : null,
        endDate: data.end_date ? new Date(data.end_date) : null,
        budget: data.budget || null
      }
    });
    
    // Automatically create a ProjectCollaboration for every new project
    try {
      await p.projectCollaboration.create({
        data: {
          projectId: project.id
        }
      });
    } catch (e) {
      console.warn('Failed to create project collaboration automatically:', e);
    }
    
    return project;
  }

  async updateProject(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.start_date) updateData.startDate = new Date(data.start_date);
    if (data.end_date) updateData.endDate = new Date(data.end_date);
    if (data.budget !== undefined) updateData.budget = data.budget;
    
    return p.project.update({
      where: { id },
      data: updateData
    });
  }

  async deleteProject(id: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.project.delete({
      where: { id }
    });
  }

  async getProjectOverview(projectId: string) {
    if (!prisma) return null;
    const p: any = prisma;
    const project = await p.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true
          }
        },
        requirements: {
          select: {
            id: true,
            status: true,
            priority: true
          }
        },
        milestonesList: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true
          }
        },
        risks: {
          select: {
            id: true,
            title: true,
            level: true,
            status: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });
    
    if (!project) return null;
    
    // 计算统计信息
    const stats = {
      totalTasks: project.tasks.length,
      completedTasks: project.tasks.filter((t: any) => t.status === 'DONE').length,
      totalRequirements: project.requirements.length,
      approvedRequirements: project.requirements.filter((r: any) => r.status === 'APPROVED').length,
      totalMilestones: project.milestonesList.length,
      completedMilestones: project.milestonesList.filter((m: any) => m.status === 'completed').length,
      totalRisks: project.risks.length,
      highRisks: project.risks.filter((r: any) => r.level === 'HIGH').length,
      totalMembers: project.members.length
    };
    
    return {
      project,
      stats
    };
  }

  async getProjectsCount(where: any = {}) {
    if (!prisma) return 0;
    const queryWhere: any = { ...where };
    if (queryWhere.search) {
      const search = queryWhere.search;
      delete queryWhere.search;
      queryWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    const p: any = prisma;
    return p.project.count({ where: queryWhere });
  }

  async getPositions(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 10, sortBy, sortOrder } = options || {};
    const queryWhere: any = { ...where };
    if (queryWhere.search) {
      const search = queryWhere.search;
      delete queryWhere.search;
      queryWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    const query: any = { where: queryWhere, skip, take };
    if (sortBy) query.orderBy = { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' };
    const p: any = prisma;
    return p.position.findMany(query);
  }

  async getPositionsCount(where: any = {}) {
    if (!prisma) return 0;
    const queryWhere: any = { ...where };
    if (queryWhere.search) {
      const search = queryWhere.search;
      delete queryWhere.search;
      queryWhere.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    const p: any = prisma;
    return p.position.count({ where: queryWhere });
  }

  async getResumes(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 10, sortBy, sortOrder } = options || {};
    const queryWhere: any = { ...where };
    if (queryWhere.search) {
      const search = queryWhere.search;
      delete queryWhere.search;
      queryWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } }
      ];
    }
    const query: any = { where: queryWhere, skip, take };
    if (sortBy) query.orderBy = { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' };
    const p: any = prisma;
    return p.resume.findMany(query);
  }

  async getResumesCount(where: any = {}) {
    if (!prisma) return 0;
    const queryWhere: any = { ...where };
    if (queryWhere.search) {
      const search = queryWhere.search;
      delete queryWhere.search;
      queryWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } }
      ];
    }
    const p: any = prisma;
    return p.resume.count({ where: queryWhere });
  }

  async getNotifications(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    return prisma.notification.findMany({ where, ...options });
  }

  async getUnreadNotificationCount(userId: string) {
    if (!prisma) return 0;
    return prisma.notification.count({ where: { userId, read: false } });
  }

  async getNotificationById(id: string) {
    if (!prisma) return null;
    return prisma.notification.findUnique({ where: { id } });
  }

  async markNotificationAsRead(id: string) {
    if (!prisma) return null;
    return prisma.notification.update({ where: { id }, data: { read: true } });
  }

  async markAllNotificationsAsRead(userId: string) {
    if (!prisma) return { count: 0 };
    return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
  }

  async getReviews(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const query: any = { where: { ...where }, ...options };
    return (prisma as any).review.findMany(query);
  }

  async getReviewsCount(where: any = {}) {
    if (!prisma) return 0;
    return (prisma as any).review.count({ where });
  }

  // 报价单更新和删除
  async updateQuotation(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    return prisma.quotation.update({ where: { id }, data });
  }

  async deleteQuotation(id: string) {
    if (!prisma) throw new Error('Database not available');
    return prisma.quotation.delete({ where: { id } });
  }

  // 询价响应
  async createInquiryResponse(_data: any) {
    if (!prisma) throw new Error('Database not available');
    // TODO: 如果需要询价响应功能，需要在Prisma schema中添加inquiryResponse表
    // 暂时返回错误或在现有表中寻找映射
    throw new Error('InquiryResponse table not implemented in database');
  }

  // 交易相关
  async getTransactionsCount(where: any = {}) {
    if (!prisma) return 0;
    return prisma.transaction.count({ where });
  }

  async getTemplates(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 10, orderBy } = options || {};
    const query: any = { where: { ...where }, skip, take };
    if (orderBy) query.orderBy = orderBy;
    const p: any = prisma;
    return p.template.findMany(query);
  }

  async getTemplatesCount(where: any = {}) {
    if (!prisma) return 0;
    const p: any = prisma;
    return p.template.count({ where });
  }

  async getTemplateById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.template.findUnique({ where: { id } });
  }

  async createTemplate(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.template.create({ data });
  }

  async updateTemplate(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.template.update({ where: { id }, data });
  }

  async deleteTemplate(id: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    await p.template.delete({ where: { id } });
    return { id };
  }

  async incrementTemplateUsage(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.template.update({ where: { id }, data: { usageCount: { increment: 1 } } });
  }

  async createShareLink(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    const token = `share-${Date.now()}`;
    const url = `${process.env['FRONTEND_URL']?.split(',')[0] || 'http://localhost:3000'}/share/${token}`;
    return p.shareLink.create({ data: { ...data, token, url } });
  }

  async getShareLinkByToken(token: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.shareLink.findUnique({ where: { token } });
  }

  private mapPrismaStatusToTransactionStatus(prismaStatus: string): Transaction['status'] {
    const statusMap: Record<string, Transaction['status']> = {
      'PENDING': 'pending',
      'CONFIRMED': 'confirmed',
      'IN_PROGRESS': 'in_progress',
      'COMPLETED': 'completed',
      'DISPUTED': 'disputed',
      'REFUNDED': 'refunded',
      'CANCELLED': 'disputed'
    };
    return statusMap[prismaStatus] || 'pending';
  }

  private mapSharedStatusToPrismaStatus(sharedStatus?: Transaction['status']): any {
    if (!sharedStatus) return 'PENDING';
    const statusMap: Record<Transaction['status'], string> = {
      'pending': 'PENDING',
      'confirmed': 'CONFIRMED',
      'in_progress': 'IN_PROGRESS',
      'completed': 'COMPLETED',
      'disputed': 'DISPUTED',
      'refunded': 'REFUNDED'
    };
    return statusMap[sharedStatus] || 'PENDING';
  }

  private mapSharedPaymentStatusToPrismaStatus(sharedPaymentStatus?: Transaction['paymentStatus']): any {
    if (!sharedPaymentStatus) return 'PENDING';
    const paymentStatusMap: Record<Transaction['paymentStatus'], string> = {
      'pending': 'PENDING',
      'completed': 'PAID',
      'failed': 'FAILED',
      'refunded': 'REFUNDED'
    };
    return paymentStatusMap[sharedPaymentStatus] || 'PENDING';
  }

  private mapPrismaPaymentStatusToPaymentStatus(prismaPaymentStatus: string): Transaction['paymentStatus'] {
    const paymentStatusMap: Record<string, Transaction['paymentStatus']> = {
      'PENDING': 'pending',
      'PAID': 'completed',
      'FAILED': 'failed',
      'REFUNDED': 'refunded',
      'PARTIAL': 'pending'
    };
    return paymentStatusMap[prismaPaymentStatus] || 'pending' as Transaction['paymentStatus'];
  }

  private mapPrismaTransactionToTransaction(prismaTransaction: any): Transaction {
    return {
      id: prismaTransaction.id,
      inquiryId: prismaTransaction.inquiryId || '',
      quotationId: prismaTransaction.quotationId || '',
      customerId: prismaTransaction.customerId,
      providerId: prismaTransaction.providerId,
      amount: prismaTransaction.amount,
      currency: prismaTransaction.currency,
      status: this.mapPrismaStatusToTransactionStatus(prismaTransaction.status),
      paymentMethod: prismaTransaction.paymentMethod,
      paymentStatus: this.mapPrismaPaymentStatusToPaymentStatus(prismaTransaction.paymentStatus),
      contractData: prismaTransaction.contractData,
      milestones: prismaTransaction.milestones,
      startedAt: prismaTransaction.startedAt,
      completedAt: prismaTransaction.completedAt,
      createdAt: prismaTransaction.createdAt,
      updatedAt: prismaTransaction.updatedAt,
    };
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    if (!prisma) return null;
    const prismaTransaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        inquiry: true,
        quotation: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });
    
    return prismaTransaction ? this.mapPrismaTransactionToTransaction(prismaTransaction) : null;
  }

  async createTransaction(data: {
    inquiryId?: string;
    quotationId?: string;
    customerId: string;
    providerId: string;
    amount: number;
    currency?: string;
    contractData?: any;
    milestones?: any[];
    status?: Transaction['status'];
    paymentStatus?: Transaction['paymentStatus'];
    [key: string]: any; // Allow for extra fields like userId that might be in the document content
  }): Promise<Transaction> {
    if (!prisma) throw new Error('Database not available');
    
    // Remove extra fields that are not in the Prisma Transaction model
    const { userId, ...prismaData } = data;
    
    const prismaTransaction = await prisma.transaction.create({
      data: {
        ...prismaData,
        status: this.mapSharedStatusToPrismaStatus(data.status),
        paymentStatus: this.mapSharedPaymentStatusToPrismaStatus(data.paymentStatus)
      },
      include: {
        inquiry: true,
        quotation: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });
    return this.mapPrismaTransactionToTransaction(prismaTransaction);
  }

  async updateTransaction(id: string, data: {
    status?: Transaction['status'];
    paymentStatus?: Transaction['paymentStatus'];
    milestones?: any[];
    contractData?: any;
    startedAt?: Date;
    completedAt?: Date;
  }): Promise<Transaction> {
    if (!prisma) throw new Error('Database not available');
    const prismaTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        status: data.status ? this.mapSharedStatusToPrismaStatus(data.status) : undefined,
        paymentStatus: data.paymentStatus ? this.mapSharedPaymentStatusToPrismaStatus(data.paymentStatus) : undefined
      },
      include: {
        inquiry: true,
        quotation: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });
    return this.mapPrismaTransactionToTransaction(prismaTransaction);
  }

  // Analytics methods
  async createUserActivity(data: {
    userId: string;
    activityType: string;
    metadata?: string | null;
    createdAt: string;
  }): Promise<void> {
    // Analytics table not implemented in schema yet, but we'll fail fast if no prisma
    if (!prisma) throw new Error('Database not available');
    console.log('Creating user activity:', data);
  }

  async getUserActivities(filters: {
    userId?: string;
    activityType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}): Promise<any[]> {
    if (!prisma) return [];
    console.log('Getting user activities:', filters);
    return [];
  }

  // 会话追踪
  async createUserSession(data: {
    userId?: string;
    sessionId: string;
    startedAt?: Date;
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    browser?: string;
    os?: string;
    language?: string;
    referrer?: string;
  }): Promise<any> {
    if (!prisma) throw new Error('Database not available');
    return prisma.userSession.create({
      data: {
        userId: data.userId,
        sessionId: data.sessionId,
        startedAt: data.startedAt || new Date(),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        device: data.device,
        browser: data.browser,
        os: data.os,
        language: data.language,
        referrer: data.referrer,
      },
    });
  }

  async endUserSession(sessionId: string): Promise<any> {
    if (!prisma) throw new Error('Database not available');
    const existing = await prisma.userSession.findFirst({ where: { sessionId } });
    if (!existing) return null;
    const endedAt = new Date();
    const durationMs = existing.startedAt ? endedAt.getTime() - new Date(existing.startedAt).getTime() : null;
    return prisma.userSession.update({
      where: { id: existing.id },
      data: { endedAt, durationMs },
    });
  }

  async getUserSessions(filters: { userId?: string; sessionId?: string; dateFrom?: Date; dateTo?: Date; limit?: number } = {}): Promise<any[]> {
    if (!prisma) return [];
    return prisma.userSession.findMany({
      where: {
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.sessionId && { sessionId: filters.sessionId }),
        ...(filters.dateFrom && filters.dateTo
          ? { startedAt: { gte: filters.dateFrom, lte: filters.dateTo } }
          : filters.dateFrom
          ? { startedAt: { gte: filters.dateFrom } }
          : filters.dateTo
          ? { startedAt: { lte: filters.dateTo } }
          : {}),
      },
      orderBy: { startedAt: 'desc' },
      take: filters.limit || 100,
    });
  }

  // 用户行为事件
  async createUserEvent(data: { userId?: string; sessionId?: string; eventType: string; properties?: any; timestamp?: Date }): Promise<any> {
    if (!prisma) throw new Error('Database not available');
    return prisma.userEvent.create({
      data: {
        userId: data.userId,
        sessionId: data.sessionId,
        eventType: data.eventType.toUpperCase() as any,
        properties: data.properties,
        timestamp: data.timestamp || new Date(),
      },
    });
  }

  async getUserEvents(filters: { userId?: string; sessionId?: string; eventType?: string; dateFrom?: Date; dateTo?: Date; limit?: number } = {}): Promise<any[]> {
    if (!prisma) return [];
    return prisma.userEvent.findMany({
      where: {
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.sessionId && { sessionId: filters.sessionId }),
        ...(filters.eventType && { eventType: filters.eventType.toUpperCase() as any }),
        ...(filters.dateFrom || filters.dateTo
          ? { timestamp: { gte: filters.dateFrom, lte: filters.dateTo } }
          : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: filters.limit || 200,
    });
  }

  // 消息交互指标
  async createInteractionMetric(data: {
    userId?: string;
    sessionId?: string;
    conversationId?: string;
    messageId?: string;
    role: string;
    inputTokens?: number;
    outputTokens?: number;
    latencyMs?: number;
    sentimentScore?: number;
    intent?: string;
    success?: boolean;
  }): Promise<any> {
    if (!prisma) throw new Error('Database not available');
    return prisma.chatInteractionMetrics.create({
      data: {
        userId: data.userId,
        sessionId: data.sessionId,
        conversationId: data.conversationId,
        messageId: data.messageId,
        role: data.role.toUpperCase() as any,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        latencyMs: data.latencyMs,
        sentimentScore: data.sentimentScore,
        intent: data.intent,
        success: data.success ?? true,
      },
    });
  }

  async getInteractionMetrics(filters: { userId?: string; sessionId?: string; conversationId?: string; dateFrom?: Date; dateTo?: Date; limit?: number } = {}): Promise<any[]> {
    if (!prisma) return [];
    return prisma.chatInteractionMetrics.findMany({
      where: {
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.sessionId && { sessionId: filters.sessionId }),
        ...(filters.conversationId && { conversationId: filters.conversationId }),
        ...(filters.dateFrom && filters.dateTo
          ? { createdAt: { gte: filters.dateFrom, lte: filters.dateTo } }
          : filters.dateFrom
          ? { createdAt: { gte: filters.dateFrom } }
          : filters.dateTo
          ? { createdAt: { lte: filters.dateTo } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 200,
    });
  }

  // 业务指标
  async upsertBusinessMetric(data: { metricKey: string; period: string; value: number; dimension?: string; date: Date }): Promise<any> {
    if (!prisma) throw new Error('Database not available');
    const existing = await prisma.businessMetric.findFirst({
      where: { metricKey: data.metricKey, date: data.date },
    });
    if (existing) {
      return prisma.businessMetric.update({
        where: { id: existing.id },
        data: { value: data.value, dimension: data.dimension, period: data.period.toUpperCase() as any },
      });
    }
    return prisma.businessMetric.create({
      data: { ...data, period: data.period.toUpperCase() as any },
    });
  }

  async getBusinessMetrics(filters: { metricKey?: string; period?: string; dateFrom?: Date; dateTo?: Date; dimension?: string } = {}): Promise<any[]> {
    if (!prisma) return [];
    return prisma.businessMetric.findMany({
      where: {
        ...(filters.metricKey && { metricKey: filters.metricKey }),
        ...(filters.period && { period: filters.period.toUpperCase() as any }),
        ...(filters.dimension && { dimension: filters.dimension }),
        ...(filters.dateFrom || filters.dateTo
          ? { date: { gte: filters.dateFrom, lte: filters.dateTo } }
          : {}),
      },
      orderBy: { date: 'asc' },
    });
  }

  async getConversationMessages(userId: string, contactId: string) {
    if (!prisma) return [];
    const p: any = prisma;
    return p.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: contactId },
          { senderId: contactId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async sendUserMessage(senderId: string, receiverId: string, content: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    
    // 验证用户是否存在，避免外键约束错误
    const [senderExists, receiverExists] = await Promise.all([
      p.user.findUnique({ where: { id: senderId } }),
      p.user.findUnique({ where: { id: receiverId } })
    ]);

    if (!senderExists || !receiverExists) {
      throw new Error('Sender or Receiver not found in DB');
    }

    return p.message.create({
      data: {
        senderId,
        receiverId,
        content,
        senderType: 'USER',
        messageType: 'CHAT',
        read: false
      }
    });
  }

  async sendApplicationMessage(userId: string, content: string, metadata: any = {}) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.message.create({
      data: {
        receiverId: userId,
        content,
        senderType: 'AI',
        messageType: 'APPLICATION',
        metadata,
        read: false
      }
    });
  }

  // User Personal Tasks
  async getUserTasks(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 50 } = options || {};
    const p: any = prisma;
    return p.userTask.findMany({
      where,
      skip,
      take,
      include: { schedule: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getUserTaskById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.userTask.findUnique({
      where: { id },
      include: { schedule: true }
    });
  }

  async createUserTask(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.userTask.create({ data });
  }

  async updateUserTask(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.userTask.update({ where: { id }, data });
  }

  async deleteUserTask(id: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    await p.userTask.delete({ where: { id } });
    return { id };
  }

  // Schedules
  async getSchedules(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 100 } = options || {};
    const p: any = prisma;
    return p.schedule.findMany({
      where,
      skip,
      take,
      include: { task: true },
      orderBy: { startTime: 'asc' }
    });
  }

  async getScheduleById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.schedule.findUnique({
      where: { id },
      include: { task: true }
    });
  }

  async createSchedule(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.schedule.create({ data });
  }

  async updateSchedule(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.schedule.update({ where: { id }, data });
  }

  async deleteSchedule(id: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    await p.schedule.delete({ where: { id } });
    return { id };
  }

  // Finance & Salary
  async getWallet(userId: string) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    let wallet = await p.wallet.findUnique({
      where: { userId },
      include: { transactions: { take: 5, orderBy: { createdAt: 'desc' } } }
    });

    // If wallet doesn't exist, create one automatically for the user
    if (!wallet) {
      wallet = await p.wallet.create({
        data: {
          userId,
          balance: 0,
          currency: 'CNY'
        },
        include: { transactions: true }
      });
    }
    return wallet;
  }

  async getWalletTransactions(walletId: string, options: any = {}) {
    if (!prisma) return [];
    const p: any = prisma;
    const { skip = 0, take = 20, type } = options;
    const where: any = { walletId };
    if (type) where.type = type;
    
    return p.walletTransaction.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });
  }

  async getInvoices(userId: string, options: any = {}) {
    if (!prisma) return [];
    const p: any = prisma;
    const { skip = 0, take = 20, status } = options;
    const where: any = { userId };
    if (status) where.status = status;

    return p.invoice.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTaxRecords(userId: string, options: any = {}) {
    if (!prisma) return [];
    const p: any = prisma;
    const { skip = 0, take = 20, year } = options;
    const where: any = { userId };
    if (year) where.taxYear = year;

    return p.taxRecord.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });
  }

  async createInvoice(data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.invoice.create({ data });
  }

  async updateInvoice(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    const p: any = prisma;
    return p.invoice.update({ where: { id }, data });
  }

  // Recruitment Operations
  async getRecruitmentApplications(where: any = {}, options: any = {}) {
    if (!prisma) return [];
    const { skip = 0, take = 10 } = options;
    return prisma.recruitmentApplication.findMany({
      where,
      skip,
      take,
      include: {
        position: true,
        resume: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        interviews: true
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async getRecruitmentApplicationsCount(where: any = {}) {
    if (!prisma) return 0;
    return prisma.recruitmentApplication.count({ where });
  }

  async createRecruitmentApplication(data: any) {
    if (!prisma) throw new Error('Database not available');
    return prisma.recruitmentApplication.create({ data });
  }

  async updateRecruitmentApplication(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    return prisma.recruitmentApplication.update({
      where: { id },
      data
    });
  }

  async getTalentMatches(positionId: string) {
    if (!prisma) return [];
    return prisma.talentMatch.findMany({
      where: { positionId },
      orderBy: { score: 'desc' }
    });
  }

  async getInterviews(where: any = {}) {
    if (!prisma) return [];
    return prisma.interview.findMany({
      where,
      include: {
        application: {
          include: {
            position: true
          }
        },
        interviewer: true,
        candidate: true,
        evaluation: true
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async createInterview(data: any) {
    if (!prisma) throw new Error('Database not available');
    return prisma.interview.create({ data });
  }

  async updateInterview(id: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    return prisma.interview.update({
      where: { id },
      data
    });
  }

  async createInterviewEvaluation(data: any) {
    if (!prisma) throw new Error('Database not available');
    return prisma.interviewEvaluation.create({ data });
  }

  async getAddresses(userId: string) {
    if (!prisma) return [];
    return prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });
  }

  async upsertAddress(userId: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    if (data.id) {
      return prisma.address.update({
        where: { id: data.id },
        data
      });
    }
    return prisma.address.create({
      data: {
        ...data,
        userId
      }
    });
  }

  async getRecruitmentSettings(userId: string) {
    if (!prisma) return null;
    return prisma.recruitmentSetting.findUnique({
      where: { userId }
    });
  }

  async upsertRecruitmentSettings(userId: string, data: any) {
    if (!prisma) throw new Error('Database not available');
    return prisma.recruitmentSetting.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data
      }
    });
  }

  // 迭代管理
  async createIteration(data: any) {
    if (!prisma) throw new Error('Database not available');
    return (prisma as any).iteration.create({ data });
  }

  async updateIteration(id: string, data: any, userId?: string) {
    if (!prisma) throw new Error('Database not available');
    
    const oldIteration = userId ? await (prisma as any).iteration.findUnique({ where: { id } }) : null;
    const iteration = await (prisma as any).iteration.update({ where: { id }, data });

    if (userId && oldIteration) {
      let changeDesc = '';
      if (data.status && data.status !== oldIteration.status) {
        changeDesc += `将状态从 ${oldIteration.status} 修改为 ${data.status}。`;
      }
      if (data.name && data.name !== oldIteration.name) {
        changeDesc += `将名称从 ${oldIteration.name} 修改为 ${data.name}。`;
      }
      
      if (changeDesc) {
        await this.logIterationActivity(id, userId, 'UPDATE_ITERATION', changeDesc);
      }
    }

    return iteration;
  }

  async deleteIteration(id: string) {
    if (!prisma) throw new Error('Database not available');
    return (prisma as any).iteration.delete({ where: { id } });
  }

  async getIterationById(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    return p.iteration.findUnique({
      where: { id },
      include: {
        requirements: true,
        defects: true,
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatarUrl: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });
  }

  async getIterationsByProjectId(projectId: string) {
    if (!prisma) return [];
    return (prisma as any).iteration.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            requirements: true,
            tasks: true
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });
  }

  async getIterationWorkItems(id: string) {
    if (!prisma) return null;
    const p: any = prisma;
    const iteration = await p.iteration.findUnique({
      where: { id },
      include: {
        requirements: {
          include: {
            tasks: true
          }
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        defects: {
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            },
            assignee: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });

    if (!iteration) return null;
    const it: any = iteration;

    return {
      requirements: it.requirements,
      tasks: it.tasks,
      defects: it.defects
    };
  }

  async updateIterationWorkItemsStatus(iterationId: string, itemIds: string[], status: string, userId?: string) {
    if (!prisma) throw new Error('Database not available');
    
    // Use transaction to update both requirements and tasks
    const p: any = prisma;
    const result = await p.$transaction(async (tx: any) => {
      const requirements = await tx.projectRequirement.updateMany({
        where: {
          id: { in: itemIds },
          iterationId
        },
        data: { status }
      });

      const tasks = await tx.projectTask.updateMany({
        where: {
          id: { in: itemIds },
          iterationId
        },
        data: { status }
      });
      
      // Also update defects if available
      let defectsCount = 0;
      if (tx.projectDefect) {
        const defects = await tx.projectDefect.updateMany({
          where: {
            id: { in: itemIds },
            iterationId
          },
          data: { status }
        });
        defectsCount = defects.count;
      }

      return {
        requirements: requirements.count,
        tasks: tasks.count,
        defects: defectsCount
      };
    });

    if (userId) {
      await this.logIterationActivity(
        iterationId,
        userId,
        'UPDATE_STATUS',
        `更新了 ${itemIds.length} 个工作项的状态为 ${status}`
      );
    }

    return result;
  }

  async assignWorkItemToIteration(iterationId: string, itemId: string, type: string, userId?: string) {
    if (!prisma) throw new Error('Database not available');
    
    // Normalize type
    const normalizedType = type.toLowerCase();
    let result;
    let itemTitle = itemId;
    
    if (normalizedType.includes('requirement')) {
      result = await prisma.projectRequirement.update({
        where: { id: itemId },
        data: { iterationId }
      });
      itemTitle = result.title;
    } else if (normalizedType.includes('task')) {
      result = await prisma.projectTask.update({
        where: { id: itemId },
        data: { iterationId }
      });
      itemTitle = result.title;
    } else if (normalizedType.includes('defect') || normalizedType.includes('bug')) {
      const p: any = prisma;
      if (p.projectDefect) {
        result = await p.projectDefect.update({
          where: { id: itemId },
          data: { iterationId }
        });
        itemTitle = result.title;
      }
    }
    
    if (!result) throw new Error(`Unknown work item type: ${type}`);

    if (userId) {
      await this.logIterationActivity(
        iterationId,
        userId,
        'ASSIGN_ITEM',
        `添加了工作项: ${itemTitle}`
      );
    }

    return result;
  }

  async removeWorkItemFromIteration(itemId: string, type: string, userId?: string) {
    if (!prisma) throw new Error('Database not available');
    
    // Normalize type
    const normalizedType = type.toLowerCase();
    let result;
    let iterationId;
    let itemTitle = itemId;
    
    if (normalizedType.includes('requirement')) {
      const item = await prisma.projectRequirement.findUnique({ where: { id: itemId } });
      iterationId = item?.iterationId;
      result = await prisma.projectRequirement.update({
        where: { id: itemId },
        data: { iterationId: null }
      });
      itemTitle = result.title;
    } else if (normalizedType.includes('task')) {
      const item = await prisma.projectTask.findUnique({ where: { id: itemId } });
      iterationId = item?.iterationId;
      result = await prisma.projectTask.update({
        where: { id: itemId },
        data: { iterationId: null }
      });
      itemTitle = result.title;
    } else if (normalizedType.includes('defect') || normalizedType.includes('bug')) {
      const p: any = prisma;
      if (p.projectDefect) {
        const item = await p.projectDefect.findUnique({ where: { id: itemId } });
        iterationId = item?.iterationId;
        result = await p.projectDefect.update({
          where: { id: itemId },
          data: { iterationId: null }
        });
        itemTitle = result.title;
      }
    }
    
    if (!result) throw new Error(`Unknown work item type: ${type}`);

    if (userId && iterationId) {
      await this.logIterationActivity(
        iterationId,
        userId,
        'REMOVE_ITEM',
        `移除了工作项: ${itemTitle}`
      );
    }

    return result;
  }

  async getIterationComments(iterationId: string) {
    if (!prisma) return [];
    return (prisma as any).iterationComment.findMany({
      where: { iterationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createIterationComment(data: any) {
    if (!prisma) throw new Error('Database not available');
    return (prisma as any).iterationComment.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      }
    });
  }

  async getIterationActivities(iterationId: string) {
    if (!prisma) return [];
    return (prisma as any).iterationActivity.findMany({
      where: { iterationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async logIterationActivity(iterationId: string, userId: string, action: string, content?: string) {
    if (!prisma) return null;
    return (prisma as any).iterationActivity.create({
      data: {
        iterationId,
        userId,
        action,
        content
      }
    });
  }

  // Project Documents
  async getProjectDocuments(projectId: string) {
    if (!prisma) return [];
    return prisma.document.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        kind: true,
        content: true,
        createdAt: true,
        status: true,
        userId: true,
        agentId: true
      }
    });
  }
}

export default DatabaseService;
