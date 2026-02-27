"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { Button } from "@uxin/ui";
import { ProfileEditDialog } from "./edit-dialog";

interface ProfileEditButtonProps {
  initialData: {
    name: string;
    brief: string;
    intro: string;
    skills: string;
    isFreelancer: boolean;
    avatar?: string;
    email: string;
  };
}

export function ProfileEditButton({ initialData }: ProfileEditButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="outline" 
        className="rounded-full h-10 px-6 gap-2 text-zinc-600 border-zinc-200 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all shadow-sm font-medium"
        onClick={() => setOpen(true)}
      >
        <User className="w-4 h-4" /> 编辑资料
      </Button>

      <ProfileEditDialog 
        open={open} 
        onOpenChange={setOpen} 
        initialData={initialData} 
      />
    </>
  );
}
