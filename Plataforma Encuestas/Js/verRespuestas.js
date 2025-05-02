document.addEventListener("DOMContentLoaded", async () => {
    const { idEncuesta, userId } = obtenerParametrosDesdeURL();
    console.log("Encuesta:", idEncuesta);
    console.log("Usuario:", userId);
    
    if (!idEncuesta) {
      alert("ID de encuesta no proporcionado.");
      return;
    }
  
    const encuesta = await obtenerEncuesta(idEncuesta);
    const preguntas = await obtenerPreguntas(idEncuesta);
    const respuesta = await obtenerRespuesta(idEncuesta, userId);
      const detalles = await obtenerDetallesRespuestas(respuesta.respuestaId);
      console.log(detalles);
    renderizarEncuesta(encuesta);
    await renderizarPreguntas(preguntas, detalles);
  });
  
  function obtenerParametrosDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    const idEncuesta = params.get("id");
    const userId = params.get("userId");
    return { idEncuesta, userId };
  }
  
  
  async function obtenerEncuesta(id) {
    const res = await fetch(`https://localhost:7113/api/GetEncuestaById?id=${id}`);
    return await res.json();
  }
  
  async function obtenerPreguntas(encuestaId) {
    const res = await fetch(`https://localhost:7113/api/preguntas/${encuestaId}`);
    return await res.json();
  }
  
  async function obtenerOpcionesPregunta(preguntaId) {
    const res = await fetch(`https://localhost:7113/api/OpcionesPregunta/${preguntaId}`);
    return await res.json();
  }
  async function obtenerRespuesta(idEncuesta, idUsuario) {
    const res = await fetch(` https://localhost:7113/api/Respuestas/api/respuestasEncuesta?idEncuesta=${idEncuesta}&userId=${idUsuario}`);
    return await res.json();
  }
  async function obtenerDetallesRespuestas(respuestaID) {
    const usuarioId = localStorage.getItem("idUsuario");
    const res = await fetch(`https://localhost:7113/api/DetalleRespuesta/${respuestaID}`);
    return await res.json();
  }
  
  
  async function obtenerDetallesRespuestas(respuestaID) {
    const usuarioId = localStorage.getItem("idUsuario");
    const res = await fetch(`https://localhost:7113/api/DetalleRespuesta/${respuestaID}`);
    return await res.json();
  }
  
  function renderizarEncuesta(encuesta) {
    const contenedor = document.getElementById("encuesta-container");
    contenedor.innerHTML = `
      <h2>${encuesta.titulo}</h2>
      <p><strong>Descripción:</strong> ${encuesta.descripcion}</p>
      <p><strong>Expira:</strong> ${new Date(encuesta.fechaExpiracion).toLocaleDateString()}</p>
    `;
  }
  
  async function renderizarPreguntas(preguntas, detallesRespuestas) {
    const container = document.getElementById("preguntas-container");
    container.innerHTML = "";
  
    for (const pregunta of preguntas) {
      const detalle = detallesRespuestas.find(d => d.preguntaId === pregunta.preguntaId);
      const item = document.createElement("div");
      item.classList.add("pregunta-item");
  
      item.innerHTML = `<h4>${pregunta.textoPregunta}</h4>`;
  
      if (pregunta.tipo === 0) {
        const opciones = await obtenerOpcionesPregunta(pregunta.preguntaId);
        const contenedorOpciones = document.createElement("div");
        contenedorOpciones.classList.add("opciones-container");
  
        opciones.forEach(op => {
          const label = document.createElement("label");
          label.textContent = op.textoOpcion;
          label.classList.add("opcion-label");
  
          if (detalle?.opcionId === op.opcionId) {
            label.classList.add("seleccionada");
          }
  
          contenedorOpciones.appendChild(label);
        });
  
        item.appendChild(contenedorOpciones);
      }
  
      if (pregunta.tipo === 1 || pregunta.tipo === 2) {
        const max = pregunta.tipo === 1 ? 5 : 10;
        const contenedorEscala = document.createElement("div");
        contenedorEscala.classList.add("escala-horizontal");
  
        for (let i = 1; i <= max; i++) {
          const label = document.createElement("label");
          label.textContent = i;
          label.classList.add("opcion-label");
  
          if (detalle?.valor === i) {
            label.classList.add("seleccionada");
          }
  
          contenedorEscala.appendChild(label);
        }
  
        item.appendChild(contenedorEscala);
      }
  
      container.appendChild(item);
    }
  }
  