import { useEffect, useRef, useState } from 'react'
import { art } from './artwork'
import { calendarUrl, directionsUrl, spots } from './mapInfo'
import { RouteMap } from './RouteMap'
import { ScrollChevron } from './ScrollChevron'
import { Timeline } from './Timeline'
// Only the latin subset: every character on the page is in it.
import '@fontsource/cormorant-garamond/latin-400.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-400-italic.css'
import '@fontsource/caveat/latin-500.css'
import './App.css'

const REAL_SITE = 'https://katieanded.com'

// The deploy writes config.json next to the bundle (see docs/decisions/0009): on staging it names the
// environment and the real site's address. Missing (local dev, tests), the page just carries on as the real site.
async function realSiteUrl(): Promise<string | null> {
  try {
    const response = await fetch('/config.json')
    const config = await response.json()
    const other = typeof config.siteUrl === 'string' && new URL(config.siteUrl).hostname !== window.location.hostname
    return config.environment === 'staging' || other ? config.siteUrl || REAL_SITE : null
  } catch {
    return null
  }
}

function App() {
  const [bannerOpen, setBannerOpen] = useState(true)
  // Set on the dev (staging) site: the address of the real one.
  const [realSite, setRealSite] = useState<string | null>(null)
  useEffect(() => {
    void realSiteUrl().then(setRealSite)
  }, [])
  const heroRef = useRef<HTMLElement>(null)

  // Close the work-in-progress banner for good once the hero has scrolled out of view.
  useEffect(() => {
    if (!bannerOpen) return
    const onScroll = () => {
      const hero = heroRef.current
      if (!hero || hero.getBoundingClientRect().bottom > 0) return
      setBannerOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [bannerOpen])

  return (
    <main className="page">
      {bannerOpen && (
        <div className="wip" role="status">
          {realSite ? (
            <span>
              <strong>This isn&apos;t the real site.</strong>
              <br />
              It&apos;s a test copy.{' '}
              <a href={realSite}>Go to the real site</a>
            </span>
          ) : (
            <span>
              <strong>Work in progress.</strong>
              <br />
              Thanks for visiting, but it&apos;s not ready yet.
            </span>
          )}
          <button type="button" className="wip-x" aria-label="Close banner" onClick={() => setBannerOpen(false)}>
            &times;
          </button>
        </div>
      )}

      <header className="hero" data-section ref={heroRef}>
        <img
          className="church"
          src={art('hero/church')}
          alt="Watercolour drawing of St James' Church, Shere"
          fetchPriority="high"
        />
        <h1 className="names">Katie &amp; Ed&apos;s Wedding</h1>
        <p className="sub">
          <a className="churchlink" href={spots.church.href} target="_blank" rel="noopener noreferrer">
            St James&apos; Church, Shere
          </a>
        </p>
        <p>
          <a className="datelink" href={calendarUrl} target="_blank" rel="noopener noreferrer">
            Saturday, 16th October 2027
          </a>
        </p>
      </header>

      <section data-section>
        <h2>The day</h2>
        <Timeline />
      </section>

      <section data-section>
        <h2>The map</h2>
        <RouteMap />
        <p className="maptext">
          <a className="cta" href={directionsUrl} target="_blank" rel="noopener noreferrer">
            Click here for directions
          </a>
        </p>
      </section>

      <footer className="end" data-section>
        <p className="closing">We can&apos;t wait to see you all!</p>
        <img className="dance" src={art('couple/dancing')} alt="Drawing of a groom and bride dancing" />
      </footer>

      <ScrollChevron />
    </main>
  )
}

export default App
