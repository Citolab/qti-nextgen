/**
 * Enables drag-to-select on the document.
 * Highlights every element whose bounding box intersects the drag rectangle.
 * Clicking (without dragging) clears the selection.
 */
export function enableDragSelect(canvases: HTMLElement[] = []) {
  let startX,
    startY,
    isDragging = false,
    selectedEls = [];
  // Create the selection box DIV once
  const box = document.createElement('div');
  Object.assign(box.style, {
    position: 'fixed',
    border: '1px dashed #007bff',
    backgroundColor: 'rgba(0,123,255,0.1)',
    pointerEvents: 'none',
    display: 'none',
    zIndex: '9999'
  });
  document.body.appendChild(box);

  function clearSelection() {
    selectedEls.forEach(el => el.classList.remove('selected'));
    selectedEls = [];
  }

  document.addEventListener('mousedown', e => {
    startX = e.clientX;
    startY = e.clientY;
    isDragging = false;
    clearSelection();
    box.style.left = `${startX}px`;
    box.style.top = `${startY}px`;
    box.style.width = '0px';
    box.style.height = '0px';
    box.style.display = 'block';
    // e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    const dx = e.clientX - startX,
      dy = e.clientY - startY;
    if (!isDragging && Math.hypot(dx, dy) > 3) isDragging = true;
    if (!isDragging) return;
    const x = Math.min(e.clientX, startX);
    const y = Math.min(e.clientY, startY);
    box.style.left = x + 'px';
    box.style.top = y + 'px';
    box.style.width = Math.abs(dx) + 'px';
    box.style.height = Math.abs(dy) + 'px';
  });

  document.addEventListener('mouseup', () => {
    const rect = box.getBoundingClientRect();
    box.style.display = 'none';
    if (isDragging) {
      // Query only the selectable elements the elements from the canvases
      const candidates: Element[] = [];
      canvases.forEach(canvas => {
        candidates.push(...Array.from(canvas.querySelectorAll('*')));
      });
      candidates.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.left < rect.right && r.right > rect.left && r.top < rect.bottom && r.bottom > rect.top) {
          el.classList.add('selected');
          selectedEls.push(el);
        }
      });
    }
  });
}
