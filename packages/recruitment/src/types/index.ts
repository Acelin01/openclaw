export interface Position {
  id: string;
  title: string;
  description?: string;
  companyName?: string;
  location?: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "INTERN" | "CONTRACT";
  salaryMin?: number;
  salaryMax?: number;
  requirements?: string[];
  status: "OPEN" | "CLOSED" | "DRAFT";
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name?: string;
    avatarUrl?: string;
  };
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  title?: string;
  summary?: string;
  skills?: string[];
  experiences?: any[];
  education?: any[];
  status: "ACTIVE" | "INACTIVE";
  updatedAt: string;
}

export interface RecruitmentApplication {
  id: string;
  positionId: string;
  resumeId: string;
  userId: string;
  status: "NEW" | "REVIEWED" | "INTERVIEW" | "REJECTED" | "HIRED";
  appliedAt: string;
  updatedAt: string;
  position?: Position;
  resume?: Resume;
  user?: {
    id: string;
    name?: string;
    avatarUrl?: string;
  };
}

export interface Interview {
  id: string;
  applicationId: string;
  interviewerId: string;
  candidateId: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: "VIDEO" | "ONSITE" | "PHONE";
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  feedback?: string;
  rating?: number;
  createdAt: string;
  application?: RecruitmentApplication;
  interviewer?: {
    id: string;
    name?: string;
  };
  candidate?: {
    id: string;
    name?: string;
  };
}

export interface TalentMatch {
  id: string;
  positionId: string;
  candidateId: string;
  score: number;
  reason?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  position?: Position;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  detail: string;
  city?: string;
  isDefault: boolean;
}

export interface RecruitmentSetting {
  id: string;
  userId: string;
  companyIntro?: string;
  notificationEmail?: string;
  autoReply: boolean;
}
