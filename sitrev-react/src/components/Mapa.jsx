import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Componente auxiliar para ajustar o foco do mapa quando a rota mudar
function ChangeView({ bounds, center }) {
  const map = useMap();
  if (bounds && bounds.length > 0) {
    map.fitBounds(bounds);
  } else {
    map.setView(center, 13);
  }
  return null;
}

export default function Mapa({ coordenadas, cor = "blue" }) {
  const tucuruiCenter = [-3.766, -49.673];
  
  // Se vier string do backend, converte para array do JavaScript
  const pontos = typeof coordenadas === 'string' ? JSON.parse(coordenadas) : coordenadas;

  return (
    <MapContainer center={tucuruiCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />
      {pontos && pontos.length > 0 && (
        <>
          <Polyline positions={pontos} color={cor} weight={5} />
          <ChangeView bounds={pontos} center={tucuruiCenter} />
        </>
      )}
    </MapContainer>
  );
}
