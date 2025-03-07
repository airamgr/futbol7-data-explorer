
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AuthForm from '@/components/AuthForm';
import NavBar from '@/components/NavBar';
import TablaJugadores from '@/components/TablaJugadores';
import Filtros from '@/components/Filtros';
import { useAuth } from '@/hooks/useAuth';
import { useFootballData } from '@/hooks/useFootballData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, LogOut, DownloadCloud, AlertTriangle, WifiOff, ServerCrash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Index = () => {
  const navigate = useNavigate();
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
    usandoDatosFallback
  } = useFootballData({ auth: authCredentials });
  
  // Manejar login
  const handleAuth = async ({ username, password }: { username: string; password: string }) => {
    const success = await login(username, password);
    if (success) {
      setShowWelcome(false);
    }
    return success;
  };
  
  // Calcular categorías únicas y datos para el panel resumen
  const categorias = [...new Set(jugadores.map(j => j.categoria))];
  const equipos = [...new Set(jugadores.map(j => j.equipo))];
  const totalGoles = jugadores.reduce((sum, j) => sum + j.goles, 0);
  const topGoleador = jugadores.length > 0 ? 
    jugadores.reduce((max, j) => max.goles > j.goles ? max : j) : 
    null;
  
  // Si el usuario no está autenticado, mostrar el formulario de inicio de sesión
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-50 to-blue-50 p-4">
        <div className="w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-800">Explorador de Datos de Fútbol 7</h1>
            <p className="text-slate-600 max-w-xl mx-auto">
              Accede a estadísticas y datos del fútbol base de Salamanca (Prebenjamín, Benjamín y Alevín)
            </p>
          </motion.div>
          
          <AuthForm onAuth={handleAuth} isLoading={authLoading} />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 to-blue-50">
      <NavBar />
      
      <main className="container mx-auto pt-24 pb-12 px-4">
        {/* Pantalla de bienvenida inicial */}
        <AnimatePresence>
          {isAuthenticated && showWelcome && (
            <motion.div
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white p-6 md:p-10 rounded-xl shadow-2xl max-w-lg w-full mx-4"
              >
                <h2 className="text-2xl font-bold mb-4">¡Bienvenido, {username}!</h2>
                <p className="text-slate-600 mb-6">
                  Ya puedes explorar los datos del fútbol base de Salamanca. Usa los filtros para 
                  personalizar tu búsqueda según tus necesidades.
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    setShowWelcome(false);
                    cargarDatos();
                  }}
                >
                  Comenzar a explorar
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Estado de conexión */}
        {dataError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>Problemas de conexión</AlertTitle>
            <AlertDescription className="flex items-center space-x-2">
              <span>{dataError}</span>
              {usandoDatosFallback && (
                <Badge variant="outline" className="ml-2 bg-yellow-100">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Usando datos simulados
                </Badge>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Cabecera y controles principales */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-slate-800"
            >
              Explorador de Datos
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-slate-500"
            >
              Analiza el rendimiento de los jugadores de fútbol base
            </motion.p>
          </div>
          
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    onClick={cargarDatos} 
                    disabled={dataLoading}
                    className="hover:bg-primary/5"
                  >
                    {dataLoading ? (
                      <>
                        <motion.div
                          className="h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="h-4 w-4 mr-2" />
                        Actualizar datos
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Intenta cargar datos actualizados del servidor</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              variant="ghost" 
              onClick={() => logout()}
              className="hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
        
        {/* Status del origen de datos */}
        {usandoDatosFallback && (
          <div className="mb-6">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
              <ServerCrash className="h-3 w-3 mr-1" />
              Mostrando datos simulados para demostración
            </Badge>
          </div>
        )}
        
        {/* Panel de resumen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Total jugadores */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="glass-panel rounded-lg p-6 shadow-sm hover:shadow transition-all"
          >
            <h3 className="text-slate-500 font-medium mb-1">Total Jugadores</h3>
            <p className="text-3xl font-bold">{jugadores.length}</p>
            <p className="text-sm text-slate-500 mt-2">
              En {categorias.length} categorías
            </p>
          </motion.div>
          
          {/* Total equipos */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="glass-panel rounded-lg p-6 shadow-sm hover:shadow transition-all"
          >
            <h3 className="text-slate-500 font-medium mb-1">Equipos</h3>
            <p className="text-3xl font-bold">{equipos.length}</p>
            <p className="text-sm text-slate-500 mt-2">
              Con datos disponibles
            </p>
          </motion.div>
          
          {/* Total goles */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="glass-panel rounded-lg p-6 shadow-sm hover:shadow transition-all"
          >
            <h3 className="text-slate-500 font-medium mb-1">Total Goles</h3>
            <p className="text-3xl font-bold">{totalGoles}</p>
            <p className="text-sm text-slate-500 mt-2">
              En todas las categorías
            </p>
          </motion.div>
          
          {/* Máximo goleador */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="glass-panel rounded-lg p-6 shadow-sm hover:shadow transition-all"
          >
            <h3 className="text-slate-500 font-medium mb-1">Máximo Goleador</h3>
            <p className="text-3xl font-bold">{topGoleador?.goles || 0}</p>
            <p className="text-sm text-slate-500 mt-2 truncate">
              {topGoleador ? topGoleador.nombre : 'Sin datos'}
            </p>
          </motion.div>
        </motion.div>
        
        {/* Contenido principal con tabs */}
        <Tabs defaultValue="tabla" className="w-full">
          <TabsList className="mb-8 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="tabla">Tabla de Datos</TabsTrigger>
            <TabsTrigger value="filtros">Filtros Avanzados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tabla" className="space-y-8">
            <TablaJugadores 
              jugadores={jugadores} 
              isLoading={dataLoading} 
            />
          </TabsContent>
          
          <TabsContent value="filtros">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <Filtros 
                  jugadores={jugadores}
                  filtros={filtros}
                  onFiltrosChange={actualizarFiltros}
                  onResetFiltros={resetearFiltros}
                />
              </div>
              
              <div className="md:col-span-2">
                <TablaJugadores 
                  jugadores={jugadores} 
                  isLoading={dataLoading} 
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm">
                © 2023 Explorador de Datos de Fútbol 7 Base. Todos los derechos reservados.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-slate-400 text-sm">
                Datos extraídos de intranet.rfcylf.es
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
