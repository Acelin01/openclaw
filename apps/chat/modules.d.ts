declare module "@uxin/ui" {
  import {
    FC,
    ReactNode,
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    TextareaHTMLAttributes,
    HTMLAttributes,
  } from "react";

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
    children?: ReactNode;
  }
  export const Button: FC<ButtonProps>;

  export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    children?: ReactNode;
  }
  export const Input: FC<InputProps>;

  export interface BadgeProps {
    children?: ReactNode;
    variant?: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }
  export const Badge: FC<BadgeProps>;

  export interface SelectProps {
    children?: ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
  }
  export const Select: FC<SelectProps>;

  export interface SelectTriggerProps {
    children?: ReactNode;
    className?: string;
  }
  export const SelectTrigger: FC<SelectTriggerProps>;

  export interface SelectValueProps {
    placeholder?: string;
  }
  export const SelectValue: FC<SelectValueProps>;

  export interface SelectContentProps {
    children?: ReactNode;
  }
  export const SelectContent: FC<SelectContentProps>;

  export interface SelectItemProps {
    children?: ReactNode;
    value: string;
  }
  export const SelectItem: FC<SelectItemProps>;

  export interface LabelProps {
    children?: ReactNode;
    className?: string;
  }
  export const Label: FC<LabelProps>;

  export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    children?: ReactNode;
  }
  export const Textarea: FC<TextareaProps>;

  export interface TabsProps {
    children?: ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
  }
  export const Tabs: FC<TabsProps>;
  export const TabsList: FC<HTMLAttributes<HTMLDivElement>>;
  export const TabsTrigger: FC<HTMLAttributes<HTMLButtonElement> & { value?: string }>;
  export const TabsContent: FC<HTMLAttributes<HTMLDivElement> & { value?: string }>;

  export const DropdownMenu: FC<{ children?: ReactNode }>;
  export const DropdownMenuTrigger: FC<{ children?: ReactNode; asChild?: boolean }>;
  export const DropdownMenuContent: FC<{ children?: ReactNode; className?: string; align?: string } & HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuItem: FC<{ children?: ReactNode; className?: string; onSelect?: (event: any) => void } & HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuCheckboxItem: FC<{ children?: ReactNode; checked?: boolean } & HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuRadioItem: FC<{ children?: ReactNode; value?: string } & HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuLabel: FC<{ children?: ReactNode } & HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuSeparator: FC<HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuShortcut: FC<HTMLAttributes<HTMLSpanElement>>;
  export const DropdownMenuGroup: FC<{ children?: ReactNode }>;
  export const DropdownMenuPortal: FC<{ children?: ReactNode }>;
  export const DropdownMenuSub: FC<{ children?: ReactNode }>;
  export const DropdownMenuSubContent: FC<{ children?: ReactNode } & HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuSubTrigger: FC<{ children?: ReactNode } & HTMLAttributes<HTMLDivElement>>;
  export const DropdownMenuRadioGroup: FC<{ children?: ReactNode; value?: string; onValueChange?: (value: string) => void }>;

  export const Avatar: FC<{ children?: ReactNode; className?: string }>;
  export const AvatarImage: FC<{ src?: string; alt?: string; className?: string }>;
  export const AvatarFallback: FC<{ children?: ReactNode; className?: string }>;

  export const Dialog: FC<{ children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
  export const DialogContent: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const DialogHeader: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const DialogTitle: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLHeadingElement>>;
  export const DialogDescription: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLParagraphElement>>;
  export const DialogFooter: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const DialogTrigger: FC<{ children?: ReactNode; asChild?: boolean }>;
  export const DialogPortal: FC<{ children?: ReactNode }>;
  export const DialogOverlay: FC<{ className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const DialogClose: FC<{ children?: ReactNode; asChild?: boolean }>;

  export const AlertDialog: FC<{ children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
  export const AlertDialogPortal: FC<{ children?: ReactNode }>;
  export const AlertDialogOverlay: FC<{ className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const AlertDialogTrigger: FC<{ children?: ReactNode; asChild?: boolean }>;
  export const AlertDialogContent: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const AlertDialogHeader: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const AlertDialogFooter: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const AlertDialogTitle: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLHeadingElement>>;
  export const AlertDialogDescription: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLParagraphElement>>;
  export const AlertDialogAction: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLButtonElement>>;
  export const AlertDialogCancel: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLButtonElement>>;

  export const Sheet: FC<{ children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
  export const SheetPortal: FC<{ children?: ReactNode }>;
  export const SheetOverlay: FC<{ className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const SheetTrigger: FC<{ children?: ReactNode; asChild?: boolean }>;
  export const SheetClose: FC<{ children?: ReactNode; asChild?: boolean }>;
  export const SheetContent: FC<{ children?: ReactNode; className?: string; side?: "top" | "right" | "bottom" | "left" } & HTMLAttributes<HTMLDivElement>>;
  export const SheetHeader: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const SheetFooter: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const SheetTitle: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLHeadingElement>>;
  export const SheetDescription: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLParagraphElement>>;

  export const Tooltip: FC<{ children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
  export const TooltipTrigger: FC<{ children?: ReactNode; asChild?: boolean }>;
  export const TooltipContent: FC<{ children?: ReactNode; className?: string; side?: string; align?: string } & HTMLAttributes<HTMLDivElement>>;
  export const TooltipProvider: FC<{ children?: ReactNode; delayDuration?: number }>;

  export const Card: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const CardHeader: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const CardFooter: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const CardTitle: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLHeadingElement>>;
  export const CardDescription: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLParagraphElement>>;
  export const CardContent: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;

  export const Progress: FC<{ value?: number; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const Separator: FC<{ orientation?: "horizontal" | "vertical"; decorative?: boolean; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const ScrollArea: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;
  export const ScrollBar: FC<{ orientation?: "horizontal" | "vertical"; className?: string } & HTMLAttributes<HTMLDivElement>>;

  export const Collapsible: FC<{ children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
  export const CollapsibleTrigger: FC<{ children?: ReactNode; asChild?: boolean }>;
  export const CollapsibleContent: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;

  export const HoverCard: FC<{ children?: ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }>;
  export const HoverCardTrigger: FC<{ children?: ReactNode; asChild?: boolean }>;
  export const HoverCardContent: FC<{ children?: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>>;

  export const Checkbox: FC<{ checked?: boolean; onCheckedChange?: (checked: boolean) => void; className?: string } & HTMLAttributes<HTMLButtonElement>>;

  export const SidebarProvider: FC<{ children?: ReactNode; defaultOpen?: boolean }>;
  export function useSidebar(): {
    state?: "expanded" | "collapsed";
    open?: boolean;
    setOpen?: (open: boolean) => void;
    openMobile?: boolean;
    setOpenMobile?: (open: boolean) => void;
    isMobile?: boolean;
    toggleSidebar: () => void;
  };

  export function useToast(): {
    toast: (props: { title?: string; description?: string; variant?: string }) => void;
  };

  export function cn(...inputs: any[]): string;
  export function isEmoji(str: string | null | undefined): boolean;
}
