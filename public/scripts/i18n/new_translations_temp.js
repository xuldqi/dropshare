// 临时文件：收集所有新增的翻译键
// 将会被添加到languages.js中

const NEW_TRANSLATIONS_EN = {
    // ============ 工具页面翻译键 ============
    
    // === Image Tools Page ===
    'image_tools_title': 'Image Tools',
    'image_tools_subtitle': 'Free Online Image Processing Tools',
    
    // Tool Cards
    'tool_image_compressor_title': 'Image Compressor',
    'tool_image_compressor_desc': 'Reduce image file size while maintaining quality for web and storage optimization',
    'tool_compression_rate': '📦 Up to 90% compression',
    'tool_instant': '⚡ Instant',
    
    'tool_format_converter_title': 'Format Converter',
    'tool_format_converter_desc': 'Convert images between different formats like JPG, PNG, WebP, GIF, and more',
    'tool_formats_count': '📂 6+ formats',
    'tool_batch_convert': '🔄 Batch convert',
    
    'tool_image_resizer_title': 'Image Resizer',
    'tool_image_resizer_desc': 'Resize images to specific dimensions while maintaining aspect ratio and quality',
    'tool_precise_control': '🎯 Precise control',
    'tool_aspect_ratio_lock': '📐 Aspect ratio lock',
    
    'tool_image_rotator_title': 'Image Rotator',
    'tool_image_rotator_desc': 'Rotate images to any angle with precise control and automatic background fill',
    'tool_any_angle': '🔄 Any angle',
    'tool_flip_mirror': '↔️ Flip & mirror',
    
    'tool_image_cropper_title': 'Image Cropper',
    'tool_image_cropper_desc': 'Crop images to exact dimensions with smart selection tools and preset ratios',
    'tool_precise_crop': '✂️ Precise crop',
    'tool_smart_selection': '🎯 Smart selection',
    
    'tool_watermark_tool_title': 'Watermark Tool',
    'tool_watermark_tool_desc': 'Add text or image watermarks to protect your images with customizable positioning',
    'tool_text_image_watermark': '💧 Text & image watermark',
    'tool_custom_positioning': '📍 Custom positioning',
    
    'tool_background_remover_title': 'Background Remover',
    'tool_background_remover_desc': 'Remove image backgrounds automatically using AI-powered detection technology',
    'tool_ai_powered': '🤖 AI-powered',
    'tool_one_click_removal': '⚡ One-click removal',
    
    'tool_filter_effects_title': 'Filter Effects',
    'tool_filter_effects_desc': 'Apply professional photo filters and effects to enhance your images creatively',
    'tool_professional_filters': '🎨 Professional filters',
    'tool_creative_effects': '✨ Creative effects',
    
    'tool_color_palette_title': 'Color Palette',
    'tool_color_palette_desc': 'Extract dominant colors from images to create beautiful color palettes for design',
    'tool_color_extraction': '🎨 Color extraction',
    'tool_design_inspiration': '💡 Design inspiration',
    
    // Categories
    'category_popular': 'Popular',
    'category_essential': 'Essential',
    'category_pro': 'Pro',
    'category_ai_powered': 'AI-Powered',
    'category_creative': 'Creative',
    
    // === Audio Tools Page ===
    'audio_tools_title': 'Audio Tools',
    'audio_tools_subtitle': 'Professional Audio Processing Tools',
    
    'tool_mp3_to_wav_title': 'MP3转WAV',
    'tool_mp3_to_wav_desc': '将MP3音频文件转换为无损WAV格式，保持原始音质',
    'tool_wav_to_mp3_title': 'WAV转MP3',
    'tool_wav_to_mp3_desc': '将大体积WAV文件压缩为MP3格式，节省存储空间',
    'tool_flac_to_mp3_title': 'FLAC转MP3',
    'tool_flac_to_mp3_desc': '将无损FLAC音频转换为通用MP3格式，便于播放',
    'tool_wav_to_flac_title': 'WAV转FLAC',
    'tool_wav_to_flac_desc': '将WAV文件转换为FLAC无损压缩格式',
    'tool_mp3_to_aac_title': 'MP3转AAC',
    'tool_mp3_to_aac_desc': '转换为Apple设备优化的AAC格式',
    'tool_aac_to_mp3_title': 'AAC转MP3',
    'tool_aac_to_mp3_desc': '将AAC音频转换为兼容性更好的MP3格式',
    'tool_ogg_to_mp3_title': 'OGG转MP3',
    'tool_ogg_to_mp3_desc': '将开源OGG Vorbis格式转换为主流MP3格式',
    'tool_wav_to_aac_title': 'WAV转AAC',
    'tool_wav_to_aac_desc': '转换为移动设备友好的AAC格式',
    'tool_universal_audio_converter_title': '通用音频转换器',
    'tool_universal_audio_converter_desc': '支持所有主流音频格式之间的相互转换',
    
    // Audio categories
    'category_quality': 'Quality',
    'category_apple': 'Apple',
    'category_universal': 'Universal',
    'category_open_source': 'Open Source',
    'category_mobile': 'Mobile',
    'category_advanced': 'Advanced',
    
    // Audio stats
    'tool_mobile_friendly': '📱 Mobile friendly',
    'tool_fast_conversion': '⚡ Fast conversion',
    'tool_compression': '🗜️ Compression',
    'tool_universal_format': '🌐 Universal format',
    'tool_lossless_quality': '🎵 Lossless quality',
    'tool_apple_optimized': '🍎 Apple optimized',
    'tool_open_format': '🔓 Open format',
    'tool_all_formats': '🎼 All formats',
    
    // === Video Tools Page ===
    'video_tools_title': 'Video Tools',
    'video_tools_subtitle': 'Professional Video Processing Tools',
    
    'tool_avi_to_mp4_title': 'AVI转MP4',
    'tool_avi_to_mp4_desc': '将经典AVI格式转换为现代MP4格式，提高兼容性',
    'tool_mov_to_mp4_title': 'MOV转MP4',
    'tool_mov_to_mp4_desc': '将Apple QuickTime MOV文件转换为通用MP4格式',
    'tool_webm_to_mp4_title': 'WebM转MP4',
    'tool_webm_to_mp4_desc': '将网页优化的WebM格式转换为主流MP4格式',
    'tool_mp4_to_webm_title': 'MP4转WebM',
    'tool_mp4_to_webm_desc': '转换为网页播放优化的WebM格式',
    'tool_avi_to_webm_title': 'AVI转WebM',
    'tool_avi_to_webm_desc': '将AVI视频转换为现代网页格式WebM',
    'tool_mov_to_webm_title': 'MOV转WebM',
    'tool_mov_to_webm_desc': '将MOV格式转换为开源WebM格式',
    'tool_mp4_to_avi_title': 'MP4转AVI',
    'tool_mp4_to_avi_desc': '转换为兼容老式播放器的AVI格式',
    'tool_mp4_to_mov_title': 'MP4转MOV',
    'tool_mp4_to_mov_desc': '转换为Apple设备优化的MOV格式',
    'tool_universal_video_converter_title': '通用视频转换器',
    'tool_universal_video_converter_desc': '支持所有主流视频格式之间的自由转换',
    
    // Video categories
    'category_web': 'Web',
    'category_modern': 'Modern',
    'category_legacy': 'Legacy',
    
    // Video stats
    'tool_classic_format': '📼 Classic format',
    'tool_web_format': '🌐 Web format',
    'tool_all_video_formats': '🎬 All formats',
    
    // === Document Tools Page ===
    'document_tools_title': 'Document Tools',
    'document_tools_subtitle': 'Comprehensive Document Processing Suite',
    
    'tool_text_converter_title': 'Text Converter',
    'tool_text_converter_desc': 'Convert between different text formats and encodings with batch processing support',
    'tool_data_converter_title': 'Data Converter',
    'tool_data_converter_desc': 'Transform data between JSON, XML, CSV, and other structured formats easily',
    'tool_docx_to_html_title': 'DOCX to HTML',
    'tool_docx_to_html_desc': 'Convert Microsoft Word documents to clean, web-ready HTML format',
    'tool_docx_to_text_title': 'DOCX to Text',
    'tool_docx_to_text_desc': 'Extract plain text content from Word documents for easy editing',
    'tool_xlsx_to_csv_title': 'XLSX to CSV',
    'tool_xlsx_to_csv_desc': 'Convert Excel spreadsheets to comma-separated values format',
    'tool_csv_to_xlsx_title': 'CSV to XLSX',
    'tool_csv_to_xlsx_desc': 'Transform CSV data into formatted Excel spreadsheets',
    'tool_url_encoder_decoder_title': 'URL Encoder/Decoder',
    'tool_url_encoder_decoder_desc': 'Encode and decode URLs for web development and data processing',
    'tool_word_counter_title': 'Word Counter',
    'tool_word_counter_desc': 'Count words, characters, and paragraphs in your text documents',
    'tool_base64_encoder_decoder_title': 'Base64 Encoder/Decoder',
    'tool_base64_encoder_decoder_desc': 'Encode and decode Base64 strings for data transmission',
    'tool_qr_code_generator_title': 'QR Code Generator',
    'tool_qr_code_generator_desc': 'Generate customizable QR codes for URLs, text, and contact information',
    'tool_hash_generator_title': 'Hash Generator',
    'tool_hash_generator_desc': 'Generate MD5, SHA-1, SHA-256, and other cryptographic hashes',
    'tool_document_processor_title': 'Document Processor',
    'tool_document_processor_desc': 'Advanced document processing with OCR, text extraction, and format conversion',
    
    // Document categories
    'category_office': 'Office',
    'category_text_tools': 'Text Tools',
    'category_encoding': 'Encoding',
    'category_utilities': 'Utilities',
    'category_security': 'Security',
    
    // Document stats
    'tool_6_formats': '📄 6 formats',
    'tool_api_ready': '🔌 API ready',
    'tool_word_docs': '📝 Word docs',
    'tool_web_ready': '🌐 Web ready',
    'tool_spreadsheets': '📊 Spreadsheets',
    'tool_encoding_decoding': '🔐 Encoding/Decoding',
    'tool_text_analysis': '📊 Text analysis',
    'tool_data_encoding': '🔒 Data encoding',
    'tool_qr_codes': '📱 QR codes',
    'tool_cryptographic': '🛡️ Cryptographic',
    'tool_ocr_extraction': '👁️ OCR & extraction',
    
    // ============ 转换器页面翻译键 ============
    
    // === Image Converter ===
    'image_converter_title': 'Image Format Converter',
    'image_converter_subtitle': 'Convert your images to different formats',
    'back_to_image_tools': 'Back to Image Tools',
    
    // === Audio Converter ===
    'audio_converter_title': 'Audio Format Converter',
    'audio_converter_subtitle': 'Convert your audio files to different formats',
    'back_to_audio_tools': 'Back to Audio Tools',
    
    // === Video Converter ===
    'video_converter_title': 'Video Format Converter',
    'video_converter_subtitle': 'Convert your video files to different formats',
    'back_to_video_tools': 'Back to Video Tools',
    
    // === Converter Interface ===
    'btn_select_files': 'Select Files',
    'btn_convert': 'Convert',
    'btn_clear': 'Clear',
    'btn_download': 'Download',
    'btn_share': 'Share',
    'btn_share_all': 'Share All Files',
    'btn_upload_from_pc': 'Upload from PC',
    'btn_home': 'Home',
    
    'drop_files_here': 'Drop files here',
    'label_output_format': 'Output Format:',
    'label_conversion_settings': 'Conversion Settings',
    'label_quick_presets': 'Quick Presets',
    'label_image_quality': 'Image Quality',
    'label_compression_rate': 'Compression Rate',
    'label_estimated_size': 'Estimated Size',
    'label_image_dimensions': 'Image Dimensions',
    'label_width': 'Width',
    'label_height': 'Height',
    'label_maintain_aspect_ratio': 'Maintain Aspect Ratio',
    'label_conversion_progress': 'Conversion Progress',
    'label_conversion_results': 'Conversion Results',
    
    // Formats
    'format_jpeg': 'JPEG',
    'format_png': 'PNG',
    'format_webp': 'WebP',
    'format_gif': 'GIF',
    'format_bmp': 'BMP',
    'format_tiff': 'TIFF',
    'format_ico': 'ICO',
    'format_avif': 'AVIF',
    'format_mp3': 'MP3',
    'format_wav': 'WAV',
    'format_aac': 'AAC',
    'format_ogg': 'OGG',
    'format_flac': 'FLAC',
    'format_mp4': 'MP4',
    'format_webm': 'WebM',
    'format_avi': 'AVI',
    'format_mov': 'MOV',
    
    // Presets
    'preset_high_quality': 'High Quality',
    'preset_balanced': 'Balanced',
    'preset_high_compress': 'High Compression',
    'preset_web_optimized': 'Web Optimized',
    
    // Status
    'status_preparing': 'Preparing conversion...',
    'status_converting': 'Converting...',
    'status_complete': 'Conversion complete',
    'status_processing': 'Processing...',
    
    // Device Modal
    'modal_select_devices': 'Select Devices to Send',
    'btn_cancel': 'Cancel',
    'btn_send_to_devices': 'Send to Devices',
    'no_devices_found': 'No devices found',
    'device_connection_instruction': 'Make sure devices are on the same network',
    
    // Other
    'supported_formats_image': 'Supported formats: JPG, PNG, WebP, GIF, BMP, TIFF',
    'supported_formats_audio': 'Supported formats: MP3, WAV, AAC, OGG, FLAC',
    'supported_formats_video': 'Supported formats: MP4, WebM, AVI, MOV',
    'footer_file_deletion_notice': 'Files are automatically deleted after conversion',
    'rating_help_improve': 'Rate this tool to help us improve',
    'title_select_language': 'Select Language',
    
    // ============ Blog页面翻译键 ============
    'blog_page_title': 'DropShare Blog',
    
    // Blog Post 1: 安全文件共享指南
    'blog_post_secure_file_sharing_guide_date': '2024年3月20日',
    'blog_post_secure_file_sharing_guide_category': '安全指南',
    'blog_post_secure_file_sharing_guide_title': '安全文件共享指南：保护你的数据传输',
    'blog_post_secure_file_sharing_guide_p1': '在数字化时代，文件共享已成为日常工作和生活的重要组成部分。然而，随着网络安全威胁的不断增加，如何安全地共享文件变得至关重要。',
    'blog_post_secure_file_sharing_guide_p2': 'DropShare采用点对点(P2P)技术，确保文件直接在设备间传输，不经过第三方服务器。这种方式大大降低了数据泄露的风险，让用户能够更安全地共享敏感文件。',
    'blog_post_secure_file_sharing_guide_p3': '此外，所有传输都采用端到端加密，即使在传输过程中被拦截，攻击者也无法解读文件内容。建议用户在共享重要文件时，始终选择支持加密传输的工具。',
    
    // Blog Post 2: 文件传输加速技巧
    'blog_post_speed_up_transfers_date': '2024年3月15日',
    'blog_post_speed_up_transfers_category': '使用技巧',
    'blog_post_speed_up_transfers_title': '文件传输加速技巧：让大文件传输更快速',
    'blog_post_speed_up_transfers_p1': '大文件传输一直是用户关心的问题。无论是视频、高清图片还是大型文档，传输速度都直接影响工作效率。以下是一些实用的加速技巧：',
    'blog_post_speed_up_transfers_p2': '通过优化这些设置和环境因素，用户可以显著提升文件传输速度，特别是在处理大容量文件时：',
    'blog_post_speed_up_transfers_li1': '确保设备连接到同一个5GHz WiFi网络',
    'blog_post_speed_up_transfers_li2': '关闭不必要的后台应用和下载任务',
    'blog_post_speed_up_transfers_li3': '使用有线连接替代WiFi（如果可能）',
    'blog_post_speed_up_transfers_li4': '选择合适的文件压缩格式',
    'blog_post_speed_up_transfers_li5': '分批传输多个大文件而非同时传输',
    
    // Blog Post 3: WebRTC技术解析
    'blog_post_webrtc_technology_date': '2024年3月10日',
    'blog_post_webrtc_technology_category': '技术解析',
    'blog_post_webrtc_technology_title': 'WebRTC技术解析：理解现代P2P文件传输',
    'blog_post_webrtc_technology_p1': 'WebRTC（Web Real-Time Communication）是一项革命性的网络通信技术，它使得浏览器之间可以直接进行实时通信，无需插件或第三方软件。',
    'blog_post_webrtc_technology_p2': 'DropShare正是基于WebRTC技术构建，这使得文件传输具备了以下独特优势：',
    'blog_post_webrtc_technology_p3': 'WebRTC的NAT穿透技术让设备能够在复杂的网络环境中建立直接连接，这是传统文件传输方案难以做到的。',
    'blog_post_webrtc_technology_li1': '无需服务器中转，数据直接在设备间传输',
    'blog_post_webrtc_technology_li2': '内置加密机制，确保传输安全',
    'blog_post_webrtc_technology_li3': '自动网络优化，适应不同网络环境',
    'blog_post_webrtc_technology_li4': '跨平台兼容，支持所有现代浏览器',
    
    // Footer sections
    'footer_navigate': 'Navigate',
    'footer_tools': 'Tools',
    'footer_features': 'Features',
    
    // Common buttons and labels
    'btn_read_more': 'Read More',
    'btn_search': 'Search',
    'search_posts_placeholder': 'Search posts...',
    'search_tools_placeholder': 'Search tools...',
    'back_to_home': 'Back to Home',
};

console.log('Total new translation keys:', Object.keys(NEW_TRANSLATIONS_EN).length);