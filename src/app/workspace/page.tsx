import { redirect } from "next/navigation"

import { getWorkspacePayload } from "@/lib/workspace"

export default async function WorkspaceIndexPage() {
  const workspace = await getWorkspacePayload()

  redirect(`/workspace/${workspace.currentCommunity.slug}`)
}
