# 🎬 GIF Rotator - Quick Reference Card

## 🚀 Quick Commands

### Trigger Rotation (GitHub Actions)

```bash
# Go to your GitHub repo:
# Actions tab → "🎬 Rotate Intro GIF" → "Run workflow"
# This will immediately rotate to the next GIF
```

### Check Current Status (Local - Optional)

```bash
cd .automation\gif-rotator
go run main.go
# Shows: current GIF, time until next rotation
```

### Force Rotation (Local - Optional)

```bash
cd .automation\gif-rotator
go run main.go --force
```

## 📁 Key Files

| File                                         | Purpose                           |
| -------------------------------------------- | --------------------------------- |
| `static/intro-gifs/`                         | **Add your GIFs here**            |
| `static/intro.gif`                           | Current active GIF (auto-updated) |
| `.automation/gif-rotator/main.go`            | Rotation logic                    |
| `.automation/gif-rotator/rotation-state.txt` | State tracking                    |
| `.github/workflows/rotate-gif.yml`           | GitHub Actions automation         |

## ⚙️ Configuration

Edit `main.go` line 11:

```go
rotationHours = 5    // Change to 3, 6, 12, 24, etc.
```

## 🎯 Setup Checklist

- [ ] Add GIF files to `static/intro-gifs/`
- [ ] Commit and push to GitHub
- [ ] Enable GitHub Actions in repo settings
- [ ] Trigger first rotation from Actions tab (optional)
- [ ] Wait 5 hours or check Actions tab for automatic runs

## 📊 How It Works

1. **Every 5 hours** (or on demand with `--force`)
2. **Selects next GIF** from `intro-gifs/` folder
3. **Copies to** `static/intro.gif`
4. **Saves state** to remember position
5. **GitHub Actions** commits the change

## 🔍 Troubleshooting

| Problem             | Solution                                 |
| ------------------- | ---------------------------------------- |
| No GIFs found       | Add `.gif` files to `static/intro-gifs/` |
| Go not found        | Install from https://go.dev/dl/          |
| Actions not running | Enable Actions in repo settings          |
| State issues        | Delete `rotation-state.txt` to reset     |

## 📚 Documentation

- **Overview**: `.automation/README.md`
- **Setup Guide**: `.automation/SETUP.md`
- **Architecture**: `.automation/ARCHITECTURE.md`
- **Rotator Docs**: `.automation/gif-rotator/README.md`

## 💡 Pro Tips

✅ Keep GIFs under 5MB  
✅ Use consistent dimensions  
✅ Test with `--force` before automation  
✅ Add 3-10 GIFs for variety  
✅ Name files: `intro-1.gif`, `intro-2.gif`, etc.

## 🎨 Current Status

Run this to see current state:

```bash
cd .automation\gif-rotator
go run main.go
```

Output shows:

- Current GIF (e.g., "intro-2.gif (2/4)")
- Time since last rotation
- Next rotation time

---

**Need help?** Check `.automation/README.md` for full documentation.
