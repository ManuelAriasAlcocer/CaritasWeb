
// ========================================
// DASHBOARD SCRIPT - CÁRITAS MONTERREY
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
  getDoc
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

    // Configuración Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyCFUZ6t9EmAerXczNgA-9D-kwlW8_4fA6I",
      authDomain: "appcaritas-tec.firebaseapp.com",
      projectId: "appcaritas-tec",
      storageBucket: "appcaritas-tec.appspot.com",
      messagingSenderId: "324635812073",
      appId: "1:324635812073:web:e70fe9595e87c412c09078",
    };

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log("🔥 Firebase conectado:", app.name);

// ========================================
// VARIABLES GLOBALES
// ========================================

let beneficiariesChart = null;
let totalPeregrinos = 0;
let totalAnuncios = 0;
let reservasHospedaje = 0;
let reservasTransporte = 0;

// ========================================
// AUTENTICACIÓN
// ========================================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.warn("⚠️ No hay sesión activa, redirigiendo al login...");
    window.location.href = "../html/login.html";
  } else {
    console.log("✅ Sesión activa:", user.email);

    // Mostrar correo del usuario
    const userNameElement = document.getElementById("userName");
    if (userNameElement) {
      userNameElement.textContent = user.email;
    }

    // Buscar datos del usuario en Firestore
    let userDocRef = doc(db, "administradores", user.uid);
    let userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      userDocRef = doc(db, "usuarios", user.uid);
      userSnap = await getDoc(userDocRef);
    }

    if (userSnap.exists()) {
      const userData = userSnap.data();
      document.getElementById("welcomeName").textContent = userData.name || "Usuario";
    } else {
      document.getElementById("welcomeName").textContent = "Usuario";
    }

    // Inicializar dashboard
    inicializarDashboard();
  }
});

// ========================================
// FUNCIÓN PRINCIPAL
// ========================================

function inicializarDashboard() {
  console.log("🚀 Dashboard inicializado");

  // Cargar datos en tiempo real
  loadPeregrinosData();
  loadAnunciosData();
  loadReservacionesData();
  updateLastUpdateTime();

  // Actualizar fecha cada minuto
  setInterval(updateLastUpdateTime, 60000);
}

// ========================================
// CARGAR DATOS DE PEREGRINOS
// ========================================

function loadPeregrinosData() {
  const reservationsRef = collection(db, 'reservations');
  
  console.log('🔍 Cargando datos de peregrinos...');
  
  onSnapshot(reservationsRef, (snapshot) => {
    totalPeregrinos = 0;
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const numPersonas = parseInt(data.numPersonas) || 0;
      totalPeregrinos += numPersonas;
    });
    
    console.log('👥 Total de peregrinos:', totalPeregrinos);
    
    // Actualizar UI
    const totalBeneficiariesElement = document.getElementById('totalBeneficiaries');
    if (totalBeneficiariesElement) {
      totalBeneficiariesElement.textContent = totalPeregrinos;
    }
    
  }, (error) => {
    console.error('❌ Error al cargar peregrinos:', error);
  });
}

// ========================================
// CARGAR DATOS DE ANUNCIOS
// ========================================

function loadAnunciosData() {
  const newsRef = collection(db, 'news');
  
  console.log('🔍 Cargando datos de anuncios...');
  
  onSnapshot(newsRef, (snapshot) => {
    totalAnuncios = snapshot.size;
    
    console.log('📢 Total de anuncios:', totalAnuncios);
    
    // Actualizar UI
    const upcomingEventsElement = document.getElementById('upcomingEvents');
    if (upcomingEventsElement) {
      upcomingEventsElement.textContent = totalAnuncios;
    }
    
  }, (error) => {
    console.error('❌ Error al cargar anuncios:', error);
  });
}

// ========================================
// CARGAR DATOS DE RESERVACIONES
// ========================================

function loadReservacionesData() {
  // Listener para hospedaje
  const reservationsRef = collection(db, 'reservations');
  
  console.log('🔍 Cargando datos de reservaciones de hospedaje...');
  
  onSnapshot(reservationsRef, (snapshot) => {
    reservasHospedaje = snapshot.size;
    
    console.log('🛏️ Total reservas de hospedaje:', reservasHospedaje);
    
    // Actualizar gráfico
    updateChart();
    
  }, (error) => {
    console.error('❌ Error al cargar reservas de hospedaje:', error);
  });

  // Listener para transporte
  const transporteRef = collection(db, 'transporte');
  
  console.log('🔍 Cargando datos de reservaciones de transporte...');
  
  onSnapshot(transporteRef, (snapshot) => {
    reservasTransporte = snapshot.size;
    
    console.log('🚌 Total reservas de transporte:', reservasTransporte);
    
    // Actualizar gráfico
    updateChart();
    
  }, (error) => {
    console.error('❌ Error al cargar reservas de transporte:', error);
  });
}

// ========================================
// ACTUALIZAR GRÁFICO DE DONA
// ========================================

function updateChart() {
  const beneficiariesCtx = document.getElementById("beneficiariesChart");
  if (!beneficiariesCtx) return;

  // Destruir gráfico anterior si existe
  if (beneficiariesChart) {
    beneficiariesChart.destroy();
  }

  // Crear nuevo gráfico con datos actualizados
  beneficiariesChart = new Chart(beneficiariesCtx, {
    type: "doughnut",
    data: {
      labels: ["Reservas de Hospedaje", "Reservas de Transporte"],
      datasets: [
        {
          data: [reservasHospedaje, reservasTransporte],
          backgroundColor: ["#17a2b8", "#27ae60"],
          borderWidth: 2,
          borderColor: "#fff"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { 
          position: "bottom",
          labels: {
            padding: 15,
            font: {
              size: 13
            }
          }
        },
        tooltip: {
          backgroundColor: "#2c3e50",
          padding: 12,
          titleColor: "#fff",
          bodyColor: "#fff",
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = reservasHospedaje + reservasTransporte;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  console.log('📊 Gráfico actualizado:', {
    hospedaje: reservasHospedaje,
    transporte: reservasTransporte
  });

  // Actualizar contadores en el resumen
  const hospedajeCountElement = document.getElementById('hospedajeCount');
  const transporteCountElement = document.getElementById('transporteCount');
  
  if (hospedajeCountElement) {
    hospedajeCountElement.textContent = reservasHospedaje;
  }
  if (transporteCountElement) {
    transporteCountElement.textContent = reservasTransporte;
  }
}

// ========================================
// ACTUALIZAR FECHA DE ÚLTIMA ACTUALIZACIÓN
// ========================================

function updateLastUpdateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateString = now.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const lastUpdateElement = document.getElementById("lastUpdate");
  if (lastUpdateElement) {
    lastUpdateElement.textContent = `${dateString}, ${timeString}`;
  }
}

// ========================================
// CERRAR SESIÓN
// ========================================

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const confirmLogout = confirm("¿Estás seguro que deseas cerrar sesión?");
    if (!confirmLogout) return;

    try {
      await signOut(auth);
      sessionStorage.clear();
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("currentUser");
      console.log("👋 Sesión cerrada correctamente.");
      window.location.href = "../html/login.html";
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
      alert("Error al cerrar sesión. Intenta nuevamente.");
    }
  });
}

console.log("✅ Dashboard script cargado correctamente");