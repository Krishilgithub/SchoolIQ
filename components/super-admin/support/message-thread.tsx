"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  user_name: string;
  user_role: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

interface MessageThreadProps {
  ticketId: string;
  messages: Message[];
  onSendMessage: (message: string, isInternal: boolean) => Promise<void>;
}

export function MessageThread({
  ticketId,
  messages,
  onSendMessage,
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(newMessage, isInternal);
      setNewMessage("");
      setIsInternal(false);
      toast.success("Message sent");
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Messages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 max-h-125 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(message.user_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {message.user_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.user_role}
                    </span>
                    {message.is_internal && (
                      <Badge variant="outline" className="text-xs">
                        Internal
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-25"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSend();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="internal"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="internal"
                className="text-sm text-muted-foreground"
              >
                Internal note (not visible to customer)
              </label>
            </div>
            <Button onClick={handleSend} disabled={isSending}>
              <Send className="mr-2 h-4 w-4" />
              {isSending ? "Sending..." : "Send"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Press Cmd/Ctrl + Enter to send
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
