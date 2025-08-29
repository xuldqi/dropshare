// 结构化数据 (JSON-LD) 配置
window.DropshareStructuredData = {
    // 生成网站结构化数据
    generateWebsiteSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "DropShare",
            "url": "https://dropshare.tech/",
            "description": "Free online tools for file sharing, image editing, audio/video conversion, PDF processing, and document tools. No registration required.",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://dropshare.tech/?search={search_term_string}",
                "query-input": "required name=search_term_string"
            },
            "sameAs": [
                "https://github.com/xuldqi/dropshare"
            ],
            "publisher": {
                "@type": "Organization",
                "name": "DropShare",
                "url": "https://dropshare.tech/"
            }
        };
    },

    // 生成组织结构化数据
    generateOrganizationSchema() {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DropShare",
            "url": "https://dropshare.tech/",
            "logo": "https://dropshare.tech/images/favicon-96x96.png",
            "description": "Free online file sharing and conversion tools platform",
            "foundingDate": "2024",
            "sameAs": [
                "https://github.com/xuldqi/dropshare"
            ],
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://dropshare.tech/"
            }
        };
    },

    // 生成工具应用结构化数据
    generateToolSchema(toolName, toolDescription, toolUrl) {
        return {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": toolName,
            "description": toolDescription,
            "url": toolUrl,
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Web Browser",
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            },
            "publisher": {
                "@type": "Organization",
                "name": "DropShare"
            }
        };
    },

    // 生成面包屑导航结构化数据
    generateBreadcrumbSchema(breadcrumbs) {
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name,
                "item": item.url
            }))
        };
    },

    // 生成FAQ结构化数据
    generateFAQSchema(faqs) {
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        };
    },

    // 生成HowTo结构化数据
    generateHowToSchema(title, description, steps) {
        return {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": title,
            "description": description,
            "step": steps.map((step, index) => ({
                "@type": "HowToStep",
                "position": index + 1,
                "name": step.name,
                "text": step.text,
                "image": step.image || null
            }))
        };
    },

    // 添加结构化数据到页面
    addStructuredData(schema) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema, null, 2);
        document.head.appendChild(script);
    },

    // 初始化页面结构化数据
    init() {
        // 添加网站结构化数据
        this.addStructuredData(this.generateWebsiteSchema());
        
        // 添加组织结构化数据
        this.addStructuredData(this.generateOrganizationSchema());

        // 根据当前页面添加特定结构化数据
        this.addPageSpecificStructuredData();
    },

    // 根据页面添加特定结构化数据
    addPageSpecificStructuredData() {
        const currentPath = window.location.pathname;
        
        // 主页
        if (currentPath === '/' || currentPath === '/index.html') {
            // 添加工具集合结构化数据
            const toolsSchema = {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "DropShare Tools Collection",
                "description": "Collection of free online file processing tools",
                "numberOfItems": 20,
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": "File Transfer",
                            "url": "https://dropshare.tech/share.html"
                        }
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": "Audio Converter",
                            "url": "https://dropshare.tech/audio-converter.html"
                        }
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": "Video Converter",
                            "url": "https://dropshare.tech/video-converter.html"
                        }
                    },
                    {
                        "@type": "ListItem",
                        "position": 4,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": "PDF to Word",
                            "url": "https://dropshare.tech/pdf-to-word.html"
                        }
                    }
                ]
            };
            this.addStructuredData(toolsSchema);
        }

        // 音频工具页面
        if (currentPath === '/audio-tools.html') {
            const audioToolsSchema = {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "Audio Tools",
                "description": "Free online audio processing and conversion tools",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": "Audio Processor",
                            "url": "https://dropshare.tech/audio-processor.html"
                        }
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": "Audio Converter",
                            "url": "https://dropshare.tech/audio-converter.html"
                        }
                    }
                ]
            };
            this.addStructuredData(audioToolsSchema);
        }

        // 视频工具页面
        if (currentPath === '/video-tools.html') {
            const videoToolsSchema = {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "Video Tools",
                "description": "Free online video processing and conversion tools",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": "Video Converter",
                            "url": "https://dropshare.tech/video-converter.html"
                        }
                    }
                ]
            };
            this.addStructuredData(videoToolsSchema);
        }

        // 文档工具页面
        if (currentPath === '/document-tools.html') {
            const documentToolsSchema = {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "name": "Document Tools",
                "description": "Free online document processing and conversion tools",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": "Document Processor",
                            "url": "https://dropshare.tech/document-processor.html"
                        }
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": "PDF to Word",
                            "url": "https://dropshare.tech/pdf-to-word.html"
                        }
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": "DOCX to HTML",
                            "url": "https://dropshare.tech/docx-to-html.html"
                        }
                    },
                    {
                        "@type": "ListItem",
                        "position": 4,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": "DOCX to TXT",
                            "url": "https://dropshare.tech/docx-to-txt.html"
                        }
                    },
                    {
                        "@type": "ListItem",
                        "position": 5,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": "XLSX to CSV",
                            "url": "https://dropshare.tech/xlsx-to-csv.html"
                        }
                    },
                    {
                        "@type": "ListItem",
                        "position": 6,
                        "item": {
                            "@type": "SoftwareApplication",
                            "name": "CSV to XLSX",
                            "url": "https://dropshare.tech/csv-to-xlsx.html"
                        }
                    }
                ]
            };
            this.addStructuredData(documentToolsSchema);
        }
    }
};

// 页面加载完成后初始化结构化数据
document.addEventListener('DOMContentLoaded', () => {
    if (window.DropshareStructuredData) {
        window.DropshareStructuredData.init();
    }
});
