export type SharedEmployeeStatus = "AVAILABLE" | "BUSY" | "ON_LEAVE" | "UNAVAILABLE";

export type SharedEmployeeAssignmentStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "ACTIVE";

export interface SharedEmployeeSkill {
  id: string;
  employeeId: string;
  name: string;
  level: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedEmployeeAssignment {
  id: string;
  employeeId: string;
  projectName: string;
  clientName?: string;
  startDate?: string;
  endDate?: string;
  status: SharedEmployeeAssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SharedEmployee {
  id: string;
  userId?: string;
  name: string;
  avatar?: string;
  title?: string;
  department?: string;
  bio?: string;
  location?: string;
  hourlyRate?: number;
  currency: string;
  status: SharedEmployeeStatus;
  createdAt: string;
  updatedAt: string;
  skills?: SharedEmployeeSkill[];
  assignments?: SharedEmployeeAssignment[];
}

export interface SharedEmployeeStats {
  totalEmployees: number;
  availableEmployees: number;
  totalAssignments: number;
  totalSkills: number;
}
