import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [usuarios, setUsuarios] = useState([]);
  const [metricas, setMetricas] = useState({ totalMotoristas: 0, totalVeiculos: 0, viagensAtivas: 0 });
  const [novoUsuario, setNovoUsuario] = useState({ username: '', password: '', is_superuser: false });
  const [mensagem, setMensagem] = useState({ texto: '', erro: false });
  const token = localStorage.getItem('access_token');

  // 1. Carrega dados gerenciais e lista de usuários cadastrados no Neon
  useEffect(() => {
    if (!token) return;

    // Busca dados dos motoristas para calcular métricas de status
    fetch(`${import.meta.env.VITE_API_URL}/motoristas/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(motoristas => {
      const ativos = motoristas.filter(m => m.status === 'Em viagem').length;
      setMetricas(prev => ({ ...prev, totalMotoristas: motoristas.length, viagensAtivas: ativos }));
    })
    .catch(err => console.error("Erro ao carregar métricas:", err));

    // Busca dados de frotas
    fetch(`${import.meta.env.VITE_API_URL}/veiculos/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(veiculos => {
      setMetricas(prev => ({ ...prev, totalVeiculos: veiculos.length }));
    })
    .catch(err => console.error("Erro ao carregar frotas:", err));

    // Opcional: Se houver um endpoint customizado /api/usuarios/, carregaria aqui
  }, [token]);

  // 2. FUNÇÃO DE CADASTRO (Sign Up): Envia os novos dados para o Django
  const handleCadastro = async (e) => {
    e.preventDefault();
    setMensagem({ texto: '', erro: false });

    try {
      // Criaremos esta rota '/usuarios/' no Django no próximo passo
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoUsuario)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Falha ao cadastrar usuário. Verifique os dados.');
      }

      setMensagem({ texto: `✅ Usuário "${novoUsuario.username}" cadastrado com sucesso!`, erro: false });
      setNovoUsuario({ username: '', password: '', is_superuser: false }); // Limpa o formulário
    } catch (err) {
      setMensagem({ texto: `❌ ${err.message}`, erro: true });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Cabeçalho */}
      <div style={{ marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
        <h2>🛡️ Painel de Controle do Administrador</h2>
        <p style={{ color: '#4a5568' }}>Gerenciamento de acessos, cadastros e indicadores globais do SITREV.</p>
      </div>

      {/* BLOCO 1: Indicadores / Métricas Rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#ebf8ff', borderLeft: '4px solid #3182ce', padding: '20px', borderRadius: '4px' }}>
          <h4 style={{ color: '#2b6cb0', textTransform: 'uppercase', fontSize: '12px' }}>Total de Motoristas</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '5px' }}>{metricas.totalMotoristas}</p>
        </div>
        <div style={{ background: '#e6fffa', borderLeft: '4px solid #319795', padding: '20px', borderRadius: '4px' }}>
          <h4 style={{ color: '#234e52', textTransform: 'uppercase', fontSize: '12px' }}>Frota Cadastrada</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '5px' }}>{metricas.totalVeiculos}</p>
        </div>
        <div style={{ background: '#f0fff4', borderLeft: '4px solid #38a169', padding: '20px', borderRadius: '4px' }}>
          <h4 style={{ color: '#22543d', textTransform: 'uppercase', fontSize: '12px' }}>Viagens em Andamento</h4>
          <p style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '5px' }}>🟢 {metricas.viagensAtivas}</p>
        </div>
      </div>

      {/* BLOCO 2: Layout em Duas Colunas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* Coluna Esquerda: Formulário de Cadastro (Sign Up) */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginBottom: '20px' }}>📝 Cadastrar Novo Usuário</h3>
          
          {mensagem.texto && (
            <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', background: fillFormMsgBg(mensagem.erro), color: fillFormMsgColor(mensagem.erro), fontWeight: 'bold' }}>
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={handleCadastro}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nome de Usuário (Login)</label>
              <input 
                type="text" 
                placeholder="Ex: joao.silva" 
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
                placeholder="Mínimo 6 caracteres" 
                value={novoUsuario.password} 
                onChange={e => setNovoUsuario({ ...novoUsuario, password: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0' }}
                required 
              />
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="checkAdmin"
                checked={novoUsuario.is_superuser} 
                onChange={e => setNovoUsuario({ ...novoUsuario, is_superuser: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="checkAdmin" style={{ fontWeight: '600', cursor: 'pointer' }}>Este usuário será um Administrador?</label>
            </div>

            <button 
              type="submit" 
              style={{ width: '100%', padding: '12px', background: '#1c3d5a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              Confirmar Registro
            </button>
          </form>
        </div>

        {/* Coluna Direita: Painel Informativo sobre Segurança de Telemetria */}
        <div style={{ background: '#f7fafc', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginBottom: '15px' }}>ℹ️ Informações de Governança</h3>
          <p style={{ lineHeight: '1.6', color: '#4a5568', marginBottom: '15px' }}>
            Como administrador do <strong>SITREV</strong>, as contas criadas através deste painel ganham acesso imediato às rotas de monitoramento geográfico de Tucuruí, Pará.
          </p>
          <ul style={{ paddingLeft: '20px', lineHeight: '2', color: '#4a5568' }}>
            <li><strong>Usuários Comuns:</strong> Visualizam apenas as abas de monitoramento.</li>
            <li><strong>Administradores:</strong> Possuem acesso a este painel e ao Django Admin.</li>
            <li>As senhas são criptografadas em Hash (PBKDF2) antes do salvamento no Neon Postgres.</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

// Funções auxiliares simples para estilizar a mensagem de feedback
function fillFormMsgBg(isErro) { return isErro ? '#fff5f5' : '#f0fff4'; }
function fillFormMsgColor(isErro) { return isErro ? '#c53030' : '#22543d'; }
