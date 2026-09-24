import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import {
  exploreCategories,
  exploreEras,
  nowPlaying,
  sampleTrail,
  type ExploreEra,
} from "../data/samples"
import "./ExploreSamples.css"

type ExploreSamplesProps = {
  onBack: () => void
}

export function ExploreSamples({ onBack }: ExploreSamplesProps) {
  const [query, setQuery] = useState("")
  const [era, setEra] = useState<ExploreEra | null>(null)
  const rootRef = useRef<HTMLElement>(null)
  const covers = [nowPlaying.samples[0]?.artwork, nowPlaying.artwork].filter(Boolean)

  useEffect(() => {
    rootRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      onBack()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onBack])

  return (
    <section ref={rootRef} className="explore" aria-label="Explore samples" tabIndex={-1}>
      <header className="explore__top">
        <button type="button" className="explore__back" aria-label="Back to sample chain" onClick={onBack}>
          <ChevronLeft size={28} strokeWidth={1.75} />
        </button>
      </header>

      <div className="explore__scroll">
        <p className="explore__kicker">Explore samples</p>
        <h1>Discover the music behind the music.</h1>

        <label className="explore-search">
          <Search size={18} strokeWidth={2} aria-hidden="true" />
          <input
            type="search"
            value={query}
            placeholder="Search songs, artists, or samples"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <section className="explore-block">
          <h2>Songs you know, samples you don&apos;t</h2>
          <p>Discover the records behind familiar songs.</p>
          <div className="explore-categories">
            {exploreCategories.map((category) => (
              <button key={category.id} type="button" className={`explore-category explore-category--${category.tone}`}>
                <span className="explore-category__wash" aria-hidden="true" />
                <span className="explore-category__copy">
                  <span className="explore-category__title">{category.title}</span>
                  <span className="explore-category__subtitle">{category.subtitle}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="explore-block">
          <h2>Made for your taste</h2>
          <p>Based on artists and eras you already play.</p>
          <article className="trail">
            <div className="trail__path" aria-hidden="true">
              {covers.map((artwork) => (
                <img key={artwork} src={artwork} alt="" />
              ))}
              <span className="trail__node" />
            </div>
            <h3>{sampleTrail.title}</h3>
            <p>{sampleTrail.subtitle}</p>
            <p className="trail__artists">{sampleTrail.artists}</p>
            <button type="button" className="trail__action">
              Explore
              <ChevronRight size={16} strokeWidth={2.25} />
            </button>
          </article>
        </section>

        <section className="explore-block">
          <h2>Explore by era</h2>
          <div className="era-row" role="listbox" aria-label="Era">
            {exploreEras.map((item) => (
              <button
                key={item}
                type="button"
                role="option"
                className={`era-pill${era === item ? " is-selected" : ""}`}
                aria-selected={era === item}
                onClick={() => setEra(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
