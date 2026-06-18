import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [metricas, setMetricas] = useState({ totalMotoristas: 0, totalVeiculos: 0, viagensAtivas: 0 });
  const [abaAtiva, setAbaAtiva] = useState('usuario'); // Controla qual formulário exibir
  const token = localStorage.getItem('access_token');

  // Estados dos formulários
  const [novoUsuario, setNovoUsuario] = useState({ username: '', password: '', is_superuser: false });
  const [novoMotorista, setNovoMotorista] = useState({ nome: '' });
  const [novoVeiculo, setNovoVeiculo] = useState({ modelo: '', placa: '' });
  const [imagemVeiculo, setImagemVeiculo] = useState(null);

  // Estado de feedback
  const [mensagem, setMensagem] = useState({ texto: '', erro: false });

  // 1. Carrega dados gerenciais para os cards de indicadores
  const carregarMetricas = () => {
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/motoristas/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(motoristas => {
      const ativos = motoristas.filter(m => m.status === 'Em viagem').length;
      setMetricas(prev => ({ ...prev, totalMotoristas: motoristas.length, viagensAtivas: ativos }));
    })
    .catch(err => console.error(err));

    fetch(`${import.meta.env.VITE_API_URL}/veiculos/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(veiculos => setMetricas(prev => ({ ...prev, totalVeiculos: veiculos.length })))
    .catch(err => console.error(err));
  };

  useEffect(() => {
    carregarMetricas();
  }, [token]);

  // 2. CADASTRO DE USUÁRIO (JSON)
  const handleCadastroUsuario = async (e) => {
    e.preventDefault();
    setMensagem({ texto: '', erro: false });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro ao cadastrar usuário.');
      
      setMensagem({ texto: `✅ Usuário "${novoUsuario.username}" registrado!`, erro: false });
      setNovoUsuario({ username: '', password: '', is_superuser: false });
    } catch (err) { setMensagem({ texto: `❌ ${err.message}`, erro: true }); }
  };

  // 3. CADASTRO DE MOTORISTA (JSON)
  const handleCadastroMotorista = async (e) => {
    e.preventDefault();
    setMensagem({ texto: '', erro: false });
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/motoristas/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(novoMotorista)
      });
      if (!res.ok) throw new Error('Falha ao cadastrar motorista.');
      
      setMensagem({ texto: `✅ Motorista "${novoMotorista.nome}" cadastrado com sucesso!`, erro: false });
      setNovoMotorista({ nome: '' });
      carregarMetricas();
    } catch (err) { setMensagem({ texto: `❌ ${err.message}`, erro: true }); }
  };

  // 4. CADASTRO DE VEÍCULO (FormData - Necessário para Upload de Imagem)
  const handleCadastroVeiculo = async (e) => {
    e.preventDefault();
    setMensagem({ texto: '', erro: false });
    try {
      const formData = new FormData();
      formData.append('modelo', novoVeiculo.modelo);
      formData.append('placa', novoVeiculo.placa);
      if (imagemVeiculo) {
        formData.append('imagem', imagemVeiculo);
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/veiculos/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Sem 'Content-Type', o navegador define o Boundary do arquivo sozinho
        body: formData
      });
      if (!res.ok) throw new Error('Falha ao cadastrar veículo. Verifique se a placa já existe.');
      
      setMensagem({ texto: `✅ Veículo "${novoVeiculo.modelo}" [${novoVeiculo.placa}] cadastrado!`, erro: false });
      setNovoVeiculo({ modelo: '', placa: '' });
      setImagemVeiculo(null);
      carregarMetricas();
    } catch (err) { setMensagem({ texto: `❌ ${err.message}`, erro: true }); }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px' }}>
        <h2>🛡️ Painel de Controle do Administrador</h2>
        <p style={{ color: '#4a5568' }}>Gerenciamento global de frotas, condutores e credenciais de acesso.</p>
      </div>

      {/* Indicadores Gerenciais */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#ebf8ff', borderLeft: '4px solid #3182ce', padding: '15px', borderRadius: '4px' }}>
          <h4 style={{ color: '#2b6cb0', fontSize: '11px', textTransform: 'uppercase' }}>Condutores</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{metricas.totalMotoristas}</p>
        </div>
        <div style={{ background: '#e6fffa', borderLeft: '4px solid #319795', padding: '15px', borderRadius: '4px' }}>
          <h4 style={{ color: '#234e52', fontSize: '11px', textTransform: 'uppercase' }}>Veículos</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{metricas.totalVeiculos}</p>
        </div>
        <div style={{ background: '#f0fff4', borderLeft: '4px solid #38a169', padding: '15px', borderRadius: '4px' }}>
          <h4 style={{ color: '#22543d', fontSize: '11px', textTransform: 'uppercase' }}>Em Viagem</h4>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2f855a' }}>🟢 {metricas.viagensAtivas}</p>
        </div>
      </div>

      {/* Seletor de Abas Internas do Dashboard */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #cbd5e0', paddingBottom: '10px' }}>
        <button onClick={() => { setAbaAtiva('usuario'); setMensagem({texto:'', erro:false}); }} style={{ padding: '10px 15px', cursor: 'pointer', background: abaAtiva === 'usuario' ? '#1c3d5a' : '#e2e8f0', color: abaAtiva === 'usuario' ? 'white' : '#333', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>👤 Novo Usuário</button>
        <button onClick={() => { setAbaAtiva('motorista'); setMensagem({texto:'', erro:false}); }} style={{ padding: '10px 15px', cursor: 'pointer', background: abaAtiva === 'motorista' ? '#1c3d5a' : '#e2e8f0', color: abaAtiva === 'motorista' ? 'white' : '#333', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>👥 Novo Motorista</button>
        <button onClick={() => { setAbaAtiva('veiculo'); setMensagem({texto:'', erro:false}); }} style={{ padding: '10px 15px', cursor: 'pointer', background: abaAtiva === 'veiculo' ? '#1c3d5a' : '#e2e8f0', color: abaAtiva === 'veiculo' ? 'white' : '#333', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>🚗 Novo Veículo</button>
      </div>

      {/* Feedback Alert */}
      {mensagem.texto && (
        <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '4px', background: mensagem.erro ? '#fff5f5' : '#f0fff4', color: mensagem.erro ? '#c53030' : '#22543d', fontWeight: 'bold' }}>
          {mensagem.texto}
        </div>
      )}

      {/* CONTEÚDO DINÂMICO DOS FORMULÁRIOS */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
        
        {/* FORMULÁRIO 1: USUÁRIO */}
        {abaAtiva === 'usuario' && (
          <form onSubmit={handleCadastroUsuario}>
            <h3>📝 Registrar Operador / Admin</h3>
            <div style={{ margin: '15px 0' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Login de Usuário</label>
              <input type="text" value={novoUsuario.username} onChange={e => setNovoUsuario({ ...novoUsuario, username: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0' }} required />
            </div>
            <div style={{ margin: '15px 0' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Senha</label>
              <input type="password" value={novoUsuario.password} onChange={e => setNovoUsuario({ ...novoUsuario, password: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0' }} required />
            </div>
            <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" id="chk" checked={novoUsuario.is_superuser} onChange={e => setNovoUsuario({ ...novoUsuario, is_superuser: e.target.checked })} style={{ width: '18px', height: '18px' }} />
              <label htmlFor="chk" style={{ fontWeight: '600', cursor: 'pointer' }}>Conceder acesso de Administrador?</label>
            </div>
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#1c3d5a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Usuário</button>
          </form>
        )}

        {/* FORMULÁRIO 2: MOTORISTA */}
        {abaAtiva === 'motorista' && (
          <form onSubmit={handleCadastroMotorista}>
            <h3>📋 Cadastrar Novo Motorista</h3>
            <div style={{ margin: '15px 0' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Nome Completo do Condutor</label>
              <input type="text" placeholder="Ex: Carlos Alberto de Souza" value={novoMotorista.nome} onChange={e => setNovoMotorista({ nome: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0' }} required />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#1c3d5a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Salvar Motorista
            </button>
          </form>
        )}

        {/* FORMULÁRIO 3: VEÍCULO */}
        {abaAtiva === 'veiculo' && (
          <form onSubmit={handleCadastroVeiculo}>
            <h3>🚗 Adicionar Veículo à Frota</h3>

            <div style={{ margin: '15px 0' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '600'
                }}
              >
                Modelo do Veículo
              </label>

              <input
                type="text"
                placeholder="Ex: Mercedes-Benz Axor"
                value={novoVeiculo.modelo}
                onChange={e =>
                  setNovoVeiculo({
                    ...novoVeiculo,
                    modelo: e.target.value
                  })
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e0'
                }}
                required
              />
            </div>

            <div style={{ margin: '15px 0' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '600'
                }}
              >
                Placa do Veículo
              </label>

              <input
                type="text"
                placeholder="Ex: JXN-4E99"
                value={novoVeiculo.placa}
                onChange={e =>
                  setNovoVeiculo({
                    ...novoVeiculo,
                    placa: e.target.value
                  })
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e0'
                }}
                required
              />
            </div>

            <div style={{ margin: '15px 0' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: '600'
                }}
              >
                Foto do Veículo (Opcional)
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={e => setImagemVeiculo(e.target.files[0])}
                style={{
                  width: '100%',
                  padding: '5px 0'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: '#1c3d5a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Salvar Veículo
            </button>
          </form>
        )}
      </div>
    </div>
  );
}