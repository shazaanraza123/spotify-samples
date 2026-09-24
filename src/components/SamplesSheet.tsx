import { useEffect, useRef, useState } from "react"
import { ChevronRight } from "lucide-react"
import type { SampleSource } from "../data/samples"
import "./SamplesSheet.css"

type SamplesSheetProps = {
  open: boolean
  samples: SampleSource[]
  trackDuration: number
  onClose: () => void
  onViewSample: (sampleId: string) => void
  closeOnEscape?: boolean
}

function formatTime(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${remainder.toString().padStart(2, "0")}`
}

export function SamplesSheet({
  open,
  samples,
  trackDuration,
  onClose,
  onViewSample,
  closeOnEscape = true,
}: SamplesSheetProps) {
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef(0)
  const sheetRef = useRef<HTMLDivElement>(null)
  const count = samples.length
  const summary = `${count} sample${count === 1 ? "" : "s"} found in this track`

  useEffect(() => {
    if (!open || !closeOnEscape) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", onKeyDown)
    sheetRef.current?.focus()
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose, closeOnEscape])

  useEffect(() => {
    if (open) return
    setDragY(0)
    setIsDragging(false)
  }, [open])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a")) return
    dragStart.current = event.clientY
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    setDragY(Math.max(0, event.clientY - dragStart.current))
  }

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (dragY > 72) onClose()
    setDragY(0)
    setIsDragging(false)
  }

  return (
    <div className={`samples-layer${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="samples-layer__backdrop"
        aria-label="Close samples"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        id="samples-sheet"
        className={`samples-sheet${isDragging ? " is-dragging" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-labelledby="samples-title"
        tabIndex={-1}
        style={{ transform: open ? `translateY(${dragY}px)` : undefined }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div className="samples-sheet__handle" aria-hidden="true" />
        <header className="samples-sheet__header">
          <h2 id="samples-title">Samples</h2>
          <p>{summary}</p>
        </header>

        <ul className="samples-sheet__list">
          {samples.map((sample) => {
            const position = Math.min(sample.appearsAt / trackDuration, 1)
            return (
              <li key={sample.id} className="sample-card">
                <div className="sample-card__main">
                  <img
                    className="sample-card__art"
                    src={sample.artwork}
                    alt={`${sample.title} by ${sample.artist}`}
                  />
                  <div className="sample-card__copy">
                    <p className="sample-card__label">{sample.label}</p>
                    <h3>{sample.title}</h3>
                    <p>{sample.artist}</p>
                    <p>{sample.year}</p>
                  </div>
                </div>
                <p className="sample-card__timing">Sample appears at {formatTime(sample.appearsAt)}</p>
                <div
                  className="sample-timeline"
                  aria-hidden="true"
                  style={{ ["--mark" as string]: `${position * 100}%` }}
                >
                  <span className="sample-timeline__mark" />
                </div>
                <button type="button" className="sample-card__view" onClick={() => onViewSample(sample.id)}>
                  View sample
                  <ChevronRight size={16} strokeWidth={2.25} />
                </button>
              </li>
            )
          })}
        </ul>

        <p className="samples-sheet__note">Hear the connection without leaving Spotify.</p>
      </div>
    </div>
  )
}
