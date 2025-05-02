async function cargarEncuesta(encuestaId) {
    try {
      const response = await fetch(`https://localhost:7113/api/GetEncuestaById?id=${encuestaId}`);
      
      if (!response.ok) throw new Error("No se pudo obtener la encuesta.");
      
      const encuesta = await response.json();
      console.log("Encuesta obtenida:", encuesta);
  
      // Rellenar los campos del formulario con los datos de la encuesta
      document.getElementById("titulo").value = encuesta.titulo;
      document.getElementById("descripcion").value = encuesta.descripcion;
      document.getElementById("estado").value = encuesta.esPublica ? "Publica" : "Privada";
      document.getElementById("fechaVencimiento").value = encuesta.fechaExpiracion.slice(0, 10);
  
      const boton = document.querySelector("button.btn.btn-primary");
      boton.textContent = "Guardar Cambios";
      boton.onclick = () => actualizarEncuesta(encuesta.encuestaId);
  
    } catch (error) {
      console.error("Error cargando encuesta:", error);
      alert("No se pudo cargar la encuesta para editar.");
    }
  }
  
  // Llamar a la función pasando el ID de la encuesta
  const encuestaId = localStorage.getItem('encuestaIdParaEditar'); 
  cargarEncuesta(encuestaId);
