import { useState, useCallback, useRef } from 'react';
import {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  closestCenter,
  rectIntersection,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Note } from '../types'; // Assuming Note type is in types.ts

interface UseDragAndDropProps {
  items: string[]; // Array of note IDs
  sortedNotes: Note[]; // Array of sorted Note objects
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  setItems?: (items: string[]) => void; // Optional: if items state is managed outside
}

export const useDragAndDrop = ({
  items,
  sortedNotes,
  updateNote,
  setItems, // If you manage items state outside and need to update it
}: UseDragAndDropProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const lastOverId = useRef<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;
    lastOverId.current = over.id as string;
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    lastOverId.current = null;

    if (active.id !== over?.id && over) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);

      if (oldIndex === -1 || newIndex === -1) return; // Item not found

      const newItemsOrder = arrayMove(items, oldIndex, newIndex);
      
      if (setItems) {
        setItems(newItemsOrder); // Update local order if state is managed here
      }

      // Update positions for all affected notes based on the new order
      newItemsOrder.forEach((id, index) => {
        const note = sortedNotes.find(n => n.id === id);
        // Only update if the position actually changed to avoid unnecessary writes
        if (note && (note.position === undefined || note.position !== index)) {
          updateNote(id, { position: index });
        }
      });
    }
  }, [items, sortedNotes, updateNote, setItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require a small drag distance to start dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Custom collision detection strategy for masonry layout
  const collisionDetectionStrategy = useCallback((args: any) => {
    const intersections = rectIntersection(args);
    if (intersections.length > 0) {
      return intersections;
    }
    const pointerIntersections = pointerWithin(args);
    if (pointerIntersections.length > 0) {
      return [pointerIntersections[0]];
    }
    return closestCenter(args);
  }, []);

  return {
    activeId,
    lastOverId, // Expose if needed for animations or other UI effects
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    sensors,
    collisionDetectionStrategy,
  };
};