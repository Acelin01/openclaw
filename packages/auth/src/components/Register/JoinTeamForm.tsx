"use client";

import React, { useState } from "react";

export const JoinTeamForm = () => {
  const [inviteCode, setInviteCode] = useState("");

  return (
    <div>
      <h2>Join Team</h2>
      <input
        type="text"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        placeholder="Enter Invite Code"
      />
      {/* Implementation pending */}
    </div>
  );
};
