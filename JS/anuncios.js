// ========================================
// ANUNCIOS SCRIPT - CÁRITAS MONTERREY
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
            console.warn('Usuario no autenticado, redirigiendo al login...');
            window.location.href = 'login.html';
            return null;
        }
        
        if (userData) {
            const user = JSON.parse(userData);
            console.log('Usuario autenticado:', user.name);
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
    // ELEMENTOS DEL DOM
    // ========================================
    
    const btnCreateAnnouncement = document.getElementById('btnCreateAnnouncement');
    const modal = document.getElementById('modalCreateAnnouncement');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const btnCancelForm = document.getElementById('btnCancelForm');
    const announcementForm = document.getElementById('announcementForm');
    
    // CAMBIO: Nombres actualizados para coincidir con Kotlin
    const announcementTitulo = document.getElementById('announcementTitulo');
    const announcementDescripcion = document.getElementById('announcementDescripcion');
    const announcementCuerpo = document.getElementById('announcementCuerpo');
    const announcementTipo = document.getElementById('announcementTipo');
    
    // CAMBIO: Contadores actualizados
    const tituloCounter = document.getElementById('tituloCounter');
    const descripcionCounter = document.getElementById('descripcionCounter');
    const cuerpoCounter = document.getElementById('cuerpoCounter');
    
    const btnSubmitAnnouncement = document.getElementById('btnSubmitAnnouncement');
    const announcementsGrid = document.getElementById('announcementsGrid');
    const filterStatus = document.getElementById('filterStatus');
    const logoutBtn = document.getElementById('logoutBtn');

    // ========================================
    // VARIABLES GLOBALES
    // ========================================
    
    let noticias = []; // CAMBIO: Renombrado de 'anuncios' a 'noticias' para coincidir con Kotlin
    let editingNoticiaId = null;

    // ========================================
    // DATOS PROVISIONALES (Sin Firebase)
    // ========================================
    
    function loadInitialData() {
        const storedNoticias = localStorage.getItem('caritas_noticias');
        
        if (storedNoticias) {
            noticias = JSON.parse(storedNoticias);
        } else {
            // CAMBIO: Estructura actualizada con todos los campos de Kotlin
            const now = new Date();
            noticias = [
                {
                    id: 1,
                    titulo: "Bienvenidos a Cáritas de Monterrey",
                    descripcion: "Sistema de gestión de anuncios y noticias",
                    cuerpo: "Estamos comprometidos con servir a nuestra comunidad y brindar apoyo a quienes más lo necesitan. Este sistema te permitirá crear y gestionar anuncios importantes para toda la comunidad.",
                    tipo: "General",
                    autor: currentUser ? currentUser.name : "Admin",
                    fecha: formatDateForKotlin(now),
                    hora: formatTimeForKotlin(now)
                }
            ];
            saveToLocalStorage();
        }
        
        console.log('Datos cargados:', noticias.length, 'noticias');
        renderNoticias();
    }

    function saveToLocalStorage() {
        localStorage.setItem('caritas_noticias', JSON.stringify(noticias));
        console.log('Datos guardados en localStorage');
    }

    // NUEVO: Funciones para formatear fecha y hora como Kotlin espera (Strings)
    function formatDateForKotlin(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Formato: YYYY-MM-DD
    }

    function formatTimeForKotlin(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`; // Formato: HH:MM:SS
    }

    // ========================================
    // ABRIR/CERRAR MODAL
    // ========================================
    
    function openModal(noticiaId = null) {
        modal.classList.add('active');
        
        if (noticiaId) {
            // Modo edición
            editingNoticiaId = noticiaId;
            const noticia = noticias.find(n => n.id === noticiaId);
            
            if (noticia) {
                // CAMBIO: Actualizado con todos los campos
                announcementTitulo.value = noticia.titulo;
                announcementDescripcion.value = noticia.descripcion;
                announcementCuerpo.value = noticia.cuerpo;
                announcementTipo.value = noticia.tipo;
                updateCharCounters();
                
                document.querySelector('.modal-header h3').innerHTML = 
                    '<i class="fas fa-edit"></i> Editar Anuncio';
                btnSubmitAnnouncement.innerHTML = 
                    '<i class="fas fa-save"></i> Guardar Cambios';
            }
        } else {
            // Modo creación
            editingNoticiaId = null;
            resetForm();
            document.querySelector('.modal-header h3').innerHTML = 
                '<i class="fas fa-bullhorn"></i> Crear Anuncio';
            btnSubmitAnnouncement.innerHTML = 
                '<i class="fas fa-paper-plane"></i> Enviar';
        }
        
        console.log('✅ Modal abierto');
    }

    function closeModal() {
        modal.classList.remove('active');
        resetForm();
        editingNoticiaId = null;
        console.log('✅ Modal cerrado');
    }

    function resetForm() {
        announcementForm.reset();
        updateCharCounters();
    }

    // Event listeners para abrir/cerrar modal
    btnCreateAnnouncement.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    btnCancelForm.addEventListener('click', closeModal);

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // ========================================
    // CONTADORES DE CARACTERES
    // ========================================
    
    function updateCharCounters() {
        // CAMBIO: Actualizado con los tres contadores
        const tituloLength = announcementTitulo.value.length;
        const descripcionLength = announcementDescripcion.value.length;
        const cuerpoLength = announcementCuerpo.value.length;
        
        tituloCounter.textContent = `${tituloLength}/100`;
        descripcionCounter.textContent = `${descripcionLength}/150`;
        cuerpoCounter.textContent = `${cuerpoLength}/1000`;
        
        // Cambiar color si se acerca al límite
        tituloCounter.style.color = tituloLength > 80 ? '#e74c3c' : '#7f8c8d';
        descripcionCounter.style.color = descripcionLength > 130 ? '#e74c3c' : '#7f8c8d';
        cuerpoCounter.style.color = cuerpoLength > 900 ? '#e74c3c' : '#7f8c8d';
    }

    // CAMBIO: Event listeners actualizados
    announcementTitulo.addEventListener('input', updateCharCounters);
    announcementDescripcion.addEventListener('input', updateCharCounters);
    announcementCuerpo.addEventListener('input', updateCharCounters);

    // ========================================
    // CREAR/EDITAR ANUNCIO
    // ========================================
    
    announcementForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // CAMBIO: Obtener todos los campos necesarios para Kotlin
        const titulo = announcementTitulo.value.trim();
        const descripcion = announcementDescripcion.value.trim();
        const cuerpo = announcementCuerpo.value.trim();
        const tipo = announcementTipo.value;
        
        // Validación
        if (!titulo || !descripcion || !cuerpo || !tipo) {
            showNotification('⚠️ Por favor completa todos los campos', 'warning');
            return;
        }
        
        const now = new Date();
        
        if (editingNoticiaId) {
            // Editar noticia existente
            const index = noticias.findIndex(n => n.id === editingNoticiaId);
            if (index !== -1) {
                // CAMBIO: Mantener id como Int, actualizar todos los campos
                noticias[index] = {
                    id: noticias[index].id, // Mantener el mismo ID (Int)
                    titulo: titulo,
                    descripcion: descripcion,
                    cuerpo: cuerpo,
                    tipo: tipo,
                    autor: noticias[index].autor, // Mantener autor original
                    fecha: noticias[index].fecha, // Mantener fecha original
                    hora: noticias[index].hora, // Mantener hora original
                    editado: true, // Flag para saber que fue editado
                    fechaEdicion: formatDateForKotlin(now),
                    horaEdicion: formatTimeForKotlin(now)
                };
                console.log('✅ Noticia editada:', noticias[index]);
                showNotification('✅ Anuncio actualizado exitosamente', 'success');
            }
        } else {
            // Crear nueva noticia
            // CAMBIO: Generar ID como Int (no timestamp largo)
            const newId = noticias.length > 0 ? Math.max(...noticias.map(n => n.id)) + 1 : 1;
            
            const newNoticia = {
                id: newId, // Int para coincidir con Kotlin
                titulo: titulo,
                descripcion: descripcion,
                cuerpo: cuerpo,
                tipo: tipo,
                autor: currentUser ? currentUser.name : "Admin",
                fecha: formatDateForKotlin(now), // String formato YYYY-MM-DD
                hora: formatTimeForKotlin(now)   // String formato HH:MM:SS
            };
            
            noticias.unshift(newNoticia); // Agregar al inicio
            console.log('✅ Nueva noticia creada:', newNoticia);
            showNotification('✅ Anuncio creado exitosamente', 'success');
        }
        
        saveToLocalStorage();
        renderNoticias();
        closeModal();
        
        // TODO: Cuando tengas Firebase, usar esta estructura:
        /*
        saveToFirebase(newNoticia).then(() => {
            showNotification('Anuncio guardado en Firebase', 'success');
        }).catch(error => {
            console.error('Error guardando en Firebase:', error);
            showNotification('Error al guardar el anuncio', 'error');
        });
        */
    });

    // ========================================
    // RENDERIZAR NOTICIAS
    // ========================================
    
    function renderNoticias(filter = 'all') {
        let filteredNoticias = [...noticias];
        
        // Aplicar filtros
        if (filter === 'recent') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            filteredNoticias = filteredNoticias.filter(n => {
                const noticiaDate = new Date(n.fecha);
                return noticiaDate >= thirtyDaysAgo;
            });
        } else if (filter === 'older') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            filteredNoticias = filteredNoticias.filter(n => {
                const noticiaDate = new Date(n.fecha);
                return noticiaDate < thirtyDaysAgo;
            });
        }
        
        announcementsGrid.innerHTML = '';
        
        if (filteredNoticias.length === 0) {
            announcementsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No hay anuncios ${filter !== 'all' ? 'en esta categoría' : 'publicados'}</p>
                    <small>Crea tu primer anuncio haciendo clic en "Crear Anuncio"</small>
                </div>
            `;
            return;
        }
        
        filteredNoticias.forEach(noticia => {
            const card = createNoticiaCard(noticia);
            announcementsGrid.appendChild(card);
        });
        
        console.log('Renderizadas', filteredNoticias.length, 'noticias');
    }

    function createNoticiaCard(noticia) {
        const card = document.createElement('div');
        card.className = 'announcement-card-item';
        
        // CAMBIO: Usar fecha y hora del formato Kotlin
        const fechaCompleta = `${noticia.fecha} ${noticia.hora}`;
        const date = new Date(fechaCompleta);
        const formattedDate = formatDateDisplay(date);
        const timeAgo = getTimeAgo(date);
        
        // CAMBIO: Mostrar tipo de noticia con badge de color
        const tipoColor = getTipoColor(noticia.tipo);
        
        card.innerHTML = `
            <div class="announcement-header-item">
                <div class="announcement-meta">
                    <span class="announcement-author">
                        <i class="fas fa-user"></i> ${escapeHtml(noticia.autor)}
                    </span>
                    <span class="announcement-date" title="${formattedDate}">
                        <i class="fas fa-clock"></i> ${timeAgo}
                    </span>
                    <span class="announcement-tipo" style="background: ${tipoColor}">
                        <i class="fas fa-tag"></i> ${escapeHtml(noticia.tipo)}
                    </span>
                </div>
                <div class="announcement-actions">
                    <button class="btn-icon btn-edit" data-id="${noticia.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" data-id="${noticia.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="announcement-body">
                <h4 class="announcement-title">${escapeHtml(noticia.titulo)}</h4>
                <p class="announcement-description">${escapeHtml(noticia.descripcion)}</p>
                <p class="announcement-content">${escapeHtml(noticia.cuerpo)}</p>
            </div>
            ${noticia.editado ? `
                <div class="announcement-footer">
                    <small><i class="fas fa-pencil-alt"></i> Editado el ${noticia.fechaEdicion} a las ${noticia.horaEdicion}</small>
                </div>
            ` : ''}
        `;
        
        // Event listeners para botones
        const editBtn = card.querySelector('.btn-edit');
        const deleteBtn = card.querySelector('.btn-delete');
        
        editBtn.addEventListener('click', () => handleEdit(noticia.id));
        deleteBtn.addEventListener('click', () => handleDelete(noticia.id));
        
        return card;
    }

    // NUEVO: Función para obtener color según tipo
    function getTipoColor(tipo) {
        const colores = {
            'General': '#3498db',      // Azul
            'Urgente': '#e74c3c',      // Rojo
            'Aviso': '#f39c12',        // Naranja
            'Comunicado': '#34495e'    // Gris oscuro
        };
        return colores[tipo] || '#7f8c8d';
    }

    // ========================================
    // EDITAR Y ELIMINAR NOTICIAS
    // ========================================
    
    function handleEdit(id) {
        console.log('✏️ Editando noticia ID:', id);
        openModal(id);
    }

    function handleDelete(id) {
        const noticia = noticias.find(n => n.id === id);
        
        if (!noticia) return;
        
        const confirmDelete = confirm(
            `¿Estás seguro de eliminar el anuncio:\n\n"${noticia.titulo}"?\n\nEsta acción no se puede deshacer.`
        );
        
        if (confirmDelete) {
            noticias = noticias.filter(n => n.id !== id);
            saveToLocalStorage();
            renderNoticias(filterStatus.value);
            showNotification('Anuncio eliminado exitosamente', 'success');
            console.log('Noticia eliminada ID:', id);
            
            // TODO: Cuando tengas Firebase:
            /*
            deleteFromFirebase(id).then(() => {
                showNotification('Anuncio eliminado de Firebase', 'success');
            });
            */
        }
    }

    // ========================================
    // FILTROS
    // ========================================
    
    filterStatus.addEventListener('change', function() {
        renderNoticias(this.value);
        console.log('🔍 Filtro aplicado:', this.value);
    });

    // ========================================
    // UTILIDADES
    // ========================================
    
    function formatDateDisplay(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('es-MX', options);
    }

    function getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Hace un momento';
        if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
        if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
        if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
        if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 604800)} semanas`;
        return formatDateDisplay(date).split(',')[0];
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#f39c12'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ========================================
    // CERRAR SESIÓN
    // ========================================
    
    logoutBtn.addEventListener('click', function() {
        const confirmLogout = confirm('¿Estás seguro de cerrar sesión?');
        
        if (confirmLogout) {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('currentUser');
            console.log('Sesión cerrada');
            window.location.href = 'login.html';
        }
    });

    // ========================================
    // FIREBASE (PREPARADO PARA FUTURO USO)
    // ========================================
    
    /*
    // CAMBIO: Configuración actualizada para Firebase Realtime Database
    // Descomentar cuando tengas acceso a Firebase
    
    const firebaseConfig = {
        apiKey: "TU_API_KEY",
        authDomain: "TU_AUTH_DOMAIN",
        databaseURL: "TU_DATABASE_URL",
        projectId: "TU_PROJECT_ID",
        storageBucket: "TU_STORAGE_BUCKET",
        messagingSenderId: "TU_MESSAGING_SENDER_ID",
        appId: "TU_APP_ID"
    };
    
    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    
    // CAMBIO: Guardar en Firebase con estructura compatible con Kotlin
    function saveToFirebase(noticia) {
        // La estructura debe ser exactamente como Kotlin espera:
        // id: Int, titulo: String, descripcion: String, cuerpo: String, 
        // tipo: String, autor: String, fecha: String, hora: String
        
        return database.ref('noticias/' + noticia.id).set({
            id: noticia.id,
            titulo: noticia.titulo,
            descripcion: noticia.descripcion,
            cuerpo: noticia.cuerpo,
            tipo: noticia.tipo,
            autor: noticia.autor,
            fecha: noticia.fecha,
            hora: noticia.hora
        });
    }
    
    // CAMBIO: Cargar desde Firebase
    function loadFromFirebase() {
        database.ref('noticias').on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Convertir objeto a array
                noticias = Object.values(data);
                // Ordenar por ID descendente (más recientes primero)
                noticias.sort((a, b) => b.id - a.id);
            } else {
                noticias = [];
            }
            renderNoticias();
            console.log('✅ Noticias cargadas desde Firebase:', noticias.length);
        });
    }
    
    // CAMBIO: Actualizar en Firebase
    function updateInFirebase(noticia) {
        return database.ref('noticias/' + noticia.id).update({
            titulo: noticia.titulo,
            descripcion: noticia.descripcion,
            cuerpo: noticia.cuerpo,
            tipo: noticia.tipo
        });
    }
    
    // CAMBIO: Eliminar de Firebase
    function deleteFromFirebase(id) {
        return database.ref('noticias/' + id).remove();
    }
    
    // CAMBIO: Obtener el siguiente ID disponible
    function getNextId() {
        return database.ref('noticias').once('value').then((snapshot) => {
            const data = snapshot.val();
            if (!data) return 1;
            const ids = Object.keys(data).map(key => parseInt(key));
            return Math.max(...ids) + 1;
        });
    }
    
    // Para usar Firebase, descomenta esta línea:
    // loadFromFirebase();
    
    // Y en el submit del formulario, reemplaza saveToLocalStorage() con:
    // saveToFirebase(newNoticia).then(() => { ... });
    */

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    
    loadInitialData();
    
    console.log('Sistema de anuncios iniciado correctamente');
    console.log('Estructura de datos compatible con Kotlin:');
    console.log('   - id: Int');
    console.log('   - titulo: String');
    console.log('   - descripcion: String');
    console.log('   - cuerpo: String');
    console.log('   - tipo: String');
    console.log('   - autor: String');
    console.log('   - fecha: String (YYYY-MM-DD)');
    console.log('   - hora: String (HH:MM:SS)');
});
