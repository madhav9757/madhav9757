# GIF Pool Directory

Place your intro GIF files here. The rotator will cycle through all `.gif` files in this directory.

## Naming Convention

Use descriptive names:

- `intro-1.gif`
- `intro-2.gif`
- `intro-coding.gif`
- `intro-terminal.gif`
- etc.

## Requirements

- **Format**: GIF files only (`.gif` extension)
- **Size**: Recommended max 5MB per GIF for fast loading
- **Dimensions**: Consistent dimensions recommended (e.g., 320px width)
- **Style**: Match your README aesthetic

## Current Setup

The rotator will:

1. Scan this directory for all `.gif` files
2. Rotate through them in alphabetical order
3. Copy the selected GIF to `static/intro.gif` every 5 hours
