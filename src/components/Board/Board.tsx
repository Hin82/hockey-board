import { useRef, useMemo, useState, useCallback } from 'react';
import { Stage } from 'react-konva';
import type Konva from 'konva';
import RinkLayer from './RinkLayer';
import DrawingLayer from './DrawingLayer';
import ObjectsLayer from './ObjectsLayer';
import { useViewport } from '../../hooks/useViewport';
import { useDrawing } from '../../hooks/useDrawing';
import { useToolStore } from '../../stores/useToolStore';
import { useBoardStore } from '../../stores/useBoardStore';
import { RINK, LINES } from './rink/rinkGeometry';
let objectIdCounter = 0;

export default function Board() {
  const { width, height } = useViewport();
  const stageRef = useRef<Konva.Stage>(null);
  const { handlePointerDown, handlePointerMove, handlePointerUp } = useDrawing();

  const rinkMode = useToolStore((s) => s.rinkMode);
  const activeTool = useToolStore((s) => s.activeTool);
  const placingObjectType = useToolStore((s) => s.placingObjectType);
  const placingObjectColor = useToolStore((s) => s.placingObjectColor);
  const addObject = useBoardStore((s) => s.addObject);

  // Zoom state
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const lastDist = useRef(0);
  const lastCenter = useRef({ x: 0, y: 0 });

  // Calculate scale to fit rink in viewport
  const { scale, offsetX, offsetY } = useMemo(() => {
    let rw = RINK.width;
    let rh = RINK.height;

    if (rinkMode === 'half') {
      rw = LINES.centerLineX + 0.5;
    } else if (rinkMode === 'zone') {
      rw = LINES.blueLineLeftX + 0.5;
    }

    const padding = 10;
    const availW = width - padding * 2;
    const availH = height - padding * 2;

    const scaleX = availW / rw;
    const scaleY = availH / rh;
    const s = Math.min(scaleX, scaleY);

    const ox = (width - rw * s) / 2;
    const oy = (height - rh * s) / 2;

    return { scale: s, offsetX: ox, offsetY: oy };
  }, [width, height, rinkMode]);

  const effectiveScale = scale * stageScale;

  // Handle stage click for placing objects
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (activeTool !== 'place' || !placingObjectType) return;

      const stage = e.target.getStage();
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;

      const transform = stage.getAbsoluteTransform().copy().invert();
      const rinkPos = transform.point(pos);

      addObject({
        id: `obj-${Date.now()}-${objectIdCounter++}`,
        type: placingObjectType,
        x: rinkPos.x,
        y: rinkPos.y,
        rotation: 0,
        color: placingObjectColor,
      });
    },
    [activeTool, placingObjectType, placingObjectColor, addObject]
  );

  // Touch handlers for pinch-to-zoom
  const handleTouchMove = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touch = e.evt;
      if (touch.touches.length === 2) {
        e.evt.preventDefault();

        const t1 = touch.touches[0];
        const t2 = touch.touches[1];
        const dist = Math.sqrt(
          Math.pow(t2.clientX - t1.clientX, 2) + Math.pow(t2.clientY - t1.clientY, 2)
        );
        const center = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        };

        if (lastDist.current === 0) {
          lastDist.current = dist;
          lastCenter.current = center;
          return;
        }

        const scaleBy = dist / lastDist.current;
        const newScale = Math.max(0.5, Math.min(4, stageScale * scaleBy));

        const dx = center.x - lastCenter.current.x;
        const dy = center.y - lastCenter.current.y;

        setStageScale(newScale);
        setStagePos((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));

        lastDist.current = dist;
        lastCenter.current = center;
      }
    },
    [stageScale]
  );

  const handleTouchEnd = useCallback(() => {
    lastDist.current = 0;
  }, []);

  // Double-tap to reset zoom
  const lastTap = useRef(0);
  const handleDoubleTap = useCallback(
    (_e: Konva.KonvaEventObject<TouchEvent>) => {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        setStageScale(1);
        setStagePos({ x: 0, y: 0 });
      }
      lastTap.current = now;
    },
    []
  );

  return (
    <div className="flex-1 bg-slate-900">
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={effectiveScale}
        scaleY={effectiveScale}
        x={offsetX + stagePos.x}
        y={offsetY + stagePos.y}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onTouchMove={handleTouchMove}
        onTouchEnd={(e) => {
          handleTouchEnd();
          handleDoubleTap(e);
        }}
      >
        <RinkLayer />
        <ObjectsLayer scale={effectiveScale} />
        <DrawingLayer scale={effectiveScale} />
      </Stage>
    </div>
  );
}
