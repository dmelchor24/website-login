# 🚀 Sistema de Login Web con QA Automation y CI usando Robot Framework

Proyecto de **automatización de pruebas E2E** para un sistema de login web, integrando **Robot Framework**, **GitHub Actions (CI)** y **publicación automática de reportes en GitHub Pages**.

![Robot Framework Tests](https://github.com/dmelchor24/website-login/actions/workflows/robot-tests.yaml/badge.svg)

📊 **Reporte de la última ejecución (GitHub Pages)**  
👉 https://dmelchor24.github.io/website-login

🌐 **Demo en vivo de la aplicación**  
👉 https://website-login-test.netlify.app

---

## 🧪 Tecnologías utilizadas

- Robot Framework
- SeleniumLibrary
- Python 3.11
- Netlify
- GitHub Actions (CI)
- GitHub Pages (publicación de reportes)
- Chrome (headless / visual)
- HTML, CSS, JavaScript (aplicación bajo prueba)

---

## ⚙️ ¿Qué hace este proyecto?

✔ Simula un sistema real de login/logout  
✔ Ejecuta pruebas automatizadas E2E con Robot Framework  
✔ Corre automáticamente en cada `push` o `pull request`  
✔ Genera reportes HTML detallados (report, log, output)  
✔ Publica resultados automáticamente en GitHub Pages   
✔ Soporta ejecución **local y CI** con `BASE_URL` dinámica  
✔ Diferencia ejecución **headless vs visual**  

---

## 🧩 Arquitectura de la solución

El flujo de la solución está diseñado para simular un entorno real de CI/CD:

1. El desarrollador realiza un push al repositorio.
2. Netlify despliega automáticamente la aplicación web.
3. GitHub Actions ejecuta el pipeline de CI.
4. Robot Framework ejecuta las pruebas E2E.
5. Los reportes de ejecución se publican en GitHub Pages.

![Diagrama](diagrama\DiagramaCI.png)

---

## 📁 Estructura del Proyecto

```
├── index.html                      # Página principal de login
├── success.html                    # Página de éxito después del login
├── assets/                         # Recursos estáticos
│   └── icons/                      # Iconos del proyecto
│       └── iconoIndex.png          # Icono principal
├── css/
│   └── styles.css                  # Estilos CSS completos
├── js/
│   ├── login.js                    # Lógica de autenticación y validación
│   └── success.js                  # Funcionalidad de la página de éxito
├── tests/
│   └── login.robot                 # Casos de prueba principales
├── elementos/
│   └── elementos.robot             # Definición de elementos web
├── variables/
│   └── variables.robot             # Variables de configuración
├── resources/
│   └── common.robot                # Keywords reutilizables
├── scripts/
│   └── execute-tests.py            # Script de ejecución de pruebas
├── results/                        # Resultados de ejecuciones para ambiente local
├── docs/                           # Reportes para GitHub Pages
├── .github/
│   └── workflows/
│       └── robot-tests.yaml        # Configuración CI/CD
├── requirements.txt                # Dependencias Python
├── .gitignore                      # Archivos a ignorar por Git
└── README.md                       # Archivo de explicación del proyecto
```
---

## 🔐 Credenciales de Prueba

El sistema incluye las siguientes credenciales predefinidas para pruebas:

| Usuario    | Contraseña      | Descripción       |
|------------|-----------------|-------------------|
| `testuser` | `testpass123PQ` | Usuario estándar  |
| `admin`    | `admin123PQ`    | Usuario admin     |
| `demo`     | `demo123PQ`     | Usuario demo      |

---

## 🛠️ Instalación y uso local

```bash
git clone https://github.com/dmelchor24/website-login.git
cd website-login
pip install -r requirements.txt
python -m http.server 5500
```
**Acceder a la aplicación:**
   - Abrir `http://localhost:5500` en el navegador
   - O usar la demo en vivo: https://website-login-test.netlify.app

---

## 🧪 Pruebas con Robot Framework

### Ejecutar Pruebas Localmente

```bash
# Ejecutar todas las pruebas
python scripts/execute-tests.py

# Ejecutar con URL personalizada
python scripts/execute-tests.py --base-url=http://localhost:5500

# Ejecutar directamente con Robot Framework
robot --outputdir results tests/
```
---

### Estructura de Pruebas

El proyecto utiliza una arquitectura modular para las pruebas:

- **`tests/login.robot`**: Casos de prueba principales
- **`elementos/elementos.robot`**: Definición de selectores web
- **`variables/variables.robot`**: Variables de configuración
- **`resources/common.robot`**: Keywords reutilizables

---

## 🔧 Configuración

### Personalizar Credenciales
Editar el archivo `js/login.js` para agregar nuevas credenciales:

```javascript
const TEST_CREDENTIALS = {
    'testuser': 'testpass123PQ',
    'tu_usuario': 'tu_contraseña'
};
```

---

## 🤖 CI / CD

- CI completo con GitHub Actions
- CD parcial para publicación de reportes
- Preparado para despliegue automático futuro

---

**Nota**: Este sistema está diseñado específicamente para pruebas y desarrollo. No usar en producción sin las medidas de seguridad apropiadas.

---

flowchart LR
    Dev[👨‍💻 Developer<br/>Push al repositorio]
    GitHub[🐙 GitHub Repository]
    Netlify[🚀 Netlify<br/>Deploy Web App]
    Actions[🤖 GitHub Actions<br/>CI Pipeline]
    Robot[🧪 Robot Framework<br/>E2E Tests]
    Pages[📊 GitHub Pages<br/>Test Reports]

    Dev --> GitHub
    GitHub --> Netlify
    GitHub --> Actions
    Actions --> Robot
    Robot --> Pages
