# GIF Rotation System - Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     GIF ROTATION SYSTEM                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  1. GIF POOL (static/intro-gifs/)                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ intro-1  │  │ intro-2  │  │ intro-3  │  │ intro-4  │  ...  │
│  │   .gif   │  │   .gif   │  │   .gif   │  │   .gif   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│       ▲            ▲            ▲            ▲                  │
│       └────────────┴────────────┴────────────┘                  │
│                    Circular Queue                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Scans & Loads
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. GO ROTATOR (.automation/gif-rotator/main.go)                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  GifRotator                                            │    │
│  │  ├─ gifFiles: []string                                │    │
│  │  ├─ currentIndex: int                                  │    │
│  │  └─ lastRotation: time.Time                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Functions:                                                     │
│  • loadGifFiles()    → Scan intro-gifs/ directory              │
│  • loadState()       → Read rotation-state.txt                 │
│  • shouldRotate()    → Check if 5 hours passed                 │
│  • rotateGif()       → Copy next GIF to intro.gif              │
│  • saveState()       → Save current index & timestamp          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Copies Selected GIF
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. ACTIVE GIF (static/intro.gif)                               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                                                       │      │
│  │              Current Intro GIF                        │      │
│  │         (Auto-updated every 5 hours)                  │      │
│  │                                                       │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Referenced By
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. README.md                                                    │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  <img src="static/intro.gif" ... />                  │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  5. STATE PERSISTENCE (rotation-state.txt)                      │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  2                    ← Current index                │      │
│  │  1739620152           ← Unix timestamp               │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  6. AUTOMATION TRIGGER (GitHub Actions)                         │
│                                                                  │
│  File: .github/workflows/rotate-gif.yml                          │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Trigger: Every 5 hours (cron: '0 */5 * * *')        │      │
│  │  Actions:                                             │      │
│  │    1. Checkout repo                                   │      │
│  │    2. Setup Go                                        │      │
│  │    3. Run: go run main.go                             │      │
│  │    4. Commit changes (if any)                         │      │
│  │    5. Push to GitHub                                  │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════
                        ROTATION FLOW
═══════════════════════════════════════════════════════════════════

  START
    │
    ▼
  ┌─────────────────────┐
  │ Load GIF files from │
  │  intro-gifs/ dir    │
  └──────────┬──────────┘
             │
             ▼
  ┌─────────────────────┐
  │  Load state from    │
  │ rotation-state.txt  │
  └──────────┬──────────┘
             │
             ▼
  ┌─────────────────────┐      NO      ┌─────────────────────┐
  │ 5+ hours passed?    │─────────────▶│  Log: Not time yet  │
  │  or --force flag?   │              │  Show next rotation │
  └──────────┬──────────┘              └──────────┬──────────┘
             │ YES                                 │
             ▼                                     │
  ┌─────────────────────┐                         │
  │ Increment index     │                         │
  │ (circular: 0→1→2→0) │                         │
  └──────────┬──────────┘                         │
             │                                     │
             ▼                                     │
  ┌─────────────────────┐                         │
  │ Copy selected GIF   │                         │
  │ to intro.gif        │                         │
  └──────────┬──────────┘                         │
             │                                     │
             ▼                                     │
  ┌─────────────────────┐                         │
  │ Save new state:     │                         │
  │ - Current index     │                         │
  │ - Current timestamp │                         │
  └──────────┬──────────┘                         │
             │                                     │
             ▼                                     │
  ┌─────────────────────┐                         │
  │ Log: Success! ✅    │                         │
  └──────────┬──────────┘                         │
             │                                     │
             └─────────────────────────────────────┘
                           │
                           ▼
                         END

═══════════════════════════════════════════════════════════════════
                      EXAMPLE TIMELINE
═══════════════════════════════════════════════════════════════════

  00:00  │ intro-1.gif  │ Initial state
  05:00  │ intro-2.gif  │ First rotation (5 hours later)
  10:00  │ intro-3.gif  │ Second rotation
  15:00  │ intro-4.gif  │ Third rotation
  20:00  │ intro-1.gif  │ Back to start (circular)
  25:00  │ intro-2.gif  │ Continues cycling...

═══════════════════════════════════════════════════════════════════
                    FILE DEPENDENCIES
═══════════════════════════════════════════════════════════════════

  main.go
    │
    ├─ Reads from: static/intro-gifs/*.gif
    ├─ Reads from: rotation-state.txt
    ├─ Writes to:  static/intro.gif
    └─ Writes to:  rotation-state.txt

  README.md
    │
    └─ References: static/intro.gif (line 15)

  GitHub Actions
    │
    ├─ Runs: main.go
    ├─ Commits: static/intro.gif
    └─ Commits: rotation-state.txt

═══════════════════════════════════════════════════════════════════
```
