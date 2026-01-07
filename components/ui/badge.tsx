import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

interface BadgeProps extends ViewProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  default: {
    container: 'bg-primary-500',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-secondary-100',
    text: 'text-secondary-900',
  },
  destructive: {
    container: 'bg-destructive',
    text: 'text-white',
  },
  outline: {
    container: 'bg-transparent border border-border',
    text: 'text-foreground',
  },
  success: {
    container: 'bg-green-100',
    text: 'text-green-800',
  },
  warning: {
    container: 'bg-yellow-100',
    text: 'text-yellow-800',
  },
};

export function Badge({ variant = 'default', children, className, ...props }: BadgeProps) {
  const style = variantStyles[variant];

  return (
    <View
      className={clsx(
        'self-start rounded-full px-3 py-1',
        style.container,
        className
      )}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className={clsx('text-xs font-medium', style.text)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
