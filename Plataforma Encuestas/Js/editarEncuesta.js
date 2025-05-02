document.addEventListener('DOMContentLoaded', async () => {
    const id = localStorage.getItem("encuestaIdParaEditar");
    const encuesta = await obtenerEncuesta(id);
    await renderizarFormularioEdicion(encuesta);
  });
  
async function renderizarFormularioEdicion(encuesta) {
    // Llenar campos principales
    document.getElementById('edit-titulo').value = encuesta.titulo;
    document.getElementById('edit-descripcion').value = encuesta.descripcion;
    document.getElementById('edit-estado').value = encuesta.esPublica;
    document.getElementById('edit-fechaVencimiento').value = encuesta.fechaExpiracion.slice(0, 10);
  
    const preguntas = await obtenerPreguntas(encuesta.encuestaId);
    const container = document.getElementById("preguntas-edicion-container");
    container.innerHTML = '';
    for (const pregunta of preguntas) {
        const div = document.createElement("div");
        div.classList.add("pregunta-edicion");
      
        let tipoSelectHTML = '';
        let tipoSelectDisabled = '';
      
        if (pregunta.tipo === 0) {
          
          tipoSelectHTML = `<option value="0" selected>Opción múltiple</option>`;
          tipoSelectDisabled = 'disabled';
        } else {
          // Solo se permite cambiar entre escala 1-5 y escala 1-10
          tipoSelectHTML = `
            <option value="1" ${pregunta.tipo === 1 ? 'selected' : ''}>Escala 1-5</option>
            <option value="2" ${pregunta.tipo === 2 ? 'selected' : ''}>Escala 1-10</option>
          `;
        }
      
        div.innerHTML = `
          <h4>Editar Pregunta</h4>
          <input type="text" name="preguntaTexto" value="${pregunta.textoPregunta}" data-id="${pregunta.preguntaId}" />
      
          <label for="tipoPregunta_${pregunta.preguntaId}">Tipo de pregunta:</label>
          <select name="tipoPregunta" data-id="${pregunta.preguntaId}" id="tipoPregunta_${pregunta.preguntaId}" ${tipoSelectDisabled}>
            ${tipoSelectHTML}
          </select>
      
          <div class="opciones-container" id="opciones_${pregunta.preguntaId}"></div>
        `;
      
        container.appendChild(div);
      
        if (pregunta.tipo === 0) {
          const opciones = await obtenerOpcionesPregunta(pregunta.preguntaId);
          const opcionesContainer = document.getElementById(`opciones_${pregunta.preguntaId}`);
          for (const opcion of opciones) {
            const input = document.createElement("input");
            input.type = "text";
            input.name = "opcionTexto";
            input.value = opcion.textoOpcion;
            input.setAttribute("data-opcion-id", opcion.opcionId);
            opcionesContainer.appendChild(input);
            opcionesContainer.appendChild(document.createElement("br"));
          }
        }
      }
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
  document.getElementById("form-editar-encuesta").addEventListener("submit", async (e) => {
    e.preventDefault();
    //Validaciones pa que no me dejen na vacio klk
    const titulo = document.getElementById("edit-titulo").value.trim();
    const descripcion = document.getElementById("edit-descripcion").value.trim();
    const fechaExpiracion = document.getElementById("edit-fechaVencimiento").value.trim();
  
    if (!titulo || !descripcion || !fechaExpiracion) {
      alert("Por favor, completa todos los campos principales (Título, Descripción y Fecha de vencimiento).");
      return;
    }
  
    // Validar preguntas
    const preguntaElements1 = document.querySelectorAll(".pregunta-edicion");
    for (const preguntaDiv of preguntaElements1) {
      const textoInput = preguntaDiv.querySelector('input[name="preguntaTexto"]');
      if (!textoInput.value.trim()) {
        alert("Todas las preguntas deben tener texto.");
        return;
      }
  
      const tipo = parseInt(preguntaDiv.querySelector('select[name="tipoPregunta"]').value);
      if (tipo === 0) {
        const opcionInputs = preguntaDiv.querySelectorAll('input[name="opcionTexto"]');
        for (const input of opcionInputs) {
          if (!input.value.trim()) {
            alert("Las opciones de preguntas tipo múltiple no pueden estar vacías.");
            return;
          }
        }
      }
    }
    const fechaExpiracionInput = document.getElementById("edit-fechaVencimiento").value.trim();
const fechaExpiracion1 = new Date(fechaExpiracionInput);
const hoy = new Date();

// Ajustamos la hora a las 00:00 para solo comparar fechas
hoy.setHours(0, 0, 0, 0);

if (fechaExpiracion1 <= hoy) {
  alert("La fecha de vencimiento debe ser mayor que la fecha actual.");
  return;
}

    const id = localStorage.getItem("encuestaIdParaEditar");
    const encuesta = {
      encuestaId: id,
      titulo: document.getElementById("edit-titulo").value,
      descripcion: document.getElementById("edit-descripcion").value,
      esPublica: document.getElementById("edit-estado").value === "true",
      fechaExpiracion: document.getElementById("edit-fechaVencimiento").value
    };
  
    const preguntas = [];
    const preguntaElements = document.querySelectorAll(".pregunta-edicion");
  
    preguntaElements.forEach(preguntaDiv => {
      const textoInput = preguntaDiv.querySelector('input[name="preguntaTexto"]');
      const tipoSelect = preguntaDiv.querySelector('select[name="tipoPregunta"]');
      const preguntaId = parseInt(textoInput.getAttribute("data-id"));
  
      const pregunta = {
        preguntaId: preguntaId,
        tipo: parseInt(tipoSelect.value),
        textoPregunta: textoInput.value
      };
  
      preguntas.push(pregunta);
    });
  
    const opciones = [];
    const opcionInputs = document.querySelectorAll('input[name="opcionTexto"]');
  
    opcionInputs.forEach(input => {
      opciones.push({
        opcionId: parseInt(input.getAttribute("data-opcion-id")),
        textoOpcion: input.value
      });
    });
  
    try {
      // Enviar encuesta
      await fetch(`https://localhost:7113/api/encuestas/updateEncuesta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(encuesta)
      });
  
      // Enviar preguntas
      for (const pregunta of preguntas) {
        await fetch(`https://localhost:7113/api/preguntas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pregunta)
        });
      }
  
      // Enviar opciones 
      for (const opcion of opciones) {
        await fetch(`https://localhost:7113/api/OpcionesPregunta`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(opcion)
        });
      }
     
      alert("Encuesta actualizada correctamente");
      window.location.href = "../InterfazTareas/PanelAdmin.html";
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Hubo un error al guardar los cambios.");
    }
  });
  