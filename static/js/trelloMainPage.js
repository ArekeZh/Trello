document.addEventListener('DOMContentLoaded', function () {
  const userBtn = document.getElementById('user-btn'); // Кнопка пользователя в navbar
  const userMenu = document.getElementById('user-menu'); // Выпадающее меню пользователя
  let user = null; // Текущий пользователь (будет получен с API)

  // Проверить, авторизован ли пользователь
  function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setGuest(); // Нет токена — режим Гостя
      return;
    }
    // Получаем данные пользователя по токену
    fetch('/api/auth/me/', {
      method: 'GET',
      headers: { 'Authorization': `Token ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        user = data;
        // Обновляем меню (отображаем имя, выход)
        setUser(data.username || data.user?.username || "Пользователь");
      })
      .catch(() => setGuest());
  }

  // Установить гость-режим (нет пользователя)
  function setGuest() {
    userBtn.textContent = 'Гость';
    if (userMenu) {
      userMenu.innerHTML = `
            <button onclick="openAuthModal('login')" class="dropdown-item">Войти</button>
            <button onclick="openAuthModal('register')" class="dropdown-item">Зарегистрироваться</button>
        `;
    }
  }

  // Обновить меню и кнопку для авторизованного пользователя
  function setUser(username) {
    userBtn.textContent = username;
    if (userMenu) {
      userMenu.innerHTML = '';
      const logout = document.createElement('button');
      logout.textContent = 'Выйти';
      logout.className = 'dropdown-item';
      logout.onclick = function () {
        localStorage.removeItem('authToken');
        window.location.replace('/');
      };
      userMenu.appendChild(logout);
    }
  }

  // Открывать/закрывать меню пользователя по клику
  userBtn.addEventListener('click', function () {
    userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
  });
  // Скрывать меню, если клик вне user-menu и user-btn
  document.body.addEventListener('click', function (e) {
    if (!userBtn.contains(e.target) && !userMenu.contains(e.target)) {
      userMenu.style.display = 'none';
    }
  }, true);

  checkAuth(); // Проверяем авторизацию при загрузке страницы
});
