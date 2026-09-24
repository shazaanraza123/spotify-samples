import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { NowPlayingTrack, SampleSource } from "../data/samples"
import "./SampleChain.css"

type ChainSelection = "source" | "sampled"

type SampleChainProps = {
  track: NowPlayingTrack
  sample: SampleSource
  onBack: () => void
  onExplore: () => void
  listenForEscape?: boolean
}

export function SampleChain({
  track,
  sample,
  onBack,
  onExplore,
  listenForEscape = true,
}: SampleChainProps) {
  const [selected, setSelected] = useState<ChainSelection | null>(null)
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

  const choose = (next: ChainSelection) => {
    setSelected((current) => (current === next ? null : next))
  }

  return (
    <section ref={rootRef} className="sample-chain" aria-label="Sample chain" tabIndex={-1}>
      <header className="sample-chain__top">
        <button type="button" className="sample-chain__back" aria-label="Back to sample detail" onClick={onBack}>
          <ChevronLeft size={28} strokeWidth={1.75} />
        </button>
      </header>

      <div className="sample-chain__scroll">
        <p className="sample-chain__kicker">Sample chain</p>
        <h1>Follow the sound</h1>
        <p className="sample-chain__subtitle">See how one recording travels across generations.</p>

        <ol className="chain">
          <li>
            <button
              type="button"
              className={`chain-card${selected === "source" ? " is-selected" : ""}`}
              aria-pressed={selected === "source"}
              onClick={() => choose("source")}
            >
              <img src={sample.artwork} alt="" />
              <span className="chain-card__copy">
                <span className="chain-card__label">Original source</span>
                <span className="chain-card__title">{sample.title}</span>
                <span className="chain-card__meta">{sample.artist}</span>
                <span className="chain-card__meta">{sample.year}</span>
              </span>
            </button>
          </li>

          <li className="chain__join" aria-hidden="true">
            <span className="chain__line" />
            <span className="chain__relation">sampled by</span>
          </li>

          <li>
            <button
              type="button"
              className={`chain-card${selected === "sampled" ? " is-selected" : ""}`}
              aria-pressed={selected === "sampled"}
              onClick={() => choose("sampled")}
            >
              <img src={track.artwork} alt="" />
              <span className="chain-card__copy">
                <span className="chain-card__label">Sampled</span>
                <span className="chain-card__title">{track.title}</span>
                <span className="chain-card__meta">{track.artist}</span>
                <span className="chain-card__meta">{track.year}</span>
              </span>
            </button>
          </li>
        </ol>

        <section className="chain-explore">
          <h2>Keep exploring</h2>
          <p>Explore songs connected through samples, interpolations, and influences.</p>
          <button type="button" className="chain-explore__action" onClick={onExplore}>
            Explore related music
            <ChevronRight size={16} strokeWidth={2.25} />
          </button>
        </section>
      </div>
    </section>
  )
}
