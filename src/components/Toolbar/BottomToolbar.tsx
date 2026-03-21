import { useState } from 'react';
import {
  Pencil,
  Eraser,
  Move,
  Plus,
  Undo2,
  Redo2,
  Trash2,
  Maximize,
  RectangleHorizontal,
  Square,
} from 'lucide-react';
import { useToolStore } from '../../stores/useToolStore';
import { useBoardStore } from '../../stores/useBoardStore';
import ColorPicker from './ColorPicker';
import BrushSizeSlider from './BrushSizeSlider';
import ObjectPalette from './ObjectPalette';
import type { Tool, RinkMode } from '../../types/board';

export default function BottomToolbar() {
  const activeTool = useToolStore((s) => s.activeTool);
  const setActiveTool = useToolStore((s) => s.setActiveTool);
  const rinkMode = useToolStore((s) => s.rinkMode);
  const setRinkMode = useToolStore((s) => s.setRinkMode);

  const undo = useBoardStore((s) => s.undo);
  const redo = useBoardStore((s) => s.redo);
  const clearAll = useBoardStore((s) => s.clearAll);
  const undoStack = useBoardStore((s) => s.undoStack);
  const redoStack = useBoardStore((s) => s.redoStack);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushSize, setShowBrushSize] = useState(false);
  const [showObjectPalette, setShowObjectPalette] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleToolSelect = (tool: Tool) => {
    setActiveTool(tool);
    setShowObjectPalette(false);
    if (tool === 'draw') {
      setShowColorPicker(true);
      setShowBrushSize(true);
    } else {
      setShowColorPicker(false);
      setShowBrushSize(false);
    }
    if (tool === 'place') {
      setShowObjectPalette(true);
    }
  };

  const handleClear = () => {
    if (showClearConfirm) {
      clearAll();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const rinkModes: { mode: RinkMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'full', label: 'Full', icon: <Maximize size={14} /> },
    { mode: 'half', label: 'Halv', icon: <RectangleHorizontal size={14} /> },
    { mode: 'zone', label: 'Zon', icon: <Square size={14} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Expandable panels */}
      {showColorPicker && activeTool === 'draw' && (
        <div className="mx-2 mb-1">
          <ColorPicker />
        </div>
      )}
      {showBrushSize && activeTool === 'draw' && (
        <div className="mx-2 mb-1">
          <BrushSizeSlider />
        </div>
      )}
      {showObjectPalette && activeTool === 'place' && (
        <div className="mx-2 mb-1">
          <ObjectPalette />
        </div>
      )}

      {/* Clear confirmation */}
      {showClearConfirm && (
        <div className="mx-2 mb-1 p-2 bg-red-600/90 backdrop-blur-lg rounded-xl text-white text-center text-sm font-medium">
          Tryck igen for att rensa allt
        </div>
      )}

      {/* Main toolbar */}
      <div
        className="bg-gray-900/90 backdrop-blur-xl border-t border-white/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
      >
        {/* Rink mode selector */}
        <div className="flex justify-center gap-1 px-3 pt-2 pb-1">
          {rinkModes.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setRinkMode(mode)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                rinkMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-400 active:bg-white/20'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Tool buttons */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex gap-1">
            <ToolButton
              icon={<Pencil size={20} />}
              label="Rita"
              active={activeTool === 'draw'}
              onClick={() => handleToolSelect('draw')}
            />
            <ToolButton
              icon={<Eraser size={20} />}
              label="Sudda"
              active={activeTool === 'erase'}
              onClick={() => handleToolSelect('erase')}
            />
            <ToolButton
              icon={<Move size={20} />}
              label="Flytta"
              active={activeTool === 'select'}
              onClick={() => handleToolSelect('select')}
            />
            <ToolButton
              icon={<Plus size={20} />}
              label="Objekt"
              active={activeTool === 'place'}
              onClick={() => handleToolSelect('place')}
            />
          </div>

          <div className="flex gap-1">
            <ToolButton
              icon={<Undo2 size={20} />}
              label="Angra"
              onClick={undo}
              disabled={undoStack.length === 0}
            />
            <ToolButton
              icon={<Redo2 size={20} />}
              label="Gor om"
              onClick={redo}
              disabled={redoStack.length === 0}
            />
            <ToolButton
              icon={<Trash2 size={20} />}
              label={showClearConfirm ? 'Rensa?' : 'Rensa'}
              onClick={handleClear}
              danger={showClearConfirm}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  icon,
  label,
  active,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[10px] font-medium transition-all min-w-[48px] ${
        active
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
          : danger
          ? 'bg-red-600/80 text-white'
          : disabled
          ? 'text-gray-600'
          : 'text-gray-400 active:bg-white/10'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
