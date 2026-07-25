'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cn } from '@/lib/shared/cn';

export const Tabs = TabsPrimitive.Root;

export type TabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List>;

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        'inline-flex w-full flex-wrap gap-1 rounded-md border border-brand-secondary/20 bg-brand-neutral p-1',
        className,
      )}
      {...props}
    />
  );
}

export type TabsTriggerProps = ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> & { children: ReactNode };

export function TabsTrigger({ className, children, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex min-h-11 flex-1 items-center justify-center rounded-sm px-3 py-2 text-sm font-semibold text-brand-secondary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-1',
        'data-[state=active]:bg-brand-surface data-[state=active]:text-brand-on-surface data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export type TabsContentProps = ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
> & { children: ReactNode };

export function TabsContent({ className, children, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      className={cn(
        'mt-4 rounded-md border border-brand-secondary/15 bg-brand-surface p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
        className,
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Content>
  );
}
