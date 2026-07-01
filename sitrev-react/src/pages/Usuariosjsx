import { useState, useEffect } from 'react';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [novoUsuario, setNovoUsuario] = useState({ username: '', password: '', is_superuser: false });
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [mensagem, setMensagem] = useState({ texto: '', erro: false });
  const token = localStorage.getItem('access_token');

  // 1. READ: Lista todos os usuários cadastrados
  const carregarUsuarios = () => {
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/usuarios/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar lista de usuários.');
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) setUsuarios(data);
    })
    .catch(err => console.error("Erro no carregamento:", err));
  };

  useEffect(() => {
    carregarUsuarios();
  }, [token]);

  // 2. CREATE: Cadastra um novo usuário no banco do Neon
  const handleCriarUsuario = async (e) => {
    e.preventDefault();
    setMensagem({ texto: '', erro: false });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoUsuario)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Falha ao criar usuário.');

      setMensagem({ texto: `✅ Usuário "${novoUsuario.username}" criado com sucesso!`, erro: false });
      setNovoUsuario({ username: '', password: '', is_superuser: false });
      carregarUsuarios(); // Atualiza a tabela
    } catch (err) {
      setMensagem({ texto: `❌ ${err.message}`, erro: true });
    }
  };

  // 3. UPDATE (PATCH): Altera o cargo (is_superuser) do usuário
  const handleAlternarCargo = async (id, statusAtual) => {
    setMensagem({ texto: '', erro: false });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_superuser: !statusAtual }) // Inverte o cargo atual
      });

      if (!response.ok) throw new Error('Não foi possível alterar o cargo do usuário.');

      setMensagem({ texto: '✅ Cargo do usuário atualizado com sucesso!', erro: false });
      carregarUsuarios();
    } catch (err) {
      setMensagem({ texto: `❌ ${err.message}`, erro: true });
    }
  };

  // 4. DELETE: Remove permanentemente o usuário do banco de dados
  const handleDeletarUsuario = async (id, username) => {
    if (!window.confirm(`⚠️ Tem certeza que deseja apagar permanentemente o usuário "${username}"?`)) return;
    setMensagem({ texto: '', erro: false });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 204 && !response.ok) throw new Error('Erro ao remover usuário.');

      setMensagem({ texto: `🗑️ Usuário "${username}" foi excluído com sucesso.`, erro: false });
      carregarUsuarios();
    } catch (err) {
      setMensagem({ texto: `❌ ${err.message}`, erro: true });
    }
  };

  return (
    <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
      
      {/* Coluna Esquerda: Formulário de Criação (CREATE) */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
        <h3>📝 Registrar Novo Usuário</h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Adicione novos operadores no Neon Postgres</p>
        
        <form onSubmit={handleCriarUsuario}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Login de Usuário</label>
            <input 
              type="text" 
              value={novoUsuario.username} 
              onChange={e => setNovoUsuario({ ...novoUsuario, username: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
              required 
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Senha de Acesso</label>
            <input 
              type="password" 
              value={novoUsuario.password} 
              onChange={e => setNovoUsuario({ ...novoUsuario, password: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
              required 
            />
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              id="is_admin_check"
              checked={novoUsuario.is_superuser} 
              onChange={e => setNovoUsuario({ ...novoUsuario, is_superuser: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="is_admin_check" style={{ fontWeight: '600', cursor: 'pointer' }}>Privilégios de Administrador?</label>
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', padding: '12px', background: '#1c3d5a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Cadastrar no Sistema
          </button>
        </form>
      </div>

      {/* Coluna Direita: Listagem e Gerenciamento (READ, UPDATE, DELETE) */}
      <div>
        <div style={{ marginBottom: '20px' }}>
          <h3>👥 Controle de Contas e Usuários</h3>
          <p style={{ color: '#4a5568' }}>Abaixo estão listados todos os acessos ativos integrados ao SITREV.</p>
        </div>

        {/* Alertas Visuais de Feedback */}
        {mensagem.texto && (
          <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '4px', background: mensagem.erro ? '#fff5f5' : '#f0fff4', color: mensagem.erro ? '#c53030' : '#22543d', fontWeight: 'bold' }}>
            {mensagem.texto}
          </div>
        )}

        <table width="100%" border="1" cellPadding="12" style={{ borderCollapse: 'collapse', background: 'white', textAlign: 'left' }}>
          <thead style={{ background: '#f4f6f9' }}>
            <tr>
              <th>ID</th>
              <th>Nome de Usuário (Login)</th>
              <th>Nível de Acesso (Cargo)</th>
              <th style={{ textAlign: 'center' }}>Ações de Controle</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><strong>{u.username}</strong></td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '13px',
                    fontWeight: 'bold',
                    background: u.is_superuser ? '#fed7d7' : '#edf2f7', 
                    color: u.is_superuser ? '#9b2c2c' : '#4a5568' 
                  }}>
                    {u.is_superuser ? '🛡️ Administrador' : '👤 Usuário Comum'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {/* Botão UPDATE (Muda o Cargo via PATCH) */}
                  <button 
                    onClick={() => handleAlternarCargo(u.id, u.is_superuser)}
                    style={{ padding: '6px 12px', cursor: 'pointer', background: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px' }}
                  >
                    {u.is_superuser ? 'Rebaixar para Comum' : 'Promover a Admin'}
                  </button>
                  
                  {/* Botão DELETE (Apaga o Usuário) */}
                  <button 
                    onClick={() => handleDeletarUsuario(u.id, u.username)}
                    style={{ padding: '6px 12px', cursor: 'pointer', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', fontSize: '13px' }}
                  >
                    Excluir Conta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
