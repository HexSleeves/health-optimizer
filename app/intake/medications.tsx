import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, X, Pill } from 'lucide-react-native';
import { useHealthStore } from '@/stores';
import { Medication } from '@/types/health';
import { Button, Card, CardContent, Input } from '@/components/ui';

export default function MedicationsScreen() {
  const { medications, addMedication, removeMedication, updateIntakeData } = useHealthStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');

  const handleAddMedication = () => {
    if (name.trim() && dosage.trim() && frequency.trim()) {
      const newMedication: Medication = {
        id: Math.random().toString(36).substring(2),
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
      };
      addMedication(newMedication);
      setName('');
      setDosage('');
      setFrequency('');
      setShowAddForm(false);
    }
  };

  const handleNext = () => {
    updateIntakeData({ medications });
    router.push('/intake/allergies');
  };

  const handleSkip = () => {
    router.push('/intake/allergies');
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
                step <= 2 ? 'bg-primary-500' : 'bg-muted'
              }`}
            />
          ))}
        </View>

        {/* Description */}
        <Text className="text-lg text-foreground mb-2">
          What medications are you currently taking?
        </Text>
        <Text className="text-muted-foreground mb-6">
          This helps us check for potential interactions with supplements and foods.
        </Text>

        {/* Current Medications */}
        {medications.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-medium text-muted-foreground mb-2">
              Current medications ({medications.length})
            </Text>
            {medications.map((medication) => (
              <Card key={medication.id} className="mb-2">
                <CardContent>
                  <View className="flex-row items-start">
                    <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center">
                      <Pill size={20} color="#8b5cf6" />
                    </View>
                    <View className="flex-1 ml-3">
                      <Text className="font-semibold text-foreground">{medication.name}</Text>
                      <Text className="text-sm text-muted-foreground">
                        {medication.dosage} - {medication.frequency}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeMedication(medication.id)}
                      className="p-1"
                    >
                      <X size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}

        {/* Add Form */}
        {showAddForm ? (
          <Card className="mb-4">
            <CardContent>
              <Input
                label="Medication name"
                value={name}
                onChangeText={setName}
                placeholder="e.g., Metformin"
                autoFocus
              />
              <Input
                label="Dosage"
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g., 500mg"
              />
              <Input
                label="Frequency"
                value={frequency}
                onChangeText={setFrequency}
                placeholder="e.g., Twice daily"
              />
              <View className="flex-row">
                <Button
                  variant="outline"
                  onPress={() => {
                    setShowAddForm(false);
                    setName('');
                    setDosage('');
                    setFrequency('');
                  }}
                  className="flex-1 mr-2"
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleAddMedication}
                  className="flex-1"
                  disabled={!name.trim() || !dosage.trim() || !frequency.trim()}
                >
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
            <Text className="ml-2 text-primary-500 font-medium">Add medication</Text>
          </TouchableOpacity>
        )}

        {/* Common Frequencies */}
        <View className="bg-muted rounded-xl p-4 mb-6">
          <Text className="text-sm font-medium text-muted-foreground mb-2">
            Common frequencies:
          </Text>
          <Text className="text-sm text-muted-foreground">
            • Once daily (QD)\n• Twice daily (BID)\n• Three times daily (TID)\n• As needed (PRN)
          </Text>
        </View>
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
