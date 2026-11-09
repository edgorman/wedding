import church from './assets/church.webp'
import '@fontsource/cormorant-garamond/400.css'
import './App.css'

function App() {
  return (
    <main className="page">
      <img
        className="church"
        src={church}
        alt="Watercolour drawing of St James' Church, Shere"
      />
      <h1 className="names">Ed &amp; Katie&apos;s Wedding</h1>
      <p className="venue">
        <a
          href="https://maps.app.goo.gl/LxyWMHvFjjvrS6j67"
          target="_blank"
          rel="noopener noreferrer"
        >
          St James' Church, Shere
        </a>
      </p>
      <p className="date">16th October 2027</p>
    </main>
  )
}

export default App
