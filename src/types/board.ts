export type Tool = 'draw' | 'erase' | 'select' | 'place';

export type RinkMode = 'full' | 'half' | 'zone';

export type ObjectType = 'player' | 'cone' | 'puck' | 'smallGoal' | 'largeGoal';

export interface Stroke {
  id: string;
  points: number[];
  color: string;
  width: number;
}

export interface PlacedObject {
  id: string;
  type: ObjectType;
  x: number;
  y: number;
  rotation: number;
  color?: string;
  label?: string;
}

export interface BoardState {
  strokes: Stroke[];
  objects: PlacedObject[];
}
