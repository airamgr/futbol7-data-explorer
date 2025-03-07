
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface WelcomeOverlayProps {
  username: string | null;
  onClose: () => void;
}

const WelcomeOverlay = ({ username, onClose }: WelcomeOverlayProps) => {
  return (
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
        <Button className="w-full" onClick={onClose}>
          Comenzar a explorar
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default WelcomeOverlay;
