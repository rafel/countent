"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/hooks/uselanguage";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { LogOut, Trash2, AlertTriangle, Monitor } from "lucide-react";
import {
  logoutUser,
  logoutAllDevices,
  deleteUserAccount,
  getCurrentUserCompanies,
} from "../functions/actions";

interface OwnedCompany {
  companyid: string;
  name: string | null;
}

export function AccountSettings() {
  const { data: session } = useSession();
  const { ttt } = useLanguage();
  
  // State for logout operations
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  
  // State for delete account
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // State for owned companies
  const [ownedCompanies, setOwnedCompanies] = useState<OwnedCompany[]>([]);
  const [companiesToDelete, setCompaniesToDelete] = useState<string[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Fetch owned companies when delete dialog opens
  useEffect(() => {
    if (isDeleteDialogOpen) {
      fetchOwnedCompanies();
    }
  }, [isDeleteDialogOpen]);

  const fetchOwnedCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const result = await getCurrentUserCompanies();
      if (result.error) {
        setDeleteError(result.error);
      } else {
        setOwnedCompanies(result.ownedCompanies);
      }
    } catch (error) {
      setDeleteError(ttt("Something went wrong, please contact support"));
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
      // Redirect is handled by the server action
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setIsLoggingOutAll(true);
    try {
      await logoutAllDevices();
      // Redirect is handled by the server action
    } catch (error) {
      console.error("Logout all devices error:", error);
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDeleteText.toLowerCase() !== "delete") {
      setDeleteError(ttt("Please type 'delete' to confirm"));
      return;
    }

    // Check if user has unhandled companies
    const unhandledCompanies = ownedCompanies.filter(
      company => !companiesToDelete.includes(company.companyid)
    );

    if (unhandledCompanies.length > 0) {
      setDeleteError("You must decide what to do with all companies you own.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteUserAccount(companiesToDelete);
      if (result.success) {
        // Account deleted, user will be redirected
        window.location.href = "/";
      } else {
        setDeleteError(result.error || ttt("Something went wrong, please contact support"));
      }
    } catch (error) {
      setDeleteError(ttt("Something went wrong, please contact support"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCompanyDeleteToggle = (companyId: string, checked: boolean) => {
    if (checked) {
      setCompaniesToDelete(prev => [...prev, companyId]);
    } else {
      setCompaniesToDelete(prev => prev.filter(id => id !== companyId));
    }
  };

  const canDelete = confirmDeleteText.toLowerCase() === "delete" && 
    ownedCompanies.every(company => companiesToDelete.includes(company.companyid));

  return (
    <div className="space-y-6 pt-4">
      <div className="pb-4">
        <h3 className="text-lg font-medium">
          {ttt("Account")} {ttt("Settings")}
        </h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and logout options
        </p>
      </div>

      {/* Logout Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between py-4 border-b border-border/50">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Session Management</h4>
            <p className="text-xs text-muted-foreground">
              Sign out from your account
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? ttt("Loading team data...") : ttt("Log out")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogoutAllDevices}
              disabled={isLoggingOutAll}
            >
              <Monitor className="h-4 w-4 mr-2" />
              {isLoggingOutAll ? ttt("Loading team data...") : `${ttt("Log out")} from all devices`}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="border border-destructive/20 rounded-lg p-6 bg-destructive/5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-medium text-destructive mb-2">
              {ttt("Delete")} {ttt("Account")}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data.{" "}
              {ttt("This action cannot be undone.")}.
            </p>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {ttt("Delete")} {ttt("Account")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    {ttt("Delete")} {ttt("Account")}
                  </AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-4">
                      <p>
                        You are about to permanently delete your account.{" "}
                        <strong>{ttt("cannot be undone")}</strong>.
                      </p>

                      {isLoadingCompanies ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">
                            {ttt("Loading team data...")}
                          </p>
                        </div>
                      ) : ownedCompanies.length > 0 ? (
                        <div className="space-y-3">
                          <div className="bg-amber-50 border border-amber-200 rounded p-3">
                            <h5 className="font-medium text-sm mb-2 text-amber-800">
                              You own {ownedCompanies.length} compan{ownedCompanies.length === 1 ? 'y' : 'ies'}:
                            </h5>
                            <div className="space-y-2">
                              {ownedCompanies.map((company) => (
                                <label
                                  key={company.companyid}
                                  className="flex items-center space-x-2 text-sm"
                                >
                                  <Checkbox
                                    checked={companiesToDelete.includes(company.companyid)}
                                    onCheckedChange={(checked) =>
                                      handleCompanyDeleteToggle(company.companyid, checked as boolean)
                                    }
                                  />
                                  <span className="text-amber-700">
                                    {ttt("Delete")} <strong>{company.name || ttt("Unnamed Company")}</strong>
                                  </span>
                                </label>
                              ))}
                            </div>
                            <p className="text-xs text-amber-600 mt-2">
                              Unchecked companies will require you to transfer ownership first.
                            </p>
                          </div>
                        </div>
                      ) : null}

                      {deleteError && (
                        <div className="bg-destructive/10 border border-destructive text-destructive px-3 py-2 rounded text-sm">
                          {deleteError}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="confirm-delete" className="text-sm font-medium">
                          {ttt("Type")} <strong>{ttt("delete")}</strong> {ttt("to confirm:")}
                        </Label>
                        <Input
                          id="confirm-delete"
                          placeholder={ttt("Type 'delete' here")}
                          value={confirmDeleteText}
                          onChange={(e) => {
                            setConfirmDeleteText(e.target.value);
                            setDeleteError(null);
                          }}
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setConfirmDeleteText("");
                      setDeleteError(null);
                      setCompaniesToDelete([]);
                    }}
                  >
                    {ttt("Cancel")}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={!canDelete || isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting ? ttt("Deleting...") : `${ttt("Delete")} ${ttt("Account")}`}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
