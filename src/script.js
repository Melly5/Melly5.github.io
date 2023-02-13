const usersList = document.getElementById("users__list");
const url = "https://jsonplaceholder.typicode.com/users";

let pagination = document.querySelector("#pagination");
let active,
  paginationItems = [],
  users = [],
  notesOnPage = 3,
  countOfItems = 0;

//по url делаем запрос, приводим ответ к формату json, затем ответ обрабатывается функцией renderItems

const fetchData = async () => {
  const promise = fetch(url);
  const data = await promise;
  renderListItems(await data.json());
};

fetchData();

//функция рендера компонентов списка с данными с сервера:
// - создаем тэг элемента списка
// - присваиваем ему имя класса,подключаем свойство быть перемещаемым(draggable), содержимым является имя пользователя, пришедшее с сервера
// - говорим, что родительским элементом li является элемент с id == users__list, т.е. наш тэг ul
// - вызываем ыункцию, добавляющую всплывающее окно с информацией о пользователе
// - последнее действие это добавление функции, которая обрабатывает события при перемещении элемента, на вход подаём родительский элемент
const renderListItems = (data) => {
  data.map((user) => {
    let li = document.createElement("li");
    li.className = "users__item";
    li.draggable = true;
    li.innerText = user.name;

    usersList.appendChild(li);

    addPopupInfo(user, li);
    addDragEventListeners(usersList);
  });

  countOfItems = Math.ceil(data.length / notesOnPage);

  renderPaginationItems(countOfItems);
};

const renderPaginationItems = (countOfItems) => {
  for (let i = 1; i <= countOfItems; i++) {
    let li = document.createElement("li");
    li.innerHTML = i;
    pagination.appendChild(li);
    paginationItems.push(li);
  }

  paginationItems.map((item) =>
    item.addEventListener("click", () => {
      showPage(item);
    })
  );
};

const showPage = (item) => {
  active && active.classList.remove("active");

  active = item;

  item.classList.add("active");
};

const addDragEventListeners = (listElement) => {
  //если начинаем двигать элемент, ему присваивается класс selected
  // + скрываем всплывающее окно, чтобы оно не мешало при перетаскивании
  listElement.addEventListener("dragstart", (event) => {
    event.target.classList.add(`selected`);

    let children = event.target.childNodes;
    children[1].classList.remove(`show`);
  });

  //отпускаем элемент - удаляем класс selected
  listElement.addEventListener("dragend", (event) => {
    event.target.classList.remove(`selected`);
  });

  //пока двигаем объект происходит сравнение двигаемого элемента и тот, с которым он меняется местами
  listElement.addEventListener(`dragover`, (event) => {
    event.preventDefault();
    const activeElement = listElement.querySelector(`.selected`); //ищется перемещаемый элемент
    const currentElement = event.target; // в текущий записываем элемент, над которым мы находимся

    const isMoveable =
      activeElement !== currentElement &&
      currentElement.classList.contains(`users__item`); // элемент считается перемещенным, если он сдвинулся со своего места и элемент, с которым хотим его поменять тоже является частью списка

    if (!isMoveable) {
      // если же условия выше не выполнены, значит объект не перемещаем
      return;
    }

    const nextElement =
      currentElement === activeElement.nextElementSibling
        ? currentElement.nextElementSibling
        : currentElement;
    // вычисляем объект, перед которым будем вставлять перемещаемый тэг:
    // - если элемент, с которым хотим поменять положение, находится под перемещаемым, то вычисляемым объектом будет следующий после него
    // - если же это не так - объектом будет сам элемент, на котором мы сейчас находимся
    // ниже происходит вставка нашего перемещаемого элемента перед вычисленным объектом
    listElement.insertBefore(activeElement, nextElement);
  });
};

//на добавление всплывающего окна использовала не атрибут innerText, а innerHTML, так как посчитала, что в данном случае будет удобней.
// КАк и в случае li, создаем тэг span, которому присваиваем имя класса, и внутрь него помещаем html с данными пользователя
// Также добавляем события на перемещение мыши: при нахождении курсора на элементе списка показываем доп. информацию, при нахождении вне элемента - скрываем информацию
const addPopupInfo = (user, li) => {
  let span = document.createElement("span");
  span.className = "users__info";
  span.innerHTML += `
    <p>USERNAME:</p>
    ${user.username}<br/>
    <p>EMAIL:</p>
    ${user.email}<br/>
    <p>ADDRESS:</p>
    ${user.address.city} city<br/>
    ${user.address.street} street<br/>
    ${user.address.suite} <br/>
  `;
  li.addEventListener("mouseover", () => span.classList.add("show"));
  li.addEventListener("mouseout", () => span.classList.remove("show"));

  li.appendChild(span);
};
