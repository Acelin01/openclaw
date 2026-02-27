"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Input,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  useSidebar,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@uxin/ui";
import { ChevronDown, Pencil, Pin, PlusCircle, Trash2, X, Check, Plus, Zap } from "lucide-react";
import { HelpCircle } from "lucide-react";
import { memo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";
import { AIIcon, SidebarLeftIcon } from "./icons";
import { SidebarToggle } from "./sidebar-toggle";
import { VisibilityType } from "./visibility-selector";

interface Project {
  id: string;
  name: string;
}

export interface ChatHeaderProps {
  chatId: string;
  selectedVisibilityType?: VisibilityType;
  isReadonly?: boolean;
  title?: string;
  isPinned?: boolean;
  initialProjectId?: string;
  projects?: Project[];
  isProjectsLoading?: boolean;
  onProjectChange?: (projectId: string | null) => void;
  isSkillsVisible?: boolean;
  setIsSkillsVisible?: (visible: boolean) => void;
  onTitleUpdate?: (title: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onTogglePin?: () => Promise<void>;
  onAddToProject?: (projectId: string) => Promise<void>;
  onNewChat?: () => void;
  isArtifactVisible?: boolean;
  className?: string;
}

export const ChatHeader = memo(
  ({
    chatId,
    selectedVisibilityType = "private",
    isReadonly = false,
    title: initialTitle,
    isPinned: initialIsPinned,
    initialProjectId,
    projects = [],
    isProjectsLoading = false,
    onProjectChange,
    isSkillsVisible = false,
    setIsSkillsVisible,
    onTitleUpdate,
    onDelete,
    onTogglePin,
    onAddToProject,
    onNewChat,
    isArtifactVisible = false,
    className,
  }: ChatHeaderProps) => {
    const { t } = useTranslation();
    const { toggleSidebar, open: isSidebarOpen } = useSidebar();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle || t("chat.newChat"));
    const [isPinned, setIsPinned] = useState(initialIsPinned || false);
    const [selectedProject, setSelectedProject] = useState<string | null>(initialProjectId || null);

    useEffect(() => {
      if (initialTitle) {
        setTitle(initialTitle);
      }
    }, [initialTitle]);

    useEffect(() => {
      setIsPinned(initialIsPinned || false);
    }, [initialIsPinned]);

    useEffect(() => {
      setSelectedProject(initialProjectId || null);
    }, [initialProjectId]);

    const handleTitleUpdate = async () => {
      if (!title.trim() || title === initialTitle) {
        setIsEditing(false);
        return;
      }
      try {
        if (onTitleUpdate) {
          await onTitleUpdate(title);
        }
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update title", error);
      }
    };

    const handleTogglePin = async () => {
      try {
        if (onTogglePin) {
          await onTogglePin();
        }
        setIsPinned(!isPinned);
      } catch (error) {
        console.error("Failed to toggle pin", error);
      }
    };

    const CombinedToggleNewButton = () => {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 px-2 flex items-center gap-1 hover:bg-black/5 rounded-xl border border-slate-200/50 shadow-sm bg-white/50"
              onClick={() => {
                toggleSidebar();
              }}
            >
              <div className="flex items-center gap-1">
                <SidebarLeftIcon size={14} className="text-slate-500" />
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start">
            <p>{t("chat.expandSidebar")}</p>
          </TooltipContent>
        </Tooltip>
      );
    };

    return (
      <header
        className={cn(
          "sticky top-0 z-20 flex items-center justify-between px-6 py-2 transition-all duration-300 bg-white border-b border-black/5",
          className,
        )}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {/* 1. 只有在菜单栏收起时显示复合按钮 */}
            {!isSidebarOpen && <CombinedToggleNewButton />}

            {/* 2. 在侧边栏收起且 Artifact 显示时，已经由 CombinedToggleNewButton 处理了 */}
            {/* 如果需要单独的 SidebarToggle 逻辑，可以根据需求保留或修改 */}
            {isSidebarOpen && isArtifactVisible && <SidebarToggle className="md:flex h-8 w-8" />}
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                className="h-8 w-64 font-bold text-lg bg-white/50 border-2 border-indigo-500/50 focus-visible:ring-8 focus-visible:ring-indigo-500/5 rounded-xl"
                onBlur={handleTitleUpdate}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleUpdate();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                onChange={(e) => setTitle(e.target.value)}
                value={title}
              />
            </div>
          ) : (
            <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
              {initialTitle && (
                <ChatActions
                  chatId={chatId}
                  title={title}
                  isPinned={isPinned}
                  initialProjectId={selectedProject || undefined}
                  projects={projects}
                  isProjectsLoading={isProjectsLoading}
                  onTitleUpdate={onTitleUpdate}
                  onDelete={onDelete}
                  onTogglePin={handleTogglePin}
                  onAddToProject={async (projectId) => {
                    if (onAddToProject) await onAddToProject(projectId);
                    setSelectedProject(projectId);
                    onProjectChange?.(projectId);
                  }}
                  onRenameClick={() => setIsEditing(true)}
                  trigger={
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-black/5 px-2 py-1 rounded-xl transition-all group min-w-0">
                      <span className="font-bold text-lg text-slate-900 tracking-tight truncate">
                        {title}
                      </span>
                      <ChevronDown className="size-4 text-slate-400 group-hover:text-slate-900 transition-colors flex-shrink-0" />
                    </div>
                  }
                />
              )}

              {selectedProject && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => onProjectChange?.(selectedProject)}
                  className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors px-2 -mt-1 h-auto py-0 font-bold flex items-center gap-1"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {projects.find((p) => p.id === selectedProject)?.name || t("chat.linkedProject")}
                </Button>
              )}
            </div>
          )}

          {isArtifactVisible && (
            <div className="flex items-center ml-auto gap-2">
              {setIsSkillsVisible && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 transition-all duration-300 rounded-xl border border-slate-200/50 shadow-sm",
                        isSkillsVisible
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 shadow-inner"
                          : "bg-white/80 hover:bg-white text-slate-500",
                      )}
                      onClick={() => setIsSkillsVisible(!isSkillsVisible)}
                    >
                      <Zap
                        size={16}
                        className={cn("stroke-[2.5]", isSkillsVisible && "fill-emerald-500")}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t("chat.aiSkills")}</TooltipContent>
                </Tooltip>
              )}

              {/* 暂时隐藏新建对话按钮以符合“初始不显示+icon”的要求 */}
              {/* <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white/80 hover:bg-white text-slate-500 border border-slate-200/50 shadow-sm rounded-xl"
                  onClick={onNewChat}
                >
                  <Plus size={16} className="stroke-[2.5]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('chat.newChat')}</TooltipContent>
            </Tooltip> */}
            </div>
          )}
        </div>
      </header>
    );
  },
);

export interface ChatActionsProps {
  chatId: string;
  title?: string;
  isPinned?: boolean;
  initialProjectId?: string;
  projects?: Project[];
  isProjectsLoading?: boolean;
  onTitleUpdate?: (title: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onTogglePin?: () => Promise<void>;
  onAddToProject?: (projectId: string) => Promise<void>;
  onRenameClick?: () => void;
  trigger?: React.ReactNode;
  align?: "start" | "end" | "center";
}

export const ChatActions = memo(
  ({
    chatId,
    title: initialTitle,
    isPinned: initialIsPinned,
    initialProjectId,
    projects = [],
    isProjectsLoading = false,
    onTitleUpdate,
    onDelete,
    onTogglePin,
    onAddToProject,
    onRenameClick,
    trigger,
    align = "start",
  }: ChatActionsProps) => {
    const { t } = useTranslation();
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [editTitle, setEditTitle] = useState(initialTitle || "");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string | null>(initialProjectId || null);

    useEffect(() => {
      setEditTitle(initialTitle || "");
    }, [initialTitle]);

    useEffect(() => {
      setSelectedProject(initialProjectId || null);
    }, [initialProjectId]);

    const handleRename = async () => {
      if (!editTitle.trim() || editTitle === initialTitle) {
        setIsRenameDialogOpen(false);
        return;
      }

      try {
        if (onTitleUpdate) {
          await onTitleUpdate(editTitle);
        }
        setIsRenameDialogOpen(false);
      } catch (error) {
        console.error("Failed to update title", error);
      }
    };

    const handleDelete = async () => {
      try {
        if (onDelete) {
          await onDelete();
        }
        setIsDeleteDialogOpen(false);
      } catch (error) {
        console.error("Failed to delete chat", error);
      }
    };

    const handleAddToProject = async (projectId: string) => {
      try {
        if (onAddToProject) {
          await onAddToProject(projectId);
        }
        setSelectedProject(projectId);
        setTimeout(() => setIsProjectDialogOpen(false), 500);
      } catch (error) {
        console.error("Failed to add to project", error);
      }
    };

    const handleTogglePin = async () => {
      try {
        if (onTogglePin) {
          await onTogglePin();
        }
      } catch (error) {
        console.error("Failed to toggle pin", error);
      }
    };

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {trigger || (
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align={align} className="w-48">
            <DropdownMenuItem
              onClick={() => {
                if (onRenameClick) {
                  onRenameClick();
                } else {
                  setIsRenameDialogOpen(true);
                }
              }}
            >
              <Pencil className="mr-2 size-4" />
              <span>{t("common.rename")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleTogglePin}>
              <Pin
                className={cn("mr-2 size-4", initialIsPinned && "fill-current text-[#19be6b]")}
              />
              <span>{initialIsPinned ? t("chat.unpin") : t("chat.pin")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsProjectDialogOpen(true)}>
              <PlusCircle className="mr-2 size-4" />
              <span>{t("chat.addToProject")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 size-4" />
              <span>{t("chat.deleteChat")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("chat.renameChat")}</DialogTitle>
              <DialogDescription>{t("chat.enterNewName")}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") setIsRenameDialogOpen(false);
                }}
                autoFocus
              />
            </div>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleRename} className="bg-[#19be6b] hover:bg-[#19be6b]/90">
                {t("common.confirm")}
              </Button>
            </AlertDialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("chat.deleteConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("chat.deleteConfirmDesc")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("chat.addToProject")}</DialogTitle>
              <DialogDescription>{t("chat.selectProjectDesc")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4 max-h-[300px] overflow-y-auto">
              {isProjectsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#19be6b]"></div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  {t("chat.noProjectsFound")}
                </div>
              ) : (
                projects.map((project) => (
                  <Button
                    key={project.id}
                    variant="outline"
                    className={cn(
                      "justify-between font-normal",
                      selectedProject === project.id &&
                        "border-[#19be6b] bg-[#f0fff4] text-[#19be6b]",
                    )}
                    onClick={() => handleAddToProject(project.id)}
                  >
                    {project.name}
                    {selectedProject === project.id && <Check className="size-4" />}
                  </Button>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);
