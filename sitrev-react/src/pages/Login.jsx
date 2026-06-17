import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) throw new Error('Usuário ou senha inválidos.');

      const data = await response.json();
      localStorage.setItem('access_token', data.access); // Salva o token JWT
      navigate('/motoristas'); // Redireciona para o sistema
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>SITREV - Login</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', margin: '10px 0', padding: '8px' }} required />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', margin: '10px 0', padding: '8px' }} required />
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#3182ce', color: 'white', border: 'none' }}>Entrar</button>
      </form>
    </div>
  );
}
