export default class ColumnChart {
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
    this.chartHeight = 50;

    this.render();
  }

  render() {
    const { label, value } = this;

    const link =
      this.link ?
        `<a href="${this.link}" class="column-chart__link">View all</a>` :
        '';

    const chart = this.renderChart();

    const haveData = Boolean(this.data.length);
    const columnChartClassNames = `column-chart ${haveData || 'column-chart_loading'}`;

    const element = document.createElement('div');
    element.innerHTML = `
      <div class="${columnChartClassNames}" style="--chart-height: 50">
        <div class="column-chart__title">
          ${label}
          ${link}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${value}</div>
          ${chart}
        </div>
      </div>
    `;

    this.element = element.firstElementChild;
  }

  renderChart() {
    const columnProps = this.getColumnProps();
    const columns = columnProps.reduce((acc, item) => {
      const { percent, value } = item;

      return acc + `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
    }, '');

    const chart = `
      <div data-element="body" class="column-chart__chart">
        ${columns}
      </div>
    `;

    return chart;
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

  update(data) {
    this.data = data;
    this.render();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
