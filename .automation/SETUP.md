# GIF Rotator - Quick Setup & Usage Guide

## 🚀 Quick Start

### 1. Add Your GIFs

```powershell
# Copy your GIF files to the intro-gifs directory
# For example:
Copy-Item "path\to\your\gif1.gif" "static\intro-gifs\intro-1.gif"
Copy-Item "path\to\your\gif2.gif" "static\intro-gifs\intro-2.gif"
Copy-Item "path\to\your\gif3.gif" "static\intro-gifs\intro-3.gif"
```

### 2. Test the Rotator

```powershell
# Navigate to the rotator directory
cd .automation\gif-rotator

# Run a test (force rotation)
go run main.go --force

# Check the output - should see success message
```

### 3. Verify

```powershell
# Check that intro.gif was updated
ls -l ..\..\static\intro.gif

# Check the state file was created
cat rotation-state.txt
```

## 🔄 Usage Commands

### Check if rotation is due (and rotate if needed)

```powershell
cd .automation\gif-rotator
go run main.go
```

### Force immediate rotation

```powershell
cd .automation\gif-rotator
go run main.go --force
```

### Build executable

```powershell
cd .automation\gif-rotator
go build -o gif-rotator.exe main.go
.\gif-rotator.exe
```

## 🤖 Automation (GitHub Actions)

The workflow is already set up in `.github/workflows/rotate-gif.yml`.

**How it works:**

- Runs automatically every 5 hours
- Can be triggered manually from GitHub Actions tab
- Commits changes automatically if a new GIF is selected

**No extra setup required!** Just push your changes to GitHub and it will start working.

## 📊 Monitoring

### Check current status (Locally)

```bash
cd .automation/gif-rotator
go run main.go
# Will show: current GIF, time since last rotation, next rotation time
```

### View rotation history (GitHub)

- Go to the **Actions** tab in your repository
- Select **Rotate Intro GIF** workflow
- View the run history and logs

## 🔧 Configuration

Edit `.automation/gif-rotator/main.go` to customize:

```go
const (
    rotationHours  = 5    // Change rotation frequency
    // Other paths are relative and should work as-is
)
```

## 🎯 Example Workflow

1. **Initial Setup**:

   ```bash
   # Add your GIF files to static/intro-gifs/
   # The system will automatically pick them up
   ```

2. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Add intro GIFs"
   git push
   ```

3. **Let it Run**:
   - GitHub Actions will handle the rest!
   - It will check every 5 hours and rotate if needed

4. **Add More GIFs Anytime**:
   - Just drop new `.gif` files in `static/intro-gifs/`
   - Commit and push
   - They'll automatically be included in the next rotation

## 🐛 Troubleshooting

**"No GIF files found"**

- Make sure `static/intro-gifs/` contains `.gif` files
- Check file extensions are lowercase `.gif`

**GitHub Actions not working**

- Check workflow file is in `.github/workflows/`
- Ensure repository has Actions enabled
- Check Actions tab for error logs
