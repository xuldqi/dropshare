#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public', 'locales');

// Fixed translations for problematic keys
const fixedTranslations = {
  'de': {
    "tool_document_editor": "Dokument-Bearbeiter",
    "tool_document_editor_desc": "Bearbeiten Sie Dokumentinhalte, fügen Sie Anmerkungen und Kommentare hinzu",
    "tool_password_protection": "Passwort-Schutz",
    "tool_password_protection_desc": "Passwort-Schutz für Dokumente hinzufügen oder entfernen"
  },
  'es': {
    "tool_document_editor": "Editor de Documentos",
    "tool_document_editor_desc": "Editar contenido de documentos, agregar anotaciones y comentarios",
    "tool_password_protection": "Protección con Contraseña",
    "tool_password_protection_desc": "Agregar o quitar protección con contraseña para documentos"
  },
  'fr': {
    "tool_document_editor": "Éditeur de Documents",
    "tool_document_editor_desc": "Modifier le contenu des documents, ajouter des annotations et commentaires",
    "tool_password_protection": "Protection par Mot de Passe",
    "tool_password_protection_desc": "Ajouter ou supprimer la protection par mot de passe pour les documents"
  },
  'ja': {
    "tool_document_editor": "ドキュメントエディター",
    "tool_document_editor_desc": "文書の内容を編集し、注釈やコメントを追加",
    "tool_password_protection": "パスワード保護",
    "tool_password_protection_desc": "文書のパスワード保護を追加または削除"
  },
  'ko': {
    "tool_document_editor": "문서 편집기",
    "tool_document_editor_desc": "문서 내용 편집, 주석 및 댓글 추가",
    "tool_password_protection": "비밀번호 보호",
    "tool_password_protection_desc": "문서에 비밀번호 보호 추가 또는 제거"
  },
  'pt': {
    "tool_document_editor": "Editor de Documentos",
    "tool_document_editor_desc": "Editar conteúdo de documentos, adicionar anotações e comentários",
    "tool_password_protection": "Proteção por Senha",
    "tool_password_protection_desc": "Adicionar ou remover proteção por senha para documentos"
  },
  'zh-CN': {
    "tool_document_editor": "文档编辑器",
    "tool_document_editor_desc": "编辑文档内容，添加注释和评论",
    "tool_password_protection": "密码保护",
    "tool_password_protection_desc": "为文档添加或移除密码保护"
  },
  'zh-TW': {
    "tool_document_editor": "文件編輯器",
    "tool_document_editor_desc": "編輯文件內容，添加註釋和評論",
    "tool_password_protection": "密碼保護",
    "tool_password_protection_desc": "為文件添加或移除密碼保護"
  }
};

async function fixTranslations() {
  console.log('🔧 Fixing document tools translation errors...');
  
  for (const [language, fixes] of Object.entries(fixedTranslations)) {
    const filePath = path.join(localesDir, `${language}.json`);
    
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let data = JSON.parse(fileContent);
        
        // Apply fixes
        Object.assign(data, fixes);
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ Fixed ${language}.json: ${Object.keys(fixes).length} translations corrected`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${language}.json:`, error.message);
    }
  }
  
  console.log('✨ All translation fixes completed!');
}

fixTranslations().catch(console.error);