import apiClient from "../lib/api-client";

// --- Auth ---
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken?: string;
    admin?: User;
    user?: User;
  };
  // legacy flat fields
  accessToken?: string;
  user?: User;
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
  avatar?: string | null;
}

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/admin/login", payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>("/auth/admin/register", payload),

  logout: () => apiClient.post("/auth/admin/logout"),

  me: () => apiClient.get<{ success: boolean; user: User }>("/auth/admin/me"),

  refreshToken: () => apiClient.post<AuthResponse>("/auth/admin/refresh"),

  forgotPassword: (email: string) =>
    apiClient.post("/auth/admin/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post("/auth/admin/reset-password", { token, password }),
};

// --- Brokers ---
export interface Broker {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  ratingAverage?: number;
  reviewCount?: number;
  updatedAt: string;
  createdAt: string;
  regulatoryBodies?: string[];
  tradingConditions?: {
    minDeposit?: number;
    maxLeverage?: string;
    spreadFrom?: number;
    commissionPerLot?: number;
    platforms?: string[];
    baseCurrencies?: string[];
  };
  pros?: string[];
  cons?: string[];
}

export interface BrokersResponse {
  success: boolean;
  brokers: Broker[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateBrokerPayload {
  name: string;
  shortDescription?: string;
  fullDescription?: string;
  regulatoryBodies?: string[];
  licenseNumbers?: string[];
  foundedYear?: number;
  headquartersCountry?: string;
  isRegulated?: boolean;
  tradingConditions?: {
    minDeposit?: number;
    maxLeverage?: string;
    spreadFrom?: number;
    commissionPerLot?: number;
    platforms?: string[];
    baseCurrencies?: string[];
  };
  pros?: string[];
  cons?: string[];
  contact?: {
    website?: string;
    email?: string;
  };
}

export const brokerService = {
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    regulation?: string;
    minRating?: number;
    platform?: string;
    isFeatured?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }) => apiClient.get<BrokersResponse>("/brokers", { params }),

  getById: (id: string) =>
    apiClient.get<{ success: boolean; data: Broker | Broker[]; broker?: Broker }>(`/brokers/${id}`),

  getBySlug: (slug: string) =>
    apiClient.get<{ success: boolean; data: Broker | Broker[]; broker?: Broker }>(`/brokers/${slug}`),

  getReviews: (
    slug: string,
    params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }
  ) =>
    apiClient.get<{ success: boolean; reviews: Review[]; pagination: Pagination }>(
      `/brokers/${slug}/reviews`,
      { params }
    ),

  create: (payload: CreateBrokerPayload) =>
    apiClient.post<{ success: boolean; broker: Broker }>("/brokers", payload),

  update: (id: string, payload: Partial<CreateBrokerPayload> & { isFeatured?: boolean }) =>
    apiClient.patch<{ success: boolean; broker: Broker }>(`/brokers/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/brokers/${id}`),
};

// --- Reviews ---
export interface Review {
  _id: string;
  brokerId: string;
  author?: { _id: string; name: string };
  title: string;
  body: string;
  ratings: {
    overall: number;
    tradingConditions?: number;
    customerSupport?: number;
    platforms?: number;
    depositsWithdrawals?: number;
    regulation?: number;
  };
  status: "pending" | "approved" | "rejected";
  tradingExperienceYears?: string;
  accountType?: string;
  country?: string;
  helpfulVotes?: number;
  reportCount?: number;
  moderationNote?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  pagination: Pagination;
}

export const reviewService = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    broker?: string;
    author?: string;
  }) => apiClient.get<ReviewsResponse>("/reviews", { params }),

  create: (payload: {
    brokerId: string;
    title: string;
    body: string;
    ratings: Record<string, number>;
    tradingExperienceYears?: string;
    accountType?: string;
    country?: string;
  }) => apiClient.post<{ success: boolean; review: Review }>("/reviews", payload),

  moderate: (id: string, payload: { status: string; moderationNote?: string }) =>
    apiClient.patch<{ success: boolean; review: Review }>(
      `/reviews/${id}/moderate`,
      payload
    ),

  voteHelpful: (id: string) =>
    apiClient.post(`/reviews/${id}/helpful`),

  report: (id: string) =>
    apiClient.post(`/reviews/${id}/report`),
};

// --- Articles ---
export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body: string;
  author?: { _id: string; name: string };
  relatedBrokers?: string[];
  featuredImage?: {
    url: string | null;
    alt: string;
    caption: string;
  };
  categories?: string[];
  tags?: string[];
  status: "draft" | "published" | "archived" | "scheduled";
  publishedAt?: string | null;
  scheduledAt?: string | null;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    focusKeyword?: string | null;
    canonicalUrl?: string | null;
    ogImage?: string | null;
  };
  articleSchema?: {
    enabled?: boolean;
    type?: string;
  };
  tableOfContents?: { id: string; text: string; level: number }[];
  views?: number;
  readTimeMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticlesResponse {
  success: boolean;
  articles: Article[];
  pagination: Pagination;
}

export const articleService = {
  list: (params?: {
    page?: number;
    limit?: number;
    categories?: string;
    tags?: string;
    search?: string;
    status?: string;
  }) => apiClient.get<ArticlesResponse>("/articles", { params }),

  getBySlug: (slug: string) =>
    apiClient.get<{ success: boolean; article: Article }>(`/articles/${slug}`),

  create: (payload: {
    title: string;
    slug?: string;
    excerpt?: string;
    body: string;
    relatedBrokers?: string[];
    featuredImage?: { url?: string | null; alt?: string; caption?: string };
    categories?: string[];
    tags?: string[];
    status?: string;
    publishedAt?: string | null;
    scheduledAt?: string | null;
    seo?: {
      metaTitle?: string | null;
      metaDescription?: string | null;
      focusKeyword?: string | null;
      canonicalUrl?: string | null;
      ogImage?: string | null;
    };
    articleSchema?: { enabled?: boolean; type?: string };
    readTimeMinutes?: number | null;
  }) => apiClient.post<{ success: boolean; article: Article }>("/articles", payload),

  update: (id: string, payload: Partial<Article>) =>
    apiClient.patch<{ success: boolean; article: Article }>(`/articles/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/articles/${id}`),
};

// --- Leads ---
export interface Lead {
  _id: string;
  broker?: { _id: string; name: string; slug: string; logo?: string } | string;
  referredUser?: { _id: string; name: string; email: string } | string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  referrerUrl?: string | null;
  landingPage?: string | null;
  country?: string | null;
  device?: "desktop" | "mobile" | "tablet" | "unknown";
  ctaLabel?: string | null;
  pageType?: string | null;
  status: "new" | "contacted" | "qualified" | "converted" | "lost" | "spam";
  convertedAt?: string | null;
  cpaValue?: number;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const leadService = {
  list: (params?: {
    page?: number;
    limit?: number;
    broker?: string;
    status?: string;
    device?: string;
    pageType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) =>
    apiClient.get<{ success: boolean; leads: Lead[]; pagination: Pagination }>("/leads", {
      params,
    }),

  getById: (id: string) =>
    apiClient.get<{ success: boolean; lead: Lead; data?: Lead }>(`/leads/${id}`),

  create: (payload: {
    broker: string;
    ctaLabel?: string;
    pageType?: string;
    landingPage?: string;
    referrerUrl?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    country?: string;
    device?: string;
  }) => apiClient.post<{ success: boolean; lead: Lead }>("/leads", payload),

  update: (id: string, payload: {
    status?: string;
    cpaValue?: number;
    adminNotes?: string;
    convertedAt?: string | null;
  }) =>
    apiClient.patch<{ success: boolean; lead: Lead }>(`/leads/${id}`, payload),
};

// --- Affiliate ---
export const affiliateService = {
  listClicks: (params?: {
    page?: number;
    limit?: number;
    broker?: string;
    startDate?: string;
    endDate?: string;
  }) => apiClient.get("/affiliate/clicks", { params }),

  getStats: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get("/affiliate/stats", { params }),
};

// --- Admin ---
export interface DashboardStats {
  success: boolean;
  stats: {
    totalUsers?: number;
    activeBrokers?: number;
    pendingReviews?: number;
    articlesPublished?: number;
    dataUpdatesToday?: number;
    totalLeads?: number;
    totalRevenue?: number;
  };
}

export const adminService = {
  getDashboard: () =>
    apiClient.get<DashboardStats>("/admin/dashboard"),

  listUsers: (params?: { page?: number; limit?: number; role?: string; isActive?: boolean }) =>
    apiClient.get<{ success: boolean; users: User[]; pagination: Pagination }>("/admin/users", {
      params,
    }),

  updateUser: (id: string, payload: { role?: string; isActive?: boolean }) =>
    apiClient.patch<{ success: boolean; user: User }>(`/admin/users/${id}`, payload),

  deleteUser: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/admin/users/${id}`),
};

// --- Compare ---
export const compareService = {
  compare: (slugs: string[]) =>
    apiClient.get("/compare", { params: { slugs: slugs.join(",") } }),
};
