const url = "https://jsonplaceholder.typicode.com/users";

const usersList = document.getElementById("users__list");
let pagination = document.querySelector("#pagination");

let activePage,
  amountElements = [],
  activeAmount,
  paginationItems = [],
  users = [],
  notesOnPage = 10,
  countOfItems = 0;

//по url делаем запрос, приводим ответ к формату json, затем ответ обрабатывается функцией renderItems

const fetchData = async () => {
  const promise = fetch(url);
  const data = await promise;

  renderItems(await data.json());
};

fetchData();

//будущая функция выбора количества элементов на странице
const setActiveAmount = () => {
  var objects = document.getElementsByClassName("display");
  for (var obj of objects) {
    amountElements.push(obj);
  }
  amountElements.map((item) => {
    item.classList.contains("active") && (activeAmount = item);
    item.addEventListener("click", () => {
      showOne(item);
    });
  });
};
setActiveAmount();

const showOne = (item) => {
  activeAmount && activeAmount.classList.remove("active");

  activeAmount = item;

  item.classList.add("active");
  notesOnPage = item.innerHTML;
  fetchData();
};

//изначальная функция, которая подсчитывает данные и вызываем функцию отрисоки номеров страниц
const renderItems = (data) => {
  users = data;
  //  notesOnPage = document.getElementsByClassName("display active")[0].innerHTML; //считываем количество элементов на странице
  countOfItems = Math.ceil(users.length / notesOnPage); //подсчитываем количество страниц
  console.log(countOfItems);
  sliceItems(1); //начальное отображение первой страницы
  renderPaginationItems(countOfItems);
};

// функция отрисовки номеров страниц, на нажатие номеров навешиваем функцию showPage
const renderPaginationItems = (countOfItems) => {
  pagination.innerHTML = "";
  if (countOfItems === 1) {
    document.getElementsByClassName("pagination__container")[0].style.display =
      "none";
    return;
  }
  //если все элементы помещаются на одну страницу - не отрисовываем
  document.getElementsByClassName("pagination__container")[0].style.display =
    "flex";
  for (let i = 1; i <= countOfItems; i++) {
    let li = document.createElement("li");
    i === 1 && li.classList.add("active"); // по умолчанию - первая страница активна
    i === 1 && (active = li);
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

//меняем активный номер страницы и вызываем функцию подсчета и отрисовки элементов
const showPage = (item) => {
  active && active.classList.remove("active");

  active = item;

  item.classList.add("active");

  let pageNum = +item.innerHTML;
  sliceItems(pageNum);
};
// по номеру страницы отсчитываем начальный и конечный элемент этой страницы и вызываем функцию отрисовки
const sliceItems = (pageNum) => {
  let start = (pageNum - 1) * notesOnPage;
  let end = Number(start) + Number(notesOnPage);
  let usersSlice = users.slice(start, end);
  usersList.innerHTML = "";
  console.log(usersSlice);
  renderListItems(usersSlice);
};

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
// Как и в случае li, создаем тэг span, которому присваиваем имя класса, и внутрь него помещаем html с данными пользователя
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
