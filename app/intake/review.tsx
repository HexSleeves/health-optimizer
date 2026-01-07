import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Heart, Pill, AlertTriangle, Target, Check, Edit, Sparkles } from 'lucide-react-native';
import { useHealthStore, useUserStore, usePlansStore } from '@/stores';
import { Button, Card, CardContent, Alert } from '@/components/ui';
import { ConditionBadge } from '@/components/health';

export default function ReviewScreen() {
  const { conditions, medications, allergies, goals, completeIntake } = useHealthStore();
  const { setIntakeCompleted } = useUserStore();
  const { generateAllPlans } = usePlansStore();

  const handleComplete = async () => {
    completeIntake();
    setIntakeCompleted(true);
    
    // Navigate back to home and start generating plans
    router.replace('/(tabs)');
    
    // Generate plans in the background
    if (conditions.length > 0 || goals.length > 0) {
      generateAllPlans();
    }
  };

  const hasData = conditions.length > 0 || medications.length > 0 || allergies.length > 0 || goals.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View className="flex-row mb-6 mt-4">
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              className="flex-1 h-1 rounded-full mx-0.5 bg-primary-500"
            />
          ))}
        </View>

        {/* Header */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center mb-3">
            <Sparkles size={32} color="#22c55e" />
          </View>
          <Text className="text-xl font-bold text-foreground">Review Your Profile</Text>
          <Text className="text-muted-foreground text-center mt-1">
            Make sure everything looks correct before we generate your personalized plans.
          </Text>
        </View>

        {/* Conditions Summary */}
        <Card className="mb-4">
          <CardContent>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Heart size={18} color="#ef4444" />
                <Text className="font-semibold text-foreground ml-2">Health Conditions</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/intake/conditions')}>
                <Edit size={18} color="#22c55e" />
              </TouchableOpacity>
            </View>
            {conditions.length === 0 ? (
              <Text className="text-muted-foreground">None added</Text>
            ) : (
              <View className="flex-row flex-wrap">
                {conditions.map((condition) => (
                  <View key={condition.id} className="mr-2 mb-2">
                    <ConditionBadge
                      name={condition.name}
                      severity={condition.severity}
                      size="sm"
                    />
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Medications Summary */}
        <Card className="mb-4">
          <CardContent>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Pill size={18} color="#8b5cf6" />
                <Text className="font-semibold text-foreground ml-2">Medications</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/intake/medications')}>
                <Edit size={18} color="#22c55e" />
              </TouchableOpacity>
            </View>
            {medications.length === 0 ? (
              <Text className="text-muted-foreground">None added</Text>
            ) : (
              <View>
                {medications.map((med) => (
                  <Text key={med.id} className="text-foreground">
                    • {med.name} ({med.dosage})
                  </Text>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Allergies Summary */}
        <Card className="mb-4">
          <CardContent>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <AlertTriangle size={18} color="#f59e0b" />
                <Text className="font-semibold text-foreground ml-2">Allergies</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/intake/allergies')}>
                <Edit size={18} color="#22c55e" />
              </TouchableOpacity>
            </View>
            {allergies.length === 0 ? (
              <Text className="text-muted-foreground">None added</Text>
            ) : (
              <View className="flex-row flex-wrap">
                {allergies.map((allergy) => (
                  <View
                    key={allergy.id}
                    className="bg-red-50 rounded-full px-2 py-1 mr-2 mb-2"
                  >
                    <Text className="text-red-700 text-sm">{allergy.allergen}</Text>
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Goals Summary */}
        <Card className="mb-4">
          <CardContent>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Target size={18} color="#22c55e" />
                <Text className="font-semibold text-foreground ml-2">Health Goals</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/intake/goals')}>
                <Edit size={18} color="#22c55e" />
              </TouchableOpacity>
            </View>
            {goals.length === 0 ? (
              <Text className="text-muted-foreground">None added</Text>
            ) : (
              <View>
                {goals.map((goal) => (
                  <View key={goal.id} className="flex-row items-center mb-1">
                    <View
                      className={`w-2 h-2 rounded-full mr-2 ${
                        goal.priority === 'high'
                          ? 'bg-red-500'
                          : goal.priority === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    />
                    <Text className="text-foreground">{goal.title}</Text>
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        {hasData && (
          <Alert variant="default" className="mb-6">
            After completing your profile, we'll generate personalized diet, exercise, supplement, and lifestyle recommendations tailored to your needs.
          </Alert>
        )}

        {!hasData && (
          <Alert variant="warning" className="mb-6">
            You haven't added any health information yet. Adding conditions and goals helps us provide better recommendations.
          </Alert>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-4 py-4 border-t border-border">
        <Button
          onPress={handleComplete}
          leftIcon={<Check size={18} color="#ffffff" />}
        >
          Complete Profile
        </Button>
      </View>
    </SafeAreaView>
  );
}
