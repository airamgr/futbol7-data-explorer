
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Comprobamos si hay credenciales almacenadas en sessionStorage
    const storedAuth = sessionStorage.getItem('futbol7-auth');
    
    if (storedAuth) {
      try {
        const { username } = JSON.parse(storedAuth);
        setAuthState({
          isAuthenticated: true,
          username,
          isLoading: false,
          error: null
        });
      } catch (e) {
        // Si hay un error al parsear, borramos el ítem corrupto
        sessionStorage.removeItem('futbol7-auth');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // En una aplicación real, aquí se haría una petición al servidor
      // para verificar las credenciales
      
      // Simulamos un retraso para la autenticación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Almacenamos la información básica en sessionStorage
      const authData = { username, password };
      sessionStorage.setItem('futbol7-auth', JSON.stringify(authData));
      
      setAuthState({
        isAuthenticated: true,
        username,
        isLoading: false,
        error: null
      });
      
      return true;
    } catch (error) {
      let errorMessage = "Error de autenticación";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setAuthState({
        isAuthenticated: false,
        username: null,
        isLoading: false,
        error: errorMessage
      });
      
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('futbol7-auth');
    setAuthState({
      isAuthenticated: false,
      username: null,
      isLoading: false,
      error: null
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};
