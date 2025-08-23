"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
  CheckCircle,
  XCircle,
  Building2,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { acceptInvite, declineInvite, redirectToDashboard } from "../actions";
import {
  WorkspaceInvite,
  WorkspaceInviteWithWorkspaceAndInviter,
} from "@/lib/db/tables/workspace";

export function InviteAcceptance({
  invites,
}: {
  invites: WorkspaceInviteWithWorkspaceAndInviter[];
}) {
  const { ttt } = useLanguage();
  const [remainingInvites, setRemainingInvites] = useState(invites);
  const [processingInvite, setProcessingInvite] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteToDecline, setInviteToDecline] =
    useState<WorkspaceInviteWithWorkspaceAndInviter | null>(null);

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

  const handleAccept = async (invite: WorkspaceInvite) => {
    setProcessingInvite(invite.inviteid);
    setError(null);

    try {
      const result = await acceptInvite(invite.inviteid);

      if (result.success) {
        // Remove this invite from the list
        const updatedInvites = remainingInvites.filter(
          (i) => i.inviteid !== invite.inviteid
        );
        setRemainingInvites(updatedInvites);

        // If no more invites, redirect to dashboard
        if (updatedInvites.length === 0) {
          await redirectToDashboard();
        }
      } else {
        setError(result.error || "Failed to accept invitation");
      }
    } catch {
      setError("Failed to accept invitation");
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleDeclineConfirm = async () => {
    if (!inviteToDecline) return;

    setProcessingInvite(inviteToDecline.inviteid);
    setError(null);

    try {
      const result = await declineInvite(inviteToDecline.inviteid);

      if (result.success) {
        // Remove this invite from the list
        const updatedInvites = remainingInvites.filter(
          (i) => i.inviteid !== inviteToDecline.inviteid
        );
        setRemainingInvites(updatedInvites);
        setInviteToDecline(null);

        // If no more invites, redirect to dashboard
        if (updatedInvites.length === 0) {
          await redirectToDashboard();
        }
      } else {
        setError(result.error || "Failed to decline invitation");
      }
    } catch {
      setError("Failed to decline invitation");
    } finally {
      setProcessingInvite(null);
    }
  };

  if (remainingInvites.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          {ttt("All Invitations Processed")}
        </h2>
        <p className="text-muted-foreground mb-4">
          {ttt("You have responded to all pending invitations.")}
        </p>
        <Button onClick={() => redirectToDashboard()}>
          {ttt("Continue to Dashboard")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold">{ttt("Company Invitations")}</h1>
        <p className="text-muted-foreground mb-4">
          {ttt("You have an invitation")},{" "}
          {ttt("Please review and respond to each invitation below.")}
        </p>
      </div>
      <div className="space-y-6 px-4 sm:px-0">
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

        {remainingInvites.map((invite) => (
          <Card key={invite.inviteid}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {invite.workspace.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{ttt("Role")}:</span>
                    <Badge
                      variant={getRoleBadgeVariant(invite.role)}
                      className="flex items-center gap-1"
                    >
                      {getRoleIcon(invite.role)}
                      {invite.role.charAt(0).toUpperCase() +
                        invite.role.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Invited {new Date(invite.createdat).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">{ttt("Invited by")}:</span>
                    <div className="text-muted-foreground">
                      {invite.inviter.email} {invite.inviter.name}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleAccept(invite)}
                  disabled={processingInvite === invite.inviteid}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {processingInvite === invite.inviteid
                    ? ttt("Accepting...")
                    : ttt("Accept")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setInviteToDecline(invite)}
                  disabled={processingInvite === invite.inviteid}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {ttt("Decline")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Decline Confirmation Dialog */}
        <AlertDialog
          open={!!inviteToDecline}
          onOpenChange={() => setInviteToDecline(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{ttt("Decline Invitation")}</AlertDialogTitle>
              <AlertDialogDescription>
                {ttt("Are you sure you want to decline the invitation?")}{" "}
                {ttt(
                  "This action cannot be undone, and you would need to be invited again to join this company."
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{ttt("Cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeclineConfirm}
                className="bg-destructive hover:bg-destructive/90"
              >
                {ttt("Decline Invitation")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
