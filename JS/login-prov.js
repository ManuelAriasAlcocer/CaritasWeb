// ========================================
// LOGIN CON FIREBASE (EMAIL + PASSWORD)
// ========================================

// Importar Firebase (si usas módulos con V9+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } 
    from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// ========================================
// CONFIGURACIÓN DE FIREBASE
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyCFUZ6t9EmAerXczNgA-9D-kwlW8_4fA6I",
  authDomain: "appcaritas-tec.firebaseapp.com",
  projectId: "appcaritas-tec",
  storageBucket: "appcaritas-tec.firebasestorage.app",
  messagingSenderId: "324635812073",
  appId: "1:324635812073:web:e70fe9595e87c412c09078"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ========================================
// ELEMENTOS DEL DOM
// ========================================

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('adminId'); // usa el mismo input
const passwordInput = document.getElementById('password');
const rememberMeCheckbox = document.getElementById('rememberMe');
const loginBtn = document.getElementById('loginBtn');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// ========================================
// VERIFICAR SI YA HAY SESIÓN ACTIVA
// ========================================

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('✅ Sesión activa con:', user.email);
        window.location.href = 'dashboard.html';
    }
});

// ========================================
// MANEJAR ENVÍO DEL FORMULARIO
// ========================================

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeCheckbox.checked;

    hideError();

    if (!email || !password) {
        showError('Por favor completa todos los campos');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Verificando...';

    try {
        const persistence = rememberMe 
            ? firebase.auth.Auth.Persistence.LOCAL 
            : firebase.auth.Auth.Persistence.SESSION;

        await auth.setPersistence(persistence);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('✅ Login exitoso:', user.email);

        // Guardar en sessionStorage (extra, si lo deseas)
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify({
            email: user.email,
            uid: user.uid,
            loginTime: new Date().toISOString()
        }));

        loginBtn.textContent = '✓ Acceso concedido';
        loginBtn.style.background = '#27ae60';
        setTimeout(() => window.location.href = 'dashboard.html', 700);

    } catch (error) {
        console.error(error);
        if (error.code === 'auth/invalid-email') showError('Correo no válido');
        else if (error.code === 'auth/user-not-found') showError('Usuario no encontrado');
        else if (error.code === 'auth/wrong-password') showError('Contraseña incorrecta');
        else showError('Error al iniciar sesión');
        resetLoginButton();
    }
});

// ========================================
// FUNCIONES DE UI
// ========================================

function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    errorMessage.style.animation = 'shake 0.5s';
    setTimeout(() => errorMessage.style.animation = '', 500);
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
// ANIMACIÓN DE ERROR
// ========================================

const style = document.createElement('style');
style.textContent = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}`;
document.head.appendChild(style);

console.log('🔐 Login con Firebase cargado');
