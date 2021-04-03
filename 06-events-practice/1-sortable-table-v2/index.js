export default class SortableTable {
  subElements = {}

  headerCellHandler = (evt) => {
    const cellEl = evt.target.closest('div[data-id]');

    if (!cellEl || cellEl.dataset.sortable === 'false') { return; }

    if (cellEl === this.subElements.activeHeaderCell) {
      const currentOrderValue = cellEl.dataset.order;

      if (currentOrderValue === 'asc') {
        cellEl.dataset.order = 'desc';
      } else {
        cellEl.dataset.order = 'asc';
      }
    } else {
      this.subElements.activeHeaderCell.dataset.order = '';
      this.subElements.activeHeaderCell = cellEl;
      this.subElements.activeHeaderCell.dataset.order = 'desc';
    }

    const orderValue = cellEl.dataset.order;
    const id = cellEl.dataset.id;

    this.sort(id, orderValue);
  }

  constructor(
    header = [],
    {
      data = [],
      sortFieldId = header.find(item => item.sortable).id,
      defaultOrder = 'asc'
    }) {
    this.header = header;
    this.data = data;
    this.sortFieldId = sortFieldId;
    this.defaultOrder = defaultOrder;

    this.render();
    this.initEventListeners();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.subElements.activeHeaderCell =
      this.element.querySelector(`[data-order="${this.defaultOrder}"]`);
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">

          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.createHeaderRow()}
          </div>

          <div data-element="body" class="sortable-table__body">
            ${this.createTableRows(this.sortData(this.sortFieldId, this.defaultOrder))}
          </div>

        </div>
      </div>
    `;
  }

  createHeaderRow() {
    return this.header.map((item) => this.createHeaderCell(item)).join('');
  }

  createHeaderCell(data) {
    const { id, title, sortable } = data;
    const isActiveSortCell = id === this.sortFieldId;

    const dataOrderAttrValue = isActiveSortCell ?
      this.defaultOrder :
      '';

    return `
        <div class="sortable-table__cell" data-order=
        "${dataOrderAttrValue}"
        data-id="${id}" data-sortable="${sortable}">
          <span>${title}</span>
          <span data-element="arrow" class="sortable-table__sort-arrow">
            <span class="sort-arrow"></span>
          </span>
        </div>
      `;
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

      if (item.template) {
        return item.template(cellContent);
      }

      return `<div class="sortable-table__cell">${cellContent}</div>`;
    }).join('');
  }

  sort(fieldId, orderValue) {
    const sortedData = this.sortData(fieldId, orderValue);

    this.subElements.body.innerHTML = this.createTableRows(sortedData);
  }

  sortData(fieldId, orderValue = 'asc') {
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

    return sortedData.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[fieldId] - b[fieldId]);
      case 'string':
        return direction * new Intl.Collator(LOCALE, COLLATOR_OPTIONS).compare(a[fieldId], b[fieldId]);
      default:
        return direction * (a[fieldId] - b[fieldId]);
      }
    });
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.headerCellHandler);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements.header
      .removeEventListener('click', this.headerCellHandler);
  }
}
