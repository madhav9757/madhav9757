# 🎬 GIF Rotation System - Complete Overview

## 📋 What Was Created

A fully automated system to rotate your README intro GIF every 5 hours, written in Go.

### Directory Structure

```
madhav9757/
├── .automation/
│   ├── SETUP.md                          # Detailed setup guide
│   └── gif-rotator/
│       ├── main.go                       # Core rotation logic (Go)
│       ├── go.mod                        # Go module file
│       ├── README.md                     # Rotator documentation
│       └── rotation-state.txt            # Auto-generated state file
│
├── .github/
│   └── workflows/
│       └── rotate-gif.yml                # GitHub Actions automation
│
├── static/
│   ├── intro.gif                         # Current active GIF (auto-updated)
│   └── intro-gifs/                       # GIF pool directory
│       └── README.md                     # Usage instructions
│
├── .gitignore                            # Git ignore rules
└── test-gif-rotator.bat                  # Quick test script (Windows)
```

## 🎯 How It Works

### 1. **GIF Pool System**

- Place multiple GIF files in `static/intro-gifs/`
- The rotator scans this directory for all `.gif` files
- Rotates through them in alphabetical order

### 2. **Rotation Logic** (main.go)

- **Checks** if 5 hours have passed since last rotation
- **Selects** the next GIF from the pool (circular queue)
- **Copies** selected GIF to `static/intro.gif`
- **Saves** state (current index + timestamp) to `rotation-state.txt`
- **Logs** all operations with detailed output

### 3. **State Persistence**

- Tracks current GIF index and last rotation time
- Survives restarts and system reboots
- Ensures smooth continuation across runs

### 4. **Automation Options**

#### Option A: GitHub Actions (Recommended)

- **File**: `.github/workflows/rotate-gif.yml`
- **Schedule**: Runs every 5 hours automatically
- **Features**:
  - Auto-commits changes
  - Manual trigger available
  - Smart change detection
  - No local setup needed

#### Option B: Local Automation

- **Windows Task Scheduler**: Run every 5 hours
- **Cron Job** (WSL/Linux): `0 */5 * * *`

## 🚀 Quick Start Guide

### Step 1: Add Your GIFs

```bash
# Add your GIF files to the pool directory
# You can do this through your file explorer or command line
# Example: Copy files to static/intro-gifs/
# - intro-1.gif (already exists)
# - intro-2.gif
# - intro-3.gif
# - intro-4.gif
# Add as many as you want!
```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "🎬 Add GIF rotation automation"
git push
```

### Step 3: Enable GitHub Actions

- Go to your repository **Settings** → **Actions** → **General**
- Ensure "Allow all actions and reusable workflows" is enabled
- The workflow will automatically run every 5 hours
- Or trigger manually from the **Actions** tab → **🎬 Rotate Intro GIF** → **Run workflow**

## 📊 Features

✅ **Automatic Rotation**: Changes GIF every 5 hours  
✅ **State Persistence**: Remembers position across runs  
✅ **Circular Queue**: Cycles through all GIFs endlessly  
✅ **Force Mode**: `--force` flag for immediate rotation  
✅ **Smart Detection**: Only commits if GIF actually changed  
✅ **Detailed Logging**: Know exactly what's happening  
✅ **Error Handling**: Robust error management  
✅ **Zero Dependencies**: Pure Go, no external packages  
✅ **Cross-Platform**: Works on Windows, Linux, macOS

## 🎮 Usage Commands

### Check & Rotate (if due)

```bash
cd .automation/gif-rotator
go run main.go
```

### Force Immediate Rotation

```bash
cd .automation/gif-rotator
go run main.go --force
```

### Build Executable

```bash
cd .automation/gif-rotator
go build -o gif-rotator.exe main.go
./gif-rotator.exe
```

### View Current Status

```bash
cd .automation/gif-rotator
go run main.go
# Shows: current GIF, time since last rotation, next rotation time
```

## 🔧 Configuration

Edit `main.go` constants to customize:

```go
const (
    rotationHours  = 5    // Change to 3, 6, 12, 24, etc.
    readmePath     = "../../README.md"
    gifsDir        = "../../static/intro-gifs"
    currentGifPath = "../../static/intro.gif"
)
```

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

## 🎨 GIF Recommendations

### Best Practices

- **Format**: GIF (`.gif` extension)
- **Size**: Max 5MB per GIF for fast loading
- **Dimensions**: Consistent size (e.g., 320px width)
- **Style**: Match your README aesthetic
- **Quantity**: 3-10 GIFs for good variety

### Where to Find GIFs

- Create your own with screen recording tools
- Use online GIF makers (Giphy, Tenor, etc.)
- Generate with AI tools
- Convert videos to GIFs

## 🔍 Monitoring

### GitHub Actions

- Go to **Actions** tab in your repository
- Look for "🎬 Rotate Intro GIF" workflow
- View run history and logs

### Local Logs

- Output is printed to console when running
- Check git log: `git log --oneline --grep="Auto-rotate"`

### State File

```powershell
# View current state
cat .automation\gif-rotator\rotation-state.txt
# Format: <index>\n<unix_timestamp>
```

## 🐛 Troubleshooting

### "No GIF files found"

- Ensure `static/intro-gifs/` contains `.gif` files
- Check file extensions are lowercase `.gif`
- Run: `ls static\intro-gifs\*.gif`

### "Failed to copy GIF"

- Check file permissions
- Ensure you're running from correct directory
- Verify paths in `main.go` are correct

### GitHub Actions not running

- Check `.github/workflows/rotate-gif.yml` exists
- Ensure Actions are enabled in repository settings
- Check Actions tab for error logs
- Verify repository has write permissions

### State file issues

- Delete `rotation-state.txt` to reset
- Will auto-regenerate on next run
- Default starts at index 0

## 🎯 Next Steps

1. **Add More GIFs**: Drop files in `static/intro-gifs/`
2. **Test Locally**: Run `test-gif-rotator.bat`
3. **Push to GitHub**: Let Actions handle automation
4. **Monitor**: Check Actions tab after 5 hours
5. **Customize**: Adjust rotation interval if needed

## 📚 Additional Resources

- **Setup Guide**: `.automation/SETUP.md`
- **Rotator Docs**: `.automation/gif-rotator/README.md`
- **GIF Pool Info**: `static/intro-gifs/README.md`
- **Workflow File**: `.github/workflows/rotate-gif.yml`

## 💡 Pro Tips

1. **Test First**: Always run `--force` mode to test before enabling automation
2. **Consistent Sizing**: Keep all GIFs the same dimensions for smooth transitions
3. **Git Tracking**: The state file IS tracked (so automation works across runs)
4. **Manual Override**: You can always manually replace `intro.gif` - next rotation will continue from there
5. **Backup**: Keep original GIFs in `intro-gifs/` - `intro.gif` is auto-generated

## 🎉 You're All Set!

The GIF rotation system is ready to go. Just add your GIFs and let it run!

**Questions?** Check the documentation files or review the code in `main.go`.
