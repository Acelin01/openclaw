export const VERSION = "1.0.0";

// User types
export interface AnalyticsFilters {
  startDate?: string | Date;
  endDate?: string | Date;
  userId?: string;
  serviceId?: string;
  activityType?: string;
  limit?: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  activityType: string;
  metadata?: any;
  createdAt: Date;
}

export interface ServiceMetrics {
  views?: number;
  bookings?: number;
  revenue?: number;
  rating?: number;
  viewCount: number;
  bookingCount: number;
  totalRevenue: number;
  averageRating: number;
  reviewCount: number;
  conversionRate: number;
  serviceId?: string;
}

export interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  totalTransactions?: number;
  totalRevenue: number;
  totalBookings: number;
  totalServices: number;
  newUsers: number;
  popularServices: PopularService[];
}

export interface PopularService {
  serviceId?: string;
  service: Service;
  title?: string;
  views?: number;
  viewCount: number;
  bookings?: number;
  bookingCount: number;
  averageRating: number;
  totalRevenue: number;
}

export interface UserEngagement {
  userId?: string;
  lastActive?: Date;
  activityCount?: number;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  engagementRate: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  rating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  serviceType?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "customer" | "provider" | "admin";
  avatarUrl?: string;
  phone?: string;
  teamId?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: "zh-CN" | "en-US";
  currency: "CNY" | "USD";
  timezone: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// Quotation types
export interface Quotation {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priceType: "fixed" | "hourly" | "custom";
  priceAmount?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  deliveryTime: string;
  includes: string[];
  excludes: string[];
  requirements: string[];
  status: "active" | "paused" | "expired";
  aiGenerated: boolean;
  aiConversationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuotationData {
  title: string;
  description: string;
  category: string;
  priceType: "fixed" | "hourly" | "custom";
  priceAmount?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  deliveryTime: string;
  includes: string[];
  excludes: string[];
  requirements: string[];
}

// Service types
export interface Service {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priceType: "fixed" | "hourly" | "custom";
  priceAmount?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  deliveryTime: string;
  includes: string[];
  excludes: string[];
  requirements: string[];
  views?: number;
  status: "active" | "paused" | "expired";
  aiGenerated: boolean;
  aiConversationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceData {
  title: string;
  description: string;
  category: string;
  priceType: "fixed" | "hourly" | "custom";
  priceAmount?: number;
  priceRangeMin?: number;
  priceRangeMax?: number;
  deliveryTime: string;
  includes: string[];
  excludes: string[];
  requirements: string[];
}

// Inquiry types
export interface Inquiry {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  budgetMin?: number;
  budgetMax?: number;
  deadline?: Date;
  requirements: string[];
  deliverables: string[];
  location?: string;
  status: "active" | "awarded" | "completed" | "cancelled";
  aiGenerated: boolean;
  aiConversationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInquiryData {
  title: string;
  description: string;
  category: string;
  budgetMin?: number;
  budgetMax?: number;
  deadline?: Date;
  requirements: string[];
  deliverables: string[];
  location?: string;
}

// Transaction types
export interface Transaction {
  id: string;
  inquiryId: string;
  quotationId: string;
  customerId: string;
  providerId: string;
  amount: number;
  currency: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "disputed" | "refunded";
  paymentMethod?: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  contractData?: ContractData;
  milestones?: Milestone[];
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractData {
  terms: string[];
  paymentSchedule: PaymentSchedule[];
  deliverables: string[];
  timeline: ProjectTimeline;
}

export interface PaymentSchedule {
  milestone: string;
  amount: number;
  dueDate: Date;
  status: "pending" | "paid";
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: "pending" | "in_progress" | "completed";
  deliverables: string[];
}

export interface ProjectTimeline {
  startDate: Date;
  endDate: Date;
  phases: ProjectPhase[];
}

export interface ProjectPhase {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: "pending" | "in_progress" | "completed";
}

export * from "./acp";
