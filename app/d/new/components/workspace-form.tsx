"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { Building2, User } from "lucide-react";
import { workspaceIcons } from "@/components/shared/workspace-icons";
import { createWorkspaceAction, redirectToWorkspace } from "../actions";
import { useFormStatus } from "react-dom";
import { useLanguage } from "@/hooks/use-language";

// Validation schema

function SubmitButton() {
  const { pending } = useFormStatus();
  const { ttt } = useLanguage();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? ttt("Creating Workspace") : ttt("Create Workspace")}
    </Button>
  );
}

export function WorkspaceForm({ hasWorkspace }: { hasWorkspace: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [selectedIcon, setSelectedIcon] = useState<string>("briefcase");
  const [selectedType, setSelectedType] = useState<string>("personal");
  const { ttt } = useLanguage();


  const workspaceSchema = z.object({
    name: z
      .string()
      .min(1, ttt("Workspace name is required"))
      .max(255, ttt("Name must be 255 characters or less")),
    type: z.enum(["personal", "company"]),
    icon: z.string().min(1),
  });

  async function handleAction(formData: FormData) {
    setError(null);
    setValidationErrors({});

    // Extract form data for validation
    const formValues = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      icon: formData.get("icon") as string,
    };

    // Validate with Zod
    const validation = workspaceSchema.safeParse(formValues);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    const result = await createWorkspaceAction(formData);

    if (result.success && result.workspaceId) {
      // Redirect to the new workspace dashboard
      await redirectToWorkspace(result.workspaceId);
    } else {
      setError(ttt("An error occurred while creating the workspace"));
    }
  }

  return (
    <>
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold">
          {hasWorkspace
            ? ttt("Create a new workspace")
            : ttt("Create your first workspace")}
        </h1>
      </div>
      <div className="px-4 sm:px-0">
        <form action={handleAction} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Card>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{ttt("Workspace Name")}</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  maxLength={255}
                  className={validationErrors.name ? "border-destructive" : ""}
                />
                {validationErrors.name && (
                  <p className="text-sm text-destructive">
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>{ttt("Type")}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedType("personal")}
                    className={`
                    flex items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer
                    hover:bg-muted/50 hover:border-primary/50
                    ${
                      selectedType === "personal"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background"
                    }
                  `}
                  >
                    <User className="h-5 w-5 mr-2" />
                    <span className="font-medium">{ttt("Personal")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType("company")}
                    className={`
                    flex items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer
                    hover:bg-muted/50 hover:border-primary/50
                    ${
                      selectedType === "company"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background"
                    }
                  `}
                  >
                    <Building2 className="h-5 w-5 mr-2" />
                    <span className="font-medium">{ttt("Company")}</span>
                  </button>
                </div>
                <input type="hidden" name="type" value={selectedType} />
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-5 gap-2">
                  {workspaceIcons.map(({ id, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedIcon(id)}
                      className={`
                      flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                      hover:bg-muted/50 hover:border-primary/50 cursor-pointer
                      ${
                        selectedIcon === id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background"
                      }
                    `}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                    </button>
                  ))}
                </div>
                <input type="hidden" name="icon" value={selectedIcon} />
              </div>
            </CardContent>
          </Card>

          <SubmitButton />
        </form>
      </div>
    </>
  );
}
