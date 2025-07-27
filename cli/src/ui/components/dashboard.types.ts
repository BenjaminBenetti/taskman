import type React from 'react';

/**
 * Dashboard component types for the TaskMan application
 */

// ================================================
// Dashboard Types
// ================================================

export interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export interface HeaderProps {
  terminalWidth?: number;
}

export interface TabNavigationProps {
  activeTab: string;
  tabs: Array<{
    key: string;
    label: string;
  }>;
  onTabChange: (tabKey: string) => void;
  terminalWidth?: number;
}

export interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

// ================================================
// Page Component Types
// ================================================

export interface PageProps {
  children?: React.ReactNode;
}

export interface DashboardMainPageProps extends PageProps {}

export interface TasksPageProps extends PageProps {}

export interface AgentPageProps extends PageProps {}

export interface SettingsPageProps extends PageProps {}