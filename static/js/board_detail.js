document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("authToken"); // Получаем токен пользователя
    const boardId = window.location.pathname.split("/").filter(Boolean)[1]; // Получаем id доски из URL
    const boardTitleEl = document.getElementById("board-title"); // Элемент для названия доски
    const listsCont = document.getElementById("lists-container"); // Контейнер для всех списков
    const addListBtn = document.getElementById("add-list-btn"); // Кнопка для добавления списка

    // Функция отрисовки всей доски (board, lists, cards)
    function renderBoard(board) {
        boardTitleEl.textContent = board.title;
        addListBtn.style.display = "inline-block";
        listsCont.innerHTML = "";
        board.lists
            .slice()
            .sort((a, b) => a.id - b.id) // Сортируем списки по id
            .forEach(list => {
                // Создаём DOM-элемент столбца списка
                const listCol = document.createElement("div");
                listCol.className = "list-column";
                listCol.dataset.listId = list.id;
                // Красим фон столбца в зависимости от цвета (если выбран)
                if (list.color === "red") listCol.style.background = "#ffe0e0";
                else if (list.color === "yellow") listCol.style.background = "#fffacc";
                else if (list.color === "green") listCol.style.background = "#e6fbd9";

                // Заголовок и меню списка
                const header = document.createElement("div");
                header.className = "list-header";
                header.innerHTML = `
                        <span class="list-title">${list.title}</span>
                        <button class="list-menu-btn" data-list-id="${list.id}">
                            <span class="list-menu-icon">
                                <span></span><span></span><span></span>
                            </span>
                        </button>
                    `;
                // Меню для действий над списком
                const menu = document.createElement("div");
                menu.className = "list-menu-dropdown";
                menu.innerHTML = `
                        <div class="list-menu-item" data-action="edit" data-list-id="${list.id}">Изменить название</div>
                        <div class="list-menu-item" data-action="color" data-list-id="${list.id}">Изменить цвет</div>
                        <div class="list-menu-item delete" data-action="delete" data-list-id="${list.id}">Удалить список</div>
                    `;
                menu.style.display = "none";
                header.appendChild(menu);
                // Обработчик на троеточие (показываем/скрываем меню)
                header.querySelector('.list-menu-btn').onclick = (e) => {
                    e.stopPropagation();
                    menu.style.display = menu.style.display === "block" ? "none" : "block";
                };
                listCol.appendChild(header);

                // Контейнер для карточек
                const cardsCont = document.createElement("div");
                cardsCont.className = "cards-container";
                cardsCont.dataset.listId = list.id;

                // Отрисовываем все карточки из списка
                list.cards.forEach(card => {
                    const cardEl = document.createElement("div");
                    cardEl.className = "card";
                    cardEl.draggable = true;
                    cardEl.dataset.cardId = card.id;
                    cardEl.innerHTML = `
                        <div class="card-title-row">
                            <div class="card-title">${card.title}</div>
                            <button class="card-remove-btn" data-card-id="${card.id}" title="Удалить карточку">
                                <span class="card-remove-x">&#10005;</span>
                            </button>
                        </div>
                        <div class="card-desc">${card.description}</div>
                    `;
                    cardsCont.appendChild(cardEl);
                });

                // Обработчик удаления карточки
                cardsCont.addEventListener("click", function (e) {
                    if (e.target.closest(".card-remove-btn")) {
                        const cardId = e.target.closest(".card-remove-btn").dataset.cardId;
                        fetch(`/api/cards/${cardId}/`, {
                            method: "DELETE",
                            headers: { "Authorization": "Token " + token }
                        }).then(() => {
                            // Удаляем карточку из DOM без перезагрузки
                            const cardEl = cardsCont.querySelector(`[data-card-id='${cardId}']`);
                            if (cardEl) cardEl.remove();
                        });
                    }
                });

                // Блок для добавления новой карточки
                const addCardRow = document.createElement("div");
                addCardRow.className = "add-card-row";
                addCardRow.innerHTML = `
                    <input type="text" class="add-card-title-input" placeholder="Название задачи..." />
                    <textarea class="add-card-desc-input" placeholder="Описание задачи (необязательно)..." rows="2"></textarea>
                `;
                cardsCont.appendChild(addCardRow);

                // Кнопка добавить карточку
                const addCardBtn = document.createElement("button");
                addCardBtn.className = "add-card-btn";
                addCardBtn.textContent = "Добавить карточку";
                addCardBtn.dataset.listId = list.id;
                cardsCont.appendChild(addCardBtn);

                // Обработчик создаёт новую карточку через API и добавляет её в DOM
                addCardBtn.onclick = function () {
                    const cardTitle = addCardRow.querySelector(".add-card-title-input").value.trim();
                    const cardDesc = addCardRow.querySelector(".add-card-desc-input").value.trim();
                    if (!cardTitle) return;
                    fetch("/api/cards/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Token " + token
                        },
                        body: JSON.stringify({ title: cardTitle, description: cardDesc, list: list.id })
                    })
                        .then(res => res.json())
                        .then(card => {
                            // Создаём карточку в DOM
                            const cardEl = document.createElement("div");
                            cardEl.className = "card";
                            cardEl.draggable = true;
                            cardEl.dataset.cardId = card.id;
                            cardEl.innerHTML = `
                                <div class="card-title-row">
                                    <div class="card-title">${card.title}</div>
                                    <button class="card-remove-btn" data-card-id="${card.id}" title="Удалить карточку">
                                    <span class="card-remove-x">&#10005;</span>
                                    </button>
                                </div>
                                <div class="card-desc">${card.description}</div>
                            `;
                            // Вставляем перед полями ввода
                            cardsCont.insertBefore(cardEl, addCardRow);

                            // Очищаем поля ввода
                            addCardRow.querySelector(".add-card-title-input").value = "";
                            addCardRow.querySelector(".add-card-desc-input").value = "";
                        });
                }

                listCol.appendChild(cardsCont);
                listsCont.appendChild(listCol);
            });
    }

    // Получить board и отрисовать её
    if (token && boardId) {
        fetch(`/api/boards/${boardId}/`, {
            headers: { "Authorization": "Token " + token }
        })
            .then(res => res.json())
            .then(board => renderBoard(board));
    }

    // Обработчик добавления нового списка
    addListBtn.onclick = function () {
        const listTitleInput = document.getElementById('new-list-title');
        const listTitle = listTitleInput.value.trim();
        if (!listTitle) return;
        fetch("/api/lists/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Token " + token
            },
            body: JSON.stringify({ title: listTitle, board: boardId })
        })
            .then(() => {
                // После добавления — обновить board
                listTitleInput.value = "";
                fetch(`/api/boards/${boardId}/`, {
                    headers: { "Authorization": "Token " + token }
                })
                    .then(res => res.json())
                    .then(board => renderBoard(board));
            });
    }

    // Делегирование событий для меню списка (редактировать, цвет, удалить)
    listsCont.addEventListener('click', function (e) {
        if (e.target.classList.contains('list-menu-item')) {
            const action = e.target.dataset.action;
            const listId = e.target.dataset.listId;
            if (action === "edit") showEditModal(listId, e.target);
            if (action === "color") showColorModal(listId, e.target);
            if (action === "delete") showDeleteModal(listId, e.target);
        }
    });

    // Drag & drop карточек между списками
    listsCont.addEventListener("dragstart", function (e) {
        if (e.target.classList.contains("card")) {
            e.dataTransfer.setData("cardId", e.target.dataset.cardId);
            e.dataTransfer.setData("fromListId", e.target.closest(".cards-container").dataset.listId);
        }
    });

    listsCont.addEventListener("dragover", function (e) {
        if (e.target.classList.contains("cards-container")) e.preventDefault();
    });

    listsCont.addEventListener("drop", function (e) {
        if (e.target.classList.contains("cards-container")) {
            e.preventDefault();
            const cardId = e.dataTransfer.getData("cardId");
            const toListId = e.target.dataset.listId;
            fetch(`/api/cards/${cardId}/move/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Token " + token
                },
                body: JSON.stringify({ list: toListId })
            }).then(() => {
                const cardElem = document.querySelector(`.card[data-card-id="${cardId}"]`);
                const addCardRow = e.target.querySelector('.add-card-row');
                if (cardElem) {
                    if (addCardRow) {
                        e.target.insertBefore(cardElem, addCardRow);
                    } else {
                        e.target.appendChild(cardElem);
                    }
                }
            });
        }
    });
});

// Глобальный обработчик: скрыть все меню-списки, если клик вне их области
document.body.addEventListener('click', function (e) {
    document.querySelectorAll('.list-menu-dropdown').forEach(m => m.style.display = "none");
});

// Модальные окна для редактирования списка, цвета, удаления
function showEditModal(listId) {
    const listTitle = document.querySelector(`[data-list-id='${listId}'] .list-title`).textContent;
    showModal(`
        <div class="modal-title">Изменить название списка</div>
        <input type="text" id="modal-edit-title" value="${listTitle}" class="modal-input" />
        <div class="modal-actions">
        <button onclick="closeModal()" class="modal-btn">Отмена</button>
        <button onclick="saveListTitle('${listId}')" class="modal-btn primary">Сохранить</button>
        </div>
    `);
}
function saveListTitle(listId) {
    const newTitle = document.getElementById('modal-edit-title').value.trim();
    if (newTitle) {
        fetch(`/api/lists/${listId}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": "Token " + localStorage.getItem("authToken") },
            body: JSON.stringify({ title: newTitle })
        })
            .then(res => res.json())
            .then(updatedList => {
                // Обновить название в DOM без перезагрузки:
                document.querySelector(`[data-list-id="${listId}"] .list-title`).textContent = updatedList.title;
                closeModal();
            });
    }
}
function showColorModal(listId) {
    showModal(`
        <div class="modal-title">Выберите цвет для списка</div>
        <div class="modal-color-row">
        <div class="color-square red" onclick="setListColor('${listId}', 'red')"></div>
        <div class="color-square yellow" onclick="setListColor('${listId}', 'yellow')"></div>
        <div class="color-square green" onclick="setListColor('${listId}', 'green')"></div>
        </div>
        <button onclick="closeModal()" class="modal-btn">Отмена</button>
    `);
}
function setListColor(listId, color) {
    fetch(`/api/lists/${listId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": "Token " + localStorage.getItem("authToken") },
        body: JSON.stringify({ color: color })
    })
        .then(res => res.json())
        .then(updatedList => {
            // Меняем цвет только у нужного списка без reload:
            const listCol = document.querySelector(`[data-list-id='${listId}']`);
            if (listCol) {
                if (updatedList.color === "red") listCol.style.background = "#ffe0e0";
                else if (updatedList.color === "yellow") listCol.style.background = "#fffacc";
                else if (updatedList.color === "green") listCol.style.background = "#e6fbd9";
                else listCol.style.background = "";
            }
            closeModal();
        });
}
function showDeleteModal(listId) {
    showModal(`
        <div class="modal-title">Вы уверены что хотите удалить список?</div>
        <div class="modal-actions">
        <button onclick="closeModal()" class="modal-btn">Нет</button>
        <button onclick="deleteList('${listId}')" class="modal-btn danger">Да</button>
        </div>
    `);
}
function deleteList(listId) {
    fetch(`/api/lists/${listId}/`, {
        method: "DELETE",
        headers: { "Authorization": "Token " + localStorage.getItem("authToken") }
    }).then(() => {
        // Удалить столбец только в DOM:
        const listEl = document.querySelector(`[data-list-id='${listId}']`);
        if (listEl) listEl.remove();
        closeModal();
    });
}
function showModal(html) {
    document.getElementById('modal-window').innerHTML = html;
    document.getElementById('modal-overlay').style.display = "flex";
}
function closeModal() {
    document.getElementById('modal-overlay').style.display = "none";
}