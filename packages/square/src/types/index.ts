export interface SquareWorker {
  id: string;
  name: string;
  avatarUrl: string;
  title: string;
  rating: number;
  reviewCount: number;
  location: string;
  languages: string[];
  badges: string[]; // "Verified", "Top Rated"
  hourlyRate?: {
    amount: number;
    currency: string;
    unit: string;
  };
  consultationEnabled: boolean;
  onlineStatus: boolean;
  isAgency?: boolean;
  responseSpeed?: string; // "反应迅速"
  skills: string[];
  services?: SquareService[];
}

export interface SquareService {
  id: string;
  workerId: string;
  title: string;
  description: string;
  coverImageUrl: string;
  price: {
    amount: number;
    currency: string;
    unit?: string;
  };
  rating: number;
  reviewCount: number;
  deliveryTime?: string;
  tags: string[];
  isAd?: boolean;
  features?: string[];
  provider?: {
    name: string;
    avatarUrl: string;
    verified: boolean;
    level?: string; // "Top Rated"
  };
  packages?: ServicePackage[];
  faqs?: ServiceFAQ[];
  reviews?: ServiceReview[];
}

export interface ServicePackage {
  id: string;
  plans: ServicePackagePlan[];
}

export interface ServicePackagePlan {
  id: string;
  tier: "BASIC" | "STANDARD" | "PREMIUM" | "CUSTOM";
  name: string;
  priceAmount: number;
  priceCurrency: string;
  deliveryTime?: string;
  features: Array<{ key: string; label: string; included: boolean }>;
}

export interface ServiceFAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder?: number;
}

export interface ServiceReview {
  id: string;
  rating: number;
  title?: string;
  content: string;
  customer?: { id: string; name: string; avatarUrl?: string };
  createdAt?: string;
}
