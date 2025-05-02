document.addEventListener("DOMContentLoaded", async () => {
    // Registro del plugin
    Chart.register(ChartDataLabels);
  
    const idEncuesta = localStorage.getItem("encuestaIdParaReporte");

  
    const encuesta = await fetchJSON(`/api/GetEncuestaById?id=${idEncuesta}`);
    const preguntas = await fetchJSON(`/api/preguntas/${idEncuesta}`);
    const resumenOpciones = await fetchJSON(`/api/opcionresumen/${idEncuesta}`);
    const resumenEscala = await fetchJSON(`/api/EscalaResumen/${idEncuesta}`);
  
    console.log(encuesta, preguntas, resumenOpciones, resumenEscala);
  
    renderizarEncuesta(encuesta);
    renderizarPreguntas(preguntas, resumenOpciones, resumenEscala);
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
      <p><strong>Expira:</strong> ${new Date(encuesta.fechaExpiracion).toLocaleDateString()}</p>
<button id="descargar-reporte" class="btn btn-danger btn-lg" onclick = "ReportePDF(${encuesta.encuestaId})">
  <span class="bi bi-file-earmark-pdf"></span> Descargar Reporte
</button>


    `;
  }
  
  function renderizarPreguntas(preguntas, resumenOpciones, resumenEscala) {
    const container = document.getElementById("preguntas-container");
    container.innerHTML = "";
  
    preguntas.forEach(p => {
      const item = document.createElement("div");
      item.classList.add("pregunta-item");
  
      item.innerHTML = `<h4>${p.textoPregunta}</h4>`;
  
      const canvas = document.createElement("canvas");
      canvas.style.maxWidth = "600px";
      canvas.style.height = "300px";
      item.appendChild(canvas);
  
      if (p.tipo === 0) {
        const datos = resumenOpciones.filter(o => o.preguntaId === p.preguntaId);
        const total = datos.reduce((acc, d) => acc + d.vecesSeleccionada, 0);
        const labels = datos.map(d => d.textoOpcion);
        const valores = datos.map(d => d.vecesSeleccionada);
        const colores = generarColores(labels.length);
  
        new Chart(canvas, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Veces seleccionada',
              data: valores,
              backgroundColor: colores
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              datalabels: {
                anchor: 'center',  
                align: 'center',   
                color: '#fff',     
                font: {
                  weight: 'bold'
                },
                formatter: (value) => {
                  const porcentaje = ((value / total) * 100).toFixed(1);
                  return `${porcentaje}%`; 
                }
              }
            },
            scales: {
              y: { beginAtZero: true, stepSize: 1 }
            }
          }
        });
      }
  
      if (p.tipo === 1 || p.tipo === 2) {
        const escala = resumenEscala.find(e => e.preguntaId === p.preguntaId);
        if (escala) {
          new Chart(canvas, {
            type: 'bar',
            data: {
              labels: ['Promedio', 'Moda', 'Mediana'],
              datasets: [{
                label: 'Estadísticas',
                data: [escala.promedio, escala.moda, escala.mediana],
                backgroundColor: ['#ffcd56', '#36a2eb', '#ff6384']
              }]
            },
            options: {
              responsive: true,
              plugins: {
                legend: { display: false },
                datalabels: {
                  anchor: 'center',
                  align: 'center',
                  color: '#fff',
                  font: {
                    weight: 'bold'
                  },
                  formatter: (value) => value.toFixed(1) // Muestra el valor dentro de la barra
                }
              },
              scales: {
                y: { beginAtZero: true, stepSize: 1 }
              }
            }
          });
        }
      }
  
      container.appendChild(item);
    });
  }
  
  function generarColores(cantidad) {
    const baseColors = [
      "#4dc9f6", "#f67019", "#f53794", "#537bc4", "#acc236", "#166a8f",
      "#00a950", "#58595b", "#8549ba", "#e6194b", "#3cb44b", "#ffe119",
      "#4363d8", "#f58231"
    ];
    const colores = [];
    for (let i = 0; i < cantidad; i++) {
      colores.push(baseColors[i % baseColors.length]);
    }
    return colores;
  }
  
  function ReportePDF(idEncuesta)
  {
    window.location.href = `../InterfazTareas/ReportePDF.html?encuestaIdParaReporte=${idEncuesta}`;
  }