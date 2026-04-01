<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$host = getenv('DB_HOST') ?: '127.0.0.1';
$db = getenv('DB_NAME') ?: 'huntrixhost';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '12345678';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Ошибка подключения к базе данных']);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'register':
        registerUser($pdo);
        break;
    case 'login':
        loginUser($pdo);
        break;
    case 'save_test_result':
        saveTestResult($pdo);
        break;
    case 'save_order':
        saveOrder($pdo);
        break;
    case 'add_to_cart':
        addToCart($pdo);
        break;
    case 'get_cart':
        getCart($pdo);
        break;
    case 'remove_from_cart':
        removeFromCart($pdo);
        break;
    case 'clear_cart':
        clearCart($pdo);
        break;
    case 'add_to_wishlist':
        addToWishlist($pdo);
        break;
    case 'get_wishlist':
        getWishlist($pdo);
        break;
    case 'remove_from_wishlist':
        removeFromWishlist($pdo);
        break;
    default:
        echo json_encode(['success' => false, 'error' => 'Неизвестное действие']);
}

function registerUser($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
        echo json_encode(['success' => false, 'error' => 'Недостаточно данных']);
        return;
    }

    $username = trim($data['name']);
    $email = trim($data['email']);
    $password = $data['password'];

    if (strlen($username) < 2) {
        echo json_encode(['success' => false, 'error' => 'Имя должно содержать минимум 2 символа']);
        return;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'error' => 'Введите корректный email']);
        return;
    }

    if (strlen($password) < 6) {
        echo json_encode(['success' => false, 'error' => 'Пароль должен содержать минимум 6 символов']);
        return;
    }

    $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Пользователь с таким email уже существует']);
        return;
    }

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $registrationDate = date('Y-m-d H:i:s');

    $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, registration_date) VALUES (?, ?, ?, ?)");
    
    if ($stmt->execute([$username, $email, $passwordHash, $registrationDate])) {
        $userId = $pdo->lastInsertId();
        
        session_start();
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_name'] = $username;
        
        echo json_encode([
            'success' => true, 
            'user' => [
                'id' => $userId,
                'name' => $username,
                'email' => $email,
                'registrationDate' => $registrationDate
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка при регистрации']);
    }
}

function loginUser($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['email']) || !isset($data['password'])) {
        echo json_encode(['success' => false, 'error' => 'Недостаточно данных']);
        return;
    }

    $email = trim($data['email']);
    $password = $data['password'];

    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password_hash'])) {
        echo json_encode(['success' => false, 'error' => 'Неверный email или пароль']);
        return;
    }

    session_start();
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['username'];

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['user_id'],
            'name' => $user['username'],
            'email' => $user['email'],
            'registrationDate' => $user['registration_date']
        ]
    ]);
}

function saveTestResult($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['user_id']) || !isset($data['test_id']) || !isset($data['member_id'])) {
        echo json_encode(['success' => false, 'error' => 'Недостаточно данных']);
        return;
    }

    $userId = $data['user_id'];
    $testId = $data['test_id'];
    $memberId = $data['member_id'];
    $resultDetails = isset($data['result_details']) ? json_encode($data['result_details']) : null;
    $resultDate = date('Y-m-d H:i:s');

    $stmt = $pdo->prepare("INSERT INTO test_results (user_id, test_id, member_id, result_date, result_details) VALUES (?, ?, ?, ?, ?)");
    
    if ($stmt->execute([$userId, $testId, $memberId, $resultDate, $resultDetails])) {
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка при сохранении результата']);
    }
}

function saveOrder($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['user_id']) || !isset($data['items']) || !isset($data['total'])) {
        echo json_encode(['success' => false, 'error' => 'Недостаточно данных']);
        return;
    }

    $userId = $data['user_id'];
    $totalAmount = $data['total'];
    $shippingAddress = $data['shipping_address'] ?? null;
    $status = 'pending';
    $orderDate = date('Y-m-d H:i:s');

    $pdo->beginTransaction();
    
    try {
        $stmt = $pdo->prepare("INSERT INTO orders (user_id, order_date, total_amount, status, shipping_address) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$userId, $orderDate, $totalAmount, $status, $shippingAddress]);
        $orderId = $pdo->lastInsertId();
        
        foreach ($data['items'] as $item) {
            $productType = $item['product_type'] ?? 'album';
            $versionId = ($productType === 'album_version') ? ($item['version_id'] ?? null) : null;
            $albumId = ($productType === 'album') ? ($item['album_id'] ?? $item['id'] ?? null) : null;
            $quantity = $item['quantity'] ?? 1;
            $unitPrice = $item['unit_price'] ?? $item['price'] ?? 0;
            
            $stmt = $pdo->prepare("INSERT INTO order_items (order_id, version_id, quantity, unit_price, album_id, product_type) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$orderId, $versionId, $quantity, $unitPrice, $albumId, $productType]);
        }
        
        $stmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ?");
        $stmt->execute([$userId]);
        
        $pdo->commit();
        
        echo json_encode(['success' => true, 'order_id' => $orderId]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'error' => 'Ошибка при оформлении заказа']);
    }
}

function addToCart($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['user_id']) || !isset($data['product_type'])) {
        echo json_encode(['success' => false, 'error' => 'Недостаточно данных']);
        return;
    }

    $userId = $data['user_id'];
    $productType = $data['product_type'];
    $quantity = $data['quantity'] ?? 1;
    
    $versionId = null;
    $albumId = null;
    $unitPrice = $data['unit_price'] ?? 0;
    
    if ($productType === 'album_version') {
        $versionId = $data['version_id'] ?? null;
        if (!$versionId) {
            echo json_encode(['success' => false, 'error' => 'Для album_version требуется version_id']);
            return;
        }
    } else {
        $albumId = $data['album_id'] ?? $data['id'] ?? null;
        if (!$albumId) {
            echo json_encode(['success' => false, 'error' => 'Для album требуется album_id']);
            return;
        }
    }

    $stmt = $pdo->prepare("INSERT INTO cart (user_id, version_id, quantity, album_id, product_type, unit_price) VALUES (?, ?, ?, ?, ?, ?)");
    
    if ($stmt->execute([$userId, $versionId, $quantity, $albumId, $productType, $unitPrice])) {
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка при добавлении в корзину']);
    }
}

function getCart($pdo) {
    $userId = $_GET['user_id'] ?? null;
    
    if (!$userId) {
        echo json_encode(['success' => false, 'error' => 'Не указан user_id']);
        return;
    }

    $stmt = $pdo->prepare("SELECT c.*, av.version_name, av.image_url, a.album_name, a.base_price 
                           FROM cart c 
                           LEFT JOIN album_versions av ON c.version_id = av.version_id 
                           LEFT JOIN albums a ON c.album_id = a.album_id 
                           WHERE c.user_id = ?");
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'items' => $items]);
}

function removeFromCart($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['cart_item_id'])) {
        echo json_encode(['success' => false, 'error' => 'Не указан cart_item_id']);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM cart WHERE cart_item_id = ?");
    
    if ($stmt->execute([$data['cart_item_id']])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка при удалении']);
    }
}

function clearCart($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['user_id'])) {
        echo json_encode(['success' => false, 'error' => 'Не указан user_id']);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ?");
    
    if ($stmt->execute([$data['user_id']])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка при очистке корзины']);
    }
}

function addToWishlist($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['user_id']) || !isset($data['album_id'])) {
        echo json_encode(['success' => false, 'error' => 'Недостаточно данных']);
        return;
    }

    $userId = $data['user_id'];
    $albumId = $data['album_id'];
    $unitPrice = $data['unit_price'] ?? 0;

    $stmt = $pdo->prepare("SELECT wishlist_item_id FROM wishlist WHERE user_id = ? AND album_id = ?");
    $stmt->execute([$userId, $albumId]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Товар уже в избранном']);
        return;
    }

    $stmt = $pdo->prepare("INSERT INTO wishlist (user_id, album_id, unit_price) VALUES (?, ?, ?)");
    
    if ($stmt->execute([$userId, $albumId, $unitPrice])) {
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка при добавлении в избранное']);
    }
}

function getWishlist($pdo) {
    $userId = $_GET['user_id'] ?? null;
    
    if (!$userId) {
        echo json_encode(['success' => false, 'error' => 'Не указан user_id']);
        return;
    }

    $stmt = $pdo->prepare("SELECT w.*, a.album_name, a.base_price, av.image_url, g.group_name
                           FROM wishlist w
                           JOIN albums a ON w.album_id = a.album_id
                           LEFT JOIN album_versions av ON a.album_id = av.album_id
                           JOIN groups g ON a.group_id = g.group_id
                           WHERE w.user_id = ?");
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'items' => $items]);
}

function removeFromWishlist($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['wishlist_item_id'])) {
        echo json_encode(['success' => false, 'error' => 'Не указан wishlist_item_id']);
        return;
    }

    $stmt = $pdo->prepare("DELETE FROM wishlist WHERE wishlist_item_id = ?");
    
    if ($stmt->execute([$data['wishlist_item_id']])) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка при удалении']);
    }
}
