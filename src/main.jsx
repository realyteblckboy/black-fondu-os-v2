import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const CORRECT_USERNAME = 'username';
const CORRECT_PASSWORD = 'password';

const dancerSeeds = [
  { x: -38, z: -22, s: 0.92, delay: -0.4, mood: 'knife', skin: '#9d5b46', cloth: '#141414', accent: '#ff1d52' },
  { x: -25, z: -9, s: 1.08, delay: -1.6, mood: 'wave', skin: '#5f342b', cloth: '#2b0f13', accent: '#fff200' },
  { x: -11, z: -28, s: 0.98, delay: -2.1, mood: 'shudder', skin: '#b56a50', cloth: '#0a0a0d', accent: '#00f0ff' },
  { x: 5, z: -14, s: 1.16, delay: -0.9, mood: 'knife', skin: '#7d473a', cloth: '#10060b', accent: '#ff6b00' },
  { x: 21, z: -31, s: 1.02, delay: -2.7, mood: 'wave', skin: '#c47b5e', cloth: '#171717', accent: '#ff1d52' },
  { x: 34, z: -12, s: 0.88, delay: -1.2, mood: 'shudder', skin: '#6e4134', cloth: '#070707', accent: '#fff200' },
  { x: -4, z: -42, s: 0.82, delay: -3.2, mood: 'knife', skin: '#a86651', cloth: '#0d0d12', accent: '#00f0ff' },
  { x: 42, z: -44, s: 0.72, delay: -2.5, mood: 'wave', skin: '#8f5646', cloth: '#18080e', accent: '#ff1d52' },
  { x: -45, z: -48, s: 0.76, delay: -0.7, mood: 'shudder', skin: '#bc745c', cloth: '#090909', accent: '#ff6b00' },
];

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

function App() {
  const audioRef = useRef(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [enteredVoid, setEnteredVoid] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tracks, setTracks] = useState([]);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [approvedTrackIds, setApprovedTrackIds] = useState(new Set());
  const [skips, setSkips] = useState(0);
  const [verdict, setVerdict] = useState('NO TRACKS. THEY DANCE TO THE ABSENCE.');
  const [volume, setVolume] = useState(0.8);
  const [error, setError] = useState('');

  const currentTrack = tracks[trackIndex] || null;
  const isApproved = currentTrack ? approvedTrackIds.has(currentTrack.id) : false;
  const dancersAreMoving = !isPlaying || isApproved;
  const dancersAreJudging = isPlaying && !isApproved;

  useEffect(() => {
    const t = setTimeout(() => setEnteredVoid(loggedIn), 850);
    return () => clearTimeout(t);
  }, [loggedIn]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.url;
    audio.load();

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
        setError('The browser blocked autoplay. Press PLAY again.');
      });
    }
  }, [trackIndex, currentTrack?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      setIsPlaying(false);
      setVerdict('THE ROOM RETURNS TO MOTION.');
    };

    const onPause = () => {
      setIsPlaying(false);
      if (!currentTrack || !isApproved) setVerdict('SILENCE ACCEPTED.');
    };

    const onPlay = () => {
      setIsPlaying(true);
      setVerdict(isApproved ? 'THEY HAVE DECIDED THIS ONE CAN LIVE.' : 'THEY FACE YOU. THEY DO NOT MOVE.');
    };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('play', onPlay);
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('play', onPlay);
    };
  }, [currentTrack, isApproved]);

  const handleLogin = (event) => {
    event.preventDefault();
    const usernameOk = username.trim().toLowerCase() === CORRECT_USERNAME;
    const passwordOk = password === CORRECT_PASSWORD;

    if (!usernameOk || !passwordOk) {
      setLoginError('ACCESS DENIED. TRY username / password, OR FORGET EVERYTHING.');
      return;
    }

    setLoginError('');
    setLoggedIn(true);
  };

  const enterFromForgotPassword = () => {
    setLoginError('');
    setLoggedIn(true);
  };

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('audio/'));
    if (!files.length) return;

    const nextTracks = files.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${file.size}-${Date.now()}-${index}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      file,
      url: URL.createObjectURL(file),
      loadedAt: new Date().toISOString(),
    }));

    setTracks((existing) => [...existing, ...nextTracks]);
    setTrackIndex((index) => (tracks.length ? index : 0));
    setVerdict('NEW OFFERINGS DETECTED. THEY ARE NOT IMPRESSED YET.');
    setError('');
  };

  const togglePlay = async () => {
    setError('');
    const audio = audioRef.current;
    if (!currentTrack || !audio) {
      setVerdict('UPLOAD A TRACK. THE VOID WILL NOT STREAM YOUR INTENTIONS.');
      return;
    }

    if (isPlaying) {
      audio.pause();
      setVerdict('MUSIC STOPPED. BODIES RESUME.');
      return;
    }

    try {
      await audio.play();
      setVerdict(isApproved ? 'THEY HAVE DECIDED THIS ONE CAN LIVE.' : 'THEY FACE YOU. THEY DO NOT MOVE.');
    } catch (playError) {
      setIsPlaying(false);
      setError('Audio could not start. Re-select the file or press PLAY again.');
    }
  };

  const skipTrack = () => {
    if (!tracks.length) {
      setVerdict('NO TRACKS TO SKIP. ONLY VOID.');
      return;
    }

    const nextSkipCount = skips + 1;
    setSkips(nextSkipCount);
    const nextIndex = (trackIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];

    const enoughSkips = nextSkipCount >= 2;
    const capriciousApproval = enoughSkips && Math.random() > Math.max(0.25, 0.7 - nextSkipCount * 0.08);

    if (capriciousApproval && nextTrack) {
      setApprovedTrackIds((previous) => {
        const copy = new Set(previous);
        copy.add(nextTrack.id);
        return copy;
      });
      setVerdict('AFTER MANY SKIPS, THEY CHOOSE THIS ONE WITHOUT EXPLANATION.');
    } else {
      setVerdict(enoughSkips ? 'STILL NOTHING. THEIR SILENCE IS A REVIEW.' : 'TOO SOON. THEIR TASTE HAS NOT ARRIVED.');
    }

    setTrackIndex(nextIndex);
  };

  const revokeTaste = () => {
    if (!currentTrack) return;
    setApprovedTrackIds((previous) => {
      const copy = new Set(previous);
      copy.delete(currentTrack.id);
      return copy;
    });
    setVerdict('APPROVAL REMOVED. THEY TURN COLD AGAIN.');
  };

  const clearTracks = () => {
    tracks.forEach((track) => URL.revokeObjectURL(track.url));
    setTracks([]);
    setTrackIndex(0);
    setIsPlaying(false);
    setApprovedTrackIds(new Set());
    setSkips(0);
    setVerdict('LIBRARY PURGED. THEY DANCE TO THE ABSENCE.');
  };

  const statusLine = useMemo(() => {
    if (!currentTrack) return 'DANCING: TRUE / MUSIC: NONE / APPROVAL: IRRELEVANT';
    return `DANCING: ${dancersAreMoving ? 'TRUE' : 'FALSE'} / MUSIC: ${isPlaying ? 'ON' : 'OFF'} / APPROVAL: ${isApproved ? 'GRANTED' : 'WITHHELD'}`;
  }, [currentTrack, dancersAreMoving, isPlaying, isApproved]);

  return (
    <main className={cx('app', loggedIn && 'logged-in', enteredVoid && 'void-entered')}>
      <div className="scanlines" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      {!loggedIn && (
        <section className="login-shell" aria-label="BLACK FONDU OS V2 sign in">
          <div className="login-card">
            <div className="machine-label">BLACK FONDU OS V2</div>
            <h1>ENTER THE FLOOR</h1>
            <p className="login-copy">A private operating system for bodies, silence, and bad taste.</p>
            <form onSubmit={handleLogin}>
              <label>
                USERNAME
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="username"
                  autoComplete="username"
                />
              </label>
              <label>
                PASSWORD
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="password"
                  type="password"
                  autoComplete="current-password"
                />
              </label>
              <button type="submit" className="primary-button">SIGN IN</button>
            </form>
            <button type="button" className="forgot-button" onClick={enterFromForgotPassword}>
              FORGOT PASSWORD
            </button>
            <p className="hint">Use <strong>username</strong> / <strong>password</strong>. Or press forgot password and walk in anyway.</p>
            {loginError && <p className="error">{loginError}</p>}
          </div>
        </section>
      )}

      {loggedIn && (
        <section className="void-shell" aria-label="BLACK FONDU OS V2 dance floor">
          <header className="hud hud-top">
            <div>
              <p className="eyebrow">BLACK FONDU OS V2</p>
              <h2>{statusLine}</h2>
            </div>
            <button type="button" className="logout" onClick={() => setLoggedIn(false)}>EXIT</button>
          </header>

          <section className={cx('stage', dancersAreMoving && 'is-dancing', dancersAreJudging && 'is-judging')}>
            <div className="void-vortex" aria-hidden="true" />
            <div className="floor-grid" aria-hidden="true" />
            <div className="dancer-field">
              {dancerSeeds.map((seed, index) => (
                <Dancer seed={seed} key={index} index={index} moving={dancersAreMoving} judging={dancersAreJudging} />
              ))}
            </div>
            <div className="void-title" aria-hidden="true">
              <span>NO MUSIC</span>
              <span>NO MERCY</span>
            </div>
          </section>

          <section className="console" aria-label="music console">
            <div className="now-playing">
              <p className="eyebrow">CURRENT OFFERING</p>
              <h3>{currentTrack ? currentTrack.name : 'NO TRACK SELECTED'}</h3>
              <p>{verdict}</p>
              {error && <p className="error">{error}</p>}
            </div>

            <div className="transport">
              <button type="button" className="play-button" onClick={togglePlay}>{isPlaying ? 'PAUSE' : 'PLAY'}</button>
              <button type="button" onClick={skipTrack}>SKIP</button>
              <button type="button" onClick={revokeTaste} disabled={!currentTrack || !isApproved}>REVOKE TASTE</button>
              <label className="upload-button">
                UPLOAD TRACKS
                <input type="file" multiple accept="audio/*" onChange={handleFiles} />
              </label>
            </div>

            <div className="meters">
              <label>
                VOID VOLUME
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                />
              </label>
              <div className="taste-meter">
                <span style={{ width: `${Math.min(100, skips * 14)}%` }} />
              </div>
              <p>SKIPS BEFORE MERCY: {skips}</p>
            </div>

            <div className="playlist">
              <div className="playlist-header">
                <p className="eyebrow">LOCAL TRACKS ONLY</p>
                <button type="button" onClick={clearTracks} disabled={!tracks.length}>PURGE</button>
              </div>
              {tracks.length === 0 ? (
                <p className="empty">Upload audio files. Nothing leaves your browser.</p>
              ) : (
                <ol>
                  {tracks.map((track, index) => (
                    <li key={track.id} className={cx(index === trackIndex && 'active', approvedTrackIds.has(track.id) && 'approved')}>
                      <button type="button" onClick={() => setTrackIndex(index)}>{track.name}</button>
                      <span>{approvedTrackIds.has(track.id) ? 'APPROVED' : 'UNJUDGED'}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>

          <audio ref={audioRef} />
        </section>
      )}
    </main>
  );
}

function Dancer({ seed, index, moving, judging }) {
  const style = {
    '--x': `${seed.x}vw`,
    '--z': `${seed.z}vmin`,
    '--scale': seed.s,
    '--delay': `${seed.delay}s`,
    '--skin': seed.skin,
    '--cloth': seed.cloth,
    '--accent': seed.accent,
    '--spin': `${index % 2 === 0 ? -1 : 1}`,
  };

  return (
    <article className={cx('dancer', seed.mood, moving && 'moving', judging && 'judging')} style={style} aria-hidden="true">
      <div className="shadow" />
      <div className="body-rig">
        <div className="head"><span /></div>
        <div className="neck" />
        <div className="torso"><span /></div>
        <div className="pelvis" />
        <div className="arm left"><i className="upper" /><i className="lower" /></div>
        <div className="arm right"><i className="upper" /><i className="lower" /></div>
        <div className="leg left"><i className="upper" /><i className="lower" /></div>
        <div className="leg right"><i className="upper" /><i className="lower" /></div>
      </div>
    </article>
  );
}

createRoot(document.getElementById('root')).render(<App />);
