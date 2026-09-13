import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SubHeader } from '@/components/app/SubHeader';
import { IconButton } from '@/components/core/IconButton';
import { useAskSakhi } from '@/hooks/queries';
import { ChatMsg, quickReplies } from '@/data/sakhi';
import { colors, figtree } from '@/theme/tokens';

const GREETING: ChatMsg = {
  from: 'bot',
  text: "Hi, I'm Sakhi. Ask me for safety tips, quick first aid, or how to take action — like the steps to file a complaint. In an emergency, call 112.",
};

// Render one line's inline `**bold**` spans (Gemini replies use markdown).
function inlineSpans(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
    seg.startsWith('**') && seg.endsWith('**') ? (
      <Text key={i} style={styles.bold}>
        {seg.slice(2, -2)}
      </Text>
    ) : (
      seg
    ),
  );
}

// Minimal markdown for bot bubbles: **bold**, # headings, and -/* bullets.
// Numbered lists ("1. …") pass through as plain text. Avoids a markdown dep.
function BotText({ text }: { text: string }) {
  const lines = text.replace(/\r/g, '').split('\n');
  return (
    <View>
      {lines.map((line, i) => {
        if (line.trim() === '') return <View key={i} style={{ height: 6 }} />;
        const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
        let content = heading ? heading[1] : line;
        const bullet = content.match(/^\s*[-*]\s+(.*)$/);
        if (bullet) content = bullet[1];
        return (
          <Text key={i} style={[styles.text, heading ? styles.heading : null]}>
            {bullet ? '•  ' : ''}
            {inlineSpans(content)}
          </Text>
        );
      })}
    </View>
  );
}
const ERROR_REPLY =
  "I couldn't reach the assistant just now. In an emergency call 112, or the women's helpline 1091 — you can also reach helplines from the Circle tab.";

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const [chat, setChat] = useState<ChatMsg[]>([GREETING]);
  const [input, setInput] = useState('');
  const ask = useAskSakhi();

  // The conversation has "started" once the user has sent at least one message.
  const started = chat.some((m) => m.from === 'me');

  const reset = () => {
    setChat([GREETING]);
    setInput('');
  };

  const scrollDown = () => setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60);

  const send = async (userText: string) => {
    const text = userText.trim();
    if (!text || ask.isPending) return;
    // Snapshot the thread so far as history for the assistant, then add the turn.
    const history = chat.map((m) => ({ from: m.from, text: m.text }));
    setChat((c) => [...c, { from: 'me', text }]);
    setInput('');
    scrollDown();
    try {
      const { reply } = await ask.mutateAsync({ message: text, history });
      setChat((c) => [...c, { from: 'bot', text: reply }]);
    } catch {
      setChat((c) => [...c, { from: 'bot', text: ERROR_REPLY }]);
    }
    scrollDown();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: insets.top }}>
        <SubHeader
          title="Ask Sakhi"
          subtitle="Ask about your safety"
          action={
            started ? (
              <Pressable onPress={reset} hitSlop={8} style={styles.reset}>
                <Text style={styles.resetText}>New chat</Text>
              </Pressable>
            ) : undefined
          }
        />
      </View>

      <ScrollView ref={scroll} contentContainerStyle={styles.thread} showsVerticalScrollIndicator={false}>
        {chat.map((m, i) => {
          const mine = m.from === 'me';
          return (
            <View key={i} style={[styles.bubble, mine ? styles.me : styles.bot]}>
              {mine ? (
                <Text style={[styles.text, styles.textMe]}>{m.text}</Text>
              ) : (
                <BotText text={m.text} />
              )}
            </View>
          );
        })}
        {ask.isPending ? (
          <View style={[styles.bubble, styles.bot]}>
            <Text style={[styles.text, styles.typing]}>Sakhi is typing…</Text>
          </View>
        ) : null}
      </ScrollView>

      {!started ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickWrap} contentContainerStyle={styles.quick}>
          {quickReplies.map((q) => (
            <Pressable key={q.label} onPress={() => send(q.user)} style={styles.chip} disabled={ask.isPending}>
              <Text style={styles.chipText}>{q.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View style={[styles.composer, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          placeholderTextColor={colors.ink400}
          returnKeyType="send"
          onSubmitEditing={() => send(input)}
          editable={!ask.isPending}
        />
        <IconButton icon="navigation" variant="inverse" onPress={() => send(input)} />
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
  bold: { fontFamily: figtree(700), color: colors.ink900 },
  heading: { fontFamily: figtree(700), fontSize: 16 },
  typing: { color: colors.ink400 },
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
  reset: {
    borderWidth: 1,
    borderColor: colors.ink200,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  resetText: { fontFamily: figtree(600), fontSize: 13, color: colors.ink700 },
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
  input: {
    flex: 1,
    backgroundColor: colors.ink050,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: figtree(400),
    fontSize: 15,
    color: colors.ink900,
  },
});
