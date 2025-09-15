#!/bin/bash

# Script to integrate sharing functionality into all tool pages

echo "🔗 Starting share integration..."
echo "======================"

# 1. Add sharing scripts to all HTML files
echo "📝 Step 1: Adding sharing scripts to HTML files..."
echo "-----------------------------------"

# HTML file patterns to process
HTML_FILES=(
    "public/*.html"
    "public/*-real.html"
    "public/*-new.html"
)

for pattern in "${HTML_FILES[@]}"; do
    for file in $pattern; do
        if [[ -f "$file" && ! "$file" =~ (share|rooms)\.html ]]; then
            echo "Processing file: $file"
            
            # Check if sharing script is already included
            if ! grep -q "add-share-integration.js" "$file"; then
                # Add sharing script and device selector before </body>
                sed -i.bak '/<\/body>/i\
    <!-- Share Integration -->\
    <script src="device-selector.js"></script>\
    <script src="add-share-integration.js"></script>
' "$file"
                echo "  ✅ Added sharing script"
            else
                echo "  ⏭️  Sharing script already exists"
            fi
        fi
    done
done恢复

echo ""

# 2. Add sharing feature card to homepage
echo "🏠 Step 2: Adding sharing feature to homepage..."
echo "------------------------------"

if [[ -f "public/index.html" ]]; then
    # Check if sharing card already exists
    if ! grep -q "Device Sharing" "public/index.html"; then
        # Add sharing card to tools grid
        cat >> temp_share_card.html << 'EOF'
            <div class="tool-card" onclick="window.open('/share.html', '_blank')" style="background: linear-gradient(135deg, #10b981, #059669); color: white; cursor: pointer;">
                <div class="tool-icon">📤</div>
                <h3>Device Sharing</h3>
                <p>Share files directly between devices on the same network</p>
                <div class="tool-features">
                    <span>P2P Transfer</span>
                    <span>No Upload Limits</span>
                    <span>Real-time</span>
                </div>
            </div>
EOF
        
        # Find first tool card position and insert
        if grep -q "tool-card" "public/index.html"; then
            # Insert sharing card before first tool-card
            sed -i.bak '/class="tool-card"/r temp_share_card.html' "public/index.html"
            echo "  ✅ Added sharing feature card"
        fi
        
        rm -f temp_share_card.html
    else
        echo "  ⏭️  Sharing feature already exists"
    fi
fi

echo ""

# 3. Update navigation menu
echo "🧭 Step 3: Updating navigation menu..."
echo "-------------------------"

# Files that need navigation updates
NAV_FILES=("public/index.html" "public/"*.html)

for file in "${NAV_FILES[@]}"; do
    if [[ -f "$file" && ! "$file" =~ (share|rooms)\.html ]]; then
        # Check if sharing link already exists
        if ! grep -q 'href.*share\.html' "$file"; then
            # Add sharing link to navigation
            sed -i.bak 's|<a href="index.html">Home</a>|<a href="index.html">Home</a>\
                <a href="share.html" style="color: #10b981;">Share</a>|' "$file"
            echo "  ✅ Updated navigation for $file"
        fi
    fi
done

echo ""

# 4. Add sharing button styles for tool pages
echo "🎨 Step 4: Adding sharing button styles..."
echo "-----------------------------"

# Create sharing styles file
cat > public/share-integration.css << 'EOF'
/* Sharing functionality styles */
.share-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    text-decoration: none;
    margin-left: 10px;
}

.share-button:hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.share-button:active {
    transform: translateY(0);
}

.share-card {
    position: relative;
    overflow: hidden;
}

.share-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
}

.share-card:hover::before {
    left: 100%;
}

/* Responsive design */
@media (max-width: 768px) {
    .share-button {
        padding: 10px 16px;
        font-size: 12px;
        margin-left: 5px;
        margin-top: 5px;
    }
}
EOF

# Add style file links to HTML files
for file in public/*.html; do
    if [[ -f "$file" ]]; then
        # Check if sharing styles are already included
        if ! grep -q "share-integration.css" "$file"; then
            # Add style links before </head>
            sed -i.bak '/<\/head>/i\
    <link rel="stylesheet" href="share-integration.css">\
    <link rel="stylesheet" href="device-selector.css">
' "$file"
        fi
    fi
done

echo "  ✅ Added sharing styles"
echo ""

# 5. Clean up backup files
echo "🧹 Step 5: Cleaning up backup files..."
echo "-------------------------"

find public/ -name "*.bak" -delete
echo "  ✅ Cleaned up backup files"
echo ""

# 6. Verify integration results
echo "🔍 Step 6: Verifying integration results..."
echo "-------------------------"

echo "Sharing script integration statistics:"
echo "- HTML files processed: $(grep -l "add-share-integration.js" public/*.html | wc -l)"
echo "- Style files integrated: $(grep -l "share-integration.css" public/*.html | wc -l)"
echo "- Navigation links added: $(grep -l 'href.*share\.html' public/*.html | wc -l)"

echo ""
echo "Main feature files:"
echo "- Sharing script: add-share-integration.js"
echo "- Sharing styles: public/share-integration.css"
echo "- Sharing page: public/share.html"
echo "- Room functionality: public/rooms.html"

echo ""
echo "======================"
echo "🎉 Sharing functionality integration completed!"
echo ""
echo "📋 New features:"
echo "1. All tool pages now have '📤 Share to Device' button"
echo "2. Homepage added sharing feature card"
echo "3. Navigation menu added sharing link"
echo "4. Processing results can be directly shared to other devices"
echo ""
echo "🔗 How to use:"
echo "1. After processing files in any tool, click 'Share to Device' button"
echo "2. Or directly access sharing page for P2P file transfer"
echo "3. Use room functionality for multi-device collaboration"
echo ""
echo "✨ Now dropshare truly implements the complete 'process + share' functionality!"
echo "======================"
