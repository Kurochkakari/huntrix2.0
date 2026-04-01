// Huntrix Auth & Cart System
// Общий JavaScript для работы с авторизацией, корзиной и избранным на всех страницах

const AUTH_API = 'session.php';
const CART_API = 'api.php';

let currentUser = null;
let userChecked = false;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuthStatus();
    updateAuthUI();
    loadCartCount();
    loadWishlistCount();
});

// Проверка статуса авторизации
async function checkAuthStatus() {
    try {
        const response = await fetch(`${AUTH_API}?action=check_session`);
        const data = await response.json();
        
        if (data.success && data.logged_in) {
            currentUser = data.user;
            localStorage.setItem('user_id', currentUser.id);
            localStorage.setItem('user_name', currentUser.name);
            localStorage.setItem('user_email', currentUser.email);
        } else {
            currentUser = null;
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_name');
            localStorage.removeItem('user_email');
        }
        userChecked = true;
    } catch (error) {
        console.error('Ошибка проверки сессии:', error);
        currentUser = null;
        userChecked = true;
    }
    return currentUser;
}

// Получение ID текущего пользователя
function getUserId() {
    if (currentUser) {
        return currentUser.id;
    }
    const storedId = localStorage.getItem('user_id');
    return storedId ? parseInt(storedId) : null;
}

// Проверка авторизации
function isLoggedIn() {
    return currentUser !== null || localStorage.getItem('user_id') !== null;
}

// Обновление UI на основе статуса авторизации
function updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    if (!authBtn) return;

    if (isLoggedIn()) {
        authBtn.textContent = currentUser ? currentUser.name : (localStorage.getItem('user_name') || 'Профиль');
        authBtn.onclick = showProfileModal;
    } else {
        authBtn.textContent = 'Войти / Регистрация';
        authBtn.onclick = showAuthModal;
    }
}

// Показать модальное окно авторизации
function showAuthModal() {
    let modal = document.getElementById('auth-modal');
    if (!modal) {
        modal = createAuthModal();
        document.body.appendChild(modal);
    }
    modal.classList.add('active');
    document.getElementById('auth-overlay')?.classList.add('active');
}

// Создание модального окна авторизации
function createAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="auth-modal">
            <div class="auth-modal-header">
                <button class="tab-btn active" data-tab="login">Вход</button>
                <button class="tab-btn" data-tab="register">Регистрация</button>
                <button class="close-auth-modal" onclick="closeAuthModal()">&times;</button>
            </div>
            <div class="auth-modal-body">
                <div id="login-form">
                    <input type="email" id="login-email" placeholder="Email" required>
                    <input type="password" id="login-password" placeholder="Пароль" required>
                    <button onclick="handleLogin()">Войти</button>
                    <p class="auth-error" id="login-error" style="color: red; display: none; margin-top: 10px;"></p>
                </div>
                <div id="register-form" style="display: none;">
                    <input type="text" id="register-name" placeholder="Имя" required>
                    <input type="email" id="register-email" placeholder="Email" required>
                    <input type="password" id="register-password" placeholder="Пароль" required>
                    <button onclick="handleRegister()">Зарегистрироваться</button>
                    <p class="auth-error" id="register-error" style="color: red; display: none; margin-top: 10px;"></p>
                </div>
            </div>
        </div>
    `;

    // Обработчики табов
    modal.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
            document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
            
            document.getElementById('login-error').style.display = 'none';
            document.getElementById('register-error').style.display = 'none';
        });
    });

    // Закрытие по клику на оверлей
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeAuthModal();
        }
    });

    return modal;
}

// Закрытие модального окна авторизации
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    const overlay = document.getElementById('auth-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Обработка входа
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    if (!email || !password) {
        errorEl.textContent = 'Заполните все поля';
        errorEl.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${AUTH_API}?action=login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('user_id', currentUser.id);
            localStorage.setItem('user_name', currentUser.name);
            localStorage.setItem('user_email', currentUser.email);
            
            closeAuthModal();
            updateAuthUI();
            loadCartCount();
            loadWishlistCount();
            
            // Синхронизация локальной корзины с БД
            await syncLocalCartToDb();
            await syncLocalWishlistToDb();
        } else {
            errorEl.textContent = data.error;
            errorEl.style.display = 'block';
        }
    } catch (error) {
        errorEl.textContent = 'Ошибка соединения';
        errorEl.style.display = 'block';
    }
}

// Обработка регистрации
async function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorEl = document.getElementById('register-error');

    if (!name || !email || !password) {
        errorEl.textContent = 'Заполните все поля';
        errorEl.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${AUTH_API}?action=register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('user_id', currentUser.id);
            localStorage.setItem('user_name', currentUser.name);
            localStorage.setItem('user_email', currentUser.email);
            
            closeAuthModal();
            updateAuthUI();
            
            // Синхронизация корзины и избранного
            await syncLocalCartToDb();
            await syncLocalWishlistToDb();
        } else {
            errorEl.textContent = data.error;
            errorEl.style.display = 'block';
        }
    } catch (error) {
        errorEl.textContent = 'Ошибка соединения';
        errorEl.style.display = 'block';
    }
}

// Выход из аккаунта
async function handleLogout() {
    try {
        await fetch(`${AUTH_API}?action=logout`);
    } catch (e) {}
    
    currentUser = null;
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    
    updateAuthUI();
    
    // Перезагрузка страницы для сброса состояния
    window.location.reload();
}

// Показать профиль пользователя
function showProfileModal() {
    let modal = document.getElementById('profile-modal');
    if (!modal) {
        modal = createProfileModal();
        document.body.appendChild(modal);
    }
    modal.classList.add('active');
    document.getElementById('profile-overlay')?.classList.add('active');
    
    // Заполнить данные профиля
    document.getElementById('profile-name').value = currentUser ? currentUser.name : localStorage.getItem('user_name') || '';
    document.getElementById('profile-email').value = currentUser ? currentUser.email : localStorage.getItem('user_email') || '';
}

// Создание модального окна профиля
function createProfileModal() {
    const modal = document.createElement('div');
    modal.id = 'profile-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="auth-modal" style="max-width: 450px;">
            <div class="auth-modal-header">
                <span class="modal-title">Личный кабинет</span>
                <button class="close-auth-modal" onclick="closeProfileModal()">&times;</button>
            </div>
            <div class="auth-modal-body">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Имя</label>
                    <input type="text" id="profile-name" placeholder="Ваше имя">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Email</label>
                    <input type="email" id="profile-email" placeholder="Ваш email">
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Новый пароль (оставьте пустым)</label>
                    <input type="password" id="profile-password" placeholder="Новый пароль">
                </div>
                <button onclick="updateProfile()" style="width: 100%; padding: 12px; background: var(--accent-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">Сохранить изменения</button>
                <button onclick="handleLogout()" style="width: 100%; padding: 12px; background: #d32f2f; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-top: 10px;">Выйти из аккаунта</button>
                <p id="profile-message" style="margin-top: 10px; text-align: center;"></p>
            </div>
        </div>
    `;

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProfileModal();
        }
    });

    return modal;
}

function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function updateProfile() {
    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;
    const password = document.getElementById('profile-password').value;
    const msgEl = document.getElementById('profile-message');

    try {
        const response = await fetch(`${AUTH_API}?action=update_profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('user_name', currentUser.name);
            localStorage.setItem('user_email', currentUser.email);
            updateAuthUI();
            msgEl.textContent = 'Изменения сохранены!';
            msgEl.style.color = 'green';
        } else {
            msgEl.textContent = data.error;
            msgEl.style.color = 'red';
        }
    } catch (error) {
        msgEl.textContent = 'Ошибка соединения';
        msgEl.style.color = 'red';
    }
}

// === РАБОТА С КОРЗИНОЙ ===

// Загрузка количества товаров в корзине
async function loadCartCount() {
    const userId = getUserId();
    const countEl = document.getElementById('cart-count');
    if (!countEl) return;

    if (userId) {
        try {
            const response = await fetch(`${CART_API}?action=get_cart&user_id=${userId}`);
            const data = await response.json();
            if (data.success) {
                countEl.textContent = data.items.length;
            }
        } catch (e) {
            // Используем локальную корзину
            loadLocalCartCount();
        }
    } else {
        loadLocalCartCount();
    }
}

function loadLocalCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        countEl.textContent = cart.length;
    }
}

// Добавление в корзину
async function addToCart(product) {
    const userId = getUserId();
    
    if (userId) {
        // Авторизованный пользователь - добавляем в БД
        try {
            const response = await fetch(`${CART_API}?action=add_to_cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    product_type: product.product_type || 'album',
                    album_id: product.album_id || product.id,
                    version_id: product.version_id || null,
                    quantity: product.quantity || 1,
                    unit_price: product.price || product.unit_price || 0
                })
            });
            const data = await response.json();
            if (data.success) {
                loadCartCount();
                return { success: true, message: 'Добавлено в корзину!' };
            } else {
                return { success: false, message: data.error };
            }
        } catch (e) {
            // Резервное добавление в localStorage
            return addToLocalCart(product);
        }
    } else {
        // Не авторизован - добавляем в localStorage
        return addToLocalCart(product);
    }
}

function addToLocalCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const existingIndex = cart.findIndex(item => 
        item.id === product.id && item.version_id === product.version_id
    );
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + (product.quantity || 1);
    } else {
        cart.push({
            id: product.id,
            album_id: product.album_id,
            version_id: product.version_id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: product.quantity || 1,
            product_type: product.product_type || 'album'
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartCount();
    
    return { success: true, message: 'Добавлено в корзину!' };
}

// Синхронизация локальной корзины с БД
async function syncLocalCartToDb() {
    const userId = getUserId();
    if (!userId) return;

    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (localCart.length === 0) return;

    for (const item of localCart) {
        try {
            await fetch(`${CART_API}?action=add_to_cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    product_type: item.product_type || 'album',
                    album_id: item.album_id || item.id,
                    version_id: item.version_id || null,
                    quantity: item.quantity || 1,
                    unit_price: item.price || 0
                })
            });
        } catch (e) {}
    }

    // Очистить локальную корзину после синхронизации
    localStorage.removeItem('cart');
    loadCartCount();
}

// Получение корзины
async function getCart() {
    const userId = getUserId();
    
    if (userId) {
        try {
            const response = await fetch(`${CART_API}?action=get_cart&user_id=${userId}`);
            const data = await response.json();
            return data.success ? data.items : [];
        } catch (e) {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        }
    } else {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    }
}

// Удаление из корзины
async function removeFromCart(cartItemId) {
    const userId = getUserId();
    
    if (userId) {
        try {
            await fetch(`${CART_API}?action=remove_from_cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_item_id: cartItemId })
            });
            loadCartCount();
        } catch (e) {}
    } else {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(item => item.id !== cartItemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartCount();
    }
}

// Очистка корзины
async function clearCart() {
    const userId = getUserId();
    
    if (userId) {
        try {
            await fetch(`${CART_API}?action=clear_cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });
        } catch (e) {}
    }
    localStorage.removeItem('cart');
    loadCartCount();
}

// === РАБОТА С ИЗБРАННЫМ ===

// Загрузка количества в избранном
async function loadWishlistCount() {
    const userId = getUserId();
    const countEl = document.getElementById('favorites-count');
    if (!countEl) return;

    if (userId) {
        try {
            const response = await fetch(`${CART_API}?action=get_wishlist&user_id=${userId}`);
            const data = await response.json();
            if (data.success) {
                countEl.textContent = data.items.length;
            }
        } catch (e) {
            loadLocalWishlistCount();
        }
    } else {
        loadLocalWishlistCount();
    }
}

function loadLocalWishlistCount() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const countEl = document.getElementById('favorites-count');
    if (countEl) {
        countEl.textContent = wishlist.length;
    }
}

// Добавление в избранное
async function addToWishlist(product) {
    const userId = getUserId();
    
    if (!userId) {
        // Не авторизован - добавляем в localStorage
        return addToLocalWishlist(product);
    }

    try {
        const response = await fetch(`${CART_API}?action=add_to_wishlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                album_id: product.album_id || product.id,
                unit_price: product.price || 0
            })
        });
        const data = await response.json();
        if (data.success) {
            loadWishlistCount();
            return { success: true, message: 'Добавлено в избранное!' };
        } else {
            return { success: false, message: data.error };
        }
    } catch (e) {
        return addToLocalWishlist(product);
    }
}

function addToLocalWishlist(product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (!wishlist.some(item => item.id === (product.album_id || product.id))) {
        wishlist.push({
            id: product.album_id || product.id,
            name: product.name,
            price: product.price,
            image: product.image
        });
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        loadWishlistCount();
    }
    
    return { success: true, message: 'Добавлено в избранное!' };
}

// Синхронизация локального избранного с БД
async function syncLocalWishlistToDb() {
    const userId = getUserId();
    if (!userId) return;

    const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (localWishlist.length === 0) return;

    for (const item of localWishlist) {
        try {
            await fetch(`${CART_API}?action=add_to_wishlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    album_id: item.id,
                    unit_price: item.price || 0
                })
            });
        } catch (e) {}
    }

    localStorage.removeItem('wishlist');
    loadWishlistCount();
}

// Получение избранного
async function getWishlist() {
    const userId = getUserId();
    
    if (userId) {
        try {
            const response = await fetch(`${CART_API}?action=get_wishlist&user_id=${userId}`);
            const data = await response.json();
            return data.success ? data.items : [];
        } catch (e) {
            return JSON.parse(localStorage.getItem('wishlist') || '[]');
        }
    } else {
        return JSON.parse(localStorage.getItem('wishlist') || '[]');
    }
}

// Удаление из избранного
async function removeFromWishlist(wishlistItemId) {
    const userId = getUserId();
    
    if (userId) {
        try {
            await fetch(`${CART_API}?action=remove_from_wishlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wishlist_item_id: wishlistItemId })
            });
            loadWishlistCount();
        } catch (e) {}
    } else {
        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        wishlist = wishlist.filter(item => item.id !== wishlistItemId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        loadWishlistCount();
    }
}

// === РАБОТА С ЗАКАЗАМИ ===

// Оформление заказа
async function saveOrder(orderData) {
    const userId = getUserId();
    
    if (!userId) {
        return { success: false, message: 'Для оформления заказа необходимо войти в аккаунт' };
    }

    try {
        const response = await fetch(`${CART_API}?action=save_order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                items: orderData.items,
                total: orderData.total,
                shipping_address: orderData.shipping_address
            })
        });
        const data = await response.json();
        
        if (data.success) {
            // Очистить корзину после успешного заказа
            await clearCart();
            return { success: true, order_id: data.order_id };
        } else {
            return { success: false, message: data.error };
        }
    } catch (e) {
        return { success: false, message: 'Ошибка оформления заказа' };
    }
}

// === РАБОТА С ТЕСТАМИ ===

// Сохранение результата теста
async function saveTestResult(testData) {
    const userId = getUserId();
    
    if (!userId) {
        return { success: false, message: 'Для сохранения результата необходимо войти в аккаунт' };
    }

    try {
        const response = await fetch(`${CART_API}?action=save_test_result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                test_id: testData.test_id,
                member_id: testData.member_id,
                result_details: testData.result_details
            })
        });
        const data = await response.json();
        
        if (data.success) {
            return { success: true, result_id: data.id };
        } else {
            return { success: false, message: data.error };
        }
    } catch (e) {
        return { success: false, message: 'Ошибка сохранения результата' };
    }
}

// Сделать функции глобальными
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.closeAuthModal = closeAuthModal;
window.showAuthModal = showAuthModal;
window.closeProfileModal = closeProfileModal;
window.updateProfile = updateProfile;
window.addToCart = addToCart;
window.addToWishlist = addToWishlist;
window.removeFromCart = removeFromCart;
window.removeFromWishlist = removeFromWishlist;
window.clearCart = clearCart;
window.getCart = getCart;
window.getWishlist = getWishlist;
window.saveOrder = saveOrder;
window.saveTestResult = saveTestResult;
window.getUserId = getUserId;
window.isLoggedIn = isLoggedIn;
window.checkAuthStatus = checkAuthStatus;
