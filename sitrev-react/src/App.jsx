import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Motoristas from './pages/Motoristas';
import Veiculos from './pages/Veiculos';
import Registros from './pages/Registros';
import AdminDashboard from './pages/AdminDashboard';
import Perfil from './pages/Perfil';
import Usuarios from './pages/Usuarios';
import PrivateRoute from './components/PrivateRoute';


function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role'); // Captura a função do usuário
  
  if (!token) return null;

  return (
    <nav style={{ background: '#1c3d5a', padding: '15px', display: 'flex', justifyContent: 'space-between', color: 'white' }}>
      <div>
        <Link to="/motoristas" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Motoristas</Link>
        <Link to="/veiculos" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Veículos</Link>
        <Link to="/registros" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Registros</Link>
        <Link to="/perfil" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Perfil</Link>
        {/*Só renderiza o link se for administrador */}
        {role === 'administrador' && (
          <Link to="/admin-dashboard" style={{ color: '#f6ad55', marginRight: '15px', fontWeight: 'bold', textDecoration: 'none' }}>🛡️ Administrador</Link>
        )}        
        {role === 'administrador' && (
          <Link to="/gerenciar-usuarios" style={{ color: '#fc8181', marginRight: '15px', fontWeight: 'bold', textDecoration: 'none' }}>⚙️ Gerenciar Usuários</Link>
        )}   
      </div>
      <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Sair</button>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Bloqueia o acesso direto se não estiver logado */}
        <Route element={<PrivateRoute />}>
          <Route path="/motoristas" element={<Motoristas />} />
          <Route path="/veiculos" element={<Veiculos />} />
          <Route path="/registros" element={<Registros />} />
          <Route path="*" element={<Motoristas />} /> {/* Redirecionamento padrão */}
          {/* Nova rota da página do administrador */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          {/* Nova rota para troca de senha */}
          <Route path="/perfil" element={<Perfil />} />
          {/* Nova rota para Gestao dos Usuarios */}
          <Route path="/gerenciar-usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}