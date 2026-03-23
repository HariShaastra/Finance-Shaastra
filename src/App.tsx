import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthProvider';
import { Layout } from './components/Layout';
import { loginWithGoogle } from './lib/firebase';
import { LogIn } from 'lucide-react';

// Real components
import { Dashboard } from './pages/Dashboard';
import { AddEntry } from './pages/AddEntry';
import { Insights } from './pages/Insights';
import { Reflections } from './pages/Reflections';
import { Goals } from './pages/Goals';
import { Subscriptions } from './pages/Subscriptions';
import { Guide } from './pages/Guide';
import { Logo } from './components/Logo';

const Login = () => {
  const { user, loading } = useAuth();
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-50">Loading...</div>;
  if (user) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] border border-stone-200 shadow-2xl text-center space-y-8">
        <div className="flex justify-center">
          <Logo size={100} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tight mb-2">Finance Shaastra</h1>
          <p className="text-stone-500 font-medium">Master your money through human awareness.</p>
        </div>
        
        <button
          onClick={handleLogin}
          className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-stone-800 transition-all flex items-center justify-center shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 mr-4" alt="Google" />
          Continue with Google
        </button>

        <div className="pt-8 border-t border-stone-100">
          <p className="text-xs text-stone-400 leading-relaxed uppercase tracking-widest font-bold">
            No AI. No Algorithms. Just your data.
          </p>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/add" element={<AddEntry />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/reflections" element={<Reflections />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/guide" element={<Guide />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
