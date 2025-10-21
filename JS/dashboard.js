// ========================================
// DASHBOARD SCRIPT - CÁRITAS MONTERREY
// ========================================

document.addEventListener("DOMContentLoaded", async function () {
  // ========================================
  // FIREBASE CONFIG & AUTH
  // ========================================

  import("https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js").then(async ({ initializeApp }) => {
    const { getAuth, onAuthStateChanged, signOut } = await import(
      "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js"
    );
    const { getFirestore, doc, getDoc } = await import(
      "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js"
    );

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
    // VERIFICAR AUTENTICACIÓN + DATOS FIRESTORE
    // ========================================
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("✅ Sesión activa:", user.email);

        // 🔹 Primero asumimos que el usuario puede estar en "administradores"
        let userDocRef = doc(db, "administradores", user.uid);
        let userSnap = await getDoc(userDocRef);

        // 🔹 Si no está en administradores, buscar en "usuarios"
        if (!userSnap.exists()) {
          userDocRef = doc(db, "usuarios", user.uid);
          userSnap = await getDoc(userDocRef);
        }

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("📄 Datos Firestore:", userData);

          // Mostrar nombre y username desde Firestore
          document.getElementById("userName").textContent = user.email;
          document.getElementById("welcomeName").textContent = userData.name || "Usuario";
        } else {
          // Si no se encontró en ninguna colección
          document.getElementById("userName").textContent = user.email;
          document.getElementById("welcomeName").textContent = "Invitado";
          console.warn("⚠️ Usuario no encontrado en Firestore.");
        }
      } else {
        console.warn("⚠️ No hay sesión activa. Redirigiendo al login...");
        window.location.href = "../html/login.html";
      }
    });

    // ========================================
    // BOTÓN DE CERRAR SESIÓN
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
  });

  // ========================================
  // RESTO DEL DASHBOARD (GRÁFICOS, ETC.)
  // ========================================

  const donationsCtx = document.getElementById("donationsChart");
  if (donationsCtx) {
    new Chart(donationsCtx, {
      type: "line",
      data: {
        labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
        datasets: [
          {
            label: "Donaciones ($)",
            data: [30000, 35000, 32000, 42000, 38000, 45000],
            borderColor: "#17a2b8",
            backgroundColor: "rgba(23, 162, 184, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top" },
        },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  // Distribución de servicios (Pastel)
  const beneficiariesCtx = document.getElementById("beneficiariesChart");
  if (beneficiariesCtx) {
    new Chart(beneficiariesCtx, {
      type: "doughnut",
      data: {
        labels: ["Alimentos", "Transporte", "Atención Médica", "Lavandería"],
        datasets: [
          {
            data: [450, 320, 280, 195],
            backgroundColor: ["#17a2b8", "#27ae60", "#9370b3", "#f39c12"],
          },
        ],
      },
      options: {
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
  }

  // Actualizar fecha de última actualización
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
    document.getElementById("lastUpdate").textContent = `${dateString}, ${timeString}`;
  }

  updateLastUpdateTime();
  console.log("✅ Dashboard cargado correctamente");
});
