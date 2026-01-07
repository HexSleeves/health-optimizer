import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { clsx } from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';

type AlertVariant = 'default' | 'destructive' | 'success' | 'warning';

interface AlertProps extends ViewProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const variantStyles: Record<AlertVariant, { container: string; title: string; text: string; iconColor: string }> = {
  default: {
    container: 'bg-muted border-border',
    title: 'text-foreground',
    text: 'text-muted-foreground',
    iconColor: '#64748b',
  },
  destructive: {
    container: 'bg-red-50 border-red-200',
    title: 'text-red-800',
    text: 'text-red-700',
    iconColor: '#dc2626',
  },
  success: {
    container: 'bg-green-50 border-green-200',
    title: 'text-green-800',
    text: 'text-green-700',
    iconColor: '#16a34a',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    title: 'text-yellow-800',
    text: 'text-yellow-700',
    iconColor: '#ca8a04',
  },
};

const defaultIcons: Record<AlertVariant, React.ReactNode> = {
  default: <Info size={20} />,
  destructive: <AlertCircle size={20} />,
  success: <CheckCircle size={20} />,
  warning: <AlertTriangle size={20} />,
};

export function Alert({
  variant = 'default',
  title,
  children,
  icon,
  className,
  ...props
}: AlertProps) {
  const style = variantStyles[variant];
  const IconComponent = icon || React.cloneElement(
    defaultIcons[variant] as React.ReactElement,
    { color: style.iconColor }
  );

  return (
    <View
      className={clsx(
        'flex-row rounded-xl border p-4',
        style.container,
        className
      )}
      {...props}
    >
      <View className="mr-3 mt-0.5">{IconComponent}</View>
      <View className="flex-1">
        {title && (
          <Text className={clsx('font-semibold mb-1', style.title)}>
            {title}
          </Text>
        )}
        {typeof children === 'string' ? (
          <Text className={clsx('text-sm', style.text)}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}
