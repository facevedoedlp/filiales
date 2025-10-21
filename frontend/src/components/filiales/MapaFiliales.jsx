import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useMemo } from 'react';

const markerIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export const MapaFiliales = ({ filiales }) => {
  const conCoordenadas = useMemo(
    () => filiales?.filter((filial) => filial.latitud && filial.longitud) || [],
    [filiales],
  );

  const center = useMemo(() => {
    if (!conCoordenadas.length) {
      return [-34.6037, -58.3816];
    }
    const lat =
      conCoordenadas.reduce((acc, filial) => acc + (Number(filial.latitud) || 0), 0) / conCoordenadas.length;
    const lng =
      conCoordenadas.reduce((acc, filial) => acc + (Number(filial.longitud) || 0), 0) / conCoordenadas.length;
    return [lat || -34.6037, lng || -58.3816];
  }, [conCoordenadas]);

  return (
    <MapContainer center={center} zoom={5} className="h-[500px] w-full rounded-lg border border-slate-200">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      {conCoordenadas.map((filial) => (
        <Marker key={filial.id} position={[Number(filial.latitud), Number(filial.longitud)]} icon={markerIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{filial.nombre}</p>
              <p>{filial.ciudad}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapaFiliales;
