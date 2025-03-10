
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';
import { useFootballData } from '@/hooks/useFootballData';
import FileUploader from '@/components/FileUploader';

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
  const [showUploader, setShowUploader] = useState(true); // Mostrar el uploader por defecto
  
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
    backendDisponible,
    cargarDatosDesdeExcel
  } = useFootballData({ auth: authCredentials });
  
  // Manejar login
  const handleAuth = async ({ username, password }: { username: string; password: string }) => {
    const success = await login(username, password);
    if (success) {
      setShowWelcome(false);
    }
    return success;
  };

  // Manejador para la carga de archivos Excel
  const handleFileUpload = async (file: File) => {
    if (!authCredentials) {
      return;
    }
    
    try {
      await cargarDatosDesdeExcel(file);
      setShowUploader(false);
    } catch (error) {
      console.error('Error al cargar el archivo:', error);
    }
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
                // No cargar datos automáticamente, esperar a que suban archivos
                setShowUploader(true);
              }} 
            />
          )}
        </AnimatePresence>
        
        {/* Estado de conexión */}
        <ConnectionStatus error={dataError} backendDisponible={backendDisponible} />
        
        {/* Cabecera y controles principales */}
        <PageHeader 
          onRefreshData={() => setShowUploader(true)} 
          onLogout={logout}
          isLoading={dataLoading}
          onUploadClick={() => setShowUploader(true)}
        />
        
        {/* Status del origen de datos */}
        <DataSourceBadges dataSource={dataSource} backendDisponible={backendDisponible} />
        
        {/* Uploader Modal - siempre visible por defecto */}
        <AnimatePresence>
          {showUploader && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Cargar archivo Excel</h2>
                  {jugadores.length > 0 && (
                    <button 
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => setShowUploader(false)}
                      aria-label="Cerrar"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Carga los archivos Excel con los datos de los jugadores para visualizarlos
                  </p>
                  <FileUploader 
                    onFileUpload={handleFileUpload}
                    isLoading={dataLoading}
                    accept=".xlsx,.xls"
                    maxSize={5}
                  />
                </div>
                {jugadores.length > 0 && (
                  <div className="p-4 border-t flex justify-end">
                    <button 
                      className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80"
                      onClick={() => setShowUploader(false)}
                    >
                      Ver datos cargados
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
        
        {/* Panel de resumen - Solo se muestra si hay datos */}
        {jugadores.length > 0 && !showUploader && (
          <>
            <StatsSummary jugadores={jugadores} />
            
            {/* Tabs de datos y filtros */}
            <DataTabs 
              jugadores={jugadores}
              isLoading={dataLoading}
              filtros={filtros}
              onFiltrosChange={actualizarFiltros}
              onResetFiltros={resetearFiltros}
            />
          </>
        )}

        {/* Mensaje si no hay datos y el uploader está cerrado */}
        {jugadores.length === 0 && !showUploader && (
          <div className="text-center p-12 bg-background rounded-lg shadow-sm mt-8">
            <h3 className="text-xl font-semibold mb-2">No hay datos disponibles</h3>
            <p className="text-muted-foreground mb-4">
              Carga un archivo Excel para visualizar los datos
            </p>
            <button
              onClick={() => setShowUploader(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Cargar archivo Excel
            </button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
