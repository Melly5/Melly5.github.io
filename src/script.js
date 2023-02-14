const url = "https://jsonplaceholder.typicode.com/users";

const usersList = document.getElementById("users__list");
let pagination = document.querySelector("#pagination");

let activePage,
  activeAmount,
  activeSort,
  amountItems = [],
  paginationItems = [],
  sortItems = [],
  users = [],
  usersSlice = [],
  notesOnPage = 10,
  countOfItems = 0;

//по url делаем запрос, приводим ответ к формату json, затем ответ обрабатывается функцией renderItems
const fetchData = async () => {
  const promise = fetch(url);
  const data = await promise;
  users = await data.json();
  renderItems(users);
};

//изначальная функция, которая подсчитывает данные и вызываем функцию отрисоки номеров страниц
const renderItems = (users) => {
  countOfItems = Math.ceil(users.length / notesOnPage); //подсчитываем количество страниц

  sliceItems(1); //начальное отображение первой страницы
  renderPaginationItems(countOfItems);
};

// функция отрисовки номеров страниц, на нажатие номеров навешиваем функцию showPage
const renderPaginationItems = (countOfItems) => {
  pagination.innerHTML = "";

  //если все элементы помещаются на одну страницу - не отрисовываем
  if (countOfItems === 1) {
    document.getElementsByClassName("pagination__container")[0].style.display =
      "none";
    return;
  }

  document.getElementsByClassName("pagination__container")[0].style.display =
    "flex";

  for (let i = 1; i <= countOfItems; i++) {
    let li = document.createElement("li");

    i === 1 && li.classList.add("active"); // по умолчанию - первая страница активна
    i === 1 && (activePage = li); //присваиваем переменной активный элемент

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
  activePage && activePage.classList.remove("active");

  activePage = item;

  item.classList.add("active");

  let pageNum = +item.innerHTML;
  sliceItems(pageNum);
};

// по номеру страницы отсчитываем начальный и конечный элемент этой страницы и вызываем функцию отрисовки
const sliceItems = (pageNum) => {
  let start = (pageNum - 1) * notesOnPage;
  let end = Number(start) + Number(notesOnPage);
  usersSlice = users.slice(start, end);
  renderListItems(usersSlice);
};

//функция рендера компонентов списка с данными с сервера:
// - создаем тэг элемента списка
// - присваиваем ему имя класса,подключаем свойство быть перемещаемым(draggable), содержимым является имя пользователя, пришедшее с сервера
// - говорим, что родительским элементом li является элемент с id == users__list, т.е. наш тэг ul
// - вызываем ыункцию, добавляющую всплывающее окно с информацией о пользователе
// - последнее действие это добавление функции, которая обрабатывает события при перемещении элемента, на вход подаём родительский элемент
const renderListItems = (data) => {
  usersList.innerHTML = "";

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

//данной функцией для объектов выбора количества элементов в списке добавляем обработчик события при нажатии
const setActiveAmount = () => {
  var objects = document.getElementsByClassName("display");
  for (var obj of objects) {
    amountItems.push(obj);
  }
  amountItems.map((item) => {
    item.classList.contains("active") && (activeAmount = item);
    item.addEventListener("click", () => {
      displayPage(item);
    });
  });
};

//вызывается функция смены стиля активной кнопки и перерендер спиcка
const displayPage = (item) => {
  activeAmount && activeAmount.classList.remove("active");

  activeAmount = item;

  item.classList.add("active");

  notesOnPage = item.innerHTML; //считываем количество элементов списка
  renderItems(users); //отрисовываем с новыми параметрами
};

//добавляем каждой из кнопок сортировки обработчики событий при нажатии
const setActiveSort = () => {
  var objects = document.getElementsByClassName("sort");
  for (var obj of objects) {
    sortItems.push(obj);
  }
  sortItems[0].addEventListener("click", () => {
    sortArrayByName(usersSlice);
    sortItems[0].classList.add("active");
    activeSort && activeSort.classList.remove("active");

    activeSort = sortItems[0];

    sortItems[0].classList.add("active");
    sortItems[2].classList.remove("disable");
  });
  sortItems[1].addEventListener("click", () => {
    sortArrayByEmail(usersSlice);
    activeSort && activeSort.classList.remove("active");

    activeSort = sortItems[1];

    sortItems[1].classList.add("active");
    sortItems[2].classList.remove("disable");
  });
  sortItems[2].addEventListener("click", () => {
    renderListItems(usersSlice);
    sortItems[2].classList.add("disable");
  });
};

//сортировка по имени
const sortArrayByName = (users) => {
  let sorted = JSON.parse(JSON.stringify(users));
  //глубокое копирование объекта, чтобы не менять массив usersSlice
  sorted = sorted.sort(byField("name"));

  renderListItems(sorted);
};

//сортировка по почте
const sortArrayByEmail = (users) => {
  //глубокое копирование объекта, чтобы не менять массив usersSlice
  let sorted = JSON.parse(JSON.stringify(users));

  sorted = sorted.sort(byField("email"));

  renderListItems(sorted);
};

//сортировка по параметру
const byField = (field) => {
  return (a, b) => (a[field] > b[field] ? 1 : -1);
};

fetchData();
setActiveAmount();
setActiveSort();
