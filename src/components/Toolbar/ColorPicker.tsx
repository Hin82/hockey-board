import { useToolStore } from '../../stores/useToolStore';
import { DRAW_COLORS } from '../../utils/colors';

export default function ColorPicker() {
  const drawColor = useToolStore((s) => s.drawColor);
  const setDrawColor = useToolStore((s) => s.setDrawColor);

  return (
    <div className="flex items-center justify-center gap-2 p-2 bg-gray-800/90 backdrop-blur-lg rounded-xl">
      {DRAW_COLORS.map((color) => (
        <button
          key={color.value}
          onClick={() => setDrawColor(color.value)}
          className={`w-8 h-8 rounded-full border-2 transition-transform ${
            drawColor === color.value
              ? 'border-white scale-110 shadow-lg'
              : 'border-gray-600 active:scale-105'
          }`}
          style={{ backgroundColor: color.value }}
          aria-label={color.name}
        />
      ))}
    </div>
  );
}
