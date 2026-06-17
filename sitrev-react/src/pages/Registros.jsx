import { useState, useEffect } from 'react';
import Mapa from '../components/Mapa';

export default function Registros() {
  const [viagens, setViagens] = useState([]);
  const [gpsAtual, setGpsAtual] = useState([]);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    // Se o token sumiu por algum motivo
    if (!token) {
      console.warn("Token não encontrado no localStorage");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/viagens/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setViagens(data))
    .catch(err => console.error("Erro ao buscar registros:", err));
  }, [token]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
      <div>
        <h3>Últimos Registros de Direção</h3>
        <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr><th>Veículo (Placa)</th><th>Motorista</th><th>Data/Hora</th></tr>
          </thead>
          <tbody>
            {viagens.map(vi => (
              <tr key={vi.id} onClick={() => setGpsAtual(vi.rastro_gps)} style={{ cursor: 'pointer' }}>
                <td><strong>{vi.veiculo_modelo}</strong> <small>({vi.veiculo_placa})</small></td>
                <td>{vi.motorista_nome}</td>
                <td>{new Date(vi.inicio_viagem).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ height: '500px', background: '#eee' }}>
        <Mapa coordenadas={gpsAtual} cor="red" />
      </div>
    </div>
  );
}
