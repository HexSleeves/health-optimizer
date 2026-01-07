import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Heart,
  Shield,
  Bell,
  Palette,
  Database,
  Trash2,
  LogOut,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';
import { useUserStore, useHealthStore, useSettingsStore, useAssistantStore, usePlansStore } from '@/stores';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { LLMProviderSelector } from '@/components/settings';
import { HealthKitSyncStatus } from '@/components/health';

export default function SettingsScreen() {
  const { user, logout } = useUserStore();
  const { healthKitAuthorized, requestHealthKitPermissions, resetHealthData } = useHealthStore();
  const {
    theme,
    notificationsEnabled,
    healthKitBackgroundSync,
    shareDataWithLLM,
    storeConversations,
    setTheme,
    setNotificationsEnabled,
    setHealthKitBackgroundSync,
    setShareDataWithLLM,
    setStoreConversations,
    resetSettings,
  } = useSettingsStore();
  const { resetAssistant } = useAssistantStore();
  const { resetPlans } = usePlansStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            resetHealthData();
            resetAssistant();
            resetPlans();
            resetSettings();
          },
        },
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your health data, plans, and conversations. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            resetHealthData();
            resetAssistant();
            resetPlans();
            Alert.alert('Data Deleted', 'All your data has been deleted.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-2xl font-bold text-foreground">Settings</Text>
        </View>

        {/* Account */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
            Account
          </Text>
          <Card>
            <CardContent>
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
                  <User size={24} color="#22c55e" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-foreground">
                    {user?.name || 'User'}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {user?.email || 'Not signed in'}
                  </Text>
                </View>
                <ChevronRight size={20} color="#94a3b8" />
              </View>
            </CardContent>
          </Card>
        </View>

        {/* AI Provider */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
            AI Assistant
          </Text>
          <Card>
            <CardContent>
              <LLMProviderSelector />
            </CardContent>
          </Card>
        </View>

        {/* HealthKit */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
            Health Data
          </Text>
          <Card>
            <CardContent>
              <HealthKitSyncStatus />

              {!healthKitAuthorized && (
                <Button
                  variant="outline"
                  onPress={requestHealthKitPermissions}
                  className="mt-3"
                  leftIcon={<Heart size={18} color="#22c55e" />}
                >
                  Connect HealthKit
                </Button>
              )}

              <SettingRow
                label="Background Sync"
                description="Sync HealthKit data in background"
                value={healthKitBackgroundSync}
                onValueChange={setHealthKitBackgroundSync}
                disabled={!healthKitAuthorized}
              />
            </CardContent>
          </Card>
        </View>

        {/* Privacy */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
            Privacy
          </Text>
          <Card>
            <CardContent>
              <SettingRow
                label="Share Health Data with AI"
                description="Include health profile in AI context"
                value={shareDataWithLLM}
                onValueChange={setShareDataWithLLM}
              />
              <View className="border-t border-border my-3" />
              <SettingRow
                label="Store Conversations"
                description="Save chat history locally"
                value={storeConversations}
                onValueChange={setStoreConversations}
              />
            </CardContent>
          </Card>
        </View>

        {/* Preferences */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
            Preferences
          </Text>
          <Card>
            <CardContent>
              <SettingRow
                label="Notifications"
                description="Receive reminders and updates"
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
              <View className="border-t border-border my-3" />
              <TouchableOpacity className="flex-row items-center justify-between py-2">
                <View>
                  <Text className="font-medium text-foreground">Theme</Text>
                  <Text className="text-sm text-muted-foreground">
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </Text>
                </View>
                <ChevronRight size={20} color="#94a3b8" />
              </TouchableOpacity>
            </CardContent>
          </Card>
        </View>

        {/* Danger Zone */}
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-destructive mb-2 uppercase">
            Danger Zone
          </Text>
          <Card className="border-red-200">
            <CardContent>
              <TouchableOpacity
                onPress={handleDeleteData}
                className="flex-row items-center py-2"
              >
                <Trash2 size={20} color="#ef4444" />
                <View className="ml-3 flex-1">
                  <Text className="font-medium text-destructive">Delete All Data</Text>
                  <Text className="text-sm text-muted-foreground">
                    Remove all health data and conversations
                  </Text>
                </View>
              </TouchableOpacity>
              <View className="border-t border-red-100 my-3" />
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center py-2"
              >
                <LogOut size={20} color="#ef4444" />
                <View className="ml-3 flex-1">
                  <Text className="font-medium text-destructive">Sign Out</Text>
                  <Text className="text-sm text-muted-foreground">
                    Sign out of your account
                  </Text>
                </View>
              </TouchableOpacity>
            </CardContent>
          </Card>
        </View>

        {/* About */}
        <View className="px-4 mb-8">
          <Text className="text-sm font-semibold text-muted-foreground mb-2 uppercase">
            About
          </Text>
          <Card>
            <CardContent>
              <TouchableOpacity className="flex-row items-center justify-between py-2">
                <Text className="font-medium text-foreground">Privacy Policy</Text>
                <ExternalLink size={18} color="#94a3b8" />
              </TouchableOpacity>
              <View className="border-t border-border my-2" />
              <TouchableOpacity className="flex-row items-center justify-between py-2">
                <Text className="font-medium text-foreground">Terms of Service</Text>
                <ExternalLink size={18} color="#94a3b8" />
              </TouchableOpacity>
              <View className="border-t border-border my-2" />
              <View className="flex-row items-center justify-between py-2">
                <Text className="font-medium text-foreground">Version</Text>
                <Text className="text-muted-foreground">1.0.0</Text>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

function SettingRow({ label, description, value, onValueChange, disabled }: SettingRowProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-1 mr-4">
        <Text className={`font-medium ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}>
          {label}
        </Text>
        {description && (
          <Text className="text-sm text-muted-foreground">{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#e2e8f0', true: '#86efac' }}
        thumbColor={value ? '#22c55e' : '#f4f4f5'}
      />
    </View>
  );
}
