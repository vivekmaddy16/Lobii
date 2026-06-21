import { WorkspaceShell } from "@/components/workspace/workspace-shell"
import { getWorkspacePayload } from "@/lib/workspace"

type WorkspacePageProps = {
  params: Promise<{
    communitySlug: string
  }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { communitySlug } = await params
  const workspace = await getWorkspacePayload(communitySlug)

  return <WorkspaceShell {...workspace} />
}
