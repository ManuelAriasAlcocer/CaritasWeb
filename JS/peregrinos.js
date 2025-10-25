// ========================================
// PEREGRINOS SCRIPT - CÁRITAS MONTERREY
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

console.log("🔥 Firebase conectado correctamente en Peregrinos.");

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
    inicializarPeregrinos();
  }
});

// ========================================
// FUNCIÓN PRINCIPAL (solo se ejecuta si hay sesión activa)
// ========================================


function inicializarPeregrinos() {
  console.log("🚀 Página Peregrinos inicializada con usuario autenticado.");


  // ========================================
  // VARIABLES GLOBALES PARA DATOS
  // ========================================


  let datosAlbergues = {
    posada: { mujeres: 0, hombres: 0, total: 0 },
    divina: { mujeres: 0, hombres: 0, total: 0 },
    apodaca: { mujeres: 0, hombres: 0, total: 0 }
  };

  // Mapeo de nombres de albergues en Firebase a IDs internos
  const albergueMap = {
    'Posada del Peregrino': 'posada',
    'Divina Providencia': 'divina',
    'Apodaca': 'apodaca'
  };


  // ========================================
  // CONFIGURACIÓN DE GRÁFICOS
  // ========================================


  let chartPosada = null;
  let chartDivina = null;
  let chartApodaca = null;


  const chartConfig = {
    type: "bar",
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#2c3e50",
          padding: 12,
          titleColor: "#fff",
          bodyColor: "#fff",
          callbacks: {
            label: function (context) {
              return context.parsed.y + " personas";
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { 
            stepSize: 5,
            callback: function(value) {
              return Number.isInteger(value) ? value : '';
            }
          },
          grid: { color: "rgba(0,0,0,0.05)" }
        },
        x: { grid: { display: false } }
      }
    }
  };


  function createChartData(mujeres, hombres, total) {
    return {
      labels: ["Mujeres", "Hombres", "Total"],
      datasets: [
        {
          data: [mujeres, hombres, total],
          backgroundColor: ["#e74c3c", "#3498db", "#27ae60"],
          borderRadius: 8,
          barThickness: 60
        }
      ]
    };
  }


  function createChart(location) {
    const canvasId = `chart${capitalize(location)}`;
    const ctx = document.getElementById(canvasId);
    if (!ctx) {
      console.error(`Canvas ${canvasId} no encontrado`);
      return;
    }


    const data = datosAlbergues[location];
   
    // Destruir gráfico existente si hay uno
    const charts = { posada: chartPosada, divina: chartDivina, apodaca: chartApodaca };
    if (charts[location]) {
      charts[location].destroy();
    }


    const newChart = new Chart(ctx, {
      ...chartConfig,
      data: createChartData(data.mujeres, data.hombres, data.total)
    });


    if (location === "posada") chartPosada = newChart;
    if (location === "divina") chartDivina = newChart;
    if (location === "apodaca") chartApodaca = newChart;
   
    console.log(`✅ Gráfico de ${location} creado con datos:`, data);
  }


  function updateLocationCards() {
    document.getElementById("totalPosada").textContent =
      `${datosAlbergues.posada.total} personas`;
    document.getElementById("totalDivina").textContent =
      `${datosAlbergues.divina.total} personas`;
    document.getElementById("totalApodaca").textContent =
      `${datosAlbergues.apodaca.total} personas`;
  }


  function updateModalStats(location, data) {
    document.getElementById(`statMujeres${capitalize(location)}`).textContent = data.mujeres;
    document.getElementById(`statHombres${capitalize(location)}`).textContent = data.hombres;
    document.getElementById(`statTotal${capitalize(location)}`).textContent = data.total;
  }


  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }


  // ========================================
  // CARGAR DATOS DESDE FIREBASE
  // ========================================


  function loadReservationsData() {
    const reservationsRef = collection(db, 'reservations');
    
    console.log('🔍 Cargando datos de reservaciones...');
    
    onSnapshot(reservationsRef, (snapshot) => {
      console.log('📦 Total documentos en reservations:', snapshot.size);
      
      // Resetear contadores
      datosAlbergues = {
        posada: { mujeres: 0, hombres: 0, total: 0 },
        divina: { mujeres: 0, hombres: 0, total: 0 },
        apodaca: { mujeres: 0, hombres: 0, total: 0 }
      };
      
      // Procesar cada reservación
      snapshot.forEach((doc) => {
        const data = doc.data();
        const albergueId = albergueMap[data.albergue];
        
        if (albergueId && datosAlbergues[albergueId]) {
          // Sumar los valores, asegurándose de que sean números
          const hombres = parseInt(data.hombres) || 0;
          const mujeres = parseInt(data.mujeres) || 0;
          const numPersonas = parseInt(data.numPersonas) || 0;
          
          datosAlbergues[albergueId].hombres += hombres;
          datosAlbergues[albergueId].mujeres += mujeres;
          datosAlbergues[albergueId].total += numPersonas;
          
          console.log(`➕ Sumando a ${albergueId}:`, {
            hombres,
            mujeres,
            numPersonas,
            acumulado: datosAlbergues[albergueId]
          });
        }
      });
      
      console.log('📊 Datos finales calculados:', datosAlbergues);
      
      // Actualizar la interfaz
      updateLocationCards();
      updateModalStats("posada", datosAlbergues.posada);
      updateModalStats("divina", datosAlbergues.divina);
      updateModalStats("apodaca", datosAlbergues.apodaca);
      
      // Actualizar gráficos si están abiertos
      if (chartPosada) createChart('posada');
      if (chartDivina) createChart('divina');
      if (chartApodaca) createChart('apodaca');
      
    }, (error) => {
      console.error('❌ Error al cargar reservaciones:', error);
    });
  }


  // ========================================
  // MANEJO DE MODALES
  // ========================================


  const modals = {
    posada: document.getElementById('modalPosada'),
    divina: document.getElementById('modalDivina'),
    apodaca: document.getElementById('modalApodaca')
  };


  // Abrir modal
  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', function() {
      const modalId = this.dataset.modal;
      openModal(modalId);
    });
  });


  // Cerrar modal
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
      const modalId = this.dataset.modal;
      closeModal(modalId);
    });
  });


  // Cerrar modal al hacer clic fuera
  Object.values(modals).forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
      }
    });
  });


  // Cerrar modal con ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      Object.values(modals).forEach(modal => {
        modal.classList.remove('active');
      });
    }
  });


  function openModal(modalId) {
    const modal = modals[modalId];
    if (modal) {
      modal.classList.add('active');
      updateModalStats(modalId, datosAlbergues[modalId]);
     
      // Crear gráfico después de que el modal sea visible
      setTimeout(() => {
        createChart(modalId);
      }, 100);
     
      console.log(`✅ Modal abierto: ${modalId}`, datosAlbergues[modalId]);
    }
  }


  function closeModal(modalId) {
    const modal = modals[modalId];
    if (modal) {
      modal.classList.remove('active');
      console.log(`✅ Modal cerrado: ${modalId}`);
    }
  }


  // ========================================
  // CARGAR USUARIOS DESDE FIREBASE
  // ========================================


  function loadUsersTable() {
    const usersTableBody = document.getElementById('usersTableBody');
    const usersRef = collection(db, 'users');
   
    onSnapshot(usersRef, (snapshot) => {
      usersTableBody.innerHTML = '';
       
      if (snapshot.empty) {
        usersTableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-light);">
              <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 10px; opacity: 0.3;"></i>
              <p>No hay usuarios registrados</p>
            </td>
          </tr>
        `;
        return;
      }
     
      const users = [];
      snapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
       
      // Ordenar por nombre
      users.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
       
      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.nombre || 'N/A'}</td>
          <td>${user.apellido || 'N/A'}</td>
          <td>${user.genero || 'N/A'}</td>
          <td>${user.telefono || 'N/A'}</td>
          <td>${user.nacimiento || 'N/A'}</td>
        `;
        usersTableBody.appendChild(row);
      });
       
      console.log(`✅ ${users.length} usuarios cargados`);
    }, (error) => {
      console.error('❌ Error cargando usuarios:', error);
      usersTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 20px; color: var(--error-red);">
            Error al cargar usuarios
          </td>
        </tr>
      `;
    });
  }


  // ========================================
  // BOTÓN ACTUALIZAR
  // ========================================


  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      console.log('🔄 Actualizando datos...');
      this.disabled = true;
      
      const icon = this.querySelector('i');
      icon.style.transform = 'rotate(360deg)';
      icon.style.transition = 'transform 0.5s ease';
     
      loadUsersTable();
      loadReservationsData();
     
      setTimeout(() => {
        this.disabled = false;
        icon.style.transform = 'rotate(0deg)';
        console.log('✅ Datos actualizados');
      }, 1000);
    });
  }


  // ========================================
  // LOGOUT (Cierra sesión en Firebase)
  // ========================================


  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
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
  }


  // ========================================
  // INICIALIZACIÓN
  // ========================================


  // Cargar datos iniciales
  loadReservationsData(); // ← CARGAR DATOS DE RESERVACIONES
  loadUsersTable(); // ← CARGAR TABLA DE USUARIOS


  console.log("📊 Sistema de peregrinos inicializado correctamente.");
}