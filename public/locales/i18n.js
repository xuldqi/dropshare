(function(){
  const CONFIG_URL = '/locales/config.json';
  const STORAGE_KEY = 'preferred_language';

  const state = { config: null, current: null, cache: {} };

  async function loadConfig(){
    if(state.config) return state.config;
    const res = await fetch(CONFIG_URL, { cache: 'no-cache' });
    state.config = await res.json();
    return state.config;
  }

  function getSavedLanguage(config){
    const saved = localStorage.getItem(STORAGE_KEY);
    if(saved && config.supported_languages.includes(saved)) return saved;
    const nav = (navigator.language || 'en').toLowerCase();
    if(nav.startsWith('zh-tw') || nav === 'zh-hk') return 'zh-TW';
    if(nav.startsWith('zh')) return 'zh-CN';
    for(const l of config.supported_languages){ if(nav.startsWith(l.toLowerCase())) return l; }
    return config.default_language || 'en';
  }

  async function loadLanguage(lang){
    const config = await loadConfig();
    const target = config.supported_languages.includes(lang) ? lang : (config.fallback_language || 'en');
    if(state.cache[target]) return state.cache[target];
    const res = await fetch(`/locales/${target}.json`, { cache: 'no-cache' });
    const dict = await res.json();
    state.cache[target] = dict;
    return dict;
  }

  function getText(key){
    if(!key) return '';
    const dict = state.current ? state.cache[state.current] : null;
    if(dict && typeof dict[key] === 'string') return dict[key];
    const fallback = state.cache[(state.config && state.config.fallback_language) || 'en'];
    if(fallback && typeof fallback[key] === 'string') return fallback[key];
    return key; // fallback to key
  }

  function translateDom(){
    // text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getText(key);
      if(typeof val === 'string') el.textContent = val;
    });
    // placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = getText(key);
      if(typeof val === 'string') el.setAttribute('placeholder', val);
    });
    // title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const val = getText(key);
      if(typeof val === 'string') el.setAttribute('title', val);
    });
    // aria-label
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      const val = getText(key);
      if(typeof val === 'string') el.setAttribute('aria-label', val);
    });
    // value for inputs/buttons
    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const key = el.getAttribute('data-i18n-value');
      const val = getText(key);
      if(typeof val === 'string') el.value = val;
    });
  }

  async function applyTranslations(lang){
    await loadLanguage(lang);
    state.current = lang;
    document.documentElement.setAttribute('lang', lang);
    translateDom();
  }

  async function setLanguage(lang){
    const config = await loadConfig();
    if(!config.supported_languages.includes(lang)) lang = config.fallback_language || 'en';
    localStorage.setItem(STORAGE_KEY, lang);
    await applyTranslations(lang);
    // sync header selector
    const legacy = document.querySelector('#language-selector, select.language-selector');
    if (legacy && legacy.value !== lang) legacy.value = lang;
  }

  async function ensureHeaderSelector(){
    const existing = document.querySelector('#language-selector, select.language-selector');
    if (existing) return existing;
    const headerControls = document.querySelector('.header .header-controls')
      || document.querySelector('.header-container')
      || document.querySelector('.header')
      || document.body;
    const wrapper = document.createElement('div');
    wrapper.className = 'language-selector';
    const select = document.createElement('select');
    select.id = 'language-selector';
    select.style.cssText = 'padding:6px 12px;border:1px solid #d1d5db;border-radius:6px;background:#fff;color:#374151;font-size:14px;';
    wrapper.appendChild(select);
    if (headerControls) headerControls.appendChild(wrapper); else document.body.appendChild(wrapper);
    return select;
  }

  function bindSelector(sel){ sel.addEventListener('change', e => setLanguage(e.target.value)); }

  async function populateSelector(sel){
    const config = await loadConfig();
    sel.innerHTML = '';
    for(const code of config.supported_languages){
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = (config.language_names && config.language_names[code]) || code;
      if(code === state.current) opt.selected = true;
      sel.appendChild(opt);
    }
  }

  async function init(){
    await loadConfig();
    const initial = getSavedLanguage(state.config);
    const floating = document.getElementById('ds-lang-switcher');
    if (floating && floating.parentNode) floating.parentNode.removeChild(floating);
    const sel = await ensureHeaderSelector();
    bindSelector(sel);
    await setLanguage(initial);
    await populateSelector(sel);
  }

  window.DROPSHARE_I18N = { setLanguage, getCurrentLanguage: () => state.current, t: getText, getText };
  document.addEventListener('DOMContentLoaded', init);
})();

