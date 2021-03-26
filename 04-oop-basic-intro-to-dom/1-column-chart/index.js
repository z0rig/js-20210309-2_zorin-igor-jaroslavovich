export default class ColumnChart {
  constructor({
    data = [],
    label = '',
    value = '',
    link = ''
  } = {}) {
    this._data = data;
    this._label = label;
    this._value = value;
    this._link = link;

    this._render();
  }

  chartHeight = 50;

  _render() {
    const { _label: label, _value: value } = this;

    const link =
      this._link ?
        `<a href="${this._link}" class="column-chart__link">View all</a>` :
        '';

    const chart = this._renderChart();

    const haveData = Boolean(this._data.length);
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

  _renderChart() {
    const columnProps = this._getColumnProps();
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

  _getColumnProps() {
    const maxValue = Math.max(...this._data);
    const scale = this.chartHeight / maxValue;

    return this._data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  update(data) {
    this._data = data;
    this._render();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
