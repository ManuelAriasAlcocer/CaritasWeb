// ========================================
// ANUNCIOS SCRIPT - CÁRITAS MONTERREY (EN TIEMPO REAL)
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
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

console.log("🔥 Firebase conectado correctamente");

// ========================================
// ELEMENTOS DEL DOM
// ========================================

const btnCreateAnnouncement = document.getElementById("btnCreateAnnouncement");
const modal = document.getElementById("modalCreateAnnouncement");
const closeModalBtn = document.getElementById("closeModalBtn");
const btnCancelForm = document.getElementById("btnCancelForm");
const announcementForm = document.getElementById("announcementForm");
const announcementTitulo = document.getElementById("announcementTitulo");
const announcementDescripcion = document.getElementById("announcementDescripcion");
const announcementCuerpo = document.getElementById("announcementCuerpo");
const announcementTipo = document.getElementById("announcementTipo");
const tituloCounter = document.getElementById("tituloCounter");
const descripcionCounter = document.getElementById("descripcionCounter");
const cuerpoCounter = document.getElementById("cuerpoCounter");
const btnSubmitAnnouncement = document.getElementById("btnSubmitAnnouncement");
const announcementsGrid = document.getElementById("announcementsGrid");
const logoutBtn = document.getElementById("logoutBtn");

let editingId = null;

// ========================================
// SESIÓN DE USUARIO
// ========================================

onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.warn("⚠️ No hay sesión activa, redirigiendo...");
    window.location.href = "../html/login.html";
  } else {
    document.getElementById("userName").textContent = user.email;
  }
});

// ========================================
// CERRAR SESIÓN
// ========================================

logoutBtn.addEventListener("click", async () => {
  const confirmLogout = confirm("¿Cerrar sesión?");
  if (!confirmLogout) return;
  await signOut(auth);
  window.location.href = "../html/login.html";
});

// ========================================
// MODAL CONTROL
// ========================================

btnCreateAnnouncement.addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", closeModal);
btnCancelForm.addEventListener("click", closeModal);

function openModal(id = null) {
  modal.classList.add("active");
  editingId = id || null;
  if (!id) announcementForm.reset();
}

function closeModal() {
  modal.classList.remove("active");
  editingId = null;
}

// ========================================
// CONTADORES DE CARACTERES
// ========================================

function updateCounters() {
  tituloCounter.textContent = `${announcementTitulo.value.length}/100`;
  descripcionCounter.textContent = `${announcementDescripcion.value.length}/150`;
  cuerpoCounter.textContent = `${announcementCuerpo.value.length}/1000`;
}
announcementTitulo.addEventListener("input", updateCounters);
announcementDescripcion.addEventListener("input", updateCounters);
announcementCuerpo.addEventListener("input", updateCounters);

// ========================================
// GUARDAR / EDITAR ANUNCIOS
// ========================================

announcementForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = announcementTitulo.value.trim();
  const descripcion = announcementDescripcion.value.trim();
  const cuerpo = announcementCuerpo.value.trim();
  const tipo = announcementTipo.value;

  if (!titulo || !descripcion || !cuerpo || !tipo) {
    showNotification("⚠️ Completa todos los campos", "warning");
    return;
  }

  try {
    if (editingId) {
      const ref = doc(db, "news", editingId);
      await updateDoc(ref, {
        titulo,
        descripcion,
        cuerpo,
        tipo,
        fechaEdicion: serverTimestamp()
      });
      showNotification("✅ Anuncio actualizado correctamente", "success");
    } else {
      await addDoc(collection(db, "news"), {
        titulo,
        descripcion,
        cuerpo,
        tipo,
        autor: auth.currentUser?.email || "Admin",
        fechaCreacion: serverTimestamp()
      });
      showNotification("✅ Anuncio publicado correctamente", "success");
    }
    closeModal();
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    showNotification("Error al guardar anuncio", "error");
  }
});

// ========================================
// ESCUCHAR CAMBIOS EN TIEMPO REAL
// ========================================

onSnapshot(collection(db, "news"), (snapshot) => {
  const noticias = [];
  snapshot.forEach((docSnap) => {
    noticias.push({ id: docSnap.id, ...docSnap.data() });
  });

  // Ordenar por fecha de creación
  noticias.sort((a, b) => {
    const aTime = a.fechaCreacion?.seconds || 0;
    const bTime = b.fechaCreacion?.seconds || 0;
    return bTime - aTime;
  });

  renderNoticias(noticias);
  console.log(`📢 ${noticias.length} anuncios mostrados en tiempo real`);
});

// ========================================
// RENDERIZAR ANUNCIOS
// ========================================

function renderNoticias(noticias) {
  announcementsGrid.innerHTML = "";

  if (!noticias.length) {
    announcementsGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No hay anuncios publicados</p>
        <small>Crea el primero con “Crear Anuncio”</small>
      </div>`;
    return;
  }

  noticias.forEach((n) => {
    const fecha = n.fechaCreacion?.toDate
      ? n.fechaCreacion.toDate().toLocaleString("es-MX")
      : "Sin fecha";

    const card = document.createElement("div");
    card.className = "announcement-card-item";
    card.innerHTML = `
      <div class="announcement-header-item">
        <div class="announcement-meta">
          <span><i class="fas fa-user"></i> ${n.autor || "Anónimo"}</span>
          <span><i class="fas fa-calendar"></i> ${fecha}</span>
          <span class="announcement-tipo" style="background:#${getColor(n.tipo)}">${n.tipo}</span>
        </div>
        <div class="announcement-actions">
          <button class="btn-icon btn-edit" data-id="${n.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-icon btn-delete" data-id="${n.id}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="announcement-body">
        <h4>${n.titulo}</h4>
        <p>${n.descripcion}</p>
        <p>${n.cuerpo}</p>
      </div>
    `;

    card.querySelector(".btn-edit").addEventListener("click", () => openModal(n.id));
    card.querySelector(".btn-delete").addEventListener("click", () => deleteNoticia(n.id));

    announcementsGrid.appendChild(card);
  });
}

function getColor(tipo) {
  switch (tipo) {
    case "Urgente": return "e74c3c";
    case "Aviso": return "f39c12";
    case "Comunicado": return "34495e";
    default: return "3498db";
  }
}

// ========================================
// ELIMINAR ANUNCIO
// ========================================

async function deleteNoticia(id) {
  const confirmDelete = confirm("¿Eliminar este anuncio?");
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, "noticias", id));
    showNotification("🗑️ Anuncio eliminado", "success");
  } catch (error) {
    console.error("❌ Error al eliminar:", error);
    showNotification("Error al eliminar anuncio", "error");
  }
}

// ========================================
// UTILIDAD: NOTIFICACIONES
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
    background: ${type === "success" ? "#27ae60" : type === "error" ? "#e74c3c" : "#f39c12"};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}
