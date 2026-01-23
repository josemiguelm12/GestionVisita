import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center w-full min-h-screen px-4">
      <form onSubmit={handleSubmit} className="flex w-full flex-col items-center justify-center max-w-96">
        
        <h2 className="text-4xl font-medium text-gray-900">Iniciar Sesión</h2>
        <p className="mt-3 text-sm text-gray-500/90">Bienvenido de nuevo! Por favor inicia sesión para continuar</p>
        
        <div className="mt-10 mb-2 w-full">
          <button 
            type="button" 
            className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 py-2.5 hover:bg-gray-50 focus:border-gray-300 cursor-pointer transition"
          >
            <svg width="24" height="24" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.9506 10.6945C19.9506 10.0594 19.8969 9.52762 19.7791 8.97516H10.2363V12.0952H15.7094C15.5916 12.9375 15.0641 14.1055 13.8969 14.9055L13.8788 15.0254L16.8288 17.2963L17.0344 17.317C18.8681 15.632 19.9506 13.3602 19.9506 10.6945Z" fill="#4285F4"/>
              <path d="M10.2362 19.7001C12.6431 19.7001 14.6625 18.9212 16.0344 17.317L13.8968 14.9055C13.2862 15.3375 12.4431 15.632 10.2362 15.632C7.88188 15.632 5.88188 13.947 5.14438 11.6914L5.03063 11.7008L1.97125 14.0649L1.93188 14.1737C3.29313 16.8608 6.52875 19.7001 10.2362 19.7001Z" fill="#34A853"/>
              <path d="M5.14438 11.6914C4.92 11.2274 4.79188 10.7108 4.79188 10.1732C4.79188 9.63556 4.92 9.11893 5.13406 8.65493L5.12812 8.52681L2.02875 6.12012L1.93188 6.17268C1.40437 7.22081 1.09375 8.37143 1.09375 10.1732C1.09375 11.975 1.40437 13.1256 1.93188 14.1737L5.14438 11.6914Z" fill="#FBBC05"/>
              <path d="M10.2362 4.71431C12.0394 4.71431 13.2375 5.47256 13.9231 6.09768L15.8181 4.26681C14.6519 3.16681 12.6431 2.30078 10.2362 2.30078C6.52875 2.30078 3.29313 5.14012 1.93188 7.82724L5.13406 10.3095C5.88188 8.05388 7.88188 4.71431 10.2362 4.71431Z" fill="#EB4335"/>
            </svg>
            <span className="font-medium text-gray-700">Continuar con Microsoft 365</span>
          </button>
        </div>
        
        <div className="my-5 flex w-full items-center gap-4">
          <div className="h-px w-full bg-gray-300/90"></div>
          <p className="w-full text-sm text-nowrap text-gray-500/90">o inicia sesión con email</p>
          <div className="h-px w-full bg-gray-300/90"></div>
        </div>
        
        <div className="flex h-12 w-full items-center gap-2 overflow-hidden rounded-full border border-gray-200 bg-transparent pl-5 focus-within:border-gray-300">
          <Mail className="w-[18px] h-[18px] text-gray-400" strokeWidth={2} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="h-full w-full bg-transparent text-sm placeholder-gray-400 outline-none pr-5"
          />
        </div>
        
        <div className="mt-6 flex h-12 w-full items-center gap-2 overflow-hidden rounded-full border border-gray-200 bg-transparent pl-5 focus-within:border-gray-300">
          <Lock className="w-[18px] h-[18px] text-gray-400" strokeWidth={2} />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="h-full w-full bg-transparent text-sm placeholder-gray-400 outline-none pr-5"
          />
        </div>
        
        <div className="mt-8 flex w-full items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2">
            <input 
              type="checkbox" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer hidden" 
            />
            <span className="relative flex size-4.5 items-center justify-center rounded border border-slate-300 peer-checked:border-gray-800 peer-checked:bg-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3 text-white">
                <path d="M20 6 9 17l-5-5"></path>
              </svg>
            </span>
            <span className="text-gray-500 select-none">Recordarme</span>
          </label>
          <a className="text-gray-800 underline hover:text-gray-600 transition" href="#">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="mt-8 h-11 w-full cursor-pointer rounded-full bg-gradient-to-b from-gray-600 to-gray-800 text-white transition hover:from-gray-700 hover:to-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
        
        <p className="mt-4 text-gray-500/90">
          ¿No tienes una cuenta?{' '}
          <a className="text-gray-800 underline hover:text-gray-600 transition" href="#">
            Regístrate
          </a>
        </p>
      </form>
    </main>
  );
};

export default Login;
