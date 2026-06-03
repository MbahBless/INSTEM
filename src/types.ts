export type UserRole = "STUDENT" | "COMPANY" | "SCHOOL" | "PUBLIC";

export interface EndorsedSkill {
  skill: string;
  endorsedBy: string;
  companyName: string;
  date: string;
}

export interface UserSettings {
  dataVisibility: "PUBLIC" | "RESTRICTED" | "PRIVATE";
  emailFrequency: "DAILY" | "WEEKLY" | "MONTHLY" | "OFF";
  exportPreference: "PDF" | "CSV" | "JSON";
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "COMPANY" | "SCHOOL";
  companyName?: string;
  department?: string;
  studentId?: string;
  endorsedSkills?: EndorsedSkill[];
  projectTitle?: string;
  projectCompleted?: boolean;
  projectCompletedDate?: string;
  settings?: UserSettings;
  isPremium?: boolean;
  subscriptionPlan?: "monthly" | "annual";
  subscriptionExpiresAt?: string;
  phoneNumber?: string;
}

export interface Internship {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  location: string;
  type: string;
  stipend: string;
  duration: string;
  description: string;
  requirements: string[];
  department: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
}

export interface Application {
  id: string;
  internshipId: string;
  internshipTitle: string;
  companyId: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  status: "APPLIED" | "UNDER_REVIEW" | "INTERVIEWING" | "ACCEPTED" | "REJECTED";
  appliedAt: string;
  coverLetter?: string;
  feedback?: string;
}

export interface Report {
  id: string;
  studentId: string;
  studentName: string;
  companyId: string;
  companyName: string;
  title: string;
  content: string;
  challenges: string;
  hoursLogged: number;
  submittedAt: string;
  status: "PENDING" | "APPROVED" | "REVISION_REQUESTED";
  feedback?: string;
  grade?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  totalStudents: number;
  totalCompanies: number;
  openPositions: number;
  placementRate: number;
  placedCount: number;
}

export interface AnalyticsCounts {
  APPLIED: number;
  UNDER_REVIEW: number;
  INTERVIEWING: number;
  ACCEPTED: number;
  REJECTED: number;
}

export interface TopCompany {
  name: string;
  count: number;
}

export interface DepartmentBreakdown {
  name: string;
  total: number;
  placed: number;
  rate: number;
}

export interface ActivityLog {
  id: string;
  type: "APPLICATION" | "REPORT";
  title: string;
  detail: string;
  time: string;
}

export interface AnalyticsResponse {
  metrics: DashboardMetrics;
  statusCounts: AnalyticsCounts;
  topCompanies: TopCompany[];
  departmentBreakdown: DepartmentBreakdown[];
  activityLog: ActivityLog[];
}
