import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Motoristas from './pages/Motoristas';
import Veiculos from './pages/Veiculos';
import Registros from './pages/Registros';
import PrivateRoute from './components/PrivateRoute';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  
  if (!token) return null;

  return (
    <nav style={{ background: '#1c3d5a', padding: '15px', display: 'flex', justifyContent: 'space-between', color: 'white' }}>
      <div>
        <Link to="/motoristas" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Motoristas</Link>
        <Link to="/veiculos" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Veículos</Link>
        <Link to="/registros" style={{ color: 'white', textDecoration: 'none' }}>Registros</Link>
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
