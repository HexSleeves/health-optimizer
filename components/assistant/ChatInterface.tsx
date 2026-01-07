import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Mic, Paperclip, RefreshCw } from 'lucide-react-native';
import { useAssistantStore } from '@/stores';
import { MessageBubble, TypingIndicator } from './MessageBubble';
import { Alert } from '@/components/ui';

export function ChatInterface() {
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  const {
    getCurrentMessages,
    getCurrentConversation,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    clearError,
  } = useAssistantStore();

  const messages = getCurrentMessages();
  const conversation = getCurrentConversation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!inputText.trim() || isStreaming) return;
    
    const message = inputText.trim();
    setInputText('');
    await sendMessage(message);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      keyboardVerticalOffset={90}
    >
      <View className="flex-1 bg-background">
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome message if no messages */}
          {messages.length === 0 && (
            <View className="items-center justify-center py-12">
              <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center mb-4">
                <Text className="text-3xl">🌿</Text>
              </View>
              <Text className="text-xl font-bold text-foreground mb-2">
                Health Assistant
              </Text>
              <Text className="text-center text-muted-foreground px-8">
                Ask me about diet, exercise, supplements, or lifestyle recommendations personalized to your health profile.
              </Text>

              {/* Quick suggestions */}
              <View className="mt-6 w-full">
                <Text className="text-sm font-medium text-muted-foreground mb-3">
                  Try asking:
                </Text>
                {[
                  'What foods should I eat for my condition?',
                  'Create a workout plan for me',
                  'What supplements might help me?',
                  'How can I improve my sleep?',
                ].map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setInputText(suggestion);
                      handleSend();
                    }}
                    className="bg-muted rounded-xl p-3 mb-2"
                  >
                    <Text className="text-foreground">{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Message list */}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Streaming message */}
          {isStreaming && streamingContent && (
            <MessageBubble
              message={{
                id: 'streaming',
                conversationId: conversation?.id || '',
                role: 'assistant',
                content: streamingContent,
                timestamp: new Date().toISOString(),
                safetyFlags: [],
              }}
              isStreaming
            />
          )}

          {/* Typing indicator */}
          {isStreaming && !streamingContent && <TypingIndicator />}

          {/* Error message */}
          {error && (
            <Alert
              variant="destructive"
              title="Error"
              className="mb-4"
            >
              {error}
              <TouchableOpacity onPress={clearError} className="mt-2">
                <Text className="text-destructive font-medium">Dismiss</Text>
              </TouchableOpacity>
            </Alert>
          )}

          {/* Bottom padding */}
          <View className="h-4" />
        </ScrollView>

        {/* Input area */}
        <View className="border-t border-border bg-white px-4 py-3">
          <View className="flex-row items-end">
            {/* Attachment button (future feature) */}
            {/* <TouchableOpacity className="mr-2 mb-2">
              <Paperclip size={24} color="#64748b" />
            </TouchableOpacity> */}

            {/* Text input */}
            <View className="flex-1 bg-muted rounded-2xl px-4 py-2 mr-2">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about your health..."
                placeholderTextColor="#94a3b8"
                multiline
                maxLength={2000}
                className="text-base text-foreground max-h-24"
                editable={!isStreaming}
              />
            </View>

            {/* Send button */}
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isStreaming}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                inputText.trim() && !isStreaming
                  ? 'bg-primary-500'
                  : 'bg-muted'
              }`}
            >
              {isStreaming ? (
                <RefreshCw size={20} color="#64748b" />
              ) : (
                <Send
                  size={20}
                  color={inputText.trim() ? '#ffffff' : '#64748b'}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Disclaimer */}
          <Text className="text-xs text-muted-foreground text-center mt-2">
            Not medical advice. Consult a healthcare provider for medical decisions.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
