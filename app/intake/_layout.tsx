import { Stack } from 'expo-router';

export default function IntakeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#ffffff' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Back',
        contentStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen
        name="conditions"
        options={{ title: 'Health Conditions' }}
      />
      <Stack.Screen
        name="medications"
        options={{ title: 'Medications' }}
      />
      <Stack.Screen
        name="allergies"
        options={{ title: 'Allergies' }}
      />
      <Stack.Screen
        name="goals"
        options={{ title: 'Health Goals' }}
      />
      <Stack.Screen
        name="review"
        options={{ title: 'Review' }}
      />
    </Stack>
  );
}
