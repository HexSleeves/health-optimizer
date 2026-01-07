import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, X, AlertTriangle } from 'lucide-react-native';
import { useHealthStore } from '@/stores';
import { Allergy } from '@/types/health';
import { Button, Card, CardContent, Input, Badge } from '@/components/ui';

const COMMON_ALLERGIES = [
  { name: 'Peanuts', type: 'food' as const },
  { name: 'Tree Nuts', type: 'food' as const },
  { name: 'Shellfish', type: 'food' as const },
  { name: 'Eggs', type: 'food' as const },
  { name: 'Milk/Dairy', type: 'food' as const },
  { name: 'Wheat/Gluten', type: 'food' as const },
  { name: 'Soy', type: 'food' as const },
  { name: 'Fish', type: 'food' as const },
  { name: 'Penicillin', type: 'drug' as const },
  { name: 'Sulfa Drugs', type: 'drug' as const },
  { name: 'NSAIDs', type: 'drug' as const },
  { name: 'Latex', type: 'other' as const },
];

type AllergyType = 'food' | 'drug' | 'environmental' | 'other';
type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'anaphylactic';

export default function AllergiesScreen() {
  const { allergies, addAllergy, removeAllergy, updateIntakeData } = useHealthStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [customAllergen, setCustomAllergen] = useState('');
  const [selectedType, setSelectedType] = useState<AllergyType>('food');
  const [selectedSeverity, setSelectedSeverity] = useState<AllergySeverity>('moderate');

  const handleAddAllergy = (name: string, type: AllergyType = selectedType) => {
    if (allergies.find((a) => a.allergen.toLowerCase() === name.toLowerCase())) {
      return; // Already exists
    }
    const newAllergy: Allergy = {
      id: Math.random().toString(36).substring(2),
      allergen: name,
      type,
      severity: selectedSeverity,
    };
    addAllergy(newAllergy);
  };

  const handleAddCustom = () => {
    if (customAllergen.trim()) {
      handleAddAllergy(customAllergen.trim());
      setCustomAllergen('');
      setShowAddForm(false);
    }
  };

  const handleNext = () => {
    updateIntakeData({ allergies });
    router.push('/intake/goals');
  };

  const handleSkip = () => {
    router.push('/intake/goals');
  };

  const getSeverityColor = (severity: AllergySeverity) => {
    switch (severity) {
      case 'mild': return 'success';
      case 'moderate': return 'warning';
      case 'severe': return 'destructive';
      case 'anaphylactic': return 'destructive';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View className="flex-row mb-6 mt-4">
          {[1, 2, 3, 4, 5].map((step) => (
            <View
              key={step}
              className={`flex-1 h-1 rounded-full mx-0.5 ${
                step <= 3 ? 'bg-primary-500' : 'bg-muted'
              }`}
            />
          ))}
        </View>

        {/* Description */}
        <Text className="text-lg text-foreground mb-2">
          Do you have any allergies?
        </Text>
        <Text className="text-muted-foreground mb-6">
          We'll avoid recommending foods, supplements, or ingredients you're allergic to.
        </Text>

        {/* Selected Allergies */}
        {allergies.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-muted-foreground mb-2">
              Your allergies ({allergies.length})
            </Text>
            <View className="flex-row flex-wrap">
              {allergies.map((allergy) => (
                <TouchableOpacity
                  key={allergy.id}
                  onPress={() => removeAllergy(allergy.id)}
                  className="mr-2 mb-2"
                >
                  <View className="flex-row items-center bg-red-50 border border-red-200 rounded-full px-3 py-1.5">
                    <AlertTriangle size={14} color="#ef4444" />
                    <Text className="ml-1 text-red-700 font-medium">{allergy.allergen}</Text>
                    <X size={14} color="#ef4444" className="ml-2" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Severity Selector */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-muted-foreground mb-2">
            Allergy severity
          </Text>
          <View className="flex-row">
            {(['mild', 'moderate', 'severe', 'anaphylactic'] as AllergySeverity[]).map((severity) => (
              <TouchableOpacity
                key={severity}
                onPress={() => setSelectedSeverity(severity)}
                className={`flex-1 py-2 mx-0.5 rounded-lg items-center ${
                  selectedSeverity === severity ? 'bg-primary-100' : 'bg-muted'
                }`}
              >
                <Text
                  className={`text-xs capitalize ${
                    selectedSeverity === severity ? 'text-primary-700 font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {severity}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Common Allergies */}
        <Text className="text-sm font-medium text-muted-foreground mb-2">Common allergies</Text>
        <View className="flex-row flex-wrap mb-4">
          {COMMON_ALLERGIES.filter(
            (a) => !allergies.find((existing) => existing.allergen.toLowerCase() === a.name.toLowerCase())
          ).map((allergy) => (
            <TouchableOpacity
              key={allergy.name}
              onPress={() => handleAddAllergy(allergy.name, allergy.type)}
              className="bg-muted rounded-full px-3 py-2 mr-2 mb-2"
            >
              <Text className="text-foreground">{allergy.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Custom */}
        {showAddForm ? (
          <Card className="mb-4">
            <CardContent>
              <Input
                label="Allergen name"
                value={customAllergen}
                onChangeText={setCustomAllergen}
                placeholder="Enter allergen"
                autoFocus
              />
              <View className="mb-4">
                <Text className="text-sm font-medium text-foreground mb-2">Type</Text>
                <View className="flex-row">
                  {(['food', 'drug', 'environmental', 'other'] as AllergyType[]).map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setSelectedType(type)}
                      className={`flex-1 py-2 mx-0.5 rounded-lg items-center ${
                        selectedType === type ? 'bg-primary-100' : 'bg-muted'
                      }`}
                    >
                      <Text
                        className={`text-xs capitalize ${
                          selectedType === type ? 'text-primary-700 font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="flex-row">
                <Button variant="outline" onPress={() => setShowAddForm(false)} className="flex-1 mr-2">
                  Cancel
                </Button>
                <Button onPress={handleAddCustom} className="flex-1" disabled={!customAllergen.trim()}>
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
            <Text className="ml-2 text-primary-500 font-medium">Add custom allergy</Text>
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
