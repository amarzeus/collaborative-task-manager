/**
 * useUndo Hook
 * Manages undo state with automatic commit after timeout
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseUndoOptions<T> {
    timeout?: number; // milliseconds before auto-commit
    onCommit: (item: T) => void; // Called when undo window expires
}

export function useUndo<T>({ timeout = 5000, onCommit }: UseUndoOptions<T>) {
    const [pendingItem, setPendingItem] = useState<T | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Clear timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    const scheduleCommit = useCallback((item: T) => {
        setPendingItem(item);

        // Clear existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Schedule commit
        timerRef.current = setTimeout(() => {
            onCommit(item);
            setPendingItem(null);
        }, timeout);
    }, [timeout, onCommit]);

    const undo = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setPendingItem(null);
    }, []);

    const commit = useCallback(() => {
        if (pendingItem) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            onCommit(pendingItem);
            setPendingItem(null);
        }
    }, [pendingItem, onCommit]);

    return {
        pendingItem,
        scheduleCommit,
        undo,
        commit,
    };
}
