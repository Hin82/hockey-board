import { create } from 'zustand';
import type { Tool, RinkMode, ObjectType } from '../types/board';
import { DEFAULT_DRAW_COLOR, DEFAULT_BRUSH_SIZE } from '../utils/colors';

interface ToolState {
  activeTool: Tool;
  drawColor: string;
  brushSize: number;
  rinkMode: RinkMode;
  placingObjectType: ObjectType | null;
  placingObjectColor: string;
  setActiveTool: (tool: Tool) => void;
  setDrawColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  setRinkMode: (mode: RinkMode) => void;
  setPlacingObject: (type: ObjectType | null, color?: string) => void;
}

export const useToolStore = create<ToolState>((set) => ({
  activeTool: 'draw',
  drawColor: DEFAULT_DRAW_COLOR,
  brushSize: DEFAULT_BRUSH_SIZE,
  rinkMode: 'full',
  placingObjectType: null,
  placingObjectColor: '#dc2626',
  setActiveTool: (tool) => set({ activeTool: tool }),
  setDrawColor: (color) => set({ drawColor: color }),
  setBrushSize: (size) => set({ brushSize: size }),
  setRinkMode: (mode) => set({ rinkMode: mode }),
  setPlacingObject: (type, color) =>
    set((state) => ({
      placingObjectType: type,
      placingObjectColor: color ?? state.placingObjectColor,
      activeTool: type ? 'place' : state.activeTool,
    })),
}));
