import type { TidePoint } from "../types/tides";
import { formatTime } from "../utils/format";

interface Props {
  points: TidePoint[];
  timezone: string;
}

const HOURS_TO_SHOW = 24;
const HOUR_IN_MS = 60 * 60 * 1000;

export function TideChart({ points, timezone }: Props) {
  const now = Date.now();
  const endTime = now + HOURS_TO_SHOW * HOUR_IN_MS;

  const sorted = [...points]
    .filter((point) => {
      const time = Date.parse(point.time);

      return (
        Number.isFinite(time) &&
        time >= now &&
        time <= endTime
      );
    })
    .sort((a, b) => Date.parse(a.time) - Date.parse(b.time));

  if (sorted.length < 2) {
    return (
      <p className="empty">
        Not enough tide predictions are available for the next 24 hours.
      </p>
    );
  }

  const width = 900;
  const height = 300;
  const padX = 50;
  const padY = 30;

  const times = sorted.map((point) => Date.parse(point.time));
  const heights = sorted.map((point) => point.height);

  /*
   * Use the actual 24-hour window for the horizontal scale rather than
   * stopping the graph at the final returned prediction point.
   */
  const minT = now;
  const maxT = endTime;

  const minH = Math.min(...heights);
  const maxH = Math.max(...heights);

  const x = (time: number) =>
    padX +
    ((time - minT) / Math.max(1, maxT - minT)) *
      (width - padX * 2);

  const y = (heightValue: number) =>
    height -
    padY -
    ((heightValue - minH) / Math.max(0.1, maxH - minH)) *
      (height - padY * 2);

  const path = sorted
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      const pointX = x(Date.parse(point.time)).toFixed(1);
      const pointY = y(point.height).toFixed(1);

      return `${command}${pointX},${pointY}`;
    })
    .join(" ");

  const firstPointTime = Date.parse(sorted[0].time);
  const lastPointTime = Date.parse(sorted[sorted.length - 1].time);

  const area = [
    path,
    `L${x(lastPointTime)},${height - padY}`,
    `L${x(firstPointTime)},${height - padY}`,
    "Z",
  ].join(" ");

  /*
   * Seven labels gives one approximately every four hours:
   * now, +4h, +8h, +12h, +16h, +20h, +24h.
   */
  const timeTicks = Array.from(
    { length: 7 },
    (_, index) => minT + ((maxT - minT) * index) / 6,
  );

  const heightTicks =
    minH === maxH
      ? [minH]
      : Array.from(
          { length: 5 },
          (_, index) => minH + ((maxH - minH) * index) / 4,
        );

  return (
    <div className="chart-wrap">
      <svg
        className="tide-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Predicted tide height chart for the next 24 hours"
      >
        {heightTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={padX}
              x2={width - padX}
              y1={y(tick)}
              y2={y(tick)}
              className="grid-line"
            />

            <text
              x={padX - 8}
              y={y(tick) + 4}
              textAnchor="end"
            >
              {tick.toFixed(1)}m
            </text>
          </g>
        ))}

        <path d={area} className="tide-area" />
        <path d={path} className="tide-line" />

        {timeTicks.map((tick) => (
          <text
            key={tick}
            x={x(tick)}
            y={height - 6}
            textAnchor="middle"
          >
            {formatTime(
              new Date(tick).toISOString(),
              timezone,
            )}
          </text>
        ))}

        <line
          x1={padX}
          x2={width - padX}
          y1={height - padY}
          y2={height - padY}
          className="axis"
        />
      </svg>
    </div>
  );
}