import fetchJson from './utils/fetch-json.js';

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

    this.sortingOrder = cellEl.dataset.order;
    this.sortFieldId = cellEl.dataset.id;

    if (this.isSortOnClient) {
      this.sort(id, orderValue);

      return;
    }

    this.sortOnServer();
  }

  documentScrollHandler = () => {
    const { body } = this.subElements;

    const isTableBottomInViewport =
      body.getBoundingClientRect()
        .bottom - window.innerHeight - 100 < 0;

    if (isTableBottomInViewport && !this.isLoading) {
      const end = this.start + this.rowPerScreen * ++this.currentScreen;

      this.fetchData(end).then((data) => {
        this.subElements.body.innerHTML = this.createTableRows(data);
        this.isLoading = false;
      });
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
      rowPerScreen = 30,
    } = {}) {
    this.header = header;
    this.data = data;
    this.isSortOnClient = isSortOnClient;
    this.url = url;
    this.sortFieldId = sorted.id;
    this.sortingOrder = sorted.order;
    this.rowPerScreen = rowPerScreen;

    this.start = 0;
    this.currentScreen = 1;
    this.isLoading = false;

    this.render();
    this.initEventListeners();
  }

  fetchData(end = this.start + this.rowPerScreen) {
    const BASE_URL = 'https://course-js.javascript.ru';

    const requestURL = new URL(this.url, BASE_URL);

    requestURL.searchParams.set('_sort', this.sortFieldId);
    requestURL.searchParams.set('_order', this.sortingOrder);
    requestURL.searchParams.set('_start', this.start);
    requestURL.searchParams.set('_end', end);

    this.isLoading = true;
    return fetchJson(requestURL);
  }

  async sortOnServer() {
    this.currentScreen = 1;
    this.subElements.body.innerHTML = '';
    this.subElements.loading.style.display = 'block';

    const fetchedData = await this.fetchData();
    this.isLoading = false;

    this.subElements.loading.style.display = 'none';

    if (!fetchedData.length) {
      this.subElements.emptyPlaceholder.style.display = 'block';

      return;
    }

    this.subElements.emptyPlaceholder.style.display = 'none';

    this.subElements.body.innerHTML = this.createTableRows(fetchedData);
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.subElements.activeHeaderCell =
      this.element.querySelector(`[data-order="${this.sortingOrder}"]`);

    const fetchedData = await this.fetchData();
    this.isLoading = false;
    this.subElements.body.innerHTML = this.createTableRows(fetchedData);
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
