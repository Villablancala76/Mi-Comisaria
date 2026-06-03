/**
 * LÓGICA DE MI COMISARIA VIRTUAL
 * Este archivo contiene la base de datos de las pantallas, el sistema para navegar entre ellas
 * y la lógica de autenticación oficial.
 */

// --- 0. CONFIGURACIÓN BACKEND (Google Apps Script) ---
const GAS_URL = "https://script.google.com/macros/s/AKfycbzKD1DXLddiRc6BqAKr8d4AZjjx0G0qzn4sawyvPFSjZ2KPcZxVUPiGGZ7CzUbdRlfSUg/exec"; // Reemplazar con la URL al desplegar

// --- 1. GESTIÓN DE AUTENTICACIÓN ---
function showRegister() {
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("verify-container").classList.add("hidden");
    document.getElementById("register-container").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("register-container").classList.add("hidden");
    document.getElementById("verify-container").classList.add("hidden");
    document.getElementById("login-container").classList.remove("hidden");
    loadSavedLPs();
}

function showVerify() {
    document.getElementById("register-container").classList.add("hidden");
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("verify-container").classList.remove("hidden");
}

// --- GESTIÓN DE CORREOS GUARDADOS ---
function loadSavedLPs() {
    try {
        const savedLPs = JSON.parse(localStorage.getItem("savedLPs")) || [];
        const datalist = document.getElementById("saved-lps");
        const loginInput = document.getElementById("login-lp");
        
        // Si los elementos no existen aún, esperar a que se carguen
        if (!datalist || !loginInput) {
            console.warn("Datalist o input no encontrado, reintentando...");
            setTimeout(loadSavedLPs, 100);
            return;
        }
        
        datalist.innerHTML = "";
        
        savedLPs.forEach(lp => {
            const option = document.createElement("option");
            option.value = lp;
            datalist.appendChild(option);
        });

        const lastLP = localStorage.getItem("lastLoginLP");
        if (lastLP && lastLP.trim()) {
            loginInput.value = lastLP;
            console.log("LP recuperado:", lastLP);
        }
    } catch (error) {
        console.error("Error al cargar LPs guardados:", error);
    }
}

function saveLP(lp) {
    try {
        let savedLPs = JSON.parse(localStorage.getItem("savedLPs")) || [];
        
        // Agregar LP si no existe
        if (!savedLPs.includes(lp)) {
            savedLPs.push(lp);
            localStorage.setItem("savedLPs", JSON.stringify(savedLPs));
        }
        localStorage.setItem("lastLoginLP", lp);
        console.log("LP guardado:", lp);
    } catch (error) {
        console.error("Error al guardar LP:", error);
    }
}

function hideAuthShowApp() {
    try {
        console.log("🔄 hideAuthShowApp() iniciada...");
        
        const authWrapper = document.getElementById("auth-wrapper");
        const appWrapper = document.getElementById("app-wrapper");
        
        if (!authWrapper) {
            throw new Error("auth-wrapper no encontrado en el DOM");
        }
        if (!appWrapper) {
            throw new Error("app-wrapper no encontrado en el DOM");
        }
        
        console.log("✓ Elementos encontrados, ocultando auth-wrapper...");
        authWrapper.classList.add("hidden");
        console.log("✓ auth-wrapper ocultado");
        
        console.log("✓ Mostrando app-wrapper...");
        appWrapper.classList.remove("hidden");
        console.log("✓ app-wrapper mostrado");
        
        console.log("✓ Inicializando historyStack...");
        historyStack = ["pantallaInicio"];
        console.log("✓ historyStack:", historyStack);
        
        console.log("✓ Renderizando pantalla inicial...");
        const screenContainer = document.getElementById("screen-container");
        if (!screenContainer) {
            throw new Error("screen-container no encontrado en el DOM");
        }
        renderScreen("pantallaInicio");
        console.log("✓ Pantalla renderizada correctamente");
        
    } catch (error) {
        console.error("❌ Error en hideAuthShowApp():", error);
        alert("Error al inicializar aplicación: " + error.message);
        throw error;
    }
}

// FUNCIÓN PARA TOGGLE DE VISUALIZACIÓN DE CONTRASEÑA
function togglePassword(inputId, button) {
    console.log("Toggle password called for", inputId);
    const input = document.getElementById(inputId);
    if (!input) {
        console.error("Input not found:", inputId);
        return;
    }
    
    if (input.type === "password") {
        input.type = "text";
        if (button) button.textContent = "👁️"; // Ojo abierto
    } else {
        input.type = "password";
        if (button) button.textContent = "🔒"; // Ojo cerrado (candado)
    }
}

// AGREGAR EVENT LISTENERS CUANDO EL DOM ESTÉ LISTO
document.addEventListener("DOMContentLoaded", function() {
    console.log("✓ DOM completamente cargado");
    
// FORM: REGISTRO
    
// FORM: REGISTRO
document.getElementById("register-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.submitter;
    const lp = document.getElementById("reg-lp").value;
    const email = document.getElementById("reg-email").value;
    
    // Validar LP: exactamente 6 dígitos numéricos
    const lpPattern = /^\d{6}$/;
    if (!lpPattern.test(lp)) {
        alert("El Legajo Personal debe contener exactamente 6 dígitos numéricos");
        return;
    }
    
    if (!email.endsWith("@polneuquen.gob.ar")) {
        alert("ERROR: Debe utilizar un correo oficial @polneuquen.gob.ar");
        return;
    }

    const userData = {
        action: "register",
        nombre: document.getElementById("reg-nombre").value,
        dni: document.getElementById("reg-dni").value,
        lp: document.getElementById("reg-lp").value,
        email: email,
        pass: document.getElementById("reg-pass").value
    };

    try {
        btn.disabled = true;
        btn.innerText = "ENVIANDO...";
        
        const response = await fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors", // Requerido para Google Apps Script
            body: JSON.stringify(userData)
        });

        // NOTA: 'no-cors' no permite leer la respuesta JSON, 
        // pero el correo debería salir si la URL es correcta.
        localStorage.setItem("user_email", email); // Guardar para verificación
        alert("Solicitud enviada. Por favor, revise su correo oficial: " + email);
        showVerify();
    } catch (error) {
        console.error("Error al registrar:", error);
        alert("Error de conexión con el servidor. Verifique la URL de GAS.");
    } finally {
        btn.disabled = false;
        btn.innerText = "REGISTRARSE";
    }
});

// FORM: VERIFICACIÓN
document.getElementById("verify-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.submitter;
    const email = localStorage.getItem("user_email");
    const code = document.getElementById("verify-code").value;

    const data = {
        action: "verify",
        email: email,
        code: code
    };

    try {
        btn.disabled = true;
        btn.innerText = "VERIFICANDO...";
        
        // En GAS, para recibir respuesta JSON real hay que usar Redirects o un truco de fetch,
        // por ahora usaremos no-cors para asegurar que llegue el dato.
        await fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(data)
        });

        alert("Código enviado. Si es correcto, ya puede iniciar sesión.");
        showLogin();
    } catch (error) {
        alert("Error en la verificación.");
    } finally {
        btn.disabled = false;
        btn.innerText = "VERIFICAR";
    }
});
});

// FORM: LOGIN (fuera de DOMContentLoaded para asegurar que se adjunte)
document.getElementById("login-form")?.addEventListener("submit", function(e) {
    e.preventDefault();
    const lp = document.getElementById("login-lp").value;
    
    console.log("🔐 Intento de login con LP:", lp);

    // Simplificado: siempre aceptar para pruebas
    saveLP(lp);
    hideAuthShowApp();
});

// --- 2. BASE DE DATOS DE PANTALLAS ---
const screens = {
    // ---------------- INICIO ----------------
    "inicio": {
        title: "", // Inicio no tiene título interior en rojo, o usa un subtítulo específico
        subtitle: "",
        isMain: true,
        buttons: [
            { id: "denuncias", label: "DENUNCIAS", type: "nav", target: "denuncias" },
            { id: "exposicion", label: "EXPOSICIÓN", type: "file", file: "exposicion_plantilla.docx" },
            { id: "oficios", label: "OFICIOS", type: "nav", target: "oficios" },
            { id: "elevaciones", label: "ELEVACIONES", type: "nav", target: "elevaciones" },
            { id: "actas", label: "ACTAS", type: "nav", target: "actas" },
            { id: "notificaciones", label: "NOTIFICACIONES", type: "nav", target: "notificaciones" },
            { id: "certificados", label: "CERTIFICADOS", type: "nav", target: "certificados" },
            { id: "memorandums", label: "MEMORANDUMS", type: "nav", target: "memorandums" },
            { id: "leyes", label: "LEYES Y REGLAMENTOS", type: "nav", target: "leyes" },
            { id: "sistemas", label: "SISTEMAS", type: "nav", target: "sistemas" },
            { id: "menores", label: "MENORES", type: "nav", target: "menores" },
            { id: "ley23737", label: "Ley 23737", type: "nav", target: "ley23737" },
            { id: "himnos", label: "HIMNOS", type: "nav", target: "himnos" },
            { id: "caratulas", label: "CARATULAS", type: "nav", target: "caratulas" }
        ]
    },

    "pantallaInicio": {
        title: "SELECCIONE SU ÁREA DE TRABAJO",
        subtitle: "Elija uno de los sectores disponibles para comenzar",
        buttons: [
            { label: "OFICIAL DE SERVICIO", type: "nav", target: "oficialServicio" },
            { label: "PERSONAL DE CALLE", type: "nav", target: "personalCalle" },
            { label: "OFICINA ADMINISTRATIVA", type: "nav", target: "oficinaAdministrativa" },
            { label: "OFICINA DE INTERVENCIÓN PRIMARIA", type: "nav", target: "oficinaIntervencionPrimaria" }
        ]
    },

    "sitemap": {
        title: "MAPA DEL SITIO",
        subtitle: "Organigrama de navegación de la aplicación",
        type: "sitemap"
    },

    "oficinaIntervencionPrimaria": {
        title: "OFICINA DE INTERVENCIÓN PRIMARIA",
        subtitle: "SELECCIONE LA OPCIÓN CORRESPONDIENTE",
        buttons: [
            { label: "Denuncia Ley 2785", type: "file", file: "ley_2785.docx" },
            { label: "Denuncia Ley 2786", type: "file", file: "ley_2786.docx" },
            { label: "Denuncia Ley 2302", type: "file", file: "ley_2302.docx" },
            { label: "Exposición", type: "file", file: "exposicion_plantilla.docx" },
            { label: "Parte", type: "nav", target: "parte" },
            { label: "Informe", type: "nav", target: "informe" },
            { label: "Notificación de Medidas Cautelares", type: "file", file: "notificacion_medidas_cautelares.docx" },
            { label: "Notificación de Detención", type: "file", file: "notificacion_detencion.docx" },
            { label: "Notificación de Libertad", type: "file", file: "notificacion_libertad_supeditada.docx" },
            { label: "Citación", type: "file", file: "notificacion_citacion_admin.docx" },
            { label: "Certificados", type: "nav", target: "certificados" },
            { label: "Leyes y Reglamentos", type: "nav", target: "leyes" }
        ]
    },

    "oficinaAdministrativa": {
        title: "OFICINA ADMINISTRATIVA",
        subtitle: "SELECCIONE LA OPCIÓN CORRESPONDIENTE",
        buttons: [
            { label: "Exposición", type: "file", file: "exposicion_plantilla.docx" },
            { label: "Elevación Expediente", type: "file", file: "elevacion_expediente.docx" },
            { label: "Elevación Juzgado de Faltas", type: "file", file: "elevacion_juzgado_faltas.docx" },
            { label: "Elevación Juzgado de Paz", type: "file", file: "elevacion_juzgado_paz.docx" },
            { label: "Elevación Defensoria del menor", type: "file", file: "elevacion_def_menor.docx" },
            { label: "Elevación Defensoria Penal", type: "file", file: "elevacion_def_penal.docx" },
            { label: "Certificados", type: "nav", target: "certificados" },
            { label: "Leyes y Reglamentos", type: "nav", target: "leyes" }
        ]
    },

    "personalCalle": {
        title: "PERSONAL DE CALLE",
        subtitle: "SELECCIONE LA OPCIÓN CORRESPONDIENTE",
        buttons: [
            { label: "Parte", type: "nav", target: "parte" },
            { label: "Informe", type: "nav", target: "informe" },
            { label: "Actas", type: "nav", target: "actas" },
            { label: "Certificados", type: "nav", target: "certificados" },
            { label: "Leyes y Reglamentos", type: "nav", target: "leyes" }
        ]
    },

    "parte": {
        title: "PARTE",
        subtitle: "SELECCIONE EL PARTE QUE DESEA REALIZAR",
        buttons: [
            // Botones para partes, agregar según necesidad
        ]
    },

    "informe": {
        title: "INFORME",
        subtitle: "SELECCIONE EL INFORME QUE DESEA REALIZAR",
        buttons: [
            // Botones para informes, agregar según necesidad
        ]
    },

    "oficialServicio": {
        title: "OFICIAL DE SERVICIO",
        subtitle: "SELECCIONE LA CATEGORÍA CORRESPONDIENTE",
        buttons: [
            { label: "Judicial", type: "nav", target: "denuncias" },
            { label: "Contravencional", type: "nav", target: "contravencional" },
            { label: "Tránsito", type: "nav", target: "transito" },
            { label: "Administrativo", type: "nav", target: "administrativoServicio" },
            { label: "Actas", type: "nav", target: "actas" },
            { label: "Exposición", type: "file", file: "exposicion_plantilla.docx" },
            { label: "Memorandum Diario", type: "file", file: "Memorandum Diario.docx" },
            { label: "Memorandum Ampliatorio", type: "file", file: "Memorandum Ampliatorio.docx" },
            { label: "Certificados", type: "nav", target: "certificados" },
            { label: "Leyes y Reglamentos", type: "nav", target: "leyes" }
        ]
    },

    "transito": {
        title: "TRÁNSITO",
        subtitle: "SELECCIONE LA OPCIÓN DE TRÁNSITO",
        buttons: [
            { label: "Acta de Procedimiento", type: "file", file: "acta_procedimiento.docx" },
            { label: "Acta de Declaración Testimonial", type: "file", file: "Acta_de_Declaración_Testimonial.docx" },
            { label: "Croquis", type: "file", file: "Croquis.docx" },
            { label: "Citación", type: "file", file: "Citación.docx" },
            { label: "Acta de Notificacion de expediente", type: "file", file: "Acta_de_Notificacion_de_expediente.docx" },
            { label: "Certificado Medico Mayor", type: "file", file: "certificado_medico.docx" },
            { label: "Certificado Medico Menor", type: "file", file: "certificado_medico_menor.docx" },
            { label: "Acta de Secuestro Automotor", type: "file", file: "acta_secuestro_automotor.docx" },
            { label: "Acta de Secuestro Ciclomotor", type: "file", file: "acta_secuestro_motocicleta.docx" },
            { label: "Elevación", type: "file", file: "Elevación.docx" },
            { label: "Caratulas", type: "nav", target: "caratulas" }
        ]
    },

    "contravencional": {
        title: "CONTRAVENCIONAL",
        subtitle: "SELECCIONE LA OPCIÓN DE CONTRAVENCIONAL",
        buttons: [
            { label: "Expediente Contravencional", type: "file", file: "Expediente_Contravencional.docx" },
            { label: "Denuncia Contravencional", type: "file", file: "denuncia_contravencional.docx" },
            { label: "Acta de Procedimiento", type: "file", file: "acta_procedimiento.docx" },
            { label: "Acta de Declaración Testimonial", type: "file", file: "Acta_de_Declaración_Testimonial.docx" },
            { label: "Croquis", type: "file", file: "Croquis.docx" },
            { label: "Citación", type: "file", file: "Citación.docx" },
            { label: "Acta de Notificacion de expediente", type: "file", file: "Acta_de_Notificacion_de_expediente.docx" },
            { label: "Acta de Notificacion de Ingreso A.A", type: "file", file: "Acta_de_Notificacion_de_Ingreso_A.A.docx" },
            { label: "Acta de Notificación Libertad A.A", type: "file", file: "notificacion_libertad_aa.docx" },
            { label: "Certificado Medico Mayor", type: "file", file: "certificado_medico.docx" },
            { label: "Certificado Medico Menor", type: "file", file: "certificado_medico_menor.docx" },
            { label: "Elevación", type: "file", file: "Elevación.docx" },
            { label: "Caratulas", type: "nav", target: "caratulas" }
        ]
    },

    "administrativoServicio": {
        title: "ADMINISTRATIVO",
        subtitle: "SELECCIONE LA OPCIÓN DE ADMINISTRATIVO",
        buttons: [
            { label: "Parte", type: "file", file: "Parte.docx" },
            { label: "Informe", type: "file", file: "Informe.docx" },
            { label: "Nota", type: "file", file: "nota.docx" },
            { label: "Memorandum", type: "file", file: "memorandum.docx" },
            { label: "I.S.D.", type: "nav", target: "isd" },
            { label: "A.S.D.", type: "nav", target: "asd" },
            { label: "Caratulas", type: "nav", target: "caratulas" }
        ]
    },

    // ---------------- DENUNCIAS ----------------
    "denuncias": {
        title: "DENUNCIAS",
        subtitle: "SELECCIONE LA DENUNCIA QUE DESEA RADICAR",
        buttons: [
            { label: "Sistema Tromen", type: "link", url: "https://tromendenuncias.com/login" }, 
            { label: "Denuncia Judicial", type: "file", file: "denuncia_judicial.docx" },
            { label: "Denuncia Contravencional", type: "file", file: "denuncia_contravencional.docx" },
            { label: "Denuncia Administrativa Policial", type: "file", file: "denuncia_admin_policial.docx" },
            { label: "Denuncia Administrativa Civil", type: "file", file: "denuncia_admin_civil.docx" },
            { label: "Denuncia Ley 2785", type: "file", file: "ley_2785.docx" },
            { label: "Denuncia Ley 2786", type: "file", file: "ley_2786.docx" },
            { label: "Denuncia Ley 2302", type: "file", file: "ley_2302.docx" },
            { label: "Denuncia A. R. T.", type: "file", file: "denuncia_art.pdf" }
        ]
    },

    // ---------------- OFICIOS ----------------
    "oficios": {
        title: "OFICIOS",
        subtitle: "SELECCIONE EL OFICIO QUE DESEA REALIZAR",
        buttons: [
            { label: "Oficio 1", type: "blank" },
            { label: "Oficio 2", type: "blank" },
            { label: "Oficio 3", type: "blank" },
            { label: "Oficio 4", type: "blank" },
            { label: "Oficio 5", type: "blank" },
            { label: "Oficio 6", type: "blank" },
            { label: "Oficio 7", type: "blank" },
            { label: "Oficio 8", type: "blank" },
            { label: "Oficio 9", type: "blank" },
            { label: "Oficio 10", type: "blank" }
        ]
    },


    // ---------------- ELEVACIONES ----------------
    "elevaciones": {
        title: "ELEVACIONES",
        subtitle: "SELECCIONE LA ELEVACION QUE DESEA REALIZAR",
        buttons: [
            { label: "Expediente", type: "file", file: "elevacion_expediente.docx" },
            { label: "98.1 R.A.A.P.", type: "file", file: "elevacion_98_1_raap.docx" },
            { label: "98.2 R.A.A.P.", type: "file", file: "elevacion_98_2_raap.docx" },
            { label: "105 R.A.A.P.", type: "file", file: "elevacion_105_raap.docx" },
            { label: "Elevación Juzgado de Faltas", type: "file", file: "elevacion_juzgado_faltas.docx" },
            { label: "Elevación Juzgado de Paz", type: "file", file: "elevacion_juzgado_paz.docx" },
            { label: "Defensoria del Menor", type: "file", file: "elevacion_def_menor.docx" },
            { label: "Defensoria Penal", type: "file", file: "elevacion_def_penal.docx" }
        ]
    },

    // ---------------- ACTAS ----------------
    "actas": {
        title: "ACTAS",
        subtitle: "SELECCIONE LA NOTIFICACION QUE DESEA REALIZAR",
        buttons: [
            { label: "Procedimiento", type: "file", file: "acta_procedimiento.docx" },
            { label: "Secuestro", type: "file", file: "acta_secuestro.docx" },
            { label: "Allanamiento", type: "file", file: "acta_allanamiento.docx" },
            { label: "Secuestro Automotor", type: "file", file: "acta_secuestro_automotor.docx" },
            { label: "Secuestro Motocicleta", type: "file", file: "acta_secuestro_motocicleta.docx" },
            { label: "Cadena de Custodia", type: "file", file: "acta_cadena_custodia.docx" },
            { label: "Persona Aprehendida", type: "file", file: "acta_persona_aprehendida.docx" },
            { label: "Parte Moviles JP", type: "file", file: "acta_parte_moviles_jp.docx" },
            { label: "Entrega de Elementos", type: "file", file: "acta_entrega_elementos.docx" },
            { label: "Levantamiento imagenes", type: "file", file: "acta_levantamiento_imagenes.docx" }
        ]
    },

    // ---------------- NOTIFICACIONES ----------------
    "notificaciones": {
        title: "NOTIFICACIONES",
        subtitle: "SELECCIONE LA NOTIFICACION QUE DESEA REALIZAR",
        buttons: [
            { label: "Del Personal", type: "file", file: "notificacion_personal.docx" },
            { label: "Imputacion Causa Judicial", type: "file", file: "notificacion_imputacion_judicial.docx" },
            { label: "Libertad Supeditada", type: "file", file: "notificacion_libertad_supeditada.docx" },
            { label: "Ingreso A.A.", type: "file", file: "notificacion_ingreso_aa.docx" },
            { label: "Detención", type: "file", file: "notificacion_detencion.docx" },
            { label: "Citación Administrativa", type: "file", file: "notificacion_citacion_admin.docx" },
            { label: "Libertad A.A.", type: "file", file: "notificacion_libertad_aa.docx" },
            { label: "Exposición", type: "file", file: "notificacion_exposicion.docx" },
            { label: "Citación Judicial", type: "file", file: "notificacion_citacion_judicial.docx" },
            { label: "Libertad Contravencional", type: "file", file: "notificacion_libertad_contravencional.docx" },
            { label: "Medidas Cautelares", type: "file", file: "notificacion_medidas_cautelares.docx" }
        ]
    },

    // ---------------- CERTIFICADOS ----------------
    "certificados": {
        title: "CERTIFICADOS",
        subtitle: "SELECCIONE EL CERTIFICADO QUE DESEA REALIZAR", 
        buttons: [
            { label: "De Denuncia", type: "file", file: "certificado_denuncia.docx" },
            { label: "De Estadia", type: "file", file: "certificado_estadia.docx" },
            { label: "De Domicilio S/T", type: "file", file: "certificado_domicilio_st.docx" },
            { label: "No Voto", type: "file", file: "certificado_no_voto.docx" },
            { label: "De Supervivencia", type: "file", file: "certificado_supervivencia.docx" },
            { label: "De Domicilio C/T", type: "file", file: "certificado_domicilio_ct.docx" },
            { label: "Certificado Medico", type: "file", file: "certificado_medico.docx" },
            { label: "Certificado Medico Menor", type: "file", file: "certificado_medico_menor.docx" }
        ]
    },

    // ---------------- MEMORANDUMS ----------------
    "memorandums": {
        title: "MEMORANDUMS",
        subtitle: "SELECCIONE EL MEMORANDUM QUE DESEA REALIZAR",
        buttons: [
            { label: "Informar Procedimiento", type: "file", file: "memo_informar_procedimiento.docx" },
            { label: "Informar Novedad", type: "file", file: "memo_informar_novedad.docx" },
            { label: "Informar A.R.T.", type: "file", file: "memo_informar_art.docx" },
            { label: "Solicitar Service", type: "file", file: "memo_solicitar_service.docx" },
            { label: "Informar Siniestro Movil", type: "file", file: "memo_informar_siniestro_movil.docx" }
        ]
    },

    // ---------------- LEYES Y REGLAMENTOS ----------------
    "leyes": {
        title: "LEYES Y REGLAMENTOS",
        subtitle: "SELECCIONE LA LEY O REGLAMENTO QUE DESEA CONSULTAR",
        buttons: [
            { label: "Ley 3516", type: "file", file: "ley_3516.pdf" },
            { label: "Ley 1284", type: "file", file: "ley_1284.pdf" },
            { label: "Ley 3358", type: "file", file: "ley_3358.pdf" },
            { label: "Ley 611 ISSN", type: "file", file: "Ley_611_issn.pdf" },
            { label: "R.A.A.P.", type: "file", file: "reglamento_raap.pdf" },
            { label: "R.I.U.O.P.", type: "file", file: "reglamento_riuop.pdf" },
            { label: "R.R.C.P. (Calif.)", type: "file", file: "reglamento_rrcp_calificaciones.pdf" },
            { label: "R.R.C.P. (Dest.)", type: "file", file: "reglamento_rrcp_cambio_destino.pdf" },
            { label: "R.R.C.P. (Corr.)", type: "file", file: "reglamento_rrcp_correspondencia.pdf" },
            { label: "R.R.P.P.", type: "file", file: "reglamento_rrpp.pdf" },
            { label: "R.R.D.P.", type: "file", file: "reglamento_rrdp.pdf" },
            { label: "R.R.L.P.", type: "file", file: "reglamento_rrlp.pdf" }
        ]
    },

    // ---------------- SISTEMAS ----------------
    "sistemas": {
        title: "SISTEMAS",
        subtitle: "SELECCIONE EL SISTEMA A INGRESAR",
        buttons: [
            { label: "ZIMBRA", type: "link", url: "https://mail.zimbra.com" },
            { label: "Sistema Tromen", type: "link", url: "https://tromendenuncias.com/login" },
            { label: "Gmail", type: "link", url: "https://gmail.com" },
            { label: "Acceso Unico", type: "link", url: "#" }, 
            { label: "Whatsapp", type: "link", url: "https://web.whatsapp.com" },
            { label: "Youtube", type: "link", url: "https://youtube.com" },
        ]
    },

    // ---------------- MENORES ----------------
    "menores": {
        title: "MENORES",
        subtitle: "SELECCIONE LA NOTIFICACION QUE DESEA REALIZAR",
        buttons: [
        ]
    },

    // ---------------- LEY 23737 ----------------
    "ley23737": {
        title: "LEY 23737",
        subtitle: "SELECCIONE LA NOTIFICACION QUE DESEA REALIZAR",
        buttons: [
            { label: "Acta Procedimiento", type: "file", file: "ley23737_acta_procedimiento.docx" },
            { label: "Derechos del Imputado", type: "file", file: "ley23737_derechos_imputado.docx" },
            { label: "Ley 23737", type: "file", file: "ley_23737_texto.docx" },
            { label: "Recomendaciones", type: "file", file: "ley23737_recomendaciones.docx" }
        ]
    },

    // ---------------- HIMNOS ----------------
    "himnos": {
        title: "HIMNOS",
        subtitle: "SELECCIONE EL HIMNO O MARCHA", 
        buttons: [
            { label: "Himno Nacional Canto", type: "audio", file: "himno_nacional_canto.mp3" },
            { label: "Himno Nacional Musica", type: "audio", file: "himno_nacional_musica.mp3" },
            { label: "Marcha a Las Malvinas", type: "audio", file: "marcha_malvinas.mp3" },
            { label: "Himno Provincial", type: "audio", file: "himno_provincial.wav" },
            { label: "Mi Bandera", type: "audio", file: "mi_bandera.mp3" },
            { label: "Avenida de las Camelias", type: "audio", file: "avenida_camelias.mp3" },
            { label: "Marcha San Lorenzo", type: "audio", file: "marcha_san_lorenzo.mp3" },
            { label: "Himno a Sarmiento", type: "audio", file: "himno_sarmiento.mp3" },
            { label: "Himno al Gral. San Martin", type: "audio", file: "himno_san_martin.mp3" },
            { label: "Aurora", type: "audio", file: "aurora.mp3" },
            { label: "Minuto de Silencio", type: "audio", file: "minuto_silencio.mp3" }
        ]
    },

    // ---------------- CARATULAS ----------------
    "caratulas": {
        title: "CARATULAS",
        subtitle: "SELECCIONE LA NOTIFICACION QUE DESEA REALIZAR",
        buttons: [
            { label: "I.S.D.", type: "nav", target: "isd" },
            { label: "A.S.D.", type: "nav", target: "asd" },
            { label: "105 R.A.A.P.", type: "file", file: "caratula_105_raap.docx" },
            { label: "98.1 R.A.A.P.", type: "file", file: "caratula_98_1_raap.docx" },
            { label: "JUDICIAL", type: "file", file: "caratula_judicial.docx" },
            { label: "A. A.", type: "file", file: "caratula_aa.docx" },
            { label: "CONTRAVENCIONAL", type: "file", file: "caratula_contravencional.docx" },
            { label: "98.2 R.A.A.P.", type: "file", file: "caratula_98_2_raap.docx" },
        ]
    },

    "isd": {
        title: "Información Sumaria Disciplinaria",
        subtitle: "Ventana de gestión de I.S.D.",
        buttons: [
            { label: "Parte", type: "file", file: "Parte.docx" },
            { label: "Informe", type: "file", file: "Informe.docx" },
            { label: "Declaración Testimonial", type: "file", file: "Declaración_Testimonial.docx" },
            { label: "Declaración Indagatoria", type: "file", file: "Declaración_Indagatoria.docx" },
            { label: "Croquis", type: "file", file: "Croquis.docx" },
            { label: "Memorandum", type: "file", file: "memorandum.docx" },
            { label: "Oficios", type: "nav", target: "oficios" },
            { label: "Elevación", type: "file", file: "Elevación.docx" },
            { label: "Acta A", type: "file", file: "Acta_A.docx" },
            { label: "Acta B", type: "file", file: "Acta_B.docx" },
            { label: "Acta C", type: "file", file: "Acta_C.docx" },
            { label: "Reporte", type: "file", file: "Reporte.docx" },
            { label: "Caratulas", type: "nav", target: "caratulas" }
        ]
    },

    "asd": {
        title: "Actuación Sumaria Disciplinaria",
        subtitle: "Ventana de gestión de A.S.D.",
        buttons: [
            { label: "Parte", type: "file", file: "Parte.docx" },
            { label: "Informe", type: "file", file: "Informe.docx" },
            { label: "Declaración Testimonial", type: "file", file: "Declaración_Testimonial.docx" },
            { label: "Declaración Indagatoria", type: "file", file: "Declaración_Indagatoria.docx" },
            { label: "Croquis", type: "file", file: "Croquis.docx" },
            { label: "Memorandum", type: "file", file: "memorandum.docx" },
            { label: "Oficios", type: "nav", target: "oficios" },
            { label: "Elevación", type: "file", file: "Elevación.docx" },
            { label: "Caratulas", type: "nav", target: "caratulas" }
        ]
    }
};

// --- 2. SISTEMA DE RUTEO Y ESTADO ---
let historyStack = ["inicio"]; // Historial de pantallas
let currentScreenStr = "inicio";
let audioPlayer = null; // Para manejar el audio de los himnos sin recargar

// Crear elemento de audio en el body para mejorar compatibilidad
function initAudioPlayer() {
    if (!audioPlayer) {
        audioPlayer = document.createElement('audio');
        audioPlayer.style.display = 'none';
        document.body.appendChild(audioPlayer);
    }
    return audioPlayer;
}

/**
 * Renderiza la pantalla seleccionada en el contenedor principal.
 */
function renderScreen(screenId) {
    const screenData = screens[screenId];
    if (!screenData) return;

    currentScreenStr = screenId;
    const container = document.getElementById("screen-container");

    let html = ``;

    // Título y subtítulo (solo si no es HOME, o si home tuviera uno particular)
    if (!screenData.isMain && screenData.title) {
        html += `<h2 class="screen-title">${screenData.title}</h2>`;
        html += `<h3 class="screen-subtitle">${screenData.subtitle || ''}</h3>`;
    }

    // Contenedor de contenido
    if (screenData.type === "sitemap") {
        html += renderSitemap();
    } else {
        // Contenedor de botones
        html += `<div class="button-flex">`;

        screenData.buttons.forEach((btn, index) => {
            let cssClass = "btn btn-screen";
            let onClickAction = "";

            // Asignamos una acción basado en el "tipo" que definimos.
            if (btn.type === "nav") {
                onClickAction = `navigateTo('${btn.target}')`;
            } else if (btn.type === "file") {
                onClickAction = `downloadFile('${btn.label}', '${btn.file || ''}')`;
            } else if (btn.type === "link") {
                onClickAction = `openLink('${btn.url}')`;
            } else if (btn.type === "blank") {
                cssClass += " btn-blank";
                onClickAction = `alert('Funcionalidad próximamente disponible.')`;
            } else if (btn.type === "audio") {
                onClickAction = `playAudio('${btn.label}', '${btn.file}')`;
            }

            html += `<button class="${cssClass}" onclick="${onClickAction}">${btn.label}</button>`;
        });

        html += `</div>`;
    }

    // Inyectar el HTML con opacidad 0 y animarlo (fade in provisto por CSS keyframes o forzando reflujo)
    container.innerHTML = html;

    updateNavigationButtons();
}

function renderSitemap() {
    // Función auxiliar para obtener botones de tipo "file" de una pantalla
    function getFileButtons(screenId) {
        const screen = screens[screenId];
        if (!screen || !screen.buttons) return [];
        return screen.buttons.filter(btn => btn.type === 'file');
    }

    // Función auxiliar para renderizar una pantalla con sus archivos
    function renderScreenWithFiles(screenId, screenName) {
        const fileButtons = getFileButtons(screenId);
        let html = `<div class="sitemap-screen-container">
            <div class="sitemap-node sitemap-screen">${screenName}</div>`;
        
        if (fileButtons.length > 0) {
            html += `<ul class="sitemap-file-list">`;
            fileButtons.forEach(btn => {
                html += `<li class="sitemap-file-item">${btn.label}</li>`;
            });
            html += `</ul>`;
        }
        
        html += `</div>`;
        return html;
    }

    return `
        <div class="sitemap-tree">
            <div class="sitemap-node sitemap-root">Login</div>
            <div class="sitemap-line sitemap-line--vertical"></div>
            <div class="sitemap-node sitemap-mid">Pantalla de Selección de Área</div>
            
            <!-- PRIMERA FILA: ÁREAS DE TRABAJO -->
            <div class="sitemap-row sitemap-branches">
                <div class="sitemap-column">
                    ${renderScreenWithFiles('denuncias', 'Denuncias')}
                    ${renderScreenWithFiles('actas', 'Actas')}
                    ${renderScreenWithFiles('certificados', 'Certificados')}
                </div>
                <div class="sitemap-column">
                    ${renderScreenWithFiles('oficinaAdministrativa', 'Oficina Administrativa')}
                    ${renderScreenWithFiles('oficinaIntervencionPrimaria', 'Intervención Primaria')}
                </div>
                <div class="sitemap-column">
                    ${renderScreenWithFiles('oficios', 'Oficios')}
                    ${renderScreenWithFiles('elevaciones', 'Elevaciones')}
                    ${renderScreenWithFiles('notificaciones', 'Notificaciones')}
                </div>
            </div>

            <div class="sitemap-line sitemap-line--vertical"></div>

            <!-- SEGUNDA FILA: RECURSOS Y REFERENCIAS -->
            <div class="sitemap-row sitemap-branches">
                <div class="sitemap-column">
                    ${renderScreenWithFiles('leyes', 'Leyes y Reglamentos')}
                </div>
                <div class="sitemap-column">
                    ${renderScreenWithFiles('ley23737', 'Ley 23737')}
                </div>
                <div class="sitemap-column">
                    ${renderScreenWithFiles('caratulas', 'Caratulas')}
                </div>
            </div>
        </div>
    `;
}

/**
 * Navega hacia una nueva pantalla
 */
function navigateTo(targetId) {
    if (historyStack[historyStack.length - 1] !== targetId) {
        historyStack.push(targetId);
    }
    renderScreen(targetId);
}

/**
 * Regresa a la pantalla anterior
 */
function goBack() {
    if (historyStack.length > 1) {
        historyStack.pop(); // Sacar la actual
        const prevScreen = historyStack[historyStack.length - 1]; // Obtener la anterior
        renderScreen(prevScreen);
    }
}

/**
 * Regresa a Inicio limpiando el historial
 */
function goHome() {
    // Si estamos reproduciendo un audio y volvemos a inicio, podríamos pararlo.
    stopAudio();
    historyStack = ["pantallaInicio"];
    renderScreen("pantallaInicio");
}

/**
 * Función de "Siguiente". 
 * Como esta app funciona en forma de estrella (Inicio -> Sección), 
 * el botón siguiente original no tiene un camino claro a menos que se guarde el "forwardStack".
 * Lo deshabilitaremos o emitiremos un aviso por ahora.
 */
function goForward() {
    alert("Función 'Siguiente' no habilitada. Usa el botón de Inicio para volver al menú central.");
}

/**
 * Actualiza el estado Disabled/Enabled de los botones de abajo.
 */
function updateNavigationButtons() {
    const btnAnterior = document.getElementById("btn-anterior");

    if (historyStack.length > 1) {
        btnAnterior.disabled = false;
    } else {
        btnAnterior.disabled = true;
    }
    // Siguiente siempre en disabled o se puede habilitar si armamos logica de rehacer
}

/**
 * Simuladores de Funciones de Escritorio
 */
function downloadFile(docName, docFile) {
    if (!docFile) {
        alert(`Preparando archivo: "${docName}"...\n(No se ha definido el nombre de archivo técnico).`);
        return;
    }

    const fileUrl = 'assets/' + docFile;
    
    // Si es un PDF, se abrirá nativamente en la mayoría de navegadores.
    // Si es un DOCX, el comportamiento por defecto es descarga.
    // Para "abrirlo" como un PDF, una opción es usar el visor de Office Online si el sitio es público.
    
    const isDocx = docFile.toLowerCase().endsWith('.docx') || docFile.toLowerCase().endsWith('.doc');
    
    if (isDocx && window.location.protocol.startsWith('http')) {
        // Solo intentamos el visor si NO estamos en local (file://)
        const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(window.location.origin + '/' + fileUrl)}`;
        window.open(viewerUrl, '_blank');
    } else {
        // Comportamiento estándar: abre en nueva pestaña (PDF se ve, DOCX se descarga)
        window.open(fileUrl, '_blank');
    }
}

function openLink(url) {
    window.open(url, '_blank');
}

function openSuggestion() {
    const whatsappNumber = '542948451453';
    const message = encodeURIComponent('Hola Comisario, quiero enviar una sugerencia.');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

function playAudio(name, file) {
    stopAudio(); // Detener cualquier audio previo
    
    try {
        const audio = initAudioPlayer();
        const filePath = 'assets/' + file;
        
        // Establecer atributos antes de asignar src
        audio.controls = true;
        audio.preload = 'auto';
        audio.type = 'audio/mpeg';
        
        // Manejador para cuando el audio está listo
        audio.onloadeddata = function() {
            console.log("Audio cargado:", filePath);
            audio.play().catch(function(error) {
                console.error("Error al reproducir:", error);
                alert(`Error al reproducir: "${name}"\n${error.message}`);
            });
        };
        
        // Manejador de errores
        audio.onerror = function(e) {
            console.error("Error de carga de audio:", audio.error);
            alert(`Error: No se pudo cargar ${file}\nVerifica que el archivo exista en assets/`);
        };
        
        // Manejador para timeout
        audio.ontimeout = function() {
            alert(`Timeout: El archivo ${file} tardó demasiado en cargar`);
        };
        
        // Asignar fuente y cargar
        audio.src = filePath;
        audio.load();
        
        console.log("Intentando reproducir:", filePath);
        alert(`Reproduciendo: "${name}"`);
        
    } catch (e) {
        console.error("Excepción en playAudio:", e);
        alert(`Error: ${e.message}`);
    }
}

function stopAudio() {
    if (audioPlayer && audioPlayer.tagName === 'AUDIO') {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
}

function salirApp() {
    if (confirm("¿Está seguro que desea cerrar la Gestión de Trámites?")) {
        // En un navegador real window.close() puede fallar, pero se pone un mensaje lindo de despedida.
        document.body.innerHTML = `
        <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #0d1b2a;">
            <h1 style="color: white; font-size: 3rem; font-style: italic;">Sesión Finalizada. Puede cerrar la pestaña.</h1>
        </div>`;
    }
}

// Iniciar aplicación
document.addEventListener("DOMContentLoaded", () => {
    loadSavedLPs();
});
