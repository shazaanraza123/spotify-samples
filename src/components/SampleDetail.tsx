import { useEffect, useRef, useState } from "react"
import { ArrowDown, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import type { NowPlayingTrack, SampleSource } from "../data/samples"
import "./SampleDetail.css"

type ComparisonSide = "original" | "sampled"

type SampleDetailProps = {
  track: NowPlayingTrack
  sample: SampleSource
  onBack: () => void
  onExploreChain: () => void
  listenForEscape?: boolean
}

const sourceBars = [28, 46, 62, 38, 70, 54, 84, 44, 66, 90, 58, 76, 48, 86, 64, 42, 72, 55, 80, 36, 60, 74, 50, 68]
const sampleBars = [34, 58, 44, 78, 52, 88, 40, 70, 62, 84, 48, 74, 56, 90, 42, 66, 80, 50, 72, 46, 64, 82, 38, 60]

function formatTime(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${remainder.toString().padStart(2, "0")}`
}

function Waveform({
  bars,
  progress,
  active,
}: {
  bars: number[]
  progress: number
  active: boolean
}) {
  return (
    <div className={`waveform${active ? " is-active" : ""}`} aria-hidden="true">
      {bars.map((height, index) => {
        const position = index / (bars.length - 1)
        const inPhrase = position >= 0.28 && position <= 0.78
        const played = active && position <= progress
        return (
          <span
            key={index}
            className={`waveform__bar${inPhrase ? " is-phrase" : ""}${played ? " is-played" : ""}`}
            style={{ height: `${height}%` }}
          />
        )
      })}
      {active ? <span className="waveform__playhead" style={{ left: `${progress * 100}%` }} /> : null}
    </div>
  )
}

export function SampleDetail({
  track,
  sample,
  onBack,
  onExploreChain,
  listenForEscape = true,
}: SampleDetailProps) {
  const [side, setSide] = useState<ComparisonSide | null>(null)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    rootRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!listenForEscape) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      onBack()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onBack, listenForEscape])

  useEffect(() => {
    if (!side) return

    let last = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const delta = (now - last) / 1000
      last = now
      const next = progressRef.current + delta / sample.clipDuration
      progressRef.current = next >= 1 ? next - 1 : next
      setProgress(progressRef.current)
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [side, sample.clipDuration])

  const play = (next: ComparisonSide) => {
    if (side === next) {
      setSide(null)
      return
    }
    progressRef.current = 0
    setProgress(0)
    setSide(next)
  }

  const playSampled = () => {
    progressRef.current = 0
    setProgress(0)
    setSide("sampled")
  }

  const originalPlaying = side === "original"
  const sampledPlaying = side === "sampled"

  return (
    <section
      ref={rootRef}
      className="sample-detail"
      aria-label="Sample detail"
      tabIndex={-1}
    >
      <header className="sample-detail__top">
        <button type="button" className="sample-detail__back" aria-label="Back to samples" onClick={onBack}>
          <ChevronLeft size={28} strokeWidth={1.75} />
        </button>
      </header>

      <div className="sample-detail__scroll">
        <p className="sample-detail__kicker">Sample detail</p>
        <img
          className="sample-detail__art"
          src={sample.artwork}
          alt={`${sample.title} by ${sample.artist}`}
        />

        <div className="sample-detail__identity">
          <div>
            <h1>{sample.title}</h1>
            <p>{sample.artist}</p>
            <p>{sample.year}</p>
          </div>
          <button
            type="button"
            className={`sample-detail__play${originalPlaying ? " is-active" : ""}`}
            aria-label={originalPlaying ? `Pause ${sample.title}` : `Play ${sample.title}`}
            aria-pressed={originalPlaying}
            onClick={() => play("original")}
          >
            {originalPlaying ? (
              <Pause size={22} strokeWidth={0} fill="currentColor" />
            ) : (
              <Play size={22} strokeWidth={0} fill="currentColor" />
            )}
          </button>
        </div>

        <div className="compare">
          <p className="compare__kicker">Hear the sample</p>
          <h2>Compare the original to how it&apos;s used.</h2>

          <article className={`compare-card${originalPlaying ? " is-playing" : ""}`}>
            <img src={sample.artwork} alt="" />
            <div className="compare-card__copy">
              <p>Original • {formatTime(sample.sourceAt)}</p>
              <h3>{sample.title}</h3>
              <span>{sample.artist}</span>
            </div>
            <button
              type="button"
              className="compare-card__play"
              aria-label={originalPlaying ? "Pause original" : "Play original"}
              aria-pressed={originalPlaying}
              onClick={() => play("original")}
            >
              {originalPlaying ? (
                <Pause size={16} strokeWidth={0} fill="currentColor" />
              ) : (
                <Play size={16} strokeWidth={0} fill="currentColor" />
              )}
            </button>
          </article>

          <div className="compare__bridge">
            <ArrowDown size={16} strokeWidth={2.25} />
            <span>becomes</span>
          </div>

          <article className={`compare-card compare-card--sampled${sampledPlaying ? " is-playing" : ""}`}>
            <img src={track.artwork} alt="" />
            <div className="compare-card__copy">
              <p>Sampled • {formatTime(sample.appearsAt)}</p>
              <h3>{track.title}</h3>
              <span>{track.artist}</span>
            </div>
            <button
              type="button"
              className="compare-card__play"
              aria-label={sampledPlaying ? "Pause sampled version" : "Play sampled version"}
              aria-pressed={sampledPlaying}
              onClick={() => play("sampled")}
            >
              {sampledPlaying ? (
                <Pause size={16} strokeWidth={0} fill="currentColor" />
              ) : (
                <Play size={16} strokeWidth={0} fill="currentColor" />
              )}
            </button>
          </article>

          <div className="compare-waves">
            <div className="compare-waves__side">
              <span>Source</span>
              <Waveform bars={sourceBars} progress={progress} active={originalPlaying} />
              <time>{formatTime(sample.sourceAt)}</time>
            </div>
            <div className="compare-waves__side">
              <span>Sample</span>
              <Waveform bars={sampleBars} progress={progress} active={sampledPlaying} />
              <time>{formatTime(sample.appearsAt)}</time>
            </div>
          </div>
        </div>
      </div>

      <div className="sample-detail__footer">
        <button type="button" className="hear-pill" onClick={playSampled}>
          <Play size={16} strokeWidth={0} fill="currentColor" />
          Hear it in {track.title}
        </button>
        <button type="button" className="sample-detail__chain" onClick={onExploreChain}>
          Explore Sample Chain
          <ChevronRight size={16} strokeWidth={2.25} />
        </button>
      </div>
    </section>
  )
}
