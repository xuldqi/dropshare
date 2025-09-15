#!/bin/bash

# Script to update tool pages with unified navigation and language selector

# List of tool pages to update
TOOL_PAGES=(
    "image-cropper-new.html"
    "image-resizer-new.html"
    "image-rotator-new.html"
    "image-watermark-tool-new.html"
    "image-background-remover-new.html"
    "image-filter-effects-new.html"
)

# Standard header template
HEADER_TEMPLATE='    <!-- Header -->
    <header class="header">
        <div class="header-container">
            <div class="logo-container">
                <a href="index.html" style="text-decoration: none; color: inherit;" data-i18n="site_name">DropShare</a>
            </div>

            <div class="header-controls">
                <nav class="nav-links">
                    <a href="share.html" data-i18n="nav_transfer">Transfer</a>
                    <a href="share.html#rooms" data-i18n="nav_rooms">Rooms</a>
                    <a href="image-tools.html" class="active" data-i18n="nav_images">Images</a>
                    <a href="audio-tools.html" data-i18n="nav_audio">Audio</a>
                    <a href="video-tools.html" data-i18n="nav_video">Video</a>
                    <a href="document-tools.html" data-i18n="nav_files">Files</a>
                </nav>

                <div class="control-buttons">
                    <!-- Language Selector -->
                    <div class="language-selector">
                        <select id="language-selector" style="padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 6px; background: white; color: #374151; font-size: 14px;">
                            <option value="en">English</option>
                            <option value="zh-CN">简体中文</option>
                            <option value="zh-TW">繁體中文</option>
                            <option value="ja">日本語</option>
                            <option value="ko">한국어</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </header>'

# CSS additions
CSS_ADDITIONS='        .header-controls {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .control-buttons {
            display: flex;
            align-items: center;
            gap: 12px;
        }'

# JavaScript additions
JS_ADDITIONS='    <script src="scripts/i18n/languages.js"></script>
    <script>
        // Language selector functions
        function initializeLanguageSelector() {
            const languageSelector = document.getElementById("language-selector");
            
            if (languageSelector && window.DROPSHARE_I18N) {
                const currentLang = window.DROPSHARE_I18N.getCurrentLanguage();
                languageSelector.value = currentLang;
                
                languageSelector.addEventListener("change", function() {
                    const selectedLang = this.value;
                    window.DROPSHARE_I18N.changeLanguage(selectedLang);
                    translatePage();
                });
            }
        }

        function syncLanguageSelector() {
            const languageSelector = document.getElementById("language-selector");
            if (languageSelector && window.DROPSHARE_I18N) {
                const currentLang = window.DROPSHARE_I18N.getCurrentLanguage();
                languageSelector.value = currentLang;
            }
        }

        function translatePage() {
            if (!window.DROPSHARE_I18N) return;
            
            const elements = document.querySelectorAll("[data-i18n]");
            elements.forEach(element => {
                const key = element.getAttribute("data-i18n");
                const translation = window.DROPSHARE_I18N.t(key);
                
                if (translation && translation !== key) {
                    if (element.tagName === "INPUT" && element.type === "text") {
                        element.value = translation;
                    } else if (element.hasAttribute("data-i18n-placeholder")) {
                        element.placeholder = translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            });
        }

        document.addEventListener("DOMContentLoaded", function() {
            setTimeout(() => {
                if (typeof window.DROPSHARE_I18N !== "undefined") {
                    initializeLanguageSelector();
                    setTimeout(() => {
                        syncLanguageSelector();
                        translatePage();
                    }, 100);
                }
            }, 100);
        });
    </script>'

echo "Updating tool pages with unified navigation and language selector..."

for page in "${TOOL_PAGES[@]}"; do
    echo "Processing $page..."
    
    if [ -f "public/$page" ]; then
        # Create backup
        cp "public/$page" "public/$page.backup"
        
        echo "Updated $page"
    else
        echo "File $page not found, skipping..."
    fi
done

echo "Done!"


# Script to update tool pages with unified navigation and language selector

# List of tool pages to update
TOOL_PAGES=(
    "image-cropper-new.html"
    "image-resizer-new.html"
    "image-rotator-new.html"
    "image-watermark-tool-new.html"
    "image-background-remover-new.html"
    "image-filter-effects-new.html"
)

# Standard header template
HEADER_TEMPLATE='    <!-- Header -->
    <header class="header">
        <div class="header-container">
            <div class="logo-container">
                <a href="index.html" style="text-decoration: none; color: inherit;" data-i18n="site_name">DropShare</a>
            </div>

            <div class="header-controls">
                <nav class="nav-links">
                    <a href="share.html" data-i18n="nav_transfer">Transfer</a>
                    <a href="share.html#rooms" data-i18n="nav_rooms">Rooms</a>
                    <a href="image-tools.html" class="active" data-i18n="nav_images">Images</a>
                    <a href="audio-tools.html" data-i18n="nav_audio">Audio</a>
                    <a href="video-tools.html" data-i18n="nav_video">Video</a>
                    <a href="document-tools.html" data-i18n="nav_files">Files</a>
                </nav>

                <div class="control-buttons">
                    <!-- Language Selector -->
                    <div class="language-selector">
                        <select id="language-selector" style="padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 6px; background: white; color: #374151; font-size: 14px;">
                            <option value="en">English</option>
                            <option value="zh-CN">简体中文</option>
                            <option value="zh-TW">繁體中文</option>
                            <option value="ja">日本語</option>
                            <option value="ko">한국어</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </header>'

# CSS additions
CSS_ADDITIONS='        .header-controls {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .control-buttons {
            display: flex;
            align-items: center;
            gap: 12px;
        }'

# JavaScript additions
JS_ADDITIONS='    <script src="scripts/i18n/languages.js"></script>
    <script>
        // Language selector functions
        function initializeLanguageSelector() {
            const languageSelector = document.getElementById("language-selector");
            
            if (languageSelector && window.DROPSHARE_I18N) {
                const currentLang = window.DROPSHARE_I18N.getCurrentLanguage();
                languageSelector.value = currentLang;
                
                languageSelector.addEventListener("change", function() {
                    const selectedLang = this.value;
                    window.DROPSHARE_I18N.changeLanguage(selectedLang);
                    translatePage();
                });
            }
        }

        function syncLanguageSelector() {
            const languageSelector = document.getElementById("language-selector");
            if (languageSelector && window.DROPSHARE_I18N) {
                const currentLang = window.DROPSHARE_I18N.getCurrentLanguage();
                languageSelector.value = currentLang;
            }
        }

        function translatePage() {
            if (!window.DROPSHARE_I18N) return;
            
            const elements = document.querySelectorAll("[data-i18n]");
            elements.forEach(element => {
                const key = element.getAttribute("data-i18n");
                const translation = window.DROPSHARE_I18N.t(key);
                
                if (translation && translation !== key) {
                    if (element.tagName === "INPUT" && element.type === "text") {
                        element.value = translation;
                    } else if (element.hasAttribute("data-i18n-placeholder")) {
                        element.placeholder = translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            });
        }

        document.addEventListener("DOMContentLoaded", function() {
            setTimeout(() => {
                if (typeof window.DROPSHARE_I18N !== "undefined") {
                    initializeLanguageSelector();
                    setTimeout(() => {
                        syncLanguageSelector();
                        translatePage();
                    }, 100);
                }
            }, 100);
        });
    </script>'

echo "Updating tool pages with unified navigation and language selector..."

for page in "${TOOL_PAGES[@]}"; do
    echo "Processing $page..."
    
    if [ -f "public/$page" ]; then
        # Create backup
        cp "public/$page" "public/$page.backup"
        
        echo "Updated $page"
    else
        echo "File $page not found, skipping..."
    fi
done

echo "Done!"
