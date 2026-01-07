import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Utensils,
  Dumbbell,
  Pill,
  Moon,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Check,
  Clock,
} from 'lucide-react-native';
import { usePlansStore, useHealthStore } from '@/stores';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Progress } from '@/components/ui';

export default function PlansScreen() {
  const {
    dietPlan,
    exercisePlan,
    supplementPlan,
    lifestylePlan,
    isGenerating,
    generatingType,
    generationProgress,
    generateAllPlans,
  } = usePlansStore();

  const { conditions } = useHealthStore();

  const handleGeneratePlans = async () => {
    await generateAllPlans();
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-2xl font-bold text-foreground">Your Plans</Text>
          <Text className="text-muted-foreground mt-1">
            Personalized recommendations based on your profile
          </Text>
        </View>

        {/* Generation Progress */}
        {isGenerating && (
          <View className="px-4 mb-6">
            <Card className="bg-primary-50 border-primary-200">
              <CardContent>
                <View className="flex-row items-center mb-3">
                  <ActivityIndicator size="small" color="#22c55e" />
                  <Text className="ml-2 font-medium text-foreground">
                    Generating {generatingType === 'all' ? 'all plans' : `${generatingType} plan`}...
                  </Text>
                </View>
                <Progress value={generationProgress} color="primary" />
                <Text className="text-sm text-muted-foreground mt-2">
                  This may take a moment as we analyze your health profile.
                </Text>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Generate All Plans Button */}
        {!isGenerating && (
          <View className="px-4 mb-6">
            <Button
              onPress={handleGeneratePlans}
              leftIcon={<Sparkles size={18} color="#ffffff" />}
              disabled={conditions.length === 0}
            >
              {dietPlan || exercisePlan || supplementPlan || lifestylePlan
                ? 'Regenerate All Plans'
                : 'Generate Personalized Plans'}
            </Button>
            {conditions.length === 0 && (
              <Text className="text-sm text-muted-foreground text-center mt-2">
                Complete your health profile first
              </Text>
            )}
          </View>
        )}

        {/* Diet Plan */}
        <View className="px-4 mb-4">
          <PlanCard
            title="Diet Plan"
            description={dietPlan?.description || 'Personalized nutrition guidance'}
            icon={<Utensils size={24} color="#f97316" />}
            color="bg-orange-100"
            isActive={!!dietPlan?.isActive}
            lastUpdated={dietPlan?.generatedAt}
            metrics={
              dietPlan
                ? [
                    { label: 'Daily Calories', value: `${dietPlan.dailyCalories}` },
                    { label: 'Protein', value: `${dietPlan.macroRatios.protein}%` },
                  ]
                : undefined
            }
          />
        </View>

        {/* Exercise Plan */}
        <View className="px-4 mb-4">
          <PlanCard
            title="Exercise Plan"
            description={exercisePlan?.description || 'Customized workout program'}
            icon={<Dumbbell size={24} color="#3b82f6" />}
            color="bg-blue-100"
            isActive={!!exercisePlan?.isActive}
            lastUpdated={exercisePlan?.generatedAt}
            metrics={
              exercisePlan
                ? [
                    { label: 'Days/Week', value: `${exercisePlan.daysPerWeek}` },
                    { label: 'Duration', value: `${exercisePlan.sessionDurationMinutes}m` },
                  ]
                : undefined
            }
          />
        </View>

        {/* Supplement Plan */}
        <View className="px-4 mb-4">
          <PlanCard
            title="Supplement Plan"
            description={supplementPlan?.description || 'Evidence-based supplementation'}
            icon={<Pill size={24} color="#8b5cf6" />}
            color="bg-purple-100"
            isActive={!!supplementPlan?.isActive}
            lastUpdated={supplementPlan?.generatedAt}
            metrics={
              supplementPlan
                ? [
                    {
                      label: 'Est. Cost',
                      value: supplementPlan.estimatedMonthlyCost
                        ? `$${(supplementPlan.estimatedMonthlyCost / 100).toFixed(0)}/mo`
                        : '-',
                    },
                  ]
                : undefined
            }
          />
        </View>

        {/* Lifestyle Plan */}
        <View className="px-4 mb-8">
          <PlanCard
            title="Lifestyle Plan"
            description={lifestylePlan?.description || 'Sleep, stress & daily habits'}
            icon={<Moon size={24} color="#06b6d4" />}
            color="bg-cyan-100"
            isActive={!!lifestylePlan?.isActive}
            lastUpdated={lifestylePlan?.generatedAt}
            metrics={
              lifestylePlan
                ? [
                    { label: 'Sleep Target', value: `${lifestylePlan.sleep.targetHours}h` },
                    {
                      label: 'Hydration',
                      value: `${(lifestylePlan.hydration.dailyGoalMl / 1000).toFixed(1)}L`,
                    },
                  ]
                : undefined
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface PlanCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isActive: boolean;
  lastUpdated?: string;
  metrics?: { label: string; value: string }[];
}

function PlanCard({
  title,
  description,
  icon,
  color,
  isActive,
  lastUpdated,
  metrics,
}: PlanCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.7}>
      <Card>
        <CardContent>
          <View className="flex-row items-start">
            <View className={`w-12 h-12 rounded-xl ${color} items-center justify-center`}>
              {icon}
            </View>
            <View className="flex-1 ml-3">
              <View className="flex-row items-center">
                <Text className="font-semibold text-foreground text-lg">{title}</Text>
                {isActive && (
                  <View className="ml-2 flex-row items-center bg-green-100 px-2 py-0.5 rounded-full">
                    <Check size={12} color="#22c55e" />
                    <Text className="text-xs text-green-700 ml-1">Active</Text>
                  </View>
                )}
              </View>
              <Text className="text-sm text-muted-foreground mt-0.5">{description}</Text>

              {/* Metrics */}
              {metrics && metrics.length > 0 && (
                <View className="flex-row mt-3">
                  {metrics.map((metric, index) => (
                    <View key={metric.label} className={index > 0 ? 'ml-4' : ''}>
                      <Text className="text-xs text-muted-foreground">{metric.label}</Text>
                      <Text className="font-bold text-foreground">{metric.value}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Last Updated */}
              {lastUpdated && (
                <View className="flex-row items-center mt-3">
                  <Clock size={12} color="#94a3b8" />
                  <Text className="text-xs text-muted-foreground ml-1">
                    Updated {formatTimeAgo(lastUpdated)}
                  </Text>
                </View>
              )}
            </View>
            <ChevronRight size={20} color="#94a3b8" />
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
}
