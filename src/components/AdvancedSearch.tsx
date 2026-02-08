'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Award, Filter, X, Clock, TrendingUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AdvancedSearchProps {
    onSearch: (query: string, filters: SearchFilters) => void;
    history: any[];
}

export interface SearchFilters {
    dateRange: 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'threeMonths' | 'year' | 'lastYear';
    scoreRange: 'all' | 'perfect' | 'high' | 'medium';
    sortBy: 'date' | 'score' | 'name';
}

const dateRangeOptions = [
    { value: 'all', label: 'All Time', icon: Calendar },
    { value: 'today', label: 'Today', icon: Clock },
    { value: 'yesterday', label: 'Yesterday', icon: Clock },
    { value: 'week', label: 'This Week', icon: Calendar },
    { value: 'month', label: 'Last 30 Days', icon: Calendar },
    { value: 'threeMonths', label: 'Last 3 Months', icon: Calendar },
    { value: 'year', label: 'This Year', icon: Calendar },
    { value: 'lastYear', label: 'Last Year', icon: Calendar },
];

const scoreRangeOptions = [
    { value: 'all', label: 'All Scores', icon: Award },
    { value: 'perfect', label: '100% Match', icon: TrendingUp },
    { value: 'high', label: '80%+ Match', icon: Award },
    { value: 'medium', label: '50-79%', icon: Award },
];

const sortOptions = [
    { value: 'date', label: 'Newest First' },
    { value: 'score', label: 'Highest Score' },
    { value: 'name', label: 'Name A-Z' },
];

export default function AdvancedSearch({ onSearch, history }: AdvancedSearchProps) {
    const [query, setQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        dateRange: 'all',
        scoreRange: 'all',
        sortBy: 'date',
    });
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get unique suggestions from history
    const suggestions = Array.from(new Set(
        history
            .filter(item =>
                item.fileName?.toLowerCase().includes(query.toLowerCase()) ||
                item.jobTitle?.toLowerCase().includes(query.toLowerCase())
            )
            .map(item => item.fileName)
    )).slice(0, 5);

    useEffect(() => {
        const debounce = setTimeout(() => {
            onSearch(query, filters);
        }, 300);
        return () => clearTimeout(debounce);
    }, [query, filters, onSearch]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeFiltersCount = [
        filters.dateRange !== 'all',
        filters.scoreRange !== 'all',
    ].filter(Boolean).length;

    return (
        <div ref={containerRef} className="relative w-full space-y-3">
            {/* Search Input with Suggestions */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                    ref={inputRef}
                    placeholder="Search by name, role, or date..."
                    className="pl-10 pr-20 bg-slate-900 border-slate-700 text-slate-200 
                               focus:ring-teal-500/50 focus:border-teal-500/50 h-12"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                />

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1.5 
                               rounded-lg text-xs font-medium transition-all
                               ${showFilters || activeFiltersCount > 0
                            ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        } cursor-pointer`}
                >
                    <Filter className="h-3.5 w-3.5" />
                    Filters
                    {activeFiltersCount > 0 && (
                        <span className="ml-1 bg-teal-500 text-slate-900 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                            {activeFiltersCount}
                        </span>
                    )}
                    <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {/* Clear Button */}
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-24 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-800 rounded cursor-pointer"
                    >
                        <X className="h-4 w-4 text-slate-500" />
                    </button>
                )}

                {/* Search Suggestions Dropdown */}
                <AnimatePresence>
                    {showSuggestions && query && suggestions.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 
                                       rounded-xl shadow-xl z-50 overflow-hidden"
                        >
                            <div className="p-2 border-b border-slate-800">
                                <span className="text-xs text-slate-500 font-medium">Suggestions</span>
                            </div>
                            {suggestions.map((suggestion, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => {
                                        setQuery(suggestion);
                                        setShowSuggestions(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-slate-800/50 flex items-center gap-3
                                               text-sm text-slate-300 transition-colors cursor-pointer"
                                >
                                    <Clock className="h-4 w-4 text-slate-500" />
                                    {suggestion}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 space-y-4">
                            <div className="grid md:grid-cols-3 gap-4">
                                {/* Date Range */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Date Range
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {dateRangeOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setFilters({ ...filters, dateRange: option.value as any })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                                           flex items-center gap-1.5 cursor-pointer
                                                           ${filters.dateRange === option.value
                                                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'
                                                    }`}
                                            >
                                                <option.icon className="h-3 w-3" />
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Score Range */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Match Score
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {scoreRangeOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setFilters({ ...filters, scoreRange: option.value as any })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                                           flex items-center gap-1.5 cursor-pointer
                                                           ${filters.scoreRange === option.value
                                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'
                                                    }`}
                                            >
                                                <option.icon className="h-3 w-3" />
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort By */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Sort By
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setFilters({ ...filters, sortBy: option.value as any })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
                                                           ${filters.sortBy === option.value
                                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-transparent'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Reset Filters */}
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={() => setFilters({ dateRange: 'all', scoreRange: 'all', sortBy: 'date' })}
                                    className="text-xs text-slate-500 hover:text-white transition-colors"
                                >
                                    Reset all filters
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
