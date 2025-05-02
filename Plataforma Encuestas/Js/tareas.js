const idUsuario = localStorage.getItem("idUsuario");
if(idUsuario != 2)
{
  alert("Usuario no Autorizado")
  window.location.href = "../InterfazLoginYRegistro/Login.html"; 
}
const apiUrl = `https://localhost:7113/api/encuestas`; 
let allTasks = []; 
// Funcion para obtener las Encuestas desde la API
async function getTasks() {
 
  try {
    const response = await fetch(apiUrl);
    allTasks = await response.json(); 
    console.log(allTasks);
    renderTasks(allTasks);
  } catch (error) {
    console.error('Error al obtener las tareas:', error);
  }
}

// Funcion para renderizar las tareas en una lista horizontal

function renderTasks(tasks) {
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = ''; 
  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="text-center text-muted">
        <p id = "ptarea" >No hay Encuestas Disponibles.</p>
      </div>
    `;
    return;
  }
let Estado;
  tasks.forEach(task => {
    const estaExpirada = new Date(task.fechaExpiracion) <= new Date();
 if(task.esPublica)
 {
   Estado = "Publica";
 }
else{
   Estado = "Privada";
}

const enlacePublico = `http://127.0.0.1:5500/InterfazTareas/ResponderEncuesta.html?id=${task.encuestaId}`;
const botonCopiarLink = task.esPublica
  ? `<button class="btn btn-primary btn-sm mb-2" onclick="copiarLink('${enlacePublico}')" title="Copiar link público">
      <i class="fas fa-link"></i>
    </button>`
  : '';

const card = `
  <div class="task-item mb-3 p-3 d-flex justify-content-between align-items-start border rounded">
    <div>
      <h5>${task.titulo}</h5>
      <p>${task.descripcion}</p>
      <p><strong>Visibilidad:</strong> <span>${Estado}</span></p>
      <p><strong>Fecha de vencimiento:</strong> ${formatearFecha(task.fechaExpiracion)}</p>
      <p><strong>Estado:</strong> <span class="badge badge-${task.estado ? 'success' : 'secondary'}">
        ${task.estado ? 'Activa' : 'Inactiva'}
      </span></p>
    </div>

    <div class="ml-3 d-flex flex-column">
      <button class="btn btn-warning btn-sm mb-2" onclick="editarTarea(${task.encuestaId})" title="Editar">
        <i class="fas fa-edit"></i>
      </button>

      <button class="btn btn-danger btn-sm mb-2" onclick="eliminarEncuesta(${task.encuestaId})" title="Eliminar">
        <i class="fas fa-trash-alt"></i>
      </button>

      <button class="btn btn-info btn-sm mb-2" onclick="duplicarEncuesta(${task.encuestaId})" title="Duplicar">
        <i class="fas fa-copy"></i>
      </button>
            ${botonCopiarLink}
<button 
  class="btn ${estaExpirada ? 'btn-danger' : (task.estado ? 'btn-success' : 'btn-secondary')} btn-sm toggle-estado-btn" 
  onclick="toggleEstadoEncuesta(${task.encuestaId}, this, ${estaExpirada})" 
  data-estado="${task.estado}" 
  title="Habilitar/Deshabilitar">
  <i class="fas ${task.estado ? 'fa-eye' : 'fa-eye-slash'}"></i>
</button>
   </div>
  </div>
`;
          taskList.innerHTML += card;
    
        
          
        });
      }
      
      function formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      }
      getTasks();

// Funcion para crear una nueva encuesta
async function crearEncuesta() {
  const titulo = document.getElementById('titulo').value;
  const descripcion = document.getElementById('descripcion').value;
  let EsPublica = document.getElementById('estado').value; 
  const fechaExpiracion = document.getElementById('fechaVencimiento').value;

  if (!titulo || !descripcion || !fechaVencimiento) {
    alert('Por favor, completa todos los campos');
    return;
  }
 if(EsPublica == "Publica")
 {
  EsPublica = true;
 }
 else{
  EsPublica = false;
 }

 const fechaVencimientoDate = new Date(fechaExpiracion);

 
 const hoy = new Date();

 
 if (fechaVencimientoDate <= hoy) {
   alert("La fecha de vencimiento debe ser mayor que la fecha actual.");
   return;
 }
  const EncuestaNueva = {
    titulo: titulo,
    descripcion: descripcion,
    esPublica: EsPublica,
    fechaExpiracion: fechaExpiracion,
    usuarioId_Creador: 1,
    estado: true
  };
console.log(JSON.stringify(EncuestaNueva));
  try {
    const response = await fetch(`https://localhost:7113/api/encuestas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(EncuestaNueva)
    });
    console.log(response);
    if (response.ok) {
      const data = await response.json();

  const encuestaId = data; 
  localStorage.setItem('encuestaId', encuestaId);
      alert("Encuesta Creada");
      window.location.href = 'Preguntas.html';
    } else {
      alert('Error al crear la tarea');
    }
  } catch (error) {
    console.error('Error al crear la tarea:', error);
  }
}


// Funcion para eliminar una Encuesta
async function eliminarEncuesta(id) {
  const confirmacion = confirm("¿Estás seguro de eliminar esta Encuesta?");
  if (confirmacion) {
    try {
      await fetch(`https://localhost:7113/api/encuestas?id=${id}`, { method: 'DELETE' });
      getTasks();
    } catch (error) {
      console.error('Error al eliminar la Encuesta:', error);
    }
  }
}
//Creacion de Preguntas
const tipoPregunta = document.getElementById('tipoPregunta');
const opcionesMultiples = document.getElementById('opciones-multiples');
const contenedorOpciones = document.getElementById('contenedor-opciones');
const opcionesEscala = document.getElementById('opciones-escala');

tipoPregunta.addEventListener('change', () => {
  const tipo = tipoPregunta.value;
  opcionesMultiples.classList.add('d-none');

  if (tipo === '0') {
    opcionesMultiples.classList.remove('d-none');
  } else if (tipo === '1') {
    opcionesEscala.classList.remove('d-none');
  }
});

function agregarOpcion() {
  const opcionesActuales = document.querySelectorAll('#contenedor-opciones .opcion-input');
  
  if (opcionesActuales.length >= 4) {
    alert('Solo se permiten un máximo de 4 opciones.');
    return;
  }
  const div = document.createElement('div');
  div.classList.add('opcion-input');
  div.innerHTML = `
    <input type="text" class="form-control" name="opciones[]" placeholder="Texto de la opción" required>
    <button type="button" class="btn btn-danger btn-sm btn-x" onclick="this.parentElement.remove()">X</button>
  `;
  contenedorOpciones.appendChild(div);
  
}

document.getElementById('form-pregunta').addEventListener('submit', async function (e) {
  e.preventDefault();
  const encuestaId = localStorage.getItem("encuestaId");
  const tipo = tipoPregunta.value;
  const texto = document.getElementById('textoPregunta').value;
  let opciones = [];

  if (tipo === "0") { 
    const inputs = document.querySelectorAll('input[name="opciones[]"]');
    inputs.forEach(input => {
      opciones.push(input.value.trim());
    });

    if (opciones.some(op => op === '')) {
      alert("Por favor, agrega opciones válidas.");
      return;
    }

    if (opciones.length <= 1) {
      alert("Por favor agrega más de una opción.");
      return;
    }
  }

  const pregunta = {
    encuestaId: parseInt(encuestaId),
    tipo: parseInt(tipo),
    textoPregunta: texto
  };

  try {
    const response = await fetch(`https://localhost:7113/api/preguntas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pregunta)
    });

    if (response.ok) {
      const preguntaId = await response.json(); 

      if (tipo === "0") {
        let opcionesCorrectas = 0;

        for (const textoOpcion of opciones) {
          const opcion = {
            preguntaId: preguntaId,
            textoOpcion: textoOpcion
          };

          const opcionResponse = await fetch(`https://localhost:7113/api/OpcionesPregunta`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(opcion)
          });

          if (opcionResponse.ok) {
            opcionesCorrectas++;
          }
        }

        if (opcionesCorrectas === opciones.length) {
          alert("Pregunta y opciones creadas con éxito");
          document.getElementById('form-pregunta').reset();
          contenedorOpciones.innerHTML = '';
          verificarLimiteOpciones(); 
        } else {
          alert("Pregunta creada, pero hubo error en algunas opciones.");
        }
      } else {
        alert("Pregunta creada con éxito");
        document.getElementById('form-pregunta').reset();
      }
    } else {
      alert('Error al crear la pregunta');
    }
  } catch (error) {
    console.error('Error al enviar la pregunta:', error);
  }
});



//Funcion par actualizar el estado de la Encuesta:
async function toggleEstadoEncuesta(encuestaId, boton, estaExpirada) {
  // Obtener el estado actual desde el atributo del botón
  if(estaExpirada)
  {
    alert("La encuesta está expirada. Para habilitarla, edita la fecha de expiración.");
    return;
  }
  const estadoActual = boton.getAttribute("data-estado") === "true";
  const nuevoEstado = !estadoActual;

  try {
    const response = await fetch(`https://localhost:7113/api/encuestas/updateEstado?id=${encuestaId}&estado=${nuevoEstado}`, {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoEstado)
    });

    if (response.ok) {
      // Cambiar el icono visualmente
      boton.setAttribute("data-estado", nuevoEstado);
      const icon = boton.querySelector("i");
      icon.classList.toggle("fa-eye", nuevoEstado);
      icon.classList.toggle("fa-eye-slash", !nuevoEstado);
      // Refrescar lista
      getTasks();
    } else {
      alert("Error al cambiar el estado de la encuesta.");
    }
  } catch (error) {
    console.error("Error al actualizar estado:", error);
  }
}



// Función para editar una Encuesta
function editarTarea(encuestaId) {
  localStorage.setItem("encuestaIdParaEditar", encuestaId);
  window.location.href = "../InterfazTareas/EditarEncuesta.html";
}
function duplicarEncuesta(encuestaId) {
  localStorage.setItem("encuestaIdParaEditar", encuestaId);
  window.location.href = "../InterfazTareas/DuplicarEncuesta.html";
}

//Funcion para copiar link
function copiarLink(url) {
  navigator.clipboard.writeText(url)
    .then(() => {
      alert("Link copiado al portapapeles");
    })
    .catch(err => {
      console.error("Error al copiar el link: ", err);
    });
}







document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get('id');

  if (taskId) {
    try {
    
      const response = await fetch(`https://localhost:7113/api/GetEncuestaById?id=${taskId}`);
      const task = await response.json();


      document.getElementById('edit-titulo').value = task.titulo;
      document.getElementById('edit-descripcion').value = task.descripcion;
      document.getElementById('edit-estado').value = task.EsPublica;
      document.getElementById('edit-fechaVencimiento').value = task.fechaExpiracion.slice(0, 10);
    } catch (error) {
      console.error('Error al cargar la tarea:', error);
    }
  }
});


function filtrarTareas() {
  const filtro = document.getElementById('search-input').value.toLowerCase();

  // Si el input está vacío, mostramos todas las Encuestas
  if (filtro === '') {
    renderTasks(allTasks);
    return;
  }

  // Filtramos las Encuestas que coincidan con el título o descripción
  const tareasFiltradas = allTasks.filter(task =>
    task.titulo.toLowerCase().includes(filtro) ||
    task.descripcion.toLowerCase().includes(filtro)
  );

  renderTasks(tareasFiltradas);
}

function logout() {
  localStorage.removeItem("idUsuario"); 
  sessionStorage.clear(); 
  alert("Sesión cerrada correctamente");
  window.location.href = "../InterfazLoginYRegistro/Login.html"; 
}

