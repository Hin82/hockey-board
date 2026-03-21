import { Layer, Group, Circle, RegularPolygon, Text, Shape } from 'react-konva';
import { useBoardStore } from '../../stores/useBoardStore';
import { useToolStore } from '../../stores/useToolStore';
import { GOALS, SMALL_GOAL } from './rink/rinkGeometry';
import type { PlacedObject } from '../../types/board';
import { useRef } from 'react';

interface ObjectsLayerProps {
  scale: number;
}

export default function ObjectsLayer({ scale }: ObjectsLayerProps) {
  const objects = useBoardStore((s) => s.objects);
  const updatePos = useBoardStore((s) => s.updateObjectPosition);
  const updateRot = useBoardStore((s) => s.updateObjectRotation);
  const removeObject = useBoardStore((s) => s.removeObject);
  const activeTool = useToolStore((s) => s.activeTool);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didDrag = useRef(false);

  const isDraggable = activeTool === 'select';

  const handleDragStart = () => {
    didDrag.current = false;
  };

  const handleDragMove = () => {
    didDrag.current = true;
    cancelLongPress();
  };

  const handleDragEnd = (id: string, e: { target: { x: () => number; y: () => number } }) => {
    updatePos(id, e.target.x(), e.target.y());
  };

  const handleLongPress = (id: string) => {
    longPressTimer.current = setTimeout(() => {
      removeObject(id);
    }, 600);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Double-tap/click to rotate 90 degrees
  const lastTapTime = useRef<Record<string, number>>({});
  const handleTapRotate = (id: string) => {
    if (didDrag.current) return;
    const now = Date.now();
    const lastTap = lastTapTime.current[id] || 0;
    if (now - lastTap < 350) {
      const obj = objects.find((o) => o.id === id);
      if (obj) {
        updateRot(id, (obj.rotation + 90) % 360);
      }
      lastTapTime.current[id] = 0;
    } else {
      lastTapTime.current[id] = now;
    }
  };

  return (
    <Layer>
      {objects.map((obj) => (
        <Group
          key={obj.id}
          x={obj.x}
          y={obj.y}
          rotation={obj.rotation}
          draggable={isDraggable}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={(e) => handleDragEnd(obj.id, e)}
          onTouchStart={() => isDraggable && handleLongPress(obj.id)}
          onTouchEnd={() => {
            cancelLongPress();
            if (isDraggable) handleTapRotate(obj.id);
          }}
          onClick={() => {
            if (isDraggable) handleTapRotate(obj.id);
          }}
          onMouseDown={() => isDraggable && handleLongPress(obj.id)}
          onMouseUp={cancelLongPress}
        >
          <ObjectShape obj={obj} scale={scale} />
        </Group>
      ))}
    </Layer>
  );
}

function ObjectShape({ obj, scale }: { obj: PlacedObject; scale: number }) {
  const pixelSize = 1 / scale;
  const baseSize = 12;

  switch (obj.type) {
    case 'player':
      return (
        <>
          <Circle
            radius={baseSize * pixelSize}
            fill={obj.color || '#dc2626'}
            stroke="#fff"
            strokeWidth={2 * pixelSize}
          />
          {obj.label && (
            <Text
              text={obj.label}
              fontSize={baseSize * 1.2 * pixelSize}
              fill="#fff"
              fontStyle="bold"
              align="center"
              verticalAlign="middle"
              offsetX={baseSize * 0.6 * pixelSize}
              offsetY={baseSize * 0.6 * pixelSize}
              width={baseSize * 1.2 * pixelSize}
              height={baseSize * 1.2 * pixelSize}
            />
          )}
        </>
      );
    case 'cone':
      return (
        <RegularPolygon
          sides={3}
          radius={baseSize * 0.9 * pixelSize}
          fill="#ea580c"
          stroke="#fff"
          strokeWidth={1.5 * pixelSize}
        />
      );
    case 'puck':
      return (
        <Circle
          radius={baseSize * 0.5 * pixelSize}
          fill="#1a1a1a"
          stroke="#444"
          strokeWidth={1 * pixelSize}
        />
      );
    case 'smallGoal': {
      // Use real rink dimensions for small goals
      const w = SMALL_GOAL.depth;
      const h = SMALL_GOAL.width;
      return (
        <Shape
          sceneFunc={(context, shape) => {
            // U-shaped goal (open on one side)
            context.beginPath();
            context.moveTo(w / 2, -h / 2);
            context.lineTo(-w / 2, -h / 2);
            context.lineTo(-w / 2, h / 2);
            context.lineTo(w / 2, h / 2);
            context.fillStrokeShape(shape);
          }}
          fill="rgba(200,200,200,0.3)"
          stroke="#c62828"
          strokeWidth={0.06}
        />
      );
    }
    case 'largeGoal': {
      // Use real IIHF goal dimensions (same as the rink goals)
      const w = GOALS.depth;
      const h = GOALS.width;
      return (
        <Shape
          sceneFunc={(context, shape) => {
            // U-shaped goal (open on one side)
            context.beginPath();
            context.moveTo(w / 2, -h / 2);
            context.lineTo(-w / 2, -h / 2);
            context.lineTo(-w / 2, h / 2);
            context.lineTo(w / 2, h / 2);
            context.fillStrokeShape(shape);
          }}
          fill="rgba(200,200,200,0.3)"
          stroke="#c62828"
          strokeWidth={0.08}
        />
      );
    }
    default:
      return null;
  }
}
