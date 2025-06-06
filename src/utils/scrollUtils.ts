/**
 * Utility functions for scrolling elements into view.
 */

/**
 * Scrolls the note element with the given ID into view smoothly.
 * 
 * @param noteId The ID of the note to scroll to.
 * @param blockAlignment Vertical alignment. One of "start", "center", "end", or "nearest". Defaults to "center".
 * @param inlineAlignment Horizontal alignment. One of "start", "center", "end", or "nearest". Defaults to "nearest".
 */
export const scrollToNote = (
  noteId: string,
  blockAlignment: ScrollLogicalPosition = 'center',
  inlineAlignment: ScrollLogicalPosition = 'nearest'
) => {
  if (!noteId) {
    console.warn('scrollToNote called with no noteId');
    return;
  }
  const element = document.getElementById(`note-${noteId}`);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: blockAlignment,
      inline: inlineAlignment,
    });
  } else {
    // It's possible the note is not yet rendered or is on a different virtualized page.
    // We can try to set the hash and let the browser handle it, or implement more complex logic if needed.
    console.warn(`Element with ID 'note-${noteId}' not found for scrolling.`);
    // As a fallback, try using the hash, which might work if the element appears later
    // window.location.hash = `#note-${noteId}`;
  }
};