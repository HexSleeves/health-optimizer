import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Check, Target } from 'lucide-react-native';
import { useHealthStore } from '@/stores';
import { HealthGoal, GoalCategory } from '@/types/health';
import { Button, Card, CardContent, Input } from '@/components/ui';

const COMMON_GOALS: { title: string; category: GoalCategory; description: string }[] = [
  { title: 'Lose Weight', category: 'weight_loss', description: 'Reduce body weight healthily' },
  { title: 'Build Muscle', category: 'muscle_building', description: 'Increase lean muscle mass' },
  { title: 'Improve Energy', category: 'energy', description: 'Feel more energetic daily' },
  { title: 'Better Sleep', category: 'sleep', description: 'Improve sleep quality' },
  { title: 'Reduce Stress', category: 'stress_management', description: 'Manage stress better' },
  { title: 'Improve Endurance', category: 'endurance', description: 'Build cardiovascular fitness' },
  { title: 'Increase Flexibility', category: 'flexibility', description: 'Improve mobility and flexibility' },
  { title: 'Manage Condition', category: 'disease_management', description: 'Better manage health conditions' },
];

export default function GoalsScreen() {
  const { goals, addGoal, removeGoal, updateIntakeData } = useHealthStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleToggleGoal = (goalTemplate: { title: string; category: GoalCategory; description: string }) => {
    const existing = goals.find((g) => g.title === goalTemplate.title);
    if (existing) {
      removeGoal(existing.id);
    } else {
      const newGoal: HealthGoal = {
        id: Math.random().toString(36).substring(2),
        title: goalTemplate.title,
        category: goalTemplate.category,
        description: goalTemplate.description,
        priority: selectedPriority,
        isActive: true,
      };
      addGoal(newGoal);
    }
  };

  const handleAddCustom = () => {
    if (customTitle.trim()) {
      const newGoal: HealthGoal = {
        id: Math.random().toString(36).substring(2),
        title: customTitle.trim(),
        category: 'other',
        description: customDescription.trim() || undefined,
        priority: selectedPriority,
        isActive: true,
      };
      addGoal(newGoal);
      setCustomTitle('');
      setCustomDescription('');
      setShowAddForm(false);
    }
  };

  const handleNext = () => {
    updateIntakeData({ goals });
    router.push('/intake/review');
  };

  const handleSkip = () => {
    router.push('/intake/review');
  };

  const isGoalSelected = (title: string) => goals.some((g) => g.title === title);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View className="flex-row mb-6 mt-4">
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              className={`flex-1 h-1 rounded-full mx-0.5 ${
                step <= 4 ? 'bg-primary-500' : 'bg-muted'
              }`}
            />
          ))}
        </View>

        {/* Description */}
        <Text className="text-lg text-foreground mb-2">
          What are your health goals?
        </Text>
        <Text className="text-muted-foreground mb-6">
          Select your priorities so we can tailor recommendations to help you achieve them.
        </Text>

        {/* Priority Selector */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-muted-foreground mb-2">
            Default priority for goals
          </Text>
          <View className="flex-row">
            {(['low', 'medium', 'high'] as const).map((priority) => (
              <TouchableOpacity
                key={priority}
                onPress={() => setSelectedPriority(priority)}
                className={`flex-1 py-2 mx-0.5 rounded-lg items-center ${
                  selectedPriority === priority ? 'bg-primary-100' : 'bg-muted'
                }`}
              >
                <View
                  className={`w-3 h-3 rounded-full mb-1 ${
                    priority === 'high'
                      ? 'bg-red-500'
                      : priority === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
                <Text
                  className={`text-xs capitalize ${
                    selectedPriority === priority ? 'text-primary-700 font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Goal Selection */}
        <Text className="text-sm font-medium text-muted-foreground mb-2">
          Select your goals ({goals.length} selected)
        </Text>
        <View className="mb-4">
          {COMMON_GOALS.map((goalTemplate) => {
            const selected = isGoalSelected(goalTemplate.title);
            return (
              <TouchableOpacity
                key={goalTemplate.title}
                onPress={() => handleToggleGoal(goalTemplate)}
                className={`flex-row items-center p-4 rounded-xl mb-2 border ${
                  selected ? 'border-primary-500 bg-primary-50' : 'border-border bg-white'
                }`}
              >
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                    selected ? 'bg-primary-500' : 'bg-muted'
                  }`}
                >
                  {selected && <Check size={14} color="#ffffff" />}
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-foreground">{goalTemplate.title}</Text>
                  <Text className="text-sm text-muted-foreground">{goalTemplate.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Custom */}
        {showAddForm ? (
          <Card className="mb-4">
            <CardContent>
              <Input
                label="Goal title"
                value={customTitle}
                onChangeText={setCustomTitle}
                placeholder="e.g., Run a marathon"
                autoFocus
              />
              <Input
                label="Description (optional)"
                value={customDescription}
                onChangeText={setCustomDescription}
                placeholder="More details about your goal"
              />
              <View className="flex-row">
                <Button variant="outline" onPress={() => setShowAddForm(false)} className="flex-1 mr-2">
                  Cancel
                </Button>
                <Button onPress={handleAddCustom} className="flex-1" disabled={!customTitle.trim()}>
                  Add
                </Button>
              </View>
            </CardContent>
          </Card>
        ) : (
          <TouchableOpacity
            onPress={() => setShowAddForm(true)}
            className="flex-row items-center justify-center py-3 border border-dashed border-border rounded-xl mb-6"
          >
            <Plus size={18} color="#22c55e" />
            <Text className="ml-2 text-primary-500 font-medium">Add custom goal</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-4 py-4 border-t border-border">
        <View className="flex-row">
          <Button variant="outline" onPress={handleSkip} className="flex-1 mr-2">
            Skip
          </Button>
          <Button onPress={handleNext} className="flex-1">
            Review
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
