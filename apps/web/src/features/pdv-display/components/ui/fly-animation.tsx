'use client';

/**
 * Creates a fly-to-cart animation: clones the product image thumbnail and
 * animates it from its current position to a target element (the cart sidebar).
 *
 * Usage:
 *   triggerFlyToCart(imageElement, sidebarElement)
 */
export function triggerFlyToCart(
  sourceEl: HTMLElement,
  targetEl: HTMLElement,
): void {
  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  // Create the flying clone
  const clone = document.createElement('div');
  clone.style.cssText = `
    position: fixed;
    z-index: 9999;
    top: ${sourceRect.top}px;
    left: ${sourceRect.left}px;
    width: ${sourceRect.width}px;
    height: ${sourceRect.height}px;
    border-radius: 50%;
    overflow: hidden;
    pointer-events: none;
    transition: all 500ms cubic-bezier(0.2, 0, 0, 1);
    box-shadow: 0 8px 32px rgba(139, 92, 246, 0.4);
  `;

  // Copy the image content
  const img = sourceEl.querySelector('img');
  if (img) {
    const imgClone = img.cloneNode(true) as HTMLImageElement;
    imgClone.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
    clone.appendChild(imgClone);
  } else {
    clone.style.background = 'linear-gradient(135deg, #8B5CF6, #3B82F6)';
  }

  document.body.appendChild(clone);

  // Trigger animation in next frame
  requestAnimationFrame(() => {
    clone.style.top = `${targetRect.top + targetRect.height / 2 - 20}px`;
    clone.style.left = `${targetRect.left + targetRect.width / 2 - 20}px`;
    clone.style.width = '40px';
    clone.style.height = '40px';
    clone.style.opacity = '0.4';
    clone.style.transform = 'scale(0.3)';
  });

  // Clean up after animation
  setTimeout(() => {
    clone.remove();
  }, 550);
}
