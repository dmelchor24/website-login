/**
 * Sistema de Login JavaScript
 * Maneja la validación de formularios, lógica de autenticación e interacciones del usuario
 */

// Credenciales predefinidas para pruebas
const TEST_CREDENTIALS = {
    'testuser': 'testpass123PQ',
    'admin': 'admin123PQ',
    'demo': 'demo123PQ'
};

/**
 * Clase para gestionar las sesiones de usuario
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

        // Guardar datos de sesión en sessionStorage
        sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
        
        // Almacenar elementos individuales para compatibilidad hacia atrás
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('loginTime', sessionData.loginTime);
        sessionStorage.setItem('sessionId', sessionData.sessionId);
        
        // Iniciar monitoreo de la sesión
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
        
        // Mostrar mensaje de expiración
        if (typeof window !== 'undefined' && window.loginSystem) {
            window.loginSystem.showStatus('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', 'error');
        }
        
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
        
        if (typeof window !== 'undefined' && window.loginSystem) {
            const message = `Su sesión expirará en ${minutes} minuto${minutes !== 1 ? 's' : ''}. ¿Desea extenderla?`;
            
            if (confirm(message)) {
                this.extendSession();
                window.loginSystem.showStatus('Sesión extendida exitosamente', 'success');
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

/**
 * Clase principal del sistema de autenticación
 * Maneja la interfaz de usuario, validación de formularios y proceso de login
 */
class LoginSystem {
    constructor() {
        // Referencias a elementos del DOM
        this.form = null;
        this.usernameInput = null;
        this.passwordInput = null;
        this.loginButton = null;
        this.clearButton = null;
        this.statusMessage = null;
        this.usernameError = null;
        this.passwordError = null;
        
        // Estado del sistema
        this.isSubmitting = false; // Bandera para prevenir envíos múltiples
        this.sessionManager = new SessionManager(); // Gestor de sesiones
        
        this.init(); // Inicializar el sistema
    }

    /**
     * Inicializa el sistema de login
     * Configura elementos del DOM, eventos y validaciones
     */
    init() {
        this.bindElements(); // Vincular elementos del DOM
        this.setupEventListeners(); // Configurar eventos
        this.setupFormValidation(); // Configurar validaciones
        this.handleReturnUser(); // Manejar usuarios que regresan
    }

    /**
     * Vincula las referencias a los elementos del DOM
     */
    bindElements() {
        this.form = document.getElementById('login-form');
        this.usernameInput = document.getElementById('username-input');
        this.passwordInput = document.getElementById('password-input');
        this.loginButton = document.getElementById('login-button');
        this.clearButton = document.getElementById('clear-button');
        this.statusMessage = document.getElementById('login-status');
        this.usernameError = document.getElementById('username-error');
        this.passwordError = document.getElementById('password-error');
    }

    /**
     * Configura todos los event listeners del formulario
     */
    setupEventListeners() {
        // Evento de envío del formulario
        if (this.form) {
            this.form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        // Evento del botón limpiar
        if (this.clearButton) {
            this.clearButton.addEventListener('click', this.handleClear.bind(this));
        }

        // Eventos de entrada de texto para el usuario
        if (this.usernameInput) {
            this.usernameInput.addEventListener('input', this.handleUsernameInput.bind(this));
            this.usernameInput.addEventListener('blur', this.validateUsername.bind(this));
        }

        // Eventos de entrada de texto para la contraseña
        if (this.passwordInput) {
            this.passwordInput.addEventListener('input', this.handlePasswordInput.bind(this));
            this.passwordInput.addEventListener('blur', this.validatePassword.bind(this));
        }

        // Manejar tecla Enter en los campos del formulario
        [this.usernameInput, this.passwordInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.handleSubmit(e);
                    }
                });
            }
        });

        // Configurar navegación por teclado y accesibilidad
        this.setupKeyboardNavigation();
        this.setupPasswordToggle();
        this.setupAccessibilityFeatures();
    }

    /**
     * Configura las validaciones iniciales del formulario
     */
    setupFormValidation() {
        // Limpiar cualquier estado de validación existente
        this.clearValidationErrors();
    }

    /**
     * Limpia la sesión anterior cuando se regresa al login
     */
    clearPreviousSession() {
        // Limpiar cualquier dato de sesión existente al regresar al login
        this.sessionManager.clearSession();
    }

    /**
     * Maneja usuarios que regresan (con sesión expirada o activa)
     */
    handleReturnUser() {
        // Verificar si el usuario regresa de una sesión expirada
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('expired') === 'true') {
            this.showStatus('Su sesión anterior ha expirado. Por favor, inicie sesión nuevamente.', 'error');
            // Limpiar la URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Verificar si hay una sesión válida existente
        const session = this.sessionManager.getSession();
        if (session && this.sessionManager.isSessionValid()) {
            const timeRemaining = this.sessionManager.getSessionTimeRemaining();
            const minutes = Math.ceil(timeRemaining / 60000);
            
            this.showStatus(`Sesión activa encontrada. Tiempo restante: ${minutes} minutos`, 'info');
            
            // Ofrecer continuar con la sesión existente
            setTimeout(() => {
                if (confirm('¿Desea continuar con su sesión existente?')) {
                    window.location.href = `success.html?user=${encodeURIComponent(session.username)}`;
                } else {
                    this.clearPreviousSession();
                }
            }, 2000);
        } else if (session) {
            // La sesión existe pero no es válida
            this.clearPreviousSession();
            this.showStatus('Sesión anterior expirada. Inicie sesión nuevamente.', 'error');
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) {
            return;
        }

        const username = this.usernameInput?.value?.trim() || '';
        const password = this.passwordInput?.value || '';

        // Validate form
        const isValid = this.validateForm(username, password);
        
        if (!isValid) {
            this.showStatus('Por favor, corrija los errores en el formulario', 'error');
            return;
        }

        this.performAuthentication(username, password);
    }

    validateForm(username, password) {
        let isValid = true;

        // Validate username
        if (!this.validateUsername(username)) {
            isValid = false;
        }

        // Validate password
        if (!this.validatePassword(password)) {
            isValid = false;
        }

        return isValid;
    }

    validateUsername(username = null) {
        const value = username !== null ? username : this.usernameInput?.value?.trim() || '';
        
        this.clearFieldError('username');

        if (!value) {
            this.showFieldError('username', 'El usuario es requerido');
            return false;
        }

        if (value.length < 3) {
            this.showFieldError('username', 'El usuario debe tener al menos 3 caracteres');
            return false;
        }

        if (value.length > 50) {
            this.showFieldError('username', 'El usuario no puede tener más de 50 caracteres');
            return false;
        }

        return true;
    }

    validatePassword(password = null) {
        const value = password !== null ? password : this.passwordInput?.value || '';
        
        this.clearFieldError('password');

        if (!value) {
            this.showFieldError('password', 'La contraseña es requerida');
            return false;
        }

        if (value.length < 6) {
            this.showFieldError('password', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        if (value.length > 100) {
            this.showFieldError('password', 'La contraseña no puede tener más de 100 caracteres');
            return false;
        }

        // Verificar que no sea solo espacios
        if (value.trim().length === 0) {
            this.showFieldError('password', 'La contraseña no puede estar vacía o contener solo espacios');
            return false;
        }

        return true;
    }

    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        const inputElement = document.getElementById(`${fieldName}-input`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        if (inputElement) {
            inputElement.classList.add('error');
            inputElement.setAttribute('aria-invalid', 'true');
        }
    }

    clearFieldError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        const inputElement = document.getElementById(`${fieldName}-input`);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        if (inputElement) {
            inputElement.classList.remove('error');
            inputElement.setAttribute('aria-invalid', 'false');
        }
    }

    clearValidationErrors() {
        this.clearFieldError('username');
        this.clearFieldError('password');
        this.clearStatus();
    }

    handleUsernameInput(event) {
        // Clear error when user starts typing
        this.clearFieldError('username');
    }

    handlePasswordInput(event) {
        // Clear error when user starts typing
        this.clearFieldError('password');
    }

    handleClear(event) {
        event.preventDefault();
        
        // Clear form fields
        if (this.usernameInput) {
            this.usernameInput.value = '';
        }
        if (this.passwordInput) {
            this.passwordInput.value = '';
        }

        // Clear validation errors
        this.clearValidationErrors();

        // Focus on username field
        if (this.usernameInput) {
            this.usernameInput.focus();
        }

        this.showStatus('Formulario limpiado', 'success');
        
        // Clear status message after 2 seconds
        setTimeout(() => {
            this.clearStatus();
        }, 2000);
    }

    performAuthentication(username, password) {
        this.setSubmittingState(true);
        this.showStatus('Verificando credenciales...', 'info');

        // Simulate network delay
        setTimeout(() => {
            const authResult = this.authenticate(username, password);
            this.handleAuthenticationResult(authResult, username);
        }, 1000);
    }

    authenticate(username, password) {
        // Check against predefined test credentials
        if (TEST_CREDENTIALS.hasOwnProperty(username)) {
            if (TEST_CREDENTIALS[username] === password) {
                return {
                    success: true,
                    message: 'Autenticación exitosa',
                    username: username,
                    redirectUrl: 'success.html'
                };
            } else {
                return {
                    success: false,
                    message: 'Contraseña incorrecta',
                    errorType: 'invalid_password'
                };
            }
        } else {
            return {
                success: false,
                message: 'Usuario no encontrado',
                errorType: 'invalid_username'
            };
        }
    }

    handleAuthenticationResult(result, username) {
        this.setSubmittingState(false);

        if (result.success) {
            this.handleSuccessfulLogin(result, username);
        } else {
            this.handleFailedLogin(result);
        }
    }

    handleSuccessfulLogin(result, username) {
        // Create session with enhanced management
        const sessionData = this.sessionManager.createSession(username);
        
        // Increment login count
        this.sessionManager.incrementLoginCount(username);

        this.showStatus(result.message, 'success');

        // Show session info
        setTimeout(() => {
            this.showStatus(`Sesión creada. Redirigiendo...`, 'info');
        }, 1000);

        // Simplified and more reliable redirect
        setTimeout(() => {
            const redirectUrl = result.redirectUrl || 'success.html';
            const fullUrl = redirectUrl + '?user=' + encodeURIComponent(username);
            
            console.log('Redirigiendo a:', fullUrl);
            
            // Direct redirect - most reliable method
            window.location.href = fullUrl;
        }, 2000);
    }

    handleFailedLogin(result) {
        this.showStatus(result.message, 'error');

        // Provide specific field feedback based on error type
        if (result.errorType === 'invalid_username') {
            this.showFieldError('username', 'Este usuario no existe');
            if (this.usernameInput) {
                this.usernameInput.focus();
            }
        } else if (result.errorType === 'invalid_password') {
            this.showFieldError('password', 'Contraseña incorrecta');
            if (this.passwordInput) {
                this.passwordInput.value = '';
                this.passwordInput.focus();
            }
        }

        // Clear password field for security
        if (this.passwordInput) {
            this.passwordInput.value = '';
        }
    }

    setSubmittingState(isSubmitting) {
        this.isSubmitting = isSubmitting;
        
        if (this.loginButton) {
            this.loginButton.disabled = isSubmitting;
            this.loginButton.textContent = isSubmitting ? 'Verificando...' : 'Iniciar Sesión';
        }

        if (this.clearButton) {
            this.clearButton.disabled = isSubmitting;
        }

        if (this.usernameInput) {
            this.usernameInput.disabled = isSubmitting;
        }

        if (this.passwordInput) {
            this.passwordInput.disabled = isSubmitting;
        }
    }

    showStatus(message, type = 'info') {
        if (!this.statusMessage) return;

        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        this.statusMessage.style.display = 'block';
        
        // Update aria-live region
        this.statusMessage.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    }

    clearStatus() {
        if (this.statusMessage) {
            this.statusMessage.textContent = '';
            this.statusMessage.className = 'status-message';
            this.statusMessage.style.display = 'none';
        }
    }

    // Public method to get current form state (for testing)
    getFormState() {
        return {
            username: this.usernameInput?.value?.trim() || '',
            password: this.passwordInput?.value || '',
            isSubmitting: this.isSubmitting,
            hasUsernameError: this.usernameError?.textContent !== '',
            hasPasswordError: this.passwordError?.textContent !== ''
        };
    }

    // Public method to get available test credentials (for testing)
    getTestCredentials() {
        return Object.keys(TEST_CREDENTIALS);
    }

    // Session management methods
    getSessionInfo() {
        return this.sessionManager.getSessionInfo();
    }

    extendCurrentSession() {
        const extended = this.sessionManager.extendSession();
        if (extended) {
            this.showStatus('Sesión extendida exitosamente', 'success');
        } else {
            this.showStatus('No se pudo extender la sesión', 'error');
        }
        return extended;
    }

    logoutCurrentSession() {
        this.sessionManager.clearSession();
        this.showStatus('Sesión cerrada exitosamente', 'success');
        
        // Clear form
        if (this.usernameInput) this.usernameInput.value = '';
        if (this.passwordInput) this.passwordInput.value = '';
        this.clearValidationErrors();
    }

    // Keyboard navigation and accessibility methods
    setupKeyboardNavigation() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
        
        // Focus management
        this.setupFocusManagement();
        
        // Skip link functionality
        this.setupSkipLink();
    }

    setupPasswordToggle() {
        const toggleButton = document.getElementById('toggle-password');
        if (toggleButton && this.passwordInput) {
            toggleButton.addEventListener('click', this.togglePasswordVisibility.bind(this));
            toggleButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.togglePasswordVisibility();
                }
            });
        }
    }

    setupAccessibilityFeatures() {
        // Announce form changes to screen readers
        this.setupScreenReaderAnnouncements();
        
        // Enhanced focus indicators
        this.setupFocusIndicators();
        
        // High contrast mode detection
        this.detectHighContrastMode();
    }

    handleGlobalKeydown(event) {
        // Escape key - clear form
        if (event.key === 'Escape') {
            event.preventDefault();
            this.handleClear(event);
            return;
        }

        // Alt + P - toggle password visibility
        if (event.altKey && event.key.toLowerCase() === 'p') {
            event.preventDefault();
            this.togglePasswordVisibility();
            return;
        }

        // Ctrl/Cmd + Enter - submit form
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            this.handleSubmit(event);
            return;
        }
    }

    setupFocusManagement() {
        // Trap focus within form when submitting
        const focusableElements = this.getFocusableElements();
        
        if (focusableElements.length > 0) {
            // Set initial focus on first input
            focusableElements[0].focus();
            
            // Handle Tab navigation at boundaries
            focusableElements[0].addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && e.shiftKey) {
                    // Shift+Tab on first element - go to last
                    e.preventDefault();
                    focusableElements[focusableElements.length - 1].focus();
                }
            });
            
            focusableElements[focusableElements.length - 1].addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                    // Tab on last element - go to first
                    e.preventDefault();
                    focusableElements[0].focus();
                }
            });
        }
    }

    setupSkipLink() {
        const skipLink = document.getElementById('skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.focus();
                    mainContent.scrollIntoView();
                }
            });
        }
    }

    togglePasswordVisibility() {
        if (!this.passwordInput) return;
        
        const toggleButton = document.getElementById('toggle-password');
        const isPassword = this.passwordInput.type === 'password';
        
        this.passwordInput.type = isPassword ? 'text' : 'password';
        
        if (toggleButton) {
            const newLabel = isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña';
            toggleButton.setAttribute('aria-label', newLabel);
            toggleButton.innerHTML = `<span aria-hidden="true">${isPassword ? '🙈' : '👁'}</span>`;
        }
        
        // Announce change to screen readers
        this.announceToScreenReader(
            isPassword ? 'Contraseña visible' : 'Contraseña oculta'
        );
    }

    setupScreenReaderAnnouncements() {
        // Create live region for announcements
        if (!document.getElementById('sr-announcements')) {
            const announceRegion = document.createElement('div');
            announceRegion.id = 'sr-announcements';
            announceRegion.setAttribute('aria-live', 'polite');
            announceRegion.setAttribute('aria-atomic', 'true');
            announceRegion.className = 'sr-only';
            document.body.appendChild(announceRegion);
        }
    }

    /**
     * Configura indicadores de enfoque mejorados para mejor visibilidad
     * Añade y remueve clases CSS cuando los elementos reciben o pierden el foco
     */
    setupFocusIndicators() {
        // Obtener elementos que pueden recibir foco
        const focusableElements = this.getFocusableElements();
        
        focusableElements.forEach(element => {
            // Añadir clase cuando el elemento recibe foco
            element.addEventListener('focus', () => {
                element.classList.add('focused');
            });
            
            // Remover clase cuando el elemento pierde foco
            element.addEventListener('blur', () => {
                element.classList.remove('focused');
            });
        });
    }

    /**
     * Detecta y maneja el modo de alto contraste del sistema
     * Aplica estilos especiales cuando el usuario tiene activado el modo de alto contraste
     */
    detectHighContrastMode() {
        // Detectar el modo de alto contraste de Windows
        if (window.matchMedia) {
            const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
            
            const handleHighContrast = (e) => {
                document.body.classList.toggle('high-contrast', e.matches);
            };
            
            highContrastQuery.addListener(handleHighContrast);
            handleHighContrast(highContrastQuery);
        }
    }

    /**
     * Obtiene todos los elementos que pueden recibir foco en el formulario
     * @returns {Array} Lista de elementos que pueden ser enfocados
     */
    getFocusableElements() {
        const selector = 'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        return Array.from(this.form?.querySelectorAll(selector) || []);
    }

    /**
     * Anuncia mensajes a los lectores de pantalla
     * @param {string} message - Mensaje a anunciar
     */
    announceToScreenReader(message) {
        const announceRegion = document.getElementById('sr-announcements');
        if (announceRegion) {
            announceRegion.textContent = message;
            
            // Limpiar después del anuncio
            setTimeout(() => {
                announceRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Muestra un error de campo con mejoras de accesibilidad
     * @param {string} fieldName - Nombre del campo con error
     * @param {string} message - Mensaje de error a mostrar
     */
    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        const inputElement = document.getElementById(`${fieldName}-input`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        if (inputElement) {
            inputElement.classList.add('error');
            inputElement.setAttribute('aria-invalid', 'true');
            
            // Anunciar error a los lectores de pantalla
            this.announceToScreenReader(`Error en ${fieldName}: ${message}`);
        }
    }

    /**
     * Limpia el error de un campo específico
     * @param {string} fieldName - Nombre del campo a limpiar
     */
    clearFieldError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        const inputElement = document.getElementById(`${fieldName}-input`);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        if (inputElement) {
            inputElement.classList.remove('error');
            inputElement.setAttribute('aria-invalid', 'false');
        }
    }

    /**
     * Muestra mensajes de estado con mejoras de accesibilidad
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje (info, success, error, warning)
     */
    showStatus(message, type = 'info') {
        if (!this.statusMessage) return;

        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        this.statusMessage.style.display = 'block';
        
        // Actualizar región aria-live basado en la urgencia
        const ariaLive = type === 'error' ? 'assertive' : 'polite';
        this.statusMessage.setAttribute('aria-live', ariaLive);
        
        // Anunciar a los lectores de pantalla
        this.announceToScreenReader(message);
    }
}

// Inicializar el sistema de login cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    window.loginSystem = new LoginSystem();
});

// Exportar para pruebas (si está en entorno Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LoginSystem, TEST_CREDENTIALS };
}