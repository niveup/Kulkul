import React, { memo } from 'react';
import { motion } from 'framer-motion';
import ConceptCard from './ConceptCard';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const ConceptGrid = memo(({
    concepts,
    selectedTopic,
    selectedSubject,
    isDarkMode,
    setExpandedConcept
}) => {
    if (concepts.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20"
            >
                <div className="text-6xl mb-4 opacity-50">
                    {selectedSubject !== 'Physics' ? '🧪' : '🔍'}
                </div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {selectedSubject !== 'Physics' ? 'Coming Soon!' : 'No results found'}
                </h3>
                <p className={`mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {selectedSubject !== 'Physics'
                        ? `Notes for ${selectedSubject} are being prepared.`
                        : 'Try searching for something else.'
                    }
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            key={selectedTopic}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="columns-1 md:columns-2 lg:columns-2 xl:columns-3 gap-4"
            style={{ columnFill: 'balance' }}
        >
            {concepts.map((concept, idx) => (
                <ConceptCard
                    key={`${selectedTopic}-${idx}`}
                    concept={concept}
                    index={idx}
                    isDarkMode={isDarkMode}
                    onClick={() => setExpandedConcept(concept)}
                />
            ))}
        </motion.div>
    );
});

export default ConceptGrid;
