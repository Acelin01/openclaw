export interface WorkerProfile {
  id: string;
  userId: string;
  title: string;
  bio?: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  location?: string;
  languages: string[];
  skills: string[];
  badges: string[];
  hourlyRateAmount?: number;
  hourlyRateCurrency?: string;
  hourlyRateUnit?: string;
  responseTimeValue?: number;
  responseTimeUnit?: string;
  consultationEnabled: boolean;
  onlineStatus: boolean;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedDomains: string[];
  createdAt: Date;
  updatedAt: Date;
  services?: WorkerService[];
  portfolios?: WorkerPortfolio[];
  certifications?: WorkerSkillCertification[];
}

export interface WorkerService {
  id: string;
  workerId: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  priceAmount: number;
  priceCurrency: string;
  unit: string;
  deliveryTime?: string;
  category?: string;
  status: string;
  tags: string[];
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerPortfolio {
  id: string;
  workerId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  projectUrl?: string;
  tags: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerSkillCertification {
  id: string;
  workerId: string;
  skillName: string;
  level?: string;
  issuer?: string;
  issueDate?: Date;
  expiryDate?: Date;
  certificateUrl?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quotation {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priceType: string;
  priceAmount?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  deliveryTime?: string;
  includes: string[];
  excludes: string[];
  requirements: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
