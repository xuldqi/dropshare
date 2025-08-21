// document-processor.html页面需要的翻译键
const documentProcessorTranslations = {
    // 页面标题和标头
    'document_processor_title': '文档处理器',
    'document_processor_heading': '📄 文档处理器',
    'back_to_document_tools': '← 文档工具',
    
    // 文件上传区域
    'drop_documents_here': '拖拽文档文件到这里或点击选择',
    'supported_formats_document': '支持 PDF, DOCX, TXT, RTF, HTML 等格式',
    'btn_select_document': '选择文档文件',
    
    // 预览区域
    'document_preview': '文档预览',
    'select_file_to_preview': '请选择文档文件来预览',
    
    // 选项卡
    'tab_split': '文档拆分',
    'tab_merge': '文档合并',
    
    // 文档拆分
    'split_settings': '✂️ 文档拆分设置',
    'split_method_label': '拆分方式:',
    'split_by_pages': '按页数拆分',
    'split_by_range': '按范围拆分',
    'split_by_bookmarks': '按书签拆分',
    'pages_per_file': '每个文件页数:',
    'page_range': '页面范围 (例: 1-5,7,9-12):',
    
    // 文档合并
    'merge_settings': '🔗 文档合并设置',
    'merge_description': '将多个PDF文档合并为一个文档。请上传多个文件。',
    'select_merge_files': '选择要合并的文档',
    'add_bookmarks_label': '为每个文档添加书签',
    
    // 输出设置
    'output_settings': '输出设置',
    'output_format': '输出格式:',
    'pdf_format': 'PDF',
    'docx_format': 'Word 文档 (.docx)',
    'txt_format': '纯文本',
    'rtf_format': 'RTF 文档',
    'filename': '文件名:',
    
    // 按钮
    'btn_process': '开始处理',
    'btn_new_file': '选择新文档',
    'btn_process_another': '处理其他文档',
    
    // 错误和状态消息
    'unsupported_format': '不支持的文档格式！请选择 PDF, DOCX, TXT, RTF 或 HTML 文件。',
    'document_parse_failed': '文档解析失败',
    'pdf_loaded': 'PDF文档已加载，正在解析...',
    'pdf_parse_success': 'PDF解析成功',
    'pdf_parse_failed': 'PDF解析失败',
    'no_preview_available': '无法预览此文档内容',
    'pdf_page_prefix': 'PDF第',
    'pdf_page_suffix': '页 - 无法提取文本内容',
    'document_processing_failed': '文档处理失败',
    'text_extraction_failed': '未能提取到文本内容。这可能是一个图片型PDF或扫描文档。',
    
    // 处理状态
    'processing_document': '正在拆分文档...',
    'creating_document': '正在创建第',
    'document_number_suffix': '个文档...',
    'split_complete': '文档拆分完成！',
    'merging_documents': '正在合并文档...',
    'processing_document_number': '正在处理第',
    'merge_complete': '文档合并完成！',
    'converted_content': '转换后的文档内容',
    
    // 文件信息
    'document_type': '文档类型',
    'file_size': '文件大小',
    'delete_button': '删除'
};

console.log('Document processor translations defined:', Object.keys(documentProcessorTranslations).length, 'keys');