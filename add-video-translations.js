// 视频工具动态文字翻译批量添加脚本
const fs = require('fs');

// 新的视频翻译键
const videoTranslations = {
  de: {
    "_comment_video_dynamic_text": "Dynamischer Text für Video-Tools - Fortschritt, Status und Fehlermeldungen",
    
    "video_engine_loading": "Video-Verarbeitungsmodul wird geladen...",
    "video_engine_loaded": "✓ Video-Verarbeitungsmodul geladen und bereit!",
    "video_engine_failed": "✗ Fehler beim Laden des Video-Verarbeitungsmoduls. Bitte Seite aktualisieren.",
    
    "video_trimming_progress": "Schneiden...",
    "video_loading_file": "Datei wird geladen...",
    "video_trimming": "Video wird geschnitten...",
    "video_trimmed_success": "✓ Video geschnitten! Dauer: {duration}s",
    "video_trimming_failed": "Schneiden fehlgeschlagen: {error}",
    
    "video_converting": "Video wird konvertiert...",
    "video_conversion_success": "Konvertierung erfolgreich! Datei heruntergeladen.",
    "video_conversion_failed": "Konvertierung fehlgeschlagen: {error}",
    
    "video_compressing": "Komprimieren...",
    "video_compression_complete": "Komprimierung abgeschlossen!",
    "video_compression_failed": "Komprimierung fehlgeschlagen: {error}",
    
    "video_merging": "Video-Dateien werden zusammengeführt...",
    "video_merge_success": "✓ Video-Dateien erfolgreich zusammengeführt!",
    "video_merge_failed": "Zusammenführung fehlgeschlagen: {error}",
    "video_merge_preparing": "Dateien werden vorbereitet...",
    "video_merge_complete": "Zusammenführung abgeschlossen!",
    
    "video_effects_applying": "Effekte werden angewendet...",
    "video_effects_success": "Effekte erfolgreich angewendet!",
    "video_effects_failed": "Effektanwendung fehlgeschlagen. Bitte erneut versuchen.",
    
    "video_error_no_file": "Bitte wählen Sie eine Video-Datei aus.",
    "video_error_invalid_file": "Bitte wählen Sie eine gültige Video-Datei aus!",
    "video_error_format_mismatch": "Bitte wählen Sie Video-Dateien im {format}-Format aus!",
    "video_error_min_files": "Bitte wählen Sie mindestens 2 Video-Dateien zum Zusammenführen aus",
    "video_error_file_size": "Video-Datei ist zu groß für die Verarbeitung",
    "video_error_browser_support": "Ihr Browser unterstützt dieses Video-Format nicht",
    
    "video_feature_development": "Funktion in Entwicklung, bald verfügbar!",
    "video_download_ready": "Download bereit!",
    "video_creating_download": "Download wird erstellt...",
    
    "video_trim_button": "Video schneiden",
    "video_convert_button": "Video konvertieren",
    "video_merge_button": "Videos zusammenführen",
    "video_compress_button": "Video komprimieren",
    "video_apply_effects_button": "Effekte anwenden",
    
    "video_loading_engine_button": "Modul wird geladen...",
    "video_loading_ffmpeg": "FFmpeg wird geladen...",
    
    "video_merge_min_files_alert": "Bitte wählen Sie mindestens 2 Video-Dateien zum Zusammenführen aus",
    "video_merge_prepare_alert": "Vorbereitung zum Zusammenführen folgender Videos:",
    "video_merge_development_alert": "Funktion in Entwicklung, bald verfügbar!",
    "video_merge_failed_alert": "Zusammenführung fehlgeschlagen. Bitte überprüfen Sie Dateiformate und -größen",
    "video_merge_two_files_alert": "Bitte wählen Sie mindestens zwei Video-Dateien aus",
    
    "video_conversion_engine_loading": "Video-Konvertierungsmodul wird geladen...",
    "video_conversion_engine_failed": "Video-Konvertierungsmodul konnte nicht geladen werden",
    "video_format_converter_title_dynamic": "Video-Konverter",
    "video_format_converter_subtitle_dynamic": "Videos zwischen verschiedenen Formaten konvertieren"
  },
  
  es: {
    "_comment_video_dynamic_text": "Texto dinámico para herramientas de video - progreso, estado y mensajes de error",
    
    "video_engine_loading": "Cargando motor de procesamiento de video...",
    "video_engine_loaded": "✓ ¡Motor de procesamiento de video cargado y listo!",
    "video_engine_failed": "✗ Error al cargar el motor de procesamiento de video. Por favor actualice la página.",
    
    "video_trimming_progress": "Recortando...",
    "video_loading_file": "Cargando archivo...",
    "video_trimming": "Recortando video...",
    "video_trimmed_success": "✓ ¡Video recortado! Duración: {duration}s",
    "video_trimming_failed": "Error al recortar: {error}",
    
    "video_converting": "Convirtiendo video...",
    "video_conversion_success": "¡Conversión exitosa! Archivo descargado.",
    "video_conversion_failed": "Error de conversión: {error}",
    
    "video_compressing": "Comprimiendo...",
    "video_compression_complete": "¡Compresión completada!",
    "video_compression_failed": "Error de compresión: {error}",
    
    "video_merging": "Fusionando archivos de video...",
    "video_merge_success": "✓ ¡Archivos de video fusionados exitosamente!",
    "video_merge_failed": "Error de fusión: {error}",
    "video_merge_preparing": "Preparando archivos...",
    "video_merge_complete": "¡Fusión completada!",
    
    "video_effects_applying": "Aplicando efectos...",
    "video_effects_success": "¡Efectos aplicados exitosamente!",
    "video_effects_failed": "Error al aplicar efectos. Inténtelo de nuevo.",
    
    "video_error_no_file": "Por favor seleccione un archivo de video.",
    "video_error_invalid_file": "¡Por favor seleccione un archivo de video válido!",
    "video_error_format_mismatch": "¡Por favor seleccione archivos de video en formato {format}!",
    "video_error_min_files": "Por favor seleccione al menos 2 archivos de video para fusionar",
    "video_error_file_size": "El archivo de video es demasiado grande para procesar",
    "video_error_browser_support": "Su navegador no soporta este formato de video",
    
    "video_feature_development": "¡Función en desarrollo, próximamente disponible!",
    "video_download_ready": "¡Descarga lista!",
    "video_creating_download": "Creando descarga...",
    
    "video_trim_button": "Recortar Video",
    "video_convert_button": "Convertir Video",
    "video_merge_button": "Fusionar Videos",
    "video_compress_button": "Comprimir Video",
    "video_apply_effects_button": "Aplicar Efectos",
    
    "video_loading_engine_button": "Cargando Motor...",
    "video_loading_ffmpeg": "Cargando FFmpeg...",
    
    "video_merge_min_files_alert": "Por favor seleccione al menos 2 archivos de video para fusionar",
    "video_merge_prepare_alert": "Preparando para fusionar los siguientes videos:",
    "video_merge_development_alert": "¡Función en desarrollo, próximamente disponible!",
    "video_merge_failed_alert": "Error de fusión. Por favor verifique los formatos y tamaños de archivo",
    "video_merge_two_files_alert": "Por favor seleccione al menos dos archivos de video",
    
    "video_conversion_engine_loading": "Cargando motor de conversión de video...",
    "video_conversion_engine_failed": "El motor de conversión de video falló al cargar",
    "video_format_converter_title_dynamic": "Convertidor de Video",
    "video_format_converter_subtitle_dynamic": "Convertir video entre diferentes formatos"
  },
  
  fr: {
    "_comment_video_dynamic_text": "Texte dynamique pour les outils vidéo - progression, statut et messages d'erreur",
    
    "video_engine_loading": "Chargement du moteur de traitement vidéo...",
    "video_engine_loaded": "✓ Moteur de traitement vidéo chargé et prêt !",
    "video_engine_failed": "✗ Échec du chargement du moteur de traitement vidéo. Veuillez actualiser la page.",
    
    "video_trimming_progress": "Découpage...",
    "video_loading_file": "Chargement du fichier...",
    "video_trimming": "Découpage de la vidéo...",
    "video_trimmed_success": "✓ Vidéo découpée ! Durée : {duration}s",
    "video_trimming_failed": "Échec du découpage : {error}",
    
    "video_converting": "Conversion de la vidéo...",
    "video_conversion_success": "Conversion réussie ! Fichier téléchargé.",
    "video_conversion_failed": "Échec de la conversion : {error}",
    
    "video_compressing": "Compression...",
    "video_compression_complete": "Compression terminée !",
    "video_compression_failed": "Échec de la compression : {error}",
    
    "video_merging": "Fusion des fichiers vidéo...",
    "video_merge_success": "✓ Fichiers vidéo fusionnés avec succès !",
    "video_merge_failed": "Échec de la fusion : {error}",
    "video_merge_preparing": "Préparation des fichiers...",
    "video_merge_complete": "Fusion terminée !",
    
    "video_effects_applying": "Application des effets...",
    "video_effects_success": "Effets appliqués avec succès !",
    "video_effects_failed": "Échec de l'application des effets. Veuillez réessayer.",
    
    "video_error_no_file": "Veuillez sélectionner un fichier vidéo.",
    "video_error_invalid_file": "Veuillez sélectionner un fichier vidéo valide !",
    "video_error_format_mismatch": "Veuillez sélectionner des fichiers vidéo au format {format} !",
    "video_error_min_files": "Veuillez sélectionner au moins 2 fichiers vidéo à fusionner",
    "video_error_file_size": "Le fichier vidéo est trop volumineux pour le traitement",
    "video_error_browser_support": "Votre navigateur ne prend pas en charge ce format vidéo",
    
    "video_feature_development": "Fonctionnalité en développement, bientôt disponible !",
    "video_download_ready": "Téléchargement prêt !",
    "video_creating_download": "Création du téléchargement...",
    
    "video_trim_button": "Découper la Vidéo",
    "video_convert_button": "Convertir la Vidéo",
    "video_merge_button": "Fusionner les Vidéos",
    "video_compress_button": "Comprimer la Vidéo",
    "video_apply_effects_button": "Appliquer les Effets",
    
    "video_loading_engine_button": "Chargement du Moteur...",
    "video_loading_ffmpeg": "Chargement de FFmpeg...",
    
    "video_merge_min_files_alert": "Veuillez sélectionner au moins 2 fichiers vidéo à fusionner",
    "video_merge_prepare_alert": "Préparation à fusionner les vidéos suivantes :",
    "video_merge_development_alert": "Fonctionnalité en développement, bientôt disponible !",
    "video_merge_failed_alert": "Échec de la fusion. Veuillez vérifier les formats et tailles de fichiers",
    "video_merge_two_files_alert": "Veuillez sélectionner au moins deux fichiers vidéo",
    
    "video_conversion_engine_loading": "Chargement du moteur de conversion vidéo...",
    "video_conversion_engine_failed": "Le moteur de conversion vidéo a échoué à charger",
    "video_format_converter_title_dynamic": "Convertisseur Vidéo",
    "video_format_converter_subtitle_dynamic": "Convertir la vidéo entre différents formats"
  },
  
  ja: {
    "_comment_video_dynamic_text": "ビデオツール用の動的テキスト - 進行状況、ステータス、エラーメッセージ",
    
    "video_engine_loading": "ビデオ処理エンジンを読み込み中...",
    "video_engine_loaded": "✓ ビデオ処理エンジンが読み込まれ、準備完了！",
    "video_engine_failed": "✗ ビデオ処理エンジンの読み込みに失敗しました。ページを更新してください。",
    
    "video_trimming_progress": "トリミング中...",
    "video_loading_file": "ファイルを読み込み中...",
    "video_trimming": "ビデオをトリミング中...",
    "video_trimmed_success": "✓ ビデオをトリミングしました！継続時間：{duration}秒",
    "video_trimming_failed": "トリミングに失敗しました：{error}",
    
    "video_converting": "ビデオを変換中...",
    "video_conversion_success": "変換が成功しました！ファイルをダウンロードしました。",
    "video_conversion_failed": "変換に失敗しました：{error}",
    
    "video_compressing": "圧縮中...",
    "video_compression_complete": "圧縮が完了しました！",
    "video_compression_failed": "圧縮に失敗しました：{error}",
    
    "video_merging": "ビデオファイルを結合中...",
    "video_merge_success": "✓ ビデオファイルの結合が成功しました！",
    "video_merge_failed": "結合に失敗しました：{error}",
    "video_merge_preparing": "ファイルを準備中...",
    "video_merge_complete": "結合が完了しました！",
    
    "video_effects_applying": "エフェクトを適用中...",
    "video_effects_success": "エフェクトの適用が成功しました！",
    "video_effects_failed": "エフェクトの適用に失敗しました。再試行してください。",
    
    "video_error_no_file": "ビデオファイルを選択してください。",
    "video_error_invalid_file": "有効なビデオファイルを選択してください！",
    "video_error_format_mismatch": "{format}形式のビデオファイルを選択してください！",
    "video_error_min_files": "結合するには最低2つのビデオファイルを選択してください",
    "video_error_file_size": "ビデオファイルが処理には大きすぎます",
    "video_error_browser_support": "お使いのブラウザはこのビデオ形式をサポートしていません",
    
    "video_feature_development": "機能開発中、近日公開予定！",
    "video_download_ready": "ダウンロード準備完了！",
    "video_creating_download": "ダウンロードを作成中...",
    
    "video_trim_button": "ビデオをトリミング",
    "video_convert_button": "ビデオを変換",
    "video_merge_button": "ビデオを結合",
    "video_compress_button": "ビデオを圧縮",
    "video_apply_effects_button": "エフェクトを適用",
    
    "video_loading_engine_button": "エンジンを読み込み中...",
    "video_loading_ffmpeg": "FFmpegを読み込み中...",
    
    "video_merge_min_files_alert": "結合するには最低2つのビデオファイルを選択してください",
    "video_merge_prepare_alert": "以下のビデオを結合する準備をしています：",
    "video_merge_development_alert": "機能開発中、近日公開予定！",
    "video_merge_failed_alert": "結合に失敗しました。ファイル形式とサイズを確認してください",
    "video_merge_two_files_alert": "最低2つのビデオファイルを選択してください",
    
    "video_conversion_engine_loading": "ビデオ変換エンジンを読み込み中...",
    "video_conversion_engine_failed": "ビデオ変換エンジンの読み込みに失敗しました",
    "video_format_converter_title_dynamic": "ビデオコンバーター",
    "video_format_converter_subtitle_dynamic": "異なる形式間でビデオを変換"
  },
  
  ko: {
    "_comment_video_dynamic_text": "비디오 도구용 동적 텍스트 - 진행 상황, 상태 및 오류 메시지",
    
    "video_engine_loading": "비디오 처리 엔진 로딩 중...",
    "video_engine_loaded": "✓ 비디오 처리 엔진이 로드되어 준비 완료!",
    "video_engine_failed": "✗ 비디오 처리 엔진 로드에 실패했습니다. 페이지를 새로고침해주세요.",
    
    "video_trimming_progress": "트리밍 중...",
    "video_loading_file": "파일 로딩 중...",
    "video_trimming": "비디오 트리밍 중...",
    "video_trimmed_success": "✓ 비디오 트리밍 완료! 길이: {duration}초",
    "video_trimming_failed": "트리밍 실패: {error}",
    
    "video_converting": "비디오 변환 중...",
    "video_conversion_success": "변환 성공! 파일을 다운로드했습니다.",
    "video_conversion_failed": "변환 실패: {error}",
    
    "video_compressing": "압축 중...",
    "video_compression_complete": "압축 완료!",
    "video_compression_failed": "압축 실패: {error}",
    
    "video_merging": "비디오 파일 병합 중...",
    "video_merge_success": "✓ 비디오 파일 병합 성공!",
    "video_merge_failed": "병합 실패: {error}",
    "video_merge_preparing": "파일 준비 중...",
    "video_merge_complete": "병합 완료!",
    
    "video_effects_applying": "이펙트 적용 중...",
    "video_effects_success": "이펙트 적용 성공!",
    "video_effects_failed": "이펙트 적용 실패. 다시 시도해주세요.",
    
    "video_error_no_file": "비디오 파일을 선택해주세요.",
    "video_error_invalid_file": "유효한 비디오 파일을 선택해주세요!",
    "video_error_format_mismatch": "{format} 형식의 비디오 파일을 선택해주세요!",
    "video_error_min_files": "병합할 비디오 파일을 최소 2개 선택해주세요",
    "video_error_file_size": "비디오 파일이 처리하기에 너무 큽니다",
    "video_error_browser_support": "브라우저에서 이 비디오 형식을 지원하지 않습니다",
    
    "video_feature_development": "기능 개발 중, 곧 출시 예정!",
    "video_download_ready": "다운로드 준비 완료!",
    "video_creating_download": "다운로드 생성 중...",
    
    "video_trim_button": "비디오 트리밍",
    "video_convert_button": "비디오 변환",
    "video_merge_button": "비디오 병합",
    "video_compress_button": "비디오 압축",
    "video_apply_effects_button": "이펙트 적용",
    
    "video_loading_engine_button": "엔진 로딩 중...",
    "video_loading_ffmpeg": "FFmpeg 로딩 중...",
    
    "video_merge_min_files_alert": "병합할 비디오 파일을 최소 2개 선택해주세요",
    "video_merge_prepare_alert": "다음 비디오들을 병합할 준비를 하고 있습니다:",
    "video_merge_development_alert": "기능 개발 중, 곧 출시 예정!",
    "video_merge_failed_alert": "병합 실패. 파일 형식과 크기를 확인해주세요",
    "video_merge_two_files_alert": "최소 2개의 비디오 파일을 선택해주세요",
    
    "video_conversion_engine_loading": "비디오 변환 엔진 로딩 중...",
    "video_conversion_engine_failed": "비디오 변환 엔진 로드에 실패했습니다",
    "video_format_converter_title_dynamic": "비디오 컨버터",
    "video_format_converter_subtitle_dynamic": "다양한 형식 간 비디오 변환"
  },
  
  pt: {
    "_comment_video_dynamic_text": "Texto dinâmico para ferramentas de vídeo - progresso, status e mensagens de erro",
    
    "video_engine_loading": "Carregando motor de processamento de vídeo...",
    "video_engine_loaded": "✓ Motor de processamento de vídeo carregado e pronto!",
    "video_engine_failed": "✗ Falha ao carregar o motor de processamento de vídeo. Atualize a página.",
    
    "video_trimming_progress": "Cortando...",
    "video_loading_file": "Carregando arquivo...",
    "video_trimming": "Cortando vídeo...",
    "video_trimmed_success": "✓ Vídeo cortado! Duração: {duration}s",
    "video_trimming_failed": "Falha ao cortar: {error}",
    
    "video_converting": "Convertendo vídeo...",
    "video_conversion_success": "Conversão bem-sucedida! Arquivo baixado.",
    "video_conversion_failed": "Falha na conversão: {error}",
    
    "video_compressing": "Comprimindo...",
    "video_compression_complete": "Compressão concluída!",
    "video_compression_failed": "Falha na compressão: {error}",
    
    "video_merging": "Mesclando arquivos de vídeo...",
    "video_merge_success": "✓ Arquivos de vídeo mesclados com sucesso!",
    "video_merge_failed": "Falha na mesclagem: {error}",
    "video_merge_preparing": "Preparando arquivos...",
    "video_merge_complete": "Mesclagem concluída!",
    
    "video_effects_applying": "Aplicando efeitos...",
    "video_effects_success": "Efeitos aplicados com sucesso!",
    "video_effects_failed": "Falha na aplicação de efeitos. Tente novamente.",
    
    "video_error_no_file": "Selecione um arquivo de vídeo.",
    "video_error_invalid_file": "Selecione um arquivo de vídeo válido!",
    "video_error_format_mismatch": "Selecione arquivos de vídeo no formato {format}!",
    "video_error_min_files": "Selecione pelo menos 2 arquivos de vídeo para mesclar",
    "video_error_file_size": "O arquivo de vídeo é muito grande para processamento",
    "video_error_browser_support": "Seu navegador não suporta este formato de vídeo",
    
    "video_feature_development": "Recurso em desenvolvimento, em breve disponível!",
    "video_download_ready": "Download pronto!",
    "video_creating_download": "Criando download...",
    
    "video_trim_button": "Cortar Vídeo",
    "video_convert_button": "Converter Vídeo",
    "video_merge_button": "Mesclar Vídeos",
    "video_compress_button": "Comprimir Vídeo",
    "video_apply_effects_button": "Aplicar Efeitos",
    
    "video_loading_engine_button": "Carregando Motor...",
    "video_loading_ffmpeg": "Carregando FFmpeg...",
    
    "video_merge_min_files_alert": "Selecione pelo menos 2 arquivos de vídeo para mesclar",
    "video_merge_prepare_alert": "Preparando para mesclar os seguintes vídeos:",
    "video_merge_development_alert": "Recurso em desenvolvimento, em breve disponível!",
    "video_merge_failed_alert": "Falha na mesclagem. Verifique os formatos e tamanhos dos arquivos",
    "video_merge_two_files_alert": "Selecione pelo menos dois arquivos de vídeo",
    
    "video_conversion_engine_loading": "Carregando motor de conversão de vídeo...",
    "video_conversion_engine_failed": "O motor de conversão de vídeo falhou ao carregar",
    "video_format_converter_title_dynamic": "Conversor de Vídeo",
    "video_format_converter_subtitle_dynamic": "Converter vídeo entre diferentes formatos"
  },
  
  'zh-CN': {
    "_comment_video_dynamic_text": "视频工具动态文本 - 进度、状态和错误消息",
    
    "video_engine_loading": "正在加载视频处理引擎...",
    "video_engine_loaded": "✓ 视频处理引擎已加载并准备就绪！",
    "video_engine_failed": "✗ 视频处理引擎加载失败。请刷新页面。",
    
    "video_trimming_progress": "裁剪中...",
    "video_loading_file": "正在加载文件...",
    "video_trimming": "正在裁剪视频...",
    "video_trimmed_success": "✓ 视频裁剪完成！时长：{duration}秒",
    "video_trimming_failed": "裁剪失败：{error}",
    
    "video_converting": "正在转换视频...",
    "video_conversion_success": "转换成功！文件已下载。",
    "video_conversion_failed": "转换失败：{error}",
    
    "video_compressing": "正在压缩...",
    "video_compression_complete": "压缩完成！",
    "video_compression_failed": "压缩失败：{error}",
    
    "video_merging": "正在合并视频文件...",
    "video_merge_success": "✓ 视频文件合并成功！",
    "video_merge_failed": "合并失败：{error}",
    "video_merge_preparing": "正在准备文件...",
    "video_merge_complete": "合并完成！",
    
    "video_effects_applying": "正在应用效果...",
    "video_effects_success": "效果应用成功！",
    "video_effects_failed": "效果应用失败。请重试。",
    
    "video_error_no_file": "请选择视频文件。",
    "video_error_invalid_file": "请选择有效的视频文件！",
    "video_error_format_mismatch": "请选择{format}格式的视频文件！",
    "video_error_min_files": "请选择至少2个视频文件进行合并",
    "video_error_file_size": "视频文件太大无法处理",
    "video_error_browser_support": "您的浏览器不支持此视频格式",
    
    "video_feature_development": "功能开发中，即将推出！",
    "video_download_ready": "下载准备就绪！",
    "video_creating_download": "正在创建下载...",
    
    "video_trim_button": "裁剪视频",
    "video_convert_button": "转换视频",
    "video_merge_button": "合并视频",
    "video_compress_button": "压缩视频",
    "video_apply_effects_button": "应用效果",
    
    "video_loading_engine_button": "正在加载引擎...",
    "video_loading_ffmpeg": "正在加载FFmpeg...",
    
    "video_merge_min_files_alert": "请至少选择2个视频文件进行合并",
    "video_merge_prepare_alert": "准备合并以下视频：",
    "video_merge_development_alert": "功能开发中，敬请期待！",
    "video_merge_failed_alert": "合并失败。请检查文件格式和大小",
    "video_merge_two_files_alert": "请至少选择两个视频文件",
    
    "video_conversion_engine_loading": "正在加载视频转换引擎...",
    "video_conversion_engine_failed": "视频转换引擎加载失败",
    "video_format_converter_title_dynamic": "视频转换器",
    "video_format_converter_subtitle_dynamic": "在不同格式之间转换视频"
  },
  
  'zh-TW': {
    "_comment_video_dynamic_text": "視訊工具動態文字 - 進度、狀態和錯誤訊息",
    
    "video_engine_loading": "正在載入視訊處理引擎...",
    "video_engine_loaded": "✓ 視訊處理引擎已載入並準備就緒！",
    "video_engine_failed": "✗ 視訊處理引擎載入失敗。請重新整理頁面。",
    
    "video_trimming_progress": "裁剪中...",
    "video_loading_file": "正在載入檔案...",
    "video_trimming": "正在裁剪視訊...",
    "video_trimmed_success": "✓ 視訊裁剪完成！時長：{duration}秒",
    "video_trimming_failed": "裁剪失敗：{error}",
    
    "video_converting": "正在轉換視訊...",
    "video_conversion_success": "轉換成功！檔案已下載。",
    "video_conversion_failed": "轉換失敗：{error}",
    
    "video_compressing": "正在壓縮...",
    "video_compression_complete": "壓縮完成！",
    "video_compression_failed": "壓縮失敗：{error}",
    
    "video_merging": "正在合併視訊檔案...",
    "video_merge_success": "✓ 視訊檔案合併成功！",
    "video_merge_failed": "合併失敗：{error}",
    "video_merge_preparing": "正在準備檔案...",
    "video_merge_complete": "合併完成！",
    
    "video_effects_applying": "正在套用效果...",
    "video_effects_success": "效果套用成功！",
    "video_effects_failed": "效果套用失敗。請重試。",
    
    "video_error_no_file": "請選擇視訊檔案。",
    "video_error_invalid_file": "請選擇有效的視訊檔案！",
    "video_error_format_mismatch": "請選擇{format}格式的視訊檔案！",
    "video_error_min_files": "請選擇至少2個視訊檔案進行合併",
    "video_error_file_size": "視訊檔案太大無法處理",
    "video_error_browser_support": "您的瀏覽器不支援此視訊格式",
    
    "video_feature_development": "功能開發中，即將推出！",
    "video_download_ready": "下載準備就緒！",
    "video_creating_download": "正在建立下載...",
    
    "video_trim_button": "裁剪視訊",
    "video_convert_button": "轉換視訊",
    "video_merge_button": "合併視訊",
    "video_compress_button": "壓縮視訊",
    "video_apply_effects_button": "套用效果",
    
    "video_loading_engine_button": "正在載入引擎...",
    "video_loading_ffmpeg": "正在載入FFmpeg...",
    
    "video_merge_min_files_alert": "請至少選擇2個視訊檔案進行合併",
    "video_merge_prepare_alert": "準備合併以下視訊：",
    "video_merge_development_alert": "功能開發中，敬請期待！",
    "video_merge_failed_alert": "合併失敗。請檢查檔案格式和大小",
    "video_merge_two_files_alert": "請至少選擇兩個視訊檔案",
    
    "video_conversion_engine_loading": "正在載入視訊轉換引擎...",
    "video_conversion_engine_failed": "視訊轉換引擎載入失敗",
    "video_format_converter_title_dynamic": "視訊轉換器",
    "video_format_converter_subtitle_dynamic": "在不同格式之間轉換視訊"
  }
};

// 批量更新所有语言文件
Object.keys(videoTranslations).forEach(lang => {
  try {
    const filePath = `public/locales/${lang}.json`;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 添加新的翻译键
    Object.assign(data, videoTranslations[lang]);
    
    // 写回文件
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`✅ Updated ${lang}.json with video dynamic text translations`);
    
  } catch (error) {
    console.error(`❌ Error updating ${lang}.json:`, error.message);
  }
});

console.log('\n🎉 Video dynamic text translations added to all languages!');