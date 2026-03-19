import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Scheduling from './pages/Scheduling';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Componente para proteger rotas privadas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="loading-screen">Carregando...</div>;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="agendamentos" element={<Scheduling />} />
          <Route path="configuracoes" element={<Settings />} />
          <Route path="termos" element={<Terms />} />
          <Route path="privacidade" element={<Privacy />} />
          <Route path="contato" element={<Contact />} />
        </Route>
        {/* Fallback para home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
