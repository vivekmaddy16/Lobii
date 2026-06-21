"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircleIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { RoomKind } from "@/types/workspace"

const roomKinds: Array<{
  value: RoomKind
  label: string
  description: string
}> = [
  {
    value: "CHAT",
    label: "Text room",
    description: "Persistent conversations and async updates.",
  },
  {
    value: "VOICE",
    label: "Voice room",
    description: "Quick huddles without leaving the browser.",
  },
  {
    value: "VIDEO",
    label: "Video room",
    description: "Camera-on demos and collaborative reviews.",
  },
]

export function CreateRoomDialog({
  communityId,
}: {
  communityId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [topic, setTopic] = useState("")
  const [kind, setKind] = useState<RoomKind>("CHAT")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/communities/${communityId}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          topic,
          kind,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create room.")
      }

      toast.success("Room created.")
      setOpen(false)
      setName("")
      setTopic("")
      setKind("CHAT")
      router.refresh()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create room."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => setOpen(true)}
      >
        <PlusIcon />
        New room
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create a room</DialogTitle>
            <DialogDescription>
              Add a new text, voice, or video space inside this community.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="room-name">
                Room name
              </label>
              <Input
                id="room-name"
                placeholder="Design critique"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Room type</span>
              <div className="grid gap-2 sm:grid-cols-3">
                {roomKinds.map((roomOption) => (
                  <button
                    key={roomOption.value}
                    type="button"
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left transition",
                      kind === roomOption.value
                        ? "border-primary bg-primary/8 text-foreground"
                        : "border-border bg-background/70 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                    onClick={() => setKind(roomOption.value)}
                  >
                    <div className="font-medium text-foreground">
                      {roomOption.label}
                    </div>
                    <p className="mt-1 text-xs leading-5">
                      {roomOption.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="room-topic">
                Topic
              </label>
              <Textarea
                id="room-topic"
                placeholder="What should the team use this room for?"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
              />
            </div>
            <DialogFooter className="border-0 bg-transparent p-0 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircleIcon className="animate-spin" />
                    Creating
                  </>
                ) : (
                  <>
                    <PlusIcon />
                    Create room
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
