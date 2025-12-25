/**
 * JavaScript de la Página de Éxito
 * Maneja la funcionalidad de la página de éxito e interacciones del usuario
 */

/**
 * Clase principal para la funcionalidad de la página de éxito
 * Gestiona la información de sesión, botones de acción y validación
 */
class SuccessPage {
    constructor() {
        this.sessionManager = new SessionManager(); // Gestor de sesiones
        this.sessionInfoInterval = null; // Intervalo para actualizar información de sesión
        this.init(); // Inicializar la página
    }

    /**
     * Inicializa la página de éxito
     * Configura validación, información y eventos
     */
    init() {
        this.validateSession(); // Validar que la sesión sea válida
        this.setTimestamp(); // Establecer marca de tiempo
        this.setLoginTime(); // Establecer hora de login
        this.setupEventListeners(); // Configurar eventos de botones
        this.updateSessionInfo(); // Actualizar información de sesión
        this.startSessionInfoUpdates(); // Iniciar actualizaciones automáticas
    }

    /**
     * Valida que la sesión sea válida antes de mostrar la página
     * Verifica tanto los datos de sesión como los parámetros de URL
     */
    validateSession() {
        console.log('=== DEBUG DE PÁGINA DE ÉXITO ===');
        console.log('URL actual:', window.location.href);
        console.log('Parámetros de URL:', window.location.search);
        
        // Verificar primero los parámetros de URL
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get('user');
        console.log('Parámetro de usuario desde URL:', userParam);
        
        // Verificar almacenamiento de sesión
        const sessionData = this.sessionManager.getSession();
        console.log('Datos de sesión desde almacenamiento:', sessionData);
        
        // Verificar si la sesión es válida
        const isValid = this.sessionManager.isSessionValid();
        console.log('La sesión es válida:', isValid);
        
        // Permitir acceso si la sesión es válida O existe parámetro de usuario
        if (!isValid && !userParam) {
            console.warn('No hay sesión válida ni parámetro de usuario - redirigiendo al login');
            alert('Su sesión ha expirado o no es válida. Será redirigido al login.');
            window.location.href = 'index.html?expired=true';
            return;
        }
        
        if (isValid) {
            console.log('Sesión válida encontrada - actualizando actividad');
            // Actualizar actividad
            this.sessionManager.updateActivity();
        } else if (userParam) {
            console.log('No hay sesión válida pero se encontró parámetro de usuario - permitiendo acceso para pruebas');
            // Permitir acceso basado en parámetro de URL (para propósitos de prueba)
        }
    }

    /**
     * Establece la marca de tiempo actual en el elemento correspondiente
     * Muestra la fecha y hora en zona horaria UTC-6
     */
    setTimestamp() {
        const timestampElement = document.getElementById('timestamp-value');
        if (timestampElement) {
            const now = new Date();
            // Ajustar a UTC-6 (restar 6 horas en milisegundos)
            const utcMinus6 = new Date(now.getTime() - (6 * 60 * 60 * 1000));
            
            // Formatear fecha y hora en formato legible
            const year = utcMinus6.getUTCFullYear();
            const month = String(utcMinus6.getUTCMonth() + 1).padStart(2, '0');
            const day = String(utcMinus6.getUTCDate()).padStart(2, '0');
            const hours = String(utcMinus6.getUTCHours()).padStart(2, '0');
            const minutes = String(utcMinus6.getUTCMinutes()).padStart(2, '0');
            const seconds = String(utcMinus6.getUTCSeconds()).padStart(2, '0');
            
            // Formato: YYYY-MM-DD HH:mm:ss UTC-6
            const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC-6`;
            timestampElement.textContent = formattedTime;
        }
    }

    /**
     * Establece la hora de login actual en el elemento correspondiente
     */
    setLoginTime() {
        const timeElement = document.getElementById('time-value');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString();
        }
    }

    /**
     * Actualiza la información de sesión mostrada en la página
     * Obtiene datos del SessionManager o usa valores de respaldo desde la URL
     */
    updateSessionInfo() {
        // Obtener información de sesión desde SessionManager
        const sessionInfo = this.sessionManager.getSessionInfo();
        
        if (sessionInfo) {
            // Actualizar nombre de usuario
            const usernameElement = document.getElementById('username-value');
            if (usernameElement) {
                usernameElement.textContent = sessionInfo.username;
            }

            // Actualizar ID de sesión
            const sessionElement = document.getElementById('session-value');
            if (sessionElement) {
                sessionElement.textContent = sessionInfo.sessionId;
            }

            // Actualizar hora de login
            const timeElement = document.getElementById('time-value');
            if (timeElement) {
                const loginTime = new Date(sessionInfo.loginTime);
                timeElement.textContent = loginTime.toLocaleTimeString();
            }

            // Añadir información de duración de sesión
            this.updateSessionDuration(sessionInfo);
        } else {
            // Respaldo a parámetros de URL si no hay sesión
            const urlParams = new URLSearchParams(window.location.search);
            const username = urlParams.get('user') || 'testuser';
            
            const usernameElement = document.getElementById('username-value');
            if (usernameElement) {
                usernameElement.textContent = username;
            }

            // Generar ID de sesión de respaldo
            const sessionId = 'FALLBACK-' + Math.random().toString(36).substring(2, 11).toUpperCase();
            const sessionElement = document.getElementById('session-value');
            if (sessionElement) {
                sessionElement.textContent = sessionId;
            }
        }
    }

    /**
     * Actualiza la visualización de duración de sesión
     * @param {Object} sessionInfo - Información de la sesión actual
     */
    updateSessionDuration(sessionInfo) {
        // Añadir o actualizar elemento de duración de sesión
        let durationElement = document.getElementById('session-duration');
        
        if (!durationElement) {
            // Crear elemento de duración si no existe
            const infoGrid = document.getElementById('info-grid');
            if (infoGrid) {
                const durationItem = document.createElement('div');
                durationItem.className = 'info-item';
                durationItem.id = 'session-duration-info';
                durationItem.setAttribute('data-testid', 'session-duration-info');
                
                durationItem.innerHTML = `
                    <span class="info-label" id="duration-label" data-testid="duration-label">Tiempo Restante:</span>
                    <span class="info-value" id="session-duration" data-testid="session-duration">--:--</span>
                `;
                
                infoGrid.appendChild(durationItem);
                durationElement = document.getElementById('session-duration');
            }
        }

        if (durationElement && sessionInfo.timeRemaining) {
            const minutes = Math.floor(sessionInfo.timeRemaining / 60000);
            const seconds = Math.floor((sessionInfo.timeRemaining % 60000) / 1000);
            durationElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Cambiar color basado en tiempo restante
            if (minutes < 5) {
                durationElement.style.color = '#e53e3e'; // Rojo para < 5 minutos
            } else if (minutes < 10) {
                durationElement.style.color = '#d69e2e'; // Naranja para < 10 minutos
            } else {
                durationElement.style.color = '#38a169'; // Verde para > 10 minutos
            }
        }
    }

    /**
     * Inicia las actualizaciones automáticas de información de sesión
     * Actualiza la información cada 30 segundos y verifica la validez de la sesión
     */
    startSessionInfoUpdates() {
        // Actualizar información de sesión cada 30 segundos
        this.sessionInfoInterval = setInterval(() => {
            const sessionInfo = this.sessionManager.getSessionInfo();
            if (sessionInfo && sessionInfo.isValid) {
                this.updateSessionDuration(sessionInfo);
                this.sessionManager.updateActivity(); // Actualizar marca de tiempo de actividad
            } else {
                // Sesión expirada
                this.handleSessionExpiry();
            }
        }, 30000);
    }

    /**
     * Detiene las actualizaciones automáticas de información de sesión
     */
    stopSessionInfoUpdates() {
        if (this.sessionInfoInterval) {
            clearInterval(this.sessionInfoInterval);
            this.sessionInfoInterval = null;
        }
    }

    /**
     * Maneja la expiración de sesión
     * Detiene actualizaciones y redirige al login
     */
    handleSessionExpiry() {
        this.stopSessionInfoUpdates();
        this.showMessage('Su sesión ha expirado', 'error');
        
        setTimeout(() => {
            window.location.href = 'index.html?expired=true';
        }, 2000);
    }

    /**
     * Configura todos los event listeners para los botones de la página
     */
    setupEventListeners() {
        // Botón de dashboard
        const dashboardBtn = document.getElementById('dashboard-button');
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', this.handleDashboardClick.bind(this));
        }

        // Botón de perfil
        const profileBtn = document.getElementById('profile-button');
        if (profileBtn) {
            profileBtn.addEventListener('click', this.handleProfileClick.bind(this));
        }

        // Botón de logout
        const logoutBtn = document.getElementById('logout-button');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogoutClick.bind(this));
        }

        // Botón de extender sesión
        const extendBtn = document.getElementById('extend-session-button');
        if (extendBtn) {
            extendBtn.addEventListener('click', this.handleExtendSession.bind(this));
        }

        // Enlace de volver al login
        const backToLoginLink = document.getElementById('back-to-login');
        if (backToLoginLink) {
            backToLoginLink.addEventListener('click', this.handleBackToLogin.bind(this));
        }
    }

    /**
     * Maneja el clic en el botón de dashboard
     * @param {Event} event - Evento del clic
     */
    handleDashboardClick(event) {
        event.preventDefault();
        // Simular navegación al dashboard
        this.showMessage('Navegando al dashboard...', 'info');
        
        // Para propósitos de prueba, solo mostrar una alerta
        setTimeout(() => {
            alert('Dashboard - Funcionalidad simulada para pruebas');
        }, 500);
    }

    /**
     * Maneja el clic en el botón de perfil
     * @param {Event} event - Evento del clic
     */
    handleProfileClick(event) {
        event.preventDefault();
        // Simular navegación al perfil
        this.showMessage('Cargando perfil de usuario...', 'info');
        
        // Para propósitos de prueba, solo mostrar una alerta
        setTimeout(() => {
            alert('Perfil de Usuario - Funcionalidad simulada para pruebas');
        }, 500);
    }

    /**
     * Maneja el clic en el botón de extender sesión
     * @param {Event} event - Evento del clic
     */
    handleExtendSession(event) {
        event.preventDefault();
        
        const extended = this.sessionManager.extendSession();
        if (extended) {
            this.showMessage('Sesión extendida por 30 minutos más', 'success');
            
            // Actualizar visualización de información de sesión
            const sessionInfo = this.sessionManager.getSessionInfo();
            if (sessionInfo) {
                this.updateSessionDuration(sessionInfo);
            }
        } else {
            this.showMessage('No se pudo extender la sesión', 'error');
        }
    }

    /**
     * Maneja el clic en el botón de logout
     * @param {Event} event - Evento del clic
     */
    handleLogoutClick(event) {
        event.preventDefault();
        
        // Limpiar sesión usando SessionManager
        this.sessionManager.clearSession();
        this.stopSessionInfoUpdates();
        
        this.showMessage('Cerrando sesión...', 'info');
        
        // Redirigir a la página de login después de un breve retraso
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    /**
     * Maneja el clic en el enlace de volver al login
     * @param {Event} event - Evento del clic
     */
    handleBackToLogin(event) {
        // Limpiar sesión al volver al login
        this.sessionManager.clearSession();
        this.stopSessionInfoUpdates();
    }

    /**
     * Muestra un mensaje temporal en la página
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje (info, success, error)
     */
    showMessage(message, type = 'info') {
        // Crear o actualizar elemento de mensaje temporal
        let messageElement = document.getElementById('temp-message');
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'temp-message';
            messageElement.setAttribute('data-testid', 'temp-message');
            messageElement.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
            `;
            document.body.appendChild(messageElement);
        }

        // Establecer mensaje y estilo basado en el tipo
        messageElement.textContent = message;
        
        switch (type) {
            case 'success':
                messageElement.style.backgroundColor = '#38a169';
                break;
            case 'error':
                messageElement.style.backgroundColor = '#e53e3e';
                break;
            case 'info':
            default:
                messageElement.style.backgroundColor = '#3182ce';
                break;
        }

        // Remover mensaje después de 3 segundos
        setTimeout(() => {
            if (messageElement && messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 3000);
    }
}

// Inicializar la página de éxito cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    window.successPage = new SuccessPage();
});

// Añadir animación CSS para mensajes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Incluir clase SessionManager (igual que en login.js)
/**
 * Clase para gestionar las sesiones de usuario (duplicada desde login.js)
 * Controla la creación, validación y limpieza de sesiones
 */
class SessionManager {
    constructor() {
        this.sessionKey = 'loginSession'; // Clave para almacenar la sesión en sessionStorage
        this.maxSessionDuration = 30 * 60 * 1000; // Duración máxima de sesión: 30 minutos en milisegundos
        this.warningTime = 5 * 60 * 1000; // Tiempo de advertencia: 5 minutos antes de expirar
        this.checkInterval = null; // Intervalo para verificar el estado de la sesión
        this.warningShown = false; // Bandera para controlar si ya se mostró la advertencia
    }

    /**
     * Crea una nueva sesión de usuario
     * @param {string} username - Nombre de usuario
     * @returns {Object} Datos de la sesión creada
     */
    createSession(username) {
        const sessionData = {
            username: username,
            loginTime: new Date().toISOString(),
            sessionId: this.generateSessionId(),
            lastActivity: new Date().toISOString(),
            isActive: true,
            loginCount: this.getLoginCount(username) + 1
        };

        sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        
        // Almacenar elementos individuales para compatibilidad hacia atrás
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('loginTime', sessionData.loginTime);
        sessionStorage.setItem('sessionId', sessionData.sessionId);
        
        this.startSessionMonitoring();
        return sessionData;
    }

    /**
     * Obtiene los datos de la sesión actual
     * @returns {Object|null} Datos de la sesión o null si no existe
     */
    getSession() {
        try {
            const sessionData = sessionStorage.getItem(this.sessionKey);
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (error) {
            console.warn('Error al analizar los datos de sesión:', error);
            this.clearSession();
            return null;
        }
    }

    /**
     * Actualiza la marca de tiempo de la última actividad del usuario
     */
    updateActivity() {
        const session = this.getSession();
        if (session && session.isActive) {
            session.lastActivity = new Date().toISOString();
            sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
            this.warningShown = false; // Reiniciar advertencia si el usuario está activo
        }
    }

    /**
     * Verifica si la sesión actual es válida
     * @returns {boolean} True si la sesión es válida, false en caso contrario
     */
    isSessionValid() {
        const session = this.getSession();
        if (!session || !session.isActive) {
            return false;
        }

        const now = new Date().getTime();
        const loginTime = new Date(session.loginTime).getTime();
        const sessionAge = now - loginTime;

        return sessionAge < this.maxSessionDuration;
    }

    /**
     * Calcula el tiempo restante de la sesión
     * @returns {number} Tiempo restante en milisegundos
     */
    getSessionTimeRemaining() {
        const session = this.getSession();
        if (!session) return 0;

        const now = new Date().getTime();
        const loginTime = new Date(session.loginTime).getTime();
        const sessionAge = now - loginTime;
        
        return Math.max(0, this.maxSessionDuration - sessionAge);
    }

    /**
     * Extiende la duración de la sesión actual
     * @returns {boolean} True si se extendió exitosamente, false en caso contrario
     */
    extendSession() {
        const session = this.getSession();
        if (session) {
            session.loginTime = new Date().toISOString();
            session.lastActivity = new Date().toISOString();
            sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
            sessionStorage.setItem('loginTime', session.loginTime);
            this.warningShown = false;
            return true;
        }
        return false;
    }

    /**
     * Limpia todos los datos de sesión
     */
    clearSession() {
        // Limpiar todos los datos relacionados con la sesión
        sessionStorage.removeItem(this.sessionKey);
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('sessionId');
        sessionStorage.removeItem('loginTime');
        
        this.stopSessionMonitoring();
    }

    /**
     * Genera un ID único para la sesión
     * @returns {string} ID de sesión único
     */
    generateSessionId() {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 11);
        return `SESSION-${timestamp}-${randomPart}`.toUpperCase();
    }

    /**
     * Obtiene el número de veces que un usuario ha iniciado sesión
     * @param {string} username - Nombre de usuario
     * @returns {number} Número de inicios de sesión
     */
    getLoginCount(username) {
        const key = `loginCount_${username}`;
        return parseInt(localStorage.getItem(key) || '0', 10);
    }

    /**
     * Incrementa el contador de inicios de sesión para un usuario
     * @param {string} username - Nombre de usuario
     * @returns {number} Nuevo número de inicios de sesión
     */
    incrementLoginCount(username) {
        const key = `loginCount_${username}`;
        const count = this.getLoginCount(username) + 1;
        localStorage.setItem(key, count.toString());
        return count;
    }

    /**
     * Inicia el monitoreo automático de la sesión
     * Verifica periódicamente si la sesión sigue siendo válida
     */
    startSessionMonitoring() {
        this.stopSessionMonitoring(); // Limpiar cualquier intervalo existente
        
        this.checkInterval = setInterval(() => {
            if (!this.isSessionValid()) {
                this.handleSessionExpiry();
                return;
            }

            const timeRemaining = this.getSessionTimeRemaining();
            if (timeRemaining <= this.warningTime && !this.warningShown) {
                this.showSessionWarning(timeRemaining);
            }
        }, 60000); // Verificar cada minuto
    }

    /**
     * Detiene el monitoreo de la sesión
     */
    stopSessionMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * Maneja la expiración de la sesión
     */
    handleSessionExpiry() {
        this.clearSession();
        
        // Redirigir al login si está en la página de éxito
        if (window.location.pathname.includes('success.html')) {
            setTimeout(() => {
                window.location.href = 'index.html?expired=true';
            }, 2000);
        }
    }

    /**
     * Muestra una advertencia de expiración próxima de sesión
     * @param {number} timeRemaining - Tiempo restante en milisegundos
     */
    showSessionWarning(timeRemaining) {
        this.warningShown = true;
        const minutes = Math.ceil(timeRemaining / 60000);
        
        const message = `Su sesión expirará en ${minutes} minuto${minutes !== 1 ? 's' : ''}. ¿Desea extenderla?`;
        
        if (confirm(message)) {
            this.extendSession();
            // Mostrar mensaje de éxito si existe la instancia de SuccessPage
            if (typeof window !== 'undefined' && window.successPage) {
                window.successPage.showMessage('Sesión extendida exitosamente', 'success');
            }
        }
    }

    /**
     * Obtiene información completa de la sesión actual
     * @returns {Object|null} Información de la sesión o null si no existe
     */
    getSessionInfo() {
        const session = this.getSession();
        if (!session) return null;

        return {
            username: session.username,
            loginTime: session.loginTime,
            sessionId: session.sessionId,
            lastActivity: session.lastActivity,
            timeRemaining: this.getSessionTimeRemaining(),
            isValid: this.isSessionValid(),
            loginCount: session.loginCount
        };
    }
}