const MS_IN_31_DAYS = 60 * 60 * 24 * 31 * 1000;

export default class RangePicker {
  static getNumberDaysInMonth =
    (year, month) => new Date(year, month + 1, 0).getDate();

  showElement = () => {
    if (this.subElements.selector.innerHTML === '') {
      this.renderCalendars(this.from);
    }

    if (this.element.classList.contains('.rangepicker')) {
      return;
    }

    if (this.element.classList.contains('rangepicker_open')) {
      this.element.classList.remove('rangepicker_open');
      return;
    }

    this.element.classList.add('rangepicker_open');

    document.addEventListener('pointerdown', this.hideElement, true);
  };

  hideElement = (evt) => {
    if (!evt || !evt.target.closest('.rangepicker')) {
      this.element.classList.remove('rangepicker_open');

      document.removeEventListener('pointerdown', this.hideElement, true);
    }
  }

  selectorClickHandler = (evt) => {
    const { target } = evt;

    if (
      target.classList.contains('rangepicker__selector-control-left') ||
      target.classList.contains('rangepicker__selector-control-right')
    ) {

      const { direction } = target.dataset;

      this.dateForSlide = new Date(this.dateForSlide.getTime() + (MS_IN_31_DAYS * direction));

      this.renderCalendars(this.dateForSlide);

      return;
    }

    if (!target.closest('.rangepicker__cell')) {
      return;
    }

    if (this.tempFrom === null) {
      this.tempFrom = new Date(target.dataset.value);

      const fromBtnElement =
        this.subElements.selector.querySelector('.rangepicker__selected-from');
      const toBtnElement =
        this.subElements.selector.querySelector('.rangepicker__selected-to');
      fromBtnElement?.classList.remove('rangepicker__selected-from');
      toBtnElement?.classList.remove('rangepicker__selected-to');

      const betweenBtnsElements =
        this.subElements.selector.querySelectorAll('.rangepicker__selected-between');
      if (betweenBtnsElements.length) {
        [...betweenBtnsElements].forEach((betweenBtnElement) => {
          betweenBtnElement.classList.remove('rangepicker__selected-between');
        });
      }

      target.classList.add('rangepicker__selected-from');

      this.from = this.tempFrom;
      this.to = this.from;

      return;
    }

    this.to = new Date(target.dataset.value);

    if (this.from.getTime() > this.to.getTime()) {
      [this.from, this.to] = [this.to, this.from];
    }

    target.classList.add('rangepicker__selected-to');
    this.renderInputValues(this.from, this.to);
    this.renderCalendars(this.from);

    this.element.dispatchEvent(new CustomEvent('date-select', {
      detail: {
        from: this.from,
        to: this.to
      },
      bubbles: true
    }));

    this.tempFrom = null;
    this.hideElement();
  }

  constructor({
    from = new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to = new Date()
  } = {}) {
    this.from = new Date(from);
    this.to = new Date(to);

    this.tempFrom = null;
    this.dateForSlide = new Date(from);

    this.render();
    this.initEventListeners();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.renderInputValues(this.from, this.to);
  }

  get template() {
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="from"></span> -
          <span data-element="to"></span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>
    `;
  }

  createCalendarsHTMLString(fromDate) {
    const dateForRightCalendar =
      new Date(fromDate.getTime() + MS_IN_31_DAYS);

    const leftCalendarHTMLString
      = this.createMonthCalendarHTMLString(fromDate);
    const rightCalendarHTMLString =
      this.createMonthCalendarHTMLString(dateForRightCalendar);

    return leftCalendarHTMLString + rightCalendarHTMLString;
  }

  createMonthCalendarHTMLString(dateObj) {
    const monthName = dateObj.toLocaleString('ru', { month: 'long' });

    const daysDataArr =
      this.createMonthDaysDataArr(dateObj, this.from, this.to);

    const daysHTMLString = daysDataArr
      .map(this.createDaysHTMLString)
      .join('');

    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          ${monthName}
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
          ${daysHTMLString}
        </div>
      </div>
    `;
  }

  createMonthDaysDataArr(dateObj, dateFrom, dateTo) {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();

    const numberDaysInMonth = RangePicker.getNumberDaysInMonth(year, month);

    const daysData = new Array(numberDaysInMonth)
      .fill('')
      .map((_, i) => {
        const currentDateObj = new Date(year, month, i + 1);

        const currentDateMs = currentDateObj.getTime();
        const dateFromMs = dateFrom.getTime();
        const dateToMs = dateTo.getTime();

        const isFrom = currentDateMs === dateFromMs;
        const isBetween = dateFromMs < currentDateMs && currentDateMs < dateToMs;
        const isTo = currentDateMs === dateToMs;

        const content = currentDateObj.getDate();
        const dateISOString = currentDateObj.toISOString();

        let startFrom = '';
        if (i === 0) {
          startFrom = `style="--start-from: ${currentDateObj.getDay()}"`;
        }

        return {
          startFrom,
          content,
          dateISOString,
          isBetween,
          isFrom,
          isTo,
        };
      });

    return daysData;
  }

  createDaysHTMLString({ content, dateISOString, isBetween, isFrom, isTo, startFrom }) {

    let stateClassName;
    switch (true) {
    case isBetween:
      stateClassName = 'rangepicker__selected-between';
      break;

    case isFrom:
      stateClassName = 'rangepicker__selected-from';
      break;

    case isTo:
      stateClassName = 'rangepicker__selected-to';
      break;

    default:
      stateClassName = '';
    }

    return `
      <button
        ${startFrom}
        type="button"
        class="rangepicker__cell ${stateClassName}"
        data-value="${dateISOString}">${content}
      </button>`;
  }

  renderInputValues(dateFrom, dateTo) {
    const { from, to } = this.subElements;

    from.textContent = dateFrom.toLocaleDateString('ru');
    to.textContent = dateTo.toLocaleDateString('ru');
  }

  renderCalendars(from) {
    const calendarsHTMLString =
      this.createCalendarsHTMLString(from);

    this.subElements.selector.innerHTML = `
      <div class="rangepicker__selector-arrow"></div>
      <div data-direction="-1" class="rangepicker__selector-control-left"></div>
      <div data-direction="1" class="rangepicker__selector-control-right"></div>
        ${calendarsHTMLString}
      </div>
    `;
  }

  initEventListeners() {
    const { input, selector } = this.subElements;

    input.addEventListener('click', this.showElement);

    selector.addEventListener('click', this.selectorClickHandler);
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
  }
}
