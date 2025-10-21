// ========================================
// PEREGRINOS SCRIPT - CÁRITAS MONTERREY
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // VERIFICAR AUTENTICACIÓN
    // ========================================
    /*
    function checkAuthentication() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const userData = sessionStorage.getItem('currentUser');
        
        if (!isLoggedIn || isLoggedIn !== 'true') {
            console.warn('⚠️ Usuario no autenticado, redirigiendo al login...');
            window.location.href = 'login.html';
            return null;
        }
        
        if (userData) {
            const user = JSON.parse(userData);
            console.log('✅ Usuario autenticado:', user.name);
            return user;
        }
        
        return null;
    }

    // Cargar datos del usuario
    const currentUser = checkAuthentication();
    
    if (currentUser) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
        }
        
        const userRoleElement = document.querySelector('.user-role');
        if (userRoleElement) {
            userRoleElement.textContent = currentUser.role;
        }
    }
    */
    // ========================================
    // DATOS PROVISIONALES (Sin Firebase)
    // ========================================
    
    const datosProvisionales = {
        posada: {
            mujeres: 12,
            hombres: 15,
            total: 27
        },
        divina: {
            mujeres: 8,
            hombres: 10,
            total: 18
        },
        apodaca: {
            mujeres: 14,
            hombres: 11,
            total: 25
        }
    };

    // ========================================
    // CONFIGURACIÓN DE GRÁFICOS
    // ========================================
    
    let chartPosada = null;
    let chartDivina = null;
    let chartApodaca = null;

    const chartConfig = {
        type: 'bar',
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#2c3e50',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' personas';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 30,
                    ticks: {
                        stepSize: 5,
                        callback: function(value) {
                            return value;
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    };

    // Función para crear configuración de datos del gráfico
    function createChartData(mujeres, hombres, total) {
        return {
            labels: ['Mujeres', 'Hombres', 'Total'],
            datasets: [{
                data: [mujeres, hombres, total],
                backgroundColor: [
                    '#e74c3c',  // Rojo para Mujeres
                    '#3498db',  // Azul para Hombres
                    '#27ae60'   // Verde para Total
                ],
                borderRadius: 8,
                barThickness: 60
            }]
        };
    }

    // Crear gráfico individual cuando se abre el modal
    function createChart(location) {
        const canvasId = `chart${capitalize(location)}`;
        const ctx = document.getElementById(canvasId);
        
        if (!ctx) {
            console.error(`Canvas ${canvasId} no encontrado`);
            return null;
        }

        const data = datosProvisionales[location];
        
        // Destruir gráfico existente si hay uno
        const charts = {
            posada: chartPosada,
            divina: chartDivina,
            apodaca: chartApodaca
        };
        
        if (charts[location]) {
            charts[location].destroy();
        }

        // Crear nuevo gráfico
        const newChart = new Chart(ctx, {
            ...chartConfig,
            data: createChartData(data.mujeres, data.hombres, data.total)
        });

        // Guardar referencia
        if (location === 'posada') chartPosada = newChart;
        if (location === 'divina') chartDivina = newChart;
        if (location === 'apodaca') chartApodaca = newChart;

        console.log(`✅ Gráfico de ${location} creado`);
        return newChart;
    }

    // ========================================
    // ACTUALIZAR DATOS EN TARJETAS
    // ========================================
    
    function updateLocationCards() {
        // Posada del Peregrino
        document.getElementById('totalPosada').textContent = 
            `${datosProvisionales.posada.total} personas`;
        
        // Divina Providencia
        document.getElementById('totalDivina').textContent = 
            `${datosProvisionales.divina.total} personas`;
        
        // Apodaca
        document.getElementById('totalApodaca').textContent = 
            `${datosProvisionales.apodaca.total} personas`;
    }

    // ========================================
    // ACTUALIZAR ESTADÍSTICAS EN MODALES
    // ========================================
    
    function updateModalStats(location, data) {
        document.getElementById(`statMujeres${capitalize(location)}`).textContent = data.mujeres;
        document.getElementById(`statHombres${capitalize(location)}`).textContent = data.hombres;
        document.getElementById(`statTotal${capitalize(location)}`).textContent = data.total;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
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

    // Cerrar modal con tecla ESC
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
            
            // Actualizar estadísticas del modal
            updateModalStats(modalId, datosProvisionales[modalId]);
            
            // IMPORTANTE: Crear el gráfico después de que el modal sea visible
            setTimeout(() => {
                createChart(modalId);
            }, 100);
            
            console.log(`✅ Modal abierto: ${modalId}`);
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
    // BOTÓN ACTUALIZAR
    // ========================================
    
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('🔄 Actualizando datos...');
            this.disabled = true;
            
            // Simular carga
            setTimeout(() => {
                loadDataFromFirebase(); // Esta función se conectará a Firebase
                this.disabled = false;
                console.log('✅ Datos actualizados');
            }, 1000);
        });
    }

    // ========================================
    // LOGOUT
    // ========================================
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                sessionStorage.removeItem('isLoggedIn');
                sessionStorage.removeItem('currentUser');
                
                const rememberMe = localStorage.getItem('rememberMe');
                if (rememberMe !== 'true') {
                    localStorage.removeItem('currentUser');
                }
                
                console.log('Sesión cerrada exitosamente');
                window.location.href = 'login.html';
            }
        });
    }

    // ========================================
    // CONEXIÓN CON FIREBASE (COMENTADO)
    // ========================================
    
    // ========================================
    // CONEXIÓN CON FIREBASE (COMENTADO)
    // ========================================
    
    function loadDataFromFirebase() {
        /* 
        ============================================
        INSTRUCCIONES PARA CONECTAR CON FIREBASE
        ============================================
        
        1. Descomentar las librerías de Firebase en el HTML:
           <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
           <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
        
        2. Inicializar Firebase (agregar al inicio del archivo después de DOMContentLoaded):
        
        const firebaseConfig = {
            apiKey: "TU_API_KEY",
            authDomain: "TU_AUTH_DOMAIN",
            databaseURL: "TU_DATABASE_URL",
            projectId: "TU_PROJECT_ID",
            storageBucket: "TU_STORAGE_BUCKET",
            messagingSenderId: "TU_MESSAGING_SENDER_ID",
            appId: "TU_APP_ID"
        };
        
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        
        ============================================
        ESTRUCTURA DE DATOS EN FIREBASE
        ============================================
        
        peregrinos/
        ├── posada/
        │   ├── mujeres: 12
        │   ├── hombres: 15
        │   └── total: 27
        ├── divina/
        │   ├── mujeres: 8
        │   ├── hombres: 10
        │   └── total: 18
        └── apodaca/
            ├── mujeres: 14
            ├── hombres: 11
            └── total: 25
        
        ============================================
        CÓDIGO PARA CARGAR DATOS
        ============================================
        */
        
        // POSADA DEL PEREGRINO
        /*
        database.ref('peregrinos/posada').once('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Validar que el total no exceda 30
                const mujeres = Math.min(data.mujeres || 0, 30);
                const hombres = Math.min(data.hombres || 0, 30);
                let total = mujeres + hombres;
                
                // Asegurar que el total no exceda 30
                if (total > 30) {
                    console.warn('Total de Posada excede 30, ajustando...');
                    total = 30;
                }
                
                // Actualizar datos
                datosProvisionales.posada = { mujeres, hombres, total };
                
                // Actualizar tarjeta
                document.getElementById('totalPosada').textContent = `${total} personas`;
                
                // Actualizar gráfico si existe y el modal está abierto
                if (chartPosada && modals.posada.classList.contains('active')) {
                    chartPosada.data = createChartData(mujeres, hombres, total);
                    chartPosada.update();
                }
                
                // Actualizar estadísticas del modal
                updateModalStats('posada', { mujeres, hombres, total });
                
                console.log('Datos de Posada cargados:', { mujeres, hombres, total });
            }
        }).catch((error) => {
            console.error('Error cargando datos de Posada:', error);
        });
        */
        
        // DIVINA PROVIDENCIA
        /*
        database.ref('peregrinos/divina').once('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const mujeres = Math.min(data.mujeres || 0, 30);
                const hombres = Math.min(data.hombres || 0, 30);
                let total = mujeres + hombres;
                
                if (total > 30) {
                    console.warn('Total de Divina Providencia excede 30, ajustando...');
                    total = 30;
                }
                
                datosProvisionales.divina = { mujeres, hombres, total };
                document.getElementById('totalDivina').textContent = `${total} personas`;
                
                if (chartDivina && modals.divina.classList.contains('active')) {
                    chartDivina.data = createChartData(mujeres, hombres, total);
                    chartDivina.update();
                }
                
                updateModalStats('divina', { mujeres, hombres, total });
                console.log('Datos de Divina Providencia cargados:', { mujeres, hombres, total });
            }
        }).catch((error) => {
            console.error('Error cargando datos de Divina Providencia:', error);
        });
        */
        
        // APODACA
        /*
        database.ref('peregrinos/apodaca').once('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const mujeres = Math.min(data.mujeres || 0, 30);
                const hombres = Math.min(data.hombres || 0, 30);
                let total = mujeres + hombres;
                
                if (total > 30) {
                    console.warn('Total de Apodaca excede 30, ajustando...');
                    total = 30;
                }
                
                datosProvisionales.apodaca = { mujeres, hombres, total };
                document.getElementById('totalApodaca').textContent = `${total} personas`;
                
                if (chartApodaca && modals.apodaca.classList.contains('active')) {
                    chartApodaca.data = createChartData(mujeres, hombres, total);
                    chartApodaca.update();
                }
                
                updateModalStats('apodaca', { mujeres, hombres, total });
                console.log('Datos de Apodaca cargados:', { mujeres, hombres, total });
            }
        }).catch((error) => {
            console.error('Error cargando datos de Apodaca:', error);
        });
        */
        
        /* 
        ============================================
        CARGAR TODOS LOS DATOS DE UNA VEZ
        ============================================
        
        También puedes cargar todos los datos en una sola llamada:
        
        database.ref('peregrinos').once('value', (snapshot) => {
            const allData = snapshot.val();
            
            if (allData) {
                // Procesar cada ubicación
                ['posada', 'divina', 'apodaca'].forEach(location => {
                    if (allData[location]) {
                        const data = allData[location];
                        const mujeres = Math.min(data.mujeres || 0, 30);
                        const hombres = Math.min(data.hombres || 0, 30);
                        let total = Math.min(mujeres + hombres, 30);
                        
                        // Actualizar datos locales
                        datosProvisionales[location] = { mujeres, hombres, total };
                        
                        // Actualizar UI
                        document.getElementById(`total${capitalize(location)}`).textContent = 
                            `${total} personas`;
                        
                        // Actualizar gráfico correspondiente si está visible
                        const charts = { posada: chartPosada, divina: chartDivina, apodaca: chartApodaca };
                        if (charts[location] && modals[location].classList.contains('active')) {
                            charts[location].data = createChartData(mujeres, hombres, total);
                            charts[location].update();
                        }
                        
                        // Actualizar estadísticas del modal
                        updateModalStats(location, { mujeres, hombres, total });
                    }
                });
                
                console.log('Todos los datos cargados desde Firebase');
            }
        }).catch((error) => {
            console.error('Error cargando datos:', error);
        });
        */
        
        /* 
        ============================================
        ACTUALIZACIÓN EN TIEMPO REAL
        ============================================
        
        Para recibir actualizaciones automáticas cuando cambien los datos:
        
        database.ref('peregrinos').on('value', (snapshot) => {
            const allData = snapshot.val();
            
            if (allData) {
                ['posada', 'divina', 'apodaca'].forEach(location => {
                    if (allData[location]) {
                        const data = allData[location];
                        const mujeres = Math.min(data.mujeres || 0, 30);
                        const hombres = Math.min(data.hombres || 0, 30);
                        let total = Math.min(mujeres + hombres, 30);
                        
                        datosProvisionales[location] = { mujeres, hombres, total };
                        
                        document.getElementById(`total${capitalize(location)}`).textContent = 
                            `${total} personas`;
                        
                        const charts = { posada: chartPosada, divina: chartDivina, apodaca: chartApodaca };
                        if (charts[location] && modals[location].classList.contains('active')) {
                            charts[location].data = createChartData(mujeres, hombres, total);
                            charts[location].update();
                        }
                        
                        updateModalStats(location, { mujeres, hombres, total });
                    }
                });
                
                console.log('Datos actualizados en tiempo real');
            }
        });
        */
        
        /* 
        ============================================
        ESCRIBIR DATOS EN FIREBASE
        ============================================
        
        Para actualizar los datos desde la aplicación:
        
        function updateLocationData(location, mujeres, hombres) {
            // Validar que no exceda 30
            const mujeresVal = Math.min(Math.max(mujeres, 0), 30);
            const hombresVal = Math.min(Math.max(hombres, 0), 30);
            let total = mujeresVal + hombresVal;
            
            if (total > 30) {
                alert('El total no puede exceder 30 personas');
                return;
            }
            
            const updates = {};
            updates[`peregrinos/${location}/mujeres`] = mujeresVal;
            updates[`peregrinos/${location}/hombres`] = hombresVal;
            updates[`peregrinos/${location}/total`] = total;
            updates[`peregrinos/${location}/lastUpdate`] = firebase.database.ServerValue.TIMESTAMP;
            
            database.ref().update(updates)
                .then(() => {
                    console.log('Datos actualizados correctamente');
                })
                .catch((error) => {
                    console.error('Error al actualizar datos:', error);
                });
        }
        
        // Ejemplo de uso:
        updateLocationData('posada', 12, 15);
        */
        
        console.log('ℹUsando datos provisionales. Conecta Firebase para datos en tiempo real.');
    }

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    
    if (currentUser) {
        console.log('✅ Página de Peregrinos cargada');
        console.log('👤 Usuario:', currentUser.name);
        
        // Actualizar tarjetas de ubicaciones
        updateLocationCards();
        
        // Actualizar estadísticas de todos los modales
        updateModalStats('posada', datosProvisionales.posada);
        updateModalStats('divina', datosProvisionales.divina);
        updateModalStats('apodaca', datosProvisionales.apodaca);
        
        // Cargar datos (provisional o desde Firebase)
        loadDataFromFirebase();
        
        console.log('📊 Datos iniciales:', datosProvisionales);
        console.log('ℹ️ Los gráficos se crearán al abrir cada modal');
    }
});