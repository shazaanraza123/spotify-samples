import { useState } from "react"
import { NowPlaying } from "./components/NowPlaying"

function App() {
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null)
  const [chainOpen, setChainOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)

  return (
    <main className="app-shell">
      <NowPlaying
        selectedSampleId={selectedSampleId}
        chainOpen={chainOpen}
        exploreOpen={exploreOpen}
        onOpenSample={setSelectedSampleId}
        onCloseSample={() => {
          setExploreOpen(false)
          setChainOpen(false)
          setSelectedSampleId(null)
        }}
        onOpenChain={() => setChainOpen(true)}
        onCloseChain={() => {
          setExploreOpen(false)
          setChainOpen(false)
        }}
        onOpenExplore={() => setExploreOpen(true)}
        onCloseExplore={() => setExploreOpen(false)}
      />
    </main>
  )
}

export default App
