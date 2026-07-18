import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Send, MessageSquare, Droplet, ArrowLeft } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useTopic } from "../../hooks/useTopic";
import { bloodGroupLabel, formatDateTime } from "../../lib/constants";
import * as chatApi from "../../api/chat";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null); // { requestId, otherUserId, otherName, bloodGroup }
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await chatApi.listConversations();
      setConversations(Array.isArray(data) ? data : []);
      return data;
    } catch {
      return [];
    }
  }, []);

  // Initial load + deep-link (?requestId=&otherUserId=&name=&bloodGroup=)
  useEffect(() => {
    Promise.resolve().then(loadConversations).then((convos) => {
      const rid = searchParams.get("requestId");
      const oid = searchParams.get("otherUserId");
      if (rid && oid) {
        const existing = (convos || []).find(
          (c) => String(c.requestId) === rid && String(c.otherUserId) === oid,
        );
        setActive(
          existing || {
            requestId: Number(rid),
            otherUserId: Number(oid),
            otherName: searchParams.get("name") || "Conversation",
            bloodGroup: searchParams.get("bloodGroup") || null,
          },
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadThread = useCallback(async (convo) => {
    if (!convo) return;
    try {
      const data = await chatApi.getThread(convo.requestId, convo.otherUserId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message);
    }
  }, [toast]);

  useEffect(() => {
    if (active) Promise.resolve().then(() => loadThread(active));
  }, [active, loadThread]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Live incoming messages on my personal channel.
  const onIncoming = useCallback(
    (msg) => {
      if (!msg?.id) return;
      const belongsToActive =
        active &&
        String(msg.requestId) === String(active.requestId) &&
        (String(msg.senderUserId) === String(active.otherUserId) ||
          String(msg.recipientUserId) === String(active.otherUserId));
      if (belongsToActive) {
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
        );
      }
      loadConversations();
    },
    [active, loadConversations],
  );
  useTopic(user?.id ? `/topic/chat/${user.id}` : null, onIncoming);

  const openConvo = (c) => {
    setActive(c);
    setSearchParams({});
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    setSending(true);
    try {
      const dto = await chatApi.sendMessage({
        requestId: active.requestId,
        recipientUserId: active.otherUserId,
        content: text.trim(),
      });
      setMessages((prev) => (prev.some((m) => m.id === dto.id) ? prev : [...prev, dto]));
      setText("");
      loadConversations();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHeader overline="Messages" title="Conversations" subtitle="Coordinate directly with donors, hospitals and blood banks." />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Conversation list */}
        <Card className={`${active ? "hidden lg:block" : "block"} rounded-xl`}>
          <div className="max-h-[70vh] divide-y divide-editorial overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-sm text-neutral-500">
                No conversations yet. Start one from a blood request.
              </div>
            ) : (
              conversations.map((c) => {
                const isActive =
                  active &&
                  c.requestId === active.requestId &&
                  c.otherUserId === active.otherUserId;
                return (
                  <button
                    key={`${c.requestId}-${c.otherUserId}`}
                    onClick={() => openConvo(c)}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                      isActive ? "bg-beige-light" : "hover:bg-beige-light/50"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                      {(c.otherName || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-ink">{c.otherName}</p>
                        {c.unread > 0 && (
                          <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                            {c.unread}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-neutral-500">{c.lastMessage}</p>
                      {c.bloodGroup && (
                        <span className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] font-bold text-primary">
                          <Droplet size={10} strokeWidth={2.4} />
                          {bloodGroupLabel(c.bloodGroup)} request
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Thread */}
        <Card className={`${active ? "flex" : "hidden lg:flex"} min-h-[70vh] flex-col rounded-xl`}>
          {!active ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="Select a conversation"
                description="Pick a conversation on the left, or start one from a blood request."
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-editorial px-5 py-3">
                <button type="button" onClick={() => setActive(null)} className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline text-neutral-600 lg:hidden" aria-label="Back to conversations">
                  <ArrowLeft size={18} />
                </button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
                  {(active.otherName || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{active.otherName}</p>
                  {active.bloodGroup && (
                    <p className="font-mono text-[10px] uppercase tracking-wide text-primary">
                      {bloodGroupLabel(active.bloodGroup)} request
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {messages.length === 0 ? (
                  <p className="py-10 text-center text-sm text-neutral-400">
                    No messages yet — say hello.
                  </p>
                ) : (
                  messages.map((m) => {
                    const mine = String(m.senderUserId) === String(user?.id);
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            mine
                              ? "rounded-br-sm bg-primary text-white"
                              : "rounded-bl-sm bg-beige-light text-ink"
                          }`}
                        >
                          <p>{m.content}</p>
                          <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-neutral-400"}`}>
                            {formatDateTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={endRef} />
              </div>

              <form onSubmit={send} className="flex items-center gap-2 border-t border-editorial p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message…"
                  className="min-h-11 flex-1 rounded-lg border border-hairline bg-white px-4 py-2.5 text-base focus:border-primary focus:outline-none sm:text-sm"
                />
                <Button type="submit" loading={sending} disabled={!text.trim()}>
                  <Send size={16} strokeWidth={1.9} />
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
