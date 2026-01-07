import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { clsx } from 'clsx';
import {
  Sparkles,
  Bot,
  Smartphone,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Settings,
  AlertCircle,
} from 'lucide-react-native';
import { useSettingsStore } from '@/stores';
import { LLMProviderType, OPENAI_MODELS, GEMINI_MODELS, LOCAL_MODELS } from '@/types/llm';
import { Button, Card, Input, Alert } from '@/components/ui';

const providerInfo: Record<
  LLMProviderType,
  { name: string; icon: React.ReactNode; description: string; requiresKey: boolean }
> = {
  openai: {
    name: 'OpenAI',
    icon: <Sparkles size={24} color="#22c55e" />,
    description: 'GPT-4o and GPT-3.5 models. Best quality responses.',
    requiresKey: true,
  },
  gemini: {
    name: 'Google Gemini',
    icon: <Bot size={24} color="#4285f4" />,
    description: 'Gemini Pro models. Good alternative to OpenAI.',
    requiresKey: true,
  },
  local: {
    name: 'Local Model',
    icon: <Smartphone size={24} color="#8b5cf6" />,
    description: 'On-device inference. Works offline but limited capabilities.',
    requiresKey: false,
  },
};

export function LLMProviderSelector() {
  const {
    llmProvider,
    llmModel,
    openaiApiKey,
    geminiApiKey,
    setLLMProvider,
    setLLMModel,
    setOpenAIApiKey,
    setGeminiApiKey,
  } = useSettingsStore();

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [editingProvider, setEditingProvider] = useState<'openai' | 'gemini' | null>(null);

  const handleProviderSelect = (provider: LLMProviderType) => {
    if (provider === 'openai' && !openaiApiKey) {
      setEditingProvider('openai');
      setTempApiKey('');
      setShowApiKeyModal(true);
      return;
    }
    if (provider === 'gemini' && !geminiApiKey) {
      setEditingProvider('gemini');
      setTempApiKey('');
      setShowApiKeyModal(true);
      return;
    }
    setLLMProvider(provider);
  };

  const handleSaveApiKey = () => {
    if (editingProvider === 'openai') {
      setOpenAIApiKey(tempApiKey || null);
      if (tempApiKey) setLLMProvider('openai');
    } else if (editingProvider === 'gemini') {
      setGeminiApiKey(tempApiKey || null);
      if (tempApiKey) setLLMProvider('gemini');
    }
    setShowApiKeyModal(false);
    setTempApiKey('');
    setEditingProvider(null);
  };

  const getModelsForProvider = (provider: LLMProviderType) => {
    switch (provider) {
      case 'openai': return OPENAI_MODELS;
      case 'gemini': return GEMINI_MODELS;
      case 'local': return LOCAL_MODELS;
    }
  };

  const currentModels = getModelsForProvider(llmProvider);
  const currentModelInfo = currentModels.find((m) => m.id === llmModel);

  return (
    <View>
      {/* Provider Selection */}
      <Text className="text-lg font-bold text-foreground mb-3">AI Provider</Text>
      
      {(['openai', 'gemini', 'local'] as LLMProviderType[]).map((provider) => {
        const info = providerInfo[provider];
        const isSelected = llmProvider === provider;
        const hasKey = provider === 'openai' ? !!openaiApiKey : provider === 'gemini' ? !!geminiApiKey : true;

        return (
          <TouchableOpacity
            key={provider}
            onPress={() => handleProviderSelect(provider)}
            className={clsx(
              'flex-row items-center p-4 rounded-xl mb-2 border',
              isSelected ? 'border-primary-500 bg-primary-50' : 'border-border bg-white'
            )}
          >
            <View className="w-10 h-10 rounded-full bg-muted items-center justify-center">
              {info.icon}
            </View>
            <View className="flex-1 ml-3">
              <View className="flex-row items-center">
                <Text className="font-semibold text-foreground">{info.name}</Text>
                {info.requiresKey && (
                  <View
                    className={clsx(
                      'ml-2 px-2 py-0.5 rounded-full',
                      hasKey ? 'bg-green-100' : 'bg-yellow-100'
                    )}
                  >
                    <Text
                      className={clsx(
                        'text-xs font-medium',
                        hasKey ? 'text-green-700' : 'text-yellow-700'
                      )}
                    >
                      {hasKey ? 'Configured' : 'Needs API Key'}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-sm text-muted-foreground mt-0.5">
                {info.description}
              </Text>
            </View>
            {isSelected && (
              <View className="w-6 h-6 rounded-full bg-primary-500 items-center justify-center">
                <Check size={14} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* Model Selection */}
      <TouchableOpacity
        onPress={() => setShowModelModal(true)}
        className="flex-row items-center justify-between p-4 rounded-xl border border-border bg-white mt-4"
      >
        <View>
          <Text className="text-sm text-muted-foreground">Model</Text>
          <Text className="font-semibold text-foreground">
            {currentModelInfo?.name || llmModel}
          </Text>
        </View>
        <ChevronRight size={20} color="#64748b" />
      </TouchableOpacity>

      {/* API Key Management */}
      {(llmProvider === 'openai' || llmProvider === 'gemini') && (
        <TouchableOpacity
          onPress={() => {
            setEditingProvider(llmProvider);
            setTempApiKey(
              llmProvider === 'openai' ? openaiApiKey || '' : geminiApiKey || ''
            );
            setShowApiKeyModal(true);
          }}
          className="flex-row items-center justify-between p-4 rounded-xl border border-border bg-white mt-2"
        >
          <View>
            <Text className="text-sm text-muted-foreground">API Key</Text>
            <Text className="font-semibold text-foreground">
              {llmProvider === 'openai'
                ? openaiApiKey
                  ? '••••••••' + openaiApiKey.slice(-4)
                  : 'Not set'
                : geminiApiKey
                ? '••••••••' + geminiApiKey.slice(-4)
                : 'Not set'}
            </Text>
          </View>
          <Settings size={20} color="#64748b" />
        </TouchableOpacity>
      )}

      {/* Local model notice */}
      {llmProvider === 'local' && (
        <Alert variant="warning" className="mt-4">
          Local models are not yet implemented. The app will use rule-based responses when offline.
        </Alert>
      )}

      {/* API Key Modal */}
      <Modal
        visible={showApiKeyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-foreground mb-4">
              {editingProvider === 'openai' ? 'OpenAI' : 'Gemini'} API Key
            </Text>

            <View className="flex-row items-center bg-muted rounded-xl px-4 mb-4">
              <TextInput
                value={tempApiKey}
                onChangeText={setTempApiKey}
                placeholder={`Enter your ${editingProvider === 'openai' ? 'OpenAI' : 'Gemini'} API key`}
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 h-12 text-foreground"
              />
              <TouchableOpacity onPress={() => setShowKey(!showKey)}>
                {showKey ? (
                  <EyeOff size={20} color="#64748b" />
                ) : (
                  <Eye size={20} color="#64748b" />
                )}
              </TouchableOpacity>
            </View>

            <Text className="text-sm text-muted-foreground mb-6">
              Your API key is stored locally and never sent to our servers.
              {editingProvider === 'openai'
                ? ' Get your key at platform.openai.com'
                : ' Get your key at makersuite.google.com'}
            </Text>

            <View className="flex-row space-x-3">
              <Button
                variant="outline"
                onPress={() => {
                  setShowApiKeyModal(false);
                  setTempApiKey('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onPress={handleSaveApiKey} className="flex-1">
                Save
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Model Selection Modal */}
      <Modal
        visible={showModelModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModelModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[70%]">
            <Text className="text-xl font-bold text-foreground mb-4">
              Select Model
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {currentModels.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  onPress={() => {
                    setLLMModel(model.id);
                    setShowModelModal(false);
                  }}
                  className={clsx(
                    'p-4 rounded-xl mb-2 border',
                    llmModel === model.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-border bg-white'
                  )}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-foreground">
                      {model.name}
                    </Text>
                    {llmModel === model.id && (
                      <Check size={18} color="#22c55e" />
                    )}
                  </View>
                  <Text className="text-sm text-muted-foreground mt-1">
                    {model.description}
                  </Text>
                  <View className="flex-row mt-2">
                    <Text className="text-xs text-muted-foreground">
                      Context: {(model.contextWindow / 1000).toFixed(0)}k tokens
                    </Text>
                    {model.costPer1kTokens && (
                      <Text className="text-xs text-muted-foreground ml-3">
                        ${model.costPer1kTokens}/1k tokens
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button
              variant="outline"
              onPress={() => setShowModelModal(false)}
              className="mt-4"
            >
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
