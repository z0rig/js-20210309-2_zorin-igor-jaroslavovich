class Tooltip {
  static #onlyInstance = null;

  pointeroverHandler = (evt) => {
    const tooltip = evt.target.dataset.tooltip;

    if (!tooltip) {
      return;
    }

    this.render();

    this.element.textContent = tooltip;

    document.addEventListener('pointerout', this.pointeroutHandler);
    document.addEventListener('pointermove', this.pointermoveHandlesr);
  }

  pointermoveHandlesr = (evt) => {
    const { clientX, clientY } = evt;

    const cursourCoords = {
      x: Math.round(clientX),
      y: Math.round(clientY)
    };

    this.moveTooltip(cursourCoords);
  }

  pointeroutHandler = () => {
    this.remove();

    document.removeEventListener('pointerout', this.pointeroutHandler);
    document.removeEventListener('pointermove', this.pointermoveHandlesr);
  }

  constructor() {
    if (!Tooltip.#onlyInstance) {
      Tooltip.#onlyInstance = this;
    } else {
      return Tooltip.#onlyInstance;
    }
  }

  moveTooltip(coords) {
    const OFFSET = 10;
    const { x, y } = coords;

    this.element.style.left = `${x + OFFSET}px`;
    this.element.style.top = `${y + OFFSET}px`;
  }

  initialize() {
    document.addEventListener('pointerover', this.pointeroverHandler);
  }

  render() {
    if (this.element) {
      document.body.append(this.element);
      return;
    }

    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    document.body.append(this.element);
  }

  get template() {
    return `<div class="tooltip"></div>`;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerover', this.show);
  }
}

const tooltip = new Tooltip();

export default tooltip;
