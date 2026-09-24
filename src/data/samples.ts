import collegeDropoutArtwork from "../assets/college-dropout.jpeg"
import throughTheFireArtwork from "../assets/through-the-fire.jpeg"

export type SampleSource = {
  id: string
  title: string
  artist: string
  year: number
  album: string
  artwork: string
  label: string
  appearsAt: number
  sourceAt: number
  clipDuration: number
}

export type NowPlayingTrack = {
  id: string
  title: string
  artist: string
  album: string
  artwork: string
  year: number
  duration: number
  samples: SampleSource[]
}

export const nowPlaying: NowPlayingTrack = {
  id: "through-the-wire",
  title: "Through the Wire",
  artist: "Kanye West",
  album: "The College Dropout",
  artwork: collegeDropoutArtwork,
  year: 2004,
  duration: 221,
  samples: [
    {
      id: "through-the-fire",
      title: "Through the Fire",
      artist: "Chaka Khan",
      year: 1984,
      album: "I Feel for You",
      artwork: throughTheFireArtwork,
      label: "DIRECT SAMPLE",
      appearsAt: 4,
      sourceAt: 58,
      clipDuration: 8,
    },
  ],
}

export const exploreCategories = [
  {
    id: "hip-hop-classics",
    title: "Hip-Hop Classics",
    subtitle: "Trace iconic samples",
    tone: "warm",
  },
  {
    id: "soul-rap",
    title: "Soul → Rap",
    subtitle: "Follow the sound across generations",
    tone: "soul",
  },
] as const

export const sampleTrail = {
  title: "Your Sample Trail",
  subtitle: "A personalized path through the samples behind your music.",
  artists: `${nowPlaying.artist}, Jay-Z, Tyler, the Creator + more`,
}

export const exploreEras = ["60s", "70s", "80s", "90s", "2000s", "2010s", "Today"] as const

export type ExploreEra = (typeof exploreEras)[number]
