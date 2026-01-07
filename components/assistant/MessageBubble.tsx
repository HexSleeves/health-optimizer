import React from 'react';
import { View, Text } from 'react-native';
import { clsx } from 'clsx';
import { Bot, User, AlertTriangle } from 'lucide-react-native';
import { Message } from '@/types/llm';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const hasSafetyFlags = message.safetyFlags && message.safetyFlags.length > 0;

  return (
    <View
      className={clsx(
        'flex-row mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center mr-2 mt-1">
          <Bot size={18} color="#22c55e" />
        </View>
      )}

      <View
        className={clsx(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary-500 rounded-br-sm'
            : 'bg-muted rounded-bl-sm'
        )}
      >
        {hasSafetyFlags && (
          <View className="flex-row items-center mb-2 pb-2 border-b border-yellow-300">
            <AlertTriangle size={14} color="#f59e0b" />
            <Text className="ml-1 text-xs text-yellow-600">
              Safety notice
            </Text>
          </View>
        )}

        <Text
          className={clsx(
            'text-base leading-6',
            isUser ? 'text-white' : 'text-foreground'
          )}
        >
          {message.content}
          {isStreaming && (
            <Text className="text-primary-300">█</Text>
          )}
        </Text>

        {!isUser && message.providerUsed && (
          <Text className="text-xs text-muted-foreground mt-2">
            via {message.providerUsed}
            {message.modelUsed && ` · ${message.modelUsed}`}
          </Text>
        )}
      </View>

      {isUser && (
        <View className="w-8 h-8 rounded-full bg-primary-500 items-center justify-center ml-2 mt-1">
          <User size={18} color="#ffffff" />
        </View>
      )}
    </View>
  );
}

// Typing indicator component
export function TypingIndicator() {
  return (
    <View className="flex-row items-center mb-4">
      <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center mr-2">
        <Bot size={18} color="#22c55e" />
      </View>
      <View className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
        <View className="flex-row items-center space-x-1">
          <TypingDot delay={0} />
          <TypingDot delay={150} />
          <TypingDot delay={300} />
        </View>
      </View>
    </View>
  );
}

function TypingDot({ delay }: { delay: number }) {
  const [opacity, setOpacity] = React.useState(0.3);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setOpacity((prev) => (prev === 0.3 ? 1 : 0.3));
    }, 500);

    const timeout = setTimeout(() => {
      // Initial delay before starting animation
    }, delay);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [delay]);

  return (
    <View
      className="w-2 h-2 rounded-full bg-muted-foreground mx-0.5"
      style={{ opacity }}
    />
  );
}
