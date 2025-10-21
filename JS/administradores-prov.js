// ========================================
// ADMINISTRADORES SCRIPT - CON FIREBASE
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// ========================================
// CONFIGURACIÓN FIREBASE
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyCFUZ6t9EmAerXczNgA-9D-kwlW8_4fA6I",
  authDomain: "appcaritas-tec.firebaseapp.com",
  projectId: "appcaritas-tec",
  storageBucket: "appcaritas-tec.appspot.com",
  messagingSenderId: "324635812073",
  appId: "1:324635812073:web:e70fe9595e87c412c09078"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("🔥 Firebase inicializado correctamente.");

// ========================================
// ELEMENTOS DEL DOM
// ========================================

const btnCreateAdmin = document.getElementById("btnCreateAdmin");
const modal = document.getElementById("modalCreateAdmin");
const closeModalBtn = document.getElementById("closeModalBtn");
const btnCancelForm = document.getElementById("btnCancelForm");
const adminForm = document.getElementById("adminForm");
const adminName = document.getElementById("adminName");
const adminUsername = document.getElementById("adminUsername");
const adminEmail = document.getElementById("adminEmail");
const adminPassword = document.getElementById("adminPassword");
const adminPasswordConfirm = document.getElementById("adminPasswordConfirm");
const adminsGrid = document.getElementById("adminsGrid");
const adminCount = document.getElementById("adminCount");
const logoutBtn = document.getElementById("logoutBtn");

let administradores = [];

onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.warn("⚠️ No hay sesión activa, redirigiendo...");
    window.location.href = "../html/login.html";
  } else {
    document.getElementById("userName").textContent = user.email;
    loadAdministradores();
  }
});

// ========================================
// MODAL CONTROL
// ========================================

btnCreateAdmin.addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", closeModal);
btnCancelForm.addEventListener("click", closeModal);

function openModal() {
  modal.classList.add("active");
}

function closeModal() {
  modal.classList.remove("active");
  adminForm.reset();
}

// ========================================
// CREAR ADMINISTRADOR (AUTH + FIRESTORE)
// ========================================

adminForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = adminName.value.trim();
  const username = adminUsername.value.trim().toLowerCase();
  const email = adminEmail.value.trim().toLowerCase();
  const password = adminPassword.value;
  const passwordConfirm = adminPasswordConfirm.value;

  // Validaciones
  if (!name || !username || !email || !password || !passwordConfirm) {
    showNotification("⚠️ Por favor completa todos los campos", "warning");
    return;
  }

  if (password.length < 6) {
    showNotification("⚠️ La contraseña debe tener al menos 6 caracteres", "warning");
    return;
  }

  if (password !== passwordConfirm) {
    showNotification("⚠️ Las contraseñas no coinciden", "warning");
    return;
  }

  try {
    // 1️⃣ Crear cuenta en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2️⃣ Guardar datos en Firestore
    const adminData = {
      idUsuario: user.uid,
      name,
      username,
      email,
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, "administradores", user.uid), adminData);

    console.log("✅ Administrador creado y guardado en Firestore:", adminData);
    showNotification("✅ Administrador creado exitosamente", "success");

    closeModal();
    adminForm.reset();
    await loadAdministradores(); // Recargar lista

  } catch (error) {
    console.error("❌ Error al crear administrador:", error);
    if (error.code === "auth/email-already-in-use") {
      showNotification("⚠️ Este correo ya está registrado", "warning");
    } else {
      showNotification("❌ Error al crear administrador", "error");
    }
  }
});

// ========================================
// CARGAR ADMINISTRADORES DESDE FIRESTORE
// ========================================

async function loadAdministradores() {
  try {
    const querySnapshot = await getDocs(collection(db, "administradores"));
    administradores = [];
    querySnapshot.forEach((docSnap) => {
      administradores.push({ id: docSnap.id, ...docSnap.data() });
    });

    renderAdministradores();
    adminCount.textContent = administradores.length;
    console.log(`✅ ${administradores.length} administradores cargados.`);
  } catch (error) {
    console.error("❌ Error al cargar administradores:", error);
  }
}

// ========================================
// RENDERIZAR ADMINISTRADORES
// ========================================

function renderAdministradores() {
  adminsGrid.innerHTML = "";
  if (administradores.length === 0) {
    adminsGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-user-shield"></i>
        <p>No hay administradores registrados</p>
      </div>
    `;
    return;
  }

  administradores.forEach((admin) => {
    const card = document.createElement("div");
    card.className = "admin-card-item";
    const createdDate = admin.createdAt?.toDate
      ? admin.createdAt.toDate().toLocaleDateString("es-MX")
      : "Sin fecha";

    card.innerHTML = `
      <div class="admin-avatar"><i class="fas fa-user-circle"></i></div>
      <div class="admin-info">
        <h4>${admin.name}</h4>
        <p><i class="fas fa-user"></i> ${admin.username}</p>
        <p><i class="fas fa-envelope"></i> ${admin.email}</p>
        <p><i class="fas fa-calendar"></i> ${createdDate}</p>
      </div>
    `;

    adminsGrid.appendChild(card);
  });
}

// ========================================
// NOTIFICACIONES
// ========================================

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${
      type === "success" ? "#27ae60" : type === "error" ? "#e74c3c" : "#f39c12"
    };
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    font-weight: 500;
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener("click", async () => {
  const confirmLogout = confirm("¿Estás seguro de cerrar sesión?");
  if (!confirmLogout) return;
  await signOut(auth);
  sessionStorage.clear();
  localStorage.clear();
  window.location.href = "../html/login.html";
});

// ========================================
// INICIALIZACIÓN
// ========================================

//loadAdministradores();
console.log("🚀 Sistema de administradores activo con Auth + Firestore");
