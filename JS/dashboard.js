// ========================================
// DASHBOARD SCRIPT - CÁRITAS MONTERREY
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // CONFIGURACIÓN DE GRÁFICOS

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
    // Gráfico de Donaciones Mensuales (Líneas)
    const donationsCtx = document.getElementById('donationsChart');
    if (donationsCtx) {
        const donationsChart = new Chart(donationsCtx, {
            type: 'line',
            data: {
                labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
                datasets: [{
                    label: 'Donaciones ($)',
                    data: [30000, 35000, 32000, 42000, 38000, 45000],
                    borderColor: '#17a2b8',
                    backgroundColor: 'rgba(23, 162, 184, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#17a2b8',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        backgroundColor: '#2c3e50',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: function(context) {
                                return 'Donaciones: $' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de Servicios (Pie)
    const beneficiariesCtx = document.getElementById('beneficiariesChart');
    if (beneficiariesCtx) {
        const beneficiariesChart = new Chart(beneficiariesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Alimentos', 'Transporte', 'Atención Médica', 'Lavandería'],
                datasets: [{
                    data: [450, 320, 280, 195],
                    backgroundColor: [
                        '#17a2b8',
                        '#27ae60',
                        '#9370b3',
                        '#f39c12'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#2c3e50',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return label + ': ' + value + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    }

    // ========================================
    // ACTUALIZAR MÉTRICAS DESDE BASE DE DATOS
    // ========================================
    
    function updateMetrics() {
        // Aquí conectarías con tu base de datos (Firebase, MySQL, etc.)
        // Firebase:
        
        /*
        // Firebase Realtime Database
        const database = firebase.database();
        
        // Obtener total de beneficiarios
        database.ref('beneficiarios').once('value', (snapshot) => {
            const total = snapshot.numChildren();
            document.getElementById('totalBeneficiaries').textContent = total.toLocaleString();
        });
        
        // Obtener donaciones del mes
        database.ref('donaciones').orderByChild('fecha')
            .startAt(getMonthStart())
            .once('value', (snapshot) => {
                let totalDonations = 0;
                snapshot.forEach(child => {
                    totalDonations += child.val().monto;
                });
                document.getElementById('totalDonations').textContent = 
                    ' + totalDonations.toLocaleString();
            });
        
        // Obtener items en inventario
        database.ref('inventario').once('value', (snapshot) => {
            let totalItems = 0;
            snapshot.forEach(child => {
                totalItems += child.val().cantidad;
            });
            document.getElementById('totalItems').textContent = totalItems.toLocaleString();
        });
        
        // Obtener eventos próximos
        database.ref('eventos').orderByChild('fecha')
            .startAt(new Date().toISOString())
            .once('value', (snapshot) => {
                document.getElementById('upcomingEvents').textContent = 
                    snapshot.numChildren();
            });
        */
        
        // Por ahora, actualizamos la fecha
        updateLastUpdateTime();
    }

    // ========================================
    // ACTUALIZAR GRÁFICOS CON DATOS REALES
    // ========================================
    
    function updateCharts() {
        // Ejemplo de cómo actualizar gráficos con datos de Firebase
        
        /*
        const database = firebase.database();
        
        // Actualizar gráfico de donaciones
        database.ref('donaciones_mensuales').once('value', (snapshot) => {
            const data = snapshot.val();
            const labels = Object.keys(data);
            const values = Object.values(data);
            
            donationsChart.data.labels = labels;
            donationsChart.data.datasets[0].data = values;
            donationsChart.update();
        });
        
        // Actualizar gráfico de beneficiarios
        database.ref('beneficiarios_por_categoria').once('value', (snapshot) => {
            const data = snapshot.val();
            const labels = Object.keys(data);
            const values = Object.values(data);
            
            beneficiariesChart.data.labels = labels;
            beneficiariesChart.data.datasets[0].data = values;
            beneficiariesChart.update();
        });
        */
    }

    // ========================================
    // CARGAR TABLA DE ACTIVIDAD RECIENTE
    // ========================================
    
    function loadRecentActivity() {
        // Ejemplo con Firebase
        
        /*
        const database = firebase.database();
        const tableBody = document.querySelector('#activityTable tbody');
        
        database.ref('actividades')
            .orderByChild('fecha')
            .limitToLast(20)
            .once('value', (snapshot) => {
                tableBody.innerHTML = ''; // Limpiar tabla
                
                const activities = [];
                snapshot.forEach(child => {
                    activities.push({
                        id: child.key,
                        ...child.val()
                    });
                });
                
                // Invertir para mostrar más recientes primero
                activities.reverse().forEach(activity => {
                    const row = createActivityRow(activity);
                    tableBody.appendChild(row);
                });
            });
        */
    }

    // Crear fila de tabla para actividad
    function createActivityRow(activity) {
        const row = document.createElement('tr');
        
        // Determinar tipo de badge
        let badgeClass = 'badge-donation';
        if (activity.tipo === 'Beneficiario') badgeClass = 'badge-beneficiary';
        if (activity.tipo === 'Evento') badgeClass = 'badge-event';
        
        // Determinar estado
        let statusClass = 'status-success';
        if (activity.estado === 'En proceso') statusClass = 'status-pending';
        if (activity.estado === 'Error') statusClass = 'status-error';
        
        row.innerHTML = `
            <td>${formatDate(activity.fecha)}</td>
            <td><span class="badge ${badgeClass}">${activity.tipo}</span></td>
            <td>${activity.descripcion}</td>
            <td>${activity.usuario}</td>
            <td><span class="${statusClass}">${activity.estado}</span></td>
        `;
        
        return row;
    }

    // ========================================
    // FUNCIONES DE UTILIDAD
    // ========================================
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return date.toLocaleDateString('es-MX', options);
    }

    function getMonthStart() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }

    function updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const dateString = now.toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('lastUpdate').textContent = 
            `${dateString}, ${timeString}`;
    }

    // ========================================
    // EXPORTAR DATOS
    // ========================================
    
    const exportBtn = document.querySelector('.btn-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportTableToCSV('actividad_reciente.csv');
        });
    }

    function exportTableToCSV(filename) {
        const table = document.getElementById('activityTable');
        const rows = table.querySelectorAll('tr');
        const csv = [];
        
        rows.forEach(row => {
            const cols = row.querySelectorAll('td, th');
            const rowData = [];
            cols.forEach(col => {
                // Limpiar el texto de badges y spans
                let text = col.textContent.trim();
                text = text.replace(/"/g, '""'); // Escapar comillas
                rowData.push('"' + text + '"');
            });
            csv.push(rowData.join(','));
        });
        
        // Crear blob y descargar
        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Tabla exportada exitosamente');
    }

    // ========================================
    // LOGOUT
    // ========================================
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            //Firebase Auth
            /*
            firebase.auth().signOut().then(() => {
                window.location.href = '../html/login.html';
            }).catch((error) => {
                console.error('Error al cerrar sesión:', error);
            });
            */
            
            // Sin Firebase, simplemente redirige
            if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
                window.location.href = '../html/login.html';
            }
        });
    }

    // ========================================
    // SIDEBAR RESPONSIVO (MÓVIL)
    // ========================================
    
    // Agregar botón para móvil
    const header = document.querySelector('.dashboard-header .header-content');
    const sidebar = document.querySelector('.dashboard-sidebar');
    
    if (window.innerWidth <= 992) {
        // Crear botón si no existe
        let menuBtn = document.querySelector('.menu-toggle');
        if (!menuBtn) {
            menuBtn = document.createElement('button');
            menuBtn.className = 'menu-toggle';
            menuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            menuBtn.style.cssText = `
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 20px;
            `;
            header.insertBefore(menuBtn, header.firstChild);
            
            // Toggle sidebar
            menuBtn.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
        }
    }

    // Cerrar sidebar al hacer clic en un link (móvil)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                sidebar.classList.remove('open');
            }
        });
    });

    // ========================================
    // FILTROS DE GRÁFICOS
    // ========================================
    
    document.querySelectorAll('.chart-filter').forEach(select => {
        select.addEventListener('change', function() {
            const chartCard = this.closest('.chart-card');
            const chartTitle = chartCard.querySelector('h3').textContent;
            console.log(`Filtro cambiado en: ${chartTitle} - Nuevo valor: ${this.value}`);
            
            // Aquí actualizarías los datos del gráfico según el filtro
            // updateCharts();
        });
    });

    // ========================================
    // ACTUALIZACIÓN AUTOMÁTICA
    // ========================================
    
    // Actualizar métricas cada 30 segundos
    setInterval(updateMetrics, 30000);
    
    // Actualizar gráficos cada 60 segundos
    setInterval(updateCharts, 60000);

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    
    console.log('✅ Dashboard cargado exitosamente');
    updateMetrics();
    updateLastUpdateTime();
    
    // Firebase, obtener nombre del usuario
    /*
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('userName').textContent = user.displayName || user.email;
            document.getElementById('welcomeName').textContent = user.displayName || 'Admin';
            
            // Cargar datos del usuario desde la base de datos
            firebase.database().ref('users/' + user.uid).once('value', (snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    document.querySelector('.user-role').textContent = userData.role || 'Administrador';
                }
            });
        } else {
            // No autenticado, redirigir al login
            window.location.href = '../html/login.html';
        }
    });
    */
});