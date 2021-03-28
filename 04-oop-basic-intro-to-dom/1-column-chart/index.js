export default class ColumnChart {
  chartHeight = 50;
  subElements = {};

  constructor({
    data = [],
    label = '',
    value = '',
    link = ''
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;

    this.render();
  }

  get template() {
    const { label, value } = this;

    const link =
      this.link ?
        `<a href="${this.link}" class="column-chart__link">View all</a>` :
        '';

    const chartColumns = this.renderChartColumns();

    const haveData = Boolean(this.data.length);
    const columnChartClassNames = `column-chart ${haveData || 'column-chart_loading'}`;

    return `
      <div class="${columnChartClassNames}" style="--chart-height: 50">
        <div class="column-chart__title">
          ${label}
          ${link}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${value}</div>
            <div data-element="body" class="column-chart__chart">
              ${chartColumns}
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

  renderChartColumns() {
    const columnProps = this.getColumnProps();
    return columnProps
      .map((item) => {
        const { percent, value } = item;

        return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
      })
      .join('');
  }

  getColumnProps() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  update(data) {
    this.data = data;
    this.subElements.body.innerHTML = this.renderChartColumns();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
