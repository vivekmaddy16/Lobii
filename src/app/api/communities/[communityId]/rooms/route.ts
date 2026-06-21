import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/prisma"
import { ensureViewerRecord } from "@/lib/workspace"
import { slugify } from "@/lib/utils"

const createRoomSchema = z.object({
  name: z.string().trim().min(2).max(48),
  topic: z.string().trim().max(180).optional().default(""),
  kind: z.enum(["CHAT", "VOICE", "VIDEO"]),
})

type RouteContext = {
  params: Promise<{
    communityId: string
  }>
}

export async function POST(request: Request, context: RouteContext) {
  const session = await auth()

  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  try {
    const { communityId } = await context.params
    const body = await request.json()
    const parsed = createRoomSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Room payload is invalid." }, { status: 400 })
    }

    const viewer = await ensureViewerRecord()
    const membership = await db.membership.findUnique({
      where: {
        userId_communityId: {
          userId: viewer.id,
          communityId,
        },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "You do not belong to this community." },
        { status: 403 }
      )
    }

    if (membership.role === "MEMBER") {
      return NextResponse.json(
        { error: "Only admins can create rooms." },
        { status: 403 }
      )
    }

    const baseSlug = slugify(parsed.data.name)
    const existingCount = await db.room.count({
      where: {
        communityId,
        slug: {
          startsWith: baseSlug,
        },
      },
    })

    const room = await db.room.create({
      data: {
        communityId,
        name: parsed.data.name,
        topic: parsed.data.topic || null,
        kind: parsed.data.kind,
        slug: existingCount === 0 ? baseSlug : `${baseSlug}-${existingCount + 1}`,
        sortOrder: await db.room.count({
          where: { communityId },
        }),
      },
    })

    return NextResponse.json({
      room: {
        id: room.id,
        slug: room.slug,
      },
    })
  } catch {
    return NextResponse.json({ error: "Unable to create room." }, { status: 500 })
  }
}
