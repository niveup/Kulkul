import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    Folder,
    FolderOpen,
    Plus,
    MoreVertical
} from 'lucide-react';
import { useVaultStore } from '../../../store/vaultStore';
import { cn } from '../../../lib/utils';

// Premium Animation Variants
const treeItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { opacity: 0, x: -10, transition: { duration: 0.2 } }
};

const caretVariants = {
    closed: { rotate: 0 },
    open: { rotate: 90 }
};

import { useDroppable } from '@dnd-kit/core';

const FolderItem = ({ folder, level = 0, isActive, onSelect, onToggle, expandedFolders }) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;

    const { isOver, setNodeRef } = useDroppable({
        id: folder.id,
        data: { type: 'folder', folder }
    });

    return (
        <motion.div
            layout
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={treeItemVariants}
            className="select-none"
        >
            <div
                ref={setNodeRef}
                className={cn(
                    "group relative flex items-center gap-2 px-3 py-2.5 my-0.5 rounded-xl cursor-pointer transition-all duration-300",
                    isActive
                        ? "bg-gradient-to-r from-indigo-500/20 to-indigo-500/10 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] border border-indigo-500/20"
                        : isOver
                            ? "bg-indigo-500/30 text-white border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                            : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                )}
                style={{ paddingLeft: `${level * 16 + 12}px` }}
                onClick={() => onSelect(folder.id)}
            >
                {/* Active Indicator Line */}
                {isActive && (
                    <motion.div
                        layoutId="activeFolderParams"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-400 rounded-r-full shadow-[0_0_10px_rgba(129,140,248,0.5)]"
                    />
                )}

                {/* Expand/Collapse Button */}
                <div
                    className={cn(
                        "p-1 rounded-lg transition-colors z-10",
                        hasChildren
                            ? "hover:bg-white/10 text-white/40 group-hover:text-white/80"
                            : "opacity-0"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle(folder.id);
                    }}
                >
                    <motion.div
                        variants={caretVariants}
                        animate={isExpanded ? "open" : "closed"}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronRight size={14} />
                    </motion.div>
                </div>

                {/* Folder Icon with Glow */}
                <div className="relative">
                    {(isActive || isOver) && (
                        <div className="absolute inset-0 bg-indigo-500/30 blur-lg rounded-full" />
                    )}
                    {isExpanded ? (
                        <FolderOpen
                            size={18}
                            className={cn(
                                "relative z-10 transition-colors duration-300",
                                (isActive || isOver) ? "text-indigo-300" : "text-indigo-400/80 group-hover:text-indigo-300"
                            )}
                        />
                    ) : (
                        <Folder
                            size={18}
                            className={cn(
                                "relative z-10 transition-colors duration-300",
                                (isActive || isOver) ? "text-indigo-300" : "text-slate-400/80 group-hover:text-indigo-300"
                            )}
                        />
                    )}
                </div>

                <span className={cn(
                    "text-sm font-medium truncate flex-1 tracking-wide transition-colors duration-300",
                    (isActive || isOver) ? "text-white" : "text-white/60 group-hover:text-white/90"
                )}>
                    {folder.name}
                </span>

                {/* Action Menu Trigger (Ghost) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <MoreVertical size={14} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && folder.children && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        {folder.children.map(child => (
                            <FolderItem
                                key={child.id}
                                folder={child}
                                level={level + 1}
                                isActive={isActive}
                                onSelect={onSelect}
                                onToggle={onToggle}
                                expandedFolders={expandedFolders}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const FolderTree = ({ onCreateFolder }) => {
    const { folders, currentFolderId, setCurrentFolderId } = useVaultStore();
    const [expandedFolders, setExpandedFolders] = useState(new Set());

    // Build tree logic remains same...
    const buildTree = (flatFolders) => {
        const root = [];
        const map = {};
        flatFolders.forEach(folder => map[folder.id] = { ...folder, children: [] });
        flatFolders.forEach(folder => {
            if (folder.parentId && map[folder.parentId]) {
                map[folder.parentId].children.push(map[folder.id]);
            } else {
                root.push(map[folder.id]);
            }
        });
        return root;
    };

    const folderTree = buildTree(folders);

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            next.has(folderId) ? next.delete(folderId) : next.add(folderId);
            return next;
        });
    };

    const handleCreateFolder = () => {
        const name = window.prompt("Enter folder name:");
        if (name && name.trim()) {
            onCreateFolder(name.trim());
        }
    };

    return (
        <div className="w-72 shrink-0 flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-4 py-4 mb-2">
                <span className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Library</span>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateFolder}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 transition-all"
                    title="New Folder"
                >
                    <Plus size={16} />
                </motion.button>
            </div>

            {/* Folder List Container */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                {/* All Files Item */}
                <div
                    className={cn(
                        "group relative flex items-center gap-3 px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all duration-300",
                        !currentFolderId
                            ? "bg-gradient-to-r from-indigo-500/20 to-indigo-500/5 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] border border-indigo-500/20"
                            : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                    )}
                    onClick={() => setCurrentFolderId(null)}
                >
                    {!currentFolderId && (
                        <motion.div
                            layoutId="activeFolderParams"
                            className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-400 rounded-r-full shadow-[0_0_10px_rgba(129,140,248,0.5)]"
                        />
                    )}

                    <div className={cn("p-1.5 rounded-lg transition-colors", !currentFolderId ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-white/40 group-hover:text-white group-hover:bg-white/10")}>
                        <Folder size={18} />
                    </div>
                    <span className="text-sm font-medium tracking-wide">All Files</span>

                    {/* Counter Pill */}
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/30 group-hover:text-white/50 transition-colors">
                        ALL
                    </span>
                </div>

                <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                <AnimatePresence>
                    {folderTree.map(folder => (
                        <FolderItem
                            key={folder.id}
                            folder={folder}
                            isActive={currentFolderId === folder.id}
                            onSelect={setCurrentFolderId}
                            onToggle={toggleFolder}
                            expandedFolders={expandedFolders}
                        />
                    ))}
                </AnimatePresence>

                {folderTree.length === 0 && (
                    <div className="px-8 py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mx-auto mb-3">
                            <FolderOpen className="text-white/10" size={24} />
                        </div>
                        <p className="text-xs text-white/30 font-medium">No folders yet</p>
                        <p className="text-[10px] text-white/20 mt-1">Create one to organize files</p>
                    </div>
                )}
            </div>

            {/* Storage Mini-Widget (can be moved here for better layout) */}
        </div>
    );
};

export default FolderTree;
