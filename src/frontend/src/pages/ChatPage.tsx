import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Principal } from "@icp-sdk/core/principal";
import { Principal as PrincipalClass } from "@icp-sdk/core/principal";
import {
  FileText,
  Loader2,
  MessageCircle,
  MessageSquare,
  Send,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { ChatMessage, ConversationSummary, StudyNote } from "../backend.d";
import { formatTimestamp } from "../data/sampleData";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useConversation,
  useMyConversations,
  useSendMessage,
  useStudyNotes,
} from "../hooks/useQueries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function truncatePrincipal(p: Principal | string): string {
  const str = typeof p === "string" ? p : p.toString();
  if (str.length <= 12) return str;
  return `${str.slice(0, 8)}...`;
}

function formatChatTime(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1000000));
  const date = new Date(ms);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Shared Note Card in message ─────────────────────────────────────────────

function SharedNoteCard({
  noteId,
  notes,
  onView,
}: {
  noteId: number;
  notes: StudyNote[];
  onView: (note: StudyNote) => void;
}) {
  const note = notes.find((n) => n.id === noteId);

  return (
    <button
      type="button"
      className="flex items-center gap-2 mt-2 p-2.5 rounded-lg bg-black/20 border border-white/10 text-left w-full hover:bg-black/30 transition-colors"
      onClick={() => note && onView(note)}
      title={note ? `View note: ${note.title}` : "Shared a note"}
    >
      <FileText className="w-4 h-4 shrink-0 opacity-80" />
      <div className="min-w-0">
        <p className="text-xs font-medium opacity-70 mb-0.5">Shared a note</p>
        <p className="text-sm font-semibold truncate">
          {note ? note.title : `Note #${noteId}`}
        </p>
      </div>
    </button>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isSelf,
  notes,
  onViewNote,
}: {
  message: ChatMessage;
  isSelf: boolean;
  notes: StudyNote[];
  onViewNote: (note: StudyNote) => void;
}) {
  const hasNote = message.sharedNoteId != null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex", isSelf ? "justify-end" : "justify-start")}
    >
      <div
        className={cn("max-w-[80%] flex flex-col gap-1", isSelf && "items-end")}
      >
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed",
            isSelf
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-surface-2 text-foreground border border-border/60 rounded-bl-sm",
          )}
        >
          {message.content}
          {hasNote && message.sharedNoteId != null && (
            <SharedNoteCard
              noteId={message.sharedNoteId}
              notes={notes}
              onView={onViewNote}
            />
          )}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {formatChatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Conversation List Item ───────────────────────────────────────────────────

function ConversationItem({
  convo,
  isActive,
  onClick,
  index,
}: {
  convo: ConversationSummary;
  isActive: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      className={cn(
        "w-full text-left p-3 rounded-xl transition-all flex items-start gap-3",
        isActive
          ? "bg-primary/15 border border-primary/30"
          : "hover:bg-surface-2 border border-transparent",
      )}
      onClick={onClick}
      data-ocid={`chat.conversation.item.${index + 1}`}
    >
      <Avatar className="w-10 h-10 shrink-0 border border-border/60">
        <AvatarFallback className="bg-primary/20 text-primary text-xs font-display font-bold">
          {truncatePrincipal(convo.otherUser).slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {truncatePrincipal(convo.otherUser)}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {convo.lastMessage.length > 60
            ? `${convo.lastMessage.slice(0, 60)}...`
            : convo.lastMessage}
        </p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
        {formatChatTime(convo.timestamp)}
      </span>
    </button>
  );
}

// ─── Note View Dialog (reused pattern from NotesPage) ────────────────────────

function NoteViewDialog({
  note,
  onClose,
}: {
  note: StudyNote | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!note} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border/60 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {note?.title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground flex gap-3">
            <span>{note?.subject}</span>
            <span>{note && formatTimestamp(note.timestamp)}</span>
          </DialogDescription>
        </DialogHeader>
        {note?.content && (
          <div className="mt-4">
            <pre className="whitespace-pre-wrap font-body text-sm text-foreground/90 leading-relaxed bg-surface-2 rounded-lg p-4 border border-border/50">
              {note.content}
            </pre>
          </div>
        )}
        {note?.fileId && (
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Attachment
            </p>
            {note.fileType?.startsWith("image/") ? (
              <div className="rounded-xl overflow-hidden border border-border/60 bg-surface-2">
                <img
                  src={note.fileId}
                  alt={note.fileName ?? "Attached image"}
                  className="w-full max-h-80 object-contain"
                  loading="lazy"
                />
              </div>
            ) : note.fileType === "application/pdf" ? (
              <div className="rounded-xl overflow-hidden border border-border/60 bg-surface-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 pt-3 pb-2">
                  Preview
                </p>
                <iframe
                  src={note.fileId}
                  title={note.fileName ?? "PDF Preview"}
                  width="100%"
                  height="480px"
                  className="border-0"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-2 border border-border/60">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm font-medium text-foreground truncate flex-1">
                  {note.fileName ?? "Attached file"}
                </p>
                <a
                  href={note.fileId}
                  download={note.fileName ?? true}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    Download
                  </Button>
                </a>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border/60"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Chat Thread ─────────────────────────────────────────────────────────────

function ChatThread({
  otherUser,
  selfPrincipal,
  notes,
}: {
  otherUser: Principal;
  selfPrincipal: string;
  notes: StudyNote[];
}) {
  const [inputValue, setInputValue] = useState("");
  const [viewingNote, setViewingNote] = useState<StudyNote | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: messages = [], isLoading } = useConversation(otherUser);
  const sendMessage = useSendMessage();

  const messageCount = messages.length;
  // Auto-scroll to bottom when new messages arrive
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on count change is intentional
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content) return;
    setInputValue("");
    try {
      await sendMessage.mutateAsync({
        recipient: otherUser,
        content,
        sharedNoteId: null,
      });
    } catch {
      toast.error("Failed to send message");
      setInputValue(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full" data-ocid="chat.thread">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/60 bg-surface-2 flex items-center gap-3">
        <Avatar className="w-9 h-9 border border-border/60">
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-display font-bold">
            {truncatePrincipal(otherUser).slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {truncatePrincipal(otherUser)}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {otherUser.toString().slice(0, 20)}...
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="py-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3" data-ocid="chat.loading_state">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    i % 2 === 0 ? "justify-end" : "justify-start",
                  )}
                >
                  <Skeleton
                    className={cn(
                      "h-12 rounded-2xl",
                      i % 2 === 0 ? "w-48" : "w-56",
                    )}
                  />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div
              className="text-center py-12"
              data-ocid="chat.thread.empty_state"
            >
              <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No messages yet. Say hello!
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg: ChatMessage) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isSelf={msg.sender.toString() === selfPrincipal}
                  notes={notes}
                  onViewNote={setViewingNote}
                />
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/60 bg-surface-2">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-card border-border/60"
            data-ocid="chat.message.input"
            autoFocus
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || sendMessage.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
            data-ocid="chat.send.button"
            aria-label="Send message"
          >
            {sendMessage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <NoteViewDialog note={viewingNote} onClose={() => setViewingNote(null)} />
    </div>
  );
}

// ─── Main ChatPage ────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const selfPrincipal = identity?.getPrincipal().toString() ?? "";

  // Read `?with=<principal>` query param
  const withParam = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("with");
  }, []);

  const [selectedPrincipal, setSelectedPrincipal] = useState<Principal | null>(
    () => {
      if (!withParam) return null;
      try {
        return PrincipalClass.fromText(withParam);
      } catch {
        return null;
      }
    },
  );

  const { data: conversations = [], isLoading: convsLoading } =
    useMyConversations();
  const { data: notes = [] } = useStudyNotes();

  // Auto-focus input when principal is preselected via URL
  useEffect(() => {
    if (withParam && !selectedPrincipal) {
      try {
        setSelectedPrincipal(PrincipalClass.fromText(withParam));
      } catch {
        // invalid principal, ignore
      }
    }
  }, [withParam, selectedPrincipal]);

  const isConversationActive = (convo: ConversationSummary) => {
    return selectedPrincipal?.toString() === convo.otherUser.toString();
  };

  return (
    <div className="min-h-screen py-6">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="h-[calc(100vh-10rem)] rounded-2xl border border-border/60 overflow-hidden bg-card flex"
        >
          {/* Left panel — Conversation List */}
          <div
            className={cn(
              "w-full md:w-80 lg:w-96 border-r border-border/60 flex flex-col shrink-0",
              selectedPrincipal ? "hidden md:flex" : "flex",
            )}
            data-ocid="chat.conversation_list"
          >
            {/* List Header */}
            <div className="p-4 border-b border-border/60 bg-surface-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h2 className="font-display font-bold text-lg text-foreground">
                  Messages
                </h2>
                {conversations.length > 0 && (
                  <Badge
                    variant="outline"
                    className="ml-auto text-xs border-primary/30 bg-primary/10 text-primary"
                  >
                    {conversations.length}
                  </Badge>
                )}
              </div>
            </div>

            {/* Conversation Items */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1">
                {!isLoggedIn ? (
                  <div
                    className="text-center py-12 px-4"
                    data-ocid="chat.signin.empty_state"
                  >
                    <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Sign in to view your messages
                    </p>
                  </div>
                ) : convsLoading ? (
                  <div
                    className="space-y-2 p-1"
                    data-ocid="chat.conversations.loading_state"
                  >
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 && !withParam ? (
                  <div
                    className="text-center py-12 px-4"
                    data-ocid="chat.conversations.empty_state"
                  >
                    <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">
                      No conversations yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Message a tutor from the Tutors page!
                    </p>
                  </div>
                ) : (
                  <>
                    {conversations.map(
                      (convo: ConversationSummary, i: number) => (
                        <ConversationItem
                          key={convo.otherUser.toString()}
                          convo={convo}
                          isActive={isConversationActive(convo)}
                          onClick={() =>
                            setSelectedPrincipal(convo.otherUser as Principal)
                          }
                          index={i}
                        />
                      ),
                    )}
                    {/* If URL has a `with` param not in conversations, show it as a new thread entry */}
                    {withParam &&
                      selectedPrincipal &&
                      !conversations.some(
                        (c: ConversationSummary) =>
                          c.otherUser.toString() ===
                          selectedPrincipal.toString(),
                      ) && (
                        <button
                          type="button"
                          className={cn(
                            "w-full text-left p-3 rounded-xl transition-all flex items-start gap-3",
                            "bg-primary/15 border border-primary/30",
                          )}
                          data-ocid="chat.conversation.item.new"
                        >
                          <Avatar className="w-10 h-10 shrink-0 border border-border/60">
                            <AvatarFallback className="bg-primary/20 text-primary text-xs font-display font-bold">
                              {truncatePrincipal(selectedPrincipal)
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {truncatePrincipal(selectedPrincipal)}
                            </p>
                            <p className="text-xs text-primary mt-0.5">
                              New conversation
                            </p>
                          </div>
                        </button>
                      )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right panel — Thread */}
          <div
            className={cn(
              "flex-1 flex flex-col",
              !selectedPrincipal && "hidden md:flex",
            )}
          >
            {!selectedPrincipal ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-lg font-display font-semibold text-muted-foreground">
                    Select a conversation to start chatting
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Or message a tutor from the Tutors page
                  </p>
                </div>
              </div>
            ) : !isLoggedIn ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-lg font-display font-semibold text-muted-foreground">
                    Sign in to start chatting
                  </p>
                </div>
              </div>
            ) : (
              <ChatThread
                otherUser={selectedPrincipal}
                selfPrincipal={selfPrincipal}
                notes={notes}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
