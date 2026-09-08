import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubHeader } from '@/components/app/SubHeader';
import { IconButton } from '@/components/core/IconButton';
import { ChatMsg, initialChat, quickReplies } from '@/data/sakhi';
import { colors, figtree } from '@/theme/tokens';

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const [chat, setChat] = useState<ChatMsg[]>(initialChat);

  const send = (user: string, bot: string) => {
    setChat((c) => [...c, { from: 'me', text: user }]);
    setTimeout(() => {
      setChat((c) => [...c, { from: 'bot', text: bot }]);
      scroll.current?.scrollToEnd({ animated: true });
    }, 500);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader title="Ask Sakhi" subtitle="Answers in 11 languages" />
      </View>

      <ScrollView ref={scroll} contentContainerStyle={styles.thread} showsVerticalScrollIndicator={false}>
        {chat.map((m, i) => {
          const mine = m.from === 'me';
          return (
            <View key={i} style={[styles.bubble, mine ? styles.me : styles.bot]}>
              <Text style={[styles.text, mine && styles.textMe]}>{m.text}</Text>
            </View>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickWrap} contentContainerStyle={styles.quick}>
        {quickReplies.map((q) => (
          <Pressable key={q.label} onPress={() => send(q.user, q.bot)} style={styles.chip}>
            <Text style={styles.chipText}>{q.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.composer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.input}>
          <Text style={styles.inputText}>Type a message</Text>
        </View>
        <IconButton icon="mic" variant="inverse" />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink050 },
  thread: { padding: 20, paddingTop: 16, gap: 10 },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingVertical: 12, paddingHorizontal: 14 },
  bot: { alignSelf: 'flex-start', backgroundColor: colors.white },
  me: { alignSelf: 'flex-end', backgroundColor: colors.ink900 },
  text: { fontFamily: figtree(400), fontSize: 15, color: colors.ink900, lineHeight: 21 },
  textMe: { color: colors.white },
  quickWrap: { flexGrow: 0 },
  quick: { paddingHorizontal: 20, paddingBottom: 10, gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.ink200,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  chipText: { fontFamily: figtree(600), fontSize: 14, color: colors.ink900 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.ink100,
  },
  input: { flex: 1, backgroundColor: colors.ink050, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 16 },
  inputText: { fontFamily: figtree(400), fontSize: 15, color: colors.ink400 },
});
