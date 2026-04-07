# 🏫 HelpDesk Educativo: Sistema Automático de Incidencias TIC

Un sistema de gestión de incidencias informáticas (HelpDesk) diseñado específicamente para centros educativos. Es **100% gratuito**, escalable y automatizado, utilizando herramientas que los institutos ya tienen a su disposición: Google Workspace y Trello.

## ✨ Características Principales
* **Entrada simplificada:** Los profesores reportan averías mediante un sencillo Google Forms. Pueden adjuntar fotos o vídeos.
* **Panel de Control Visual (Kanban):** Gestión de tickets a través de un tablero de Trello intuitivo.
* **Auto-clasificación:** El sistema asigna automáticamente colores de urgencia (Nivel 1 a 5) a las tarjetas.
* **Asignación Automática:** Cuando un técnico mueve una tarjeta a "En curso", se le asigna automáticamente.
* **Comunicación Bidireccional:** El profesor recibe un email automático cuando su incidencia se bloquea (por falta de piezas) o se resuelve, incluyendo las notas exactas del técnico.
* **Adjuntos Nativos:** Las fotos subidas al formulario aparecen directamente en la tarjeta de Trello.
* **Estadísticas en Tiempo Real:** Generación automática de gráficos (aulas problemáticas, tipo de averías) en Google Sheets.

---

## 🛠️ Requisitos Previos
1. Una cuenta de **Google** (preferiblemente la de Google Workspace del centro).
2. Una cuenta gratuita de **Trello**.

---

## 🚀 Guía de Instalación Paso a Paso

### Paso 1: Configurar Trello (El Panel de Control)
1. Crea un nuevo tablero en Trello llamado "Incidencias TIC".
2. Crea las siguientes listas (columnas) en este orden exacto:
   * `Bandeja de entrada`
   * `En curso`
   * `Bloqueada`
   * `Resuelta`
3. Obtén tus credenciales de la API de Trello:
   * Entra en [https://trello.com/app-key](https://trello.com/app-key).
   * Copia tu **API Key**.
   * Haz clic en "Generar un token" y copia tu **Token**.
4. Obtén las IDs de tus listas de Trello:
   * Añade `.json` al final de la URL de tu tablero en el navegador y pulsa Enter.
   * Busca (Ctrl+F) los nombres de tus listas ("Bandeja de entrada", "Bloqueada", "Resuelta") y copia el código alfanumérico largo (`"id":"..."`) de cada una.

### Paso 2: Configurar Google Forms y Drive (La Entrada de Datos)
1. Crea un **Google Form** con las preguntas necesarias. Se recomiendan estas columnas clave:
   * Email de contacto (Obligatorio)
   * Ubicación / Aula
   * Título breve de la avería
   * Descripción del problema
   * Urgencia (Escala lineal del 1 al 5)
   * Archivo adjunto (Opcional)
2. **¡Muy Importante!** Ve a Google Drive, busca la carpeta donde el formulario guarda los archivos subidos, haz clic derecho -> Compartir -> y cambia el acceso a **"Cualquier persona con el enlace"**.
3. En la pestaña "Respuestas" del formulario, haz clic en **"Vincular a Sheets"** para crear la hoja de cálculo.

### Paso 3: El Cerebro (Google Apps Script)
1. Abre tu hoja de cálculo vinculada.
2. Ve a **Extensiones > Apps Script**.
3. Borra el código que haya y pega el código base del proyecto (ver sección de código más abajo).
4. Configura las variables de la parte superior del código con tus propias claves y IDs (API Key, Token, y los IDs de las 3 listas de Trello).
5. Guarda el proyecto (icono del disquete).

### Paso 4: Configurar los Disparadores (Triggers)
En Apps Script, ve al reloj de la barra izquierda (Activadores) y crea dos reglas:
1. **Para crear incidencias:**
   * Función: `enviarATrelloDesdeHoja`
   * Tipo de evento: `Al enviarse el formulario`
2. **Para notificar resoluciones y bloqueos:**
   * Función: `notificarResueltos`
   * Fuente del evento: `Según tiempo`
   * Tipo: `Basado en minutos` -> `Cada 5 minutos`

### Paso 5: Reglas Nativas de Trello (Automatización de equipo)
Dentro de Trello, ve a **Automatización (Rayo) > Reglas**:
1. **Auto-asignación:** `When a card is moved into list [En curso] by anyone` -> `join the card`.
2. **Aviso de Bloqueo:** `When a card is moved into list [Bloqueada] by anyone` -> `post comment "¡Atención! @{username}, por favor, añade un comentario explicando el motivo del bloqueo."`
3. **Aviso de Resolución:** `When a card is moved into list [Resuelta] by anyone` -> `post comment "¡Buen trabajo @{username}! Deja un comentario rápido explicando cómo lo has solucionado."`

---

## 👨‍💻 Código para Apps Script
Dentro del archivo `GestorIncidencias.gs`.
    }
  }
}
