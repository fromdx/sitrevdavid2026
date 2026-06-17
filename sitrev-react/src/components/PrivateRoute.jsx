import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
  const token = localStorage.getItem('access_token');
  
  // Se não houver token, redireciona para a tela de login automaticamente
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
