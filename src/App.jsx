import { useRef, useState } from 'react'
import InviteScreen from './components/InviteScreen'
import CongratsScreen from './components/CongratsScreen'
import PerksSection from './components/PerksSection'

function App() {
  const [accepted, setAccepted] = useState(false)
  const perksRef = useRef(null)

  return (
    <div className="bg-grid bg-glow relative min-h-screen">
      {!accepted ? (
        <InviteScreen onAccept={() => setAccepted(true)} />
      ) : (
        <>
          <CongratsScreen onContinue={() => perksRef.current?.scrollIntoView({ behavior: 'smooth' })} />
          <div ref={perksRef}>
            <PerksSection />
          </div>
        </>
      )}
    </div>
  )
}

export default App
