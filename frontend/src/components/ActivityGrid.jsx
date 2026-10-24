import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { activityGrid, formatDay } from '../logic/activity'

const COLORS = ['#e9e9e3', '#ded3b9', '#b9ad8f', '#6b675f', '#1f1e1f']

// GitHub style grid of the last 26 weeks of revival activity.
export default function ActivityGrid({ userId, compact = false }) {
  const events = useStore((s) => s.events)
  const { columns, total, streak } = useMemo(() => activityGrid(events, userId), [events, userId])
  const [tip, setTip] = useState(null)

  return (
    <div className={`flex flex-col gap-5 ${compact ? '' : 'lg:flex-row lg:items-end'}`}>
      <div className="relative overflow-x-auto pb-1">
        <div className="flex gap-[3px]" role="img" aria-label={`${total} actions in the last 26 weeks, current streak ${streak} days`}>
          {columns.map((col, w) => (
            <div key={w} className="flex flex-col gap-[3px]">
              {col.map((cell, d) =>
                cell ? (
                  <span
                    key={d}
                    className="block h-[13px] w-[13px] rounded-[3px] transition-transform hover:scale-125"
                    style={{ background: COLORS[cell.level] }}
                    onMouseEnter={(e) => setTip({ cell, x: e.currentTarget.offsetLeft, y: e.currentTarget.offsetTop })}
                    onMouseLeave={() => setTip(null)}
                  />
                ) : (
                  <span key={d} className="block h-[13px] w-[13px]" />
                ),
              )}
            </div>
          ))}
        </div>
        {tip && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] text-paper"
            style={{ left: tip.x + 6, top: tip.y - 4 }}
          >
            {tip.cell.count} {tip.cell.count === 1 ? 'action' : 'actions'} on {formatDay(tip.cell.date)}
          </div>
        )}
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
          Less
          {COLORS.map((c) => <span key={c} className="h-[11px] w-[11px] rounded-[3px]" style={{ background: c }} />)}
          More
        </div>
      </div>
      <div className="flex gap-8 lg:pb-6">
        <div>
          <div className="font-display text-3xl font-semibold tracking-tight">{streak}</div>
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Day streak</div>
        </div>
        <div>
          <div className="font-display text-3xl font-semibold tracking-tight">{total}</div>
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Actions, 26 weeks</div>
        </div>
      </div>
    </div>
  )
}
