/** Mirrors Pixi canvas into the Skia preview panel and proxies pointer input. */
export class SkiaPreview {
  private readonly skiaActivePointers = new Set<number>();

  constructor(
    private readonly skiaCanvas: HTMLCanvasElement,
    private readonly getPixiView: () => HTMLCanvasElement,
    private readonly renderPixi: () => void,
  ) {}

  sync(): void {
    this.renderPixi();
    this.draw();
  }

  resize(width: number, height: number): void {
    this.skiaCanvas.width = width;
    this.skiaCanvas.height = height;
  }

  bindPointerProxy(): void {
    const pixiView = this.getPixiView();

    if (!(pixiView instanceof HTMLCanvasElement) || typeof PointerEvent === 'undefined') {
      return;
    }

    const remapPointerCoords = (event: PointerEvent): { clientX: number; clientY: number } => {
      const skiaRect = this.skiaCanvas.getBoundingClientRect();
      const pixiRect = pixiView.getBoundingClientRect();

      const relX = skiaRect.width > 0 ? (event.clientX - skiaRect.left) / skiaRect.width : 0;
      const relY = skiaRect.height > 0 ? (event.clientY - skiaRect.top) / skiaRect.height : 0;

      return {
        clientX: pixiRect.left + relX * pixiRect.width,
        clientY: pixiRect.top + relY * pixiRect.height,
      };
    };

    const forwardPointerEvent = (event: PointerEvent, type: string): void => {
      const { clientX, clientY } = remapPointerCoords(event);
      const deltaX = clientX - event.clientX;
      const deltaY = clientY - event.clientY;

      const forwarded = new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        isPrimary: event.isPrimary,
        clientX,
        clientY,
        screenX: event.screenX + deltaX,
        screenY: event.screenY + deltaY,
        button: event.button,
        buttons: event.buttons,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        pressure: event.pressure,
        tangentialPressure: event.tangentialPressure,
        tiltX: event.tiltX,
        tiltY: event.tiltY,
        twist: event.twist,
        width: event.width,
        height: event.height,
      });

      pixiView.dispatchEvent(forwarded);
    };

    this.skiaCanvas.addEventListener('pointerdown', (event) => {
      this.skiaActivePointers.add(event.pointerId);
      this.skiaCanvas.setPointerCapture?.(event.pointerId);
      forwardPointerEvent(event, 'pointerdown');
    });

    this.skiaCanvas.addEventListener('pointermove', (event) => {
      if (!this.skiaActivePointers.has(event.pointerId)) {
        return;
      }
      forwardPointerEvent(event, 'pointermove');
    });

    const finishPointer = (event: PointerEvent, outside: boolean): void => {
      if (!this.skiaActivePointers.has(event.pointerId)) {
        return;
      }

      this.skiaActivePointers.delete(event.pointerId);
      this.skiaCanvas.releasePointerCapture?.(event.pointerId);
      forwardPointerEvent(event, outside ? 'pointerupoutside' : 'pointerup');
    };

    this.skiaCanvas.addEventListener('pointerup', (event) => {
      finishPointer(event, false);
    });

    this.skiaCanvas.addEventListener('pointercancel', (event) => {
      finishPointer(event, true);
    });

    this.skiaCanvas.addEventListener('pointerleave', (event) => {
      finishPointer(event, true);
    });
  }

  private draw(): void {
    const ctx2d = this.skiaCanvas.getContext('2d');
    const pixiView = this.getPixiView();

    if (!ctx2d || !(pixiView instanceof HTMLCanvasElement)) {
      return;
    }

    ctx2d.clearRect(0, 0, this.skiaCanvas.width, this.skiaCanvas.height);
    ctx2d.drawImage(pixiView, 0, 0, this.skiaCanvas.width, this.skiaCanvas.height);
  }
}
