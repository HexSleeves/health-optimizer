import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, X, Search } from 'lucide-react-native';
import { useHealthStore } from '@/stores';
import { HealthCondition, ConditionCategory, ConditionSeverity } from '@/types/health';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { ConditionBadge, SeverityIndicator } from '@/components/health';

const COMMON_CONDITIONS = [
  { name: 'Type 2 Diabetes', category: 'metabolic' as ConditionCategory },
  { name: 'Hypertension', category: 'cardiovascular' as ConditionCategory },
  { name: 'High Cholesterol', category: 'cardiovascular' as ConditionCategory },
  { name: 'Asthma', category: 'respiratory' as ConditionCategory },
  { name: 'Anxiety', category: 'mental_health' as ConditionCategory },
  { name: 'Depression', category: 'mental_health' as ConditionCategory },
  { name: 'GERD', category: 'digestive' as ConditionCategory },
  { name: 'IBS', category: 'digestive' as ConditionCategory },
  { name: 'Hypothyroidism', category: 'hormonal' as ConditionCategory },
  { name: 'Arthritis', category: 'musculoskeletal' as ConditionCategory },
  { name: 'Back Pain', category: 'musculoskeletal' as ConditionCategory },
  { name: 'Sleep Apnea', category: 'respiratory' as ConditionCategory },
];

export default function ConditionsScreen() {
  const { conditions, addCondition, removeCondition, updateIntakeData } = useHealthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customCondition, setCustomCondition] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<ConditionSeverity>('moderate');
  const [selectedCategory, setSelectedCategory] = useState<ConditionCategory>('other');

  const filteredConditions = COMMON_CONDITIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !conditions.find((existing) => existing.name.toLowerCase() === c.name.toLowerCase())
  );

  const handleAddCondition = (name: string, category: ConditionCategory) => {
    const newCondition: HealthCondition = {
      id: Math.random().toString(36).substring(2),
      name,
      category,
      severity: selectedSeverity,
      isManaged: false,
    };
    addCondition(newCondition);
    setSearchQuery('');
  };

  const handleAddCustom = () => {
    if (customCondition.trim()) {
      handleAddCondition(customCondition.trim(), selectedCategory);
      setCustomCondition('');
      setShowAddCustom(false);
    }
  };

  const handleNext = () => {
    updateIntakeData({ conditions });
    router.push('/intake/medications');
  };

  const handleSkip = () => {
    router.push('/intake/medications');
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View className="flex-row mb-6 mt-4">
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              className={`flex-1 h-1 rounded-full mx-0.5 ${step === 1 ? 'bg-primary-500' : 'bg-muted'}`}
            />
          ))}
        </View>

        {/* Description */}
        <Text className="text-lg text-foreground mb-2">
          What health conditions do you have?
        </Text>
        <Text className="text-muted-foreground mb-6">
          This helps us personalize your recommendations and avoid contraindicated suggestions.
        </Text>

        {/* Selected Conditions */}
        {conditions.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-muted-foreground mb-2">
              Selected ({conditions.length})
            </Text>
            <View className="flex-row flex-wrap">
              {conditions.map((condition) => (
                <View key={condition.id} className="mr-2 mb-2">
                  <ConditionBadge
                    name={condition.name}
                    severity={condition.severity}
                    onRemove={() => removeCondition(condition.id)}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Severity Selector */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-muted-foreground mb-2">
            Default severity for new conditions
          </Text>
          <View className="flex-row">
            {(['mild', 'moderate', 'severe', 'critical'] as ConditionSeverity[]).map((severity) => (
              <TouchableOpacity
                key={severity}
                onPress={() => setSelectedSeverity(severity)}
                className={`flex-1 py-2 mx-0.5 rounded-lg items-center ${
                  selectedSeverity === severity ? 'bg-primary-100' : 'bg-muted'
                }`}
              >
                <SeverityIndicator severity={severity} showLabel={false} />
                <Text
                  className={`text-xs mt-1 capitalize ${
                    selectedSeverity === severity ? 'text-primary-700 font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {severity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search */}
        <View className="mb-4">
          <View className="flex-row items-center bg-muted rounded-xl px-4">
            <Search size={20} color="#64748b" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search conditions..."
              placeholderTextColor="#94a3b8"
              className="flex-1 h-12 ml-2 text-foreground"
            />
            {searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Common Conditions */}
        <Text className="text-sm font-medium text-muted-foreground mb-2">
          Common conditions
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {filteredConditions.map((condition) => (
            <TouchableOpacity
              key={condition.name}
              onPress={() => handleAddCondition(condition.name, condition.category)}
              className="bg-muted rounded-full px-3 py-2 mr-2 mb-2"
            >
              <Text className="text-foreground">{condition.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Custom */}
        {showAddCustom ? (
          <Card className="mb-4">
            <CardContent>
              <Input
                label="Condition name"
                value={customCondition}
                onChangeText={setCustomCondition}
                placeholder="Enter condition name"
                autoFocus
              />
              <View className="flex-row">
                <Button variant="outline" onPress={() => setShowAddCustom(false)} className="flex-1 mr-2">
                  Cancel
                </Button>
                <Button onPress={handleAddCustom} className="flex-1" disabled={!customCondition.trim()}>
                  Add
                </Button>
              </View>
            </CardContent>
          </Card>
        ) : (
          <TouchableOpacity
            onPress={() => setShowAddCustom(true)}
            className="flex-row items-center justify-center py-3 border border-dashed border-border rounded-xl mb-6"
          >
            <Plus size={18} color="#22c55e" />
            <Text className="ml-2 text-primary-500 font-medium">Add custom condition</Text>
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
            Next
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
