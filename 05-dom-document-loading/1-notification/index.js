export default class NotificationMessage {
  constructor(
    notificationText = '',
    {
      duration = 1000,
      type = 'success'
    } = {}
  )
  {
    this.notificationText = notificationText;
    this.duration = duration;
    this.type = type;
    this.element = this.createNotificationElement();
  }

  static currentNotification = null;

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.notificationText}
          </div>
        </div>
      </div>
    `;
  }

  createNotificationElement() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    return element.firstElementChild;
  }

  show(parent) {
    if (NotificationMessage.currentNotification) {
      clearTimeout(NotificationMessage.currentNotification.timeoutId);
      NotificationMessage.currentNotification.remove();
    }

    NotificationMessage.currentNotification = this;

    if (parent) {
      parent.append(this.element);
    } else {
      document.body.append(this.element);
    }

    this.timeoutId = setTimeout(() => {
      this.remove();
      NotificationMessage.currentNotification = null;
    }, this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // this.element = null; //почему тесты падают, если добавить эту строку?
  }
}
