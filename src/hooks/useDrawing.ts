import { useRef, useCallback } from 'react';
import { create } from 'zustand';
import type Konva from 'konva';
import { useBoardStore } from '../stores/useBoardStore';
import { useToolStore } from '../stores/useToolStore';

let strokeIdCounter = 0;

// Store for the active (in-progress) stroke to trigger React re-renders
interface ActiveStrokeState {
  points: number[];
  isActive: boolean;
  setPoints: (points: number[]) => void;
  setActive: (active: boolean) => void;
  reset: () => void;
}

export const useActiveStrokeStore = create<ActiveStrokeState>((set) => ({
  points: [],
  isActive: false,
  setPoints: (points) => set({ points }),
  setActive: (active) => set({ isActive: active }),
  reset: () => set({ points: [], isActive: false }),
}));

export function useDrawing() {
  const currentStrokeId = useRef<string>('');

  const addStroke = useBoardStore((s) => s.addStroke);

  const handlePointerDown = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent | TouchEvent>) => {
      const tool = useToolStore.getState().activeTool;
      if (tool !== 'draw' && tool !== 'erase') return;

      const nativeEvent = e.evt;
      if (nativeEvent instanceof TouchEvent && nativeEvent.touches.length > 1) return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const transform = stage.getAbsoluteTransform().copy().invert();
      const rinkPos = transform.point(pos);

      currentStrokeId.current = `stroke-${Date.now()}-${strokeIdCounter++}`;

      const store = useActiveStrokeStore.getState();
      store.setPoints([rinkPos.x, rinkPos.y]);
      store.setActive(true);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent | TouchEvent>) => {
      const store = useActiveStrokeStore.getState();
      if (!store.isActive) return;

      const nativeEvent = e.evt;
      if (nativeEvent instanceof TouchEvent && nativeEvent.touches.length > 1) {
        store.reset();
        return;
      }

      const stage = e.target.getStage();
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const transform = stage.getAbsoluteTransform().copy().invert();
      const rinkPos = transform.point(pos);

      store.setPoints([...store.points, rinkPos.x, rinkPos.y]);
    },
    []
  );

  const handlePointerUp = useCallback(() => {
    const store = useActiveStrokeStore.getState();
    if (!store.isActive) return;

    if (store.points.length >= 4) {
      const { drawColor, brushSize, activeTool } = useToolStore.getState();
      addStroke({
        id: currentStrokeId.current,
        points: store.points,
        color: activeTool === 'erase' ? '#eraser' : drawColor,
        width: activeTool === 'erase' ? brushSize * 3 : brushSize,
      });
    }

    store.reset();
  }, [addStroke]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
