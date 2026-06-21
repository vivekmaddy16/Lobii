import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/lib/prisma"
import { ensureViewerRecord } from "@/lib/workspace"

const messageSchema = z.object({
  roomId: z.string().min(1),
  content: z.string().trim().min(1).max(2000),
})

export async function POST(request: Request) {
  const session = await auth()

  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = messageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Message payload is invalid." },
        { status: 400 }
      )
    }

    const viewer = await ensureViewerRecord()

    const room = await db.room.findUnique({
      where: { id: parsed.data.roomId },
      include: {
        community: {
          include: {
            memberships: {
              where: {
                userId: viewer.id,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    if (!room || room.community.memberships.length === 0) {
      return NextResponse.json(
        { error: "You do not have access to this room." },
        { status: 403 }
      )
    }

    const message = await db.message.create({
      data: {
        roomId: parsed.data.roomId,
        authorId: viewer.id,
        content: parsed.data.content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: {
        id: message.id,
        roomId: parsed.data.roomId,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        author: message.author,
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Unable to create message." },
      { status: 500 }
    )
  }
}
