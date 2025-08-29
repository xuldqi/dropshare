const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, 'public/scripts/i18n/languages');
const targets = ['de','es','fr','ja','ko','pt','zh-cn','zh-tw'];

const MAP = {
  de: {
    audio: {
      title: 'Audio-Tools', subtitle: 'Audio-Dateien konvertieren und bearbeiten',
      converter: { title: 'Audio-Konverter', description: 'Zwischen Audioformaten konvertieren' },
      back: '← Zurück zu den Audio-Tools'
    },
    video: {
      title: 'Video-Tools', subtitle: 'Professionelle Video-Konvertierungstools',
      converter: { title: 'Video-Konverter', description: 'Videos zwischen Formaten konvertieren' },
      back: '← Zurück zu den Video-Tools'
    }
  },
  es: {
    audio: {
      title: 'Herramientas de audio', subtitle: 'Convertir y editar archivos de audio',
      converter: { title: 'Convertidor de audio', description: 'Convertir entre formatos de audio' },
      back: '← Volver a herramientas de audio'
    },
    video: {
      title: 'Herramientas de video', subtitle: 'Herramientas profesionales de conversión de video',
      converter: { title: 'Convertidor de video', description: 'Convertir videos entre formatos' },
      back: '← Volver a herramientas de video'
    }
  },
  fr: {
    audio: {
      title: 'Outils audio', subtitle: 'Convertir et éditer des fichiers audio',
      converter: { title: 'Convertisseur audio', description: 'Convertir entre les formats audio' },
      back: '← Retour aux outils audio'
    },
    video: {
      title: 'Outils vidéo', subtitle: 'Outils professionnels de conversion vidéo',
      converter: { title: 'Convertisseur vidéo', description: 'Convertir des vidéos entre formats' },
      back: '← Retour aux outils vidéo'
    }
  },
  ja: {
    audio: {
      title: '音声ツール', subtitle: '音声ファイルの変換と編集',
      converter: { title: '音声コンバーター', description: '音声フォーマット間の変換' },
      back: '← 音声ツールに戻る'
    },
    video: {
      title: '動画ツール', subtitle: 'プロ向け動画変換ツール',
      converter: { title: '動画コンバーター', description: '動画を各種形式に変換' },
      back: '← 動画ツールに戻る'
    }
  },
  ko: {
    audio: {
      title: '오디오 도구', subtitle: '오디오 파일 변환 및 편집',
      converter: { title: '오디오 변환기', description: '오디오 형식 간 변환' },
      back: '← 오디오 도구로 돌아가기'
    },
    video: {
      title: '비디오 도구', subtitle: '전문 비디오 변환 도구',
      converter: { title: '비디오 변환기', description: '비디오 형식 간 변환' },
      back: '← 비디오 도구로 돌아가기'
    }
  },
  pt: {
    audio: {
      title: 'Ferramentas de áudio', subtitle: 'Converter e editar arquivos de áudio',
      converter: { title: 'Conversor de áudio', description: 'Converter entre formatos de áudio' },
      back: '← Voltar às ferramentas de áudio'
    },
    video: {
      title: 'Ferramentas de vídeo', subtitle: 'Ferramentas profissionais de conversão de vídeo',
      converter: { title: 'Conversor de vídeo', description: 'Converter vídeos entre formatos' },
      back: '← Voltar às ferramentas de vídeo'
    }
  },
  'zh-cn': {
    audio: {
      title: '音频工具', subtitle: '转换和编辑音频文件',
      converter: { title: '音频转换器', description: '在音频格式之间转换' },
      back: '← 返回音频工具'
    },
    video: {
      title: '视频工具', subtitle: '专业的视频转换工具',
      converter: { title: '视频转换器', description: '在格式之间转换视频' },
      back: '← 返回视频工具'
    }
  },
  'zh-tw': {
    audio: {
      title: '音訊工具', subtitle: '轉換與編輯音訊檔案',
      converter: { title: '音訊轉換器', description: '在音訊格式之間轉換' },
      back: '← 返回音訊工具'
    },
    video: {
      title: '影片工具', subtitle: '專業的影片轉換工具',
      converter: { title: '影片轉換器', description: '在格式之間轉換影片' },
      back: '← 返回影片工具'
    }
  }
};

function walkReplaceBack(obj, text) {
  if (!obj || typeof obj !== 'object') return;
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (k === 'buttons' && v && typeof v === 'object' && typeof v.back_to_tools === 'string') {
      if (/Back to Audio Tools|Back to Video Tools|Audio Tools|Video Tools/.test(v.back_to_tools)) {
        v.back_to_tools = text;
      }
    } else if (typeof v === 'object') {
      walkReplaceBack(v, text);
    }
  });
}

targets.forEach((code) => {
  const p = path.join(dir, `${code}.json`);
  if (!fs.existsSync(p)) return;
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!data.tools) data.tools = {};

  const m = MAP[code];
  // audio
  if (!data.tools.audio) data.tools.audio = {};
  data.tools.audio.title = m.audio.title;
  data.tools.audio.subtitle = m.audio.subtitle;
  if (!data.tools.audio.converter) data.tools.audio.converter = {};
  Object.assign(data.tools.audio.converter, m.audio.converter);
  walkReplaceBack(data.tools.audio, m.audio.back);

  // video
  if (!data.tools.video) data.tools.video = {};
  data.tools.video.title = m.video.title;
  data.tools.video.subtitle = m.video.subtitle;
  if (!data.tools.video.converter) data.tools.video.converter = {};
  Object.assign(data.tools.video.converter, m.video.converter);
  walkReplaceBack(data.tools.video, m.video.back);

  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Updated audio/video for ${code}`);
});



