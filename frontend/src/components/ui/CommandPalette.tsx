/**
 * Command Palette Component (Cmd+K / Ctrl+K)
 * Global navigation with keyboard shortcuts and search
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Command {
    id: string;
    name: string;
    shortcut?: string;
    action: () => void;
    icon?: string;
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Define available commands
    const commands: Command[] = [
        {
            id: 'dashboard',
            name: 'Go to Dashboard',
            shortcut: 'Alt+D',
            icon: '📊',
            action: () => navigate('/dashboard'),
        },
        {
            id: 'tasks',
            name: 'Go to Tasks',
            shortcut: 'Alt+T',
            icon: '✓',
            action: () => navigate('/tasks'),
        },
        {
            id: 'profile',
            name: 'Go to Profile',
            icon: '👤',
            action: () => navigate('/profile'),
        },
        {
            id: 'settings',
            name: 'Open Settings',
            shortcut: 'Alt+,',
            icon: '⚙️',
            action: () => navigate('/settings'),
        },
        {
            id: 'calendar',
            name: 'Go to Calendar',
            icon: '📅',
            action: () => navigate('/calendar'),
        },
        {
            id: 'new-task',
            name: 'Create New Task',
            shortcut: 'Alt+N',
            icon: '➕',
            action: () => navigate('/tasks?action=new'),
        },
    ];

    // Filter commands based on search
    const filteredCommands = commands.filter((cmd) =>
        cmd.name.toLowerCase().includes(search.toLowerCase())
    );

    // Reset selection when search changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 10);
        }
    }, [isOpen]);

    const executeCommand = useCallback((command: Command) => {
        command.action();
        onClose();
    }, [onClose]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((i) => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    executeCommand(filteredCommands[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    }, [filteredCommands, selectedIndex, executeCommand, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Command Palette Modal */}
            <div
                className="relative w-full max-w-lg mx-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl overflow-hidden"
                onKeyDown={handleKeyDown}
            >
                {/* Search Input */}
                <div className="flex items-center px-4 py-3 border-b border-white/10">
                    <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search..."
                        className="flex-1 ml-3 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <kbd className="px-2 py-1 text-xs text-gray-400 bg-white/10 rounded">
                        esc
                    </kbd>
                </div>

                {/* Commands List */}
                <div className="max-h-80 overflow-y-auto py-2">
                    {filteredCommands.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-400">
                            No commands found
                        </div>
                    ) : (
                        filteredCommands.map((command, index) => (
                            <button
                                key={command.id}
                                className={`w-full flex items-center px-4 py-3 text-left transition-colors ${index === selectedIndex
                                    ? 'bg-white/20 text-white'
                                    : 'text-gray-300 hover:bg-white/10'
                                    }`}
                                onClick={() => executeCommand(command)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <span className="w-8 text-center text-lg">{command.icon}</span>
                                <span className="flex-1 ml-2 font-medium">{command.name}</span>
                                {command.shortcut && (
                                    <kbd className="px-2 py-1 text-xs text-gray-400 bg-white/10 rounded">
                                        {command.shortcut}
                                    </kbd>
                                )}
                            </button>
                        ))
                    )}
                </div>

                {/* Footer hint */}
                <div className="px-4 py-2 text-xs text-gray-500 border-t border-white/10 flex justify-between">
                    <span>↑↓ to navigate</span>
                    <span>↵ to select</span>
                    <span>esc to close</span>
                </div>
            </div>
        </div>
    );
}

/**
 * Hook to manage Command Palette state with keyboard shortcut
 */
export function useCommandPalette() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((prev) => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
    };
}
