document.addEventListener("DOMContentLoaded", async () => {
    // Registro del plugin
    const idEncuesta = localStorage.getItem("encuestaIdParaReporte");
  
    const encuesta = await fetchJSON(`/api/GetEncuestaById?id=${idEncuesta}`);
    const preguntas = await fetchJSON(`/api/preguntas/${idEncuesta}`);
    const resumenOpciones = await fetchJSON(`/api/opcionresumen/${idEncuesta}`);
    const resumenEscala = await fetchJSON(`/api/escalaResumen/${idEncuesta}`);
  
    console.log(encuesta, preguntas, resumenOpciones, resumenEscala);
  
    renderizarEncuesta(encuesta);
    renderizarPreguntas(preguntas, resumenOpciones, resumenEscala);
  
    // Boton de exportar a PDF
    document.getElementById("exportar-pdf").addEventListener("click", () => {
      exportarPDF();
    });
  });
  
  async function fetchJSON(url) {
    const res = await fetch(`https://localhost:7113${url}`);
    return await res.json();
  }
  
  function renderizarEncuesta(encuesta) {
    const contenedor = document.getElementById("encuesta-container");
    contenedor.innerHTML = `
      <h2>${encuesta.titulo}</h2>
      <p><strong>Descripción:</strong> ${encuesta.descripcion}</p>
      <p><strong>Fecha de Creacion:</strong> ${new Date(encuesta.fechaCreacion).toLocaleDateString()}</p>
    `;
  }
  
  function renderizarPreguntas(preguntas, resumenOpciones, resumenEscala) {
    const container = document.getElementById("preguntas-container");
    container.innerHTML = "";
  
    preguntas.forEach(p => {
      const item = document.createElement("div");
      item.classList.add("pregunta-item");
  
      item.innerHTML = `<h4>${p.textoPregunta}</h4>`;
  
      if (p.tipo === 0) {  // Opcion múltiple
        const datos = resumenOpciones.filter(o => o.preguntaId === p.preguntaId);
        const total = datos.reduce((acc, d) => acc + d.vecesSeleccionada, 0);
  
        let opcionesHTML = "<ul>";
        datos.forEach(d => {
          const porcentaje = ((d.vecesSeleccionada / total) * 100).toFixed(1);
          opcionesHTML += `<li>${d.textoOpcion}: ${d.vecesSeleccionada} (${porcentaje}%)</li>`;
        });
        opcionesHTML += "</ul>";
  
        item.innerHTML += opcionesHTML;
      }
  
      if (p.tipo === 1 || p.tipo === 2) {  // Escala
        const escala = resumenEscala.find(e => e.preguntaId === p.preguntaId);
        if (escala) {
          item.innerHTML += `
            <p><strong>Promedio:</strong> ${escala.promedio.toFixed(1)}</p>
            <p><strong>Moda:</strong> ${escala.moda}</p>
            <p><strong>Mediana:</strong> ${escala.mediana}</p>
          `;
        }
      }
  
      container.appendChild(item);
    });
  }
  
  function exportarPDF() {
    const element = document.getElementById("encuesta-container");
    const preguntasContainer = document.getElementById("preguntas-container");
  
    const reportContainer = document.createElement("div");
    reportContainer.setAttribute("id", "pdf-reporte");
    reportContainer.innerHTML = `
      <h1>📝 Reporte de Encuesta</h1>
      <div id="encuesta-info">${element.innerHTML}</div>
      <hr>
      <div id="preguntas-info">${preguntasContainer.innerHTML}</div>
    `;
  
    const opt = {
      margin:       0.5,
      filename:     'Reporte_Encuesta.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
  
    html2pdf().set(opt).from(reportContainer).save();
  }
  