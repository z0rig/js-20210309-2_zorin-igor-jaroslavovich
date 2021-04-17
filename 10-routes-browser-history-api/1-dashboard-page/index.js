import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {}

  async updateComponents(from, to) {
    const newData = await fetchJson(
      `${BACKEND_URL}api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`
    );

    this.components.sortableTable.addRows(newData);
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();

    this.initEventListeners();

    return this.element;
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({ from, to });

    const sortableTable = new SortableTable(header, {
      isSortOnClient: true,
      url: `api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`
    });

    const ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: { from, to },
      label: 'orders',
      link: '#'
    });

    const salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      label: 'sales',
      range: {from, to}
    });

    const customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      label: 'costumers',
      range: {from, to}
    });

    this.components = {
      rangePicker,
      sortableTable,
      ordersChart,
      salesChart,
      customersChart
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach((component) => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  initEventListeners() {
    this.components.rangePicker
      .element.addEventListener('date-select', (evt) => {
        const { from, to } = evt.detail;

        this.updateComponents(from, to);
      });
  }

  get template() {
    return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <!-- range picker component -->
        <div data-element="rangePicker"></div>
      </div>

      <div data-element="chartRoots" class="dashboard__charts">
        <!-- column charts components -->
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>

      <h3 class="block-title">Best Sellers</h3>

      <div data-element="sortableTable">
        <!-- sortable table component -->
      </div>
    </div>`;
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

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
