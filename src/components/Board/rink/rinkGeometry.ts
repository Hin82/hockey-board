// All dimensions in meters, based on IIHF standard rink (60m x 30m)

export const RINK = {
  width: 60,
  height: 30,
  cornerRadius: 8.5,
  boardStrokeWidth: 0.3,
} as const;

export const LINES = {
  centerLineX: 30,
  blueLineLeftX: 17.23,
  blueLineRightX: 42.77,
  goalLineLeftX: 4,
  goalLineRightX: 56,
  lineWidth: 0.3,
  thinLineWidth: 0.05,
} as const;

export const GOALS = {
  width: 1.83,
  depth: 0.91,
  postWidth: 0.05,
} as const;

export const CREASE = {
  width: 2.44,
  depth: 1.22,
  radius: 1.83,
} as const;

// Face-off circles
export const FACEOFF = {
  circleRadius: 4.5,
  dotRadius: 0.15,
  circleStrokeWidth: 0.05,
  // Center ice
  centerX: 30,
  centerY: 15,
  // End zone circles (4 total)
  endZoneDotsFromGoalLine: 6,
  endZoneDotsFromCenter: 7,
  // Neutral zone dots
  neutralDotOffsetFromBlue: 1.5,
} as const;

// Calculate face-off dot positions
export function getFaceoffPositions() {
  const leftGoalLine = LINES.goalLineLeftX;
  const rightGoalLine = LINES.goalLineRightX;

  return {
    center: { x: FACEOFF.centerX, y: FACEOFF.centerY },
    // End zone circles with face-off dots
    endZone: [
      // Left zone
      { x: leftGoalLine + FACEOFF.endZoneDotsFromGoalLine, y: FACEOFF.centerY - FACEOFF.endZoneDotsFromCenter },
      { x: leftGoalLine + FACEOFF.endZoneDotsFromGoalLine, y: FACEOFF.centerY + FACEOFF.endZoneDotsFromCenter },
      // Right zone
      { x: rightGoalLine - FACEOFF.endZoneDotsFromGoalLine, y: FACEOFF.centerY - FACEOFF.endZoneDotsFromCenter },
      { x: rightGoalLine - FACEOFF.endZoneDotsFromGoalLine, y: FACEOFF.centerY + FACEOFF.endZoneDotsFromCenter },
    ],
    // Neutral zone dots (no circles)
    neutralZone: [
      { x: LINES.blueLineLeftX + FACEOFF.neutralDotOffsetFromBlue, y: FACEOFF.centerY - FACEOFF.endZoneDotsFromCenter },
      { x: LINES.blueLineLeftX + FACEOFF.neutralDotOffsetFromBlue, y: FACEOFF.centerY + FACEOFF.endZoneDotsFromCenter },
      { x: LINES.blueLineRightX - FACEOFF.neutralDotOffsetFromBlue, y: FACEOFF.centerY - FACEOFF.endZoneDotsFromCenter },
      { x: LINES.blueLineRightX - FACEOFF.neutralDotOffsetFromBlue, y: FACEOFF.centerY + FACEOFF.endZoneDotsFromCenter },
    ],
  };
}

// Small goal dimensions for youth/zone play
export const SMALL_GOAL = {
  width: 1.2,
  depth: 0.6,
} as const;
