import React, { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import SearchHistory from './SearchHistory';
import DifficultyBadge from './DifficultyBadge';

const ITEM_HEIGHT = 90;

const Row = ({ index, style, data }) => {
    const { results, onClick, isDarkMode } = data;
    const result = results[index];

    return (
        <div style={style} className="px-2 py-1">
            <motion.button
                initial={false}
                whileHover={{ x: 4, backgroundColor: isDarkMode ? 'rgba(30,30,40,0.8)' : 'rgba(240,240,250,0.8)' }}
                onClick={() => onClick(result)}
                className={`
                    w-full text-left px-3 py-2.5 rounded-lg transition-colors group h-full
                    flex flex-col justify-center
                    ${isDarkMode
                        ? 'hover:bg-slate-800'
                        : 'hover:bg-slate-50'
                    }
                `}
            >
                <div className="flex items-start justify-between mb-1 w-full">
                    <span className={`text-sm font-semibold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {result.concept}
                    </span>
                    {result.difficulty && (
                        <DifficultyBadge difficulty={result.difficulty} isDarkMode={isDarkMode} size="xs" showLabel={false} />
                    )}
                </div>

                <div className={`text-xs truncate mb-1.5 w-full ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    {result.theory?.slice(0, 60)}...
                </div>

                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${result.className === '11'
                        ? isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                        : isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                        }`}>
                        Class {result.className}
                    </span>
                    <span className={`text-xs truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {result.chapterName}
                    </span>
                </div>
            </motion.button>
        </div>
    );
};

const SearchWidget = memo(({
    isDarkMode,
    searchQuery,
    setSearchQuery,
    search,
    searchHistory,
    searchResults,
    isSearchHistoryOpen,
    setIsSearchHistoryOpen,
    clearHistory,
    addToHistory,
    setExpandedConcept,
    handleTopicClick
}) => {

    const handleResultClick = useCallback((result) => {
        handleTopicClick(result.className, 'Physics', result.chapterName);
        setExpandedConcept(result);
        setSearchQuery('');
        addToHistory(searchQuery);
    }, [handleTopicClick, setExpandedConcept, setSearchQuery, addToHistory, searchQuery]);

    const itemData = {
        results: searchResults,
        onClick: handleResultClick,
        isDarkMode
    };

    return (
        <div className="relative">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
                </div>
                <input
                    type="text"
                    className={`
                        w-64 pl-9 pr-4 py-2 rounded-xl text-sm font-medium
                        border outline-none transition-all
                        ${isDarkMode
                            ? 'bg-slate-800/50 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-blue-500/50 focus:bg-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-300 focus:bg-white'
                        }
                    `}
                    placeholder="Search concepts, formulas..."
                    value={searchQuery}
                    onChange={(e) => search(e.target.value)}
                    onFocus={() => setIsSearchHistoryOpen(true)}
                    onBlur={() => setTimeout(() => setIsSearchHistoryOpen(false), 200)}
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Search History */}
            <SearchHistory
                history={searchHistory}
                isVisible={isSearchHistoryOpen && !searchQuery}
                isDarkMode={isDarkMode}
                onSelect={(query) => {
                    search(query);
                    setIsSearchHistoryOpen(false);
                }}
                onClear={clearHistory}
            />

            {/* Search Results Dropdown */}
            <AnimatePresence>
                {searchQuery.trim() && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`
                            absolute top-full right-0 mt-2 w-96 overflow-hidden
                            rounded-xl border shadow-2xl backdrop-blur-xl z-50
                            ${isDarkMode
                                ? 'bg-slate-900/95 border-slate-700/50'
                                : 'bg-white/95 border-slate-200/50'
                            }
                        `}
                    >
                        {searchResults.length > 0 ? (
                            <>
                                <div className={`px-4 py-3 border-b text-xs font-bold uppercase tracking-wider flex justify-between items-center ${isDarkMode ? 'text-slate-500 border-slate-700/50' : 'text-slate-400 border-slate-200'}`}>
                                    <span>{searchResults.length} results</span>
                                    <span className="text-[10px] font-normal opacity-70">
                                        Virtual Scroll Active
                                    </span>
                                </div>
                                <List
                                    height={Math.min(searchResults.length * ITEM_HEIGHT, 500)}
                                    itemCount={searchResults.length}
                                    itemSize={ITEM_HEIGHT}
                                    width={382} // Account for border? w-96 is 384px.
                                    itemData={itemData}
                                    className="no-scrollbar"
                                >
                                    {Row}
                                </List>
                            </>
                        ) : (
                            <div className={`p-8 text-center flex flex-col items-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                <Search size={24} className="opacity-20 mb-2" />
                                <p className="text-sm">No matches found</p>
                                <p className="text-xs opacity-60 mt-1">Try adjusting your terms or filters</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});

export default SearchWidget;
