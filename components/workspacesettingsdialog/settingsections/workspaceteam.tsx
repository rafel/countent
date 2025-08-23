"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import {
  Crown,
  Shield,
  User,
  Mail,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import {
  getWorkspaceUsers,
  getPendingWorkspaceInvites,
  inviteUserToWorkspace,
  removeUserFromWorkspace,
  updateUserWorkspaceRole,
} from "../actions";
import { LoadingSpinner } from "@/components/ui/loading";
import {
  WorkspaceUserRole,
  WorkspaceUser,
  WorkspaceInvite,
} from "@/lib/db/schema";

function getRoleIcon(role: WorkspaceUserRole) {
  switch (role) {
    case "owner":
      return <Crown className="h-4 w-4 text-yellow-500" />;
    case "admin":
      return <Shield className="h-4 w-4 text-blue-500" />;
    case "member":
      return <User className="h-4 w-4 text-green-500" />;
    case "guest":
      return <User className="h-4 w-4 text-gray-500" />;
    default:
      return <User className="h-4 w-4" />;
  }
}

function getRoleBadgeVariant(role: WorkspaceUserRole) {
  switch (role) {
    case "owner":
      return "default" as const;
    case "admin":
      return "secondary" as const;
    case "member":
      return "outline" as const;
    case "guest":
      return "outline" as const;
    default:
      return "outline" as const;
  }
}

export function WorkspaceTeam({ workspaceId }: { workspaceId: string }) {
  const { ttt } = useLanguage();
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceUserRole>("member");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removeUserId, setRemoveUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [usersResult, invitesResult] = await Promise.all([
        getWorkspaceUsers(workspaceId),
        getPendingWorkspaceInvites(workspaceId),
      ]);

      if (usersResult.success) {
        setUsers(usersResult.data || ([] as WorkspaceUser[]));
      }
      if (invitesResult.success) {
        setInvites(invitesResult.data || ([] as WorkspaceInvite[]));
      }
    } catch (loadError) {
      console.error("Failed to load workspace data:", loadError);
      setError(ttt("Failed to load workspace data"));
    } finally {
      setLoading(false);
    }
  }, [workspaceId, ttt]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    setInviteLoading(true);
    setError(null);

    try {
      const result = await inviteUserToWorkspace(
        workspaceId,
        inviteEmail,
        inviteRole
      );
      if (result.success) {
        setInviteEmail("");
        setInviteRole("member");
        await loadData(); // Reload to show new invite
      } else {
        setError(result.error || ttt("Failed to send invite"));
      }
    } catch (inviteError) {
      console.error("Failed to send invite:", inviteError);
      setError(ttt("Failed to send invite"));
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const result = await removeUserFromWorkspace(workspaceId, userId);
      if (result.success) {
        await loadData(); // Reload to update list
      } else {
        setError(result.error || ttt("Failed to remove user"));
      }
    } catch (removeError) {
      console.error("Failed to remove user:", removeError);
      setError(ttt("Failed to remove user"));
    }
    setRemoveUserId(null);
  };

  const handleUpdateRole = async (
    userId: string,
    newRole: WorkspaceUserRole
  ) => {
    try {
      const result = await updateUserWorkspaceRole(
        workspaceId,
        userId,
        newRole
      );
      if (result.success) {
        await loadData(); // Reload to update roles
      } else {
        setError(result.error || ttt("Failed to update role"));
      }
    } catch (updateError) {
      console.error("Failed to update role:", updateError);
      setError(ttt("Failed to update role"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{ttt("Team Management")}</h3>
        <p className="text-sm text-muted-foreground">
          {ttt("Manage workspace members and their roles.")}
        </p>
      </div>

      {/* Invite New User */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h4 className="font-medium">{ttt("Invite New Member")}</h4>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="email">{ttt("Email Address")}</Label>
            <Input
              id="email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder={ttt("Enter email address")}
            />
          </div>
          <div className="w-32">
            <Label htmlFor="role">{ttt("Role")}</Label>
            <Select
              value={inviteRole}
              onValueChange={(value: WorkspaceUserRole) => setInviteRole(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">{ttt("Member")}</SelectItem>
                <SelectItem value="admin">{ttt("Admin")}</SelectItem>
                <SelectItem value="guest">{ttt("Guest")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleInviteUser}
              disabled={inviteLoading || !inviteEmail.trim()}
            >
              {inviteLoading ? ttt("Sending...") : ttt("Send Invite")}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Current Members */}
      <div className="space-y-4">
        <h4 className="font-medium">
          {ttt("Current Members")} ({users.length})
        </h4>
        <div className="space-y-2">
          {users.map((userWithRole) => (
            <div
              key={userWithRole.userid}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getRoleIcon(userWithRole.role)}
                <div>
                  <div className="font-medium">{userWithRole.role}</div>
                  <div className="text-sm text-muted-foreground">
                    {userWithRole.userid}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getRoleBadgeVariant(userWithRole.role)}>
                  {userWithRole.role}
                </Badge>
                {userWithRole.role !== "owner" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateRole(userWithRole.userid, "admin")
                        }
                        disabled={userWithRole.role === "admin"}
                      >
                        {ttt("Make Admin")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateRole(userWithRole.userid, "member")
                        }
                        disabled={userWithRole.role === "member"}
                      >
                        {ttt("Make Member")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateRole(userWithRole.userid, "guest")
                        }
                        disabled={userWithRole.role === "guest"}
                      >
                        {ttt("Make Guest")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setRemoveUserId(userWithRole.userid)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {ttt("Remove")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">
            {ttt("Pending Invites")} ({invites.length})
          </h4>
          <div className="space-y-2">
            {invites.map((invite) => (
              <div
                key={invite.inviteid}
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{invite.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {ttt("Invited by")} {invite.invitedby}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{invite.role}</Badge>
                  <Badge variant="secondary">{ttt("Pending Invites")}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remove User Confirmation Dialog */}
      <AlertDialog
        open={!!removeUserId}
        onOpenChange={() => setRemoveUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ttt("Remove User")}</AlertDialogTitle>
            <AlertDialogDescription>
              {ttt(
                "Are you sure you want to remove this user from the workspace? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{ttt("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removeUserId && handleRemoveUser(removeUserId)}
              className="bg-red-600 hover:bg-red-700"
            >
              {ttt("Remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
