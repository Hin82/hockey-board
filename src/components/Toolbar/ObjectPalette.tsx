import { useToolStore } from '../../stores/useToolStore';
import { TEAM_COLORS } from '../../utils/colors';
import type { ObjectType } from '../../types/board';
import { useState } from 'react';

interface ObjectOption {
  type: ObjectType;
  label: string;
  icon: string;
  hasTeamColor?: boolean;
}

const OBJECT_OPTIONS: ObjectOption[] = [
  { type: 'player', label: 'Spelare', icon: '⬤', hasTeamColor: true },
  { type: 'cone', label: 'Kon', icon: '▲' },
  { type: 'puck', label: 'Puck', icon: '●' },
  { type: 'smallGoal', label: 'Litet mal', icon: '⊓' },
  { type: 'largeGoal', label: 'Stort mal', icon: '⊔' },
];

export default function ObjectPalette() {
  const placingObjectType = useToolStore((s) => s.placingObjectType);
  const placingObjectColor = useToolStore((s) => s.placingObjectColor);
  const setPlacingObject = useToolStore((s) => s.setPlacingObject);
  const [showTeamColors, setShowTeamColors] = useState(false);

  const handleSelect = (option: ObjectOption) => {
    if (option.hasTeamColor) {
      setShowTeamColors(true);
      setPlacingObject(option.type, placingObjectColor);
    } else {
      setShowTeamColors(false);
      setPlacingObject(option.type);
    }
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-lg rounded-xl p-3">
      <div className="text-gray-400 text-xs mb-2 font-medium">Valj objekt och tryck pa planen</div>

      <div className="flex gap-2 flex-wrap">
        {OBJECT_OPTIONS.map((option) => (
          <button
            key={option.type}
            onClick={() => handleSelect(option)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-all ${
              placingObjectType === option.type
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 active:bg-white/20'
            }`}
          >
            <span className="text-lg">{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Team color selector for players */}
      {showTeamColors && placingObjectType === 'player' && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10">
          <span className="text-gray-400 text-xs">Lagfarg:</span>
          {TEAM_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setPlacingObject('player', color.value)}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                placingObjectColor === color.value
                  ? 'border-white scale-110'
                  : 'border-gray-600'
              }`}
              style={{ backgroundColor: color.value }}
              aria-label={color.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
