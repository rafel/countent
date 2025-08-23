"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormStatus } from "react-dom";
import { useLanguage } from "@/hooks/use-language";
import { updateWorkspace } from "../actions";
import { Workspace } from "@/lib/db/tables/workspace";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { ttt } = useLanguage();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? ttt("Saving...") : ttt("Save Changes")}
    </Button>
  );
}

export function WorkspaceContactInfo({ workspace }: { workspace: Workspace }) {
  const { ttt } = useLanguage();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(submitData: FormData) {
    const data = {
      description: submitData.get("description") as string,
    };

    try {
      const result = await updateWorkspace(workspace.workspaceid, data);
      if (result.success) {
        setError(null);
      } else {
        setError(ttt("Failed to save workspace information"));
      }
    } catch {
      setError(ttt("Failed to save workspace information"));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{ttt("Contact Information")}</h3>
        <p className="text-sm text-muted-foreground">
          {ttt("Update your workspace's contact information.")}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">{ttt("Description")}</Label>
          <Input
            id="description"
            name="description"
            defaultValue={workspace.description || ""}
            placeholder={ttt("Enter workspace description")}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}
