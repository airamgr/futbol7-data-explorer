
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';
import { useFootballData } from '@/hooks/useFootballData';

// Componentes refactorizados
import AuthScreen from '@/components/AuthScreen';
import WelcomeOverlay from '@/components/WelcomeOverlay';
import ConnectionStatus from '@/components/ConnectionStatus';
import PageHeader from '@/components/PageHeader';
import DataSourceBadges from '@/components/DataSourceBadges';
import StatsSummary from '@/components/StatsSummary';
import DataTabs from '@/components/DataTabs';
import Footer from '@/components/Footer';

const Index = () => {
  const { isAuthenticated, username, login, logout, isLoading: authLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [authCredentials, setAuthCredentials] = useState<{ username: string; password: string } | null>(null);
  
  // Extraer credenciales cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && username) {
      const storedAuth = sessionStorage.getItem('futbol7-auth');
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          setAuthCredentials(parsed);
        } catch (e) {
          console.error('Error parsing stored auth:', e);
        }
      }
    } else {
      setAuthCredentials(null);
    }
  }, [isAuthenticated, username]);
  
  // Hook para manejar los datos de fútbol
  const { 
    jugadores, 
    isLoading: dataLoading, 
    error: dataError,
    filtros,
    actualizarFiltros,
    resetearFiltros,
    cargarDatos,
    dataSource,
    backendDisponible
  } = useFootballData({ auth: authCredentials });
  
  // Manejar login
  const handleAuth = async ({ username, password }: { username: string; password: string }) => {
    const success = await login(username, password);
    if (success) {
      setShowWelcome(false);
    }
    return success;
  };
  
  // Si el usuario no está autenticado, mostrar el formulario de inicio de sesión
  if (!isAuthenticated && !authLoading) {
    return <AuthScreen onAuth={handleAuth} isLoading={authLoading} />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-blue-50">
      <NavBar />
      
      <main className="container mx-auto pt-24 pb-12 px-4">
        {/* Pantalla de bienvenida inicial */}
        <AnimatePresence>
          {isAuthenticated && showWelcome && (
            <WelcomeOverlay 
              username={username} 
              onClose={() => {
                setShowWelcome(false);
                cargarDatos();
              }} 
            />
          )}
        </AnimatePresence>
        
        {/* Estado de conexión */}
        <ConnectionStatus error={dataError} backendDisponible={backendDisponible} />
        
        {/* Cabecera y controles principales */}
        <PageHeader 
          onRefreshData={cargarDatos} 
          onLogout={logout}
          isLoading={dataLoading}
        />
        
        {/* Status del origen de datos */}
        <DataSourceBadges dataSource={dataSource} backendDisponible={backendDisponible} />
        
        {/* Panel de resumen */}
        <StatsSummary jugadores={jugadores} />
        
        {/* Tabs de datos y filtros */}
        <DataTabs 
          jugadores={jugadores}
          isLoading={dataLoading}
          filtros={filtros}
          onFiltrosChange={actualizarFiltros}
          onResetFiltros={resetearFiltros}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
