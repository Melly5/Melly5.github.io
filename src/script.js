const ul = document.getElementById("users__list");
const url = "https://jsonplaceholder.typicode.com/users";

fetch(url)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    renderItems(data);
  })
  .catch(function (error) {
    console.log(error);
  });

const renderItems = (data) => {
  data.map((user) => {
    let li = document.createElement("li");

    li.className = "users__item";
    li.draggable = true;
    li.innerText = user.name;

    ul.appendChild(li);
  });
};
