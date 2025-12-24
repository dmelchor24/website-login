# Sistema de Login Web para Pruebas con Robot Framework

Un sistema de login web completo desarrollado específicamente para pruebas automatizadas con Robot Framework. Incluye autenticación, gestión de sesiones, validación de formularios y características de accesibilidad.

## 🚀 Características

- **Autenticación Completa**: Sistema de login con credenciales predefinidas
- **Gestión de Sesiones**: Control automático de sesiones con expiración y extensión
- **Validación de Formularios**: Validación en tiempo real con mensajes de error
- **Accesibilidad**: Soporte completo para lectores de pantalla y navegación por teclado
- **Diseño Responsivo**: Compatible con dispositivos móviles y de escritorio
- **Pruebas Automatizadas**: Optimizado para Robot Framework con selectores únicos
- **Interfaz en Español**: Toda la interfaz y mensajes en español

## 📁 Estructura del Proyecto

```
├── index.html              # Página principal de login
├── success.html            # Página de éxito después del login
├── assets/                 # Recursos estáticos
│   ├── icons/             # Iconos del proyecto
│   │   ├── favicon.ico    # Icono del navegador
│   │   ├── login-icon.svg # Icono de login
│   │   ├── success-icon.svg # Icono de éxito
│   │   ├── user-icon.svg  # Icono de usuario
│   │   └── logout-icon.svg # Icono de logout
│   ├── images/            # Imágenes adicionales
│   │   ├── logo.png       # Logo del proyecto
│   │   └── background.jpg # Imagen de fondo (opcional)
│   └── fonts/             # Fuentes personalizadas (opcional)
├── css/
│   └── styles.css          # Estilos CSS completos
├── js/
│   ├── login.js           # Lógica de autenticación y validación
│   └── success.js         # Funcionalidad de la página de éxito
├── .gitignore             # Archivos a ignorar por Git
└── README.md              # Este archivo
```

## 🔐 Credenciales de Prueba

El sistema incluye las siguientes credenciales predefinidas para pruebas:

| Usuario    | Contraseña   | Descripción           |
|------------|-------------|-----------------------|
| `testuser` | `testpass123`| Usuario de prueba     |
| `admin`    | `admin123`   | Usuario administrador |
| `demo`     | `demo123`    | Usuario de demostración |

## 🛠️ Instalación y Uso

### Requisitos Previos
- Navegador web moderno
- Servidor web local (opcional, puede ejecutarse directamente desde archivos)

### Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/sistema-login-web.git
   cd sistema-login-web
   ```

2. **Estructura de archivos:**
   - Asegurar que la estructura de carpetas sea correcta
   - Los iconos deben estar en `assets/icons/`
   - Las imágenes adicionales en `assets/images/`

3. **Ejecutar localmente:**
   - **Opción 1**: Abrir `index.html` directamente en el navegador
   - **Opción 2**: Usar un servidor web local:
     ```bash
     # Con Python 3
     python -m http.server 8000
     
     # Con Node.js (http-server)
     npx http-server
     
     # Con PHP
     php -S localhost:8000
     ```

4. **Acceder a la aplicación:**
   - Abrir `http://localhost:8000` en el navegador
   - O abrir `index.html` directamente

## 🧪 Pruebas con Robot Framework

### Elementos de Prueba

Todos los elementos incluyen atributos `data-testid` únicos para facilitar las pruebas:

#### Página de Login (`index.html`)
- `username-input`: Campo de usuario
- `password-input`: Campo de contraseña
- `login-button`: Botón de iniciar sesión
- `clear-button`: Botón de limpiar formulario
- `login-status`: Mensaje de estado

#### Página de Éxito (`success.html`)
- `username-value`: Nombre de usuario mostrado
- `session-value`: ID de sesión
- `logout-button`: Botón de cerrar sesión
- `dashboard-button`: Botón de dashboard
- `profile-button`: Botón de perfil

### Ejemplo de Prueba Robot Framework

```robot
*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}              http://localhost:8000
${BROWSER}          Chrome
${USERNAME}         testuser
${PASSWORD}         testpass123

*** Test Cases ***
Login Exitoso
    Open Browser    ${URL}    ${BROWSER}
    Input Text      css:[data-testid="username-input"]    ${USERNAME}
    Input Text      css:[data-testid="password-input"]    ${PASSWORD}
    Click Button    css:[data-testid="login-button"]
    Wait Until Page Contains Element    css:[data-testid="success-container"]
    Element Should Contain    css:[data-testid="username-value"]    ${USERNAME}
    Close Browser

Login Fallido
    Open Browser    ${URL}    ${BROWSER}
    Input Text      css:[data-testid="username-input"]    usuario_invalido
    Input Text      css:[data-testid="password-input"]    contraseña_invalida
    Click Button    css:[data-testid="login-button"]
    Wait Until Element Is Visible    css:[data-testid="login-status"]
    Element Should Contain    css:[data-testid="login-status"]    Usuario no encontrado
    Close Browser
```

## 🎨 Características Técnicas
### Validación de Formularios
- Validación en tiempo real
- Prevención de envíos múltiples
- Limpieza automática de errores

### Gestión de Sesiones
- Duración configurable (30 minutos por defecto)
- Advertencias de expiración
- Extensión de sesión
- Limpieza automática al cerrar

### Accesibilidad
- Soporte para lectores de pantalla
- Navegación completa por teclado
- Indicadores de enfoque mejorados
- Modo de alto contraste
- Atajos de teclado:
  - `Escape`: Limpiar formulario
  - `Alt + P`: Alternar visibilidad de contraseña
  - `Ctrl/Cmd + Enter`: Enviar formulario

### Diseño Responsivo
- Compatible con móviles (320px+)
- Tablets (768px+)
- Escritorio (1024px+)
- Soporte para impresión

## 🔧 Configuración

### Personalizar Credenciales
Editar el archivo `js/login.js`:

```javascript
const TEST_CREDENTIALS = {
    'tu_usuario': 'tu_contraseña',
    'otro_usuario': 'otra_contraseña'
};
```

### Uso de Assets
Para usar los iconos y recursos en tu HTML:

```html
<!-- Favicon -->
<link rel="icon" href="assets/icons/favicon.ico">

<!-- Iconos en HTML -->
<img src="assets/icons/login-icon.svg" alt="Login" class="login-icon">
<img src="assets/icons/user-icon.svg" alt="Usuario" class="user-icon">

<!-- Logo -->
<img src="assets/images/logo.png" alt="Logo" class="logo">
```

En CSS:
```css
/* Usar iconos como background */
.login-icon {
    background-image: url('../assets/icons/login-icon.svg');
    background-size: contain;
    background-repeat: no-repeat;
}

/* Logo de fondo */
.header-logo {
    background-image: url('../assets/images/logo.png');
}
```

### Configurar Duración de Sesión
En `js/login.js` y `js/success.js`:

```javascript
this.maxSessionDuration = 30 * 60 * 1000; // 30 minutos
this.warningTime = 5 * 60 * 1000; // Advertencia a los 5 minutos
```

## 📱 Compatibilidad

### Navegadores Soportados
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Características Modernas
- CSS Grid y Flexbox
- ES6+ JavaScript
- Local/Session Storage
- Media Queries avanzadas

## 🐛 Solución de Problemas

### Problemas Comunes

1. **La página no carga correctamente**
   - Verificar que todos los archivos estén en la estructura correcta
   - Comprobar la consola del navegador para errores
   - Asegurar que la carpeta `assets/` esté presente

2. **Los iconos no se muestran**
   - Verificar que los archivos estén en `assets/icons/`
   - Comprobar las rutas en HTML y CSS
   - Verificar permisos de archivos

3. **Las credenciales no funcionan**
   - Verificar que se estén usando las credenciales exactas
   - Revisar mayúsculas y minúsculas

4. **Problemas con Robot Framework**
   - Asegurar que los selectores `data-testid` estén correctos
   - Verificar que la página esté completamente cargada antes de interactuar

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autor

- **Tu Nombre** - *Desarrollo inicial* - [tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Robot Framework community
- Selenium WebDriver
---

**Nota**: Este sistema está diseñado específicamente para pruebas y desarrollo. No usar en producción sin las medidas de seguridad apropiadas.