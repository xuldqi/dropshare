const fs = require('fs');
const path = require('path');

const languagesDir = path.resolve(__dirname, 'public/scripts/i18n/languages');
const en = JSON.parse(fs.readFileSync(path.join(languagesDir, 'en.json'), 'utf8'));

const sections = ['audio', 'video', 'document'];

// Minimal glossary per language for common UI phrases, keep placeholders intact
const GLOSSARIES = {
  de: {
    'Audio Tools': 'Audio-Tools',
    'Video Tools': 'Video-Tools',
    'Document Tools': 'Dokument-Tools',
    'Audio Converter': 'Audio-Konverter',
    'Video Converter': 'Video-Konverter',
    'Document Processor': 'Dokument-Prozessor',
    'Convert': 'Konvertieren',
    'Conversion': 'Konvertierung',
    'Processing': 'Verarbeitung',
    'Process': 'Verarbeiten',
    'Start Conversion': 'Konvertierung starten',
    'Start Processing': 'Verarbeitung starten',
    'New Conversion': 'Neue Konvertierung',
    'New Processing': 'Neue Verarbeitung',
    'Download': 'Herunterladen',
    'Download Videos': 'Videos herunterladen',
    'Download Audio': 'Audio herunterladen',
    'Download Word Document': 'Word-Dokument herunterladen',
    'Clear Files': 'Dateien löschen',
    'Selected Files:': 'Ausgewählte Dateien:',
    'Select Output Format:': 'Ausgabeformat auswählen:',
    'Click to select': 'Klicken zum Auswählen',
    'or drag them here': 'oder hierher ziehen',
    'Supports': 'Unterstützt',
    'maximum': 'maximal',
    'each': 'jeweils',
    'Format Conversion Settings': 'Einstellungen der Formatkonvertierung',
    'Conversion Complete!': 'Konvertierung abgeschlossen!',
    'Processing Complete!': 'Verarbeitung abgeschlossen!',
    'Analysis Complete!': 'Analyse abgeschlossen!',
    'Back to Audio Tools': 'Zurück zu den Audio-Tools',
    'Back to Video Tools': 'Zurück zu den Video-Tools',
    'Back to Document Tools': 'Zurück zu den Dokument-Tools'
  },
  es: {
    'Audio Tools': 'Herramientas de audio',
    'Video Tools': 'Herramientas de video',
    'Document Tools': 'Herramientas de documento',
    'Audio Converter': 'Convertidor de audio',
    'Video Converter': 'Convertidor de video',
    'Document Processor': 'Procesador de documentos',
    'Convert': 'Convertir',
    'Conversion': 'Conversión',
    'Processing': 'Procesamiento',
    'Process': 'Procesar',
    'Start Conversion': 'Iniciar conversión',
    'Start Processing': 'Iniciar procesamiento',
    'New Conversion': 'Nueva conversión',
    'New Processing': 'Nuevo procesamiento',
    'Download': 'Descargar',
    'Download Videos': 'Descargar videos',
    'Download Audio': 'Descargar audio',
    'Download Word Document': 'Descargar documento de Word',
    'Clear Files': 'Limpiar archivos',
    'Selected Files:': 'Archivos seleccionados:',
    'Select Output Format:': 'Seleccionar formato de salida:',
    'Click to select': 'Haz clic para seleccionar',
    'or drag them here': 'o arrástralos aquí',
    'Supports': 'Admite',
    'maximum': 'máximo',
    'each': 'cada uno',
    'Format Conversion Settings': 'Configuración de conversión de formato',
    'Conversion Complete!': '¡Conversión completada!',
    'Processing Complete!': '¡Procesamiento completado!',
    'Analysis Complete!': '¡Análisis completado!',
    'Back to Audio Tools': 'Volver a herramientas de audio',
    'Back to Video Tools': 'Volver a herramientas de video',
    'Back to Document Tools': 'Volver a herramientas de documento'
  },
  fr: {
    'Audio Tools': "Outils audio",
    'Video Tools': 'Outils vidéo',
    'Document Tools': 'Outils de document',
    'Audio Converter': "Convertisseur audio",
    'Video Converter': 'Convertisseur vidéo',
    'Document Processor': 'Processeur de documents',
    'Convert': 'Convertir',
    'Conversion': 'Conversion',
    'Processing': 'Traitement',
    'Process': 'Traiter',
    'Start Conversion': 'Démarrer la conversion',
    'Start Processing': 'Démarrer le traitement',
    'New Conversion': 'Nouvelle conversion',
    'New Processing': 'Nouveau traitement',
    'Download': 'Télécharger',
    'Download Videos': 'Télécharger les vidéos',
    'Download Audio': "Télécharger l'audio",
    'Download Word Document': 'Télécharger le document Word',
    'Clear Files': 'Effacer les fichiers',
    'Selected Files:': 'Fichiers sélectionnés :',
    'Select Output Format:': 'Sélectionner le format de sortie :',
    'Click to select': 'Cliquez pour sélectionner',
    'or drag them here': 'ou glissez-les ici',
    'Supports': 'Prend en charge',
    'maximum': 'maximum',
    'each': 'chacun',
    'Format Conversion Settings': 'Paramètres de conversion de format',
    'Conversion Complete!': 'Conversion terminée !',
    'Processing Complete!': 'Traitement terminé !',
    'Analysis Complete!': 'Analyse terminée !',
    'Back to Audio Tools': 'Retour aux outils audio',
    'Back to Video Tools': 'Retour aux outils vidéo',
    'Back to Document Tools': 'Retour aux outils de document'
  },
  ja: {
    'Audio Tools': '音声ツール',
    'Video Tools': '動画ツール',
    'Document Tools': '文書ツール',
    'Audio Converter': '音声コンバーター',
    'Video Converter': '動画コンバーター',
    'Document Processor': 'ドキュメントプロセッサー',
    'Convert': '変換',
    'Conversion': '変換',
    'Processing': '処理',
    'Process': '処理',
    'Start Conversion': '変換開始',
    'Start Processing': '処理開始',
    'New Conversion': '新しい変換',
    'New Processing': '新しい処理',
    'Download': 'ダウンロード',
    'Download Videos': '動画をダウンロード',
    'Download Audio': '音声をダウンロード',
    'Download Word Document': 'Wordドキュメントをダウンロード',
    'Clear Files': 'ファイルをクリア',
    'Selected Files:': '選択されたファイル:',
    'Select Output Format:': '出力形式を選択:',
    'Click to select': 'クリックして選択',
    'or drag them here': 'またはここにドラッグ',
    'Supports': '対応',
    'maximum': '最大',
    'each': '各',
    'Format Conversion Settings': '形式変換設定',
    'Conversion Complete!': '変換完了！',
    'Processing Complete!': '処理完了！',
    'Analysis Complete!': '分析完了！',
    'Back to Audio Tools': '音声ツールに戻る',
    'Back to Video Tools': '動画ツールに戻る',
    'Back to Document Tools': '文書ツールに戻る'
  },
  ko: {
    'Audio Tools': '오디오 도구',
    'Video Tools': '비디오 도구',
    'Document Tools': '문서 도구',
    'Audio Converter': '오디오 변환기',
    'Video Converter': '비디오 변환기',
    'Document Processor': '문서 프로세서',
    'Convert': '변환',
    'Conversion': '변환',
    'Processing': '처리',
    'Process': '처리',
    'Start Conversion': '변환 시작',
    'Start Processing': '처리 시작',
    'New Conversion': '새 변환',
    'New Processing': '새 처리',
    'Download': '다운로드',
    'Download Videos': '비디오 다운로드',
    'Download Audio': '오디오 다운로드',
    'Download Word Document': 'Word 문서 다운로드',
    'Clear Files': '파일 지우기',
    'Selected Files:': '선택된 파일:',
    'Select Output Format:': '출력 형식 선택:',
    'Click to select': '클릭하여 선택',
    'or drag them here': '또는 여기로 드래그',
    'Supports': '지원',
    'maximum': '최대',
    'each': '각',
    'Format Conversion Settings': '형식 변환 설정',
    'Conversion Complete!': '변환 완료!',
    'Processing Complete!': '처리 완료!',
    'Analysis Complete!': '분석 완료!',
    'Back to Audio Tools': '오디오 도구로 돌아가기',
    'Back to Video Tools': '비디오 도구로 돌아가기',
    'Back to Document Tools': '문서 도구로 돌아가기'
  },
  pt: {
    'Audio Tools': 'Ferramentas de áudio',
    'Video Tools': 'Ferramentas de vídeo',
    'Document Tools': 'Ferramentas de documento',
    'Audio Converter': 'Conversor de áudio',
    'Video Converter': 'Conversor de vídeo',
    'Document Processor': 'Processador de documentos',
    'Convert': 'Converter',
    'Conversion': 'Conversão',
    'Processing': 'Processamento',
    'Process': 'Processar',
    'Start Conversion': 'Iniciar conversão',
    'Start Processing': 'Iniciar processamento',
    'New Conversion': 'Nova conversão',
    'New Processing': 'Novo processamento',
    'Download': 'Baixar',
    'Download Videos': 'Baixar vídeos',
    'Download Audio': 'Baixar áudio',
    'Download Word Document': 'Baixar documento do Word',
    'Clear Files': 'Limpar arquivos',
    'Selected Files:': 'Arquivos selecionados:',
    'Select Output Format:': 'Selecionar formato de saída:',
    'Click to select': 'Clique para selecionar',
    'or drag them here': 'ou arraste aqui',
    'Supports': 'Suporta',
    'maximum': 'máximo',
    'each': 'cada',
    'Format Conversion Settings': 'Configurações de conversão de formato',
    'Conversion Complete!': 'Conversão concluída!',
    'Processing Complete!': 'Processamento concluído!',
    'Analysis Complete!': 'Análise concluída!',
    'Back to Audio Tools': 'Voltar às ferramentas de áudio',
    'Back to Video Tools': 'Voltar às ferramentas de vídeo',
    'Back to Document Tools': 'Voltar às ferramentas de documento'
  },
  'zh-cn': {
    'Audio Tools': '音频工具',
    'Video Tools': '视频工具',
    'Document Tools': '文档工具',
    'Audio Converter': '音频转换器',
    'Video Converter': '视频转换器',
    'Document Processor': '文档处理器',
    'Convert': '转换',
    'Conversion': '转换',
    'Processing': '处理',
    'Process': '处理',
    'Start Conversion': '开始转换',
    'Start Processing': '开始处理',
    'New Conversion': '新的转换',
    'New Processing': '新的处理',
    'Download': '下载',
    'Download Videos': '下载视频',
    'Download Audio': '下载音频',
    'Download Word Document': '下载Word文档',
    'Clear Files': '清除文件',
    'Selected Files:': '已选文件：',
    'Select Output Format:': '选择输出格式：',
    'Click to select': '点击选择',
    'or drag them here': '或拖到此处',
    'Supports': '支持',
    'maximum': '最大',
    'each': '每个',
    'Format Conversion Settings': '格式转换设置',
    'Conversion Complete!': '转换完成！',
    'Processing Complete!': '处理完成！',
    'Analysis Complete!': '分析完成！',
    'Back to Audio Tools': '返回音频工具',
    'Back to Video Tools': '返回视频工具',
    'Back to Document Tools': '返回文档工具'
  },
  'zh-tw': {
    'Audio Tools': '音訊工具',
    'Video Tools': '影片工具',
    'Document Tools': '文件工具',
    'Audio Converter': '音訊轉換器',
    'Video Converter': '影片轉換器',
    'Document Processor': '文件處理器',
    'Convert': '轉換',
    'Conversion': '轉換',
    'Processing': '處理',
    'Process': '處理',
    'Start Conversion': '開始轉換',
    'Start Processing': '開始處理',
    'New Conversion': '新的轉換',
    'New Processing': '新的處理',
    'Download': '下載',
    'Download Videos': '下載影片',
    'Download Audio': '下載音訊',
    'Download Word Document': '下載 Word 文件',
    'Clear Files': '清除檔案',
    'Selected Files:': '已選檔案：',
    'Select Output Format:': '選擇輸出格式：',
    'Click to select': '點擊選擇',
    'or drag them here': '或拖曳到此處',
    'Supports': '支援',
    'maximum': '最大',
    'each': '每個',
    'Format Conversion Settings': '格式轉換設定',
    'Conversion Complete!': '轉換完成！',
    'Processing Complete!': '處理完成！',
    'Analysis Complete!': '分析完成！',
    'Back to Audio Tools': '返回音訊工具',
    'Back to Video Tools': '返回影片工具',
    'Back to Document Tools': '返回文件工具'
  }
};

const TECH_RE = /(MP3|WAV|AAC|OGG|FLAC|MP4|AVI|MOV|WebM|MKV|PDF|DOCX|TXT|RTF|HTML|CSV|XLSX)/g;
const PLACEHOLDER_RE = /(\{[^}]+\})/g;

function applyGlossary(enStr, lang, currentStr) {
  // Skip if current already differs from English
  if (currentStr && currentStr !== enStr) return currentStr;
  const glossary = GLOSSARIES[lang];
  if (!glossary) return currentStr;

  // Protect placeholders and tech terms
  const placeholders = [];
  const techs = [];
  let tmp = enStr.replace(PLACEHOLDER_RE, (m) => {
    placeholders.push(m);
    return `__PH_${placeholders.length - 1}__`;
  }).replace(TECH_RE, (m) => {
    techs.push(m);
    return `__TK_${techs.length - 1}__`;
  });

  // Apply multi-token replacements using simple phrase mapping
  Object.keys(glossary).forEach((k) => {
    const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    tmp = tmp.replace(re, glossary[k]);
  });

  // Restore placeholders and tech terms
  tmp = tmp.replace(/__PH_(\d+)__/g, (_, i) => placeholders[Number(i)]);
  tmp = tmp.replace(/__TK_(\d+)__/g, (_, i) => techs[Number(i)]);

  return tmp;
}

function translateFile(langCode) {
  const filePath = path.join(languagesDir, `${langCode}.json`);
  if (!fs.existsSync(filePath)) return null;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!data.tools) return null;
  let changed = 0;

  sections.forEach((sec) => {
    const enSec = en.tools[sec];
    const tgtSec = data.tools[sec];
    if (!tgtSec) return;
    const dfs = (enNode, tgtNode, parent) => {
      if (typeof enNode === 'string') {
        if (typeof tgtNode === 'string') {
          const newVal = applyGlossary(enNode, langCode, tgtNode);
          if (newVal && newVal !== tgtNode) {
            // mutate parent path value
            return { value: newVal, changed: true };
          }
        }
        return { value: tgtNode, changed: false };
      }
      if (enNode && typeof enNode === 'object' && tgtNode && typeof tgtNode === 'object') {
        const out = Array.isArray(tgtNode) ? [...tgtNode] : { ...tgtNode };
        Object.keys(enNode).forEach((k) => {
          if (k in tgtNode) {
            const res = dfs(enNode[k], tgtNode[k], out);
            if (res.changed) {
              out[k] = res.value;
              changed++;
            }
          }
        });
        return { value: out, changed: false };
      }
      return { value: tgtNode, changed: false };
    };
    const res = dfs(enSec, tgtSec, null);
    if (res.changed) data.tools[sec] = res.value;
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return changed;
}

const targets = ['de','es','fr','ja','ko','pt','zh-cn','zh-tw'];
const report = {};
targets.forEach((t) => {
  const cnt = translateFile(t) || 0;
  report[t] = cnt;
});

console.log('Glossary translation changes:', report);



