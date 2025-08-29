const fs = require('fs');
const path = require('path');

const languagesDir = path.resolve(__dirname, 'public/scripts/i18n/languages');
const enPath = path.join(languagesDir, 'en.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function isPlainObject(v) {
  return Object.prototype.toString.call(v) === '[object Object]';
}

function walk(obj, prefix, visit) {
  if (typeof obj === 'string') {
    visit(prefix, obj);
    return;
  }
  if (isPlainObject(obj)) {
    Object.keys(obj).forEach((k) => walk(obj[k], prefix ? `${prefix}.${k}` : k, visit));
  }
}

function buildMemory(en, target) {
  const memory = new Map(); // english string -> translated string
  walk(en, '', (keyPath, enVal) => {
    // Only learn from same key path if target has same path and is string
    const segs = keyPath.split('.');
    let cur = target;
    for (const s of segs) {
      if (!cur || !Object.prototype.hasOwnProperty.call(cur, s)) {
        cur = undefined;
        break;
      }
      cur = cur[s];
    }
    if (typeof cur === 'string' && typeof enVal === 'string' && cur.trim() && enVal.trim()) {
      if (!memory.has(enVal)) memory.set(enVal, cur);
    }
  });
  return memory;
}

function applyMemoryToSection(enSection, targetSection, memory) {
  if (!isPlainObject(enSection) || !isPlainObject(targetSection)) return { replaced: 0 };
  let replaced = 0;
  const dfs = (enNode, tgtNode) => {
    if (typeof enNode === 'string') {
      // If target is string and equals English (placeholder), try replace
      if (typeof tgtNode === 'string' && memory.has(enNode)) {
        const trans = memory.get(enNode);
        if (tgtNode === enNode && trans && trans !== enNode) {
          return { value: trans, changed: true };
        }
      }
      return { value: tgtNode, changed: false };
    }
    if (isPlainObject(enNode) && isPlainObject(tgtNode)) {
      const out = Array.isArray(tgtNode) ? [...tgtNode] : { ...tgtNode };
      Object.keys(enNode).forEach((k) => {
        if (Object.prototype.hasOwnProperty.call(tgtNode, k)) {
          const res = dfs(enNode[k], tgtNode[k]);
          if (res.changed) replaced++;
          out[k] = res.value;
        }
      });
      return { value: out, changed: false };
    }
    return { value: tgtNode, changed: false };
  };
  const res = dfs(enSection, targetSection);
  return { replaced };
}

const en = readJson(enPath);
const sections = ['audio', 'video', 'document'];
const enTemplate = en.tools;

const langFiles = [
  'de.json',
  'es.json',
  'fr.json',
  'ja.json',
  'ko.json',
  'pt.json',
  'zh-cn.json',
  'zh-tw.json',
];

langFiles.forEach((file) => {
  const filePath = path.join(languagesDir, file);
  if (!fs.existsSync(filePath)) return;
  const data = readJson(filePath);
  if (!data.tools) return;
  const memory = buildMemory(en, data);
  const stats = { file, replaced: {} };
  sections.forEach((sec) => {
    if (!data.tools[sec]) return;
    const before = JSON.stringify(data.tools[sec]);
    const result = applyMemoryToSection(enTemplate[sec], data.tools[sec], memory);
    stats.replaced[sec] = result.replaced;
    const after = JSON.stringify(data.tools[sec]);
    if (before !== after) {
      // Already mutated in place; nothing else to do
    }
  });
  writeJson(filePath, data);
  console.log(`${file}:`, stats.replaced);
});

console.log('Translation memory applied to sections:', sections.join(', '));



