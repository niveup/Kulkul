/**
 * NotionPanel - Premium Notion Integration Component
 * 
 * Features:
 * - Search with debounce
 * - Page list with gradient cards
 * - Quick actions (open, refresh)
 * - Create page modal
 * - AI Writer (GLM 4.7)
 * - Inline page editor
 * - Loading skeletons
 * - Empty states
 */

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    RefreshCw,
    Plus,
    ExternalLink,
    FileText,
    Database,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    Loader2,
    Sparkles,
    X,
    Edit3,
    Save,
    Eye
} from 'lucide-react';
import useNotionStore, {
    selectPages,
    selectPagesLoading,
    selectPagesError,
    selectIsInitialized
} from '../../store/notionStore';
import { getPageTitle, getPageIcon, formatNotionDate } from '../../services/notionService';
import NotionAIWriter from './NotionAIWriter';
import styles from './NotionPanel.module.css';

// =============================================================================
// Sub-Components
// =============================================================================

/**
 * Page card with gradient border and hover effects
 */
const PageCard = memo(function PageCard({ page, index, onOpen }) {
    const title = getPageTitle(page.properties);
    const icon = getPageIcon(page);
    const isDatabase = page.object === 'database';
    const lastEdited = formatNotionDate(page.last_edited_time);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={styles.pageCard}
            onClick={() => onOpen(page)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onOpen(page)}
        >
            <div className={styles.pageCardGlow} />
            <div className={styles.pageCardContent}>
                <div className={styles.pageIcon}>
                    {icon.type === 'emoji' ? (
                        <span className={styles.emoji}>{icon.value}</span>
                    ) : isDatabase ? (
                        <Database className={styles.iconSvg} />
                    ) : (
                        <FileText className={styles.iconSvg} />
                    )}
                </div>
                <div className={styles.pageInfo}>
                    <h4 className={styles.pageTitle}>{title}</h4>
                    <span className={styles.pageMeta}>{lastEdited}</span>
                </div>
                <ChevronRight className={styles.chevron} />
            </div>
        </motion.div>
    );
});

/**
 * Loading skeleton for page cards
 */
const PageSkeleton = memo(function PageSkeleton({ count = 4 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={styles.skeleton}>
                    <div className={styles.skeletonIcon} />
                    <div className={styles.skeletonContent}>
                        <div className={styles.skeletonTitle} />
                        <div className={styles.skeletonMeta} />
                    </div>
                </div>
            ))}
        </>
    );
});

/**
 * Empty state with illustration
 */
const EmptyState = memo(function EmptyState({ isSearch, onRefresh }) {
    return (
        <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className={styles.emptyIcon}>
                <Sparkles className={styles.sparklesIcon} />
            </div>
            <h4>
                {isSearch ? 'No pages found' : 'Connect your Notion pages'}
            </h4>
            <p>
                {isSearch
                    ? 'Try a different search term'
                    : 'Grant access to pages in Notion to see them here'}
            </p>
            {!isSearch && (
                <button className={styles.refreshBtn} onClick={onRefresh}>
                    <RefreshCw size={16} />
                    Refresh
                </button>
            )}
        </motion.div>
    );
});

/**
 * Error state with retry
 */
const ErrorState = memo(function ErrorState({ error, onRetry }) {
    return (
        <motion.div
            className={styles.errorState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <AlertCircle className={styles.errorIcon} />
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={onRetry}>
                Try Again
            </button>
        </motion.div>
    );
});

/**
 * Page Editor - Edit page content inline with Smart Diff
 */
const PageEditor = memo(function PageEditor({ page, onBack, onSave }) {
    const [content, setContent] = useState('');
    const [originalContent, setOriginalContent] = useState(''); // Track original for diff
    const [blocks, setBlocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saveStatus, setSaveStatus] = useState(''); // Show what was changed

    /**
     * Extract text from a block
     */
    const getBlockText = useCallback((block) => {
        const type = block.type;
        const content = block[type];
        if (!content?.rich_text) return '';
        return content.rich_text.map(t => t.plain_text).join('');
    }, []);

    /**
     * Convert block to markdown line
     */
    const blockToMarkdown = useCallback((block) => {
        const type = block.type;
        const text = getBlockText(block);

        if (type === 'heading_1') return `# ${text}`;
        if (type === 'heading_2') return `## ${text}`;
        if (type === 'heading_3') return `### ${text}`;
        if (type === 'bulleted_list_item') return `- ${text}`;
        if (type === 'numbered_list_item') return `1. ${text}`;
        if (type === 'code') return `\`\`\`\n${text}\n\`\`\``;
        if (type === 'divider') return '---';
        return text;
    }, [getBlockText]);

    /**
     * Parse markdown line to block type and content
     */
    const parseMarkdownLine = useCallback((line) => {
        if (line.startsWith('### ')) {
            return { type: 'heading_3', text: line.slice(4) };
        } else if (line.startsWith('## ')) {
            return { type: 'heading_2', text: line.slice(3) };
        } else if (line.startsWith('# ')) {
            return { type: 'heading_1', text: line.slice(2) };
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
            return { type: 'bulleted_list_item', text: line.slice(2) };
        } else if (/^\d+\.\s/.test(line)) {
            return { type: 'numbered_list_item', text: line.replace(/^\d+\.\s/, '') };
        } else if (line === '---') {
            return { type: 'divider', text: '' };
        } else {
            return { type: 'paragraph', text: line };
        }
    }, []);

    /**
     * Create a Notion block from type and text
     */
    const createBlock = useCallback((type, text) => {
        if (type === 'divider') {
            return { type: 'divider', divider: {} };
        }
        return {
            type,
            [type]: { rich_text: [{ type: 'text', text: { content: text } }] }
        };
    }, []);

    // Load page content
    useEffect(() => {
        const loadContent = async () => {
            setIsLoading(true);
            setError('');
            try {
                const response = await fetch(`/api/notion/pages/${page.id}/content`, {
                    credentials: 'include'
                });
                if (!response.ok) throw new Error('Failed to load page content');
                const data = await response.json();
                setBlocks(data.results || []);

                // Convert blocks to markdown
                const text = (data.results || [])
                    .map(block => blockToMarkdown(block))
                    .filter(line => line !== '') // Filter empty lines from unsupported blocks
                    .join('\n');
                setContent(text);
                setOriginalContent(text);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadContent();
    }, [page.id, blockToMarkdown]);

    /**
     * Smart Diff Save - Only updates what changed
     */
    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        setSaveStatus('');

        try {
            const oldLines = originalContent.split('\n').filter(l => l.trim());
            const newLines = content.split('\n').filter(l => l.trim());

            let updated = 0, deleted = 0, added = 0;

            // Step 1: Update or delete existing blocks
            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];
                const oldText = getBlockText(block);

                if (i < newLines.length) {
                    // Check if this line changed
                    const parsed = parseMarkdownLine(newLines[i]);
                    const oldParsed = parseMarkdownLine(oldLines[i] || '');

                    // If content or type changed, update the block
                    if (parsed.text !== oldText || parsed.type !== block.type) {
                        // Notion doesn't allow changing block type, so delete and we'll add new later
                        if (parsed.type !== block.type) {
                            await fetch(`/api/notion/blocks/${block.id}`, {
                                method: 'DELETE',
                                credentials: 'include'
                            });
                            deleted++;
                        } else {
                            // Same type, just update text
                            await fetch(`/api/notion/blocks/${block.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({
                                    [parsed.type]: {
                                        rich_text: [{ type: 'text', text: { content: parsed.text } }]
                                    }
                                })
                            });
                            updated++;
                        }
                    }
                } else {
                    // More old blocks than new lines - delete excess
                    await fetch(`/api/notion/blocks/${block.id}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    deleted++;
                }
            }

            // Step 2: Add new blocks (lines beyond original count or type-changed blocks)
            const newBlocksToAdd = [];
            for (let i = 0; i < newLines.length; i++) {
                const parsed = parseMarkdownLine(newLines[i]);

                // Add if it's a new line or if block type changed (we deleted it above)
                if (i >= blocks.length) {
                    newBlocksToAdd.push(createBlock(parsed.type, parsed.text));
                    added++;
                } else {
                    const oldBlock = blocks[i];
                    if (parsed.type !== oldBlock.type) {
                        newBlocksToAdd.push(createBlock(parsed.type, parsed.text));
                        added++;
                    }
                }
            }

            // Append new blocks if any
            if (newBlocksToAdd.length > 0) {
                await fetch('/api/notion/blocks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        block_id: page.id,
                        children: newBlocksToAdd
                    })
                });
            }

            // Show status
            const changes = [];
            if (updated > 0) changes.push(`${updated} updated`);
            if (deleted > 0) changes.push(`${deleted} deleted`);
            if (added > 0) changes.push(`${added} added`);
            setSaveStatus(changes.length > 0 ? `✓ ${changes.join(', ')}` : '✓ No changes');

            setOriginalContent(content);
            setIsEditing(false);
            onSave?.();

            // Clear status after 3s
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const title = getPageTitle(page.properties);

    return (
        <motion.div
            className={styles.pageEditor}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
        >
            {/* Editor Header */}
            <div className={styles.editorHeader}>
                <button className={styles.backBtn} onClick={onBack}>
                    <ChevronLeft size={20} />
                    Back
                </button>
                <h3 className={styles.editorTitle}>{title}</h3>
                <div className={styles.editorActions}>
                    <button
                        className={styles.iconBtn}
                        onClick={() => window.open(page.url, '_blank')}
                        title="Open in Notion"
                    >
                        <ExternalLink size={18} />
                    </button>
                    {isEditing ? (
                        <button
                            className={styles.saveBtn}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className={styles.spinner} size={16} /> : <Save size={16} />}
                            Save
                        </button>
                    ) : (
                        <button
                            className={styles.editBtn}
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit3 size={16} />
                            Edit
                        </button>
                    )}
                    {saveStatus && (
                        <span className={styles.saveStatus}>{saveStatus}</span>
                    )}
                </div>
            </div>

            {/* Editor Content */}
            <div className={styles.editorContent}>
                {isLoading ? (
                    <div className={styles.editorLoading}>
                        <Loader2 className={styles.spinner} size={24} />
                        <span>Loading content...</span>
                    </div>
                ) : error ? (
                    <div className={styles.editorError}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                ) : isEditing ? (
                    <textarea
                        className={styles.editorTextarea}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Start writing... (Use markdown: # heading, - list, etc.)"
                    />
                ) : (
                    <div className={styles.notionPreview}>
                        {blocks.length > 0 ? (
                            blocks.map((block, idx) => {
                                const type = block.type;
                                const blockContent = block[type];
                                const text = blockContent?.rich_text?.map(t => t.plain_text).join('') || '';

                                // Render block based on type - Notion style
                                switch (type) {
                                    case 'heading_1':
                                        return <h1 key={block.id || idx} className={styles.notionH1}>{text}</h1>;
                                    case 'heading_2':
                                        return <h2 key={block.id || idx} className={styles.notionH2}>{text}</h2>;
                                    case 'heading_3':
                                        return <h3 key={block.id || idx} className={styles.notionH3}>{text}</h3>;
                                    case 'bulleted_list_item':
                                        return (
                                            <div key={block.id || idx} className={styles.notionBullet}>
                                                <span className={styles.bullet}>•</span>
                                                <span>{text}</span>
                                            </div>
                                        );
                                    case 'numbered_list_item':
                                        return (
                                            <div key={block.id || idx} className={styles.notionNumbered}>
                                                <span className={styles.number}>{idx + 1}.</span>
                                                <span>{text}</span>
                                            </div>
                                        );
                                    case 'to_do':
                                        return (
                                            <div key={block.id || idx} className={styles.notionTodo}>
                                                <input
                                                    type="checkbox"
                                                    checked={blockContent?.checked || false}
                                                    readOnly
                                                    className={styles.checkbox}
                                                />
                                                <span className={blockContent?.checked ? styles.todoChecked : ''}>{text}</span>
                                            </div>
                                        );
                                    case 'code':
                                        return (
                                            <pre key={block.id || idx} className={styles.notionCode}>
                                                <code>{text}</code>
                                            </pre>
                                        );
                                    case 'quote':
                                        return (
                                            <blockquote key={block.id || idx} className={styles.notionQuote}>
                                                {text}
                                            </blockquote>
                                        );
                                    case 'callout':
                                        return (
                                            <div key={block.id || idx} className={styles.notionCallout}>
                                                <span className={styles.calloutIcon}>{blockContent?.icon?.emoji || '💡'}</span>
                                                <span>{text}</span>
                                            </div>
                                        );
                                    case 'divider':
                                        return <hr key={block.id || idx} className={styles.notionDivider} />;
                                    case 'paragraph':
                                    default:
                                        return text ? (
                                            <p key={block.id || idx} className={styles.notionParagraph}>{text}</p>
                                        ) : (
                                            <div key={block.id || idx} className={styles.notionSpacer} />
                                        );
                                }
                            })
                        ) : (
                            <p className={styles.emptyContent}>This page is empty. Click Edit to add content.</p>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
});

/**
 * Create page modal
 */
const CreatePageModal = memo(function CreatePageModal({
    isOpen,
    onClose,
    onCreate,
    parentPages
}) {
    const [title, setTitle] = useState('');
    const [parentId, setParentId] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !parentId) {
            setError('Title and parent page are required');
            return;
        }

        setIsCreating(true);
        setError('');

        try {
            await onCreate({
                parent: { page_id: parentId },
                properties: {
                    title: { title: [{ text: { content: title.trim() } }] }
                }
            });
            setTitle('');
            setParentId('');
            onClose();
        } catch (err) {
            setError(err.userMessage || err.message);
        } finally {
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className={styles.modalOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className={styles.modal}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.modalHeader}>
                        <h3>Create New Page</h3>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.modalForm}>
                        <div className={styles.formGroup}>
                            <label htmlFor="pageTitle">Page Title</label>
                            <input
                                id="pageTitle"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter page title..."
                                autoFocus
                                disabled={isCreating}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="parentPage">Parent Page</label>
                            <select
                                id="parentPage"
                                value={parentId}
                                onChange={(e) => setParentId(e.target.value)}
                                disabled={isCreating}
                            >
                                <option value="">Select a parent page...</option>
                                {parentPages.map((page) => (
                                    <option key={page.id} value={page.id}>
                                        {getPageTitle(page.properties)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && <p className={styles.formError}>{error}</p>}

                        <div className={styles.modalActions}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={onClose}
                                disabled={isCreating}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={isCreating || !title.trim() || !parentId}
                            >
                                {isCreating ? (
                                    <>
                                        <Loader2 className={styles.spinner} size={16} />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Create Page
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
});

// =============================================================================
// Main Component
// =============================================================================

function NotionPanel({ className = '' }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedPage, setSelectedPage] = useState(null);

    // Store selectors
    const pages = useNotionStore(selectPages);
    const isLoading = useNotionStore(selectPagesLoading);
    const error = useNotionStore(selectPagesError);
    const isInitialized = useNotionStore(selectIsInitialized);

    // Store actions
    const searchPages = useNotionStore((s) => s.searchPages);
    const refreshPages = useNotionStore((s) => s.refreshPages);
    const createPage = useNotionStore((s) => s.createPage);
    const loadMorePages = useNotionStore((s) => s.loadMorePages);
    const hasMore = useNotionStore((s) => s.hasMorePages);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Initial load & search
    useEffect(() => {
        searchPages(debouncedQuery);
    }, [debouncedQuery, searchPages]);

    // Handlers
    const handleOpenPage = useCallback((page) => {
        setSelectedPage(page);
    }, []);

    const handleOpenInNotion = useCallback((page) => {
        window.open(page.url, '_blank', 'noopener,noreferrer');
    }, []);

    const handleRefresh = useCallback(() => {
        refreshPages();
    }, [refreshPages]);

    const handleLoadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            loadMorePages();
        }
    }, [isLoading, hasMore, loadMorePages]);

    // Memoized filtered pages (already filtered by API, but future-proof)
    const displayedPages = useMemo(() => {
        return pages.filter(p => p.object === 'page' || p.object === 'database');
    }, [pages]);

    return (
        <div className={`${styles.notionPanel} ${className}`}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.titleRow}>
                    <div className={styles.notionLogo}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className={styles.logoSvg}>
                            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.373.466l1.822 1.447zM5.252 7.617v14.057c0 .746.373 1.027 1.214.98l14.523-.84c.84-.047.934-.56.934-1.166V6.824c0-.606-.233-.932-.746-.886l-15.177.887c-.56.046-.748.326-.748.793zM17.86 8.13c.093.42 0 .84-.42.887l-.699.133v10.41c-.606.327-1.166.514-1.633.514-.746 0-.933-.234-1.493-.934l-4.577-7.186v6.952l1.446.327s0 .84-1.166.84l-3.218.187c-.093-.187 0-.653.327-.746l.84-.233V9.854L5.392 9.76c-.093-.42.14-.98.84-1.026l3.5-.234 4.764 7.28v-6.439l-1.213-.14c-.093-.514.28-.887.746-.933l3.177-.186z" />
                        </svg>
                        <span>Notion</span>
                    </div>
                    <div className={styles.actions}>
                        <NotionAIWriter
                            pages={displayedPages}
                            onContentAdded={handleRefresh}
                        />
                        <button
                            className={styles.iconBtn}
                            onClick={handleRefresh}
                            disabled={isLoading}
                            title="Refresh"
                        >
                            <RefreshCw size={18} className={isLoading ? styles.spinning : ''} />
                        </button>
                        <button
                            className={styles.createBtn}
                            onClick={() => setIsCreateModalOpen(true)}
                            disabled={pages.length === 0}
                        >
                            <Plus size={18} />
                            Create
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                    {searchQuery && (
                        <button
                            className={styles.clearBtn}
                            onClick={() => setSearchQuery('')}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {selectedPage ? (
                    <PageEditor
                        key="editor"
                        page={selectedPage}
                        onBack={() => setSelectedPage(null)}
                        onSave={handleRefresh}
                    />
                ) : (
                    <motion.div
                        key="list"
                        className={styles.content}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {error ? (
                            <ErrorState error={error} onRetry={handleRefresh} />
                        ) : !isInitialized || (isLoading && pages.length === 0) ? (
                            <PageSkeleton count={4} />
                        ) : displayedPages.length === 0 ? (
                            <EmptyState isSearch={!!debouncedQuery} onRefresh={handleRefresh} />
                        ) : (
                            <>
                                <AnimatePresence mode="popLayout">
                                    {displayedPages.map((page, index) => (
                                        <PageCard
                                            key={page.id}
                                            page={page}
                                            index={index}
                                            onOpen={handleOpenPage}
                                        />
                                    ))}
                                </AnimatePresence>

                                {hasMore && (
                                    <button
                                        className={styles.loadMoreBtn}
                                        onClick={handleLoadMore}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <Loader2 className={styles.spinner} size={18} />
                                        ) : (
                                            'Load More'
                                        )}
                                    </button>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Modal */}
            <CreatePageModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={createPage}
                parentPages={pages.filter(p => p.object === 'page')}
            />
        </div>
    );
}

export default memo(NotionPanel);
