import church from './assets/church.webp'
import spray from './assets/spray.svg'
import daisy from './assets/daisy.svg'
import sprig from './assets/sprig.svg'
import sparkle from './assets/sparkle.svg'
import '@fontsource/pinyon-script/400.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import './App.css'

function App() {
  return (
    <main className="page">
      <header className="hero">
        <img className="spray tl" src={spray} alt="" />
        <img className="spray tr" src={spray} alt="" />
        <img
          className="church"
          src={church}
          alt="Watercolour drawing of St James' Church, Shere"
        />
        <h1 className="names">Ed &amp; Katie&apos;s Wedding</h1>
        <p className="lead">We can&apos;t wait to celebrate with you</p>
      </header>

      <div className="scallop" />

      <section className="card">
        <img className="doodle" src={daisy} alt="" />
        <h2>The ceremony</h2>
        <p className="date">16th October 2027</p>
        <p className="venue">
          <a
            href="https://maps.app.goo.gl/LxyWMHvFjjvrS6j67"
            target="_blank"
            rel="noopener noreferrer"
          >
            St James' Church, Shere
          </a>
        </p>
      </section>

      <footer className="foot">
        <img className="doodle" src={sprig} alt="" />
        <img className="doodle small" src={sparkle} alt="" />
        <img className="doodle flip" src={sprig} alt="" />
      </footer>
    </main>
  )
}

export default App
