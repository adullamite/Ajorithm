import React, { useMemo, useState, useRef, useCallback } from 'react';
import { TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { cn } from '@/lib/utils';
import type { TvlDataPoint } from '@/hooks/useTvlHistory';

interface TvlChartProps {
  history: TvlDataPoint[];
}

type TimeRange = '1h' | '6h' | '24h';

const TIME_RANGES: { value: TimeRange; label: string; ms: number }[] = [
  { value: '1h', label: '1H', ms: 60 * 60 * 1000 },
  { value: '6h', label: '6H', ms: 6 * 60 * 60 * 1000 },
  { value: '24h', label: '24H', ms: 24 * 60 * 60 * 1000 },
];

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatTimeFull(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function TvlChart({ history }: TvlChartProps) {
  const [range, setRange] = useState<TimeRange>('24h');
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    point: TvlDataPoint;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const rangeDef = TIME_RANGES.find((r) => r.value === range)!;

  const filtered = useMemo(() => {
    const cutoff = Date.now() - rangeDef.ms;
    return history.filter((d) => d.timestamp >= cutoff);
  }, [history, rangeDef.ms]);

  // Chart dimensions
  const W = 800;
  const H = 200;
  const PAD_TOP = 16;
  const PAD_BOTTOM = 28;
  const PAD_LEFT = 56;
  const PAD_RIGHT = 16;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const { path, areaPath, gridLines, xLabels, yLabels, pointCoords } = useMemo(() => {
    if (filtered.length < 2) {
      return { path: '', areaPath: '', gridLines: [], xLabels: [], yLabels: [], pointCoords: [] };
    }

    const tvls = filtered.map((d) => d.tvl);
    const min = Math.min(...tvls);
    const max = Math.max(...tvls);
    const yRange = max - min || 1;
    const yPad = yRange * 0.1;
    const yMin = min - yPad;
    const yMax = max + yPad;
    const yRangePadded = yMax - yMin;

    const tMin = filtered[0].timestamp;
    const tMax = filtered[filtered.length - 1].timestamp;
    const tRange = tMax - tMin || 1;

    const coords = filtered.map((d) => {
      const x = PAD_LEFT + ((d.timestamp - tMin) / tRange) * chartW;
      const y = PAD_TOP + (1 - (d.tvl - yMin) / yRangePadded) * chartH;
      return { x, y };
    });

    // Line path
    const linePath = coords
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ');

    // Area path
    const area =
      linePath +
      ` L ${coords[coords.length - 1].x.toFixed(1)} ${PAD_TOP + chartH}` +
      ` L ${coords[0].x.toFixed(1)} ${PAD_TOP + chartH} Z`;

    // Y-axis labels (4 ticks)
    const yTicks = Array.from({ length: 4 }, (_, i) => {
      const val = yMin + (yRangePadded / 3) * i;
      const y = PAD_TOP + (1 - (val - yMin) / yRangePadded) * chartH;
      return { val, y };
    });

    // X-axis labels (5 ticks)
    const xTicks = Array.from({ length: 5 }, (_, i) => {
      const t = tMin + (tRange / 4) * i;
      const x = PAD_LEFT + (i / 4) * chartW;
      return { time: t, x };
    });

    // Horizontal grid lines
    const grids = yTicks.map((t) => t.y);

    return {
      path: linePath,
      areaPath: area,
      gridLines: grids,
      xLabels: xTicks,
      yLabels: yTicks,
      pointCoords: coords,
    };
  }, [filtered, chartW, chartH]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || filtered.length < 2 || pointCoords.length < 2) return;
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = W / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;

      // Find closest point
      let closest = 0;
      let closestDist = Infinity;
      pointCoords.forEach((c, i) => {
        const dist = Math.abs(c.x - mouseX);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });

      setHover({
        x: pointCoords[closest].x,
        y: pointCoords[closest].y,
        point: filtered[closest],
      });
    },
    [filtered, pointCoords]
  );

  const handleMouseLeave = useCallback(() => setHover(null), []);

  // Calculate change over period
  const change =
    filtered.length >= 2
      ? filtered[filtered.length - 1].tvl - filtered[0].tvl
      : 0;
  const changePct =
    filtered.length >= 2 && filtered[0].tvl > 0
      ? ((change / filtered[0].tvl) * 100).toFixed(1)
      : '0.0';
  const isPositive = change >= 0;

  const currentTvl = filtered.length > 0 ? filtered[filtered.length - 1].tvl : 0;

  return (
    <GlassCard className="p-5 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-secondary" />
            <h3 className="text-foreground font-semibold text-sm">TVL History</h3>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-foreground font-mono">
              {currentTvl.toFixed(2)}
            </span>
            <span className="text-secondary text-xs font-medium">SOL</span>
            {filtered.length >= 2 && (
              <span
                className={cn(
                  'text-xs font-mono font-semibold px-1.5 py-0.5 rounded-md',
                  isPositive
                    ? 'bg-secondary/15 text-secondary'
                    : 'bg-destructive/15 text-destructive'
                )}
              >
                {isPositive ? '+' : ''}
                {change.toFixed(2)} ({isPositive ? '+' : ''}
                {changePct}%)
              </span>
            )}
          </div>
        </div>

        {/* Time range pills */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/30 border border-border/50 self-start">
          {TIME_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                range === r.value
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {filtered.length < 2 ? (
        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
          <Clock className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">Collecting data points...</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {filtered.length === 0
              ? 'Chart populates as new polls arrive (every 30s)'
              : `${filtered.length} point recorded — need at least 2`}
          </p>
        </div>
      ) : (
        <div className="relative">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="tvl-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(155, 70%, 59%)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="hsl(155, 70%, 59%)" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="tvl-line-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(155, 95%, 51%)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(155, 70%, 59%)" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {gridLines.map((y, i) => (
              <line
                key={i}
                x1={PAD_LEFT}
                y1={y}
                x2={W - PAD_RIGHT}
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                strokeDasharray="4 4"
                opacity="0.4"
              />
            ))}

            {/* Y-axis labels */}
            {yLabels.map((tick, i) => (
              <text
                key={i}
                x={PAD_LEFT - 8}
                y={tick.y + 4}
                textAnchor="end"
                fill="hsl(var(--muted-foreground))"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
                opacity="0.6"
              >
                {tick.val.toFixed(1)}
              </text>
            ))}

            {/* X-axis labels */}
            {xLabels.map((tick, i) => (
              <text
                key={i}
                x={tick.x}
                y={H - 6}
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
                opacity="0.6"
              >
                {formatTime(tick.time)}
              </text>
            ))}

            {/* Area fill */}
            <path d={areaPath} fill="url(#tvl-gradient)" />

            {/* Line */}
            <path
              d={path}
              fill="none"
              stroke="url(#tvl-line-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Glow dot at latest point */}
            {pointCoords.length > 0 && (
              <>
                <circle
                  cx={pointCoords[pointCoords.length - 1].x}
                  cy={pointCoords[pointCoords.length - 1].y}
                  r="6"
                  fill="hsl(155, 70%, 59%)"
                  opacity="0.2"
                  className="animate-pulse"
                />
                <circle
                  cx={pointCoords[pointCoords.length - 1].x}
                  cy={pointCoords[pointCoords.length - 1].y}
                  r="3"
                  fill="hsl(155, 70%, 59%)"
                />
              </>
            )}

            {/* Hover crosshair & dot */}
            {hover && (
              <>
                <line
                  x1={hover.x}
                  y1={PAD_TOP}
                  x2={hover.x}
                  y2={PAD_TOP + chartH}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                  opacity="0.3"
                />
                <line
                  x1={PAD_LEFT}
                  y1={hover.y}
                  x2={W - PAD_RIGHT}
                  y2={hover.y}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                  opacity="0.3"
                />
                <circle cx={hover.x} cy={hover.y} r="5" fill="hsl(155, 70%, 59%)" opacity="0.3" />
                <circle cx={hover.x} cy={hover.y} r="3" fill="hsl(155, 70%, 59%)" />
              </>
            )}
          </svg>

          {/* Hover tooltip */}
          {hover && (
            <div
              className="absolute pointer-events-none glass-strong px-3 py-2 rounded-lg shadow-xl z-10"
              style={{
                left: `${(hover.x / W) * 100}%`,
                top: `${(hover.y / H) * 100 - 18}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <p className="text-foreground font-bold font-mono text-sm">
                {hover.point.tvl.toFixed(2)} SOL
              </p>
              <p className="text-muted-foreground text-[10px] font-mono">
                {formatTimeFull(hover.point.timestamp)}
              </p>
              <div className="flex gap-3 mt-0.5">
                <span className="text-[10px] text-primary">
                  {hover.point.pacts} pacts
                </span>
                <span className="text-[10px] text-neon">
                  {hover.point.members} members
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        <span className="text-[10px] text-muted-foreground/50">
          {filtered.length} data point{filtered.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground/50 font-mono">
            Updates every 30s
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
