import church from './assets/church.jpg'
import '@fontsource/great-vibes/400.css'
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
      <h1 className="names">Ed &amp; Katie Wedding</h1>
      <p className="venue">St James' Church, Shere</p>
      <p className="date">October 2027</p>
    </main>
  )
}

export default App
