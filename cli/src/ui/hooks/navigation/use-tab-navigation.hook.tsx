import React, { useState, useMemo } from 'react';
import { useInput } from 'ink';
import type { TabItem, TabKey, TabNavigationHook } from './navigation.types.ts';

// ================================================
// Tab Navigation Hook
// ================================================

/**
 * Custom hook for managing tab navigation in the dashboard
 * Provides keyboard navigation with Tab key switching
 */
export const useTabNavigation = (initialTab: TabKey = 'dashboard'): TabNavigationHook => {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Define all available tabs
  const tabs: TabItem[] = useMemo(() => [
    { key: 'dashboard', label: 'Dashboard', component: React.Fragment },
    { key: 'tasks', label: 'Tasks', component: React.Fragment },
    { key: 'agent', label: 'Agent', component: React.Fragment },
    { key: 'settings', label: 'Settings', component: React.Fragment },
  ], []);

  const tabKeys = tabs.map(tab => tab.key as TabKey);
  const currentIndex = tabKeys.indexOf(activeTab);

  // Navigation functions
  const nextTab = () => {
    const nextIndex = (currentIndex + 1) % tabKeys.length;
    setActiveTab(tabKeys[nextIndex]);
  };

  const previousTab = () => {
    const prevIndex = (currentIndex - 1 + tabKeys.length) % tabKeys.length;
    setActiveTab(tabKeys[prevIndex]);
  };

  // Handle keyboard input for tab navigation
  useInput((input, key) => {
    if (key.tab && !key.shift) {
      nextTab();
    } else if (key.tab && key.shift) {
      previousTab();
    } else if (key.rightArrow || input === 'l') {
      nextTab();
    } else if (key.leftArrow || input === 'h') {
      previousTab();
    }
  });

  return {
    activeTab,
    setActiveTab,
    nextTab,
    previousTab,
    tabs,
  };
};