import { Layer, Group, Circle, Ellipse, RegularPolygon, Text, Shape } from 'react-konva';
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
    case 'player': {
      const r = baseSize * pixelSize;
      const color = obj.color || '#dc2626';
      // Darken color for base/shadow
      const darken = (hex: string, amount: number) => {
        const num = parseInt(hex.replace('#', ''), 16);
        const R = Math.max(0, (num >> 16) - amount);
        const G = Math.max(0, ((num >> 8) & 0xff) - amount);
        const B = Math.max(0, (num & 0xff) - amount);
        return `rgb(${R},${G},${B})`;
      };
      const darkColor = darken(color, 60);
      const lightColor = darken(color, -40);

      return (
        <>
          {/* Shadow on ice */}
          <Ellipse
            radiusX={r * 0.9}
            radiusY={r * 0.35}
            offsetY={-r * 0.7}
            fill="rgba(0,0,0,0.2)"
          />
          {/* Base/bottom edge (3D depth) */}
          <Ellipse
            radiusX={r}
            radiusY={r * 0.35}
            offsetY={-r * 0.2}
            fill={darkColor}
          />
          {/* Side cylinder */}
          <Shape
            sceneFunc={(context, shape) => {
              context.beginPath();
              // Left side
              context.moveTo(-r, -r * 0.2);
              context.lineTo(-r, r * 0.15);
              // Bottom ellipse arc
              context.ellipse(0, r * 0.15, r, r * 0.35, 0, Math.PI, 0, true);
              // Right side
              context.lineTo(r, -r * 0.2);
              context.closePath();
              context.fillStrokeShape(shape);
            }}
            fill={color}
          />
          {/* Top face (main colored disc) */}
          <Ellipse
            radiusX={r}
            radiusY={r * 0.35}
            offsetY={r * 0.15}
            fill={color}
            stroke={darkColor}
            strokeWidth={1 * pixelSize}
          />
          {/* Highlight on top */}
          <Ellipse
            radiusX={r * 0.6}
            radiusY={r * 0.18}
            offsetY={r * 0.25}
            fill={lightColor}
            opacity={0.35}
          />
          {/* Outer ring on top */}
          <Ellipse
            radiusX={r * 0.85}
            radiusY={r * 0.3}
            offsetY={r * 0.15}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={1.5 * pixelSize}
          />
          {/* Label on top face */}
          {obj.label && (
            <Text
              text={obj.label}
              fontSize={r * 1.0}
              fill="#fff"
              fontStyle="bold"
              fontFamily="Arial, sans-serif"
              align="center"
              verticalAlign="middle"
              offsetX={r * 0.55}
              offsetY={r * 0.15}
              width={r * 1.1}
              height={r * 0.7}
              shadowColor="#000"
              shadowBlur={2 * pixelSize}
              shadowOpacity={0.5}
            />
          )}
        </>
      );
    }
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
