export interface ServiceRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
    urgency: "low" | "medium" | "high" | "urgent";
  };
  location?: {
    type: "remote" | "onsite" | "hybrid";
    city?: string;
    country?: string;
  };
  requirements: {
    experience: number; // years
    languages: string[];
    certifications?: string[];
    portfolioRequired: boolean;
  };
  status: "draft" | "published" | "matching" | "in_progress" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceProvider {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  portfolio: {
    items: PortfolioItem[];
    totalProjects: number;
    averageRating: number;
  };
  pricing: {
    hourlyRate: number;
    projectRate?: number;
    currency: string;
    negotiable: boolean;
  };
  availability: {
    status: "available" | "busy" | "unavailable";
    nextAvailable?: Date;
    workingHours: WorkingHours;
  };
  location: {
    type: "remote" | "onsite" | "hybrid";
    city?: string;
    country?: string;
    timezone: string;
  };
  experience: {
    years: number;
    industries: string[];
    languages: string[];
    certifications: string[];
  };
  rating: {
    average: number;
    count: number;
    breakdown: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  verification: {
    identity: boolean;
    skills: boolean;
    portfolio: boolean;
    background: boolean;
  };
  status: "active" | "inactive" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  images: string[];
  link?: string;
  client?: string;
  duration?: number; // days
  budget?: number;
  rating?: number;
  review?: string;
  completedAt: Date;
}

export interface WorkingHours {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:mm
  end: string; // HH:mm
  available: boolean;
}

export interface MatchScore {
  providerId: string;
  requestId: string;
  overallScore: number; // 0-100
  categoryScore: number; // 0-100
  skillsScore: number; // 0-100
  budgetScore: number; // 0-100
  timelineScore: number; // 0-100
  locationScore: number; // 0-100
  experienceScore: number; // 0-100
  ratingScore: number; // 0-100
  factors: {
    matchedSkills: string[];
    missingSkills: string[];
    budgetMatch: "perfect" | "good" | "acceptable" | "poor";
    timelineMatch: "perfect" | "good" | "acceptable" | "poor";
    locationMatch: "perfect" | "good" | "acceptable" | "poor";
    experienceMatch: "perfect" | "good" | "acceptable" | "poor";
  };
  explanation: string;
  createdAt: Date;
}

export interface MatchResult {
  request: ServiceRequest;
  matches: MatchScore[];
  topMatches: MatchScore[];
  totalProviders: number;
  filteredProviders: number;
  matchedProviders: number;
  matchingAlgorithm: string;
  executionTime: number; // ms
  createdAt: Date;
}

export interface MatchingCriteria {
  weights: {
    category: number; // 0-1
    skills: number; // 0-1
    budget: number; // 0-1
    timeline: number; // 0-1
    location: number; // 0-1
    experience: number; // 0-1
    rating: number; // 0-1
  };
  thresholds: {
    minOverallScore: number; // 0-100
    minCategoryScore: number; // 0-100
    maxBudgetDifference: number; // percentage
    maxTimelineDifference: number; // days
    minExperience: number; // years
    minRating: number; // 0-5
  };
  filters: {
    categories?: string[];
    locations?: string[];
    workTypes?: ("remote" | "onsite" | "hybrid")[];
    verificationLevels?: ("identity" | "skills" | "portfolio" | "background")[];
    availability?: "available" | "busy" | "any";
    maxHourlyRate?: number;
    minRating?: number;
    languages?: string[];
  };
}

export interface MatchingAlgorithm {
  id: string;
  name: string;
  description: string;
  type: "rule-based" | "ml-based" | "hybrid";
  weights: MatchingCriteria["weights"];
  thresholds: MatchingCriteria["thresholds"];
  mlModel?: string;
  trainingData?: string;
  accuracy?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchingRequest {
  requestId: string;
  algorithmId?: string;
  criteria?: Partial<MatchingCriteria>;
  maxResults?: number;
  includeExplanation?: boolean;
  realTime?: boolean;
}

export interface ServiceRecommendation {
  id: string;
  userId: string;
  type: "provider" | "request";
  itemId: string;
  score: number;
  reason: string;
  factors: string[];
  createdAt: Date;
  expiresAt: Date;
  clicked: boolean;
  converted: boolean;
}

export interface ServiceMatchingError {
  code: string;
  message: string;
  details?: any;
  retryable?: boolean;
}
