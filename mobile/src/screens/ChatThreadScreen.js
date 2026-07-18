import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Send, MessageCircle } from "lucide-react-native";
import { Avatar, Body, Caption, EmptyState, Spinner } from "../components/ui";
import { chatApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTopic } from "../hooks/useTopic";
import { bloodGroupLabel, formatDateTime } from "../lib/constants";
import { colors, fonts, radius, spacing } from "../theme";

export default function ChatThreadScreen() {
  const { conversation } = useRoute().params || {};
  const { user, token } = useAuth();
  const { toast } = useToast();
  const listRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const requestId = conversation?.requestId;
  const otherUserId = conversation?.otherUserId;
  const load = useCallback(async () => {
    if (!requestId || !otherUserId) return;
    try {
      const data = await chatApi.getThread(requestId, otherUserId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error?.message || "Couldn't load messages");
    } finally { setLoading(false); }
  }, [requestId, otherUserId, toast]);

  useEffect(() => { load(); }, [load]);
  const incoming = useCallback((message) => {
    const belongs = String(message?.requestId) === String(requestId) &&
      (String(message?.senderUserId) === String(otherUserId) || String(message?.recipientUserId) === String(otherUserId));
    if (belongs) setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
  }, [requestId, otherUserId]);
  useTopic(user?.id ? `/topic/chat/${user.id}` : null, token, incoming);

  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const message = await chatApi.sendMessage({ requestId, recipientUserId: otherUserId, content });
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      setText("");
    } catch (error) { toast.error(error?.message || "Message could not be sent"); }
    finally { setSending(false); }
  };

  if (loading) return <View style={styles.loading}><Spinner label="Loading messages…" /></View>;
  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <View style={styles.person}>
        <Avatar name={conversation?.otherName} size={42} tint="navy" />
        <View><Body weight="bold">{conversation?.otherName || "Conversation"}</Body><Caption>{bloodGroupLabel(conversation?.bloodGroup)} blood request</Caption></View>
      </View>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={<EmptyState icon={MessageCircle} title="Start the conversation" message="Share timing, location, and next steps. Avoid sending private medical information here." />}
        renderItem={({ item }) => {
          const mine = String(item.senderUserId) === String(user?.id);
          return <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}><Body size={14} color={mine ? colors.white : colors.text}>{item.content}</Body><Caption color={mine ? "rgba(255,255,255,0.7)" : colors.textFaint}>{formatDateTime(item.createdAt)}</Caption></View>;
        }}
      />
      <View style={styles.composer}>
        <TextInput value={text} onChangeText={setText} placeholder="Type a message…" placeholderTextColor={colors.neutral400} multiline maxLength={1000} style={styles.input} accessibilityLabel="Message" />
        <Pressable onPress={send} disabled={!text.trim() || sending} accessibilityRole="button" accessibilityLabel="Send message" style={({ pressed }) => [styles.send, (!text.trim() || sending) && styles.sendDisabled, pressed && styles.sendPressed]}><Send size={20} color={colors.white} /></Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg }, loading: { flex: 1, backgroundColor: colors.bg },
  person: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.white },
  messages: { flexGrow: 1, padding: spacing.lg, gap: spacing.sm, justifyContent: "flex-end" },
  bubble: { maxWidth: "82%", paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: 3, borderRadius: radius.lg },
  mine: { alignSelf: "flex-end", backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirs: { alignSelf: "flex-start", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white },
  input: { flex: 1, minHeight: 48, maxHeight: 120, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.xl, fontFamily: fonts.medium, fontSize: 16, color: colors.text },
  send: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  sendDisabled: { opacity: 0.42 }, sendPressed: { transform: [{ scale: 0.96 }] },
});
