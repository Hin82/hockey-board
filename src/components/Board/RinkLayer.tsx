import { Layer } from 'react-konva';
import { useToolStore } from '../../stores/useToolStore';
import FullRink, { HalfRinkShapes, ZoneRinkShapes } from './rink/FullRink';

export default function RinkLayer() {
  const rinkMode = useToolStore((s) => s.rinkMode);

  return (
    <Layer listening={false}>
      {rinkMode === 'full' && <FullRink />}
      {rinkMode === 'half' && <HalfRinkShapes />}
      {rinkMode === 'zone' && <ZoneRinkShapes />}
    </Layer>
  );
}
