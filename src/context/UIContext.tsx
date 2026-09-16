import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

// ── Types ────────────────────────────────────────────
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export type Theme = 'dark' | 'light' | 'system';

interface UIState {
  sidebarOpen: boolean;
  notifications: number;
  toasts: Toast[];
  theme: Theme;
}

type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_NOTIFICATIONS'; payload: number }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'SET_THEME'; payload: Theme };

function getSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem('biz-theme');
    if (saved === 'light' || saved === 'system' || saved === 'dark') return saved;
  } catch { /* ignore */ }
  return 'dark';
}

const initialState: UIState = {
  sidebarOpen: false,
  notifications: 3,
  toasts: [],
  theme: getSavedTheme(),
};

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('biz-theme', theme);
  } catch { /* ignore */ }
}

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.payload };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };
    case 'SET_THEME':
      applyTheme(action.payload);
      return { ...state, theme: action.payload };
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────
interface UIContextValue extends UIState {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  setTheme: (theme: Theme) => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Apply saved theme on first mount
  useEffect(() => {
    applyTheme(state.theme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR', payload: open });
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'success') => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });

      // Auto-remove after 4 seconds
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  return (
    <UIContext.Provider
      value={{
        ...state,
        toggleSidebar,
        setSidebarOpen,
        addToast,
        removeToast,
        setTheme,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
