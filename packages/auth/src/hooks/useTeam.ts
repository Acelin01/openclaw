"use client";

import { useState, useEffect } from "react";
import { Team, TeamMember } from "../types/team.types";

// This would typically use a Context, but for the shared library structure we'll just export the hook interface
// The actual implementation would likely fetch from API or read from a global store

export const useTeam = () => {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [userRole, setUserRole] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock implementation
  useEffect(() => {
    // Simulate fetching team data
    const mockTeam: Team = {
      id: "team_123",
      name: "My Awesome Team",
      ownerId: "user_1",
      type: "organization",
      createdAt: new Date(),
    };

    const mockMember: TeamMember = {
      userId: "user_1",
      teamId: "team_123",
      role: "owner",
      isActive: true,
    };

    setTimeout(() => {
      setCurrentTeam(mockTeam);
      setUserRole(mockMember);
      setIsLoading(false);
    }, 500);
  }, []);

  return {
    currentTeam,
    userRole,
    isLoading,
    switchTeam: (teamId: string) => console.log("Switching to team", teamId),
  };
};
