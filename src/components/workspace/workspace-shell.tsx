"use client"

import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { startTransition, useDeferredValue, useEffect, useState } from "react"
import {
  HashIcon,
  MicIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  VideoIcon,
  WifiIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MediaStage } from "@/components/workspace/media-stage"
import { CreateRoomDialog } from "@/components/workspace/create-room-dialog"
import { useLobbySocket } from "@/hooks/use-lobby-socket"
import { useRoomStore } from "@/hooks/use-room-store"
import { getSocket } from "@/lib/socket-client"
import {
  capitalizeKind,
  cn,
  formatRelativeTime,
  getInitials,
} from "@/lib/utils"
import type { WorkspacePayload, WorkspaceRoom } from "@/types/workspace"

const accentStyles: Record<string, string> = {
  amber:
    "from-amber-300/35 via-orange-200/20 to-transparent ring-amber-400/30",
  ocean: "from-sky-300/35 via-cyan-200/20 to-transparent ring-sky-400/30",
  fern: "from-emerald-300/35 via-lime-200/20 to-transparent ring-emerald-400/30",
}

const stackHighlights = [
  "Next.js App Router",
  "Clerk authentication",
  "Socket.IO presence",
  "WebRTC mesh calls",
  "Zustand client state",
  "Prisma + SQLite",
]

function roomIcon(kind: WorkspaceRoom["kind"]) {
  if (kind === "VOICE") {
    return MicIcon
  }

  if (kind === "VIDEO") {
    return VideoIcon
  }

  return HashIcon
}

export function WorkspaceShell({
  viewer,
  communities,
  currentCommunity,
}: WorkspacePayload) {
  const hydrateCommunity = useRoomStore((state) => state.hydrateCommunity)
  const activeRoomId = useRoomStore((state) => state.activeRoomId)
  const setActiveRoom = useRoomStore((state) => state.setActiveRoom)
  const participants = useRoomStore((state) => state.participants)
  const connected = useRoomStore((state) => state.connected)
  const messagesByRoom = useRoomStore((state) => state.messagesByRoom)

  const [messageContent, setMessageContent] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    startTransition(() => {
      hydrateCommunity(currentCommunity)
    })
  }, [currentCommunity, hydrateCommunity])

  const activeRoom =
    currentCommunity.rooms.find((room) => room.id === activeRoomId) ??
    currentCommunity.rooms[0]
  const activeMessages = useDeferredValue(
    activeRoom ? messagesByRoom[activeRoom.id] ?? activeRoom.messages : []
  )
  const canManage = currentCommunity.role === "OWNER" || currentCommunity.role === "ADMIN"

  useEffect(() => {
    if (activeRoom && activeRoom.id !== activeRoomId) {
      setActiveRoom(activeRoom.id)
    }
  }, [activeRoom, activeRoomId, setActiveRoom])

  useLobbySocket({
    roomId: activeRoom?.id ?? null,
    viewer: {
      userId: viewer.id,
      name: viewer.name,
      imageUrl: viewer.imageUrl,
      role: currentCommunity.role,
    },
  })

  async function handleSendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!activeRoom || !messageContent.trim()) {
      return
    }

    setSendingMessage(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: activeRoom.id,
          content: messageContent,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to send message.")
      }

      const socket = getSocket()
      socket.emit("chat:message", {
        roomId: activeRoom.id,
        message: payload.message,
      })
      useRoomStore.getState().addMessage(payload.message)
      setMessageContent("")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send message."
      )
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-[0_20px_80px_-50px_rgba(15,23,42,0.45)] backdrop-blur xl:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <Link href="/" className="text-sm uppercase tracking-[0.28em] text-muted-foreground">
                Lobiie
              </Link>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-heading text-4xl leading-none text-foreground sm:text-5xl">
                    {currentCommunity.name}
                  </h1>
                  <Badge variant="outline">{currentCommunity.role}</Badge>
                  <Badge variant={connected ? "default" : "outline"}>
                    <WifiIcon />
                    {connected ? "Socket live" : "Connecting"}
                  </Badge>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {currentCommunity.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start rounded-full border bg-background/80 px-3 py-2">
              <div className="text-right">
                <p className="text-sm font-medium">{viewer.name}</p>
                <p className="text-xs text-muted-foreground">{viewer.email}</p>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "size-10",
                  },
                }}
              />
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[290px_1fr]">
          <div className="space-y-4">
            <Card
              className={cn(
                "overflow-hidden bg-card/80 backdrop-blur",
                "before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-gradient-to-br",
                accentStyles[currentCommunity.accent] ?? accentStyles.amber
              )}
            >
              <CardHeader className="relative">
                <CardTitle>Communities</CardTitle>
                <CardDescription>
                  Switch contexts and keep each crew&apos;s rooms organized.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-3">
                {communities.map((community) => (
                  <Link
                    key={community.id}
                    href={`/workspace/${community.slug}`}
                    className={cn(
                      "block rounded-3xl border px-4 py-3 transition",
                      community.id === currentCommunity.id
                        ? "border-primary/30 bg-primary/6"
                        : "border-border bg-background/70 hover:border-primary/20 hover:bg-background"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{community.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {community.membershipCount} members
                        </p>
                      </div>
                      <Badge variant="outline">{community.role}</Badge>
                    </div>
                  </Link>
                ))}
                <div className="rounded-3xl border bg-background/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-medium">Visible members</p>
                    <Badge variant="secondary">{currentCommunity.membershipCount}</Badge>
                  </div>
                  <AvatarGroup>
                    {currentCommunity.featuredMembers.map((member) => (
                      <Avatar key={member.id}>
                        <AvatarImage src={member.imageUrl ?? undefined} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {currentCommunity.membershipCount >
                    currentCommunity.featuredMembers.length ? (
                      <AvatarGroupCount>
                        +{currentCommunity.membershipCount - currentCommunity.featuredMembers.length}
                      </AvatarGroupCount>
                    ) : null}
                  </AvatarGroup>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle>Stack in play</CardTitle>
                <CardDescription>
                  This MVP already exercises the core pieces from your idea.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {stackHighlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border bg-background/70 px-3 py-2 text-sm"
                  >
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 2xl:grid-cols-[280px_1fr]">
            <Card className="bg-card/80 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Rooms</CardTitle>
                    <CardDescription>
                      Pick a lane for messages, voice, or camera time.
                    </CardDescription>
                  </div>
                  {canManage ? <Badge variant="outline">Manage</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentCommunity.rooms.map((room) => {
                  const Icon = roomIcon(room.kind)

                  return (
                    <button
                      key={room.id}
                      type="button"
                      className={cn(
                        "w-full rounded-3xl border px-4 py-3 text-left transition",
                        room.id === activeRoom?.id
                          ? "border-primary/30 bg-primary/6"
                          : "border-border bg-background/70 hover:border-primary/20 hover:bg-background"
                      )}
                      onClick={() => setActiveRoom(room.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-primary/10 p-2 text-primary">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{room.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {room.topic ?? `${capitalizeKind(room.kind)} collaboration room`}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
                {canManage ? (
                  <CreateRoomDialog communityId={currentCommunity.id} />
                ) : (
                  <div className="rounded-3xl border border-dashed bg-background/50 p-4 text-sm text-muted-foreground">
                    Admins can add new rooms and shape the community flow.
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {activeRoom ? (
                <>
                  <Card className="bg-card/80 backdrop-blur">
                    <CardHeader>
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-2xl">{activeRoom.name}</CardTitle>
                            <Badge variant="outline">
                              {capitalizeKind(activeRoom.kind)}
                            </Badge>
                            <Badge variant="secondary">
                              {participants.length} live now
                            </Badge>
                          </div>
                          <CardDescription className="mt-2">
                            {activeRoom.topic ??
                              "Start the conversation here and move into live media when it helps."}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="rounded-full border bg-background/70 px-3 py-2 text-sm">
                            <span className="font-medium">{participants.length}</span>{" "}
                            active participant{participants.length === 1 ? "" : "s"}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 2xl:grid-cols-[1fr_0.95fr]">
                      <div className="rounded-[2rem] border bg-background/70 p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h2 className="font-medium">Conversation</h2>
                            <p className="text-sm text-muted-foreground">
                              Messages are stored in SQLite through Prisma and mirrored over the live socket.
                            </p>
                          </div>
                          <Badge variant="outline">
                            {activeMessages.length} messages
                          </Badge>
                        </div>
                        <div className="space-y-3">
                          <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                            {activeMessages.length === 0 ? (
                              <div className="rounded-3xl border border-dashed bg-background/60 p-6 text-center text-sm text-muted-foreground">
                                This room is empty. Start the thread and invite the team in.
                              </div>
                            ) : (
                              activeMessages.map((message) => (
                                <article
                                  key={message.id}
                                  className="rounded-3xl border bg-card px-4 py-3"
                                >
                                  <div className="flex items-start gap-3">
                                    <Avatar size="sm">
                                      <AvatarImage
                                        src={message.author.imageUrl ?? undefined}
                                      />
                                      <AvatarFallback>
                                        {getInitials(message.author.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium">
                                          {message.author.name}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                          {formatRelativeTime(message.createdAt)}
                                        </span>
                                      </div>
                                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                                        {message.content}
                                      </p>
                                    </div>
                                  </div>
                                </article>
                              ))
                            )}
                          </div>
                          <form className="space-y-3" onSubmit={handleSendMessage}>
                            <Textarea
                              placeholder={`Message #${activeRoom.slug}`}
                              value={messageContent}
                              onChange={(event) => setMessageContent(event.target.value)}
                            />
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-xs text-muted-foreground">
                                Secure Clerk identity, persisted messages, live socket fanout.
                              </p>
                              <Button type="submit" disabled={sendingMessage}>
                                {sendingMessage ? "Sending" : "Send update"}
                              </Button>
                            </div>
                          </form>
                        </div>
                      </div>
                      <MediaStage key={activeRoom.id} viewer={viewer} room={activeRoom} />
                    </CardContent>
                  </Card>

                  <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="bg-card/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle>Permissions</CardTitle>
                        <CardDescription>
                          Community membership gates both reads and writes.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="rounded-3xl border bg-background/70 p-4">
                          <ShieldCheckIcon className="mb-3 size-5 text-primary" />
                          <p className="font-medium">Role aware</p>
                          <p className="mt-1 text-muted-foreground">
                            Current role: {currentCommunity.role}. Admin actions are
                            restricted server-side.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-card/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle>Realtime</CardTitle>
                        <CardDescription>
                          Socket presence and signaling are active for this room.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="rounded-3xl border bg-background/70 p-4">
                          <WifiIcon className="mb-3 size-5 text-primary" />
                          <p className="font-medium">Transport status</p>
                          <p className="mt-1 text-muted-foreground">
                            {connected
                              ? "Connected and syncing participants now."
                              : "Reconnecting to the socket server."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-card/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle>Growth path</CardTitle>
                        <CardDescription>
                          The structure is ready for channels, attachments, and moderation.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="rounded-3xl border bg-background/70 p-4">
                          <PlusCircleIcon className="mb-3 size-5 text-primary" />
                          <p className="font-medium">Next extensions</p>
                          <p className="mt-1 text-muted-foreground">
                            Add file uploads, threaded replies, invite flows, or multi-tenant admin screens.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
