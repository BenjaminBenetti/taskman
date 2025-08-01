import React, { useEffect, useState } from 'react';
import { AuthPage } from './pages/auth/auth-method-select-page.tsx';
import { DashboardLayout } from './components/dashboard/dashboard-layout.component.tsx';
import { usePageState } from './hooks/navigation/use-page-state.hook.tsx';
import { AuthServiceFactory } from '../auth/factories/auth-service.factory.ts';
import { TrpcClientFactory } from '../trpc/factory/trpc-client.factory.ts';

// ================================================
// Main App Component
// ================================================

/**
 * Main application component that handles page state and routing
 * between authentication and dashboard based on authentication status
 */
export const App: React.FC = () => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { currentPage, goToDashboard, goToAuth } = usePageState();

  // Check authentication status on startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await AuthServiceFactory.isAuthenticated();
        if (isAuthenticated) {
          toDashboardWithAuth();
        } else {
          goToAuth();
        }
      } catch (_) {
        // If auth check fails, show auth page
        goToAuth();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [goToDashboard, goToAuth]);

  // Call the users me endpoint to ensure the user is created and 
  // transition to the dashboard page.
  const toDashboardWithAuth = async () => {
    const trpcClient = await TrpcClientFactory.create();
    await trpcClient.users.me.query();
    goToDashboard();
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return null;
  }

  // Render auth page with callback to transition to dashboard
  if (currentPage === 'auth') {
    return <AuthPage onAuthSuccess={toDashboardWithAuth} />;
  }

  // Render dashboard
  return <DashboardLayout />;
};