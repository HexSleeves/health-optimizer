import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Activity,
  Utensils,
  Dumbbell,
  Pill,
  Moon,
  ChevronRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native';
import { useUserStore, useHealthStore, usePlansStore } from '@/stores';
import { Card, CardContent, Button, Progress } from '@/components/ui';
import { HealthKitSyncStatus, HealthMetricsSummary } from '@/components/health';

export default function HomeScreen() {
  const { user, hasCompletedIntake } = useUserStore();
  const { conditions, healthKitData } = useHealthStore();
  const { dietPlan, exercisePlan, supplementPlan, lifestylePlan, getActivePlansCount } = usePlansStore();

  const today = healthKitData[healthKitData.length - 1];
  const activePlans = getActivePlansCount();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-2xl font-bold text-foreground">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!
          </Text>
          <Text className="text-muted-foreground mt-1">
            Here's your health overview
          </Text>
        </View>

        {/* Quick Actions if no intake completed */}
        {!hasCompletedIntake && (
          <View className="px-4 mb-6">
            <Card className="bg-primary-50 border-primary-200">
              <CardContent>
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
                    <Sparkles size={24} color="#22c55e" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="font-semibold text-foreground">
                      Complete Your Health Profile
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      Get personalized recommendations
                    </Text>
                  </View>
                </View>
                <Button
                  onPress={() => router.push('/intake/conditions')}
                  className="mt-4"
                >
                  Start Health Intake
                </Button>
              </CardContent>
            </Card>
          </View>
        )}

        {/* HealthKit Sync Status */}
        <View className="px-4 mb-6">
          <HealthKitSyncStatus />
        </View>

        {/* Today's Metrics */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-foreground">Today's Progress</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-sm text-primary-500 mr-1">See all</Text>
              <ChevronRight size={16} color="#22c55e" />
            </TouchableOpacity>
          </View>
          <HealthMetricsSummary />
        </View>

        {/* Active Plans Summary */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-foreground">Your Plans</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/plans')}
              className="flex-row items-center"
            >
              <Text className="text-sm text-primary-500 mr-1">
                {activePlans} active
              </Text>
              <ChevronRight size={16} color="#22c55e" />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap -mx-1">
            <PlanQuickCard
              title="Diet"
              icon={<Utensils size={20} color="#f97316" />}
              isActive={!!dietPlan?.isActive}
              onPress={() => router.push('/(tabs)/plans')}
              color="bg-orange-100"
            />
            <PlanQuickCard
              title="Exercise"
              icon={<Dumbbell size={20} color="#3b82f6" />}
              isActive={!!exercisePlan?.isActive}
              onPress={() => router.push('/(tabs)/plans')}
              color="bg-blue-100"
            />
            <PlanQuickCard
              title="Supplements"
              icon={<Pill size={20} color="#8b5cf6" />}
              isActive={!!supplementPlan?.isActive}
              onPress={() => router.push('/(tabs)/plans')}
              color="bg-purple-100"
            />
            <PlanQuickCard
              title="Lifestyle"
              icon={<Moon size={20} color="#06b6d4" />}
              isActive={!!lifestylePlan?.isActive}
              onPress={() => router.push('/(tabs)/plans')}
              color="bg-cyan-100"
            />
          </View>
        </View>

        {/* Health Conditions */}
        {conditions.length > 0 && (
          <View className="px-4 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-foreground">
                Managing {conditions.length} Condition{conditions.length > 1 ? 's' : ''}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/profile')}
                className="flex-row items-center"
              >
                <Text className="text-sm text-primary-500 mr-1">View</Text>
                <ChevronRight size={16} color="#22c55e" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap">
              {conditions.slice(0, 3).map((condition) => (
                <View
                  key={condition.id}
                  className="bg-muted rounded-full px-3 py-1.5 mr-2 mb-2"
                >
                  <Text className="text-sm text-foreground">{condition.name}</Text>
                </View>
              ))}
              {conditions.length > 3 && (
                <View className="bg-muted rounded-full px-3 py-1.5">
                  <Text className="text-sm text-muted-foreground">
                    +{conditions.length - 3} more
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Ask Assistant */}
        <View className="px-4 mb-8">
          <Card>
            <CardContent>
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center">
                  <Sparkles size={24} color="#22c55e" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="font-semibold text-foreground">
                    Health Assistant
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Ask questions about your health
                  </Text>
                </View>
              </View>
              <Button
                variant="outline"
                onPress={() => router.push('/(tabs)/assistant')}
                className="mt-4"
              >
                Start Conversation
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

interface PlanQuickCardProps {
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
  color: string;
}

function PlanQuickCard({ title, icon, isActive, onPress, color }: PlanQuickCardProps) {
  return (
    <TouchableOpacity onPress={onPress} className="w-1/2 p-1">
      <View className="bg-white rounded-xl border border-border p-3">
        <View className="flex-row items-center justify-between">
          <View className={`w-10 h-10 rounded-full ${color} items-center justify-center`}>
            {icon}
          </View>
          <View
            className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
          />
        </View>
        <Text className="font-medium text-foreground mt-2">{title}</Text>
        <Text className="text-xs text-muted-foreground">
          {isActive ? 'Active' : 'Not set up'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
