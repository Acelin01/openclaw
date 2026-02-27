"use client";

import { 
  Loader2,
  ChevronUp, 
  HelpCircle, 
  MessageSquare, 
  Send, 
  Info, 
  User, 
  Home,
  Settings, 
  CreditCard, 
  Moon, 
  Sun, 
  LogOut, 
  Camera,
  Shield,
  Bell,
  Lock,
  Database,
  Globe,
  FileText,
  AtSign,
  Users,
  Palette,
  Accessibility,
  Languages,
  Trash2,
  Download,
  Key,
  Smartphone,
  Plug
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User as NextAuthUser } from "next-auth";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { MCPSettingsTab } from './mcp-settings-tab';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  Button,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Checkbox,
} from "@uxin/ui";
import { guestRegex } from "@/lib/constants";
import { LoaderIcon } from "./icons";
import { toast } from "./toast";
import { getFullUserProfileAction, updateUserProfileAction } from "../app/(chat)/profile/actions";
import { useUpload } from "@/hooks/use-upload";
import { useAuthToken } from "@/hooks/use-auth-token";
import { isEmoji } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "@uxin/i18n";

export function SidebarUserNav({ user }: { user: NextAuthUser }) {
  const { i18n, t } = useTranslation();
  const currentLanguage = supportedLanguages.find(l => l.code === i18n.language) || supportedLanguages[0];
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const { token } = useAuthToken();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUpload(token);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [showAccountInfoDialog, setShowAccountInfoDialog] = useState(false);
   const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
   const [showSettingsDialog, setShowSettingsDialog] = useState(false);
   const [showAboutDialog, setShowAboutDialog] = useState(false);
   const [showUserAgreement, setShowUserAgreement] = useState(false);
   const [showPrivacyAgreement, setShowPrivacyAgreement] = useState(false);

  const { state } = useSidebar();
  const isGuest = user?.type === "guest";
  const showLoading = status === "loading" && !user?.email;

  // 优先从 session 中获取最新的用户信息，实现名称更改后的实时同步
  const currentUser = session?.user || user;
  
  const userProfile = {
    name: currentUser?.name || currentUser?.email?.split('@')[0] || "用户",
    username: currentUser?.name?.toLowerCase().replace(/\s+/g, '') || "user123",
    email: currentUser?.email || "",
    avatar: currentUser?.image || `https://avatar.vercel.sh/${currentUser?.email}`,
    plan: t('profile.plan.free'),
    teamName: t('profile.defaultTeamName'),
    role: "admin", // "admin" or "member"
    adminName: "LY X",
    adminAvatar: "LY",
  };

  const [displayName, setDisplayName] = useState(userProfile.name);
  const [teamName, setTeamName] = useState(userProfile.teamName);
  const [brief, setBrief] = useState("");
  const [intro, setIntro] = useState("");
  const [skills, setSkills] = useState("");
  const [isFreelancer, setIsFreelancer] = useState(false);

  // 当弹窗打开时，获取数据库中的完整用户信息
  useEffect(() => {
    if (showEditProfileDialog) {
      setDisplayName(userProfile.name);
      getFullUserProfileAction().then((dbUser) => {
        if (dbUser) {
          setBrief(dbUser.brief || "");
          setIntro(dbUser.intro || "");
          setSkills(dbUser.skills || "");
          setIsFreelancer(!!dbUser.isFreelancer);
        }
      });
    }
  }, [showEditProfileDialog, userProfile.name]);
  const [accentColor, setAccentColor] = useState("emerald"); // emerald, purple, blue, pink, orange

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadFile(file);
      if (result.url) {
        // 更新数据库中的头像
        await updateUserProfileAction({ avatar: result.url });
        
        // 更新 session
        await update({
          ...session,
          user: {
            ...session?.user,
            image: result.url
          }
        });
        
        toast({ type: "success", description: t('profile.avatarUploaded') });
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      toast({ type: "error", description: t('profile.avatarUploadFailed') });
    }
  };

  return (
    <>
      {/* 账户信息弹窗 */}
      <Dialog open={showAccountInfoDialog} onOpenChange={setShowAccountInfoDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('profile.accountInfo')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('profile.accountInfoDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {isEmoji(userProfile.avatar) ? (
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 text-4xl">
                {userProfile.avatar}
              </div>
            ) : (
              <Image
                alt={userProfile.name}
                className="rounded-full object-cover"
                height={80}
                src={userProfile.avatar}
                width={80}
              />
            )}
            <div className="text-center">
              <h3 className="text-lg font-bold">{userProfile.name}</h3>
              <p className="text-sm text-zinc-500">{userProfile.email}</p>
            </div>
            <div className="w-full rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('profile.currentPlan')}</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {userProfile.plan}
                </span>
              </div>
              <Button 
                className="mt-4 w-full" 
                variant="outline"
                onClick={() => {
                  setShowAccountInfoDialog(false);
                  router.push("/pricing");
                }}
              >
                {t('profile.upgradeToPro')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑个人资料弹窗 */}
      <Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="px-6 pt-8 pb-4 border-b">
            <DialogTitle className="text-xl font-bold tracking-tight">{t('profile.editProfile')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('profile.editProfileDesc')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-8 space-y-8 max-h-[70vh] overflow-y-auto">
            {/* 头像居中，上传图标位于右下角 */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative group">
                <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-background shadow-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  {userProfile.avatar ? (
                    isEmoji(userProfile.avatar) ? (
                      <span className="text-5xl">{userProfile.avatar}</span>
                    ) : (
                      <Image
                        alt={userProfile.name}
                        className="object-cover w-full h-full"
                        height={100}
                        src={userProfile.avatar}
                        width={100}
                      />
                    )
                  ) : (
                    <span className="text-white text-3xl font-bold">{userProfile.name.slice(0, 2).toUpperCase()}</span>
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
              <p className="mt-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{userProfile.email}</p>
            </div>

            <div className="space-y-6">
              {/* 显示名称 */}
              <div className="space-y-2.5">
                <Label htmlFor="displayName" className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <User className="h-4 w-4 text-zinc-400" />
                  {t('profile.displayName')}
                </Label>
                <Input 
                  id="displayName" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-11 px-4 text-base focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  placeholder={t('profile.enterDisplayName')}
                />
              </div>

              {/* 一句话简介 */}
              <div className="space-y-2.5">
                <Label htmlFor="brief" className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <AtSign className="h-4 w-4 text-zinc-400" />
                  {t('profile.bio')}
                </Label>
                <Input
                  id="brief"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  className="h-11 px-4 text-base focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  placeholder={t('profile.bioPlaceholder')}
                />
              </div>

              {/* 自我介绍 */}
              <div className="space-y-2.5">
                <Label htmlFor="intro" className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <FileText className="h-4 w-4 text-zinc-400" />
                  {t('profile.intro')}
                </Label>
                <Textarea
                  id="intro"
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  className="min-h-[100px] px-4 py-2 text-base focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  placeholder={t('profile.introPlaceholder')}
                />
              </div>

              {/* 技能特长 */}
              <div className="space-y-2.5">
                <Label htmlFor="skills" className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  <Palette className="h-4 w-4 text-zinc-400" />
                  {t('profile.skills')}
                </Label>
                <Input
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="h-11 px-4 text-base focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all"
                  placeholder={t('profile.skillsPlaceholder')}
                />
              </div>

              {/* 是否为自由职业者 */}
              <div className="flex items-center space-x-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                <Checkbox
                  id="is-freelancer"
                  checked={isFreelancer}
                  onCheckedChange={(checked) => setIsFreelancer(!!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="is-freelancer"
                    className="text-sm font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer"
                  >
                    {t('profile.isFreelancer')}
                  </label>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">
                    {t('profile.freelancerDesc')}
                  </p>
                </div>
              </div>

              {/* 企业名称区域 */}
              <div className="pt-6 border-top border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-zinc-400" />
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('profile.teamName')}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        userProfile.role === "admin" 
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}>
                        {userProfile.role === "admin" ? t('profile.teamAdmin') : t('profile.teamMember')}
                      </span>
                    </div>
                    {userProfile.role === "member" && (
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium">
                        {t('profile.leaveTeam')}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Input 
                      disabled={userProfile.role !== "admin"} 
                      id="teamName" 
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className={`h-11 px-4 text-base transition-all ${
                        userProfile.role !== "admin" 
                          ? "bg-zinc-50 dark:bg-zinc-900/50 cursor-not-allowed" 
                          : "focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                      }`}
                      placeholder={t('profile.teamName')}
                    />
                    
                    {userProfile.role === "member" && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                          {userProfile.adminAvatar}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] text-zinc-400 font-medium">{t('profile.admin')}</span>
                          <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{userProfile.adminName}</span>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-[12px] text-zinc-400 leading-relaxed">
                      {userProfile.role === "admin" ? t('profile.adminCanEdit') : t('profile.memberCannotEdit')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-6 bg-zinc-50 dark:bg-zinc-900/50 border-t flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowEditProfileDialog(false)} className="font-medium">
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={async () => {
                try {
                  // 1. 调用 Server Action 更新数据库
                  await updateUserProfileAction({
                    name: displayName,
                    brief: brief,
                    intro: intro,
                    skills: skills,
                    isFreelancer: isFreelancer,
                  });

                  // 2. 更新 Session 中的用户名称（前端实时同步）
                  await update({ 
                    ...session,
                    user: {
                      ...session?.user,
                      name: displayName
                    }
                  });
                  
                  toast({ type: "success", description: t('profile.profileUpdated') });
                  setShowEditProfileDialog(false);
                } catch (error) {
                  console.error("Failed to update profile:", error);
                  toast({ type: "error", description: t('profile.updateFailed') });
                }
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 font-semibold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              {t('profile.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 设置弹窗 */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{t('settings.settingsTitle')}</DialogTitle>
            <DialogDescription>管理您的账户设置和应用偏好</DialogDescription>
          </DialogHeader>
          <div className="flex h-[600px] bg-white dark:bg-zinc-950">
            <Tabs defaultValue="general" className="flex w-full" orientation="vertical">
              {/* 左侧菜单栏 */}
              <TabsList className="flex h-full w-56 flex-col items-start justify-start rounded-none border-r bg-zinc-50/50 p-3 dark:bg-zinc-900/50">
                <div className="mb-6 px-3 pt-4">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{t('settings.settingsTitle')}</h2>
                </div>
                
                <div className="w-full space-y-1">
                  <TabsTrigger value="general" className="w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-zinc-800">
                    <Settings className="h-4 w-4" /> {t('settings.general')}
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-zinc-800">
                    <Palette className="h-4 w-4" /> {t('settings.appearance')}
                  </TabsTrigger>
                  <TabsTrigger value="account" className="w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-zinc-800">
                    <User className="h-4 w-4" /> {t('settings.account')}
                  </TabsTrigger>
                  <TabsTrigger value="mcp" className="w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-zinc-800">
                    <Plug className="h-4 w-4" /> MCP
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-zinc-800">
                    <Bell className="h-4 w-4" /> {t('settings.notificationSettings')}
                  </TabsTrigger>
                  <TabsTrigger value="data" className="w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-zinc-800">
                    <Database className="h-4 w-4" /> {t('settings.dataControl')}
                  </TabsTrigger>
                  <TabsTrigger value="accessibility" className="w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-zinc-800">
                    <Accessibility className="h-4 w-4" /> {t('settings.accessibilitySettings')}
                  </TabsTrigger>
                  <TabsTrigger value="about" className="w-full justify-start gap-3 px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-zinc-800">
                    <Info className="h-4 w-4" /> {t('settings.about')}
                  </TabsTrigger>
                </div>

                <div className="mt-auto p-3 w-full border-t border-zinc-100 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-400 font-medium">
                    <p>{t('settings.version')}</p>
                    <p className="mt-1">© 2026 Uxin AI</p>
                  </div>
                </div>
              </TabsList>
              
              {/* 右侧内容区域 */}
              <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-zinc-950">
                <div className="p-6 overflow-y-auto flex-1">
                  {/* 常规设置 */}
                  <TabsContent value="general" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="pb-2 border-b">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('settings.generalSettings')}</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">{t('settings.interfaceLanguage')}</Label>
                          <p className="text-xs text-zinc-400">{t('settings.selectLanguage')}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 min-w-[120px] justify-between font-medium">
                              {currentLanguage?.name} <ChevronUp className="h-4 w-4 rotate-180" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {supportedLanguages.map((lang) => (
                              <DropdownMenuItem
                                key={lang.code}
                                onSelect={() => i18n.changeLanguage(lang.code)}
                                className="cursor-pointer"
                              >
                                <span className="mr-2">{lang.flag}</span>
                                {lang.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">{t('settings.autoArchive')}</Label>
                          <p className="text-xs text-zinc-400">{t('settings.autoArchiveDesc')}</p>
                        </div>
                        <div className="flex h-6 items-center">
                          <input type="checkbox" className="sr-only peer" id="auto-archive" defaultChecked />
                          <label htmlFor="auto-archive" className="relative w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500 cursor-pointer"></label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">{t('settings.imeEnhance')}</Label>
                          <p className="text-xs text-zinc-400">{t('settings.imeEnhanceDesc')}</p>
                        </div>
                        <div className="flex h-6 items-center">
                          <input type="checkbox" className="sr-only peer" id="ime-enhance" />
                          <label htmlFor="ime-enhance" className="relative w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500 cursor-pointer"></label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* 外观设置 */}
                  <TabsContent value="appearance" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="pb-2 border-b">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('settings.appearanceSettings')}</h3>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold">{t('settings.themeMode')}</Label>
                        <div className="grid grid-cols-3 gap-3 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                          <Button 
                            variant="ghost"
                            onClick={() => setTheme("light")}
                            className={`flex flex-col items-center gap-2 py-3 h-auto rounded-lg transition-all ${resolvedTheme === "light" ? "bg-white dark:bg-zinc-800 shadow-sm text-emerald-600 hover:bg-white dark:hover:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"}`}
                          >
                            <Sun className="h-5 w-5" />
                            <span className="text-xs font-bold">{t('settings.light')}</span>
                          </Button>
                          <Button 
                            variant="ghost"
                            onClick={() => setTheme("dark")}
                            className={`flex flex-col items-center gap-2 py-3 h-auto rounded-lg transition-all ${resolvedTheme === "dark" ? "bg-white dark:bg-zinc-800 shadow-sm text-emerald-600 hover:bg-white dark:hover:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"}`}
                          >
                            <Moon className="h-5 w-5" />
                            <span className="text-xs font-bold">{t('settings.dark')}</span>
                          </Button>
                          <Button 
                            variant="ghost"
                            onClick={() => setTheme("system")}
                            className={`flex flex-col items-center gap-2 py-3 h-auto rounded-lg transition-all ${resolvedTheme === "system" ? "bg-white dark:bg-zinc-800 shadow-sm text-emerald-600 hover:bg-white dark:hover:bg-zinc-800" : "text-zinc-500 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"}`}
                          >
                            <Smartphone className="h-5 w-5" />
                            <span className="text-xs font-bold">{t('settings.system')}</span>
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-semibold">{t('settings.accentColor')}</Label>
                        <div className="flex flex-wrap gap-4">
                          {[
                            { id: "emerald", class: "bg-emerald-500", name: t('settings.default') },
                            { id: "purple", class: "bg-violet-500", name: t('settings.purple') },
                            { id: "blue", class: "bg-blue-500", name: t('settings.blue') },
                            { id: "pink", class: "bg-pink-500", name: t('settings.pink') },
                            { id: "orange", class: "bg-orange-500", name: t('settings.orange') },
                          ].map((color) => (
                            <Button
                              key={color.id}
                              variant="ghost"
                              onClick={() => setAccentColor(color.id)}
                              className="flex flex-col items-center gap-2 h-auto p-0 group hover:bg-transparent"
                            >
                              <div className={`w-8 h-8 rounded-full ${color.class} flex items-center justify-center transition-all ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 ${accentColor === color.id ? "ring-2 ring-zinc-400 scale-110" : "hover:scale-105"}`}>
                                {accentColor === color.id && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                              </div>
                              <span className={`text-[10px] font-bold ${accentColor === color.id ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 group-hover:text-zinc-600"}`}>{color.name}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* 账户设置 */}
                  <TabsContent value="account" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="pb-2 border-b">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('settings.accountSettings')}</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                            {isEmoji(userProfile.avatar) ? (
                              <span className="text-2xl">{userProfile.avatar}</span>
                            ) : (
                              <Image src={userProfile.avatar} alt={userProfile.name} width={48} height={48} className="object-cover w-full h-full" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{userProfile.name}</p>
                            <p className="text-xs text-zinc-400">{userProfile.email}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => {
                          setShowSettingsDialog(false);
                          setShowEditProfileDialog(true);
                        }}>{t('profile.manageProfile')}</Button>
                      </div>

                      <div className="flex items-center justify-between p-1">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">{t('profile.currentPlan')}</Label>
                          <p className="text-xs text-zinc-400">{t('settings.agreement.terms2Content')} {userProfile.plan}</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-9 text-emerald-600 border-emerald-100 hover:bg-emerald-50 dark:border-emerald-900/30 dark:hover:bg-emerald-950/20 font-bold" onClick={() => {
                          setShowSettingsDialog(false);
                          router.push("/pricing");
                        }}>{t('profile.upgradePlan')}</Button>
                      </div>

                      <div className="flex items-center justify-between p-1">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">{t('profile.twoFactor')}</Label>
                          <p className="text-xs text-zinc-400">{t('profile.twoFactorDesc')}</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-9 font-bold">{t('profile.configure')}</Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* MCP 设置 */}
                  <TabsContent value="mcp" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                    <MCPSettingsTab />
                  </TabsContent>

                  {/* 通知设置 */}
                  <TabsContent value="notifications" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="pb-2 border-b">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('settings.notificationSettings')}</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">{t('settings.desktopNotify')}</Label>
                          <p className="text-xs text-zinc-400">{t('settings.desktopNotifyDesc')}</p>
                        </div>
                        <div className="flex h-6 items-center">
                          <input type="checkbox" className="sr-only peer" id="desktop-notify" defaultChecked />
                          <label htmlFor="desktop-notify" className="relative w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500 cursor-pointer"></label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">{t('settings.soundNotify')}</Label>
                          <p className="text-xs text-zinc-400">{t('settings.soundNotifyDesc')}</p>
                        </div>
                        <div className="flex h-6 items-center">
                          <input type="checkbox" className="sr-only peer" id="sound-notify" />
                          <label htmlFor="sound-notify" className="relative w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500 cursor-pointer"></label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">{t('settings.emailNotify')}</Label>
                          <p className="text-xs text-zinc-400">{t('settings.emailNotifyDesc')}</p>
                        </div>
                        <div className="flex h-6 items-center">
                          <input type="checkbox" className="sr-only peer" id="email-notify" defaultChecked />
                          <label htmlFor="email-notify" className="relative w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500 cursor-pointer"></label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* 数据控制 */}
                  <TabsContent value="data" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="pb-2 border-b">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('settings.dataControl')}</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">{t('settings.chatHistory')}</Label>
                          <p className="text-xs text-zinc-400">{t('settings.chatHistoryDesc')}</p>
                        </div>
                        <div className="flex h-6 items-center">
                          <input type="checkbox" className="sr-only peer" id="data-train" defaultChecked />
                          <label htmlFor="data-train" className="relative w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500 cursor-pointer"></label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-1">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">{t('settings.exportData')}</Label>
                          <p className="text-xs text-zinc-400">{t('settings.exportDataDesc')}</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-9 gap-2 font-bold">
                          <Download className="h-4 w-4" /> {t('settings.export')}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-1">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold text-red-500">{t('settings.deleteAll')}</Label>
                          <p className="text-xs text-zinc-400">{t('settings.deleteAllDesc')}</p>
                        </div>
                        <Button variant="outline" size="sm" className="h-9 gap-2 text-red-500 border-red-100 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-950/20 font-bold">
                          <Trash2 className="h-4 w-4" /> {t('settings.deleteNow')}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* 无障碍设置 */}
                  <TabsContent value="accessibility" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="pb-2 border-b">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('settings.accessibilitySettings')}</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">{t('settings.highContrast')}</Label>
                          <p className="text-xs text-zinc-400">{t('settings.highContrastDesc')}</p>
                        </div>
                        <div className="flex h-6 items-center">
                          <input type="checkbox" className="sr-only peer" id="high-contrast" />
                          <label htmlFor="high-contrast" className="relative w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500 cursor-pointer"></label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold">{t('settings.screenReader')}</Label>
                          <p className="text-xs text-zinc-400">{t('settings.screenReaderDesc')}</p>
                        </div>
                        <div className="flex h-6 items-center">
                          <input type="checkbox" className="sr-only peer" id="screen-reader" />
                          <label htmlFor="screen-reader" className="relative w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-emerald-500 cursor-pointer"></label>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* 关于 */}
                  <TabsContent value="about" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="pb-2 border-b">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t('settings.aboutUxin')}</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-xl">
                          <Send className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('settings.aboutUxin')}</p>
                          <p className="text-sm text-zinc-400 font-medium mt-1">Version 1.2.0 (Stable)</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-between h-11 font-medium group" onClick={() => setShowUserAgreement(true)}>
                          {t('settings.userAgreement')} <ChevronUp className="h-4 w-4 rotate-90 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                        </Button>
                        <Button variant="outline" className="w-full justify-between h-11 font-medium group" onClick={() => setShowPrivacyAgreement(true)}>
                          {t('settings.privacyPolicy')} <ChevronUp className="h-4 w-4 rotate-90 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                        </Button>
                        <Button variant="outline" className="w-full justify-between h-11 font-medium group" onClick={() => setShowAboutDialog(true)}>
                          {t('settings.contactUs')} <ChevronUp className="h-4 w-4 rotate-90 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </div>
                
                {/* 底部按钮区域 */}
                <div className="px-6 py-4 border-t bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-end gap-3">
                  <Button variant="ghost" onClick={() => setShowSettingsDialog(false)} className="font-bold">{t('common.cancel')}</Button>
                  <Button 
                    onClick={() => {
                      toast({ type: "success", description: t('settings.saved') });
                      setShowSettingsDialog(false);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    {t('common.confirm')}
                  </Button>
                </div>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* 关于柚信弹窗 */}
      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('settings.aboutUxin')}</DialogTitle>
            <DialogDescription>
              {t('settings.aboutDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-zinc-600 dark:text-zinc-400">
            <p>{t('settings.version')}</p>
            <p className="mt-2">{t('settings.daoDesc')}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* 用户协议弹窗 */}
      <Dialog open={showUserAgreement} onOpenChange={setShowUserAgreement}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('settings.agreement.termsTitle')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('settings.agreement.terms1Title')}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[400px] overflow-y-auto pr-4 text-sm text-zinc-600 dark:text-zinc-400 space-y-4">
            <p className="font-bold">{t('settings.agreement.terms1Title')}</p>
            <p>{t('settings.agreement.terms1Content')}</p>
            <p className="font-bold">{t('settings.agreement.terms2Title')}</p>
            <p>{t('settings.agreement.terms2Content')}</p>
            <p className="font-bold">{t('settings.agreement.terms3Title')}</p>
            <p>{t('settings.agreement.terms3Content')}</p>
            <p>...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* 隐私协议弹窗 */}
      <Dialog open={showPrivacyAgreement} onOpenChange={setShowPrivacyAgreement}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('settings.agreement.privacyTitle')}</DialogTitle>
            <DialogDescription className="sr-only">
              {t('settings.agreement.privacyPolicyDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="h-[400px] overflow-y-auto pr-4 text-sm text-zinc-600 dark:text-zinc-400 space-y-4">
            <p className="font-bold">{t('settings.agreement.privacy1Title')}</p>
            <p>{t('settings.agreement.privacy1Content')}</p>
            <p className="font-bold">{t('settings.agreement.privacy2Title')}</p>
            <p>{t('settings.agreement.privacy2Content')}</p>
            <p className="font-bold">{t('settings.agreement.privacy3Title')}</p>
            <p>{t('settings.agreement.privacy3Content')}</p>
            <p>...</p>
          </div>
        </DialogContent>
      </Dialog>
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {showLoading ? (
              <SidebarMenuButton 
                className="h-12 justify-between bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!h-12 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
                onClick={(e) => {
                  if (state === "collapsed") {
                    e.stopPropagation();
                  }
                }}
              >
                <div className="flex flex-row gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
                  <div className="size-8 animate-pulse rounded-full bg-zinc-500/30" />
                  <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
                    <span className="h-3 w-20 animate-pulse rounded-md bg-zinc-500/30 text-transparent" />
                    <span className="h-2 w-12 animate-pulse rounded-md bg-zinc-500/30 text-transparent" />
                  </div>
                </div>
                <div className="animate-spin text-zinc-500 group-data-[collapsible=icon]:hidden">
                  <LoaderIcon />
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                className="h-12 bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!h-12 group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
                data-testid="user-nav-button"
                onClick={(e) => {
                  if (state === "collapsed") {
                    e.stopPropagation();
                  }
                }}
              >
                <div 
                  className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowAccountInfoDialog(true);
                  }}
                >
                  {isEmoji(userProfile.avatar) ? (
                    <div className="flex items-center justify-center size-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xl">
                      {userProfile.avatar}
                    </div>
                  ) : (
                    <Image
                      alt={userProfile.name}
                      className="rounded-full object-cover"
                      height={32}
                      src={userProfile.avatar}
                      width={32}
                    />
                  )}
                  <div className="flex flex-col items-start overflow-hidden group-data-[collapsible=icon]:hidden">
                    <span className="w-full truncate text-sm font-medium" data-testid="user-name">
                      {userProfile.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {userProfile.plan}
                    </span>
                  </div>
                </div>
                <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56"
            data-testid="user-nav-menu"
            side="top"
            align="start"
          >
            <DropdownMenuItem
              className="flex cursor-pointer flex-col items-start gap-0 py-2"
              onSelect={() => setShowEditProfileDialog(true)}
            >
              <div className="flex w-full items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{userProfile.email}</span>
              </div>
              <span className="ml-6 text-[10px] text-zinc-500">{t('profile.clickToEdit')}</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => router.push("/profile")}
            >
              <Home className="mr-2 h-4 w-4" />
              <span>{t('profile.home')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => router.push("/pricing")}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              <span>{t('profile.upgradePlan')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setShowSettingsDialog(true)}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('settings.settingsTitle')}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>{t('profile.help')}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() =>
                    router.push(`/?query=${encodeURIComponent("@uxin客服")}`)
                  }
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>{t('settings.contactUs')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => setShowAboutDialog(true)}
                >
                  <Info className="mr-2 h-4 w-4" />
                  <span>{t('settings.aboutUxin')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => setShowUserAgreement(true)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{t('settings.userAgreement')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => setShowPrivacyAgreement(true)}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  <span>{t('settings.privacyPolicy')}</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-500 dark:focus:bg-red-950"
              onSelect={() => {
                if (status === "loading") {
                  toast({
                    type: "error",
                    description: t('profile.checkingLogin'),
                  });
                  return;
                }
                if (isGuest) {
                  router.push("/login");
                } else {
                  setIsLoggingOut(true);
                  signOut({ callbackUrl: "/login" });
                }
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{isGuest ? t('navigation.login') : t('navigation.logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>

    {isLoggingOut && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        <div className="p-4 rounded-xl bg-white/80 shadow-lg border border-gray-100 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-[#1dbf73]" />
        </div>
      </div>
    )}
    </>
  );
}
