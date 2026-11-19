import type { CSSProperties } from 'react'
import { art } from './artwork'
import { events } from './timeline'

const wavePath =
  'M500 0 C500 42.5 550 42.5 550 85 C550 170 450 170 450 255 C450 340 550 340 550 425 C550 510 450 510 450 595 C450 680 550 680 550 765 C550 850 450 850 450 935 C450 977.5 500 977.5 500 1020'

export function Timeline() {
  return (
    <ol className="timeline">
      <svg className="wave" viewBox="0 0 1000 1020" preserveAspectRatio="none" aria-hidden="true">
        <path d={wavePath} />
      </svg>
      {events.map((e) => (
        <li
          key={e.time}
          className={`ev ${e.side}`}
          style={{ '--row': `${e.row}px`, '--dx': e.side === 'r' ? '5%' : '-5%' } as CSSProperties}
        >
          <span className="dot" />
          <div className="txt">
            <div className="time">{e.time}</div>
            <p className="what">{e.what}</p>
            <p className="where">{e.where}</p>
          </div>
          <div className="pic">
            <img src={art(`timeline/${e.icon}`)} alt="" />
          </div>
        </li>
      ))}
    </ol>
  )
}
