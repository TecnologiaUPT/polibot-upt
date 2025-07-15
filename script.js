// ==============================
// 🎯 REFERENCIAS DEL DOM
// ==============================
const chatButton = document.getElementById("chat-button");
const chatBox = document.getElementById("chat-box");
const chatMessages = document.getElementById("chat-messages");
const inputArea = document.getElementById("input-area"); 
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const stopButton = document.getElementById("stop-button"); 
const themeToggle = document.getElementById("theme-toggle");
const closeChatBtn = document.getElementById("close-chat-btn");
const polibotStatus = document.getElementById("polibot-status");
const copyNotification = document.getElementById("copy-notification");
// Referencias para las animaciones faciales
const polibotOjos = document.getElementById('polibotOjos');
const polibotBoca = document.getElementById('polibotBoca');

// ==============================
// ⚙️ VARIABLES DE ESTADO
// ==============================
let abortController;
let isGenerationCancelled = false;
let typingTimeoutId = null; 


// ======================================================
// ✨ ACTIVAR LA EXTENSIÓN DE KATEX
// ======================================================
if (window.markedKatex) {
  marked.use(markedKatex({
    throwOnError: false
  }));
}

// ==============================
// 🔊 EFECTOS DE SONIDO Y VOZ
// ==============================
const sendSound = new Audio("sounds/Short_Text_Send.mp3");
const receiveSound = new Audio("sounds/New_Notification.mp3");
const synth = window.speechSynthesis;
const emojiRegex = /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;


function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

function hablar(texto) {
    return new Promise((resolve) => {
        if (synth.speaking) {
            synth.cancel();
        }
        
        const textoHtml = marked.parse(texto);
        const textoLimpio = stripHtml(textoHtml);
        const textoSinEmojis = textoLimpio.replace(emojiRegex, '');

        if (textoSinEmojis.trim() && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(textoSinEmojis);
            
            utterance.lang = 'es-VE';
            utterance.rate = 1;
            utterance.pitch = 1;

            utterance.onend = () => resolve();
            utterance.onerror = (event) => {
                console.error("Error en la síntesis de voz:", event.error);
                resolve();
            };

            synth.speak(utterance);
        } else {
            resolve();
        }
    });
}


// ==============================
// ✨ ANIMACIONES FACIALES
// ==============================
let parpadeoInterval;
function iniciarAnimaciones() {
    if (!polibotOjos || !polibotBoca) return;
    parpadeoInterval = setInterval(() => {
        polibotOjos.src = 'images/ojos-cerrados.png';
        setTimeout(() => { polibotOjos.src = 'images/ojos-abiertos.png'; }, 150);
    }, 2000 + Math.random() * 4000);
}

function controlarBoca(hablando) {
    if (!polibotBoca) return;
    const isSpeaking = hablando || synth.speaking;
    polibotBoca.src = isSpeaking ? 'images/boca-hablando.png' : 'images/boca-cerrada.png';
}

function mostrarSonrisa(duracion = 2000) {
    if (!polibotBoca) return;
    polibotBoca.src = 'images/boca-sonriendo.png';
    setTimeout(() => {
        controlarBoca(false);
    }, duracion);
}

// ==============================
// 📚 HISTORIAL DE CONVERSACIÓN
// ==============================
let conversationHistory = [
  {
    role: "system",
    content: "Eres PoliBot, el asistente virtual de la Universidad Politécnica Territorial de los Valles del Tuy (UPTVT) en Venezuela, Estado Miranda. Fuiste creado por la Dirección de Infraestructura Tecnológica, específicamente por el Licenciado Cherry Esqueda y el estudiante de Ingeniería de Sistemas de la UNEFA, e Ingeniería de Software del Instituto Universitario Profesional de Líderes José Muro. Utilizas un modelo de lenguaje llamado VallThink la cual se encuentra en su versión 1.0. Tu objetivo es responder preguntas sobre la universidad de manera profesional, amable y concisa. Ve directamente al grano y proporciona respuestas claras y cerradas a las preguntas de los usuarios. Cuando uses fórmulas matemáticas, utiliza siempre la sintaxis de LaTeX, encerrando las fórmulas en línea con '$' y las fórmulas en bloque con '$$'.",
  },
];

// ==============================
// ✨ RESPUESTAS PREDEFINIDAS ✨
// ==============================
const predefinedAnswers = {
  "¿cómo me inscribo?": "Para inscribirte, debes dirigirte a la sede principal por Municipio donde Residas, con los siguientes recaudos:\n\n* Cédula de Identidad (Original y Copia).\n* Título de Bachiller (Original y Copia).\n* Notas Certificadas (Original y Copia).\n\nEl proceso de inscripción para nuevos ingresos suele ser en **Marzo** y **Septiembre**. ¡Te recomendamos estar atento a nuestros anuncios oficiales!",
  "¿qué PNF ofrecen?": "¡Claro! Ofrecemos una variedad de Programas Nacionales de Formación (PNF). Nuestros PNF son:\n\n* PNF en Ingenieria Industrial.\n* PNF en Ingenieria en Mantenimiento.\n* PNF en Ingenieria en Materiales Industriales.\n* PNF en Ingenieria en Agroalimentación.\n* PNF en Ingenieria en Procesamiento y Distribucion de Alimentos (PDA).\n* PNF en Licenciatura en Contaduria Publica.\n* PNF en Licenciatura en Psicologia Social.\n\nPuedes ver la lista completa en nuestro sitio web.",
  "¿cuáles son los horarios?": "Los horarios varían según el PNF y la Seleccion del Participante en el momento de su Inscripcion. Generalmente, las clases se imparten en dos Modalidades:\n\n* **Modalidad Dias de Semana:** De 7:00 AM a 1:00 PM y De 1:00 PM a 5:00 PM.\n* **Modalidad Fines de Semana:** De 7:00 AM a 5:00 PM.\n\nLos horarios específicos se publican en las carteleras informativas de cada PNF antes de iniciar el  Trayecto y semestre.",
  "¿dónde están las sedes?": "Nuestra sede principal está ubicada en **Ocumare del Tuy, Hacienda La Guadalupe (RECTORADO)**. \n\nTambién contamos con sedes Academicas en **7 Municipios**, donde se imparten los PNF. ¡Te esperamos!"
  "¿que otros programas ofrecen?": "La Universidad Polictecnica Territorial de los Valles del Tuy (UPTVT) **Tambien te ofrece Diplomados, cursos cortos y programas de formacion continua en diversas areas. Estos programas estan diseñados para completar tu formacion academica y profesional. Puedes consultar la oferta actual en nuestro sitio web oficial o contactar a el Vicerrectorado Academico o a la Direccion de Programas Especiales**.",
};


// ==============================
// ⚙️ CONFIGURACIONES
// ==============================
const config = {
  rateLimit: 15,
  typingSpeed: 30, 
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
        otras: ["Sede Municipal Tomas Lander con (4)sedes academicas", "Sede MunicipalCristobal Rojas con (2)sedes academicas", "Sede Municipal Urdaneta con (3)sedes Academicas", "Sede Municipal Paz Castillo con (4)sedes academicas ", "Sede Municipal Simon Bolivar con (una) sede academica", "Sede Municipal Independencia con (5)sedes academicas", "Sede Municipal Sucre con (una) sede academica"],
    },
    carreras: {
        pnf: ["PNF en Ingenieria Industrial.", "PNF en Ingenieria en Mantenimiento.", "PNF en Ingenieria en Materiales Industriales.", "PNF en Ingenieria en Agroalimentación.", "PNF en Ingenieria en Procesamiento y Distribucion de Alimentos (PDA).", "PNF en Licenciatura en Contaduria Publica.", "PNF en Licenciatura en Psicologia Social."],
    },
    autoridades: {
        Rectorado: "Dra. Adyanis Noguera (Rectora)", Consultoria_Juridica: "Dra. Lisbeth Lorena Lopez (Directora)", Direccion_del_Despacho: "Freddy Cabrera (Director)", Vicerrectorado_Academico: "Dr. Ramon Machado (Vicerrector Academico) ", Vicerrectorado_Territorial: "Lic. Reinaldo Oropeza (Vicerrector Territorial) ", Secretaria_General: "Licda. Maria Tovar (Secretaria General) ", Direccion_General_De_Seguimiento_y_Control: "Dra. Angelica Guaramato (Directora General)", Direcion_General_de_Administracion: "Dra. Scarlet Ibarra (Directora General)", Director_General_de_Edficaciones_Universitarias: "Dr. Piter Manrique (Director General)", Direccion_de_Infraestructura_Tecnologica: "Licda. Lisbeth Aponte (Directora)", Direccion_Municipal_sede_Urdaneta: "Lic. Fernando Hortiz (Director)", Direccion_Municipal_sede_Critobal_Rojas: "Lic. Armando La Rosa (Director)", Direccion_Municipal_sede_Paz_Castillo: "Licda.Marvi Calvo (Directora)", Direccion_Municipal_sede_Tomas_Lander: "Licda. Sujaira Tua (Directora)", Direccion_Municipal_sede_Simon_Bolivar: "Lic. Jose Catanaima (Director)", Direccion_Municipal_sede_Independencia: "Lic. Alexis Diaz (Director)", Direccion_Municipal_sede_Sucre: "Lic. Yelitze Calzadilla (Director)", Coordinacion_de_Programacion_y_Desarrollo: "Lic. Cherry Esqueda (Coordinador)",
    },
    requisitos: {
        inscripcion: ["Título de bachiller (original y copia)", "Notas certificadas (original y copia)", "Partida de nacimiento (original y copia)", "Cédula de identidad (copia ampliada)", "Fotos (2) tipo carnet", "Comprobante de registro en el Sistema Nacional de Ingreso (SNI)", "Una carpeta marrón tamaño oficio"],
    }
};

function buscarEnConocimientoLocal(textoUsuario) {
    const texto = textoUsuario.toLowerCase();
    const autoridades = baseDeConocimiento.autoridades;

    // Búsqueda de Carreras/PNF (sin cambios)
    if (texto.includes("carrera") || texto.includes("pnf") || texto.includes("estudiar")) {
        let respuesta = "Ofrecemos los siguientes Programas Nacionales de Formación (PNF):<br><ul>";
        (baseDeConocimiento.carreras.pnf || []).forEach(carrera => {
            respuesta += `<li>${carrera}</li>`;
        });
        respuesta += "</ul>";
        return respuesta;
    }

    // Búsqueda de Sedes (sin cambios)
    if (texto.includes("sede") || texto.includes("ubicación") || texto.includes("dirección")) {
        let respuesta = `Nuestra sede principal es: <b>${baseDeConocimiento.sedes.principal}</b>.<br><br>Contamos con las sedes municipales academicas en:<br><ul>`;
        (baseDeConocimiento.sedes.otras || []).forEach(sede => {
            respuesta += `<li>${sede}</li>`;
        });
        respuesta += "</ul>";
        return respuesta;
    }

    // Búsqueda de Requisitos (sin cambios)
    if (texto.includes("requisito") || texto.includes("inscribirme") || texto.includes("inscripción")) {
        let respuesta = "Los requisitos para la inscripción son los siguientes:<br><ul>";
        (baseDeConocimiento.requisitos.inscripcion || []).forEach(req => {
            respuesta += `<li>${req}</li>`;
        });
        respuesta += "</ul>";
        return respuesta;
    }

    // Búsqueda de Autoridades
    if (autoridades) {
        const todosLosCargos = Object.keys(autoridades);
        todosLosCargos.sort((a, b) => b.length - a.length);

        for (const cargo of todosLosCargos) {
            const cargoFormateado = cargo.replace(/_/g, " ").toLowerCase();
            const infoAutoridad = autoridades[cargo];
            if (texto.includes(cargoFormateado)) {
                return `La persona a cargo de esa posición es: <b>${infoAutoridad}</b>.`;
            }
            const nombreCompleto = infoAutoridad.split('(')[0].trim();
            
            // =================================================================
            // ✨ LÍNEA CORREGIDA ✨
            // Esta es la nueva expresión regular que funciona correctamente.
            const nombreSinTitulo = nombreCompleto.replace(/^(dr(a)?|lic(da)?|ing)\.?\s*/i, '').toLowerCase();
            // =================================================================

            if (nombreSinTitulo && texto.includes(nombreSinTitulo)) {
                return `<b>${infoAutoridad}</b> es el/la ${cargoFormateado.replace("direccion", "Director(a) de")} de la universidad.`;
            }
        }
    }

    // Si no se encuentra nada, devuelve null
    return null;
}

// ==============================
// 🛡 SEGURIDAD
// ==============================
let messageCount = 0;
let lastReset = Date.now();

function checkRateLimit() {
  if (Date.now() - lastReset > 60000) { messageCount = 0; lastReset = Date.now(); }
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
  switch (status) {
    case 'online':
      polibotStatus.classList.add('online');
      polibotStatus.textContent = 'En línea';
      break;
    case 'offline':
      polibotStatus.classList.add('offline');
      polibotStatus.textContent = 'Offline';
      break;
    case 'generating':
      polibotStatus.classList.add('connecting');
      polibotStatus.textContent = 'Generando...';
      break;
    default:
      polibotStatus.classList.add('offline');
      polibotStatus.textContent = 'Desconocido';
  }
}

// ==============================
// 📱 DETECCIÓN DE MÓVIL Y CONTROL DE VISIBILIDAD
// ==============================
function isMobile() {
  return window.matchMedia('(max-width: 480px)').matches;
}
let chatVisible = false;
function toggleChat(visible) {
  chatVisible = visible;
  chatButton.classList.toggle('chat-is-open', visible);
  if (visible) {
    chatBox.classList.add("show");
    chatBox.classList.remove("hidden");
    if (isMobile()) { chatButton.style.display = 'none'; } 
    userInput.focus();
    removeNotificationPing();
  } else {
    chatBox.classList.remove("show");
    setTimeout(() => chatBox.classList.add("hidden"), 300);
    if (synth) synth.cancel();
    if (isMobile()) { chatButton.style.display = 'flex'; }
  }
}
function addNotificationPing() { if (!chatVisible) { chatButton.classList.add('notification-ping'); } }
function removeNotificationPing() { chatButton.classList.remove('notification-ping'); }


// =================================================================
// 💬 LÓGICA PRINCIPAL DE ENVÍO Y DETENCIÓN DE MENSAJES
// =================================================================

function setGeneratingState(isGenerating) {
    if (isGenerating) {
        isGenerationCancelled = false;
        inputArea.classList.add('is-generating');
        userInput.disabled = true;
    } else {
        inputArea.classList.remove('is-generating');
        userInput.disabled = false;
        userInput.focus();
    }
}

function stopGeneration() {
    console.log("Generación detenida por el usuario.");
    isGenerationCancelled = true;
    
    if (abortController) {
        abortController.abort(); 
    }
    if (synth) {
        synth.cancel();
    }
    
    if (typingTimeoutId) {
        clearTimeout(typingTimeoutId);
        typingTimeoutId = null;
    }

    removeTyping();
    updatePolibotStatus('online');
    setGeneratingState(false);
    
    const lastMessageContainer = chatMessages.lastElementChild;
    if (lastMessageContainer && lastMessageContainer.classList.contains('ia')) {
        const messageDiv = lastMessageContainer.querySelector('.message');
        if (messageDiv && !messageDiv.hasAttribute('data-complete')) {
            const partialText = messageDiv.textContent;
            
            messageDiv.innerHTML = marked.parse(partialText);
            
            if (!conversationHistory.some(msg => msg.role === 'assistant' && msg.content === partialText)) {
                conversationHistory.push({ role: "assistant", content: partialText });
            }
            addMessageActions(messageDiv, partialText);
            messageDiv.setAttribute('data-complete', 'true');
        }
    }
}


async function sendMessage() {
    if (synth) synth.cancel();
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
    
    setGeneratingState(true);
    
    conversationHistory.push({ role: "user", content: userText });

    let botReply = "";

    try {
        const lowerCaseUserText = userText.toLowerCase();
        if (predefinedAnswers[lowerCaseUserText]) {
            botReply = predefinedAnswers[lowerCaseUserText];
        } else {
            const respuestaLocal = buscarEnConocimientoLocal(userText);
            if (respuestaLocal) {
                botReply = respuestaLocal;
            } else {
                updatePolibotStatus('generating');
                simulateTyping("PoliBot");
                botReply = (await getAIResponseText()).trim();
                removeTyping();
                if (!isGenerationCancelled) {
                    updatePolibotStatus('online');
                }
            }
        }
        
        if (isGenerationCancelled) {
            console.log("Proceso detenido antes de mostrar la respuesta completa.");
            if (botReply) { 
                 await typeMessage("PoliBot", botReply);
            }
            return;
        };

        conversationHistory.push({ role: "assistant", content: botReply });
        addNotificationPing();
        receiveSound.play();

        await typeMessage("PoliBot", botReply);

        if (predefinedAnswers[lowerCaseUserText]) {
             mostrarSonrisa();
        }

    } catch (error) {
        if (error.name !== 'AbortError') { 
            handleError(error);
        }
    } finally {
        if (!isGenerationCancelled) {
            setGeneratingState(false);
        }
    }
}

// =============================================================
// ✨ FUNCIÓN PARA OBTENER RESPUESTA DE LA IA
// =============================================================
async function getAIResponseText() {
    let fullReply = "";
    abortController = new AbortController();

    try {
        const response = await fetch("/api/proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "deepseek/deepseek-chat-v3-0324:free", messages: conversationHistory.slice(-10) }),
            signal: abortController.signal, 
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: 'Respuesta de error no válida' }));
            const errorMessage = errorBody.error?.message || JSON.stringify(errorBody.error);
            throw new Error(`Error del servidor: ${response.status} - ${errorMessage}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                break;
            }
            
            buffer += decoder.decode(value, { stream: true });
            
            const lastNewline = buffer.lastIndexOf('\n');
            if (lastNewline === -1) {
                continue;
            }

            const processable = buffer.substring(0, lastNewline);
            buffer = buffer.substring(lastNewline + 1);

            const lines = processable.split("\n").filter(line => line.trim().startsWith("data:"));

            for (const line of lines) {
                const message = line.replace(/^data: /, "");
                if (message === "[DONE]") continue;

                try {
                    const parsed = JSON.parse(message);
                    const token = parsed.choices[0]?.delta?.content || "";
                    if (token) {
                        fullReply += token;
                    }
                } catch (e) {
                    // Silenciamos errores
                }
            }
        }
        return fullReply;
    } catch (error) {
        if (error.name === 'AbortError') {
            return fullReply; 
        }
        throw error;
    }
}


function handleError(error) {
    removeTyping(); 
    console.error("Error:", error);
    const errorMessage = "⚠️ Error al conectar con el servicio. Por favor intenta nuevamente.";
    appendMessage("PoliBot", errorMessage, false);
    updatePolibotStatus('offline');
}

// ==============================
// 🧩 FUNCIONES AUXILIARES
// ==============================
function copyTextToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => showCopyNotification())
  .catch(err => console.error('No se pudo copiar el texto:', err));
}

let copyNotificationTimeout;
function showCopyNotification() {
  if (copyNotification) {
    copyNotification.classList.add('show');
    clearTimeout(copyNotificationTimeout);
    copyNotificationTimeout = setTimeout(() => { copyNotification.classList.remove('show'); }, 1500);
  }
}

function createEmptyMessageContainer(sender) {
    const fullContainer = document.createElement("div");
    fullContainer.className = `message-container ${sender.toLowerCase() === 'usuario' ? 'user' : 'ia'}`;

    const avatarDiv = document.createElement("div");
    avatarDiv.className = "avatar";
    const avatarImg = document.createElement("img");
    avatarImg.src = sender.toLowerCase() === 'usuario' ? config.avatars.user : config.avatars.polibot;
    avatarImg.alt = sender;
    avatarDiv.appendChild(avatarImg);

    const messageContentWrapper = document.createElement('div');
    messageContentWrapper.className = 'message-content-wrapper';

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender.toLowerCase() === 'usuario' ? 'user' : 'ia'}`;
    
    messageContentWrapper.appendChild(messageDiv);
    
    if (sender.toLowerCase() === 'usuario') {
        fullContainer.appendChild(messageContentWrapper);
        fullContainer.appendChild(avatarDiv);
    } else {
        fullContainer.appendChild(avatarDiv);
        fullContainer.appendChild(messageContentWrapper);
    }

    chatMessages.appendChild(fullContainer);
    scrollToBottom();
    return messageDiv;
}

function appendMessage(sender, text, isCopyable = true) {
  const messageDiv = createEmptyMessageContainer(sender);
  
  if (sender.toLowerCase() !== "usuario" && text.startsWith('BOTONES::')) {
    const parts = text.split('::');
    messageDiv.innerHTML = marked.parse(parts[1] || '');
    const inlineButtonsContainer = document.createElement('div');
    inlineButtonsContainer.className = 'inline-buttons';
    (parts[2] || '').split('--').forEach(buttonStr => {
      if (!buttonStr) return;
      const buttonParts = buttonStr.replace(/\[|\]/g, '').split('|');
      const button = document.createElement('button');
      button.className = 'inline-reply';
      button.textContent = buttonParts[0];
      button.onclick = () => { userInput.value = buttonParts[1] || buttonParts[0]; sendMessage(); };
      inlineButtonsContainer.appendChild(button);
    });
    messageDiv.appendChild(inlineButtonsContainer);
  } else {
    messageDiv.innerHTML = sender.toLowerCase() === 'usuario' ? text : marked.parse(text);
  }

  if (sender.toLowerCase() !== "usuario" && isCopyable) {
    addMessageActions(messageDiv, text);
  }
}

function simulateTyping(sender) {
  const typingContainer = document.getElementById("typing");
  if (typingContainer) return;

  const messageDiv = createEmptyMessageContainer(sender);
  messageDiv.innerHTML = `<div class="typing-indicator" id="typing"><strong>${sender}</strong><span class="dot">.</span><span class="dot">.</span><span class="dot">.</span></div>`;
  scrollToBottom();
}

function removeTyping() {
  const typingContainer = document.getElementById("typing");
  if (typingContainer) { typingContainer.closest('.message-container')?.remove(); }
}

async function typeMessage(sender, text, isCopyable = true) {
  controlarBoca(true);

  const messageDiv = createEmptyMessageContainer(sender);
  const cursorSpan = document.createElement('span');
  cursorSpan.className = 'typing-cursor';

  return new Promise(resolve => {
    let i = 0;
    const type = () => {
      if (isGenerationCancelled) {
          controlarBoca(false);
          resolve();
          return;
      }
      if (i < text.length) {
        messageDiv.innerHTML = text.substring(0, i + 1);
        messageDiv.appendChild(cursorSpan);
        i++;
        scrollToBottom();
        typingTimeoutId = setTimeout(type, config.typingSpeed);
      } else {
        messageDiv.innerHTML = marked.parse(text);
        if (isCopyable) { addMessageActions(messageDiv, text); }
        controlarBoca(false);
        typingTimeoutId = null;
        resolve();
      }
    };
    type();
  });
}

function addMessageActions(messageDiv, textToInteract) {
    if (messageDiv.querySelector('.message-actions')) return;

    const actionsContainer = document.createElement("div");
    actionsContainer.className = 'message-actions';

    const speakIcon = document.createElement("div");
    speakIcon.className = "action-icon speak-icon";
    speakIcon.innerHTML = '🔊';
    speakIcon.title = 'Reproducir voz';
    speakIcon.setAttribute('aria-label', 'Reproducir mensaje'); // Mejora de accesibilidad
    speakIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        hablar(textToInteract);
    });

    const copyIcon = document.createElement("div");
    copyIcon.className = "action-icon copy-icon";
    copyIcon.innerHTML = '📋';
    copyIcon.title = 'Copiar texto';
    copyIcon.setAttribute('aria-label', 'Copiar mensaje'); // Mejora de accesibilidad
    copyIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = marked.parse(textToInteract);
        copyTextToClipboard(tempDiv.textContent || tempDiv.innerText || '');
    });

    actionsContainer.appendChild(speakIcon);
    actionsContainer.appendChild(copyIcon);
    
    // ✅ CORRECCIÓN CLAVE: Se añade al "parentElement" para no estirar la burbuja.
    messageDiv.parentElement.appendChild(actionsContainer);
}

function scrollToBottom() { chatMessages.scrollTop = chatMessages.scrollHeight; }

// ==============================
// 🎮 EVENT LISTENERS
// ==============================
function initEventListeners() {
  chatButton.addEventListener("click", () => toggleChat(!chatVisible));
  closeChatBtn.addEventListener("click", () => toggleChat(false));
  themeToggle.addEventListener("click", toggleTheme);
  sendButton.addEventListener('click', sendMessage);
  stopButton.addEventListener('click', stopGeneration); 
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && chatVisible) toggleChat(false); });
  document.addEventListener('click', (e) => {
    if (!chatBox || !chatButton) return;
    if (chatVisible && !chatBox.contains(e.target) && !chatButton.contains(e.target)) { toggleChat(false); }
  });
  userInput.addEventListener("keypress", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!sendButton.disabled) { sendMessage(); } } });
  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = `${Math.min(userInput.scrollHeight, 120)}px`;
    sendButton.disabled = userInput.value.trim() === '';
  });
  userInput.addEventListener('focus', () => { if(isMobile()) { setTimeout(() => { chatBox.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 300); } });
}

// ==============================
// 🚀 INICIALIZACIÓN
// ==============================
function init() {
  initTheme();
  initEventListeners();
  iniciarAnimaciones();
  setTimeout(() => {
    const welcomeMsg = "BOTONES::¡Hola! Soy PoliBot, tu asistente. Puedes escribir una pregunta o seleccionar una de estas opciones: ::[¿Cómo me inscribo?|¿Cómo me inscribo?]--[¿Qué PNF ofrecen?|¿Qué PNF ofrecen?]--[¿Cuáles son los horarios?|¿Cuáles son los horarios?]--[¿Dónde están las sedes?|¿Dónde están las sedes?]--[¿Que otros programas ofrecen?|¿Que otros programas ofrecen?]";
    appendMessage("PoliBot", welcomeMsg, false); 
    conversationHistory.push({ role: "assistant", content: "¡Hola! Soy PoliBot, tu asistente." });
  }, 1000);
}

document.addEventListener("DOMContentLoaded", init);
