// ========================================
// RESERVACIONES SCRIPT - CÁRITAS MONTERREY
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
  onSnapshot,
  doc,
  deleteDoc,
  query,
  where
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

console.log("🔥 Firebase conectado correctamente en Reservaciones.");

// ========================================
// VARIABLES GLOBALES
// ========================================
let currentAlbergue = 'Posada del Peregrino';
let currentTab = 'hospedaje';
let deleteTarget = null;
let unsubscribeHospedaje = null;
let unsubscribeTransporte = null;

// ========================================
// AUTENTICACIÓN
// ========================================

onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.warn("⚠️ No hay sesión activa, redirigiendo al login...");
    window.location.href = "../html/login.html";
  } else {
    console.log("✅ Sesión activa:", user.email);

    // Mostrar correo del usuario en la barra superior
    const userNameElement = document.getElementById("userName");
    if (userNameElement) {
      userNameElement.textContent = user.email;
    }

    // Ahora sí ejecutar el resto del script
    inicializarReservaciones();
  }
});

// ========================================
// FUNCIÓN PRINCIPAL
// ========================================

function inicializarReservaciones() {
  console.log("🚀 Página Reservaciones inicializada con usuario autenticado.");

  // ========================================
  // ELEMENTOS DEL DOM
  // ========================================
  const albergueBtns = document.querySelectorAll('.albergue-btn');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const hospedajeSection = document.getElementById('hospedajeSection');
  const transporteSection = document.getElementById('transporteSection');
  const deleteModal = document.getElementById('deleteModal');
  const closeDeleteModalBtn = document.getElementById('closeDeleteModal');
  const cancelDeleteBtn = document.getElementById('cancelDelete');
  const confirmDeleteBtn = document.getElementById('confirmDelete');
  const refreshBtn = document.getElementById('refreshBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // ========================================
  // EVENT LISTENERS
  // ========================================

  // Selección de Albergue
  albergueBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      albergueBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAlbergue = btn.dataset.albergue;
      loadReservations();
    });
  });

  // Cambio de Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      
      if (currentTab === 'hospedaje') {
        hospedajeSection.style.display = 'block';
        transporteSection.style.display = 'none';
      } else {
        hospedajeSection.style.display = 'none';
        transporteSection.style.display = 'block';
      }
    });
  });

  // Botón Actualizar
  refreshBtn.addEventListener('click', () => {
    const icon = refreshBtn.querySelector('i');
    icon.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      icon.style.transform = 'rotate(0deg)';
    }, 500);
    loadReservations();
  });

  // Modal de Eliminación
  closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  confirmDeleteBtn.addEventListener('click', executeDelete);

  // Cerrar modal al hacer click fuera
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });

  // Logout
  logoutBtn.addEventListener('click', async () => {
    const confirmLogout = confirm("¿Deseas cerrar sesión?");
    if (!confirmLogout) return;

    try {
      await signOut(auth);
      sessionStorage.clear();
      localStorage.clear();
      console.log("👋 Sesión cerrada correctamente.");
      window.location.href = "../html/login.html";
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  });

  // ========================================
  // FUNCIONES DE CARGA DE DATOS
  // ========================================

  function loadReservations() {
    loadHospedaje();
    loadTransporte();
  }

  // Cargar Reservas de Hospedaje
  function loadHospedaje() {
    const hospedajeTableBody = document.getElementById('hospedajeTableBody');
    
    // Mostrar loading
    hospedajeTableBody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 40px;">
          <div class="loading">
            <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary-turquoise);"></i>
            <p style="margin-top: 15px;">Cargando reservas...</p>
          </div>
        </td>
      </tr>
    `;

    // Cancelar listener anterior si existe
    if (unsubscribeHospedaje) {
      unsubscribeHospedaje();
    }

    try {
      // Query para filtrar por albergue
      const reservationsRef = collection(db, 'reservations');
      
      console.log('🔍 Buscando reservas para:', currentAlbergue);
      
      // Escuchar TODAS las reservas primero para debug
      unsubscribeHospedaje = onSnapshot(reservationsRef, (snapshot) => {
        console.log('📦 Total documentos en reservations:', snapshot.size);
        
        const allReservations = [];
        const filteredReservations = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          allReservations.push({ id: doc.id, ...data });
          
          // Filtrar manualmente
          if (data.albergue === currentAlbergue) {
            filteredReservations.push({ id: doc.id, ...data });
          }
        });
        
        console.log('📋 Todas las reservas:', allReservations);
        console.log('✅ Reservas filtradas para', currentAlbergue, ':', filteredReservations);
        
        displayHospedaje(filteredReservations);
      }, (error) => {
        console.error('❌ Error al cargar hospedaje:', error);
        hospedajeTableBody.innerHTML = `
          <tr>
            <td colspan="10" style="text-align: center; padding: 40px; color: var(--error-red);">
              Error al cargar las reservas: ${error.message}
            </td>
          </tr>
        `;
      });
    } catch (error) {
      console.error('❌ Error en loadHospedaje:', error);
    }
  }

  // Mostrar Reservas de Hospedaje
  function displayHospedaje(reservations) {
    const hospedajeTableBody = document.getElementById('hospedajeTableBody');
    const countElement = document.getElementById('hospedajeCount');
    countElement.textContent = `${reservations.length} reserva${reservations.length !== 1 ? 's' : ''}`;
    
    if (reservations.length === 0) {
      hospedajeTableBody.innerHTML = `
        <tr>
          <td colspan="10">
            <div class="empty-state">
              <i class="fas fa-bed"></i>
              <h4>No hay reservas de hospedaje</h4>
              <p>No se encontraron reservas para ${currentAlbergue}</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }
    
    hospedajeTableBody.innerHTML = '';
    
    reservations.forEach(reservation => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${reservation.nombre || '-'}</td>
        <td>${reservation.apellido || '-'}</td>
        <td>${reservation.celular || '-'}</td>
        <td>${reservation.albergue || '-'}</td>
        <td>${formatDate(reservation.fechaLlegada) || '-'}</td>
        <td>${formatDate(reservation.fechaSalida) || '-'}</td>
        <td>${reservation.hombres || 0}</td>
        <td>${reservation.mujeres || 0}</td>
        <td><strong>${reservation.numPersonas || 0}</strong></td>
        <td>
          <button class="btn-delete" data-id="${reservation.id}" data-type="hospedaje">
            <i class="fas fa-trash"></i>
            <span>Borrar</span>
          </button>
        </td>
      `;
      
      // Event listener para el botón de borrar
      const deleteBtn = row.querySelector('.btn-delete');
      deleteBtn.addEventListener('click', () => {
        openDeleteModal(reservation.id, 'hospedaje');
      });
      
      hospedajeTableBody.appendChild(row);
    });
  }

  // Cargar Reservas de Transporte
  function loadTransporte() {
    const transporteTableBody = document.getElementById('transporteTableBody');
    
    // Mostrar loading
    transporteTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px;">
          <div class="loading">
            <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary-turquoise);"></i>
            <p style="margin-top: 15px;">Cargando reservas...</p>
          </div>
        </td>
      </tr>
    `;

    // Cancelar listener anterior si existe
    if (unsubscribeTransporte) {
      unsubscribeTransporte();
    }

    try {
      // Query para transporte
      const transporteRef = collection(db, 'transporte');
      
      console.log('🔍 Buscando transporte para:', currentAlbergue);
      
      // Escuchar TODAS las reservas de transporte
      unsubscribeTransporte = onSnapshot(transporteRef, (snapshot) => {
        console.log('📦 Total documentos en transporte:', snapshot.size);
        
        const allTransporte = [];
        const filteredTransporte = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          allTransporte.push({ id: doc.id, ...data });
          
          // Filtrar manualmente
          if (data.albergue === currentAlbergue) {
            filteredTransporte.push({ id: doc.id, ...data });
          }
        });
        
        console.log('🚌 Todos los transportes:', allTransporte);
        console.log('✅ Transportes filtrados para', currentAlbergue, ':', filteredTransporte);
        
        displayTransporte(filteredTransporte);
      }, (error) => {
        console.error('❌ Error al cargar transporte:', error);
        transporteTableBody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 40px; color: var(--error-red);">
              Error al cargar las reservas: ${error.message}
            </td>
          </tr>
        `;
      });
    } catch (error) {
      console.error('❌ Error en loadTransporte:', error);
    }
  }

  // Mostrar Reservas de Transporte
  function displayTransporte(reservations) {
    const transporteTableBody = document.getElementById('transporteTableBody');
    const countElement = document.getElementById('transporteCount');
    countElement.textContent = `${reservations.length} reserva${reservations.length !== 1 ? 's' : ''}`;
    
    if (reservations.length === 0) {
      transporteTableBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <i class="fas fa-bus"></i>
              <h4>No hay reservas de transporte</h4>
              <p>No se encontraron reservas para ${currentAlbergue}</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }
    
    transporteTableBody.innerHTML = '';
    
    reservations.forEach(reservation => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${reservation.transporte || '-'}</td>
        <td>${reservation.destino || '-'}</td>
        <td>${reservation.origen || '-'}</td>
        <td>${formatDateTime(reservation.momentoInicio) || '-'}</td>
        <td>${reservation.notas || '-'}</td>
        <td>${reservation.personas || '-'}</td>
        <td>
          <button class="btn-delete" data-id="${reservation.id}" data-type="transporte">
            <i class="fas fa-trash"></i>
            <span>Borrar</span>
          </button>
        </td>
      `;
      
      // Event listener para el botón de borrar
      const deleteBtn = row.querySelector('.btn-delete');
      deleteBtn.addEventListener('click', () => {
        openDeleteModal(reservation.id, 'transporte');
      });
      
      transporteTableBody.appendChild(row);
    });
  }

  // ========================================
  // FUNCIONES DE ELIMINACIÓN
  // ========================================

  function openDeleteModal(id, type) {
    deleteTarget = { id, type };
    deleteModal.classList.add('active');
  }

  function closeDeleteModal() {
    deleteModal.classList.remove('active');
    deleteTarget = null;
  }

  async function executeDelete() {
    if (!deleteTarget) return;
    
    const { id, type } = deleteTarget;
    const collectionName = type === 'hospedaje' ? 'reservations' : 'transporte';
    
    // Mostrar estado de carga
    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';
    
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      
      console.log(`✅ Reserva eliminada: ${id}`);
      showNotification('Reserva eliminada exitosamente', 'success');
      closeDeleteModal();
      
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      showNotification('Error al eliminar la reserva. Por favor intenta de nuevo.', 'error');
    } finally {
      // Restaurar botón
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.innerHTML = '<i class="fas fa-trash"></i> Eliminar';
    }
  }

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================

  // Formatear fecha (YYYY-MM-DD a DD/MM/YYYY)
  function formatDate(dateValue) {
    if (!dateValue) return '-';
    
    try {
      // Si es un Timestamp de Firestore
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        const date = dateValue.toDate();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      
      // Si es un objeto Date
      if (dateValue instanceof Date) {
        const day = String(dateValue.getDate()).padStart(2, '0');
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const year = dateValue.getFullYear();
        return `${day}/${month}/${year}`;
      }
      
      // Si es un string
      if (typeof dateValue === 'string') {
        // Si es formato YYYY-MM-DD
        const parts = dateValue.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        // Si ya está en formato DD/MM/YYYY o similar, devolverlo tal cual
        return dateValue;
      }
      
      return '-';
    } catch (error) {
      console.error('Error al formatear fecha:', error, dateValue);
      return '-';
    }
  }

  // Formatear fecha y hora
  function formatDateTime(dateTimeValue) {
    if (!dateTimeValue) return '-';
    
    try {
      // Si es un Timestamp de Firestore
      if (dateTimeValue.toDate && typeof dateTimeValue.toDate === 'function') {
        const date = dateTimeValue.toDate();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
      
      // Si es un objeto Date
      if (dateTimeValue instanceof Date) {
        const day = String(dateTimeValue.getDate()).padStart(2, '0');
        const month = String(dateTimeValue.getMonth() + 1).padStart(2, '0');
        const year = dateTimeValue.getFullYear();
        const hours = String(dateTimeValue.getHours()).padStart(2, '0');
        const minutes = String(dateTimeValue.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
      
      // Si es un string
      if (typeof dateTimeValue === 'string') {
        // Si viene en formato "YYYY-MM-DD HH:MM"
        if (dateTimeValue.includes(' ')) {
          const [date, time] = dateTimeValue.split(' ');
          return `${formatDate(date)} ${time}`;
        }
        return dateTimeValue;
      }
      
      return '-';
    } catch (error) {
      console.error('Error al formatear fecha/hora:', error, dateTimeValue);
      return '-';
    }
  }

  // Mostrar notificación
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // ========================================
  // INICIALIZACIÓN
  // ========================================
  
  loadReservations();
  console.log("📊 Sistema de reservaciones cargado correctamente.");
}