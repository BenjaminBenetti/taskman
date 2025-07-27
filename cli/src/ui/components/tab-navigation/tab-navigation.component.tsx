import React from 'react';
import { Text, Box } from 'ink';
import type { TabNavigationProps } from '../dashboard/dashboard.types.ts';

// ================================================
// Tab Navigation Component
// ================================================

/**
 * Tab navigation component for switching between dashboard sections
 * Provides visual feedback for active tab and keyboard navigation hints
 */
export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  tabs,
  onTabChange,
  terminalWidth = 80,
}: TabNavigationProps) => {
  return (
    <Box flexDirection="column" marginBottom={0}>
      {/* Tab Bar */}
      <Box flexDirection="row" gap={1}>
        {tabs.map((tab: { key: string; label: string }) => {
          const isActive = tab.key === activeTab;
          
          return (
            <Box key={tab.key} flexDirection="row">
              {/* Tab Content */}
              <Box
                paddingX={2}
                paddingY={0}
                borderStyle="single"
                borderColor={isActive ? 'blue' : 'gray'}
              >
                <Text 
                  bold={isActive}
                  color={isActive ? 'blueBright' : 'white'}
                >
                  {tab.label}
                </Text>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Bottom Border */}
      <Box marginTop={0}>
        <Text color="gray">
          {'─'.repeat(Math.max(terminalWidth - 2, 20))}
        </Text>
      </Box>
    </Box>
  );
};