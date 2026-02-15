package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const (
	// Configuration
	readmePath      = "../../README.md"
	gifsDir         = "../../static/intro-gifs"
	currentGifPath  = "../../static/intro.gif"
	rotationHours   = 5
	gifLinePrefix   = "        <img src=\"static/intro.gif\""
	stateFile       = "rotation-state.txt"
)

// GifRotator manages the rotation of intro GIFs
type GifRotator struct {
	gifFiles      []string
	currentIndex  int
	lastRotation  time.Time
}

// NewGifRotator creates a new GIF rotator instance
func NewGifRotator() (*GifRotator, error) {
	gr := &GifRotator{
		gifFiles: []string{},
	}
	
	// Load available GIF files
	if err := gr.loadGifFiles(); err != nil {
		return nil, fmt.Errorf("failed to load GIF files: %w", err)
	}
	
	// Load state
	if err := gr.loadState(); err != nil {
		log.Printf("No previous state found, starting fresh: %v", err)
		gr.currentIndex = 0
		gr.lastRotation = time.Now()
	}
	
	return gr, nil
}

// loadGifFiles scans the gifs directory for available GIF files
func (gr *GifRotator) loadGifFiles() error {
	entries, err := os.ReadDir(gifsDir)
	if err != nil {
		return fmt.Errorf("failed to read gifs directory: %w", err)
	}
	
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(strings.ToLower(entry.Name()), ".gif") {
			gr.gifFiles = append(gr.gifFiles, entry.Name())
		}
	}
	
	if len(gr.gifFiles) == 0 {
		return fmt.Errorf("no GIF files found in %s", gifsDir)
	}
	
	log.Printf("Found %d GIF files: %v", len(gr.gifFiles), gr.gifFiles)
	return nil
}

// loadState loads the rotation state from file
func (gr *GifRotator) loadState() error {
	data, err := os.ReadFile(stateFile)
	if err != nil {
		return err
	}
	
	var index int
	var timestamp int64
	_, err = fmt.Sscanf(string(data), "%d\n%d", &index, &timestamp)
	if err != nil {
		return err
	}
	
	gr.currentIndex = index % len(gr.gifFiles)
	gr.lastRotation = time.Unix(timestamp, 0)
	
	log.Printf("Loaded state: index=%d, last rotation=%s", gr.currentIndex, gr.lastRotation.Format(time.RFC3339))
	return nil
}

// saveState saves the current rotation state to file
func (gr *GifRotator) saveState() error {
	data := fmt.Sprintf("%d\n%d", gr.currentIndex, gr.lastRotation.Unix())
	return os.WriteFile(stateFile, []byte(data), 0644)
}

// shouldRotate checks if it's time to rotate the GIF
func (gr *GifRotator) shouldRotate() bool {
	elapsed := time.Since(gr.lastRotation)
	hoursElapsed := elapsed.Hours()
	
	log.Printf("Time since last rotation: %.2f hours (threshold: %d hours)", hoursElapsed, rotationHours)
	return hoursElapsed >= rotationHours
}

// rotateGif performs the GIF rotation
func (gr *GifRotator) rotateGif() error {
	// Move to next GIF
	gr.currentIndex = (gr.currentIndex + 1) % len(gr.gifFiles)
	gr.lastRotation = time.Now()
	
	currentGif := gr.gifFiles[gr.currentIndex]
	log.Printf("Rotating to GIF %d/%d: %s", gr.currentIndex+1, len(gr.gifFiles), currentGif)
	
	// Copy the selected GIF to intro.gif
	sourcePath := filepath.Join(gifsDir, currentGif)
	if err := copyFile(sourcePath, currentGifPath); err != nil {
		return fmt.Errorf("failed to copy GIF: %w", err)
	}
	
	// Save state
	if err := gr.saveState(); err != nil {
		return fmt.Errorf("failed to save state: %w", err)
	}
	
	log.Printf("✅ Successfully rotated to: %s", currentGif)
	return nil
}

// Run executes the rotation logic
func (gr *GifRotator) Run(force bool) error {
	if force {
		log.Println("🔄 Force rotation requested")
		return gr.rotateGif()
	}
	
	if gr.shouldRotate() {
		log.Println("⏰ Time to rotate!")
		return gr.rotateGif()
	}
	
	log.Println("⏸️  Not time to rotate yet")
	nextRotation := gr.lastRotation.Add(time.Duration(rotationHours) * time.Hour)
	log.Printf("Next rotation scheduled for: %s (in %.2f hours)", 
		nextRotation.Format(time.RFC3339), 
		time.Until(nextRotation).Hours())
	
	return nil
}

// copyFile copies a file from src to dst
func copyFile(src, dst string) error {
	data, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	return os.WriteFile(dst, data, 0644)
}

// getCurrentGifInfo returns information about the current GIF
func (gr *GifRotator) getCurrentGifInfo() string {
	if gr.currentIndex >= len(gr.gifFiles) {
		return "Unknown"
	}
	return fmt.Sprintf("%s (%d/%d)", gr.gifFiles[gr.currentIndex], gr.currentIndex+1, len(gr.gifFiles))
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	log.Println("🎬 GIF Rotator Starting...")
	
	// Check for force flag
	force := len(os.Args) > 1 && os.Args[1] == "--force"
	
	// Create rotator
	rotator, err := NewGifRotator()
	if err != nil {
		log.Fatalf("❌ Failed to create rotator: %v", err)
	}
	
	log.Printf("📊 Current GIF: %s", rotator.getCurrentGifInfo())
	
	// Run rotation logic
	if err := rotator.Run(force); err != nil {
		log.Fatalf("❌ Rotation failed: %v", err)
	}
	
	log.Println("✨ GIF Rotator completed successfully")
}
