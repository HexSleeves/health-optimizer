/**
 * HealthKit Service
 *
 * This service provides an abstraction layer for Apple HealthKit integration.
 * In a real implementation, this would use react-native-health or expo-healthkit.
 *
 * For now, this provides the interface and mock data for development.
 */

import {
  HealthKitPermissionStatus,
  HealthKitDataType,
  HealthKitPermission,
  HealthKitAuthorization,
  BiometricSnapshot,
  StepData,
  SleepData,
  HeartRateData,
  HRVData,
  WorkoutData,
  HealthKitSyncResult,
} from '@/types/healthkit';
import { DateRange, HealthKitQueryOptions } from './types';

// Data types we want to read from HealthKit
export const HEALTHKIT_READ_TYPES: HealthKitDataType[] = [
  // Activity
  'stepCount',
  'distanceWalkingRunning',
  'activeEnergyBurned',
  'basalEnergyBurned',
  'flightsClimbed',
  'appleExerciseTime',
  // Body
  'bodyMass',
  'bodyFatPercentage',
  'height',
  // Heart
  'heartRate',
  'heartRateVariabilitySDNN',
  'restingHeartRate',
  // Sleep
  'sleepAnalysis',
  // Workouts
  'workout',
];

// Data types we can write to HealthKit
export const HEALTHKIT_WRITE_TYPES: HealthKitDataType[] = [
  'workout',
  'dietaryEnergyConsumed',
  'dietaryProtein',
  'dietaryCarbohydrates',
  'dietaryFat',
  'dietaryWater',
];

class HealthKitService {
  private isInitialized: boolean = false;
  private authorization: HealthKitAuthorization | null = null;
  private mockMode: boolean = true; // Set to true for development

  /**
   * Initialize the HealthKit service
   */
  async initialize(): Promise<boolean> {
    /**
     * In a real implementation:
     *
     * import AppleHealthKit from 'react-native-health';
     *
     * const permissions = {
     *   permissions: {
     *     read: HEALTHKIT_READ_TYPES,
     *     write: HEALTHKIT_WRITE_TYPES,
     *   },
     * };
     *
     * return new Promise((resolve) => {
     *   AppleHealthKit.initHealthKit(permissions, (error) => {
     *     if (error) {
     *       console.error('HealthKit initialization failed:', error);
     *       resolve(false);
     *     } else {
     *       this.isInitialized = true;
     *       resolve(true);
     *     }
     *   });
     * });
     */

    // Mock initialization
    this.isInitialized = true;
    return true;
  }

  /**
   * Check if HealthKit is available on this device
   */
  async isAvailable(): Promise<boolean> {
    /**
     * In a real implementation:
     *
     * import AppleHealthKit from 'react-native-health';
     * return AppleHealthKit.isAvailable();
     */

    // HealthKit is only available on iOS
    // In React Native: Platform.OS === 'ios'
    return true; // Mock for development
  }

  /**
   * Request permissions for HealthKit data access
   */
  async requestPermissions(
    readTypes: HealthKitDataType[] = HEALTHKIT_READ_TYPES,
    writeTypes: HealthKitDataType[] = HEALTHKIT_WRITE_TYPES
  ): Promise<HealthKitPermission[]> {
    /**
     * In a real implementation:
     *
     * const permissions = {
     *   permissions: {
     *     read: readTypes,
     *     write: writeTypes,
     *   },
     * };
     *
     * return new Promise((resolve) => {
     *   AppleHealthKit.initHealthKit(permissions, (error) => {
     *     if (error) {
     *       resolve(readTypes.map(type => ({
     *         dataType: type,
     *         status: 'denied',
     *         isRead: true,
     *         isWrite: false,
     *       })));
     *     } else {
     *       // Check individual permissions
     *       // HealthKit doesn't tell us exact status, so we assume authorized
     *       resolve(readTypes.map(type => ({
     *         dataType: type,
     *         status: 'authorized',
     *         isRead: true,
     *         isWrite: writeTypes.includes(type),
     *       })));
     *     }
     *   });
     * });
     */

    // Mock permissions - all authorized
    const permissions: HealthKitPermission[] = readTypes.map(type => ({
      dataType: type,
      status: 'authorized' as HealthKitPermissionStatus,
      isRead: true,
      isWrite: writeTypes.includes(type),
    }));

    this.authorization = {
      userId: 'mock-user',
      readPermissions: permissions,
      writePermissions: permissions.filter(p => p.isWrite),
      lastRequestedAt: new Date().toISOString(),
    };

    return permissions;
  }

  /**
   * Get current authorization status
   */
  getAuthorizationStatus(): HealthKitAuthorization | null {
    return this.authorization;
  }

  /**
   * Fetch step count data
   */
  async fetchSteps(options?: HealthKitQueryOptions): Promise<StepData[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { startDate, endDate } = this.getDateRange(options);

    /**
     * In a real implementation:
     *
     * return new Promise((resolve) => {
     *   AppleHealthKit.getDailyStepCountSamples(
     *     { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
     *     (err, results) => {
     *       if (err) {
     *         console.error('Error fetching steps:', err);
     *         resolve([]);
     *       } else {
     *         resolve(results.map(r => ({
     *           date: r.startDate,
     *           count: r.value,
     *           source: r.sourceName,
     *         })));
     *       }
     *     }
     *   );
     * });
     */

    // Mock data
    return this.generateMockSteps(startDate, endDate);
  }

  /**
   * Fetch sleep data
   */
  async fetchSleep(options?: HealthKitQueryOptions): Promise<SleepData[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { startDate, endDate } = this.getDateRange(options);

    // Mock data
    return this.generateMockSleep(startDate, endDate);
  }

  /**
   * Fetch heart rate data
   */
  async fetchHeartRate(options?: HealthKitQueryOptions): Promise<HeartRateData[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { startDate, endDate } = this.getDateRange(options);

    // Mock data
    return this.generateMockHeartRate(startDate, endDate);
  }

  /**
   * Fetch HRV data
   */
  async fetchHRV(options?: HealthKitQueryOptions): Promise<HRVData[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { startDate, endDate } = this.getDateRange(options);

    // Mock data
    return this.generateMockHRV(startDate, endDate);
  }

  /**
   * Fetch workout data
   */
  async fetchWorkouts(options?: HealthKitQueryOptions): Promise<WorkoutData[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { startDate, endDate } = this.getDateRange(options);

    // Mock data
    return this.generateMockWorkouts(startDate, endDate);
  }

  /**
   * Fetch and aggregate daily biometric snapshot
   */
  async fetchDailySnapshot(date: Date): Promise<BiometricSnapshot> {
    const dateStr = this.formatDate(date);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const options: HealthKitQueryOptions = {
      dateRange: { startDate: date, endDate: nextDate },
    };

    const [steps, sleep, heartRate, hrv, workouts] = await Promise.all([
      this.fetchSteps(options),
      this.fetchSleep(options),
      this.fetchHeartRate(options),
      this.fetchHRV(options),
      this.fetchWorkouts(options),
    ]);

    // Aggregate data
    const totalSteps = steps.reduce((sum, s) => sum + s.count, 0);
    const totalSleepHours = sleep.reduce((sum, s) => sum + s.duration / 60, 0);
    const avgHeartRate = heartRate.length > 0
      ? heartRate.reduce((sum, h) => sum + h.value, 0) / heartRate.length
      : undefined;
    const avgHRV = hrv.length > 0
      ? hrv.reduce((sum, h) => sum + h.value, 0) / hrv.length
      : undefined;
    const totalExerciseMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

    return {
      id: `snapshot-${dateStr}`,
      userId: 'mock-user',
      date: dateStr,
      steps: totalSteps,
      activeCalories: totalCalories,
      basalCalories: 1600, // Mock BMR
      totalCalories: totalCalories + 1600,
      exerciseMinutes: totalExerciseMinutes,
      distanceMeters: totalSteps * 0.762, // Average stride length
      flightsClimbed: Math.floor(totalSteps / 1000), // Rough estimate
      sleepHours: totalSleepHours,
      sleepQuality: this.getSleepQuality(totalSleepHours),
      restingHeartRate: heartRate.find(h => h.context === 'rest')?.value,
      averageHeartRate: avgHeartRate ? Math.round(avgHeartRate) : undefined,
      hrv: avgHRV ? Math.round(avgHRV) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dataSources: ['Apple Watch', 'iPhone'],
    };
  }

  /**
   * Fetch multiple days of snapshots
   */
  async fetchSnapshots(days: number = 7): Promise<BiometricSnapshot[]> {
    const snapshots: BiometricSnapshot[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const snapshot = await this.fetchDailySnapshot(date);
      snapshots.push(snapshot);
    }

    return snapshots.reverse(); // Oldest first
  }

  /**
   * Sync all health data to Convex
   */
  async syncToConvex(): Promise<HealthKitSyncResult> {
    // In a real implementation, this would:
    // 1. Fetch all relevant HealthKit data
    // 2. Transform and normalize the data
    // 3. Send to Convex mutations
    // 4. Update local sync timestamps

    try {
      const snapshots = await this.fetchSnapshots(7);

      // TODO: Call Convex mutation to store snapshots
      // await convex.mutation(api.healthKitSync.syncSnapshots, { snapshots });

      return {
        success: true,
        dataTypes: HEALTHKIT_READ_TYPES,
        recordsProcessed: snapshots.length,
        errors: [],
        syncedAt: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        dataTypes: [],
        recordsProcessed: 0,
        errors: [error.message || 'Sync failed'],
        syncedAt: new Date().toISOString(),
      };
    }
  }

  // ==================
  // Helper Methods
  // ==================

  private getDateRange(options?: HealthKitQueryOptions): DateRange {
    if (options?.dateRange) {
      return options.dateRange;
    }
    // Default to last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    return { startDate, endDate };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getSleepQuality(hours: number): 'poor' | 'fair' | 'good' | 'excellent' {
    if (hours < 5) return 'poor';
    if (hours < 6.5) return 'fair';
    if (hours < 8) return 'good';
    return 'excellent';
  }

  // ==================
  // Mock Data Generators
  // ==================

  private generateMockSteps(startDate: Date, endDate: Date): StepData[] {
    const steps: StepData[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      steps.push({
        date: this.formatDate(current),
        count: Math.floor(5000 + Math.random() * 8000), // 5000-13000 steps
        source: 'Apple Watch',
      });
      current.setDate(current.getDate() + 1);
    }

    return steps;
  }

  private generateMockSleep(startDate: Date, endDate: Date): SleepData[] {
    const sleep: SleepData[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const duration = 360 + Math.floor(Math.random() * 180); // 6-9 hours in minutes
      const bedtime = new Date(current);
      bedtime.setHours(22, 30, 0, 0);
      const waketime = new Date(bedtime);
      waketime.setMinutes(waketime.getMinutes() + duration);

      sleep.push({
        id: `sleep-${this.formatDate(current)}`,
        startTime: bedtime.toISOString(),
        endTime: waketime.toISOString(),
        duration,
        stages: [
          { stage: 'light', startTime: bedtime.toISOString(), endTime: '', duration: Math.floor(duration * 0.5) },
          { stage: 'deep', startTime: '', endTime: '', duration: Math.floor(duration * 0.2) },
          { stage: 'rem', startTime: '', endTime: '', duration: Math.floor(duration * 0.25) },
          { stage: 'awake', startTime: '', endTime: waketime.toISOString(), duration: Math.floor(duration * 0.05) },
        ],
        source: 'Apple Watch',
      });
      current.setDate(current.getDate() + 1);
    }

    return sleep;
  }

  private generateMockHeartRate(startDate: Date, endDate: Date): HeartRateData[] {
    const heartRates: HeartRateData[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      // Resting heart rate (morning)
      heartRates.push({
        timestamp: new Date(current.setHours(7, 0, 0, 0)).toISOString(),
        value: 55 + Math.floor(Math.random() * 15), // 55-70 bpm
        context: 'rest',
        source: 'Apple Watch',
      });

      // Active heart rate (afternoon)
      heartRates.push({
        timestamp: new Date(current.setHours(14, 0, 0, 0)).toISOString(),
        value: 70 + Math.floor(Math.random() * 30), // 70-100 bpm
        context: 'walking',
        source: 'Apple Watch',
      });

      current.setDate(current.getDate() + 1);
    }

    return heartRates;
  }

  private generateMockHRV(startDate: Date, endDate: Date): HRVData[] {
    const hrvData: HRVData[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      hrvData.push({
        timestamp: new Date(current.setHours(7, 0, 0, 0)).toISOString(),
        value: 30 + Math.floor(Math.random() * 40), // 30-70 ms
        source: 'Apple Watch',
      });
      current.setDate(current.getDate() + 1);
    }

    return hrvData;
  }

  private generateMockWorkouts(startDate: Date, endDate: Date): WorkoutData[] {
    const workouts: WorkoutData[] = [];
    const current = new Date(startDate);
    const workoutTypes: WorkoutData['type'][] = ['walking', 'running', 'strength_training', 'cycling', 'yoga'];

    while (current <= endDate) {
      // Random chance of workout on each day (60%)
      if (Math.random() > 0.4) {
        const type = workoutTypes[Math.floor(Math.random() * workoutTypes.length)];
        const duration = 20 + Math.floor(Math.random() * 60); // 20-80 minutes
        const startTime = new Date(current);
        startTime.setHours(17, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + duration);

        workouts.push({
          id: `workout-${this.formatDate(current)}`,
          type,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration,
          caloriesBurned: Math.floor(duration * (5 + Math.random() * 10)), // 5-15 cal/min
          distance: type === 'running' ? duration * 150 : type === 'walking' ? duration * 80 : undefined,
          averageHeartRate: 100 + Math.floor(Math.random() * 50),
          maxHeartRate: 140 + Math.floor(Math.random() * 30),
          source: 'Apple Watch',
        });
      }
      current.setDate(current.getDate() + 1);
    }

    return workouts;
  }
}

// Singleton instance
export const healthKitService = new HealthKitService();
