import { useEffect, useMemo, useState } from 'react'
import content from '../data/content.js'
import './App.css'

type Screen = 0 | 1 | 2 | 3 | 4

const getTimeLeft = (target: string) => {
  const difference = Math.max(0, new Date(target).getTime() - Date.now())
  const totalSeconds = Math.floor(difference / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>(0)
  const [opened, setOpened] = useState(false)
  const [candlesBlown, setCandlesBlown] = useState(false)
  const [hugSent, setHugSent] = useState(false)
  const [hugCount, setHugCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(content.birthday))
  const [birthdayPassed, setBirthdayPassed] = useState(() => new Date(content.birthday).getTime() <= Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(content.birthday))
      setBirthdayPassed(new Date(content.birthday).getTime() <= Date.now())
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const countdown = useMemo(
    () => [
      [timeLeft.days, content.countdown.units.days],
      [timeLeft.hours, content.countdown.units.hours],
      [timeLeft.minutes, content.countdown.units.minutes],
      [timeLeft.seconds, content.countdown.units.seconds],
    ],
    [timeLeft],
  )

  const goNext = () => setScreen((current) => Math.min(4, current + 1) as Screen)
  const navigateTo = (nextScreen: Screen) => {
    if (nextScreen >= 2 && (!birthdayPassed || !opened)) return
    setScreen(nextScreen)
  }

  return (
    <main className="birthday-app">
      {screen === 0 && (
        <section className="screen intro-screen">
          <div className="screen-content intro-content">
            <p className="eyebrow">{content.intro.eyebrow.replace('{name}', content.name)}</p>
            <div className="heart-orb" aria-hidden="true">♥</div>
            <h1>{content.intro.title}</h1>
            <p className="subtitle">{content.intro.subtitle}</p>
          </div>
          <ScreenFooter label={content.intro.button} screen={screen} onClick={goNext} onNavigate={navigateTo} />
        </section>
      )}

      {screen === 1 && (
        <section className={`screen letter-screen ${birthdayPassed ? 'birthday-celebration' : ''}`}>
          <div className="screen-content">
            <p className="eyebrow">{content.countdown.eyebrow}</p>
            <h1>{birthdayPassed ? content.countdown.passedTitle : content.countdown.title}</h1>
            {birthdayPassed && (
              <>
                <div className="celebration-burst" aria-hidden="true">
                  <span>♥</span><span>✦</span><span>♥</span><span>✦</span><span>♥</span>
                </div>
                <p className="birthday-arrived">{content.countdown.passedMessage}</p>
              </>
            )}
            <div className="countdown">
              {countdown.map(([value, unit]) => (
                <div className="countdown-item" key={unit}>
                  <strong>{String(value).padStart(2, '0')}</strong>
                  <span>{unit}</span>
                </div>
              ))}
            </div>
            <button
              className={`envelope-card ${opened ? 'is-open' : ''} ${birthdayPassed ? '' : 'is-locked'}`}
              disabled={!birthdayPassed}
              onClick={() => setOpened(true)}
              type="button"
            >
              <span className="envelope" aria-hidden="true"><span>♥</span></span>
              <h2>{!birthdayPassed ? content.letter.lockedTitle : opened ? content.letter.openTitle : content.letter.closedTitle}</h2>
              <p>{!birthdayPassed ? content.letter.lockedHint : opened ? content.letter.openHint : content.letter.closedHint}</p>
            </button>
          </div>
          <ScreenFooter
            label={!birthdayPassed ? content.letter.lockedButton : content.letter.button}
            screen={screen}
            onClick={goNext}
            onNavigate={navigateTo}
            nextDisabled={!birthdayPassed || !opened}
          />
        </section>
      )}

      {screen === 2 && (
        <section className="screen message-screen">
          <div className="screen-content">
            <p className="eyebrow">{content.message.eyebrow}</p>
            <article className="letter-paper">
              <h2>{content.message.greeting.replace('{name}', content.name)}</h2>
              <p className="typed-message">{content.message.body}</p>
              <p className="signature">♥ {content.name}</p>
            </article>
          </div>
          <ScreenFooter label={content.message.button} screen={screen} onClick={goNext} onNavigate={navigateTo} />
        </section>
      )}

      {screen === 3 && (
        <section className="screen memories-screen">
          <div className="screen-content">
            <p className="eyebrow">{content.memories.eyebrow}</p>
            <h1>{content.memories.title}</h1>
            <div className="memory-list">
              {content.memories.items.map((memory: { date: string; title: string; description: string; image?: string }, index: number) => (
                <button className="memory-card" type="button" key={memory.title}>
                  <div className="memory-photo">{memory.image ? <img src={memory.image} alt="" /> : content.memories.photoLabel.replace('{number}', String(index + 1))}</div>
                  <div className="memory-copy">
                    <span>{memory.date}</span>
                    <strong>{memory.title}</strong>
                    <p>{memory.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="gesture-hint">{content.memories.hint}</p>
          </div>
          <ScreenFooter label={content.memories.button} screen={screen} onClick={goNext} onNavigate={navigateTo} />
        </section>
      )}

      {screen === 4 && (
        <section className={`screen ending-screen ${hugSent ? 'hug-sent' : ''}`}>
          <div className="screen-content">
            <p className="eyebrow">{content.ending.eyebrow}</p>
            <h1>{content.ending.title}</h1>
            <div key={hugCount} className={`cake ${candlesBlown ? 'blown' : ''}`} aria-label={content.ending.cakeAlt}>
              {candlesBlown && <div className="confetti" aria-hidden="true">♥ ♥ ♥</div>}
              <div className="flames"><i /><i /><i /></div>
              <div className="candles"><i /><i /><i /></div>
              <div className="cake-top" /><div className="cake-body" />
            </div>
            <p className="ending-copy">{candlesBlown ? content.ending.afterBlow : content.ending.beforeBlow}</p>
            <p className="blow-hint">
              {hugSent ? content.ending.hugHint : candlesBlown ? content.ending.blownHint : content.ending.blowHint}
            </p>
          </div>
          <ScreenFooter
            label={candlesBlown ? content.ending.afterButton : content.ending.button}
            screen={screen}
            onClick={() => {
              if (!candlesBlown) {
                setCandlesBlown(true)
                return
              }
              setHugSent(true)
              setHugCount((count) => count + 1)
            }}
            onNavigate={navigateTo}
          />
        </section>
      )}
    </main>
  )
}

function ScreenFooter({ label, screen, onClick, onNavigate, nextDisabled = false }: { label: string; screen: Screen; onClick: () => void; onNavigate: (screen: Screen) => void; nextDisabled?: boolean }) {
  return (
    <footer className="screen-footer">
      <button className="primary-button" disabled={nextDisabled} type="button" onClick={onClick}>{label}</button>
      <nav className="dots" aria-label={`Pilih layar, saat ini layar ${screen + 1} dari 5`}>
        {[0, 1, 2, 3, 4].map((dot) => (
          <button
            aria-label={`Buka layar ${dot + 1}`}
            aria-current={dot === screen ? 'step' : undefined}
            className={dot === screen ? 'active' : ''}
            key={dot}
            onClick={() => onNavigate(dot as Screen)}
            type="button"
          />
        ))}
      </nav>
    </footer>
  )
}

export default App
