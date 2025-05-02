const dashboardUrl = "https://localhost:7113/api/dashboard/encuestas"; 
let allSurveys = [];

async function cargarDashboard() {
  try {
    const response = await fetch(dashboardUrl);
    allSurveys = await response.json();
    allSurveys.sort((a, b) => {
      const hasRespuestasA = a.totalRespuestas > 0 ? 1 : 0;
      const hasRespuestasB = b.totalRespuestas > 0 ? 1 : 0;
      return hasRespuestasB - hasRespuestasA;
    });
    renderDashboard(allSurveys);
  } catch (error) {
    console.error('Error al cargar el dashboard:', error);
  }
}

function renderDashboard(encuestas) {
  const container = document.getElementById('dashboard-list');
  container.innerHTML = '';

  if (encuestas.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted">
        <p>No hay encuestas disponibles.</p>
      </div>
    `;
    return;
  }

  // Mostrar resumen principal
  renderResumen(encuestas, container);

  encuestas.forEach(encuesta => {
    const card = document.createElement('div');
    card.className = 'task-item mb-3 p-3 d-flex justify-content-between align-items-start border rounded';

    card.innerHTML = `
      <div>
        <h5>${encuesta.titulo}</h5>
        <p><strong>Fecha de Creacion:</strong> ${formatearFecha(encuesta.fecha)}</p>
        <p><strong>Total de respuestas:</strong> ${encuesta.totalRespuestas}</p>
      </div>
      ${encuesta.totalRespuestas > 0
        ? `  <div class="d-flex justify-content-center align-items-center">
    <button id = "btn-report" class="btn btn-primary btn-lg mb-2" onclick="verReporte(${encuesta.encuestaId})">
      <i class="fas fa-chart-pie"></i> Ver Reporte
    </button>
      </div>`
      :   `<div class="d-flex justify-content-center align-items-center">
      <button id = "btn-report" class="btn btn-info btn-lg mb-2">
        <i class="fas fa-ban"></i> Sin Respuestas
      </button>
        </div>`
      }
 
    `;

    container.appendChild(card);
  });
}

function renderResumen(encuestas, container) {
  const totalEncuestas = encuestas.length;
  const totalRespuestas = encuestas.reduce((sum, e) => sum + e.totalRespuestas, 0);
  const totalEncuestasRespondidas = encuestas.filter(e => e.totalRespuestas > 0).length;
  const publicas = encuestas.filter(e => e.esPublica).length;
  const privadas = totalEncuestas - publicas;

  const resumen = document.createElement("div");
  resumen.className = "card mb-4 p-3 shadow-sm";

  resumen.innerHTML = `
    <h4 class="mb-3"><i class="fas fa-info-circle"></i> Resumen General</h4>
    <div class="row text-center">
      <div class="col-md-3">
        <h5>${totalEncuestas}</h5>
        <p>Total de Encuestas</p>
      </div>
      <div class="col-md-3">
        <h5>${totalRespuestas}</h5>
        <p>Total de Respuestas</p>
      </div>
      <div class="col-md-3">
        <h5>${publicas}</h5>
        <p>Públicas</p>
      </div>
      <div class="col-md-3">
        <h5>${privadas}</h5>
        <p>Privadas</p>
      </div>
    </div>
  `;

  container.appendChild(resumen);
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function verReporte(encuestaId) {
  localStorage.setItem("encuestaIdParaReporte", encuestaId);
  window.location.href = "../InterfazTareas/Reportes.html";
}


document.addEventListener("DOMContentLoaded", cargarDashboard);
function renderResumen(encuestas, container) {
    const totalEncuestas = encuestas.length;
    const totalRespuestas = encuestas.reduce((sum, e) => sum + e.totalRespuestas, 0);
    const totalEncuestasRespondidas = encuestas.filter(e => e.totalRespuestas > 0).length;
  
    const resumen = document.createElement("div");
    resumen.className = "card mb-4 p-3 shadow-sm";
  
    resumen.innerHTML = `
      <h4 class="mb-3"><i class="fas fa-info-circle"></i> Resumen General</h4>
<div class="row">
  <!-- Columna de texto -->
  <div class="col-md-6 text-center">
    <div class="row">
      <div class="col-6">
        <h5>${totalEncuestas}</h5>
        <p>Total de Encuestas</p>
      </div>
      <div class="col-6">
        <h5>${totalRespuestas}</h5>
        <p>Total de Respuestas</p>
      </div>
      <div class="col-6">
        <h5>${totalEncuestasRespondidas}</h5>
        <p>Encuestas Respondidas</p>
      </div>
      <div class="col-6">
        <h5>${totalEncuestas - totalEncuestasRespondidas}</h5>
        <p>Sin Responder</p>
      </div>
    </div>
  </div>

  <!-- Columna del gráfico -->
  <div class="col-md-4">
    <canvas id="encuestaChart"></canvas>
  </div>
</div>

    `;
  
    container.appendChild(resumen);
  
    //Graficos
    const ctx = document.getElementById('encuestaChart').getContext('2d');
    const encuestaChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Encuestas Respondidas', 'Encuestas Sin Responder'],
        datasets: [{
          data: [totalEncuestasRespondidas, totalEncuestas - totalEncuestasRespondidas],
          backgroundColor: ['#36A2EB', '#FF6384'],
          hoverBackgroundColor: ['#5BC0EB', '#FF6F61']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return tooltipItem.label + ': ' + tooltipItem.raw;
              }
            }
          },
          datalabels: {
            color: '#fff',
            font: {
              weight: 'bold',
              size: 14
            },
            formatter: (value, context) => {
              const data = context.chart.data.datasets[0].data;
              const total = data.reduce((sum, val) => sum + val, 0);
              const porcentaje = ((value / total) * 100).toFixed(1);
              return porcentaje + '%';
            }
          }
        }
      },
      plugins: [ChartDataLabels] 
    });
    
    
  }
  