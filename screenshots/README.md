# Screenshots Directory

This directory contains screenshots of the JSONnymous application for documentation purposes.

## Required Screenshots

### 1. Main Interface (`main-interface.png`)
- **Description**: Main application window showing the sidebar navigation and overall layout
- **View**: Generate Data view active
- **Content**: Show empty state with clean interface
- **Size**: 1200x800px minimum
- **Theme**: Dark theme

### 2. Data Generation (`data-generation.png`)
- **Description**: Application in action generating data
- **View**: Generate Data view with loaded skeleton
- **Content**: Show filled configuration panel and generated data in preview
- **Size**: 1200x800px minimum
- **Theme**: Dark theme

### 3. Data Anonymization (`data-anonymization.png`)
- **Description**: Anonymization feature in use
- **View**: Anonymize Data view active
- **Content**: Show anonymization configuration and preview
- **Size**: 1200x800px minimum
- **Theme**: Dark theme

### 4. Configuration Panel (`configuration.png`)
- **Description**: Close-up of the configuration section
- **View**: Focus on left panel with file inputs and options
- **Content**: Show file selection and form elements
- **Size**: 600x800px minimum
- **Theme**: Dark theme

### 5. Generated Data Preview (`preview.png`)
- **Description**: Close-up of the preview panel with generated JSON
- **View**: Focus on right panel with JSON output
- **Content**: Show formatted JSON with syntax highlighting
- **Size**: 600x800px minimum
- **Theme**: Dark theme

## How to Capture Screenshots

### For Development
1. Launch the application: `npm start`
2. Navigate to different views and states
3. Use your system's screenshot tool:
   - **Windows**: Windows Key + Shift + S
   - **macOS**: Cmd + Shift + 4
   - **Linux**: Various tools (gnome-screenshot, scrot, etc.)

### Screenshot Guidelines
- Use consistent window size (1200x800px for full interface)
- Ensure dark theme is active
- Use realistic but non-sensitive sample data
- Capture in high resolution (at least 1x scale)
- Save as PNG format for best quality
- Crop to remove unnecessary desktop elements

### Sample Data for Screenshots
Use the example files in the `examples/` directory to populate the interface with realistic content for screenshots.

## File Naming Convention
- Use kebab-case for filenames
- Include descriptive names that match the README references
- Use `.png` extension for all screenshots
- Keep filenames short but descriptive

## Image Optimization
After capturing screenshots, consider optimizing them:
- Use tools like TinyPNG or ImageOptim
- Target file size under 500KB per image
- Maintain visual quality while reducing file size 