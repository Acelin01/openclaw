export type Permission = "read" | "write" | "delete" | "invite_users" | "manage_billing";

export type TeamRole = "owner" | "admin" | "member" | "guest";

export interface TeamMember {
  userId: string;
  teamId: string;
  role: TeamRole;
  customPermissions?: Permission[];
  joinedAt?: Date;
  isActive?: boolean;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  type: "personal" | "organization";
  createdAt: Date;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  inviterId: string;
  email: string;
  token: string;
  status: "pending" | "accepted" | "expired";
  roleToAssign: TeamRole;
  expiresAt: Date;
}
