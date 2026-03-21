import { Group, Shape, Line, Circle, Rect } from 'react-konva';
import { RINK, LINES, GOALS, CREASE, FACEOFF, getFaceoffPositions } from './rinkGeometry';

const ICE_COLOR = '#e8f0f8';
const BOARD_COLOR = '#1a1a2e';
const RED = '#c62828';
const BLUE = '#1565c0';
const GOAL_RED = '#b71c1c';
const CREASE_BLUE = 'rgba(21, 101, 192, 0.25)';
export default function FullRink() {
  const faceoffs = getFaceoffPositions();

  return (
    <Group>
      {/* Ice surface with rounded corners */}
      <Shape
        sceneFunc={(context, shape) => {
          const w = RINK.width;
          const h = RINK.height;
          const r = RINK.cornerRadius;
          context.beginPath();
          context.moveTo(r, 0);
          context.lineTo(w - r, 0);
          context.arcTo(w, 0, w, r, r);
          context.lineTo(w, h - r);
          context.arcTo(w, h, w - r, h, r);
          context.lineTo(r, h);
          context.arcTo(0, h, 0, h - r, r);
          context.lineTo(0, r);
          context.arcTo(0, 0, r, 0, r);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill={ICE_COLOR}
        stroke={BOARD_COLOR}
        strokeWidth={RINK.boardStrokeWidth}
      />

      {/* Subtle ice gradient overlay */}
      <Shape
        sceneFunc={(context, shape) => {
          const w = RINK.width;
          const h = RINK.height;
          const r = RINK.cornerRadius;
          context.beginPath();
          context.moveTo(r, 0);
          context.lineTo(w - r, 0);
          context.arcTo(w, 0, w, r, r);
          context.lineTo(w, h - r);
          context.arcTo(w, h, w - r, h, r);
          context.lineTo(r, h);
          context.arcTo(0, h, 0, h - r, r);
          context.lineTo(0, r);
          context.arcTo(0, 0, r, 0, r);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: RINK.width, y: RINK.height }}
        fillLinearGradientColorStops={[0, 'rgba(255,255,255,0)', 0.5, 'rgba(255,255,255,0.3)', 1, 'rgba(200,220,240,0.1)']}
      />

      {/* Center red line */}
      <Line
        points={[LINES.centerLineX, 0, LINES.centerLineX, RINK.height]}
        stroke={RED}
        strokeWidth={LINES.lineWidth}
      />

      {/* Blue lines */}
      <Rect
        x={LINES.blueLineLeftX - LINES.lineWidth / 2}
        y={0}
        width={LINES.lineWidth}
        height={RINK.height}
        fill={BLUE}
      />
      <Rect
        x={LINES.blueLineRightX - LINES.lineWidth / 2}
        y={0}
        width={LINES.lineWidth}
        height={RINK.height}
        fill={BLUE}
      />

      {/* Goal lines */}
      <Line
        points={[LINES.goalLineLeftX, RINK.cornerRadius - 2, LINES.goalLineLeftX, RINK.height - RINK.cornerRadius + 2]}
        stroke={RED}
        strokeWidth={LINES.thinLineWidth}
      />
      <Line
        points={[LINES.goalLineRightX, RINK.cornerRadius - 2, LINES.goalLineRightX, RINK.height - RINK.cornerRadius + 2]}
        stroke={RED}
        strokeWidth={LINES.thinLineWidth}
      />

      {/* Center circle */}
      <Circle
        x={FACEOFF.centerX}
        y={FACEOFF.centerY}
        radius={FACEOFF.circleRadius}
        stroke={BLUE}
        strokeWidth={FACEOFF.circleStrokeWidth}
      />

      {/* Center dot */}
      <Circle
        x={faceoffs.center.x}
        y={faceoffs.center.y}
        radius={FACEOFF.dotRadius}
        fill={BLUE}
      />

      {/* End zone face-off circles and dots */}
      {faceoffs.endZone.map((pos, i) => (
        <Group key={`endzone-${i}`}>
          <Circle
            x={pos.x}
            y={pos.y}
            radius={FACEOFF.circleRadius}
            stroke={RED}
            strokeWidth={FACEOFF.circleStrokeWidth}
          />
          <Circle
            x={pos.x}
            y={pos.y}
            radius={FACEOFF.dotRadius}
            fill={RED}
          />
          {/* Hash marks on face-off circles */}
          {renderHashMarks(pos.x, pos.y)}
        </Group>
      ))}

      {/* Neutral zone dots */}
      {faceoffs.neutralZone.map((pos, i) => (
        <Circle
          key={`neutral-${i}`}
          x={pos.x}
          y={pos.y}
          radius={FACEOFF.dotRadius}
          fill={RED}
        />
      ))}

      {/* Goal creases */}
      <GoalCrease x={LINES.goalLineLeftX} direction={1} />
      <GoalCrease x={LINES.goalLineRightX} direction={-1} />

      {/* Goals */}
      <Goal x={LINES.goalLineLeftX} direction={-1} />
      <Goal x={LINES.goalLineRightX} direction={1} />
    </Group>
  );
}

function renderHashMarks(cx: number, cy: number) {
  const marks: React.ReactElement[] = [];
  const len = 0.6;
  const offset = 0.2;
  const positions = [
    // L-shaped hash marks at 4 positions around circle
    { x: cx - FACEOFF.circleRadius + 0.3, y: cy - 2.5, horizontal: true },
    { x: cx - FACEOFF.circleRadius + 0.3, y: cy + 2.5, horizontal: true },
    { x: cx + FACEOFF.circleRadius - 0.3, y: cy - 2.5, horizontal: true },
    { x: cx + FACEOFF.circleRadius - 0.3, y: cy + 2.5, horizontal: true },
  ];

  positions.forEach((pos, i) => {
    const dir = i < 2 ? 1 : -1;
    const vDir = i % 2 === 0 ? 1 : -1;
    marks.push(
      <Line
        key={`hash-v-${i}`}
        points={[pos.x, pos.y - len * vDir, pos.x, pos.y + offset * vDir]}
        stroke={RED}
        strokeWidth={FACEOFF.circleStrokeWidth}
      />,
      <Line
        key={`hash-h-${i}`}
        points={[pos.x, pos.y - len * vDir, pos.x + 0.5 * dir, pos.y - len * vDir]}
        stroke={RED}
        strokeWidth={FACEOFF.circleStrokeWidth}
      />
    );
  });

  return marks;
}

function GoalCrease({ x, direction }: { x: number; direction: 1 | -1 }) {
  const centerY = RINK.height / 2;
  return (
    <Shape
      sceneFunc={(context, shape) => {
        context.beginPath();
        // Crease shape: rectangle with rounded front
        const w = CREASE.depth * direction;
        const halfH = CREASE.width / 2;
        context.moveTo(x, centerY - halfH);
        context.lineTo(x + w, centerY - halfH);
        context.arcTo(x + w + 0.4 * direction, centerY - halfH, x + w + 0.4 * direction, centerY, 0.6);
        context.lineTo(x + w + 0.4 * direction, centerY + halfH - 0.6);
        context.arcTo(x + w + 0.4 * direction, centerY + halfH, x + w, centerY + halfH, 0.6);
        context.lineTo(x, centerY + halfH);
        context.closePath();
        context.fillStrokeShape(shape);
      }}
      fill={CREASE_BLUE}
      stroke={RED}
      strokeWidth={FACEOFF.circleStrokeWidth}
    />
  );
}

function Goal({ x, direction }: { x: number; direction: 1 | -1 }) {
  const centerY = RINK.height / 2;
  const halfW = GOALS.width / 2;
  const depth = GOALS.depth * direction;

  return (
    <Shape
      sceneFunc={(context, shape) => {
        context.beginPath();
        context.moveTo(x, centerY - halfW);
        context.lineTo(x + depth, centerY - halfW);
        context.lineTo(x + depth, centerY + halfW);
        context.lineTo(x, centerY + halfW);
        context.fillStrokeShape(shape);
      }}
      fill="rgba(200, 200, 200, 0.3)"
      stroke={GOAL_RED}
      strokeWidth={0.08}
    />
  );
}

export function HalfRinkShapes() {
  const faceoffs = getFaceoffPositions();
  const clipWidth = LINES.centerLineX + 0.5;

  return (
    <Group clipX={0} clipY={0} clipWidth={clipWidth} clipHeight={RINK.height}>
      {/* Ice surface */}
      <Shape
        sceneFunc={(context, shape) => {
          const w = RINK.width;
          const h = RINK.height;
          const r = RINK.cornerRadius;
          context.beginPath();
          context.moveTo(r, 0);
          context.lineTo(w - r, 0);
          context.arcTo(w, 0, w, r, r);
          context.lineTo(w, h - r);
          context.arcTo(w, h, w - r, h, r);
          context.lineTo(r, h);
          context.arcTo(0, h, 0, h - r, r);
          context.lineTo(0, r);
          context.arcTo(0, 0, r, 0, r);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill={ICE_COLOR}
        stroke={BOARD_COLOR}
        strokeWidth={RINK.boardStrokeWidth}
      />

      {/* Center line (at clip edge) */}
      <Line
        points={[LINES.centerLineX, 0, LINES.centerLineX, RINK.height]}
        stroke={RED}
        strokeWidth={LINES.lineWidth}
      />

      {/* Left blue line */}
      <Rect
        x={LINES.blueLineLeftX - LINES.lineWidth / 2}
        y={0}
        width={LINES.lineWidth}
        height={RINK.height}
        fill={BLUE}
      />

      {/* Goal line */}
      <Line
        points={[LINES.goalLineLeftX, RINK.cornerRadius - 2, LINES.goalLineLeftX, RINK.height - RINK.cornerRadius + 2]}
        stroke={RED}
        strokeWidth={LINES.thinLineWidth}
      />

      {/* Center circle (clipped) */}
      <Circle
        x={FACEOFF.centerX}
        y={FACEOFF.centerY}
        radius={FACEOFF.circleRadius}
        stroke={BLUE}
        strokeWidth={FACEOFF.circleStrokeWidth}
      />
      <Circle x={faceoffs.center.x} y={faceoffs.center.y} radius={FACEOFF.dotRadius} fill={BLUE} />

      {/* Left end zone circles */}
      {faceoffs.endZone.slice(0, 2).map((pos, i) => (
        <Group key={`ez-${i}`}>
          <Circle x={pos.x} y={pos.y} radius={FACEOFF.circleRadius} stroke={RED} strokeWidth={FACEOFF.circleStrokeWidth} />
          <Circle x={pos.x} y={pos.y} radius={FACEOFF.dotRadius} fill={RED} />
          {renderHashMarks(pos.x, pos.y)}
        </Group>
      ))}

      {/* Neutral zone dots (left side) */}
      {faceoffs.neutralZone.slice(0, 2).map((pos, i) => (
        <Circle key={`nz-${i}`} x={pos.x} y={pos.y} radius={FACEOFF.dotRadius} fill={RED} />
      ))}

      <GoalCrease x={LINES.goalLineLeftX} direction={1} />
      <Goal x={LINES.goalLineLeftX} direction={-1} />
    </Group>
  );
}

export function ZoneRinkShapes() {
  const faceoffs = getFaceoffPositions();
  const zoneEnd = LINES.blueLineLeftX + 0.5;

  return (
    <Group clipX={0} clipY={0} clipWidth={zoneEnd} clipHeight={RINK.height}>
      {/* Ice surface */}
      <Shape
        sceneFunc={(context, shape) => {
          const w = RINK.width;
          const h = RINK.height;
          const r = RINK.cornerRadius;
          context.beginPath();
          context.moveTo(r, 0);
          context.lineTo(w - r, 0);
          context.arcTo(w, 0, w, r, r);
          context.lineTo(w, h - r);
          context.arcTo(w, h, w - r, h, r);
          context.lineTo(r, h);
          context.arcTo(0, h, 0, h - r, r);
          context.lineTo(0, r);
          context.arcTo(0, 0, r, 0, r);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill={ICE_COLOR}
        stroke={BOARD_COLOR}
        strokeWidth={RINK.boardStrokeWidth}
      />

      {/* Blue line (zone boundary) */}
      <Rect
        x={LINES.blueLineLeftX - LINES.lineWidth / 2}
        y={0}
        width={LINES.lineWidth}
        height={RINK.height}
        fill={BLUE}
      />

      {/* Goal line */}
      <Line
        points={[LINES.goalLineLeftX, RINK.cornerRadius - 2, LINES.goalLineLeftX, RINK.height - RINK.cornerRadius + 2]}
        stroke={RED}
        strokeWidth={LINES.thinLineWidth}
      />

      {/* End zone circles */}
      {faceoffs.endZone.slice(0, 2).map((pos, i) => (
        <Group key={`ez-${i}`}>
          <Circle x={pos.x} y={pos.y} radius={FACEOFF.circleRadius} stroke={RED} strokeWidth={FACEOFF.circleStrokeWidth} />
          <Circle x={pos.x} y={pos.y} radius={FACEOFF.dotRadius} fill={RED} />
          {renderHashMarks(pos.x, pos.y)}
        </Group>
      ))}

      <GoalCrease x={LINES.goalLineLeftX} direction={1} />
      <Goal x={LINES.goalLineLeftX} direction={-1} />
    </Group>
  );
}
