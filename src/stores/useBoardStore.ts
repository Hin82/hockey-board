import { create } from 'zustand';
import type { Stroke, PlacedObject } from '../types/board';

interface HistoryEntry {
  type: 'addStroke' | 'removeStroke' | 'addObject' | 'removeObject' | 'moveObject' | 'clearAll';
  data: unknown;
}

interface BoardStore {
  strokes: Stroke[];
  objects: PlacedObject[];
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];

  addStroke: (stroke: Stroke) => void;
  removeStroke: (id: string) => void;
  addObject: (obj: PlacedObject) => void;
  updateObjectPosition: (id: string, x: number, y: number) => void;
  updateObjectRotation: (id: string, rotation: number) => void;
  removeObject: (id: string) => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // For persistence
  loadState: (strokes: Stroke[], objects: PlacedObject[]) => void;
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  strokes: [],
  objects: [],
  undoStack: [],
  redoStack: [],

  addStroke: (stroke) =>
    set((state) => ({
      strokes: [...state.strokes, stroke],
      undoStack: [...state.undoStack, { type: 'addStroke', data: stroke }],
      redoStack: [],
    })),

  removeStroke: (id) => {
    const stroke = get().strokes.find((s) => s.id === id);
    if (!stroke) return;
    set((state) => ({
      strokes: state.strokes.filter((s) => s.id !== id),
      undoStack: [...state.undoStack, { type: 'removeStroke', data: stroke }],
      redoStack: [],
    }));
  },

  addObject: (obj) =>
    set((state) => ({
      objects: [...state.objects, obj],
      undoStack: [...state.undoStack, { type: 'addObject', data: obj }],
      redoStack: [],
    })),

  updateObjectPosition: (id, x, y) => {
    const obj = get().objects.find((o) => o.id === id);
    if (!obj) return;
    const prevPos = { id, x: obj.x, y: obj.y };
    set((state) => ({
      objects: state.objects.map((o) => (o.id === id ? { ...o, x, y } : o)),
      undoStack: [...state.undoStack, { type: 'moveObject', data: { prev: prevPos, next: { id, x, y } } }],
      redoStack: [],
    }));
  },

  updateObjectRotation: (id, rotation) => {
    const obj = get().objects.find((o) => o.id === id);
    if (!obj) return;
    const prevRotation = obj.rotation;
    set((state) => ({
      objects: state.objects.map((o) => (o.id === id ? { ...o, rotation } : o)),
      undoStack: [...state.undoStack, { type: 'moveObject', data: { prev: { id, x: obj.x, y: obj.y, rotation: prevRotation }, next: { id, x: obj.x, y: obj.y, rotation } } }],
      redoStack: [],
    }));
  },

  removeObject: (id) => {
    const obj = get().objects.find((o) => o.id === id);
    if (!obj) return;
    set((state) => ({
      objects: state.objects.filter((o) => o.id !== id),
      undoStack: [...state.undoStack, { type: 'removeObject', data: obj }],
      redoStack: [],
    }));
  },

  clearAll: () => {
    const { strokes, objects } = get();
    if (strokes.length === 0 && objects.length === 0) return;
    set((state) => ({
      strokes: [],
      objects: [],
      undoStack: [...state.undoStack, { type: 'clearAll', data: { strokes, objects } }],
      redoStack: [],
    }));
  },

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return;
    const entry = undoStack[undoStack.length - 1];

    set((state) => {
      const newUndo = state.undoStack.slice(0, -1);
      const newRedo = [...state.redoStack, entry];

      switch (entry.type) {
        case 'addStroke': {
          const stroke = entry.data as Stroke;
          return { strokes: state.strokes.filter((s) => s.id !== stroke.id), undoStack: newUndo, redoStack: newRedo };
        }
        case 'removeStroke': {
          const stroke = entry.data as Stroke;
          return { strokes: [...state.strokes, stroke], undoStack: newUndo, redoStack: newRedo };
        }
        case 'addObject': {
          const obj = entry.data as PlacedObject;
          return { objects: state.objects.filter((o) => o.id !== obj.id), undoStack: newUndo, redoStack: newRedo };
        }
        case 'removeObject': {
          const obj = entry.data as PlacedObject;
          return { objects: [...state.objects, obj], undoStack: newUndo, redoStack: newRedo };
        }
        case 'moveObject': {
          const { prev } = entry.data as { prev: { id: string; x: number; y: number; rotation?: number } };
          return {
            objects: state.objects.map((o) => (o.id === prev.id ? { ...o, x: prev.x, y: prev.y, rotation: prev.rotation ?? o.rotation } : o)),
            undoStack: newUndo,
            redoStack: newRedo,
          };
        }
        case 'clearAll': {
          const { strokes, objects } = entry.data as { strokes: Stroke[]; objects: PlacedObject[] };
          return { strokes, objects, undoStack: newUndo, redoStack: newRedo };
        }
        default:
          return { undoStack: newUndo, redoStack: newRedo };
      }
    });
  },

  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return;
    const entry = redoStack[redoStack.length - 1];

    set((state) => {
      const newRedo = state.redoStack.slice(0, -1);
      const newUndo = [...state.undoStack, entry];

      switch (entry.type) {
        case 'addStroke': {
          const stroke = entry.data as Stroke;
          return { strokes: [...state.strokes, stroke], undoStack: newUndo, redoStack: newRedo };
        }
        case 'removeStroke': {
          const stroke = entry.data as Stroke;
          return { strokes: state.strokes.filter((s) => s.id !== stroke.id), undoStack: newUndo, redoStack: newRedo };
        }
        case 'addObject': {
          const obj = entry.data as PlacedObject;
          return { objects: [...state.objects, obj], undoStack: newUndo, redoStack: newRedo };
        }
        case 'removeObject': {
          const obj = entry.data as PlacedObject;
          return { objects: state.objects.filter((o) => o.id !== obj.id), undoStack: newUndo, redoStack: newRedo };
        }
        case 'moveObject': {
          const { next } = entry.data as { next: { id: string; x: number; y: number; rotation?: number } };
          return {
            objects: state.objects.map((o) => (o.id === next.id ? { ...o, x: next.x, y: next.y, rotation: next.rotation ?? o.rotation } : o)),
            undoStack: newUndo,
            redoStack: newRedo,
          };
        }
        case 'clearAll':
          return { strokes: [], objects: [], undoStack: newUndo, redoStack: newRedo };
        default:
          return { undoStack: newUndo, redoStack: newRedo };
      }
    });
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,

  loadState: (strokes, objects) => set({ strokes, objects, undoStack: [], redoStack: [] }),
}));
