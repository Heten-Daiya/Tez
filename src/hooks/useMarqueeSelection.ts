import { useState, useCallback, RefObject } from 'react';

interface UseMarqueeSelectionProps {
  gridRef: RefObject<HTMLDivElement>;
  items: string[]; // Assuming items are note IDs
  setSelectedNotes: (ids: string[]) => void;
  initialIsMarqueeSelectionActive?: boolean;
}

export const useMarqueeSelection = ({
  gridRef,
  items,
  setSelectedNotes,
  initialIsMarqueeSelectionActive = false,
}: UseMarqueeSelectionProps) => {
  const [isMarqueeSelectionActive, setIsMarqueeSelectionActive] = useState<boolean>(initialIsMarqueeSelectionActive);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);

  const handleToggleMarqueeSelection = useCallback(() => {
    setIsMarqueeSelectionActive(prev => !prev);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isMarqueeSelectionActive || !gridRef.current) return;

    // Only start marquee if clicking on the grid background, not on a note card itself
    // Check if the click target or its parent has 'data-note-id'. If so, it's a note, not the background.
    let targetElement = e.target as HTMLElement;
    let isNoteClick = false;
    while(targetElement && targetElement !== gridRef.current) {
      if (targetElement.dataset.noteId) {
        isNoteClick = true;
        break;
      }
      targetElement = targetElement.parentElement as HTMLElement;
    }
    if (isNoteClick) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMarqueeStart({ x, y });
    setMarqueeEnd({ x, y }); // Initialize marqueeEnd to prevent null issues on first move
  }, [isMarqueeSelectionActive, gridRef]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isMarqueeSelectionActive || !marqueeStart || !gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMarqueeEnd({ x, y });

    const currentMarqueeRect = {
      left: Math.min(marqueeStart.x, x),
      top: Math.min(marqueeStart.y, y),
      right: Math.max(marqueeStart.x, x),
      bottom: Math.max(marqueeStart.y, y),
    };

    const noteElements = gridRef.current.querySelectorAll('div[data-note-id]');
    const selectedIds: string[] = [];

    noteElements.forEach(noteEl => {
      const noteRect = noteEl.getBoundingClientRect();
      const gridBoundingRect = gridRef.current!.getBoundingClientRect();

      const relativeNoteRect = {
        left: noteRect.left - gridBoundingRect.left,
        top: noteRect.top - gridBoundingRect.top,
        right: noteRect.right - gridBoundingRect.left,
        bottom: noteRect.bottom - gridBoundingRect.top,
      };

      if (
        relativeNoteRect.left < currentMarqueeRect.right &&
        relativeNoteRect.right > currentMarqueeRect.left &&
        relativeNoteRect.top < currentMarqueeRect.bottom &&
        relativeNoteRect.bottom > currentMarqueeRect.top
      ) {
        const noteId = (noteEl as HTMLElement).dataset.noteId;
        if (noteId && items.includes(noteId)) { // Ensure the selected note is part of the current items
            selectedIds.push(noteId);
        }
      }
    });
    setSelectedNotes(selectedIds);
  }, [isMarqueeSelectionActive, marqueeStart, gridRef, items, setSelectedNotes]);

  const handleMouseUp = useCallback(() => {
    if (!isMarqueeSelectionActive) return; // Only reset if marquee was active
    // Do not reset selected notes here, selection should persist after mouse up
    setMarqueeStart(null);
    setMarqueeEnd(null);
    // Optionally, you might want to turn off marquee selection mode after one use:
    // setIsMarqueeSelectionActive(false);
  }, [isMarqueeSelectionActive]);

  return {
    isMarqueeSelectionActive,
    marqueeStart,
    marqueeEnd,
    handleToggleMarqueeSelection,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    setIsMarqueeSelectionActive, // Export setter if needed externally
  };
};