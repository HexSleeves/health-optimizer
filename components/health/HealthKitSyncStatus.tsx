import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { clsx } from 'clsx';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react-native';
import { useHealthStore } from '@/stores';

interface HealthKitSyncStatusProps {
  compact?: boolean;
  showSyncButton?: boolean;
}

export function HealthKitSyncStatus({
  compact = false,
  showSyncButton = true,
}: HealthKitSyncStatusProps) {
  const {
    healthKitAuthorized,
    lastSyncAt,
    isSyncing,
    syncError,
    syncHealthKit,
  } = useHealthStore();

  const getStatusInfo = () => {
    if (!healthKitAuthorized) {
      return {
        icon: <AlertCircle size={16} color="#f59e0b" />,
        text: 'Not connected',
        color: 'text-yellow-600',
      };
    }

    if (isSyncing) {
      return {
        icon: <ActivityIndicator size="small" color="#22c55e" />,
        text: 'Syncing...',
        color: 'text-primary-500',
      };
    }

    if (syncError) {
      return {
        icon: <AlertCircle size={16} color="#ef4444" />,
        text: 'Sync failed',
        color: 'text-destructive',
      };
    }

    if (lastSyncAt) {
      const lastSync = new Date(lastSyncAt);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSync.getTime()) / 60000);

      let timeAgo: string;
      if (diffMinutes < 1) {
        timeAgo = 'Just now';
      } else if (diffMinutes < 60) {
        timeAgo = `${diffMinutes}m ago`;
      } else if (diffMinutes < 1440) {
        timeAgo = `${Math.floor(diffMinutes / 60)}h ago`;
      } else {
        timeAgo = `${Math.floor(diffMinutes / 1440)}d ago`;
      }

      return {
        icon: <CheckCircle size={16} color="#22c55e" />,
        text: timeAgo,
        color: 'text-primary-500',
      };
    }

    return {
      icon: <Clock size={16} color="#64748b" />,
      text: 'Never synced',
      color: 'text-muted-foreground',
    };
  };

  const status = getStatusInfo();

  if (compact) {
    return (
      <TouchableOpacity
        onPress={syncHealthKit}
        disabled={isSyncing || !healthKitAuthorized}
        className="flex-row items-center"
      >
        {status.icon}
        <Text className={clsx('ml-1 text-xs', status.color)}>{status.text}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="flex-row items-center justify-between bg-white rounded-xl border border-border p-3">
      <View className="flex-row items-center">
        <View className="w-8 h-8 rounded-full bg-primary-100 items-center justify-center mr-3">
          {status.icon}
        </View>
        <View>
          <Text className="text-sm font-medium text-foreground">HealthKit</Text>
          <Text className={clsx('text-xs', status.color)}>{status.text}</Text>
        </View>
      </View>

      {showSyncButton && healthKitAuthorized && (
        <TouchableOpacity
          onPress={syncHealthKit}
          disabled={isSyncing}
          className={clsx(
            'flex-row items-center px-3 py-2 rounded-lg',
            isSyncing ? 'bg-muted' : 'bg-primary-100'
          )}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#22c55e" />
          ) : (
            <>
              <RefreshCw size={14} color="#22c55e" />
              <Text className="ml-1 text-sm font-medium text-primary-600">Sync</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

// Health metrics summary component
export function HealthMetricsSummary() {
  const { healthKitData } = useHealthStore();
  const today = healthKitData[healthKitData.length - 1];

  if (!today) {
    return (
      <View className="bg-muted rounded-xl p-4">
        <Text className="text-center text-muted-foreground">
          No health data available. Sync with HealthKit to see your metrics.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap -mx-1">
      <MetricCard
        label="Steps"
        value={today.steps?.toLocaleString() || '-'}
        target="10,000"
        progress={(today.steps || 0) / 10000}
      />
      <MetricCard
        label="Sleep"
        value={today.sleepHours ? `${today.sleepHours.toFixed(1)}h` : '-'}
        target="8h"
        progress={(today.sleepHours || 0) / 8}
      />
      <MetricCard
        label="Exercise"
        value={today.exerciseMinutes ? `${today.exerciseMinutes}m` : '-'}
        target="30m"
        progress={(today.exerciseMinutes || 0) / 30}
      />
      <MetricCard
        label="Resting HR"
        value={today.restingHeartRate ? `${today.restingHeartRate}` : '-'}
        unit="bpm"
      />
    </View>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  target?: string;
  progress?: number;
}

function MetricCard({ label, value, unit, target, progress }: MetricCardProps) {
  return (
    <View className="w-1/2 p-1">
      <View className="bg-white rounded-xl border border-border p-3">
        <Text className="text-xs text-muted-foreground mb-1">{label}</Text>
        <View className="flex-row items-baseline">
          <Text className="text-xl font-bold text-foreground">{value}</Text>
          {unit && <Text className="text-xs text-muted-foreground ml-1">{unit}</Text>}
        </View>
        {target && (
          <Text className="text-xs text-muted-foreground">of {target}</Text>
        )}
        {progress !== undefined && (
          <View className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <View
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${Math.min(progress * 100, 100)}%` }}
            />
          </View>
        )}
      </View>
    </View>
  );
}
