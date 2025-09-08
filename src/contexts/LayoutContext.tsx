/**
 * Layout Context - Centralized layout state management
 * Following React Context pattern for UI state management
 */

'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { LayoutContextType } from '@/types/layout';
import { MOBILE_BREAKPOINT } from '@/constants/navigation';

interface LayoutState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  isMobile: boolean;
}

type LayoutAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'COLLAPSE_SIDEBAR' }
  | { type: 'SET_MOBILE'; payload: boolean }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean };

const initialState: LayoutState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  isMobile: false,
};

function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      };
    case 'COLLAPSE_SIDEBAR':
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };
    case 'SET_MOBILE':
      return {
        ...state,
        isMobile: action.payload,
        // Auto-close sidebar on mobile when switching from desktop
        sidebarOpen: action.payload ? false : state.sidebarOpen,
      };
    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        sidebarOpen: action.payload,
      };
    default:
      return state;
  }
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(layoutReducer, initialState);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      dispatch({ type: 'SET_MOBILE', payload: isMobile });
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Memoized actions to prevent recreation on every render
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const collapseSidebar = useCallback(() => {
    dispatch({ type: 'COLLAPSE_SIDEBAR' });
  }, []);

  // Context value - memoized to prevent unnecessary re-renders
  const contextValue = React.useMemo<LayoutContextType>(() => ({
    sidebarOpen: state.sidebarOpen,
    sidebarCollapsed: state.sidebarCollapsed,
    toggleSidebar,
    collapseSidebar,
    isMobile: state.isMobile,
  }), [state.sidebarOpen, state.sidebarCollapsed, state.isMobile, toggleSidebar, collapseSidebar]);

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

// Hook for components that only need sidebar state
export function useSidebar() {
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, collapseSidebar } = useLayout();
  return {
    isOpen: sidebarOpen,
    isCollapsed: sidebarCollapsed,
    toggle: toggleSidebar,
    collapse: collapseSidebar,
  };
}