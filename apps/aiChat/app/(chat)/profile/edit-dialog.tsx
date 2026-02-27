"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Loader2, 
  Camera, 
  User, 
  AtSign, 
  FileText, 
  Palette,
  Users
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
} from "@uxin/ui";
import { toast } from "@/components/toast";
import { isEmoji } from "@/lib/utils";
import { updateUserProfileAction } from "./actions";
import { useUpload } from "@/hooks/use-upload";
import { useAuthToken } from "@/hooks/use-auth-token";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function ProfileEditDialog({ open, onOpenChange, initialData }: ProfileEditDialogProps) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const { token } = useAuthToken();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUpload(token);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(initialData.name);
  const [brief, setBrief] = useState(initialData.brief);
  const [intro, setIntro] = useState(initialData.intro);
  const [skills, setSkills] = useState(initialData.skills);
  const [isFreelancer, setIsFreelancer] = useState(initialData.isFreelancer);
  const [avatar, setAvatar] = useState(initialData.avatar);

  // 当 initialData 变化时更新状态
  useEffect(() => {
    setDisplayName(initialData.name);
    setBrief(initialData.brief);
    setIntro(initialData.intro);
    setSkills(initialData.skills);
    setIsFreelancer(initialData.isFreelancer);
    setAvatar(initialData.avatar);
  }, [initialData]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadFile(file);
      if (result.url) {
        // 更新数据库中的头像
        await updateUserProfileAction({ avatar: result.url });
        
        // 更新本地状态
        setAvatar(result.url);
        
        // 更新 session
        await update({
          ...session,
          user: {
            ...session?.user,
            image: result.url
          }
        });
        
        toast({ type: "success", description: "头像上传成功" });
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast({ type: "error", description: "头像上传失败，请重试" });
    }
  };

  const handleSave = async () => {
    try {
      await updateUserProfileAction({
        name: displayName,
        brief: brief,
        intro: intro,
        skills: skills,
        isFreelancer: isFreelancer,
      });

      await update({ 
        ...session,
        user: {
          ...session?.user,
          name: displayName
        }
      });
      
      toast({ type: "success", description: "个人资料已更新" });
      onOpenChange(false);
      
      // 刷新页面以显示最新数据
      router.refresh();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ type: "error", description: "更新失败，请重试" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="px-6 pt-8 pb-4 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">编辑个人资料</DialogTitle>
          <DialogDescription className="sr-only">
            在此更新您的个人资料信息
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 py-8 space-y-8 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-background shadow-md bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-3xl font-bold">
                {avatar ? (
                  isEmoji(avatar) ? (
                    <span className="text-5xl">{avatar}</span>
                  ) : (
                    <Image
                      alt={displayName}
                      className="object-cover w-full h-full"
                      height={100}
                      src={avatar}
                      width={100}
                    />
                  )
                ) : (
                  <span>{displayName.slice(0, 2).toUpperCase()}</span>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
              <Button 
                variant="ghost"
                size="icon"
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg border-2 border-white transition-all hover:scale-110 hover:bg-emerald-600 active:scale-95 hover:text-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{initialData.email}</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="displayName" className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <User className="h-4 w-4 text-zinc-400" />
                显示名称
              </Label>
              <Input 
                id="displayName" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-11 px-4 text-base focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                placeholder="请输入您的显示名称"
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="brief" className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <AtSign className="h-4 w-4 text-zinc-400" />
                一句话简介
              </Label>
              <Input
                id="brief"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="h-11 px-4 text-base focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                placeholder="例如：探索者 & 创造者"
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="intro" className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <FileText className="h-4 w-4 text-zinc-400" />
                自我介绍
              </Label>
              <Textarea
                id="intro"
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                className="min-h-[100px] px-4 py-2 text-base focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                placeholder="简单介绍一下您自己..."
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="skills" className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <Palette className="h-4 w-4 text-zinc-400" />
                技能特长 (以逗号分隔)
              </Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="h-11 px-4 text-base focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                placeholder="例如：AI, 设计, 开发"
              />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
              <Checkbox
                id="is-freelancer-dialog"
                checked={isFreelancer}
                onCheckedChange={(checked) => setIsFreelancer(!!checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="is-freelancer-dialog"
                  className="text-sm font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer"
                >
                  我是自由职业者
                </label>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">
                  开启后，您可以在个人主页展示并提供专业服务
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-6 bg-zinc-50 dark:bg-zinc-900/50 border-t flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="font-medium">
            取消
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 font-semibold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            保存更改
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
