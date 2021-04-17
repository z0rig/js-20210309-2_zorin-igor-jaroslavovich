import fetchJson from '../../../utils/fetch-json.js';

const BASE_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};
  formatHeading = () => { };

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date()
    },
    label = '',
    link = '',
    value = '',
    formatHeading = (data) => data
  } = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.value = value;

    this.render();

    const { from, to } = this.range;
    this.update(from, to);
  }

  fetchData(params) {
    const requestURL = new URL(this.url, BASE_URL);

    Object.entries(params).forEach((paramsEntry) => {
      const [name, value] = paramsEntry;
      const isoDateStr = new Date(value).toISOString();

      requestURL.searchParams.set(name, isoDateStr);
    });

    return fetchJson(requestURL);
  }

  get template() {
    const { label } = this;

    const link =
      this.link ?
        `<a href="${this.link}" class="column-chart__link">View all</a>` :
        '';

    return `
      <div class="column-chart column-chart_loading" style="--chart-height: 50">
        <div class="column-chart__title">
          ${label}
          ${link}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
            <div data-element="body" class="column-chart__chart">

            </div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  renderHeading(data) {
    const value = data.reduce((summ, current) => {
      return summ += current;
    }, 0);

    this.subElements.header.textContent = this.formatHeading(value);
  }

  renderChartColumns(data) {
    const columnProps = this.getColumnProps(data);

    return columnProps
      .map((item) => {
        const { percent, value } = item;

        return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
      })
      .join('');
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    const columnProps = data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });

    return columnProps;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');

    const fetchedData = await this.fetchData({ from: from, to: to });
    const data = Object.values(fetchedData);

    this.element.classList.remove('column-chart_loading');

    this.subElements.body.innerHTML = this.renderChartColumns(data);
    this.renderHeading(data);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
