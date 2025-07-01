// ==============================
// 🎯 REFERENCIAS DEL DOM
// ==============================
const chatButton = document.getElementById("chat-button");
const chatBox = document.getElementById("chat-box");
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const themeToggle = document.getElementById("theme-toggle");
const closeChatBtn = document.getElementById("close-chat-btn");
const polibotStatus = document.getElementById("polibot-status");
const copyNotification = document.getElementById("copy-notification");
// Referencias para las animaciones faciales
const polibotOjos = document.getElementById('polibotOjos');
const polibotBoca = document.getElementById('polibotBoca');


// ======================================================
// ✨ CORRECCIÓN #1: ACTIVAR LA EXTENSIÓN DE KATEX ✨
// ======================================================
if (window.markedKatex) {
  marked.use(markedKatex({
    throwOnError: false
  }));
}

// ==============================
// 🔊 EFECTOS DE SONIDO
// ==============================
const sendSound = new Audio("sounds/Short_Text_Send.mp3");
const receiveSound = new Audio("sounds/New_Notification.mp3");

// ==============================
// ✨ ANIMACIONES FACIALES
// ==============================
let parpadeoInterval;
function iniciarAnimaciones() {
    // Asegurarse de que los elementos existan antes de configurar el intervalo
    if (!polibotOjos || !polibotBoca) return;
    
    parpadeoInterval = setInterval(() => {
        polibotOjos.src = 'images/ojos-cerrados.png';
        setTimeout(() => { polibotOjos.src = 'images/ojos-abiertos.png'; }, 150);
    }, 2000 + Math.random() * 4000);
}

function controlarBoca(hablando) {
    if (!polibotBoca) return;
    if (hablando) { polibotBoca.src = 'images/boca-hablando.png'; }
    else { polibotBoca.src = 'images/boca-cerrada.png'; }
}

function mostrarSonrisa(duracion = 2000) {
    if (!polibotBoca) return;
    polibotBoca.src = 'images/boca-sonriendo.png';
    setTimeout(() => { 
        if (!speechSynthesis.speaking) { 
            polibotBoca.src = 'images/boca-cerrada.png'; 
        } 
    }, duracion);
}

// ==============================
// 📚 HISTORIAL DE CONVERSACIÓN
// ==============================
let conversationHistory = [
  {
    role: "system",
    content: "Eres el asistente virtual de la Universidad Politécnica Territorial de los Valles del Tuy (UPTVT), la universidad está ubicada en Venezuela, Estado Miranda, tu nombre es PoliBot y fuiste creado por la Dirección de Infraestructura Tecnológica, tus principales creadores son el Licenciado Cherry Esqueda el cual es Coordinador de Programación y Desarrollo, y por José Muro que es Analista de Soporte Técnico, estudiante de Ingeniería de Sistemas. Tu funcionalidad es responder dudas acerca de la universidad, limitate a repetir siempre lo mismo y ve al grano. Responde lo que te preguntan y ya, tu respuesta debe ser cerrada. Sé amable y profesional. Cuando muestres fórmulas matemáticas, SIEMPRE utiliza la sintaxis de LaTeX, encerrando las fórmulas en línea con '$' (ej: $E=mc^2$) y las fórmulas en bloque con '$$' (ej: $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$).",
  },
];

// ==============================
// ✨ RESPUESTAS PREDEFINIDAS ✨
// ==============================
const predefinedAnswers = {
  "¿cómo me inscribo?": "Para inscribirte, debes dirigirte a la sede principal por Municipio donde Residas, con los siguientes recaudos:\n\n* Cédula de Identidad (Original y Copia).\n* Título de Bachiller (Original y Copia).\n* Notas Certificadas (Original y Copia).\n\nEl proceso de inscripción para nuevos ingresos suele ser en **Marzo** y **Septiembre**. ¡Te recomendamos estar atento a nuestros anuncios oficiales!",
  "¿qué pnf ofrecen?": "¡Claro! Ofrecemos una variedad de Programas Nacionales de Formación (PNF). Nuestros PNF son:\n\n* PNF en Ingenieria Industrial\n* PNF en Ingenieria en Mantenimiento\n* PNF en Ingenieria en Materiales Industriales\n* PNF en Ingenieria en Agroalimentación\n* PNF en Ingenieria en Procesamiento y Distribucion de Alimentos (PDA)\n* PNF en Licenciatura en Contaduria Publica\n* PNF en Licenciatura en Psicologia Social\n\nPuedes ver la lista completa en nuestro sitio web.",
  "¿cuáles son los horarios?": "Los horarios varían según el PNF y la Seleccion del Participante en el momento de su Inscripcion. Generalmente, las clases se imparten en dos Modalidades:\n\n* **Modalidad Dias de Semana:** De 7:00 AM a 1:00 PM y De 1:00 PM a 5:00 PM\n* **Modalidad Fines de Semana:** De 7:00 AM a 5:00 PM\n\nLos horarios específicos se publican en las carteleras informativas de cada PNF antes de iniciar el  Trayecto y semestre.",
  "¿dónde están las sedes?": "Nuestra sede principal está ubicada en **Ocumare del Tuy, Hacienda La Guadalupe (RECTORADO)**. \n\nTambién contamos con sedes Academicas en **7 Municipios, **, donde se imparten los PNF. ¡Te esperamos!"
};


// ==============================
// ⚙️ CONFIGURACIONES
// ==============================
const config = {
  rateLimit: 15,
  typingSpeed: 50,
  maxMessageLength: 500,
  avatars: {
    user: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    polibot: 'images/polibot.jpg'
  }
};

// ==============================
// 📚 BASE DE CONOCIMIENTO LOCAL
// ==============================
const baseDeConocimiento = {
    sedes: {
        principal: "Sede Rectoral (Hacienda la Guadalupe Ocumare del tuy Municipio Tomas Lander)",
        otras: [
            "Sede Municipal Tomas Lander con (4)sedes academicas",
            "Sede MunicipalCristobal Rojas con (2)sedes academicas",
            "Sede Municipal Urdaneta con (3)sedes Academicas",
            "Sede Municipal Paz Castillo con (4)sedes academicas ",
            "Sede Municipal Simon Bolivar con (una) sede academica",
            "Sede Municipal Independencia con (5)sedes academicas",
            "Sede Municipal Sucre con (una) sede academica"
        ],
    },
    carreras: {
        pnf: [
            "PNF en Ingenieria Industrial",
            "PNF en Ingenieria en Mantenimiento",
            "PNF en Ingenieria en Materiales Industriales",
            "PNF en Ingenieria en Agroalimentación",
            "PNF en Ingenieria en Procesamiento y Distribucion de Alimentos (PDA)",
            "PNF en Licenciatura en Contaduria Publica",
            "PNF en Licenciatura en Psicologia Social"
        ],
    },
    autoridades: {
        Rectorado: "Dra. Adyanis Noguera (Rectora)",
        Consultoria_Juridica: "Dra. Lisbeth Lorena Lopez (Directora)",
        Direccion_del_Despacho: "Freddy Cabrera (Director)",
        Vicerrectorado_Academico: "Dr. Ramon Machado (Vicerrector Academico) ",
        Vicerrectorado_Territorial: "Lic. Reinaldo Oropeza (Vicerrector Territorial) ",
        Secretaria_General: "Licda. Maria Tovar (Secretaria General) ",
        Direccion_General_De_Seguimiento_y_Control: "Dra. Angelica Guaramato (Directora General)",
        Direcion_General_de_Administracion: "Dra. Scarlet Ibarra (Directora General)",
        Director_General_de_Edficaciones_Universitarias: "Dr. Piter Manrique (Director General)",
        Direccion_de_Infraestructura_Tecnologica: "Licda. Lisbeth Aponte (Directora)",
        Direccion_Municipal_sede_Urdaneta: "Lic. Fernando Hortiz (Director)",
        Direccion_Municipal_sede_Critobal_Rojas: "Lic. Armando La Rosa (Director)",
        Direccion_Municipal_sede_Paz_Castillo: "Licda.Marvi Calvo (Directora)",
        Direccion_Municipal_sede_Tomas_Lander: "Licda. Sujaira Tua (Directora)",
        Direccion_Municipal_sede_Simon_Bolivar: "Lic. Jose Catanaima (Director)",
        Direccion_Municipal_sede_Independencia: "Lic. Alexis Diaz (Director)",
        Direccion_Municipal_sede_Sucre: "Lic. Yelitze Calzadilla (Director)",
        Coordinacion_de_Programacion_y_Desarrollo: "Lic. Cherry Esqueda (Coordinador)",
    },
    requisitos: {
        inscripcion: [
            "Título de bachiller (original y copia)",
            "Notas certificadas (original y copia)",
            "Partida de nacimiento (original y copia)",
            "Cédula de identidad (copia ampliada)",
            "Fotos (2) tipo carnet",
            "Comprobante de registro en el Sistema Nacional de Ingreso (SNI)",
            "Una carpeta marrón tamaño oficio"
        ],
    }
};

function buscarEnConocimientoLocal(textoUsuario) {
    const texto = textoUsuario.toLowerCase();

    if (texto.includes("carrera") || texto.includes("pnf") || texto.includes("estudiar")) {
        let respuesta = "Ofrecemos los siguientes Programas Nacionales de Formación (PNF):<br><ul>";
        baseDeConocimiento.carreras.pnf.forEach(carrera => { respuesta += `<li>${carrera}</li>`; });
        respuesta += "</ul>";
        return respuesta;
    }

    if (texto.includes("sede") || texto.includes("ubicación") || texto.includes("dirección")) {
        let respuesta = `Nuestra sede principal es: <b>${baseDeConocimiento.sedes.principal}</b>.<br><br>Contamos con las sedes municipales academicas  en:<br><ul>`;
        baseDeConocimiento.sedes.otras.forEach(sede => { respuesta += `<li>${sede}</li>`; });
        respuesta += "</ul>";
        return respuesta;
    }

    if (texto.includes("requisito") || texto.includes("inscribirme") || texto.includes("inscripción")) {
        let respuesta = "Los requisitos para la inscripción son los siguientes:<br><ul>";
        baseDeConocimiento.requisitos.inscripcion.forEach(req => { respuesta += `<li>${req}</li>`; });
        respuesta += "</ul>";
        return respuesta;
    }

    for (const cargo in baseDeConocimiento.autoridades) {
        const cargoFormateado = cargo.replace(/_/g, " ");
        const infoAutoridad = baseDeConocimiento.autoridades[cargo];
        const regexCargo = new RegExp('\\b' + cargoFormateado + '\\b', 'i');

        if (regexCargo.test(textoUsuario)) {
            return `La persona a cargo de esa posición es: <b>${infoAutoridad}</b>.`;
        }

        const nombreCompleto = infoAutoridad.split('(')[0].trim();
        const nombreSinTitulo = nombreCompleto.replace(/^(dr|dra|dr\.|dra\.|lic|ing)\.?\s*/i, '').toLowerCase();

        if (nombreSinTitulo && texto.includes(nombreSinTitulo)) {
             return `<b>${infoAutoridad}</b> es el/la ${cargoFormateado.toLowerCase()} de la universidad.`;
        }
    }

    return null;
}

// ==============================
// 🛡 SEGURIDAD
// ==============================
let messageCount = 0;
let lastReset = Date.now();

function checkRateLimit() {
  if (Date.now() - lastReset > 60000) {
    messageCount = 0;
    lastReset = Date.now();
  }
  return ++messageCount <= config.rateLimit;
}

function sanitizeInput(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==============================
// 🎨 TEMA Y ESTADO
// ==============================
function initTheme() {
  const savedTheme = localStorage.getItem('chatTheme') || 'light';
  document.body.classList.toggle('dark-theme', savedTheme === 'dark');
  themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
  localStorage.setItem('chatTheme', theme);
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function updatePolibotStatus(status) {
  if (!polibotStatus) return;
  polibotStatus.className = 'status-indicator-text';
  polibotStatus.textContent = '';
  switch (status) {
    case 'online':
      polibotStatus.classList.add('online');
      polibotStatus.textContent = 'En línea';
      break;
    case 'offline':
      polibotStatus.classList.add('offline');
      polibotStatus.textContent = 'Offline';
      break;
    case 'connecting':
      polibotStatus.classList.add('connecting');
      polibotStatus.textContent = 'Conectando...';
      break;
    default:
      polibotStatus.classList.add('offline');
      polibotStatus.textContent = 'Desconocido';
  }
}

// ==============================
// 📱 DETECCIÓN DE MÓVIL
// ==============================
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ==============================
// 🔀 CONTROL DE VISIBILIDAD
// ==============================
let chatVisible = false;

function toggleChat(visible) {
  chatVisible = visible;
  chatButton.classList.toggle('chat-is-open', visible);

  if (visible) {
    chatBox.classList.add("show");
    chatBox.classList.remove("hidden");
    if (isMobile()) {
      chatButton.style.display = 'none';
    } 
    userInput.focus();
    removeNotificationPing();
  } else {
    chatBox.classList.remove("show");
    setTimeout(() => chatBox.classList.add("hidden"), 300);
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    if (isMobile()) {
      chatButton.style.display = 'flex';
    }
  }
}

function addNotificationPing() {
  if (!chatVisible) {
    chatButton.classList.add('notification-ping');
  }
}

function removeNotificationPing() {
  chatButton.classList.remove('notification-ping');
}

// ==============================
// 💬 ENVÍO DE MENSAJES
// ==============================
async function sendMessage() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  const userText = sanitizeInput(userInput.value.trim());
  if (!userText) return;

  if (!checkRateLimit()) {
    appendMessage("PoliBot", "⚠️ Has alcanzado el límite de mensajes. Por favor espera un momento.", false);
    return;
  }

  if (userText.length > config.maxMessageLength) {
    appendMessage("PoliBot", `Por favor, limita tu mensaje a ${config.maxMessageLength} caracteres.`, false);
    return;
  }

  appendMessage("Usuario", userText);
  sendSound.play();
  if (navigator.vibrate) navigator.vibrate(50);
  userInput.value = "";
  userInput.dispatchEvent(new Event('input'));
  userInput.disabled = true;
  sendButton.disabled = true;
  conversationHistory.push({ role: "user", content: userText });

  const lowerCaseUserText = userText.toLowerCase();
  if (predefinedAnswers[lowerCaseUserText]) {
    const botReply = predefinedAnswers[lowerCaseUserText];
    conversationHistory.push({ role: "assistant", content: botReply });
    simulateTyping("PoliBot"); 
    
    setTimeout(async () => {
      await typeMessage("PoliBot", botReply, true);
      mostrarSonrisa(); // <-- Muestra una sonrisa aquí
      userInput.disabled = false;
      userInput.focus();
    }, 600);
    return;
  }

  const respuestaLocal = buscarEnConocimientoLocal(userText);
  if (respuestaLocal) {
    conversationHistory.push({ role: "assistant", content: respuestaLocal });
    simulateTyping("PoliBot");

    setTimeout(async () => {
        await typeMessage("PoliBot", respuestaLocal, true);
        userInput.disabled = false;
        userInput.focus();
    }, 600);
    return;
  }

  simulateTyping("PoliBot");
  updatePolibotStatus('connecting');

  try {
    const response = await fetchAIResponse(userText);
    const reply = response.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: reply });
    addNotificationPing();
    
    await typeMessage("PoliBot", reply, true);
    updatePolibotStatus('online');
  } catch (error) {
    handleError(error);
  } finally {
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }
}

// =================================================================
// ✨ ESTA ES LA FUNCIÓN MODIFICADA Y SEGURA ✨
// =================================================================
async function fetchAIResponse(userText) {
  // La URL ahora apunta a nuestro propio intermediario seguro en Vercel
  // o funcionará localmente si estás probando con el Vercel CLI.
  const res = await fetch("https://polibot-upt.vercel.app/api/proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // El cuerpo de la petición es el mismo que antes, sin la API key
    body: JSON.stringify({ model: "deepseek/deepseek-chat", messages: conversationHistory.slice(-10) }),
  });

  if (!res.ok) {
    // Si hay un error, intentamos leer el mensaje de error del servidor
    const errorBody = await res.json().catch(() => ({ error: 'Error desconocido del servidor' }));
    throw new Error(`Error HTTP: ${res.status} - ${errorBody.error || res.statusText}`);
  }
  
  return await res.json();
}


function handleError(error) {
  console.error("Error:", error);
  removeTyping();
  appendMessage("PoliBot", "⚠️ Error al conectar con el servicio. Por favor intenta nuevamente.", false);
  updatePolibotStatus('offline');
}

// ==============================
// 🧩 FUNCIONES AUXILIARES
// ==============================
function copyTextToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showCopyNotification();
  }).catch(err => {
    console.error('No se pudo copiar el texto:', err);
  });
}

let copyNotificationTimeout;
function showCopyNotification() {
  if (copyNotification) {
    copyNotification.classList.add('show');
    clearTimeout(copyNotificationTimeout);
    copyNotificationTimeout = setTimeout(() => {
      copyNotification.classList.remove('show');
    }, 1500);
  }
}

function appendMessage(sender, text, isCopyable = true) {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");
  const isUser = sender.toLowerCase() === "usuario";
  const avatarSrc = isUser ? config.avatars.user : config.avatars.polibot;
  const senderClass = isUser ? "user" : "ia";
  messageContainer.classList.add(isUser ? "user" : "ia");

  const avatarDiv = document.createElement("div");
  avatarDiv.classList.add("avatar");
  const avatarImg = document.createElement("img");
  avatarImg.src = avatarSrc;
  avatarImg.alt = sender;
  avatarDiv.appendChild(avatarImg);

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", senderClass);

  if (!isUser && text.startsWith('BOTONES::')) {
    const parts = text.split('::');
    const mainText = parts[1] || '';
    const buttonsData = (parts[2] || '').split('--');
    const textElement = document.createElement('div');
    textElement.innerHTML = marked.parse(mainText);
    messageDiv.appendChild(textElement);
    const inlineButtonsContainer = document.createElement('div');
    inlineButtonsContainer.className = 'inline-buttons';
    buttonsData.forEach(buttonStr => {
      if (!buttonStr) return;
      const buttonParts = buttonStr.replace(/\[|\]/g, '').split('|');
      const btnText = buttonParts[0];
      const btnValue = buttonParts[1] || btnText;
      const button = document.createElement('button');
      button.className = 'inline-reply';
      button.textContent = btnText;
      button.onclick = () => { userInput.value = btnValue; sendMessage(); };
      inlineButtonsContainer.appendChild(button);
    });
    messageDiv.appendChild(inlineButtonsContainer);
  } else {
    if (!isUser) {
      messageDiv.innerHTML = marked.parse(text);
    } else {
      messageDiv.textContent = text;
    }
  }

  if (!isUser && isCopyable) {
    addCopyIcon(messageDiv, text);
  }

  if (isUser) {
    messageContainer.appendChild(messageDiv);
    messageContainer.appendChild(avatarDiv);
  } else {
    messageContainer.appendChild(avatarDiv);
    messageContainer.appendChild(messageDiv);
  }

  chatMessages.appendChild(messageContainer);
  scrollToBottom();
}

function simulateTyping(sender) {
  removeTyping(); 
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container", "ia");
  const avatarSrc = config.avatars.polibot;
  const avatarDiv = document.createElement("div");
  avatarDiv.classList.add("avatar");
  const avatarImg = document.createElement("img");
  avatarImg.src = avatarSrc;
  avatarImg.alt = sender;
  avatarDiv.appendChild(avatarImg);
  const div = document.createElement("div"); 
  div.classList.add("typing-indicator");
  div.innerHTML = `<strong>${sender}</strong><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>`;
  div.id = "typing";
  messageContainer.appendChild(avatarDiv);
  messageContainer.appendChild(div);
  chatMessages.appendChild(messageContainer);
  scrollToBottom();
}

function removeTyping() {
  const typingContainer = document.getElementById("typing");
  if (typingContainer) {
    typingContainer.closest('.message-container')?.remove();
  }
}

function cleanTextForSpeech(text) {
  if (!text) return "";
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = text;
  let cleanedText = tempDiv.textContent || tempDiv.innerText || "";
  const regexEmoji = /(\*\*|\*|_|`|[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
  cleanedText = cleanedText.replace(regexEmoji, '');
  cleanedText = cleanedText.replace(/\$\$|\$/g, '');
  return cleanedText.replace(/\s\s+/g, ' ').trim();
}

async function typeMessage(sender, text, isCopyable = true) {
  removeTyping();
  controlarBoca(true); // <-- Abre la boca al empezar a escribir

  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container", "ia");
  const avatarSrc = config.avatars.polibot;
  const avatarDiv = document.createElement("div");
  avatarDiv.classList.add("avatar");
  const avatarImg = document.createElement("img");
  avatarImg.src = avatarSrc;
  avatarImg.alt = sender;
  avatarDiv.appendChild(avatarImg);
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", "ia");
  const contentSpan = document.createElement("span"); 
  messageDiv.appendChild(contentSpan);
  messageContainer.appendChild(avatarDiv);
  messageContainer.appendChild(messageDiv);
  chatMessages.appendChild(messageContainer);
  scrollToBottom();
  
  const rawText = text;

  const typingPromise = new Promise(resolve => {
    let i = 0;
    const type = () => {
      if (i <= rawText.length) {
        const partialText = rawText.substring(0, i);
        contentSpan.innerHTML = marked.parse(partialText + '<span class="typing-cursor"></span>');
        i++;
        scrollToBottom();
        setTimeout(type, config.typingSpeed);
      } else {
        contentSpan.innerHTML = marked.parse(rawText);
        if (isCopyable) {
          addCopyIcon(messageDiv, rawText);
        }
        resolve();
      }
    };
    type();
  });

  const speechPromise = new Promise(resolve => {
    if ('speechSynthesis' in window) {
      const cleanedText = cleanTextForSpeech(rawText);
      if (cleanedText.length === 0) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = 'es-VE';
      utterance.onend = resolve;
      utterance.onerror = () => resolve();
      receiveSound.play();
      if (navigator.vibrate) navigator.vibrate(20);
      window.speechSynthesis.speak(utterance);
    } else {
      receiveSound.play();
      if (navigator.vibrate) navigator.vibrate(20);
      resolve();
    }
  });
  
  // Espera a que tanto la escritura como el audio terminen
  await Promise.all([typingPromise, speechPromise]);

  // Cierra la boca cuando todo ha terminado
  setTimeout(() => {
    if (!window.speechSynthesis.speaking) {
        controlarBoca(false);
    }
  }, 100);
}


function addCopyIcon(messageDiv, textToCopy) {
  const copyIcon = document.createElement("div");
  copyIcon.classList.add("copy-icon");
  copyIcon.innerHTML = '📋';
  copyIcon.title = 'Copiar texto';
  copyIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    copyTextToClipboard(textToCopy);
  });
  messageDiv.appendChild(copyIcon);
}

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ==============================
// 🎮 EVENT LISTENERS
// ==============================
function initEventListeners() {
  chatButton.addEventListener("click", () => toggleChat(!chatVisible));
  closeChatBtn.addEventListener("click", () => toggleChat(false));
  themeToggle.addEventListener("click", toggleTheme);
  sendButton.addEventListener('click', sendMessage);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatVisible) toggleChat(false);
  });
  document.addEventListener('click', (e) => {
    if (!chatBox || !chatButton) return;
    const isChatElement = chatBox.contains(e.target) || chatButton.contains(e.target);
    if (chatVisible && !isChatElement) {
        toggleChat(false);
    }
  });
  
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { 
      e.preventDefault(); 
      if (!sendButton.disabled) {
        sendMessage(); 
      }
    }
  });

  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    const newHeight = Math.min(userInput.scrollHeight, 120);
    userInput.style.height = `${newHeight}px`;
    sendButton.disabled = userInput.value.trim() === '';
  });

  userInput.addEventListener('focus', () => {
    if(isMobile()) {
      setTimeout(() => {
        chatBox.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300);
    }
  });
}

// ==============================
// 🚀 INICIALIZACIÓN
// ==============================
function init() {
  initTheme();
  initEventListeners();
  iniciarAnimaciones(); // <-- Inicia el parpadeo de PoliBot
  
  setTimeout(() => {
    const welcomeMsgWithButtons = "BOTONES::¡Hola! Soy PoliBot, tu asistente. Puedes escribir una pregunta o seleccionar una de estas opciones: ::[¿Cómo me inscribo?|¿Cómo me inscribo?]--[¿Qué PNF ofrecen?|¿Qué PNF ofrecen?]--[¿Cuáles son los horarios?|¿Cuáles son los horarios?]--[¿Dónde están las sedes?|¿Dónde están las sedes?]";
    const cleanWelcomeMsg = "¡Hola! Soy PoliBot, tu asistente. Puedes escribir una pregunta o seleccionar una de estas opciones:";
    
    appendMessage("PoliBot", welcomeMsgWithButtons, false); 
    conversationHistory.push({ role: "assistant", content: cleanWelcomeMsg });
  }, 1000);
}

document.addEventListener("DOMContentLoaded", init);
