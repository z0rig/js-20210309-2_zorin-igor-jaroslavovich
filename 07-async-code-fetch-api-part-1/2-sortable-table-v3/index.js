import fetchJson from './utils/fetch-json.js';

const BASE_URL = 'https://course-js.javascript.ru';

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

    const { id, order } = cellEl.dataset;
    this.sortFieldId = id;
    this.sortingOrder = order;

    if (this.isSortOnClient) {
      this.sortOnClient(id, order);

      return;
    }

    this.sortOnServer(id, order);
  }

  documentScrollHandler = async () => {
    const { body } = this.subElements;

    const isTableBottomInViewport =
      body.getBoundingClientRect()
        .bottom - window.innerHeight - 100 < 0;

    if (isTableBottomInViewport && !this.isLoading) {
      this.start = this.end;
      this.end += this.step;

      const fetchedData = await this.fetchData(this.sortFieldId, this.sortingOrder);

      this.data = [...this.data, ...fetchedData];

      this.createTableRows(this.data);

    }
  }

  constructor(
    header = [],
    {
      data = [],
      isSortOnClient = false,
      url = '',
      sorted = {
        id: header.find(item => item.sortable).id,
        order: 'asc'
      },
      step = 30,
    } = {}) {
    this.header = header;
    this.data = data;
    this.isSortOnClient = isSortOnClient;
    this.url = url;
    this.sortFieldId = sorted.id;
    this.sortingOrder = sorted.order;

    this.step = step;
    this.start = 0;
    this.end = this.start + this.step;

    this.isLoading = false;

    this.render();
  }

  async fetchData(sortFieldId, sortingOrder, start = this.start, end = this.end) {
    const requestURL = new URL(this.url, BASE_URL);

    requestURL.searchParams.set('_sort', sortFieldId);
    requestURL.searchParams.set('_order', sortingOrder);
    requestURL.searchParams.set('_start', start);
    requestURL.searchParams.set('_end', end);

    this.subElements.loading.style.display = 'block';
    this.isLoading = true;

    const newData = await fetchJson(requestURL);

    this.subElements.loading.style.display = 'none';
    this.isLoading = false;

    if (!newData.length) {
      this.subElements.emptyPlaceholder.style.display = 'block';

      return [];
    }

    this.subElements.emptyPlaceholder.style.display = 'none';

    return newData;
  }

  async sortOnServer(id, order) {
    const fetchedData = await this.fetchData(id, order);

    this.createTableRows(fetchedData);
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.subElements.activeHeaderCell =
      this.element.querySelector(`[data-order="${this.sortingOrder}"]`);

    this.data = await this.fetchData(this.sortFieldId, this.sortingOrder);

    this.createTableRows(this.data);

    this.initEventListeners();
  }

  get template() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">

          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.createHeaderRow()}
          </div>

          <div data-element="body" class="sortable-table__body">

          </div>

          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
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
      this.sortingOrder :
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
    this.subElements.body.innerHTML = data.map((rowData) => {
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

  sortOnClient(fieldId, orderValue) {
    const LOCALE = 'ru';
    const COLLATOR_OPTIONS = {
      caseFirst: 'upper',
      sensitivity: 'case',
    };

    const sortType = this.header.find((item) => item.id === fieldId).sortType;
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[orderValue];

    const sortedData = [...this.data].sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[fieldId] - b[fieldId]);
      case 'string':
        return direction * new Intl.Collator(LOCALE, COLLATOR_OPTIONS).compare(a[fieldId], b[fieldId]);
      default:
        return direction * (a[fieldId] - b[fieldId]);
      }
    });

    this.createTableRows(sortedData);
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.headerCellHandler);
    document.addEventListener('scroll', this.documentScrollHandler);
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
      .removeEventListener('pointerdown', this.headerCellHandler);

    document.removeEventListener('scroll', this.documentScrollHandler);
  }
}
