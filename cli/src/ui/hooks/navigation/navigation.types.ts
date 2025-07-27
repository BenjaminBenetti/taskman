import type React from 'react';

/**
 * Tab navigation types for the TaskMan dashboard
 */

// ================================================
// Navigation Types
// ================================================

export interface TabItem {
  key: string;
  label: string;
  component: React.ComponentType;
}

export type TabKey = 'dashboard' | 'tasks' | 'agent' | 'settings';

export interface NavigationState {
  activeTab: TabKey;
  tabs: TabItem[];
}

export interface TabNavigationHook {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  nextTab: () => void;
  previousTab: () => void;
  tabs: TabItem[];
}