import { useState } from 'react';

// ================================================
// Page State Hook
// ================================================

export type PageState = 'auth' | 'dashboard';

export interface PageStateHook {
  currentPage: PageState;
  setCurrentPage: (page: PageState) => void;
  goToAuth: () => void;
  goToDashboard: () => void;
}

/**
 * Minimal hook for managing page state between auth and dashboard
 * Provides simple navigation without breaking existing tab navigation
 */
export const usePageState = (initialPage: PageState = 'auth'): PageStateHook => {
  const [currentPage, setCurrentPage] = useState<PageState>(initialPage);

  const goToAuth = () => setCurrentPage('auth');
  const goToDashboard = () => setCurrentPage('dashboard');

  return {
    currentPage,
    setCurrentPage,
    goToAuth,
    goToDashboard,
  };
};