// Core loader for page-specific translations

/**
 * Load page-specific translations
 * @param {string} page - The page name (e.g., 'about', 'faq', etc.)
 * @param {string} langCode - The language code
 * @returns {Promise<Object>} - The translations for the specified page and language
 */
export async function loadPageTranslations(page, langCode) {
  try {
    // Default to English if the requested language is not available
    let actualLangCode = langCode;
    
    // Try to load the translations for the specific page and language
    try {
      const module = await import(`../pages/${page}/${langCode}.js`);
      return module.default;
    } catch (e) {
      console.warn(`No translations available for ${page} page in language ${langCode}, falling back to English.`);
      actualLangCode = 'en';
      const module = await import(`../pages/${page}/${actualLangCode}.js`);
      return module.default;
    }
  } catch (e) {
    console.error(`Failed to load ${page} page translations:`, e);
    return {};
  }
}

/**
 * Merge base translations with page-specific translations
 * @param {Object} baseTranslations - The base translations
 * @param {Object} pageTranslations - The page-specific translations
 * @returns {Object} - The merged translations
 */
export function mergeTranslations(baseTranslations, pageTranslations) {
  return { ...baseTranslations, ...pageTranslations };
} 