"use client";

import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import useSWRInfinite from "swr/infinite";
import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/hooks/use-language";
import { fetcher } from "@/lib/utils";
import type { Chat } from "@/lib/db/tables/chat";
import {
  renameChatAction,
  deleteChatAction,
} from "@/app/d/[workspaceid]/c/actions";
import Link from "next/link";

export function NavChats({ workspaceid }: { workspaceid: string }) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { ttt } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    chat: Chat | null;
    title: string;
  }>({
    open: false,
    chat: null,
    title: "",
  });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    chat: Chat | null;
  }>({
    open: false,
    chat: null,
  });

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Handle mobile sidebar close on navigation
  const handleMobileNavigation = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // SWR Infinite for pagination
  const getKey = (
    pageIndex: number,
    previousPageData: { chats: Array<Chat>; hasMore: boolean } | null
  ) => {
    if (previousPageData && !previousPageData.hasMore) return null; // reached the end
    const limit = 20;
    const offset = pageIndex * limit;
    return `/api/chats?limit=${limit}&offset=${offset}`;
  };

  const {
    data: pages,
    error,
    isLoading,
    mutate,
    size,
    setSize,
    isValidating,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
  });

  // Flatten all pages into a single array of chats and deduplicate by ID
  const allChats = pages?.flatMap((page) => page.chats) || [];
  const chats = allChats.filter(
    (chat, index, array) => array.findIndex((c) => c.id === chat.id) === index
  );
  const hasMore = pages?.[pages.length - 1]?.hasMore ?? false;

  // Helper function to check if a chat is currently active
  const isActiveChatId = (chatId: string) => {
    return pathname === `/d/${workspaceid}/c/${chatId}`;
  };

  // Check if we're on the new chat page (no specific chat ID)
  const isNewChatPage = pathname === `/d/${workspaceid}/c`;

  // Listen for new chat creation events
  useEffect(() => {
    const handleNewChat = (event: CustomEvent) => {
      const { workspaceid: eventWorkspaceId } = event.detail;
      // Only revalidate if the event is for the current workspace
      if (eventWorkspaceId === workspaceid) {
        mutate(); // Revalidate the chat list
      }
    };

    window.addEventListener("newChatCreated", handleNewChat as EventListener);
    return () => {
      window.removeEventListener(
        "newChatCreated",
        handleNewChat as EventListener
      );
    };
  }, [workspaceid, mutate]);

  // Infinite scroll effect - listen to the sidebar content scroll
  useEffect(() => {
    const handleScroll = () => {
      // Find the sidebar content element
      const sidebarContent = document.querySelector('[data-sidebar="content"]');
      if (!sidebarContent) return;

      const { scrollTop, scrollHeight, clientHeight } = sidebarContent;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200; // 200px threshold

      if (isNearBottom && hasMore && !isValidating) {
        setSize(size + 1);
      }
    };

    // Find the sidebar content element and add scroll listener
    const sidebarContent = document.querySelector('[data-sidebar="content"]');
    if (sidebarContent) {
      sidebarContent.addEventListener("scroll", handleScroll);
      return () => sidebarContent.removeEventListener("scroll", handleScroll);
    }
  }, [hasMore, isValidating, size, setSize]);

  // Handle rename chat
  const handleRename = (chat: Chat) => {
    setRenameDialog({
      open: true,
      chat,
      title: chat.title,
    });
    // Close dropdown on mobile
    if (isMobile) {
      setOpenDropdownId(null);
    }
  };

  // Handle delete chat
  const handleDelete = (chat: Chat) => {
    setDeleteDialog({
      open: true,
      chat,
    });
    // Close dropdown on mobile
    if (isMobile) {
      setOpenDropdownId(null);
    }
  };

  // Submit rename
  const handleRenameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!renameDialog.chat || !renameDialog.title.trim()) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("chatId", renameDialog.chat!.id);
      formData.append("title", renameDialog.title.trim());

      const result = await renameChatAction(formData);

      if (result.success) {
        // Optimistically update the cache
        mutate((pages) => {
          if (!pages) return pages;
          return pages.map((page) => ({
            ...page,
            chats: page.chats.map((chat: Chat) =>
              chat.id === renameDialog.chat!.id
                ? { ...chat, title: renameDialog.title.trim() }
                : chat
            ),
          }));
        }, false);

        setRenameDialog({ open: false, chat: null, title: "" });
      } else {
        console.error("Failed to rename chat:", result.error);
        // You could show a toast notification here
      }
    });
  };

  // Submit delete
  const handleDeleteSubmit = async () => {
    if (!deleteDialog.chat) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("chatId", deleteDialog.chat!.id);

      const result = await deleteChatAction(formData);

      if (result.success) {
        // Optimistically update the cache
        mutate((pages) => {
          if (!pages) return pages;
          return pages.map((page) => ({
            ...page,
            chats: page.chats.filter(
              (chat: Chat) => chat.id !== deleteDialog.chat!.id
            ),
          }));
        }, false);

        setDeleteDialog({ open: false, chat: null });

        // If we're currently viewing this chat, redirect to the chat list
        if (
          deleteDialog.chat &&
          window.location.pathname.includes(`/c/${deleteDialog.chat.id}`)
        ) {
          router.push(`/d/${workspaceid}/c`);
        }
      } else {
        console.error("Failed to delete chat:", result.error);
        // You could show a toast notification here
      }
    });
  };
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{ttt("Conversations")}</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="text-sidebar-foreground/70 cursor-pointer"
            isActive={isNewChatPage}
            onClick={() => {
              handleMobileNavigation();
            }}
          >
            <Link
              href={`/d/${workspaceid}/c`}
              className="flex items-center gap-2"
            >
              <Plus className="text-sidebar-foreground/70" />
              <span>{ttt("New Chat")}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <SidebarMenuItem key={`loading-${index}`}>
              <SidebarMenuButton>
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        ) : error ? (
          // Error state
          <SidebarMenuItem>
            <SidebarMenuButton className="text-muted-foreground">
              <span>
                {ttt("An unexpected error occurred. Please try again.")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          // Render chats from database
          chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <Link href={`/d/${workspaceid}/c/${chat.id}`}>
                <SidebarMenuButton
                  isActive={isActiveChatId(chat.id)}
                  className="cursor-pointer"
                  onClick={() => {
                    handleMobileNavigation();
                  }}
                >
                  <span className="truncate">{chat.title}</span>
                </SidebarMenuButton>
              </Link>
              <DropdownMenu
                open={openDropdownId === chat.id}
                onOpenChange={(open) =>
                  setOpenDropdownId(open ? chat.id : null)
                }
              >
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
                    onClick={() => handleRename(chat)}
                    disabled={isPending}
                  >
                    <Pencil className="text-muted-foreground" />
                    <span>{ttt("Rename")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-500 cursor-pointer"
                    onClick={() => handleDelete(chat)}
                    disabled={isPending}
                  >
                    <Trash2 className="text-red-500" />
                    <span>{ttt("Delete")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}

        {/* Loading indicator for infinite scroll */}
        {isValidating && chats.length > 0 && (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}

        {/* End of list indicator */}
        {!hasMore && chats.length > 0 && (
          <SidebarMenuItem>
            <div className="text-xs text-muted-foreground/70 text-left py-2 pl-2">
              End of conversations
            </div>
          </SidebarMenuItem>
        )}
      </SidebarMenu>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialog.open}
        onOpenChange={(open) =>
          setRenameDialog({ open, chat: null, title: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ttt("Rename")}</DialogTitle>
            <DialogDescription>
              {ttt("Enter a new name for this conversation")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">{ttt("Name")}</Label>
                <Input
                  id="title"
                  value={renameDialog.title}
                  onChange={(e) =>
                    setRenameDialog((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder={ttt("Enter name")}
                  disabled={isPending}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setRenameDialog({ open: false, chat: null, title: "" })
                }
                disabled={isPending}
              >
                {ttt("Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isPending || !renameDialog.title.trim()}
              >
                {isPending ? ttt("Saving...") : ttt("Save Changes")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, chat: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ttt("Delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {ttt("Are you sure you want to delete this conversation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {ttt("Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubmit}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? ttt("Deleting") : ttt("Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarGroup>
  );
}
