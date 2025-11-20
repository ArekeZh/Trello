// Вспомогательная функция форматирования даты для досок
function formatDate(datetime) {
    const d = new Date(datetime);
    return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU').slice(0, 5);
}

// id доски, которую нужно удалить (для модального окна)
let boardToDelete = null;

// Глобальная функция для открытия модального окна удаления доски
window.deleteBoard = function (boardId) {
    boardToDelete = boardId;
    document.getElementById("delete-modal").style.display = "flex";
};

document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("boards-grid"); // Контейнер для карточек досок
    const createBtn = document.getElementById("create-board-btn"); // Кнопка создания доски
    const token = localStorage.getItem("authToken"); // Токен для API (если авторизован)

    // Рендер списка досок
    function renderBoards(boards) {
        grid.innerHTML = "";
        if (boards.length) {
            boards.forEach(board => {
                // Создаём DOM-элемент для каждой доски
                const card = document.createElement("div");
                card.className = "board-card";
                card.dataset.boardId = board.id;
                card.innerHTML = `
                    <div class="board-card-header">
                        <span class="board-title">${board.title}</span>
                    </div>
                    <div class="board-card-description">${board.description ? board.description : ""}</div>
                    <div class="mini-divider"></div>
                    <div class="board-card-footer">
                        <span class="board-date">Создана: ${formatDate(board.created_at)}</span>
                        <div class="board-actions">
                            <button class="board-action-btn" onclick="event.stopPropagation(); renameBoard('${board.id}','${board.title.replace(/'/g, "\\'")}',\`${(board.description || "").replace(/`/g, "\\`")}\`)">✏️</button>
                            <button class="board-action-btn delete" onclick="event.stopPropagation(); deleteBoard('${board.id}')">🗑️</button>
                        </div>
                    </div>
                `;
                // Переход на страницу доски по клику на карточку
                card.onclick = (e) => {
                    if (!e.target.classList.contains('board-action-btn')) {
                        window.location.href = `/board/${board.id}/`;
                    }
                };
                grid.appendChild(card);
            });
        } else {
            // Нет досок
            grid.innerHTML = '<div class="no-boards-message">У вас еще нет досок.</div>';
        }
    }

    // Сообщение для гостя (если не авторизован)
    function renderGuest() {
        grid.innerHTML = '<div class="no-boards-message">Войдите для просмотра досок.</div>';
        createBtn.style.display = "none";
    }

    // Обработчик удаления доски
    document.getElementById("confirm-delete-btn").onclick = function () {
        if (!boardToDelete) return;
        fetch(`/api/boards/${boardToDelete}/`, {
            method: "DELETE",
            headers: { "Authorization": "Token " + token }
        }).then(() => {
            // Убираем карточку доски из DOM:
            const el = document.querySelector(`[data-board-id='${boardToDelete}']`);
            if (el) el.remove();
            document.getElementById("delete-modal").style.display = "none";
            boardToDelete = null;
            // Если все доски удалены, показать сообщение
            if (!document.querySelector('.board-card')) {
                grid.innerHTML = '<div class="no-boards-message">У вас еще нет досок.</div>';
            }
        });
    };

    // Отмена удаления доски
    document.getElementById("cancel-delete-btn").onclick = function () {
        document.getElementById("delete-modal").style.display = "none";
        boardToDelete = null;
    };

    // id редактируемой доски (модальное окно)
    let boardToEditId = null;

    // Глобальная функция для открытия редактирования доски
    window.renameBoard = function (boardId, oldTitle, oldDesc = "") {
        boardToEditId = boardId;
        document.getElementById("edit-board-title-input").value = oldTitle || "";
        document.getElementById("edit-board-desc-input").value = oldDesc || "";
        document.getElementById("edit-modal").style.display = "flex";
        document.getElementById("edit-board-title-input").focus();
    };

    // Получить доски по API и отрисовать их
    if (token) {
        fetch("/api/boards/", {
            headers: { "Authorization": "Token " + token }
        })
            .then(res => res.json())
            .then(data => {
                createBtn.style.display = "inline-block";
                renderBoards(data);
            })
            .catch(() => renderGuest());
    } else {
        renderGuest();
    }

    // Открытие окна создания доски
    createBtn.onclick = function () {
        document.getElementById("create-modal").style.display = "flex";
        document.getElementById("board-title-input").value = "";
        document.getElementById("board-desc-input").value = "";
        document.getElementById("board-title-input").focus();
    };

    // Закрытие окна создания доски (по X или кнопке "Отмена")
    function closeCreateModal() {
        document.getElementById("create-modal").style.display = "none";
    }
    document.getElementById("close-create-modal").onclick = closeCreateModal;
    document.getElementById("cancel-create-btn").onclick = closeCreateModal;

    // Закрытие окна удаления доски (по X)
    document.getElementById("close-delete-modal").onclick = function () {
        document.getElementById("delete-modal").style.display = "none";
        boardToDelete = null;
    };

    // Сабмит формы создания доски
    document.querySelector(".create-board-form").onsubmit = function () {
        const boardTitle = document.getElementById("board-title-input").value.trim();
        const boardDesc = document.getElementById("board-desc-input").value.trim();
        if (!boardTitle) {
            document.getElementById("board-title-input").focus();
            return false;
        }
        fetch("/api/boards/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Token " + token
            },
            body: JSON.stringify({ title: boardTitle, description: boardDesc })
        })
            .then(res => res.json())
            .then(board => {
                closeCreateModal();
                // Добавляем новый board в DOM, плюс уже существующие
                renderBoards([board, ...Array.from(document.querySelectorAll('.board-card')).map(cardEl => ({
                    id: cardEl.dataset.boardId,
                    title: cardEl.querySelector('.board-title').textContent,
                    description: cardEl.querySelector('.board-card-description').textContent,
                    created_at: cardEl.querySelector('.board-date')?.textContent?.replace('Создана: ', '') || ''
                }))]);
            });
        return false;
    };

    // Закрытие окна редактирования доски (по X или "Отмена")
    function closeEditModal() {
        document.getElementById("edit-modal").style.display = "none";
        boardToEditId = null;
    }
    document.getElementById("close-edit-modal").onclick = closeEditModal;
    document.getElementById("cancel-edit-btn").onclick = closeEditModal;

    // Сабмит формы редактирования доски
    document.querySelector(".edit-board-form").onsubmit = function () {
        const newTitle = document.getElementById("edit-board-title-input").value.trim();
        const newDesc = document.getElementById("edit-board-desc-input").value.trim();
        if (!newTitle) {
            document.getElementById("edit-board-title-input").focus();
            return false;
        }
        fetch(`/api/boards/${boardToEditId}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Token " + token
            },
            body: JSON.stringify({ title: newTitle, description: newDesc })
        })
            .then(res => res.json())
            .then(updatedBoard => {
                closeEditModal();
                // Меняем данные прям в DOM (без reload)
                const card = document.querySelector(`[data-board-id='${updatedBoard.id}']`);
                if (card) {
                    card.querySelector('.board-title').textContent = updatedBoard.title;
                    card.querySelector('.board-card-description').textContent = updatedBoard.description || "";
                }
            });
        return false;
    };
});
