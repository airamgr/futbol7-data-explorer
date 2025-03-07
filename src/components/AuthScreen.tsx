
import { motion } from 'framer-motion';
import AuthForm from '@/components/AuthForm';

interface AuthScreenProps {
  onAuth: ({ username, password }: { username: string; password: string }) => Promise<boolean>;
  isLoading: boolean;
}

const AuthScreen = ({ onAuth, isLoading }: AuthScreenProps) => {
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
        
        <AuthForm onAuth={onAuth} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AuthScreen;
