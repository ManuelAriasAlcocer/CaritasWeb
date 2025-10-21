// ========================================
// LOGIN SCRIPT PROVISIONAL (SIN FIREBASE)
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Usuario administrador único
    const ADMIN_USER = {
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        role: 'Administrador',
        id: 'admin001'
    };

    // Elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const adminIdInput = document.getElementById('adminId');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // ========================================
    // VERIFICAR SI YA HAY SESIÓN ACTIVA
    // ========================================
    
    function checkExistingSession() {
        const savedUser = localStorage.getItem('currentUser');
        const rememberMe = localStorage.getItem('rememberMe');
        
        if (savedUser && rememberMe === 'true') {
            // Usuario tiene sesión guardada, cargar datos
            const userData = JSON.parse(savedUser);
            adminIdInput.value = userData.username;
            rememberMeCheckbox.checked = true;
            
            console.log('✅ Sesión guardada encontrada para:', userData.username);
        }
        
        // Si hay sesión activa, redirigir al dashboard
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        if (isLoggedIn === 'true') {
            console.log('✅ Usuario ya tiene sesión activa, redirigiendo...');
            window.location.href = 'dashboard.html';
        }
    }

    // ========================================
    // MANEJAR ENVÍO DEL FORMULARIO
    // ========================================
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = adminIdInput.value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberMeCheckbox.checked;
        
        // Limpiar mensaje de error previo
        hideError();
        
        // Validar campos vacíos
        if (!username || !password) {
            showError('Por favor completa todos los campos');
            return;
        }
        
        // Mostrar botón como cargando
        loginBtn.disabled = true;
        loginBtn.textContent = 'Verificando...';
        
        // Simular delay de red (opcional, para hacerlo más realista)
        setTimeout(() => {
            authenticateUser(username, password, rememberMe);
        }, 800);
    });

    // ========================================
    // AUTENTICAR USUARIO
    // ========================================
    
    function authenticateUser(username, password, rememberMe) {
        // Verificar si es el usuario administrador
        if (username.toLowerCase() !== ADMIN_USER.username.toLowerCase()) {
            showError('Usuario no encontrado');
            resetLoginButton();
            return;
        }
        
        // Verificar contraseña
        if (password !== ADMIN_USER.password) {
            showError('Contraseña incorrecta');
            resetLoginButton();
            return;
        }
        
        // ✅ Autenticación exitosa
        console.log('✅ Login exitoso para:', username);
        
        // Guardar sesión
        const userData = {
            username: ADMIN_USER.username,
            name: ADMIN_USER.name,
            role: ADMIN_USER.role,
            id: ADMIN_USER.id,
            loginTime: new Date().toISOString()
        };
        
        // Guardar en sessionStorage (se borra al cerrar navegador)
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Si "Recordarme" está activado, guardar en localStorage
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('currentUser', JSON.stringify(userData));
            console.log('💾 Sesión guardada para próximos accesos');
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('currentUser');
        }
        
        // Mostrar mensaje de éxito
        loginBtn.textContent = '✓ Acceso concedido';
        loginBtn.style.background = '#27ae60';
        
        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    }

    // ========================================
    // MOSTRAR/OCULTAR ERRORES
    // ========================================
    
    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
        
        // Agregar animación
        errorMessage.style.animation = 'shake 0.5s';
        setTimeout(() => {
            errorMessage.style.animation = '';
        }, 500);
        
        // Auto-ocultar después de 5 segundos
        setTimeout(hideError, 5000);
    }
    
    function hideError() {
        errorMessage.style.display = 'none';
    }
    
    function resetLoginButton() {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Ingresar';
        loginBtn.style.background = '';
    }

    // ========================================
    // MANEJAR "RECORDARME"
    // ========================================
    
    rememberMeCheckbox.addEventListener('change', function() {
        if (this.checked) {
            console.log('🔒 Recordarme activado');
        } else {
            console.log('🔓 Recordarme desactivado');
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('currentUser');
        }
    });

    // ========================================
    // OCULTAR ENLACE "OLVIDASTE TU CONTRASEÑA"
    // ========================================
    
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.style.display = 'none';
    }

    // ========================================
    // ANIMACIÓN DE SHAKE PARA ERRORES
    // ========================================
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);

    // ========================================
    // LIMPIAR CAMPOS AL PRESIONAR ESC
    // ========================================
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            adminIdInput.value = '';
            passwordInput.value = '';
            hideError();
        }
    });

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    
    checkExistingSession();
    
    console.log('🔐 Sistema de login provisional cargado');
    console.log('👤 Usuario único: admin');
    console.log('🔑 Contraseña: admin123');
});