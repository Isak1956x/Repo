document.addEventListener("DOMContentLoaded", () => {
  const listaEncuestas = document.getElementById("lista-encuestas");
  const idUsuario = localStorage.getItem("idUsuario");
  let encuestasPrivadas = [];

  let respuestasUsuario = [];

  // Obtener respuestas del usuario
  fetch(`https://localhost:7113/api/Respuestas/api/respuestas/${idUsuario}`)
    .then(res => res.json())
    .then(respuestas => {
      respuestasUsuario = respuestas;
      // Ahora obtener las encuestas
      return fetch("https://localhost:7113/api/encuestas");
    })
    .then(res => res.json())
    .then(encuestas => {
      encuestasPrivadas = encuestas.filter(e => e.esPublica === false && e.estado === true);
      renderizarEncuestas(encuestasPrivadas);
    })
    .catch(error => {
      console.error("Error:", error);
      listaEncuestas.innerHTML = "<p class='text-white'>Error al cargar las encuestas o respuestas.</p>";
    });

function renderizarEncuestas(encuestas) {
  if (encuestas.length === 0) {
    listaEncuestas.innerHTML = "<p class='text-white'>No hay encuestas privadas disponibles.</p>";
    return;
  }

  listaEncuestas.innerHTML = "";

  // Separar encuestas pendientes y completadas
  const pendientes = encuestas.filter(e => !respuestasUsuario.some(r => r.encuestaId === e.encuestaId));
  const completadas = encuestas.filter(e => respuestasUsuario.some(r => r.encuestaId === e.encuestaId));

  // Juntar en orden: pendientes primero
  const ordenadas = [...pendientes, ...completadas];

  // Renderizar en ese orden
  ordenadas.forEach(encuesta => {
    const yaRespondio = respuestasUsuario.some(r => r.encuestaId === encuesta.encuestaId);
    const estaExpirada = new Date(encuesta.fechaExpiracion) < new Date();
    const item = document.createElement("div");
    item.classList.add("task-item");
    item.innerHTML = `
      <div>
        <h5>${encuesta.titulo}</h5>
        <p>${encuesta.descripcion}</p>
        <p><strong>Vence:</strong> ${new Date(encuesta.fechaExpiracion).toLocaleDateString()}</p>
          <p><strong>Estado:</strong> 
        <span class="badge badge-${estaExpirada ? 'danger' : (yaRespondio ? 'success' : 'info')}">
          ${estaExpirada ? 'Expirada' : (yaRespondio ? 'Completada' : 'Pendiente')}
        </span>
      </p>
      </div>
    <div class="task-buttons">
      <button 
        id="${estaExpirada ? 'btn-expirada' : (yaRespondio ? 'btn-ver' : 'btn-responder')}"" 
        onclick="${estaExpirada ? '' : (yaRespondio ? `verRespuestas(${encuesta.encuestaId})` : `responderEncuesta(${encuesta.encuestaId})`)}"
        class="btn ${estaExpirada ? 'btn-danger' : (yaRespondio ? 'btn-success' : 'btn-primary')}"
        ${estaExpirada ? 'disabled' : ''}
      >
        <i class="fas ${estaExpirada ? 'fa-ban' : (yaRespondio ? 'fa-eye' : 'fa-edit')}"></i> 
        ${estaExpirada ? 'Expirada' : (yaRespondio ? 'Ver respuestas' : 'Responder')}
      </button>
    </div>
    `;

    listaEncuestas.appendChild(item);
  });
}


  document.getElementById('search-input').addEventListener('input', filtrarTareas);

  function filtrarTareas() {
    const filtro = document.getElementById('search-input').value.toLowerCase();
    if (filtro === '') {
      renderizarEncuestas(encuestasPrivadas);
      return;
    }

    const tareasFiltradas = encuestasPrivadas.filter(encuesta =>
      encuesta.titulo.toLowerCase().includes(filtro) ||
      encuesta.descripcion.toLowerCase().includes(filtro)
    );

    renderizarEncuestas(tareasFiltradas);
  }
});

  
function responderEncuesta(idEncuesta) {
  window.location.href = `../InterfazTareas/ResponderEncuesta.html?id=${idEncuesta}`;
}

  document.addEventListener("DOMContentLoaded", function() {
    const logoutButton = document.getElementById("logout-button");
  
    logoutButton.addEventListener("click", function() {
      localStorage.removeItem("idUsuario"); 
      sessionStorage.clear(); 
      alert("Sesión cerrada correctamente");
      window.location.href = "../InterfazLoginYRegistro/Login.html"; 
    });
  });

function verRespuestas(idEncuesta)
{
  const userId = localStorage.getItem("idUsuario");
window.location.href = `../InterfazTareas/verRespuestas.html?id=${idEncuesta}&userId=${userId}`;
}