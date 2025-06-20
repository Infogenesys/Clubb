document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginSection = document.getElementById('login-section');
    const mainContent = document.getElementById('main-content');
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    // Helper: get users from localStorage
    function getUsers() {
        return JSON.parse(localStorage.getItem('clubhouseUsers') || '[]');
    }
    // Helper: save users to localStorage
    function saveUsers(users) {
        localStorage.setItem('clubhouseUsers', JSON.stringify(users));
    }

    // Check if user is already logged in
    if (localStorage.getItem('clubhouseUser')) {
        loginSection.style.display = 'none';
        mainContent.style.display = 'block';
    } else {
        loginSection.style.display = 'block';
        mainContent.style.display = 'none';
    }

    // Toggle to registration form
    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
    });
    // Toggle to login form
    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    // Registration logic
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = registerForm['register-email'].value.trim().toLowerCase();
        const dob = registerForm['register-dob'].value;
        const password = registerForm['register-password'].value;
        if (!email || !dob || !password) {
            alert('Please fill all fields.');
            return;
        }
        let users = getUsers();
        if (users.find(u => u.email === email)) {
            alert('User already exists. Please login.');
            return;
        }
        users.push({ email, dob, password });
        saveUsers(users);
        alert('Registration successful! Please login.');
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    // Login logic
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = loginForm['login-email'].value.trim().toLowerCase();
        const password = loginForm['login-password'].value;
        let users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('clubhouseUser', email);
            loginSection.style.display = 'none';
            mainContent.style.display = 'block';
        } else {
            alert('Invalid email or password.');
        }
    });

    // Logout logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('clubhouseUser');
            loginSection.style.display = 'block';
            mainContent.style.display = 'none';
            loginForm.reset();
        });
    }
});
