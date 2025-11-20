document.addEventListener("DOMContentLoaded", function () {
  // --- Drag & drop карточек ---
  document.querySelectorAll(".card").forEach(card => {
    card.draggable = true; // Разрешаем перетаскивание карточки
    card.addEventListener("dragstart", function (e) {
      // Сохраняем id карточки и изначального списка
      e.dataTransfer.setData("cardId", card.dataset.cardId);
      e.dataTransfer.setData("fromListId", card.closest(".cards-container").dataset.listId);
    });
  });

  // Перетаскивание карточки в новый список
  document.querySelectorAll(".cards-container").forEach(container => {
    // Разрешаем бросание карточки внутрь списка (dragover)
    container.addEventListener("dragover", function (e) {
      e.preventDefault();
      container.classList.add("dragover"); // Визуальное выделение зоны дропа
    });

    // Убираем выделение при выходе
    container.addEventListener("dragleave", function (e) {
      container.classList.remove("dragover");
    });

    // Drop - переносим карточку и делаем PATCH-запрос к API
    container.addEventListener("drop", function (e) {
      e.preventDefault();
      container.classList.remove("dragover");
      const cardId = e.dataTransfer.getData("cardId");
      const fromListId = e.dataTransfer.getData("fromListId");
      const toListId = container.dataset.listId;
      const token = localStorage.getItem("authToken");
      if (fromListId !== toListId) {
        fetch(`/api/cards/${cardId}/move/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Token " + token
          },
          body: JSON.stringify({ list: toListId })
        }).then(() => {
          // Вставляем карточку в новый список на фронте
          const cardElem = document.querySelector(`.card[data-card-id="${cardId}"]`);
          if (cardElem) {
            container.appendChild(cardElem);
          }
        });
      }
    });
  });

  // --- Drag & drop списков (колонок) ---
  document.querySelectorAll(".list-column").forEach(listColumn => {
    listColumn.draggable = true; // Разрешаем перетаскивание списка
    listColumn.addEventListener("dragstart", function (e) {
      // Сохраняем id списка
      e.dataTransfer.setData("listId", listColumn.dataset.listId);
    });
  });

  // Drag/drop для перемещения самой колонки (списка) внутри всех списков
  document.querySelectorAll(".lists-container").forEach(listsCont => {
    listsCont.addEventListener("dragover", function (e) {
      e.preventDefault();
    });
    listsCont.addEventListener("drop", function (e) {
      e.preventDefault();
      const listId = e.dataTransfer.getData("listId");
      const token = localStorage.getItem("authToken");
      fetch(`/api/lists/${listId}/reorder/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Token " + token
        },
        body: JSON.stringify({ order: 0 }) // Пример: тут должен быть нужный порядок
      }).then(() => {
        // На фронте перемещаем списковую колонку
        const listElem = document.querySelector(`.list-column[data-list-id="${listId}"]`);
        if (listElem) {
          e.currentTarget.appendChild(listElem);
        }
      });
    });
  });
});
