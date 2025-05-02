document.addEventListener("DOMContentLoaded", async () => {
    const encuestaId = obtenerIdEncuestaDesdeURL();
    if (encuestaId) {
      const encuesta = await obtenerEncuesta(encuestaId);
    const estaExpirada = new Date(encuesta.fechaExpiracion) < new Date();
    if (estaExpirada) {
      window.location.href = `../InterfazTareas/EncuestaExpirada.html`;
      return;
    }
      if (encuesta) {
        renderizarEncuesta(encuesta);
      } else {
        alert("No se encontró la encuesta.");
      }
    } else {
      alert("No se proporcionó un ID de encuesta.");
    }
  });
  
  function obtenerIdEncuestaDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }
  
  async function obtenerEncuesta(id) {
    const response = await fetch(`https://localhost:7113/api/GetEncuestaById?id=${id}`);
    const data = await response.json();
    if (data) {
      console.log("Encuesta:", data);
    } else {
      console.error("No se pudo obtener la encuesta.");
    }
    return data;
  }
  
  async function obtenerPreguntas(idEncuesta) {
    const response = await fetch(`https://localhost:7113/api/preguntas/${idEncuesta}`);
    if (!response.ok) {
      console.error("Error al obtener las preguntas.");
      return [];
    }
    const data = await response.json();
    console.log("Preguntas obtenidas:", data);
    return data;
  }
  
  async function obtenerOpcionesPregunta(idPregunta) {
    console.log(idPregunta);
    const response = await fetch(`https://localhost:7113/api/OpcionesPregunta/${idPregunta}`);
    const data = await response.json();
    console.log("Opciones de la pregunta:", data);
    return data;
  }
  
  async function renderizarEncuesta(encuesta) {
    const encuestaContainer = document.getElementById("encuesta-container");
    encuestaContainer.innerHTML = `
      <h2>${encuesta.titulo}</h2>
      <p><strong>Descripción:</strong> ${encuesta.descripcion}</p>
      <p><strong>Fecha de Expiración:</strong> ${new Date(encuesta.fechaExpiracion).toLocaleDateString()}</p>
    `;
  
    const preguntas = await obtenerPreguntas(encuesta.encuestaId);
    if (preguntas.length > 0) {
      await renderizarPreguntas(preguntas);
    } else {
      const preguntasContainer = document.getElementById("preguntas-container");
      preguntasContainer.innerHTML = "<p>No hay preguntas disponibles para esta encuesta.</p>";
    }
  }
  async function obtenerUsuario(id) {
    const res = await fetch(`https://localhost:7113/api/usuarios/${id}`);
    return await res.json();
  }
  async function renderizarPreguntas(preguntas) {
    const preguntasContainer = document.getElementById("preguntas-container");
    preguntasContainer.innerHTML = ''; // Limpiar contenido previo
  
    if (preguntas.length === 0) {
      preguntasContainer.innerHTML = "<p>No hay preguntas en esta encuesta.</p>";
      return;
    }
  
    for (const pregunta of preguntas) {
      const preguntaElement = document.createElement("div");
      preguntaElement.classList.add("pregunta-item");
  
      // Título de la pregunta
      preguntaElement.innerHTML = `
        <h4>${pregunta.textoPregunta}</h4>
      `;
  
      // Tipo 0 y 1: Escala numerica 
      if (pregunta.tipo === 1 || pregunta.tipo === 2) {
        const maxValor = pregunta.tipo === 1 ? 5 : 10;
        const opcionesElement = document.createElement("div");
        opcionesElement.classList.add("escala-horizontal");
  
        for (let i = 1; i <= maxValor; i++) {
          const radioId = `pregunta${pregunta.preguntaId}_opcion${i}`;
  
          const input = document.createElement("input");
          input.type = "radio";
          input.name = `pregunta${pregunta.preguntaId}`;
          input.value = i;
          input.id = radioId;
          input.dataset.tipo = pregunta.tipo;
  
          const label = document.createElement("label");
          label.setAttribute("for", radioId);
          label.classList.add("opcion-label");
          label.textContent = i;
  
          opcionesElement.appendChild(input);
          opcionesElement.appendChild(label);
        }
  
        preguntaElement.appendChild(opcionesElement);
      }
  
      // Tipo 2: Selección de opciones desde la API
      if (pregunta.tipo === 0) {
        console.log("esta", pregunta);
        const opcionesElement = document.createElement("div");
        opcionesElement.classList.add("opciones-container");
  
        const opciones = await obtenerOpcionesPregunta(pregunta.preguntaId);
        if (opciones && opciones.length > 0) {
          for (const opcion of opciones) {
            const opcionId = `pregunta${pregunta.preguntaId}_opcion${opcion.opcionId}`;
  
            const input = document.createElement("input");
            input.type = "radio";
            input.name = `pregunta${pregunta.preguntaId}`;
            input.value = opcion.textoOpcion;
            input.id = opcionId;
  
            const label = document.createElement("label");
            label.setAttribute("for", opcionId);
            label.textContent = opcion.textoOpcion;
  
            const opcionDiv = document.createElement("div");
            opcionDiv.appendChild(input);
            opcionDiv.appendChild(label);
  
            opcionesElement.appendChild(opcionDiv);
          }
          preguntaElement.appendChild(opcionesElement);
        } else {
          preguntaElement.innerHTML += `<p>No hay opciones disponibles.</p>`;
        }
      }
  
      preguntasContainer.appendChild(preguntaElement);
    }
  }
  
  document.getElementById("submit-btn").addEventListener("click", async () => {
    const radios = document.querySelectorAll("input[type='radio']");
    const preguntasRespondidas = new Set();
    const respuestasSeleccionadas = [];
    radios.forEach(radio => {
      if (radio.checked) {
        const tipo = parseInt(radio.dataset.tipo); 
        preguntasRespondidas.add(radio.name);
        respuestasSeleccionadas.push({
          preguntaId: parseInt(radio.name.replace("pregunta", "")),
          tipo: tipo,
          valor: parseInt(radio.value),
          opcionTexto: radio.value 
        });
      }
    });
    
  
    // Validar que todas las preguntas fueron respondidas
    const totalPreguntas = new Set();
    radios.forEach(radio => totalPreguntas.add(radio.name));
  
    if (preguntasRespondidas.size !== totalPreguntas.size) {
      alert("Por favor, responde todas las preguntas antes de enviar.");
      return;
    }
  
    try {
      const encuestaId = obtenerIdEncuestaDesdeURL();
      let usuarioId = localStorage.getItem("idUsuario");
       if(usuarioId == null)
       {
        usuarioId = 1004;
       }
      
  
      // 1. Crear respuesta principal
      const respuestaId = await crearRespuesta(encuestaId, usuarioId);
      console.log(respuestaId);
      const usuario = await obtenerUsuario(usuarioId);
      const encuesta = await obtenerEncuesta(encuestaId);
     await sendMail(usuario.nombre, encuesta.titulo);
      for (const respuesta of respuestasSeleccionadas) {
        if (respuesta.tipo === 1 || respuesta.tipo === 2) {
          // Tipo escala
          await fetch("https://localhost:7113/api/DetalleRespuesta", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              respuestaId,
              preguntaId: respuesta.preguntaId,
              valor: respuesta.valor
            })
          });
        } else {
          // Tipo opcion múltiple
          const opciones = await obtenerOpcionesPregunta(respuesta.preguntaId);
          const opcionSeleccionada = opciones.find(op => op.textoOpcion == respuesta.opcionTexto);
      
          if (!opcionSeleccionada) {
            console.error("No se encontró la opción seleccionada para la pregunta:", respuesta.preguntaId);
            continue;
          }
      
          await fetch("https://localhost:7113/api/DetalleRespuesta", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              respuestaId,
              preguntaId: respuesta.preguntaId,
              opcionId: opcionSeleccionada.opcionId
            })
          });
        }
      }
      
      alert("¡Respuestas enviadas correctamente!");
      if(usuarioId != 1004)
      {
      window.location.href = `../InterfazTareas/verRespuestas.html?id=${encuestaId}&userId=${usuarioId}`;
      }
      else
      {
        window.location.href = `../InterfazTareas/EncuestaCompletada.html`;
      }
    } catch (error) {
      console.error("Error al enviar respuestas:", error);
      alert("Hubo un error al enviar las respuestas.");
    }
  });
  async function crearRespuesta(encuestaId, usuarioId) {
    console.log(encuestaId, usuarioId);
    const response = await fetch("https://localhost:7113/api/Respuestas/api/respuestas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        encuestaId,
        usuarioId
      })
    });
  
    if (!response.ok) {
      throw new Error("No se pudo crear la respuesta.");
    }
  
    const data = await response.json();
    return data.respuestaId;
  }
  
  async function sendMail(usuarioNombre, titulo)
  {
    let parms =
    {
      usuario : usuarioNombre,
      titulo_encuesta: titulo
    }
    emailjs.send("service_8k0eezn","template_77jcsih", parms);
  }