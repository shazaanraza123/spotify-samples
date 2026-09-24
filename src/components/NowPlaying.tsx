import { useEffect, useRef, useState } from "react"
import {
  AudioWaveform,
  ChevronDown,
  Ellipsis,
  Heart,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react"
import { nowPlaying } from "../data/samples"
import { ExploreSamples } from "./ExploreSamples"
import { SampleChain } from "./SampleChain"
import { SampleDetail } from "./SampleDetail"
import { SamplesSheet } from "./SamplesSheet"
import "./NowPlaying.css"

type NowPlayingProps = {
  selectedSampleId: string | null
  chainOpen: boolean
  exploreOpen: boolean
  onOpenSample: (sampleId: string) => void
  onCloseSample: () => void
  onOpenChain: () => void
  onCloseChain: () => void
  onOpenExplore: () => void
  onCloseExplore: () => void
}

type RepeatMode = "off" | "all" | "one"

function formatTime(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${remainder.toString().padStart(2, "0")}`
}

export function NowPlaying({
  selectedSampleId,
  chainOpen,
  exploreOpen,
  onOpenSample,
  onCloseSample,
  onOpenChain,
  onCloseChain,
  onOpenExplore,
  onCloseExplore,
}: NowPlayingProps) {
  const track = nowPlaying
  const selectedSample = track.samples.find((sample) => sample.id === selectedSampleId) ?? null
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off")
  const [position, setPosition] = useState(48)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [isSamplesOpen, setIsSamplesOpen] = useState(false)
  const positionRef = useRef(position)
  const scrubbingRef = useRef(false)

  useEffect(() => {
    positionRef.current = position
  }, [position])

  useEffect(() => {
    scrubbingRef.current = isScrubbing
  }, [isScrubbing])

  useEffect(() => {
    if (!isPlaying) return

    let last = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const delta = (now - last) / 1000
      last = now

      if (!scrubbingRef.current) {
        const next = positionRef.current + delta
        if (next >= track.duration) {
          if (repeatMode === "off") {
            positionRef.current = track.duration
            setPosition(track.duration)
            setIsPlaying(false)
            return
          }
          positionRef.current = next - track.duration
          setPosition(positionRef.current)
        } else {
          positionRef.current = next
          setPosition(next)
        }
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [isPlaying, repeatMode, track.duration])

  const progress = Math.min(position / track.duration, 1)

  const seek = (value: number) => {
    const next = Math.min(Math.max(value, 0), track.duration)
    positionRef.current = next
    setPosition(next)
  }

  const cycleRepeat = () => {
    setRepeatMode((mode) => {
      if (mode === "off") return "all"
      if (mode === "all") return "one"
      return "off"
    })
  }

  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat

  return (
    <section className="now-playing" aria-label="Now playing">
      <header className="now-playing__top">
        <button type="button" className="icon-button" aria-label="Close">
          <ChevronDown size={28} strokeWidth={1.75} />
        </button>
        <div className="now-playing__context">
          <p>Playing from album</p>
          <strong>{track.album}</strong>
        </div>
        <button type="button" className="icon-button" aria-label="More options">
          <Ellipsis size={24} strokeWidth={1.75} />
        </button>
      </header>

      <div className="now-playing__art-wrap">
        <img
          className="now-playing__art"
          src={track.artwork}
          alt={`${track.album} album cover`}
        />
      </div>

      <div className="now-playing__body">
        <div className="now-playing__title-row">
          <div className="now-playing__titles">
            <h1>{track.title}</h1>
            <p>{track.artist}</p>
          </div>
          <button
            type="button"
            className={`icon-button heart${isSaved ? " is-active" : ""}`}
            aria-label={isSaved ? "Remove from Liked Songs" : "Save to Liked Songs"}
            aria-pressed={isSaved}
            onClick={() => setIsSaved((saved) => !saved)}
          >
            <Heart
              size={26}
              strokeWidth={1.75}
              fill={isSaved ? "currentColor" : "none"}
            />
          </button>
        </div>

        <button
          type="button"
          className="samples-pill"
          aria-expanded={isSamplesOpen}
          aria-controls="samples-sheet"
          onClick={() => setIsSamplesOpen(true)}
        >
          <AudioWaveform size={16} strokeWidth={2.25} />
          <span>Samples</span>
          <span className="samples-pill__count">{track.samples.length}</span>
        </button>

        <div className="progress">
          <input
            className="progress__range"
            type="range"
            min={0}
            max={track.duration}
            step={0.1}
            value={position}
            aria-label="Playback position"
            aria-valuetext={`${formatTime(position)} of ${formatTime(track.duration)}`}
            style={{ ["--progress" as string]: `${progress * 100}%` }}
            onPointerDown={() => setIsScrubbing(true)}
            onPointerUp={() => setIsScrubbing(false)}
            onChange={(event) => seek(Number(event.target.value))}
          />
          <div className="progress__times">
            <span>{formatTime(position)}</span>
            <span>{formatTime(track.duration)}</span>
          </div>
        </div>

        <div className="transport" role="group" aria-label="Playback controls">
          <button
            type="button"
            className={`icon-button transport__side${isShuffled ? " is-active" : ""}`}
            aria-label="Shuffle"
            aria-pressed={isShuffled}
            onClick={() => setIsShuffled((value) => !value)}
          >
            <Shuffle size={22} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="icon-button transport__skip"
            aria-label="Previous"
            onClick={() => seek(0)}
          >
            <SkipBack size={30} strokeWidth={1.75} fill="currentColor" />
          </button>
          <button
            type="button"
            className="play-button"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={() => setIsPlaying((playing) => !playing)}
          >
            {isPlaying ? (
              <Pause size={28} strokeWidth={0} fill="currentColor" />
            ) : (
              <Play size={28} strokeWidth={0} fill="currentColor" />
            )}
          </button>
          <button type="button" className="icon-button transport__skip" aria-label="Next">
            <SkipForward size={30} strokeWidth={1.75} fill="currentColor" />
          </button>
          <button
            type="button"
            className={`icon-button transport__side${repeatMode !== "off" ? " is-active" : ""}`}
            aria-label={
              repeatMode === "one" ? "Repeat one" : repeatMode === "all" ? "Repeat" : "Enable repeat"
            }
            aria-pressed={repeatMode !== "off"}
            onClick={cycleRepeat}
          >
            <RepeatIcon size={22} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <SamplesSheet
        open={isSamplesOpen}
        samples={track.samples}
        trackDuration={track.duration}
        onClose={() => setIsSamplesOpen(false)}
        onViewSample={onOpenSample}
        closeOnEscape={selectedSample === null}
      />
      {selectedSample ? (
        <SampleDetail
          track={track}
          sample={selectedSample}
          onBack={onCloseSample}
          onExploreChain={onOpenChain}
          listenForEscape={!chainOpen}
        />
      ) : null}
      {selectedSample && chainOpen ? (
        <SampleChain
          track={track}
          sample={selectedSample}
          onBack={onCloseChain}
          onExplore={onOpenExplore}
          listenForEscape={!exploreOpen}
        />
      ) : null}
      {selectedSample && chainOpen && exploreOpen ? <ExploreSamples onBack={onCloseExplore} /> : null}
    </section>
  )
}
