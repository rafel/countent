"use client";

import { useState } from "react";
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
import { useFormStatus } from "react-dom";
import { useLanguage } from "@/hooks/use-language";
import { updateWorkspace } from "../actions";
import { Workspace, WorkspaceType } from "@/lib/db/tables/workspace";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { ttt } = useLanguage();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? ttt("Saving...") : ttt("Save Changes")}
    </Button>
  );
}

export function WorkspaceGeneralSettings({
  workspace,
}: {
  workspace: Workspace;
}) {
  const { ttt } = useLanguage();
  const [formData, setFormData] = useState(workspace);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(submitData: FormData) {
    const data = {
      name: submitData.get("name") as string,
      type: submitData.get("type") as WorkspaceType,
      description: submitData.get("description") as string,
    };

    try {
      const result = await updateWorkspace(workspace.workspaceid, data);
      if (result.success) {
        setFormData({ ...formData, ...data });
        setError(null);
      } else {
        setError(ttt("Failed to save workspace data"));
      }
    } catch {
      setError(ttt("Failed to save workspace data"));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{ttt("General Settings")}</h3>
        <p className="text-sm text-muted-foreground">
          {ttt("Update your workspace's basic information.")}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{ttt("Workspace Name")}</Label>
          <Input
            id="name"
            name="name"
            defaultValue={formData.name}
            placeholder={ttt("Enter workspace name")}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">{ttt("Workspace Type")}</Label>
          <Select name="type" defaultValue={formData.type}>
            <SelectTrigger>
              <SelectValue placeholder={ttt("Select workspace type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">{ttt("Personal")}</SelectItem>
              <SelectItem value="company">{ttt("Company")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{ttt("Description")}</Label>
          <Input
            id="description"
            name="description"
            defaultValue={formData.description || ""}
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
