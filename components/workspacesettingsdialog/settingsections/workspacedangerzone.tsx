"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { deleteWorkspace } from "../actions";
import { Workspace } from "@/lib/db/tables/workspace";
import { useRouter } from "next/navigation";

export function WorkspaceDangerZone({ workspace }: { workspace: Workspace }) {
  const { ttt } = useLanguage();
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteWorkspace = async () => {
    if (confirmationText !== workspace.name) {
      setError(ttt("Workspace name doesn't match"));
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteWorkspace(workspace.workspaceid);
      if (result.success) {
        // Redirect to dashboard after successful deletion
        router.push("/d");
      } else {
        setError(result.error || ttt("Failed to delete workspace"));
      }
    } catch (deleteError) {
      console.error("Failed to delete workspace:", deleteError);
      setError(ttt("Failed to delete workspace"));
    } finally {
      setIsDeleting(false);
    }
  };

  const isConfirmationValid = confirmationText === workspace.name;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-red-600">{ttt("Danger Zone")}</h3>
        <p className="text-sm text-muted-foreground">
          {ttt("Irreversible and destructive actions.")}
        </p>
      </div>

      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-red-900">{ttt("Delete Workspace")}</h4>
            <p className="text-sm text-red-700 mt-1">
              {ttt("Once you delete a workspace, there is no going back. Please be certain.")}
            </p>
            <div className="mt-4">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                {ttt("Delete Workspace")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              {ttt("Delete Workspace")}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <div>
                {ttt("This action cannot be undone. This will permanently delete the workspace and remove all associated data.")}
              </div>
              <div>
                {ttt("Please type")} <strong>{workspace.name}</strong> {ttt("to confirm")}.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="confirmation">{ttt("Workspace name")}</Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={workspace.name}
              className="mt-2"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setConfirmationText("");
              setError(null);
            }}>
              {ttt("Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkspace}
              disabled={!isConfirmationValid || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? ttt("Deleting...") : ttt("Delete Workspace")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
