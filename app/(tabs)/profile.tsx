import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  User,
  Heart,
  Pill,
  AlertTriangle,
  Target,
  ChevronRight,
  Edit,
  Plus,
} from 'lucide-react-native';
import { useUserStore, useHealthStore } from '@/stores';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { ConditionBadge, SeverityIndicator } from '@/components/health';

export default function ProfileScreen() {
  const { user } = useUserStore();
  const {
    conditions,
    medications,
    allergies,
    goals,
    baselineMetrics,
    preferences,
  } = useHealthStore();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 pb-6">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center">
              <User size={32} color="#22c55e" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-bold text-foreground">
                {user?.name || 'Your Profile'}
              </Text>
              <Text className="text-muted-foreground">{user?.email}</Text>
            </View>
            <TouchableOpacity className="p-2">
              <Edit size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Metrics */}
        {baselineMetrics && (
          <View className="px-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <View className="flex-row flex-wrap">
                  <MetricItem label="Age" value={`${baselineMetrics.age || '-'}`} />
                  <MetricItem label="Sex" value={baselineMetrics.sex || '-'} />
                  <MetricItem
                    label="Height"
                    value={baselineMetrics.heightCm ? `${baselineMetrics.heightCm} cm` : '-'}
                  />
                  <MetricItem
                    label="Weight"
                    value={baselineMetrics.weightKg ? `${baselineMetrics.weightKg} kg` : '-'}
                  />
                </View>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Health Conditions */}
        <View className="px-4 mb-6">
          <Card>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Heart size={20} color="#ef4444" />
                  <CardTitle className="ml-2">Health Conditions</CardTitle>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/intake/conditions')}
                  className="flex-row items-center"
                >
                  <Plus size={18} color="#22c55e" />
                </TouchableOpacity>
              </View>
            </CardHeader>
            <CardContent>
              {conditions.length === 0 ? (
                <Text className="text-muted-foreground text-center py-4">
                  No conditions added yet
                </Text>
              ) : (
                <View className="flex-row flex-wrap -m-1">
                  {conditions.map((condition) => (
                    <View key={condition.id} className="m-1">
                      <ConditionBadge
                        name={condition.name}
                        severity={condition.severity}
                      />
                    </View>
                  ))}
                </View>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Medications */}
        <View className="px-4 mb-6">
          <Card>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Pill size={20} color="#8b5cf6" />
                  <CardTitle className="ml-2">Medications</CardTitle>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/intake/medications')}
                  className="flex-row items-center"
                >
                  <Plus size={18} color="#22c55e" />
                </TouchableOpacity>
              </View>
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <Text className="text-muted-foreground text-center py-4">
                  No medications added yet
                </Text>
              ) : (
                <View>
                  {medications.map((med) => (
                    <View
                      key={med.id}
                      className="flex-row items-center py-2 border-b border-border last:border-b-0"
                    >
                      <View className="flex-1">
                        <Text className="font-medium text-foreground">{med.name}</Text>
                        <Text className="text-sm text-muted-foreground">
                          {med.dosage} - {med.frequency}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Allergies */}
        <View className="px-4 mb-6">
          <Card>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <AlertTriangle size={20} color="#f59e0b" />
                  <CardTitle className="ml-2">Allergies</CardTitle>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/intake/allergies')}
                  className="flex-row items-center"
                >
                  <Plus size={18} color="#22c55e" />
                </TouchableOpacity>
              </View>
            </CardHeader>
            <CardContent>
              {allergies.length === 0 ? (
                <Text className="text-muted-foreground text-center py-4">
                  No allergies added yet
                </Text>
              ) : (
                <View className="flex-row flex-wrap -m-1">
                  {allergies.map((allergy) => (
                    <View key={allergy.id} className="m-1">
                      <Badge
                        variant={
                          allergy.severity === 'anaphylactic' || allergy.severity === 'severe'
                            ? 'destructive'
                            : allergy.severity === 'moderate'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {allergy.allergen}
                      </Badge>
                    </View>
                  ))}
                </View>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Goals */}
        <View className="px-4 mb-6">
          <Card>
            <CardHeader>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Target size={20} color="#22c55e" />
                  <CardTitle className="ml-2">Health Goals</CardTitle>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/intake/goals')}
                  className="flex-row items-center"
                >
                  <Plus size={18} color="#22c55e" />
                </TouchableOpacity>
              </View>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <Text className="text-muted-foreground text-center py-4">
                  No goals set yet
                </Text>
              ) : (
                <View>
                  {goals.filter((g) => g.isActive).map((goal) => (
                    <View
                      key={goal.id}
                      className="flex-row items-center py-2 border-b border-border last:border-b-0"
                    >
                      <View
                        className={`w-2 h-2 rounded-full mr-3 ${
                          goal.priority === 'high'
                            ? 'bg-red-500'
                            : goal.priority === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                      />
                      <View className="flex-1">
                        <Text className="font-medium text-foreground">{goal.title}</Text>
                        {goal.description && (
                          <Text className="text-sm text-muted-foreground">
                            {goal.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Preferences */}
        {preferences && (
          <View className="px-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                {preferences.dietaryRestrictions.length > 0 && (
                  <View className="mb-3">
                    <Text className="text-sm text-muted-foreground mb-1">
                      Dietary Restrictions
                    </Text>
                    <View className="flex-row flex-wrap">
                      {preferences.dietaryRestrictions.map((restriction) => (
                        <Badge key={restriction} variant="secondary" className="mr-1 mb-1">
                          {restriction.replace('_', ' ')}
                        </Badge>
                      ))}
                    </View>
                  </View>
                )}

                <View className="flex-row flex-wrap">
                  <MetricItem
                    label="Fitness Level"
                    value={preferences.fitnessLevel.replace('_', ' ')}
                  />
                  <MetricItem
                    label="Workout Days"
                    value={`${preferences.preferredWorkoutDays}/week`}
                  />
                  <MetricItem
                    label="Sleep Goal"
                    value={`${preferences.sleepGoalHours}h`}
                  />
                </View>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Edit Profile Button */}
        <View className="px-4 mb-8">
          <Button
            variant="outline"
            onPress={() => router.push('/intake/conditions')}
            leftIcon={<Edit size={18} color="#22c55e" />}
          >
            Update Health Profile
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-1/2 py-2">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="font-medium text-foreground capitalize">{value}</Text>
    </View>
  );
}
