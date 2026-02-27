import { getPrisma } from './index.js';
import { ChatSDKError } from "../errors.js";
import type { Prisma as PrismaTypes } from '@prisma/client';

function getDB() {
  return getPrisma();
}

// Worker Profile operations
export async function getWorkerProfiles(filters: PrismaTypes.WorkerProfileWhereInput = {}) {
  try {
    const db = getDB();
    return await db.workerProfile.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        services: true,
        portfolios: true,
        certifications: true
      },
      orderBy: { rating: 'desc' }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get worker profiles");
  }
}

export async function getWorkerProfileByUserId(userId: string) {
  try {
    const db = getDB();
    return await db.workerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        services: true,
        portfolios: true,
        certifications: true
      }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get worker profile by user ID");
  }
}

export async function upsertWorkerProfile(userId: string, data: PrismaTypes.WorkerProfileUpdateInput | PrismaTypes.WorkerProfileUncheckedUpdateInput) {
  try {
    const db = getDB();
    return await db.workerProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...(data as any)
      }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to upsert worker profile");
  }
}

// Worker Service operations
export async function getWorkerServices(workerId: string) {
  try {
    const db = getDB();
    return await db.workerService.findMany({
      where: { workerId },
      include: {
        documents: true
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get worker services");
  }
}

export async function createWorkerService(data: PrismaTypes.WorkerServiceCreateInput | PrismaTypes.WorkerServiceUncheckedCreateInput) {
  try {
    const db = getDB();
    return await db.workerService.create({
      data: data as any
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create worker service");
  }
}

export async function updateWorkerService(id: string, data: PrismaTypes.WorkerServiceUpdateInput | PrismaTypes.WorkerServiceUncheckedUpdateInput) {
  try {
    const db = getDB();
    return await db.workerService.update({
      where: { id },
      data: data as any
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to update worker service");
  }
}

export async function deleteWorkerService(id: string) {
  try {
    const db = getDB();
    return await db.workerService.delete({
      where: { id }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to delete worker service");
  }
}

// Worker Portfolio operations
export async function getWorkerPortfolios(workerId: string) {
  try {
    const db = getDB();
    return await db.workerPortfolio.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get worker portfolios");
  }
}

export async function createWorkerPortfolio(data: PrismaTypes.WorkerPortfolioCreateInput | PrismaTypes.WorkerPortfolioUncheckedCreateInput) {
  try {
    const db = getDB();
    return await db.workerPortfolio.create({
      data: data as any
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create worker portfolio");
  }
}

export async function updateWorkerPortfolio(id: string, data: PrismaTypes.WorkerPortfolioUpdateInput | PrismaTypes.WorkerPortfolioUncheckedUpdateInput) {
  try {
    const db = getDB();
    return await db.workerPortfolio.update({
      where: { id },
      data: data as any
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to update worker portfolio");
  }
}

export async function deleteWorkerPortfolio(id: string) {
  try {
    const db = getDB();
    return await db.workerPortfolio.delete({
      where: { id }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to delete worker portfolio");
  }
}

// Worker Skill Certification operations
export async function getWorkerSkillCertifications(workerId: string) {
  try {
    return await getDB().workerSkillCertification.findMany({
      where: { workerId },
      orderBy: { issueDate: 'desc' }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get worker skill certifications");
  }
}

export async function createWorkerSkillCertification(data: any) {
  try {
    return await getDB().workerSkillCertification.create({
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create worker skill certification");
  }
}

export async function updateWorkerSkillCertification(id: string, data: any) {
  try {
    return await getDB().workerSkillCertification.update({
      where: { id },
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to update worker skill certification");
  }
}

export async function deleteWorkerSkillCertification(id: string) {
  try {
    return await getDB().workerSkillCertification.delete({
      where: { id }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to delete worker skill certification");
  }
}

// Worker Experience operations
export async function getWorkerExperiences(workerId: string) {
  try {
    return await getDB().workerExperience.findMany({
      where: { workerId },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get worker experiences");
  }
}

export async function createWorkerExperience(data: any) {
  try {
    return await getDB().workerExperience.create({
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create worker experience");
  }
}

export async function updateWorkerExperience(id: string, data: any) {
  try {
    return await getDB().workerExperience.update({
      where: { id },
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to update worker experience");
  }
}

export async function deleteWorkerExperience(id: string) {
  try {
    return await getDB().workerExperience.delete({
      where: { id }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to delete worker experience");
  }
}

// Quotation operations
export async function getQuotations(filters: any = {}) {
  try {
    return await getDB().quotation.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get quotations");
  }
}

export async function createQuotation(data: any) {
  try {
    return await getDB().quotation.create({
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create quotation");
  }
}

export async function updateQuotation(id: string, data: any) {
  try {
    return await getDB().quotation.update({
      where: { id },
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to update quotation");
  }
}

export async function deleteQuotation(id: string) {
  try {
    return await getDB().quotation.delete({
      where: { id }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to delete quotation");
  }
}

// Resume operations
export async function getResumes(filters: any = {}) {
  try {
    return await getDB().resume.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get resumes");
  }
}

export async function getResumeByUserId(userId: string) {
  try {
    return await getDB().resume.findFirst({
      where: { userId }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get resume by user ID");
  }
}

export async function createResume(data: any) {
  try {
    return await getDB().resume.create({
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create resume");
  }
}

export async function updateResume(id: string, data: any) {
  try {
    return await getDB().resume.update({
      where: { id },
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to update resume");
  }
}

export async function deleteResume(id: string) {
  try {
    return await getDB().resume.delete({
      where: { id }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to delete resume");
  }
}

// Worker Schedule operations
export async function getWorkerSchedules(workerId: string) {
  try {
    return await getDB().workerSchedule.findMany({
      where: { workerId },
      orderBy: { startTime: 'asc' }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get worker schedules");
  }
}

export async function createWorkerSchedule(data: any) {
  try {
    return await getDB().workerSchedule.create({
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create worker schedule");
  }
}

export async function updateWorkerSchedule(id: string, data: any) {
  try {
    return await getDB().workerSchedule.update({
      where: { id },
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to update worker schedule");
  }
}

export async function deleteWorkerSchedule(id: string) {
  try {
    return await getDB().workerSchedule.delete({
      where: { id }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to delete worker schedule");
  }
}

// Transaction (Order) operations
export async function getTransactions(filters: any = {}) {
  try {
    return await getDB().transaction.findMany({
      where: filters,
      include: {
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
        },
        quotation: true,
        inquiry: true,
        project: true
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get transactions");
  }
}

export async function createTransaction(data: any) {
  try {
    return await getDB().transaction.create({
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create transaction");
  }
}

export async function updateTransaction(id: string, data: any) {
  try {
    return await getDB().transaction.update({
      where: { id },
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to update transaction");
  }
}

export async function createContract(data: any) {
  try {
    const title = data.title ?? data.name ?? '合同';
    const rawContent = data.content ?? data.terms ?? null;
    const content = typeof rawContent === 'string' || rawContent === null ? rawContent : JSON.stringify(rawContent);
    return await getDB().document.create({
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
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create contract");
  }
}

export async function deleteTransaction(id: string) {
  try {
    return await getDB().transaction.delete({
      where: { id }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to delete transaction");
  }
}
