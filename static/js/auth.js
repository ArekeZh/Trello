// Открыть модальное окно авторизации с выбранной вкладкой ("login" или "register")
function openAuthModal(tab = "login") {
    document.getElementById("authModal").style.display = "flex";
    switchAuthTab(tab);
}
window.openAuthModal = openAuthModal; // Экспортируем в глобальную область видимости

// Закрыть модальное окно авторизации
function closeAuthModal() {
    document.getElementById("authModal").style.display = "none";
}
window.closeAuthModal = closeAuthModal;

// Переключить вкладки в модальном окне между входом и регистрацией
function switchAuthTab(tab) {
    // Сбросить выделение и скрыть обе формы
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
    // Активировать нужную вкладку и показать соответствующую форму
    if (tab === "register") {
        document.querySelector('.auth-tab:nth-child(2)').classList.add('active');
        document.getElementById('registerForm').classList.remove('hidden');
    } else {
        document.querySelector('.auth-tab:nth-child(1)').classList.add('active');
        document.getElementById('loginForm').classList.remove('hidden');
    }
}
window.switchAuthTab = switchAuthTab;

// Обработка логина через AJAX
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    const btn = document.getElementById('login-submit-btn');
    const spinner = document.getElementById('login-spinner');
    // Сброс сообщений об ошибках
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    spinner.style.display = 'inline-block';
    btn.disabled = true;

    // Отправляем AJAX-запрос на login endpoint
    fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json())
        .then(data => {
            spinner.style.display = 'none';
            btn.disabled = false;
            if (data.token) {
                // Успешно: сохранить токен, закрыть модалку, перезагрузить страницу
                localStorage.setItem('authToken', data.token);
                closeAuthModal();
                window.location.reload();
            } else {
                // Ошибка входа
                errorDiv.textContent = data.detail || 'Неправильный email или пароль';
                errorDiv.style.display = 'block';
            }
        })
        .catch(() => {
            spinner.style.display = 'none';
            btn.disabled = false;
            errorDiv.textContent = 'Ошибка авторизации';
            errorDiv.style.display = 'block';
        });
}

// Обработка регистрации через AJAX + простая email/пароль валидация
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const password2 = document.getElementById('register-password2').value;
    const errorDiv = document.getElementById('register-error');
    const btn = document.getElementById('register-submit-btn');
    const spinner = document.getElementById('register-spinner');
    // Сброс ошибок
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Валидация email и паролей до отправки запроса
    if (!email.includes('@')) {
        errorDiv.textContent = 'Email должен содержать символ @';
        errorDiv.style.display = 'block';
        document.getElementById('register-email').focus();
        return false;
    }
    if (password !== password2) {
        errorDiv.textContent = 'Пароли должны совпадать';
        errorDiv.style.display = 'block';
        document.getElementById('register-password2').focus();
        return false;
    }

    spinner.style.display = 'inline-block';
    btn.disabled = true;

    // Отправляем AJAX-запрос на регистрацию
    fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password })
    })
        .then(res => res.json())
        .then(data => {
            spinner.style.display = 'none';
            btn.disabled = false;
            if (data.token) {
                // Успешно: сохранить токен, закрыть модалку, перезагрузить страницу
                localStorage.setItem('authToken', data.token);
                closeAuthModal();
                window.location.reload();
            } else {
                // Ошибка регистрации
                errorDiv.textContent = data.detail || 'Ошибка регистрации.';
                errorDiv.style.display = 'block';
            }
        })
        .catch(() => {
            spinner.style.display = 'none';
            btn.disabled = false;
            errorDiv.textContent = 'Ошибка регистрации';
            errorDiv.style.display = 'block';
        });
}
