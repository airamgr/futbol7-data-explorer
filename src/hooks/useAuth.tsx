
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

// Credenciales por defecto - las que sabemos que funcionan
const DEFAULT_CREDENTIALS = {
  username: 'CE4032',
  password: '9525'
};

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
        const { username, password } = JSON.parse(storedAuth);
        
        // Verificamos si son las credenciales correctas
        if (username !== DEFAULT_CREDENTIALS.username || password !== DEFAULT_CREDENTIALS.password) {
          console.warn('Credenciales almacenadas incorrectas. Usando las predeterminadas.');
          // Actualizamos con las credenciales correctas
          sessionStorage.setItem('futbol7-auth', JSON.stringify(DEFAULT_CREDENTIALS));
          setAuthState({
            isAuthenticated: true,
            username: DEFAULT_CREDENTIALS.username,
            isLoading: false,
            error: null
          });
        } else {
          setAuthState({
            isAuthenticated: true,
            username,
            isLoading: false,
            error: null
          });
        }
      } catch (e) {
        // Si hay un error al parsear, borramos el ítem corrupto y usamos las predeterminadas
        console.error('Error al parsear credenciales almacenadas:', e);
        sessionStorage.removeItem('futbol7-auth');
        sessionStorage.setItem('futbol7-auth', JSON.stringify(DEFAULT_CREDENTIALS));
        setAuthState({
          isAuthenticated: true,
          username: DEFAULT_CREDENTIALS.username,
          isLoading: false,
          error: null
        });
      }
    } else {
      // Si no hay credenciales, las precargamos con las proporcionadas
      sessionStorage.setItem('futbol7-auth', JSON.stringify(DEFAULT_CREDENTIALS));
      
      setAuthState({
        isAuthenticated: true,
        username: DEFAULT_CREDENTIALS.username,
        isLoading: false,
        error: null
      });
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Verificamos si son las credenciales correctas
      if (username !== DEFAULT_CREDENTIALS.username || password !== DEFAULT_CREDENTIALS.password) {
        throw new Error(`Credenciales incorrectas. Usuario=CE4032, Contraseña=9525`);
      }
      
      // Simulamos un retraso para la autenticación
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
