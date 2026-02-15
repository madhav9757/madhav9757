# 🎬 GIF Rotator Automation

Automatically rotates the intro GIF in the README every 5 hours.

## 📁 Directory Structure

```
.automation/
└── gif-rotator/
    ├── main.go              # Main rotation logic
    ├── go.mod               # Go module file
    ├── rotation-state.txt   # State file (auto-generated)
    └── README.md            # This file

static/
├── intro.gif                # Current active GIF (auto-updated)
└── intro-gifs/              # Pool of GIFs to rotate through
    ├── intro-1.gif
    ├── intro-2.gif
    ├── intro-3.gif
    └── ...
```

## 🚀 How It Works

1. **GIF Pool**: Place multiple GIF files in `static/intro-gifs/` directory
2. **Rotation**: Every 5 hours, the script:
   - Selects the next GIF from the pool
   - Copies it to `static/intro.gif`
   - Updates the rotation state
3. **State Persistence**: Tracks current index and last rotation time in `rotation-state.txt`

## 🛠️ Usage

### Manual Run (Check & Rotate if Due)

```bash
cd .automation/gif-rotator
go run main.go
```

### Force Rotation (Immediate)

```bash
cd .automation/gif-rotator
go run main.go --force
```

### Build Binary

```bash
cd .automation/gif-rotator
go build -o gif-rotator.exe main.go
./gif-rotator.exe
```

## ⚙️ Configuration

Edit constants in `main.go`:

```go
const (
    rotationHours  = 5              // Hours between rotations
    readmePath     = "../../README.md"
    gifsDir        = "../../static/intro-gifs"
    currentGifPath = "../../static/intro.gif"
)
```

## 🤖 GitHub Actions Setup

Create `.github/workflows/rotate-gif.yml`:

```yaml
name: Rotate Intro GIF

on:
  schedule:
    - cron: "0 */5 * * *" # Every 5 hours
  workflow_dispatch: # Manual trigger

jobs:
  rotate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: "1.21"

      - name: Run GIF Rotator
        run: |
          cd .automation/gif-rotator
          go run main.go

      - name: Commit Changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GIF Rotator Bot"
          git add static/intro.gif .automation/gif-rotator/rotation-state.txt
          git diff --staged --quiet || git commit -m "🎬 Auto-rotate intro GIF"
          git push
```

## 📊 Features

- ✅ **Automatic Rotation**: Changes GIF every 5 hours
- ✅ **State Persistence**: Remembers position across runs
- ✅ **Circular Queue**: Cycles through all GIFs endlessly
- ✅ **Force Mode**: Manual rotation on demand
- ✅ **Logging**: Detailed execution logs
- ✅ **Error Handling**: Robust error management

## 🎯 Setup Steps

1. **Create GIF directory**:

   ```bash
   mkdir static/intro-gifs
   ```

2. **Add your GIFs**:
   - Place multiple GIF files in `static/intro-gifs/`
   - Name them descriptively (e.g., `intro-1.gif`, `intro-2.gif`)

3. **Run first rotation**:

   ```bash
   cd .automation/gif-rotator
   go run main.go --force
   ```

4. **Set up automation** (optional):
   - Add GitHub Actions workflow (see above)
   - Or set up a cron job on your server

## 📝 Example Output

```
2026/02/15 18:59:12 🎬 GIF Rotator Starting...
2026/02/15 18:59:12 Found 4 GIF files: [intro-1.gif intro-2.gif intro-3.gif intro-4.gif]
2026/02/15 18:59:12 Loaded state: index=1, last rotation=2026-02-15T13:59:12+05:30
2026/02/15 18:59:12 📊 Current GIF: intro-2.gif (2/4)
2026/02/15 18:59:12 Time since last rotation: 5.00 hours (threshold: 5 hours)
2026/02/15 18:59:12 ⏰ Time to rotate!
2026/02/15 18:59:12 Rotating to GIF 3/4: intro-3.gif
2026/02/15 18:59:12 ✅ Successfully rotated to: intro-3.gif
2026/02/15 18:59:12 ✨ GIF Rotator completed successfully
```

## 🔧 Troubleshooting

**No GIFs found?**

- Ensure `static/intro-gifs/` directory exists
- Check that GIF files have `.gif` extension

**State file issues?**

- Delete `rotation-state.txt` to reset
- Will auto-generate on next run

**Path errors?**

- Run from `.automation/gif-rotator/` directory
- Or adjust relative paths in constants
