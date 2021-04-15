import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BASE_BACKEND_URL = 'https://course-js.javascript.ru';
const PRODUCT_BACKEND_URL = '/api/rest/products';
const CATEGORIES_BACKEND_URL = '/api/rest/categories';
const IMG_BACKEND_URL = 'https://api.imgur.com/3/image';

export default class ProductForm {
  formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.save();
  }

  sortableListContainerClickHandler = (evt) => {
    const { target } = evt;

    if (target.closest('[name="uploadImage"]')) {
      this.uploadImage();
      return;
    }
  }

  constructor(productId = '') {
    this.productId = productId;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    let categoriesData;
    let productData;

    if (this.productId) {
      [categoriesData, productData] = await Promise.all([
        this.getCategoriesData(),
        this.getProductData(this.productId)
      ]);
      productData = productData[0];
      this.fillImagesList(productData.images);
    } else {
      categoriesData = await this.getCategoriesData();
    }

    this.fillFormInputs(categoriesData, productData);

    this.initEventListeners();

    return this.element;
  }

  async save() {
    const uploadData = this.getUploadData();
    const url = new URL(PRODUCT_BACKEND_URL, BASE_BACKEND_URL);
    const method = this.productId ? 'PATCH' : 'PUT';

    await fetchJson(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(uploadData)
    });

    this.sendEvent();
  }

  sendEvent() {
    const eventName = !this.productId ? 'product-saved' : 'product-updated';
    const detail = !this.productId ? 'saved' : 'updated';

    this.element
      .dispatchEvent(
        new CustomEvent(eventName, { detail })
      );
  }

  fillFormInputs(categoriesData, productData) {
    const { subcategory } = this.subElements.productForm.elements;
    subcategory.innerHTML = this.createCategoriesOptions(categoriesData);

    if (productData) {
      const {
        description,
        discount,
        price,
        quantity,
        status,
        subcategory,
        title
      } = this.subElements.productForm.elements;

      description.value = productData.description;
      discount.value = productData.discount;
      price.value = productData.price;
      quantity.value = productData.quantity;
      status.value = productData.status;
      title.value = productData.title;
      subcategory.value = productData.subcategory;
    }
  }

  fillImagesList(imagesDataArr) {
    const { imageListContainer } = this.subElements;

    const sortableList = new SortableList({
      items: imagesDataArr.map(this.createImageListItem)
    });

    imageListContainer.append(sortableList.element);
  }

  createImageListItem({ url, source}) {
    const temp = document.createElement('div');

    temp.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(source)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle="true">
        </button>
      </li>`;

    return temp.firstElementChild;
  }

  createCategoriesOptions(categoryesArr) {
    const options = categoryesArr.map((category) => {
      const { title: categoryTitle } = category;

      return category.subcategories.map((subcategory) => {
        return this.createCategoryOption(categoryTitle, subcategory);
      });
    });

    return options.flat().join('');
  }

  createCategoryOption(categoryTitile, subcategoryDataObj) {
    const { title: subcategoryTitle, id: value } = subcategoryDataObj;

    return `<option value="${value}">${categoryTitile} > ${subcategoryTitle}</option>`;
  }

  getImagesData() {
    return [
      ...this.subElements['sortable-list-container']
        .querySelectorAll('.sortable-table__cell-img')
    ].map((imgEl) => {
      const { src, alt } = imgEl;

      return {
        url: src,
        source: alt
      };
    });
  }

  getUploadData() {
    const {
      description,
      discount,
      price,
      quantity,
      status,
      subcategory,
      title
    } = this.subElements.productForm.elements;

    const images = this.getImagesData();

    const uploadData = {
      description: description.value,
      discount: Number(discount.value),
      images,
      price: Number(price.value),
      quantity: Number(quantity.value),
      status: Number(status.value),
      subcategory: subcategory.value,
      title: title.value
    };

    if (this.productId) {
      uploadData.id = this.productId;
    }

    return uploadData;
  }

  getProductData(id) {
    const url = new URL(PRODUCT_BACKEND_URL, BASE_BACKEND_URL);
    url.searchParams.set('id', id);

    return fetchJson(url);
  }

  getCategoriesData() {
    const url = new URL(CATEGORIES_BACKEND_URL, BASE_BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return fetchJson(url);
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide"          data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">

            </div>
            <button type="button" name="uploadImage" data-element="uploadImageBtn" class="button-primary-outline fit-content"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select id="subcategory" class="form-control" name="subcategory">

            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input id="price" required="" type="number" min="0.01" step="0.01" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input id="discount" required="" type="number" min="0" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input id="quantity" required="" type="number" min="0" class="form-control" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select id="status" class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  initEventListeners() {
    this.subElements.productForm
      .addEventListener('submit', this.formSubmitHandler);

    this.subElements['sortable-list-container']
      .addEventListener('click', this.sortableListContainerClickHandler);
  }

  creareFileInputElement() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.hidden = true;
    fileInput.accept = 'image/*';

    return fileInput;
  }

  uploadImage() {
    const fileInput = this.creareFileInputElement();

    fileInput.addEventListener('change', async (evt) => {
      const [img] = fileInput.files;
      if (img) {
        const { imageListContainer, uploadImageBtn } = this.subElements;

        uploadImageBtn.classList.add('is-loading');
        uploadImageBtn.disabled = true;

        const formData = new FormData();
        formData.append('image', img);

        const result = await fetchJson(IMG_BACKEND_URL, {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData
        });

        const imageList = imageListContainer.querySelector('ul');

        imageList.append(this.createImageListItem({
          url: result.data.link,
          source: img.name
        }));

        uploadImageBtn.disabled = false;
        uploadImageBtn.classList.remove('is-loading');

        fileInput.remove();
      }
    });

    document.body.append(fileInput);
    fileInput.dispatchEvent(new MouseEvent('click'));
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
