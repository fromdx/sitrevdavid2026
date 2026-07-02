import { useState, useEffect } from 'react';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [novoUsuario, setNovoUsuario] = useState({ username: '', password: '', is_superuser: false });
  const [mensagem, setMensagem] = useState({ texto: '', erro: false });
  
  // Estados para o Controle do Modal Pop-up de Edição Avançada
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState({ id: '', username: '', first_name: '', last_name: '', email: '', is_superuser: false });
  const [novaSenhaAdmin, setNovaSenhaAdmin] = useState(''); 

  const token = localStorage.getItem('access_token');

  // 1. READ: Carrega a lista com todos os dados primitivos do Neon Postgres
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
      if (!res.ok) throw new Error('Erro ao buscar lista de usuários no servidor.');
      return res.json();
    })
    .then(data => { 
      if (Array.isArray(data)) setUsuarios(data); 
    })
    .catch(err => console.error("Erro ao carregar usuários:", err));
  };

  useEffect(() => {
    carregarUsuarios();
  }, [token]);
  // 2. CREATE: Cadastra uma nova conta de operador ou administrador
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
      if (!response.ok) throw new Error(data.detail || 'Falha ao criar conta no Neon.');

      setMensagem({ texto: `✅ Usuário "${novoUsuario.username}" cadastrado com sucesso!`, erro: false });
      setNovoUsuario({ username: '', password: '', is_superuser: false });
      carregarUsuarios();
    } catch (err) { 
      setMensagem({ texto: `❌ ${err.message}`, erro: true }); 
    }
  };

  // 3. UPDATE: Salva as alterações cadastrais do usuário via PATCH
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    setMensagem({ texto: '', erro: false });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${usuarioEditando.id}/`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          first_name: usuarioEditando.first_name,
          last_name: usuarioEditando.last_name,
          email: usuarioEditando.email,
          is_superuser: usuarioEditando.is_superuser,
          is_staff: usuarioEditando.is_superuser 
        })
      });

      if (!response.ok) throw new Error('Falha ao atualizar dados cadastrais.');

      // 🔑 SE O ADMIN DIGITOU UMA NOVA SENHA: Dispara o endpoint do Django
      if (novaSenhaAdmin.trim() !== '') {
        const resSenha = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${usuarioEditando.id}/alterar-senha/`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({ nova_senha: novaSenhaAdmin })
        });
        const dataSenha = await resSenha.json();
        if (!resSenha.ok) throw new Error(dataSenha.detail || 'Erro ao redefinir a senha do usuário.');
      }

      setMensagem({ texto: `✅ Cadastro de "${usuarioEditando.username}" atualizado com sucesso!`, erro: false });
      setModalAberto(false);
      setNovaSenhaAdmin('');
      carregarUsuarios();
    } catch (err) { 
      setMensagem({ texto: `❌ ${err.message}`, erro: true }); 
    }
  };

  // 4. DELETE: Exclui definitivamente o registro de usuário
  const handleDeletarUsuario = async (id, username) => {
    if (!window.confirm(`⚠️ Deseja apagar permanentemente a conta "${username}"?`)) return;
    setMensagem({ texto: '', erro: false });
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status !== 204 && !response.ok) throw new Error('Erro ao remover usuário.');
      setMensagem({ texto: `🗑️ Conta "${username}" excluída com sucesso do Neon.`, erro: false });
      carregarUsuarios();
    } catch (err) { 
      setMensagem({ texto: `❌ ${err.message}`, erro: true }); 
    }
  };

  const abrirModalEdicao = (user) => {
    setUsuarioEditando({ ...user });
    setNovaSenhaAdmin('');
    setModalAberto(true);
  };
  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>⚙️ Controle de Usuários Avançado</h2>
        <p style={{ color: '#4a5568' }}>Gerenciamento completo de informações, cargos e redefinições de senhas.</p>
      </div>

      {mensagem.texto && (
        <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '4px', background: mensagem.erro ? '#fff5f5' : '#f0fff4', color: mensagem.erro ? '#c53030' : '#22543d', fontWeight: 'bold' }}>
          {mensagem.texto}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '30px' }}>
        {/* Formulário de Cadastro (Esquerda) */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
          <h3>📝 Novo Operador</h3>
          <form onSubmit={handleCriarUsuario} style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Username (Login)</label>
              <input type="text" value={novoUsuario.username} onChange={e => setNovoUsuario({ ...novoUsuario, username: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }} required />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Senha Inicial</label>
              <input type="password" value={novoUsuario.password} onChange={e => setNovoUsuario({ ...novoUsuario, password: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }} required />
            </div>
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="chkAdmin" checked={novoUsuario.is_superuser} onChange={e => setNovoUsuario({ ...novoUsuario, is_superuser: e.target.checked })} />
              <label htmlFor="chkAdmin" style={{ fontWeight: '600', cursor: 'pointer' }}>Administrador?</label>
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px', background: '#1c3d5a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Criar Usuário</button>
          </form>
        </div>

        {/* Tabela de Listagem Completa (Direita) */}
        <div>
          <table width="100%" border="1" cellPadding="10" style={{ borderCollapse: 'collapse', background: 'white', textAlign: 'left', borderColor: '#e2e8f0' }}>
            <thead style={{ background: '#f4f6f9' }}>
              <tr>
                <th>ID</th>
                <th>Nome Completo</th>
                <th>Usuário / Email</th>
                <th>Cargo</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : <em style={{color:'#aaa'}}>Não preenchido</em>}</td>
                  <td><strong>{u.username}</strong><br/><small style={{color:'#666'}}>{u.email || 'Sem email'}</small></td>
                  <td>
                    <span style={{ padding: '3px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: u.is_superuser ? '#fed7d7' : '#edf2f7', color: u.is_superuser ? '#9b2c2c' : '#4a5568' }}>
                      {u.is_superuser ? '🛡️ Admin' : '👤 Comum'}
                    </span>
                  </td>
                  <td><span style={{ color: u.is_active ? 'green' : 'red', fontWeight: 'bold' }}>{u.is_active ? 'Ativo' : 'Inativo'}</span></td>
                  <td style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button onClick={() => abrirModalEdicao(u)} style={{ padding: '5px 10px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Editar/Reset</button>
                    <button onClick={() => handleDeletarUsuario(u.id, u.username)} style={{ padding: '5px 10px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JANELA MODAL POP-UP DE EDIÇÃO COMPLETA */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>✏️ Alterar Dados: {usuarioEditando.username}</h3>
            
            <form onSubmit={handleSalvarEdicao}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Primeiro Nome</label>
                  <input type="text" value={usuarioEditando.first_name || ''} onChange={e => setUsuarioEditando({ ...usuarioEditando, first_name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Sobrenome</label>
                  <input type="text" value={usuarioEditando.last_name || ''} onChange={e => setUsuarioEditando({ ...usuarioEditando, last_name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>E-mail corporativo</label>
                <input type="email" value={usuarioEditando.email || ''} onChange={e => setUsuarioEditando({ ...usuarioEditando, email: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
              </div>

              {/* Seção Inserir Nova Senha */}
              <div style={{ marginBottom: '15px', background: '#f7fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600', color: '#2c5282' }}>🔑 Forçar Nova Senha (Opcional)</label>
                <input type="password" placeholder="Deixe em branco para manter a atual" value={novaSenhaAdmin} onChange={e => setNovaSenhaAdmin(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0', background: 'white' }} />
                <small style={{ color: '#718096', display: 'block', marginTop: '4px' }}>Mínimo de 6 caracteres.</small>
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" id="modalAdminCheck" checked={usuarioEditando.is_superuser} onChange={e => setUsuarioEditando({ ...usuarioEditando, is_superuser: e.target.checked })} />
                <label htmlFor="modalAdminCheck" style={{ fontWeight: '600', cursor: 'pointer' }}>Promover a Administrador?</label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '8px 15px', background: '#e2e8f0', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 15px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
