import { useState, useEffect } from 'react';
import Mapa from '../components/Mapa';

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [busca, setBusca] = useState('');
  const [gpsAtual, setGpsAtual] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState(null);
  const token = localStorage.getItem('access_token');
  
  useEffect(() => {
    // Se o token sumiu por algum motivo
    if (!token) {
      console.warn("Token não encontrado no localStorage");
      return;
    }
    
    // 1. Busca a lista de veículos cadastrados filtrados pela busca genérica
    fetch(`${import.meta.env.VITE_API_URL}/veiculos/?search=${busca}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar veículos no servidor.');
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) setVeiculos(data);
    })
    .catch(err => console.error("Erro na listagem de veículos:", err));
  }, [busca, token]);

  // 2. Carrega o histórico de todas as viagens do veículo clicado no botão
  const carregarHistorico = (id, modelo) => {
    fetch(`${import.meta.env.VITE_API_URL}/veiculos/${id}/viagens/`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Erro ao carregar histórico.');
      return res.json();
    })
    .then(data => {
      setHistorico(data);
      setVeiculoSelecionado(modelo);
    })
    .catch(err => console.error("Erro no histórico de viagens:", err));
  };

  // 3. Converte a string JSON de coordenadas vinda do Django para uma lista real do JS
  const tratarEPlotarMapa = (rastroGpsString) => {
    try {
      if (!rastroGpsString) {
        setGpsAtual([]);
        return;
      }
      const listaCoordenadas = typeof rastroGpsString === 'string' ? JSON.parse(rastroGpsString) : rastroGpsString;
      setGpsAtual(listaCoordenadas);
    } catch (e) {
      console.error("Erro ao converter string de GPS:", e);
      setGpsAtual([]);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
      {/* Coluna Esquerda: Listagem e Dados */}
      <div>
        <div style={{ marginBottom: '15px' }}>
          <h3>Aba Veículos</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>Lista de frotas e rastro de GPS</p>
        </div>

        {/* Barra de busca genérica por placa ou modelo */}
        <input 
          type="text" 
          placeholder="🔍 Buscar por modelo ou placa..." 
          value={busca} 
          onChange={e => setBusca(e.target.value)} 
          style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }} 
        />
        
        {/* Tabela Principal de Veículos */}
        <table width="100%" border="1" cellPadding="10" style={{ borderCollapse: 'collapse', background: 'white', textAlign: 'left' }}>
          <thead style={{ background: '#f4f6f9' }}>
            <tr>
              <th>Foto</th>
              <th>Modelo/Placa</th>
              <th>Último Motorista</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {veiculos.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>Nenhum veículo encontrado.</td>
              </tr>
            ) : (
              veiculos.map(v => (
                <tr 
                  key={v.id} 
                  onClick={() => tratarEPlotarMapa(v.rastro_gps_ultima_viagem)} 
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <img 
                      src={v.imagem || 'https://placeholder.com'} 
                      width="60" 
                      height="40" 
                      style={{ objectFit: 'cover', borderRadius: '4px', background: '#eee' }} 
                      alt="veiculo"
                    />
                  </td>
                  <td><strong>{v.modelo}</strong><br/><small>{v.placa} (ID: {v.id})</small></td>
                  <td>{v.ultimo_motorista}</td>
                  <td>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); // Impede o clique de ativar a rota do mapa geral
                        carregarHistorico(v.id, v.modelo); 
                      }}
                      style={{ padding: '6px 12px', cursor: 'pointer', background: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                    >
                      Exibir mais
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Histórico Detalhado (Aparece ao clicar em 'Exibir mais') */}
        {veiculoSelecionado && (
          <div style={{ marginTop: '20px', borderTop: '2px dashed #ccc', paddingTop: '15px' }}>
            <h4>Histórico de Viagens: <span style={{ color: '#3182ce' }}>{veiculoSelecionado}</span></h4>
            <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: 'collapse', marginTop: '10px', background: '#fafafa' }}>
              <thead style={{ background: '#edf2f7' }}>
                <tr>
                  <th>ID Viagem</th>
                  <th>Motorista</th>
                  <th>Duração</th>
                </tr>
              </thead>
              <tbody>
                {historico.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: '#999' }}>Nenhuma viagem registrada.</td>
                  </tr>
                ) : (
                  historico.map(vi => (
                    <tr key={vi.id} style={{ cursor: 'pointer' }} onClick={() => tratarEPlotarMapa(vi.rastro_gps)}>
                      <td>{vi.id}</td>
                      <td>{vi.motorista_nome}</td>
                      <td>{vi.duracao ? `${vi.duracao} horas` : 'Em andamento'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Coluna Direita: Renderização Dinâmica do OpenStreetMap */}
      <div style={{ height: '550px', background: '#eee', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc', position: 'sticky', top: '20px' }}>
        <Mapa coordenadas={gpsAtual} cor="blue" />
      </div>
    </div>
  );
}
