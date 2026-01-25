/**
 * NotionAIWriter - AI-powered content writer for Notion
 * 
 * Uses GLM 4.7 (Cerebras) to generate content and writes to Notion pages
 */

import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wand2,
    Send,
    Loader2,
    X,
    Sparkles,
    FileText,
    ChevronDown,
    Check,
    AlertCircle
} from 'lucide-react';
import * as notionService from '../../services/notionService';
import styles from './NotionAIWriter.module.css';

// =============================================================================
// AI Service
// =============================================================================

const NOTION_WRITER_PROMPT = `You are a Notion page writer. Generate clean, well-formatted content for Notion pages.

Guidelines:
- Use markdown formatting (headers, bold, lists, code blocks)
- Be concise but comprehensive
- Structure content with clear sections
- Use bullet points for lists
- Include relevant details

Output ONLY the content, no meta-commentary.`;

async function generateContent(prompt, pageContext = '') {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            provider: 'cerebras',
            model: 'zai-glm-4.7',
            messages: [
                { role: 'system', content: NOTION_WRITER_PROMPT },
                ...(pageContext ? [{ role: 'user', content: `Context about existing page:\n${pageContext}` }] : []),
                { role: 'user', content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to generate content');
    }

    const data = await response.json();
    return data.content;
}

/**
 * Convert markdown text to Notion blocks
 */
function markdownToNotionBlocks(markdown) {
    const lines = markdown.split('\n');
    const blocks = [];
    let inCodeBlock = false;
    let codeContent = [];
    let codeLanguage = '';

    for (const line of lines) {
        // Code block handling
        if (line.startsWith('```')) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeLanguage = line.slice(3).trim() || 'plain text';
                codeContent = [];
            } else {
                blocks.push({
                    type: 'code',
                    code: {
                        rich_text: [{ type: 'text', text: { content: codeContent.join('\n') } }],
                        language: codeLanguage.toLowerCase()
                    }
                });
                inCodeBlock = false;
            }
            continue;
        }

        if (inCodeBlock) {
            codeContent.push(line);
            continue;
        }

        // Skip empty lines
        if (!line.trim()) continue;

        // Headers
        if (line.startsWith('### ')) {
            blocks.push({
                type: 'heading_3',
                heading_3: { rich_text: [{ type: 'text', text: { content: line.slice(4) } }] }
            });
        } else if (line.startsWith('## ')) {
            blocks.push({
                type: 'heading_2',
                heading_2: { rich_text: [{ type: 'text', text: { content: line.slice(3) } }] }
            });
        } else if (line.startsWith('# ')) {
            blocks.push({
                type: 'heading_1',
                heading_1: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] }
            });
        }
        // Bullet lists
        else if (line.startsWith('- ') || line.startsWith('* ')) {
            blocks.push({
                type: 'bulleted_list_item',
                bulleted_list_item: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] }
            });
        }
        // Numbered lists
        else if (/^\d+\.\s/.test(line)) {
            blocks.push({
                type: 'numbered_list_item',
                numbered_list_item: { rich_text: [{ type: 'text', text: { content: line.replace(/^\d+\.\s/, '') } }] }
            });
        }
        // Regular paragraph
        else {
            blocks.push({
                type: 'paragraph',
                paragraph: { rich_text: [{ type: 'text', text: { content: line } }] }
            });
        }
    }

    return blocks;
}

// =============================================================================
// Component
// =============================================================================

function NotionAIWriter({ pages = [], onContentAdded }) {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [selectedPage, setSelectedPage] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [generatedContent, setGeneratedContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isWriting, setIsWriting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return;

        setError('');
        setGeneratedContent('');
        setIsGenerating(true);

        try {
            const content = await generateContent(prompt);
            setGeneratedContent(content);
        } catch (err) {
            setError(err.message || 'Failed to generate content');
        } finally {
            setIsGenerating(false);
        }
    }, [prompt]);

    const handleWriteToPage = useCallback(async () => {
        if (!selectedPage || !generatedContent) return;

        setError('');
        setSuccess('');
        setIsWriting(true);

        try {
            const blocks = markdownToNotionBlocks(generatedContent);

            // Append blocks to the selected page
            await fetch(`/api/notion/pages/${selectedPage.id}/blocks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ children: blocks })
            });

            // Use Notion API directly to append
            const response = await fetch('/api/notion/blocks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    block_id: selectedPage.id,
                    children: blocks
                })
            });

            if (!response.ok) {
                throw new Error('Failed to write to page');
            }

            setSuccess(`Content added to "${notionService.getPageTitle(selectedPage.properties)}"`);
            setGeneratedContent('');
            setPrompt('');
            onContentAdded?.();

            // Auto-close after success
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to write to Notion');
        } finally {
            setIsWriting(false);
        }
    }, [selectedPage, generatedContent, onContentAdded]);

    const handleCreateNewPage = useCallback(async () => {
        if (!generatedContent || pages.length === 0) return;

        setError('');
        setSuccess('');
        setIsWriting(true);

        try {
            // Extract title from first heading or use prompt
            const firstLine = generatedContent.split('\n')[0];
            const title = firstLine.startsWith('#')
                ? firstLine.replace(/^#+\s*/, '')
                : prompt.slice(0, 50);

            const blocks = markdownToNotionBlocks(generatedContent);

            // Create new page under first available page
            const parentPage = pages[0];
            const newPage = await notionService.createPage({
                parent: { page_id: parentPage.id },
                properties: {
                    title: { title: [{ text: { content: title } }] }
                },
                children: blocks
            });

            setSuccess(`Created new page: "${title}"`);
            setGeneratedContent('');
            setPrompt('');
            onContentAdded?.();

            // Open the new page
            window.open(newPage.url, '_blank');

            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Failed to create page');
        } finally {
            setIsWriting(false);
        }
    }, [generatedContent, prompt, pages, onContentAdded]);

    return (
        <>
            {/* Trigger Button */}
            <button
                className={styles.triggerBtn}
                onClick={() => setIsOpen(true)}
                title="AI Writer"
            >
                <Wand2 size={18} />
                <span>AI Write</span>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className={styles.header}>
                                <div className={styles.headerTitle}>
                                    <Sparkles className={styles.sparkles} size={20} />
                                    <h3>AI Writer</h3>
                                    <span className={styles.badge}>GLM 4.7</span>
                                </div>
                                <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className={styles.content}>
                                {/* Prompt Input */}
                                <div className={styles.promptSection}>
                                    <label>What do you want to write?</label>
                                    <div className={styles.promptInput}>
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="e.g., Write a project plan for building a mobile app..."
                                            rows={3}
                                            disabled={isGenerating}
                                        />
                                        <button
                                            className={styles.generateBtn}
                                            onClick={handleGenerate}
                                            disabled={!prompt.trim() || isGenerating}
                                        >
                                            {isGenerating ? (
                                                <Loader2 className={styles.spinner} size={18} />
                                            ) : (
                                                <Send size={18} />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Generated Content */}
                                {generatedContent && (
                                    <motion.div
                                        className={styles.generatedSection}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                    >
                                        <label>Generated Content</label>
                                        <div className={styles.generatedContent}>
                                            <pre>{generatedContent}</pre>
                                        </div>

                                        {/* Page Selector */}
                                        <div className={styles.pageSelector}>
                                            <label>Write to:</label>
                                            <div className={styles.dropdown}>
                                                <button
                                                    className={styles.dropdownTrigger}
                                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                >
                                                    {selectedPage ? (
                                                        <>
                                                            <FileText size={16} />
                                                            <span>{notionService.getPageTitle(selectedPage.properties)}</span>
                                                        </>
                                                    ) : (
                                                        <span className={styles.placeholder}>Select a page...</span>
                                                    )}
                                                    <ChevronDown size={16} />
                                                </button>

                                                {isDropdownOpen && (
                                                    <motion.div
                                                        className={styles.dropdownMenu}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        {pages.slice(0, 10).map((page) => (
                                                            <button
                                                                key={page.id}
                                                                className={styles.dropdownItem}
                                                                onClick={() => {
                                                                    setSelectedPage(page);
                                                                    setIsDropdownOpen(false);
                                                                }}
                                                            >
                                                                <FileText size={14} />
                                                                <span>{notionService.getPageTitle(page.properties)}</span>
                                                                {selectedPage?.id === page.id && <Check size={14} />}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.newPageBtn}
                                                onClick={handleCreateNewPage}
                                                disabled={isWriting || pages.length === 0}
                                            >
                                                {isWriting ? <Loader2 className={styles.spinner} size={16} /> : null}
                                                Create New Page
                                            </button>
                                            <button
                                                className={styles.appendBtn}
                                                onClick={handleWriteToPage}
                                                disabled={isWriting || !selectedPage}
                                            >
                                                {isWriting ? <Loader2 className={styles.spinner} size={16} /> : null}
                                                Append to Page
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Messages */}
                                {error && (
                                    <motion.div
                                        className={styles.error}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <AlertCircle size={16} />
                                        {error}
                                    </motion.div>
                                )}

                                {success && (
                                    <motion.div
                                        className={styles.success}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <Check size={16} />
                                        {success}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default memo(NotionAIWriter);
