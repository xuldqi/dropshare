const fs = require('fs');
const path = require('path');

// Paths
const languagesDir = path.resolve(__dirname, 'public/scripts/i18n/languages');
const enPath = path.join(languagesDir, 'en.json');

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  const content = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function deepMergeByTemplate(target, template) {
  // Ensure structure of target matches template; copy missing keys with template values
  Object.keys(template).forEach((key) => {
    const tmplVal = template[key];
    const tgtVal = target[key];
    if (isPlainObject(tmplVal)) {
      if (!isPlainObject(tgtVal)) {
        target[key] = {};
      }
      deepMergeByTemplate(target[key], tmplVal);
    } else if (typeof tmplVal === 'string') {
      if (typeof tgtVal !== 'string') {
        target[key] = tmplVal; // fallback to English placeholder for now
      }
    } else if (Array.isArray(tmplVal)) {
      if (!Array.isArray(tgtVal)) {
        target[key] = tmplVal.slice();
      }
    } else {
      if (tgtVal === undefined) {
        target[key] = tmplVal;
      }
    }
  });
}

function pick(obj, keys) {
  const out = {};
  keys.forEach((k) => {
    if (obj && obj[k] !== undefined) out[k] = obj[k];
  });
  return out;
}

// Main
const en = readJson(enPath);
const sections = ['audio', 'video', 'document'];
const template = pick(en.tools, sections);

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

const stats = [];

langFiles.forEach((file) => {
  const filePath = path.join(languagesDir, file);
  if (!fs.existsSync(filePath)) return;
  const data = readJson(filePath);
  if (!data.tools) data.tools = {};

  const beforeCounts = {};
  sections.forEach((sec) => {
    const countStrings = (obj) => {
      let c = 0;
      if (typeof obj === 'string') return 1;
      if (isPlainObject(obj)) {
        Object.values(obj).forEach((v) => (c += countStrings(v)));
      }
      return c;
    };
    beforeCounts[sec] = countStrings(data.tools[sec] || {});
  });

  // Merge
  sections.forEach((sec) => {
    if (!isPlainObject(data.tools[sec])) data.tools[sec] = {};
    deepMergeByTemplate(data.tools[sec], template[sec]);
  });

  const afterCounts = {};
  sections.forEach((sec) => {
    const countStrings = (obj) => {
      let c = 0;
      if (typeof obj === 'string') return 1;
      if (isPlainObject(obj)) {
        Object.values(obj).forEach((v) => (c += countStrings(v)));
      }
      return c;
    };
    afterCounts[sec] = countStrings(data.tools[sec] || {});
  });

  writeJson(filePath, data);
  stats.push({ file, before: beforeCounts, after: afterCounts });
});

console.log('Synchronized sections:', sections.join(', '));
stats.forEach((s) => {
  console.log(`${s.file}:`);
  sections.forEach((sec) => {
    console.log(`  ${sec}: ${s.before[sec]} -> ${s.after[sec]}`);
  });
});



