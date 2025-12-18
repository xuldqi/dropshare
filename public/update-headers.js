const fs = require('fs');
const path = require('path');

// Read the template from file
const templatePath = path.join(__dirname, 'header-template.html');
let headerTemplate = '';

try {
    headerTemplate = fs.readFileSync(templatePath, 'utf8');
} catch (err) {
    console.error('Error reading header-template.html:', err);
    process.exit(1);
}

// Pages to update
const pagesToUpdate = [
    // Audio Tools
    'audio-compressor-real.html',
    'audio-converter-ffmpeg-stable.html',
    'audio-converter-real.html',
    'audio-trimmer-real.html',
    'audio-merger-real.html',
    'audio-effects-real.html',
    'volume-normalizer-real.html',
    'bitrate-converter-real.html',
    'audio-test.html',

    // Video Tools
    'video-compressor-real.html',
    'video-converter-real.html',
    'video-trimmer-real.html',
    'video-merger-real.html',
    'video-effects-real.html',
    'resolution-changer-real.html',
    'frame-rate-converter-real.html',
    'subtitle-editor-real.html',

    // Image Tools
    'image-compressor.html',
    'image-converter.html',
    'image-resizer.html',
    'image-cropper.html',
    'image-filter-effects.html',
    'image-rotator.html',
    'image-watermark-tool.html',
    'image-background-remover.html',

    // Document Tools
    'pdf-compressor-real.html',
    'document-converter-real.html',
    'pdf-merger-real.html',
    'text-extractor-real.html',
    'pdf-splitter-real.html',
    'csv-to-xlsx.html',
    'xlsx-to-csv.html',
    'metadata-editor-real.html',

    // Other Pages
    'audio-tools.html',
    'video-tools.html',
    'document-tools.html',
    'image-tools.html',
    'rooms-improved.html',
    'share.html',
    'about.html',
    'privacy.html',
    'terms.html',
    'faq.html',
    'blog.html'
];

const publicDir = __dirname;

function updateHeader(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Check for existing header
        const headerRegex = /<header[^>]*>[\s\S]*?<\/header>/i;

        if (headerRegex.test(content)) {
            // Replace existing header with template
            content = content.replace(headerRegex, headerTemplate);
            console.log(`✓ Updated header in: ${path.basename(filePath)}`);
        } else {
            // Insert at the beginning of body
            content = content.replace(/(<body[^>]*>)/i, `$1\n${headerTemplate}\n`);
            console.log(`✓ Added header to: ${path.basename(filePath)}`);
        }

        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        console.error(`✗ Error updating ${path.basename(filePath)}: ${error.message}`);
        return false;
    }
}

console.log('Starting batch header update...\n');

let updated = 0;
let failed = 0;

pagesToUpdate.forEach(page => {
    const filePath = path.join(publicDir, page);
    if (fs.existsSync(filePath)) {
        if (updateHeader(filePath)) {
            updated++;
        } else {
            failed++;
        }
    } else {
        console.log(`⚠ File not found: ${page}`);
    }
});

console.log(`\n✨ Update complete!`);
console.log(`   Updated: ${updated} files`);
console.log(`   Failed: ${failed} files`);