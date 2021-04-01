export default class SortableTable {
  subElements = {}

  constructor(header = [], { data = [] }) {
    this.header = header;
    this.data = data;
    this.render();
  }

  sort(fieldId, orderValue) {
    const LOCALE = 'ru';
    const COLLATOR_OPTIONS = {
      caseFirst: 'upper',
      sensitivity: 'case',
    };

    const sortedData = [...this.data];

    const sortType = this.header.find((item) => item.id === fieldId).sortType;

    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[orderValue];

    sortedData.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[fieldId] - b[fieldId]);
      case 'string':
        return direction * new Intl.Collator(LOCALE, COLLATOR_OPTIONS).compare(a[fieldId], b[fieldId]);
      default:
        return direction * (a[fieldId] - b[fieldId]);
      }
    });

    this.subElements.body.innerHTML = this.createTableRows(sortedData);
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">

          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.createHeaderCells()}
          </div>

          <div data-element="body" class="sortable-table__body">
            ${this.createTableRows(this.data)}
          </div>

        </div>
      </div>
    `;
  }

  createHeaderCells() {
    return this.header.map((item) => {
      const { id, title, sortable } = item;
      const arrowElement = sortable ?
        `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>` :
        '';

      return `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="true">
          <span>${title}</span>
          ${arrowElement}
        </div>
      `;
    }).join('');
  }

  createTableRows(data) {
    return data.map((rowData) => {
      const { id } = rowData;
      return `
        <a href="/products/${id}" class="sortable-table__row">
          ${this.createTableRowCells(rowData)}
        </a>
      `;
    }).join('');
  }

  createTableRowCells(rowData) {
    return this.header.map((item) => {
      let cellContent = rowData[item.id];

      if (item.id === 'images') {
        const imgUrl = rowData[item.id][0].url;

        cellContent = `<img class="sortable-table-image" alt="Image" src="${imgUrl}">`;
      }

      return `<div class="sortable-table__cell">${cellContent}</div>`;
    }).join('');
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // this.element = null; //почему тесты падают, если добавить эту строку?
  }
}
