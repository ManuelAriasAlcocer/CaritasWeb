// ========================================
// ADMINISTRADORES SCRIPT - SIN FIREBASE
// SISTEMA PROVISIONAL CON LOCALSTORAGE
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

    // Cargar datos del usuario actual
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
    
    const btnCreateAdmin = document.getElementById('btnCreateAdmin');
    const modal = document.getElementById('modalCreateAdmin');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const btnCancelForm = document.getElementById('btnCancelForm');
    const adminForm = document.getElementById('adminForm');
    const adminName = document.getElementById('adminName');
    const adminUsername = document.getElementById('adminUsername');
    const adminPassword = document.getElementById('adminPassword');
    const adminPasswordConfirm = document.getElementById('adminPasswordConfirm');
    const togglePassword = document.getElementById('togglePassword');
    const btnSubmitAdmin = document.getElementById('btnSubmitAdmin');
    const adminsGrid = document.getElementById('adminsGrid');
    const adminCount = document.getElementById('adminCount');
    const logoutBtn = document.getElementById('logoutBtn');

    // ========================================
    // VARIABLES GLOBALES
    // ========================================
    
    let administradores = [];
    let editingAdminId = null;

    // ========================================
    // CARGAR ADMINISTRADORES DESDE LOCALSTORAGE
    // ========================================
    
    function loadAdministradores() {
        const storedAdmins = localStorage.getItem('caritas_administradores');
        
        if (storedAdmins) {
            administradores = JSON.parse(storedAdmins);
        } else {
            // Administrador por defecto (el que viene del login)
            administradores = [
                {
                    id: 'admin001',
                    username: 'admin',
                    password: 'admin123', // En producción NUNCA guardar contraseñas en texto plano
                    name: 'Administrador',
                    role: 'Administrador',
                    createdAt: new Date().toISOString(),
                    isDefault: true // Marca el admin predeterminado
                }
            ];
            saveAdministradores();
        }
        
        console.log('✅ Administradores cargados:', administradores.length);
        renderAdministradores();
        updateAdminCount();
    }

    function saveAdministradores() {
        localStorage.setItem('caritas_administradores', JSON.stringify(administradores));
        console.log('💾 Administradores guardados');
    }

    // ========================================
    // ABRIR/CERRAR MODAL
    // ========================================
    
    function openModal(adminId = null) {
        modal.classList.add('active');
        
        if (adminId) {
            // Modo edición
            editingAdminId = adminId;
            const admin = administradores.find(a => a.id === adminId);
            
            if (admin) {
                adminName.value = admin.name;
                adminUsername.value = admin.username;
                adminUsername.disabled = true; // No permitir cambiar username
                
                // Ocultar campos de contraseña en edición
                adminPassword.closest('.form-group').style.display = 'none';
                adminPasswordConfirm.closest('.form-group').style.display = 'none';
                
                document.querySelector('.modal-header h3').innerHTML = 
                    '<i class="fas fa-user-edit"></i> Editar Administrador';
                btnSubmitAdmin.innerHTML = 
                    '<i class="fas fa-save"></i> Guardar Cambios';
            }
        } else {
            // Modo creación
            editingAdminId = null;
            resetForm();
            adminUsername.disabled = false;
            adminPassword.closest('.form-group').style.display = 'block';
            adminPasswordConfirm.closest('.form-group').style.display = 'block';
            
            document.querySelector('.modal-header h3').innerHTML = 
                '<i class="fas fa-user-plus"></i> Crear Administrador';
            btnSubmitAdmin.innerHTML = 
                '<i class="fas fa-save"></i> Crear Administrador';
        }
        
        console.log('✅ Modal abierto');
    }

    function closeModal() {
        modal.classList.remove('active');
        resetForm();
        editingAdminId = null;
        console.log('✅ Modal cerrado');
    }

    function resetForm() {
        adminForm.reset();
        adminUsername.disabled = false;
        adminPassword.type = 'password';
        togglePassword.innerHTML = '<i class="fas fa-eye"></i>';
    }

    // Event listeners para abrir/cerrar modal
    btnCreateAdmin.addEventListener('click', () => openModal());
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
    // TOGGLE PASSWORD VISIBILITY
    // ========================================
    
    togglePassword.addEventListener('click', function() {
        const type = adminPassword.type === 'password' ? 'text' : 'password';
        adminPassword.type = type;
        
        const icon = type === 'password' ? 'fa-eye' : 'fa-eye-slash';
        this.innerHTML = `<i class="fas ${icon}"></i>`;
    });

    // ========================================
    // CREAR/EDITAR ADMINISTRADOR
    // ========================================
    
    adminForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = adminName.value.trim();
        const username = adminUsername.value.trim().toLowerCase();
        const password = adminPassword.value;
        const passwordConfirm = adminPasswordConfirm.value;
        
        // Validaciones básicas
        if (!name || !username) {
            showNotification('⚠️ Por favor completa todos los campos', 'warning');
            return;
        }
        
        if (!editingAdminId) {
            // Solo validar contraseñas en modo creación
            if (!password || !passwordConfirm) {
                showNotification('⚠️ Por favor ingresa una contraseña', 'warning');
                return;
            }
            
            if (password.length < 6) {
                showNotification('⚠️ La contraseña debe tener al menos 6 caracteres', 'warning');
                return;
            }
            
            if (password !== passwordConfirm) {
                showNotification('⚠️ Las contraseñas no coinciden', 'warning');
                return;
            }
            
            // Verificar si el username ya existe
            const usernameExists = administradores.some(a => a.username === username);
            if (usernameExists) {
                showNotification('⚠️ Este nombre de usuario ya existe', 'warning');
                return;
            }
        }
        
        if (editingAdminId) {
            // Editar administrador existente
            const index = administradores.findIndex(a => a.id === editingAdminId);
            if (index !== -1) {
                administradores[index] = {
                    ...administradores[index],
                    name: name,
                    updatedAt: new Date().toISOString(),
                    updatedBy: currentUser.name
                };
                console.log('✅ Administrador editado:', administradores[index]);
                showNotification('✅ Administrador actualizado exitosamente', 'success');
            }
        } else {
            // Crear nuevo administrador
            const newAdmin = {
                id: 'admin' + Date.now(),
                username: username,
                password: password, // NOTA: En producción usar hash (bcrypt, etc.)
                name: name,
                role: 'Administrador',
                createdAt: new Date().toISOString(),
                createdBy: currentUser.name,
                isDefault: false
            };
            
            administradores.push(newAdmin);
            console.log('✅ Nuevo administrador creado:', newAdmin);
            showNotification('✅ Administrador creado exitosamente', 'success');
        }
        
        saveAdministradores();
        renderAdministradores();
        updateAdminCount();
        closeModal();
    });

    // ========================================
    // RENDERIZAR ADMINISTRADORES
    // ========================================
    
    function renderAdministradores() {
        adminsGrid.innerHTML = '';
        
        if (administradores.length === 0) {
            adminsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-shield"></i>
                    <p>No hay administradores adicionales</p>
                    <small>Crea el primer administrador haciendo clic en "Crear Administrador"</small>
                </div>
            `;
            return;
        }
        
        administradores.forEach(admin => {
            const card = createAdminCard(admin);
            adminsGrid.appendChild(card);
        });
        
        console.log('✅ Renderizados', administradores.length, 'administradores');
    }

    function createAdminCard(admin) {
        const card = document.createElement('div');
        card.className = 'admin-card-item';
        
        const createdDate = new Date(admin.createdAt);
        const formattedDate = formatDate(createdDate);
        
        // Verificar si es el usuario actual
        const isCurrentUser = currentUser && currentUser.username === admin.username;
        
        card.innerHTML = `
            <div class="admin-avatar">
                <i class="fas fa-user-circle"></i>
                ${admin.isDefault ? '<span class="badge-default">Principal</span>' : ''}
                ${isCurrentUser ? '<span class="badge-current">Sesión Actual</span>' : ''}
            </div>
            <div class="admin-info">
                <h4 class="admin-name">${escapeHtml(admin.name)}</h4>
                <p class="admin-username">
                    <i class="fas fa-user"></i> ${escapeHtml(admin.username)}
                </p>
                <p class="admin-role">
                    <i class="fas fa-shield-alt"></i> ${escapeHtml(admin.role)}
                </p>
                <p class="admin-date">
                    <i class="fas fa-calendar"></i> Creado: ${formattedDate}
                </p>
                ${admin.createdBy ? `
                    <p class="admin-creator">
                        <i class="fas fa-user-plus"></i> Por: ${escapeHtml(admin.createdBy)}
                    </p>
                ` : ''}
            </div>
            <div class="admin-actions">
                <button class="btn-icon btn-edit" data-id="${admin.id}" title="Editar" ${admin.isDefault ? 'disabled' : ''}>
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" data-id="${admin.id}" title="Eliminar" ${admin.isDefault || isCurrentUser ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Event listeners para botones (solo si no están deshabilitados)
        const editBtn = card.querySelector('.btn-edit');
        const deleteBtn = card.querySelector('.btn-delete');
        
        if (!admin.isDefault) {
            editBtn.addEventListener('click', () => handleEdit(admin.id));
        }
        
        if (!admin.isDefault && !isCurrentUser) {
            deleteBtn.addEventListener('click', () => handleDelete(admin.id));
        }
        
        return card;
    }

    // ========================================
    // EDITAR Y ELIMINAR ADMINISTRADORES
    // ========================================
    
    function handleEdit(id) {
        console.log('✏️ Editando administrador:', id);
        openModal(id);
    }

    function handleDelete(id) {
        const admin = administradores.find(a => a.id === id);
        
        if (!admin) return;
        
        // No permitir eliminar el admin por defecto
        if (admin.isDefault) {
            showNotification('⚠️ No puedes eliminar el administrador principal', 'warning');
            return;
        }
        
        // No permitir eliminar la cuenta actual
        if (currentUser && currentUser.username === admin.username) {
            showNotification('⚠️ No puedes eliminar tu propia cuenta', 'warning');
            return;
        }
        
        const confirmDelete = confirm(
            `¿Estás seguro de eliminar al administrador:\n\n"${admin.name}" (@${admin.username})?\n\nEsta acción no se puede deshacer.`
        );
        
        if (confirmDelete) {
            administradores = administradores.filter(a => a.id !== id);
            saveAdministradores();
            renderAdministradores();
            updateAdminCount();
            showNotification('✅ Administrador eliminado exitosamente', 'success');
            console.log('🗑️ Administrador eliminado:', id);
        }
    }

    // ========================================
    // ACTUALIZAR CONTADOR
    // ========================================
    
    function updateAdminCount() {
        adminCount.textContent = administradores.length;
    }

    // ========================================
    // UTILIDADES
    // ========================================
    
    function formatDate(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        return date.toLocaleDateString('es-MX', options);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotification(message, type = 'info') {
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
            console.log('👋 Sesión cerrada');
            window.location.href = 'login.html';
        }
    });

    // ========================================
    // INICIALIZACIÓN
    // ========================================
    
    loadAdministradores();
    
    console.log('🚀 Sistema de administradores iniciado (SIN Firebase)');
    console.log('⚠️ IMPORTANTE: Las contraseñas se guardan en texto plano');
    console.log('📌 En producción usar Firebase Authentication');
});