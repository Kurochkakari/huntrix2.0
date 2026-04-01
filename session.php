<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

$host = '127.0.0.1';
$db = 'huntrixhost';
$user = 'root';
$pass = '12345678';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Ошибка подключения к базе данных']);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'check_session':
        checkSession();
        break;
    case 'login':
        loginUser($pdo);
        break;
    case 'register':
        registerUser($pdo);
        break;
    case 'logout':
        logoutUser();
        break;
    case 'update_profile':
        updateProfile($pdo);
        break;
    case 'get_user_data':
        getUserData($pdo);
        break;
    default:
        echo json_encode(['success' => false, 'error' => 'Неизвестное действие']);
}

function checkSession() {
    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            'success' => true,
            'logged_in' => true,
            'user' => [
                'id' => $_SESSION['user_id'],
                'name' => $_SESSION['user_name'] ?? '',
                'email' => $_SESSION['user_email'] ?? ''
            ]
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'logged_in' => false
        ]);
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

    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['username'];

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['user_id'],
            'name' => $user['username'],
            'email' => $user['email']
        ]
    ]);
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
        
        $_SESSION['user_id'] = $userId;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_name'] = $username;
        
        echo json_encode([
            'success' => true, 
            'user' => [
                'id' => $userId,
                'name' => $username,
                'email' => $email
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Ошибка при регистрации']);
    }
}

function logoutUser() {
    session_destroy();
    echo json_encode(['success' => true]);
}

function updateProfile($pdo) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'error' => 'Необходимо войти в аккаунт']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $_SESSION['user_id'];
    
    if (isset($data['name']) && !empty(trim($data['name']))) {
        $stmt = $pdo->prepare("UPDATE users SET username = ? WHERE user_id = ?");
        $stmt->execute([trim($data['name']), $userId]);
        $_SESSION['user_name'] = trim($data['name']);
    }
    
    if (isset($data['email']) && !empty(trim($data['email']))) {
        $email = trim($data['email']);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'error' => 'Введите корректный email']);
            return;
        }
        
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
        $stmt->execute([$email, $userId]);
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'error' => 'Этот email уже используется']);
            return;
        }
        
        $stmt = $pdo->prepare("UPDATE users SET email = ? WHERE user_id = ?");
        $stmt->execute([$email, $userId]);
        $_SESSION['user_email'] = $email;
    }
    
    if (isset($data['password']) && !empty($data['password'])) {
        if (strlen($data['password']) < 6) {
            echo json_encode(['success' => false, 'error' => 'Пароль должен содержать минимум 6 символов']);
            return;
        }
        
        $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE user_id = ?");
        $stmt->execute([$passwordHash, $userId]);
    }
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email']
        ]
    ]);
}

function getUserData($pdo) {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'error' => 'Необходимо войти в аккаунт']);
        return;
    }

    $stmt = $pdo->prepare("SELECT user_id, username, email, registration_date FROM users WHERE user_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['user_id'],
                'name' => $user['username'],
                'email' => $user['email'],
                'registrationDate' => $user['registration_date']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Пользователь не найден']);
    }
}
