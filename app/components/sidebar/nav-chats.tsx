"use client";

import {
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Share,
  Trash2,
  Palette,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/app/components/ui/sidebar";
import { useLanguage } from "@/hooks/uselanguage";
import { useChatActions } from "@/hooks/usechatactions";
import { Chat } from "@/db/tables/chat";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/app/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useRouter, usePathname } from "next/navigation";

interface NavChatsProps {
  chats?: Chat[];
  currentCompanyId?: string;
}

export function NavChats({ 
  chats = [], 
  currentCompanyId,
}: NavChatsProps) {
  const { isMobile } = useSidebar();
  const { ttt } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract current chat ID from pathname
  const currentChatId = pathname.includes('/chat/') ? pathname.split('/chat/')[1] : null;
  
  // State for dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [renameChatId, setRenameChatId] = useState("");
  const [renameTitle, setRenameTitle] = useState("");

  // Always call the hook, but with a fallback value
  const chatActions = useChatActions(currentCompanyId || "");

  const handleDeleteClick = (chatId: string) => {
    setChatToDelete(chatId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (chatToDelete && chatActions) {
      await chatActions.deleteChat(chatToDelete);
    }
    setDeleteDialogOpen(false);
    setChatToDelete(null);
  };

  const handleChatClick = (chatId: string) => {
    if (currentCompanyId) {
      router.push(`/dashboard/${currentCompanyId}/chat/${chatId}`);
    }
  };

  const handleCreateClick = () => {
    if (chatActions && currentCompanyId) {
      // Generate a date-based title
      const now = new Date();
      const dateTitle = `Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      
      chatActions.createChat(dateTitle);
    }
  };

  const handleTemplateClick = () => {
    if (currentCompanyId) {
      router.push(`/dashboard/${currentCompanyId}/chat/template`);
    }
  };


  const handleRenameClick = (chatId: string, currentTitle: string) => {
    setRenameChatId(chatId);
    setRenameTitle(currentTitle);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (!renameTitle.trim() || !chatActions) return;

    const result = await chatActions.renameChat(renameChatId, renameTitle);
    if (result.success) {
      setRenameDialogOpen(false);
      setRenameChatId("");
      setRenameTitle("");
    }
  };
  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>{ttt("Conversations")}</SidebarGroupLabel>
        <SidebarMenuItem>
          <SidebarMenuButton 
            className="text-sidebar-foreground/70 cursor-pointer"
            onClick={handleCreateClick}
          >
            <Plus className="text-sidebar-foreground/70" />
            <span>{ttt("New Chat")}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton 
            className="text-sidebar-foreground/70 cursor-pointer"
            onClick={handleTemplateClick}
            isActive={pathname.includes('/chat/template')}
          >
            <Palette className="text-sidebar-foreground/70" />
            <span>Template Preview</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.chatid}>
              <SidebarMenuButton 
                className="cursor-pointer"
                onClick={() => handleChatClick(chat.chatid)}
                isActive={chat.chatid === currentChatId}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="truncate">{chat.title}</span>
                {chat.isshared && (
                  <Share className="h-3 w-3 ml-auto text-muted-foreground" />
                )}
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">{ttt("More")}</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => handleRenameClick(chat.chatid, chat.title)}
                  >
                    <Pencil className="text-muted-foreground" />
                    <span>{ttt("Rename")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-500 cursor-pointer"
                    onClick={() => handleDeleteClick(chat.chatid)}
                  >
                    <Trash2 className="text-red-500" />
                    <span>{ttt("Delete")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
          {chats.length > 5 && (
            <SidebarMenuItem>
              <SidebarMenuButton className="text-sidebar-foreground/70">
                <MoreHorizontal className="text-sidebar-foreground/70" />
                <span>{ttt("More")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroup>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Rename Chat Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new title for this chat.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rename-title" className="text-right">
                Title
              </Label>
              <Input
                id="rename-title"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameSubmit();
                  }
                }}
                className="col-span-3"
                disabled={chatActions?.isRenaming}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setRenameDialogOpen(false)}
              disabled={chatActions?.isRenaming}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleRenameSubmit}
              disabled={!renameTitle.trim() || chatActions?.isRenaming}
            >
              {chatActions?.isRenaming ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
