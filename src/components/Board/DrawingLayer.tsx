import { Layer, Line } from 'react-konva';
import { useBoardStore } from '../../stores/useBoardStore';
import { useToolStore } from '../../stores/useToolStore';
import { useActiveStrokeStore } from '../../hooks/useDrawing';

interface DrawingLayerProps {
  scale: number;
}

export default function DrawingLayer({ scale }: DrawingLayerProps) {
  const strokes = useBoardStore((s) => s.strokes);
  const drawColor = useToolStore((s) => s.drawColor);
  const brushSize = useToolStore((s) => s.brushSize);
  const activeTool = useToolStore((s) => s.activeTool);

  const activePoints = useActiveStrokeStore((s) => s.points);
  const isActive = useActiveStrokeStore((s) => s.isActive);
  const isEraser = activeTool === 'erase';

  return (
    <Layer>
      {strokes.map((stroke) => (
        <Line
          key={stroke.id}
          points={stroke.points}
          stroke={stroke.color === '#eraser' ? '#000' : stroke.color}
          strokeWidth={stroke.width / scale}
          tension={0.3}
          lineCap="round"
          lineJoin="round"
          globalCompositeOperation={
            stroke.color === '#eraser' ? 'destination-out' : 'source-over'
          }
        />
      ))}
      {/* Active stroke being drawn */}
      {isActive && activePoints.length >= 2 && (
        <Line
          points={activePoints}
          stroke={isEraser ? '#ccc' : drawColor}
          strokeWidth={(isEraser ? brushSize * 3 : brushSize) / scale}
          tension={0.3}
          lineCap="round"
          lineJoin="round"
          opacity={isEraser ? 0.5 : 1}
          globalCompositeOperation={isEraser ? 'destination-out' : 'source-over'}
        />
      )}
    </Layer>
  );
}
