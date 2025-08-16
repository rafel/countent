"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Crown,
  Shield,
  User,
  Mail,
  Trash2,
  UserCog,
} from "lucide-react";
import { useLanguage } from "@/hooks/uselanguage";
import {
  getCompanyUsers,
  getPendingInvites,
  inviteUserToCompany,
  removeUserFromCompany,
  updateUserRole,
} from "../functions/actions";

interface CompanyUser {
  userid: string;
  name: string | null;
  email: string;
  role: string;
  companyuserid: string;
  canManage?: boolean;
  currentUserRole?: string;
}

interface PendingInvite {
  inviteid: string;
  email: string;
  role: string;
  createdat: Date;
  inviterName: string | null;
  inviterEmail: string;
}

export function CompanyTeam({ companyId }: { companyId: string }) {
  const { ttt } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [isInviting, setIsInviting] = useState(false);

  // Dialog states
  const [userToRemove, setUserToRemove] = useState<CompanyUser | null>(null);
  const [userToPromote, setUserToPromote] = useState<CompanyUser | null>(null);

  // Fetch company users and invites
  useEffect(() => {
    async function fetchData() {
      if (companyId) {
        setIsLoading(true);
        setError(null);
        try {
          const [companyUsers, invites] = await Promise.all([
            getCompanyUsers(companyId),
            getPendingInvites(companyId),
          ]);

          setUsers(companyUsers);
          setPendingInvites(invites);

          // Set current user role from the first user's data
          if (companyUsers.length > 0) {
            setCurrentUserRole(companyUsers[0].currentUserRole || "");
          }
        } catch (error) {
          console.error("Error fetching team data:", error);
          setError(ttt("Failed to load team data"));
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchData();
  }, [companyId, ttt]);

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return <Crown className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      case "user":
        return "outline";
      default:
        return "outline";
    }
  };

  const canInvite = ["owner", "admin"].includes(currentUserRole);
  // Cannot invite as owner - ownership transfer only available for existing members

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const result = await inviteUserToCompany(
        companyId,
        inviteEmail,
        inviteRole
      );
      if (result.success) {
        setInviteEmail("");
        setInviteRole("user");
        // Refresh data
        const [companyUsers, invites] = await Promise.all([
          getCompanyUsers(companyId),
          getPendingInvites(companyId),
        ]);
        setUsers(companyUsers);
        setPendingInvites(invites);
      } else {
        setError(ttt("Failed to invite user"));
      }
    } catch {
      setError(ttt("Failed to invite user"));
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!userToRemove) return;

    try {
      const result = await removeUserFromCompany(
        companyId,
        userToRemove.userid
      );
      if (result.success) {
        // Refresh users
        const companyUsers = await getCompanyUsers(companyId);
        setUsers(companyUsers);
        setUserToRemove(null);
      } else {
        setError(ttt("Failed to remove user"));
      }
    } catch {
      setError(ttt("Failed to remove user"));
    }
  };

  const handlePromoteToOwner = async () => {
    if (!userToPromote) return;

    try {
      const result = await updateUserRole(
        companyId,
        userToPromote.userid,
        "owner"
      );
      if (result.success) {
        // Refresh users
        const companyUsers = await getCompanyUsers(companyId);
        setUsers(companyUsers);
        setCurrentUserRole("admin"); // Current user becomes admin
        setUserToPromote(null);
      } else {
        setError(ttt("Failed to transfer ownership"));
      }
    } catch {
      setError(ttt("Failed to transfer ownership"));
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const result = await updateUserRole(companyId, userId, newRole);
      if (result.success) {
        // Refresh users
        const companyUsers = await getCompanyUsers(companyId);
        setUsers(companyUsers);

        // If we changed our own role to something else from owner
        if (newRole === "owner") {
          setCurrentUserRole("admin");
        }
      } else {
        setError(ttt("Failed to update role"));
      }
    } catch {
      setError(ttt("Failed to update role"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">
          {ttt("Loading team data...")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {error}
          <Button
            variant="outline"
            size="sm"
            className="ml-2 h-6"
            onClick={() => setError(null)}
          >
            {ttt("Dismiss")}
          </Button>
        </div>
      )}

      {/* Team Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            {ttt("Team")} Members ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {ttt("No team members found")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{ttt("Name")}</TableHead>
                  <TableHead>{ttt("Email")}</TableHead>
                  <TableHead>{ttt("Role")}</TableHead>
                  <TableHead className="text-right">{ttt("Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.companyuserid}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        {user.name || "No Name"}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.canManage && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Role change options */}
                            {user.role !== "admin" &&
                              currentUserRole === "owner" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRoleChange(user.userid, "admin")
                                  }
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  {ttt("Make Admin")}
                                </DropdownMenuItem>
                              )}
                            {user.role !== "user" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(user.userid, "user")
                                }
                              >
                                <User className="h-4 w-4 mr-2" />
                                {ttt("Make User")}
                              </DropdownMenuItem>
                            )}
                            {user.role !== "owner" &&
                              currentUserRole === "owner" && (
                                <DropdownMenuItem
                                  onClick={() => setUserToPromote(user)}
                                >
                                  <Crown className="h-4 w-4 mr-2" />
                                  {ttt("Transfer Ownership")}
                                </DropdownMenuItem>
                              )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setUserToRemove(user)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {ttt("Remove")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {ttt("Pending Invitations")} ({pendingInvites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{ttt("Email")}</TableHead>
                  <TableHead>{ttt("Role")}</TableHead>
                  <TableHead>{ttt("Invited By")}</TableHead>
                  <TableHead>{ttt("Date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((invite) => (
                  <TableRow key={invite.inviteid}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(invite.role)}>
                        {invite.role.charAt(0).toUpperCase() +
                          invite.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invite.inviterName || invite.inviterEmail}
                    </TableCell>
                    <TableCell>
                      {new Date(invite.createdat).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Invite New Member */}
      {canInvite && (
        <Card>
          <CardHeader>
            <CardTitle>{ttt("Invite New Member")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">{ttt("Email Address")} *</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder={ttt("Enter email address")}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">{ttt("Role")}</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue placeholder={ttt("Select Role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{ttt("Admin")}</SelectItem>
                    <SelectItem value="user">{ttt("User")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleInvite}
                disabled={isInviting || !inviteEmail.trim()}
              >
                {isInviting ? ttt("Sending...") : ttt("Send Invitation")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Remove User Confirmation Dialog */}
      <AlertDialog
        open={!!userToRemove}
        onOpenChange={() => setUserToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ttt("Remove Team Member")}</AlertDialogTitle>
            <AlertDialogDescription>
              {ttt("Are you sure you want to remove")}{" "}
              {userToRemove?.name || userToRemove?.email}{" "}
              {ttt("from this company? This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{ttt("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              {ttt("Remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Transfer Ownership Confirmation Dialog */}
      <AlertDialog
        open={!!userToPromote}
        onOpenChange={() => setUserToPromote(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ttt("Transfer Ownership")}</AlertDialogTitle>
            <AlertDialogDescription>
              {ttt("Are you sure you want to transfer ownership to")}{" "}
              {userToPromote?.name || userToPromote?.email}?{" "}
              {ttt("You will become an admin and lose owner privileges. This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{ttt("Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePromoteToOwner}
              className="bg-destructive hover:bg-destructive/90"
            >
              {ttt("Transfer Ownership")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
