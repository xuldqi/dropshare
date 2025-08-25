# Tool Sharing Integration Guide

This guide explains how to integrate file sharing functionality into DropShare tool pages, allowing users to share processed files directly to nearby devices.

## Overview

The sharing integration consists of three main components:

1. **Tool Share Integration System** (`scripts/tool-share-integration.js`) - Core sharing functionality
2. **Tool Helpers** (`scripts/tool-helpers.js`) - Helper functions for easy integration
3. **Share Modal UI** - User interface for selecting devices and files

## Quick Start

### 1. Include Required Scripts

Add these scripts to your tool page HTML:

```html
<!-- Core sharing scripts -->
<script src="scripts/network.js"></script>
<script src="scripts/ui.js"></script>
<script src="scripts/tool-share-integration.js"></script>
<script src="scripts/tool-helpers.js"></script>
```

### 2. Add Share Button Container

Add a container for the share button in your action buttons section:

```html
<div class="action-buttons">
    <button class="btn btn-success" id="downloadBtn">Download</button>
    <div id="shareButtonContainer" style="display: none;"></div>
    <button class="btn btn-secondary" id="resetBtn">Reset</button>
</div>
```

### 3. Initialize Sharing System

In your JavaScript, initialize the sharing system:

```javascript
// Initialize sharing when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.ToolHelpers) {
        window.ToolHelpers.initializeToolSharing({
            shareButtonText: 'Share Processed File',
            shareButtonContainer: '#shareButtonContainer'
        });
    }
});
```

### 4. Add Files to Share System

When your tool processes a file, add it to the sharing system:

```javascript
function processFile() {
    // ... your file processing logic ...
    
    // Add processed file to share system
    if (window.ToolHelpers && processedBlob) {
        window.ToolHelpers.addProcessedFileToShare(
            processedBlob,           // File blob
            'processed_file.jpg',    // File name
            'image/jpeg'             // MIME type
        );
    }
}
```

### 5. Handle Reset

Clear sharing system when user resets:

```javascript
function resetTool() {
    // ... your reset logic ...
    
    // Clear sharing system
    if (window.ToolHelpers) {
        window.ToolHelpers.hideShareButton();
    }
}
```

## Advanced Usage

### Working with Canvas Elements

For tools that work with HTML5 Canvas:

```javascript
function shareCanvasAsImage() {
    const canvas = document.getElementById('myCanvas');
    
    if (window.ToolHelpers) {
        window.ToolHelpers.shareCanvasAsImage(
            canvas,
            'processed_image.png',
            'png',    // format: 'png', 'jpeg', 'webp'
            0.9       // quality (for jpeg/webp)
        );
    }
}
```

### Working with Data URLs

For tools that generate data URLs:

```javascript
function shareDataUrl() {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    if (window.ToolHelpers) {
        window.ToolHelpers.shareDataUrlAsFile(
            dataUrl,
            'processed_image.jpg',
            'image/jpeg'
        );
    }
}
```

### Multiple Files

To share multiple processed files:

```javascript
function shareMultipleFiles() {
    // Add first file
    window.ToolHelpers.addProcessedFileToShare(blob1, 'file1.jpg', 'image/jpeg', false);
    
    // Add second file (clearPrevious = false to keep previous files)
    window.ToolHelpers.addProcessedFileToShare(blob2, 'file2.png', 'image/png', false);
    
    // Show share button after adding all files
    window.ToolHelpers.showShareButton();
}
```

## Integration Examples

### Example 1: Image Compressor Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>Image Compressor</title>
</head>
<body>
    <!-- Your tool UI -->
    <div class="action-buttons">
        <button id="downloadBtn">Download</button>
        <div id="shareButtonContainer" style="display: none;"></div>
        <button id="resetBtn">Reset</button>
    </div>

    <!-- Scripts -->
    <script src="scripts/tool-share-integration.js"></script>
    <script src="scripts/tool-helpers.js"></script>
    
    <script>
        let compressedCanvas;
        
        // Initialize sharing
        document.addEventListener('DOMContentLoaded', function() {
            window.ToolHelpers.initializeToolSharing({
                shareButtonText: 'Share Compressed Image'
            });
        });
        
        // Compress and share
        function compressImage() {
            // ... compression logic ...
            
            // Add to share system
            window.ToolHelpers.shareCanvasAsImage(
                compressedCanvas,
                'compressed_image.jpg',
                'jpeg',
                0.8
            );
        }
        
        // Reset
        function resetCompressor() {
            window.ToolHelpers.hideShareButton();
        }
    </script>
</body>
</html>
```

### Example 2: File Converter Integration

```javascript
class FileConverter {
    constructor() {
        // Initialize sharing
        if (window.ToolHelpers) {
            window.ToolHelpers.initializeToolSharing({
                shareButtonText: 'Share Converted Files',
                shareButtonContainer: '#shareButtonContainer'
            });
        }
    }
    
    async convertFiles(files) {
        const convertedFiles = [];
        
        // Process each file
        for (const file of files) {
            const converted = await this.convertFile(file);
            convertedFiles.push(converted);
            
            // Add to share system
            window.ToolHelpers.addProcessedFileToShare(
                converted.blob,
                converted.name,
                converted.type,
                convertedFiles.length === 1 // Clear previous only for first file
            );
        }
        
        // Show share button after all files are processed
        window.ToolHelpers.showShareButton();
    }
}
```

## Styling

### Custom Share Button Styles

The share button can be styled using CSS:

```css
.btn-share {
    background: #10b981 !important;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn-share:hover {
    background: #059669 !important;
    transform: translateY(-1px);
}
```

### Modal Customization

The share modal inherits styles but can be customized:

```css
.tool-share-modal .modal-content {
    max-width: 800px; /* Wider modal */
}

.tool-share-modal .peers-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}
```

## API Reference

### ToolHelpers Methods

#### `initializeToolSharing(options)`
Initialize the sharing system for a tool page.

**Parameters:**
- `options.shareButtonText` (string) - Text for the share button
- `options.shareButtonContainer` (string) - CSS selector for button container

#### `addProcessedFileToShare(file, fileName, fileType, clearPrevious = true)`
Add a processed file to the sharing system.

**Parameters:**
- `file` (Blob|File) - The file data
- `fileName` (string) - Name for the file
- `fileType` (string) - MIME type
- `clearPrevious` (boolean) - Whether to clear previously added files

#### `shareCanvasAsImage(canvas, fileName, format = 'png', quality = 0.9)`
Share a canvas as an image file.

#### `shareDataUrlAsFile(dataUrl, fileName, fileType)`
Share a data URL as a file.

#### `showShareButton()`
Show the share button.

#### `hideShareButton()`
Hide the share button and clear processed files.

### ToolShareSystem Methods

#### `showShareModal()`
Display the file sharing modal.

#### `closeShareModal()`
Close the sharing modal.

#### `clearProcessedFiles()`
Clear all processed files from the sharing system.

## Troubleshooting

### Common Issues

1. **Share button doesn't appear**
   - Ensure `tool-share-integration.js` is loaded
   - Check that `shareButtonContainer` exists
   - Verify files have been added to share system

2. **No devices shown in modal**
   - Ensure `network.js` and `ui.js` are loaded
   - Check that peer discovery is working
   - Make sure other devices have DropShare open

3. **Files don't transfer**
   - Verify file blob is valid
   - Check network connection
   - Ensure Events system is working

### Debug Mode

Enable debug logging:

```javascript
// Add this to see sharing system logs
console.log('Share system available:', !!window.toolShareSystem);
console.log('Tool helpers available:', !!window.ToolHelpers);
console.log('Processed files:', window.toolShareSystem?.processedFiles);
```

## Testing

Use the test page at `/test-sharing-integration.html` to verify integration:

1. Open the test page
2. Check integration status
3. Test file creation and sharing modal
4. Verify all components are working

## Best Practices

1. **Always check availability** - Verify sharing system is loaded before using
2. **Clear on reset** - Always clear sharing system when tool is reset
3. **Meaningful filenames** - Use descriptive names for shared files
4. **Proper MIME types** - Set correct MIME types for proper file handling
5. **Error handling** - Wrap sharing calls in try-catch blocks
6. **User feedback** - Provide feedback when files are added or shared

## Migration Guide

### For Existing Tools

To add sharing to an existing tool:

1. Add required script includes
2. Add share button container to HTML
3. Initialize sharing system
4. Add sharing calls after file processing
5. Clear sharing system on reset
6. Test thoroughly

The integration is designed to be non-breaking - existing tools will continue to work without sharing if the scripts aren't included.