import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MessageCircle, Droplet, ChevronRight } from "lucide-react-native";
import { Screen, Title, Body, Caption, Avatar, EmptyState, Spinner, AppText } from "../components/ui";
import { chatApi } from "../api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTopic } from "../hooks/useTopic";
import { bloodGroupLabel, timeAgo } from "../lib/constants";
import { colors, radius, spacing } from "../theme";

export default function MessagesScreen() {
  const navigation = useNavigation();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const data = await chatApi.listConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error?.message || "Couldn't load conversations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);
  useTopic(user?.id ? `/topic/chat/${user.id}` : null, token, () => load({ silent: true }));

  const open = (conversation) => navigation.navigate("ChatThread", { conversation });

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.header}>
        <Caption color={colors.primary100}>COORDINATION</Caption>
        <Title color={colors.white}>Messages</Title>
        <Body color="rgba(255,255,255,0.74)">
          Talk directly with requesters and donors after a response is submitted.
        </Body>
      </View>
      {loading ? (
        <Spinner label="Loading conversations…" />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => `${item.requestId}-${item.otherUserId}`}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load({ silent: true }); }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <EmptyState
              icon={MessageCircle}
              title="No conversations yet"
              message="Respond to a blood request, or open responses to one of your requests, to start coordinating."
            />
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => open(item)} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
              <Avatar name={item.otherName} size={48} tint="navy" />
              <View style={styles.copy}>
                <View style={styles.nameRow}>
                  <AppText weight="bold" size={15} numberOfLines={1} style={styles.name}>{item.otherName || "Conversation"}</AppText>
                  <Caption>{timeAgo(item.lastAt)}</Caption>
                </View>
                <Body size={13} color={colors.textMuted} numberOfLines={1}>{item.lastMessage}</Body>
                <View style={styles.meta}>
                  <Droplet size={12} color={colors.primary} />
                  <Caption color={colors.primary}>{bloodGroupLabel(item.bloodGroup)} request</Caption>
                </View>
              </View>
              {item.unread > 0 ? (
                <View style={styles.unread}><Caption color={colors.white}>{item.unread}</Caption></View>
              ) : <ChevronRight size={18} color={colors.neutral400} />}
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { margin: spacing.xl, marginBottom: spacing.md, padding: spacing.xl, gap: 5, borderRadius: radius.xl, backgroundColor: colors.primary },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 118, flexGrow: 1 },
  row: { minHeight: 82, flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  rowPressed: { opacity: 0.65 },
  copy: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  name: { flex: 1 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  unread: { minWidth: 24, height: 24, borderRadius: 12, paddingHorizontal: 6, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  separator: { height: 1, backgroundColor: colors.border },
});
