import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { clsx } from 'clsx';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={clsx(
        'rounded-2xl bg-white border border-border p-4 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <View className={clsx('pb-3', className)} {...props}>
      {children}
    </View>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <Text className={clsx('text-xl font-bold text-foreground', className)}>
      {children}
    </Text>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <Text className={clsx('text-sm text-muted-foreground mt-1', className)}>
      {children}
    </Text>
  );
}

interface CardContentProps extends ViewProps {
  children: React.ReactNode;
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <View className={clsx('', className)} {...props}>
      {children}
    </View>
  );
}

interface CardFooterProps extends ViewProps {
  children: React.ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <View
      className={clsx('flex-row items-center pt-4 mt-4 border-t border-border', className)}
      {...props}
    >
      {children}
    </View>
  );
}
