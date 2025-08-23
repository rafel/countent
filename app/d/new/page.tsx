import { WorkspaceForm } from "./components/workspace-form";
import { checkUserHasWorkspaces } from "./actions";

export default async function New() {
  const userHasWorkspaces = await checkUserHasWorkspaces();

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="space-y-6">
        <WorkspaceForm hasWorkspace={userHasWorkspaces} />
      </div>
    </div>
  );
}
