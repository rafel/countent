"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
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
import { Trash2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/uselanguage";
import { deleteCompany } from "../functions/actions";
import { Company } from "@/db/tables/company";

export function CompanyDangerZone({ company }: { company: Company }) {
  const { ttt } = useLanguage();
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteCompany = async () => {
    if (confirmText.toLowerCase() !== "delete") {
      setError(ttt("Please type 'delete' to confirm"));
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteCompany(company.companyid);
      if (result.success) {
        // Redirect to dashboard or handle success
        window.location.href = "/dashboard";
      } else {
        setError(ttt("Failed to delete company"));
      }
    } catch (error) {
      setError(ttt("Failed to delete company"));
    } finally {
      setIsDeleting(false);
    }
  };

  const canDelete = confirmText.toLowerCase() === "delete";

  return (
    <div className="space-y-6 pt-4">
      <div className="pb-4">
        <h3 className="text-lg font-medium text-destructive">
          {ttt("Danger Zone")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {ttt("Irreversible and destructive actions for your company")}
        </p>
      </div>

      <div className="border border-destructive/20 rounded-lg p-6 bg-destructive/5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-medium text-destructive mb-2">
              {ttt("Delete Company")}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {ttt("Permanently delete")} <strong>{company.name}</strong> .
              {ttt("This action cannot be undone and will remove data.")}
            </p>

            <div className="space-y-4">
              <div className="bg-background/50 border border-destructive/20 rounded p-4">
                <h5 className="font-medium text-sm mb-2">
                  {ttt("This will delete:")}
                </h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {ttt("All data associated with the company")}</li>
                  <li>
                    •{" "}
                    {ttt("No team members will be able to access the company or recover it")}
                  </li>
                  <li>
                    •{" "}
                    {ttt("The company and all its data will be permanently deleted")}
                  </li>
                </ul>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {ttt("Delete Company")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      {ttt("Delete Company")}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-3">
                        <p>
                          {ttt("You are about to permanently delete")}{" "}
                          <strong>{company.name}</strong>.
                        </p>
                        <p>
                          {ttt("This action")}{" "}
                          <strong>{ttt("cannot be undone")}</strong>{" "}
                          {ttt("and will permanently remove all data associated with this company")}
                          .
                        </p>
                        <div className="space-y-2">
                          <Label
                            htmlFor="confirm-delete"
                            className="text-sm font-medium"
                          >
                            {ttt("Type")} <strong>{ttt("delete")}</strong>{" "}
                            {ttt("to confirm:")}
                          </Label>
                          <Input
                            id="confirm-delete"
                            placeholder={ttt("Type 'delete' here")}
                            value={confirmText}
                            onChange={(e) => {
                              setConfirmText(e.target.value);
                              setError(null);
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
                        setConfirmText("");
                        setError(null);
                      }}
                    >
                      {ttt("Cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteCompany}
                      disabled={!canDelete || isDeleting}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeleting ? ttt("Deleting...") : ttt("Delete Company")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
