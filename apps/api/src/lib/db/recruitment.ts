import { getPrisma } from './index.js';
import { ChatSDKError } from "../errors.js";

function getDB() {
  return getPrisma();
}

// Position operations
export async function getPositions(filters: any = {}) {
  try {
    return await getDB().position.findMany({
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
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get positions");
  }
}

export async function getPositionById(id: string) {
  try {
    return await getDB().position.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        recruitmentApplications: {
          include: {
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
          }
        }
      }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get position by ID");
  }
}

export async function createPosition(data: any) {
  try {
    return await getDB().position.create({
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to create position");
  }
}

// Resume operations
export async function getResumes(userId?: string) {
  try {
    return await getDB().resume.findMany({
      where: userId ? { userId } : {},
      orderBy: { updatedAt: 'desc' }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get resumes");
  }
}

export async function getResumeById(id: string) {
  try {
    return await getDB().resume.findUnique({
      where: { id },
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
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get resume by ID");
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

// Application operations
export async function applyForPosition(positionId: string, resumeId: string, userId: string) {
  try {
    return await getDB().recruitmentApplication.create({
      data: {
        positionId,
        resumeId,
        userId,
        status: 'NEW'
      }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to apply for position");
  }
}

export async function getApplications(filters: any = {}) {
  try {
    return await getDB().recruitmentApplication.findMany({
      where: filters,
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
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get applications");
  }
}

export async function updateApplicationStatus(id: string, status: string) {
  try {
    return await getDB().recruitmentApplication.update({
      where: { id },
      data: { status }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to update application status");
  }
}

// Interview operations
export async function scheduleInterview(data: any) {
  try {
    return await getDB().interview.create({
      data
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to schedule interview");
  }
}

export async function getInterviews(userId: string, role: 'interviewer' | 'candidate') {
  try {
    return await getDB().interview.findMany({
      where: role === 'interviewer' ? { interviewerId: userId } : { candidateId: userId },
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
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get interviews");
  }
}

export async function submitInterviewEvaluation(interviewId: string, data: any) {
  try {
    return await getDB().interviewEvaluation.upsert({
      where: { interviewId },
      update: data,
      create: {
        interviewId,
        ...data
      }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to submit evaluation");
  }
}

// Talent Match operations
export async function getTalentMatches(positionId: string) {
  try {
    return await getDB().talentMatch.findMany({
      where: { positionId },
      orderBy: { score: 'desc' }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get talent matches");
  }
}

// Address operations
export async function getAddresses(userId: string) {
  try {
    return await getDB().address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get addresses");
  }
}

export async function upsertAddress(userId: string, data: any) {
  try {
    if (data.id) {
      return await getDB().address.update({
        where: { id: data.id },
        data
      });
    }
    return await getDB().address.create({
      data: {
        ...data,
        userId
      }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to upsert address");
  }
}

// Recruitment Setting operations
export async function getRecruitmentSettings(userId: string) {
  try {
    return await getDB().recruitmentSetting.findUnique({
      where: { userId }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get recruitment settings");
  }
}

export async function updateRecruitmentSettings(userId: string, data: any) {
  try {
    return await getDB().recruitmentSetting.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data
      }
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to update recruitment settings");
  }
}
