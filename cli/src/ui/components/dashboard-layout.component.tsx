import React, { useEffect, useState } from 'react';
import { Box, Text, useStdout } from 'ink';
import type { DashboardLayoutProps } from './dashboard.types.ts';
import { Header } from './header.component.tsx';
import { TabNavigation } from './tab-navigation.component.tsx';
import { useTabNavigation } from '../hooks/use-tab-navigation.hook.tsx';

// Import page components
import { DashboardMainPage } from '../pages/dashboard/dashboard-main-page.tsx';
import { TasksPage } from '../pages/tasks/tasks-page.tsx';
import { AgentPage } from '../pages/agent/agent-page.tsx';
import { SettingsPage } from '../pages/settings/settings-page.tsx';

// ================================================
// Dashboard Layout Component
// ================================================

/**
 * Main dashboard layout component that orchestrates the entire dashboard UI
 * Handles tab navigation and renders the appropriate page content
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }: DashboardLayoutProps) => {
  const { activeTab, tabs } = useTabNavigation('dashboard');
  const { stdout } = useStdout();
  
  // State for terminal dimensions with reactive updates
  const [terminalSize, setTerminalSize] = useState({
    width: stdout?.columns || 80,
    height: stdout?.rows || 24,
  });

  // Update terminal size when stdout changes (handles terminal resize)
  useEffect(() => {
    if (stdout) {
      setTerminalSize({
        width: stdout.columns || 80,
        height: stdout.rows || 24,
      });
    }
  }, [stdout?.columns, stdout?.rows]);

  // Map tab keys to their corresponding page components
  const pageComponents = {
    dashboard: DashboardMainPage,
    tasks: TasksPage,
    agent: AgentPage,
    settings: SettingsPage,
  };

  const ActivePageComponent = pageComponents[activeTab];

  return (
    <Box 
      flexDirection="column" 
      height={terminalSize.height} 
      width={terminalSize.width}
      minHeight={terminalSize.height}
      minWidth={terminalSize.width}
    >
      {/* Header Section - Fixed at top */}
      <Header title="TaskMan Dashboard" showTime={false} terminalWidth={terminalSize.width} />
      
      {/* Tab Navigation - Below header */}
      <TabNavigation
        activeTab={activeTab}
        tabs={tabs.map(tab => ({ key: tab.key, label: tab.label }))}
        onTabChange={() => {}} // Navigation handled by the hook
        terminalWidth={terminalSize.width}
      />
      
      {/* Main Content Area - Flexible middle section */}
      <Box 
        flexDirection="column" 
        flexGrow={1} 
        flexShrink={1}
        padding={1}
        overflow="hidden"
      >
        {ActivePageComponent && <ActivePageComponent />}
        {children}
      </Box>
      
      {/* Footer with Keyboard Shortcuts - Fixed at bottom */}
      <Box 
        paddingTop={1} 
        borderStyle="single" 
        borderColor="gray"
        borderTop
        borderBottom={false}
        borderLeft={false}
        borderRight={false}
        flexShrink={0}
      >
        <Box justifyContent="center" width={terminalSize.width}>
          <Text dimColor>
            Press Ctrl+C to exit • Tab navigation: Tab/Shift+Tab or ←/→ or h/l
          </Text>
        </Box>
      </Box>
    </Box>
  );
};