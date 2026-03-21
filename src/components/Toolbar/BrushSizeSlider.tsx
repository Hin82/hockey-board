import { useToolStore } from '../../stores/useToolStore';

export default function BrushSizeSlider() {
  const brushSize = useToolStore((s) => s.brushSize);
  const setBrushSize = useToolStore((s) => s.setBrushSize);

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-800/90 backdrop-blur-lg rounded-xl">
      <span className="text-gray-400 text-xs whitespace-nowrap">Storlek</span>
      <div className="flex items-center gap-2 flex-1">
        <div
          className="rounded-full bg-white"
          style={{ width: 4, height: 4 }}
        />
        <input
          type="range"
          min={1}
          max={12}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="flex-1 accent-blue-500 h-1"
        />
        <div
          className="rounded-full bg-white"
          style={{ width: 12, height: 12 }}
        />
      </div>
      <span className="text-gray-300 text-xs font-mono w-4 text-right">{brushSize}</span>
    </div>
  );
}
