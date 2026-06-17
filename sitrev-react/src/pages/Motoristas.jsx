import { useState, useEffect } from 'react';

export default function Motoristas() {
  const [motoristas, setMotoristas] = useState([]);
  const [busca, setBusca] = useState('');
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    // Se o token sumiu por algum motivo, nem faz a requisição
    if (!token) {
      console.warn("Token não encontrado no localStorage");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/motoristas/?search=${busca}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      // Se o Django responder 401, o token expirou ou é inválido
      if (res.status === 401) {
        localStorage.clear(); // Limpa o token inválido
        window.location.href = '/login'; // Redireciona o usuário para logar novamente
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      if (!res.ok) throw new Error('Erro na requisição.');
      return res.json();
    })
    .then(data => {
      // Garante que o dado recebido é realmente uma lista (Array) antes de salvar
      if (Array.isArray(data)) {
        setMotoristas(data);
      } else {
        setMotoristas([]);
      }
    })
    .catch(err => {
      console.error("Erro ao buscar motoristas:", err.message);
      setMotoristas([]); // Evita o erro do .map() deixando a lista vazia
    });
  }, [busca, token]);


  return (
    <div style={{ padding: '20px' }}>
      <h3>Aba Motoristas</h3>
      <input 
        type="text" 
        placeholder="Buscar motorista por nome..." 
        value={busca} 
        onChange={e => setBusca(e.target.value)} 
        style={{ width: '100%', padding: '8px', marginBottom: '15px' }} 
      />
      <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>ID</th><th>Nome</th><th>Último Registro</th><th>Último Veículo</th><th>Status</th></tr>
        </thead>
        <tbody>
          {motoristas.map(m => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td><strong>{m.nome}</strong></td>
              <td>{m.ultimo_registro ? new Date(m.ultimo_registro).toLocaleString('pt-BR') : 'Sem registro'}</td>
              <td>{m.ultimo_veiculo}</td>
              <td style={{ color: m.status === 'Em viagem' ? 'green' : 'gray', fontWeight: 'bold' }}>{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
