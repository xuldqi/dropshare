const fs = require('fs');
const path = require('path');

// List of files to update (same as update-headers.js plus others if needed)
const pagesToUpdate = [
    'image-converter-new.html',
    'image-compressor-new.html',
    'image-resizer-new.html',
    'image-cropper-new.html',
    'image-filter-effects-new.html',
    'image-rotator-new.html',
    'image-watermark-tool-new.html',
    'image-background-remover-new.html',
    'audio-compressor-real.html',
    'audio-converter-ffmpeg-stable.html',
    'audio-trimmer-real.html',
    'audio-merger-real.html',
    'audio-effects-real.html',
    'volume-normalizer-real.html',
    'bitrate-converter-real.html',
    'audio-test.html',
    'video-compressor-real.html',
    'video-converter-real.html',
    'video-trimmer-real.html',
    'video-merger-real.html',
    'video-effects-real.html',
    'resolution-changer-real.html',
    'frame-rate-converter-real.html',
    'subtitle-editor-real.html',
    'pdf-compressor-real.html',
    'document-converter-real.html',
    'pdf-merger-real.html',
    'text-extractor-real.html',
    'pdf-splitter-real.html',
    'csv-to-xlsx.html',
    'xlsx-to-csv.html',
    'metadata-editor-real.html'
];

// Base directory
const publicDir = path.join(__dirname, 'public');

let updatedCount = 0;

pagesToUpdate.forEach(file => {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if file has uploadArea
        if (content.includes('id="uploadArea"')) {
            // Replace opening div tag
            // Regex handles potential extra spaces or existing attributes, but simplifies to the most common case found
            // Case 1: <div class="upload-area" id="uploadArea">
            // Case 2: <div id="uploadArea" class="upload-area">

            let newContent = content;

            // Add onclick if not present
            if (!content.includes('onclick="document.getElementById(\'fileInput\').click()"')) {
                // Target the specific div string we saw in grep
                const targetStr = '<div class="upload-area" id="uploadArea">';
                const replacementStr = '<div class="upload-area" id="uploadArea" onclick="document.getElementById(\'fileInput\').click()">';

                newContent = newContent.replace(targetStr, replacementStr);

                // Also update the file input to stop propagation so clicking it doesn't trigger the parent
                const inputTarget = '<input type="file" id="fileInput"';
                const inputReplacement = '<input type="file" id="fileInput" onclick="event.stopPropagation()"';

                if (!content.includes('onclick="event.stopPropagation()"')) {
                    newContent = newContent.replace(inputTarget, inputReplacement);
                }

                if (newContent !== content) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                    console.log(`✓ Fixed upload click in: ${file}`);
                    updatedCount++;
                } else {
                    // Try alternate order just in case
                    const targetStr2 = '<div id="uploadArea" class="upload-area">';
                    const replacementStr2 = '<div id="uploadArea" class="upload-area" onclick="document.getElementById(\'fileInput\').click()">';
                    newContent = newContent.replace(targetStr2, replacementStr2);

                    if (newContent !== content) {
                        fs.writeFileSync(filePath, newContent, 'utf8');
                        console.log(`✓ Fixed upload click in: ${file} (var 2)`);
                        updatedCount++;
                    } else {
                        console.log(`⚠ Could not match upload div in: ${file}`);
                    }
                }
            } else {
                console.log(`- Already fixed: ${file}`);
            }
        } else {
            console.log(`- No upload area found in: ${file}`);
        }
    } else {
        console.log(`! File not found: ${file}`);
    }
});

console.log(`\n✨ Fixed ${updatedCount} files.`);
