import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquarePlus, History } from 'lucide-react-native';
import { useAssistantStore, useSettingsStore } from '@/stores';
import { ChatInterface } from '@/components/assistant';

export default function AssistantScreen() {
  const { createConversation, getCurrentConversation } = useAssistantStore();
  const { llmProvider, llmModel } = useSettingsStore();

  const conversation = getCurrentConversation();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <View>
          <Text className="text-lg font-bold text-foreground">Health Assistant</Text>
          <Text className="text-xs text-muted-foreground">
            {llmProvider} · {llmModel}
          </Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity
            onPress={createConversation}
            className="p-2 mr-2"
          >
            <MessageSquarePlus size={22} color="#22c55e" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <History size={22} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Interface */}
      <ChatInterface />
    </SafeAreaView>
  );
}
