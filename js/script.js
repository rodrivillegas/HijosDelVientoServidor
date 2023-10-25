const firebaseConfig = {
  apiKey: "AIzaSyBdYZYJRiUsC_v1jcKf9d248qJOYpUCyPI",
  authDomain: "hijosdelvientoservidor.firebaseapp.com",
  projectId: "hijosdelvientoservidor",
};

// Inicializar la aplicación de Firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database();
var totalCaja = 0;

// Obtén la referencia al cuerpo de la tabla
var tablaBody = document.getElementById("tablaBody");

// Variable global para almacenar las filas
var filas = [];

// Recuperar el estado de selección de las filas desde Firebase y actualizar la tabla
// Recuperar el estado de selección de las filas desde Firebase y actualizar la tabla
database.ref().on("value", function (snapshot) {
  var datos = snapshot.val();
  var totalCaja = 0; // Inicializa el total de la caja en 0

  // Vaciar el cuerpo de la tabla
  tablaBody.innerHTML = "";

  // Limpiar el array de filas
  filas = [];

  // Recorrer los datos y agregar filas a la tabla
  for (var key in datos) {
    // Filtrar el elemento "fila" no deseado
    if (key === "fila") {
      continue; // Saltar al siguiente elemento
    }

    var fila = datos[key];
    var detallesPedido = fila.detallesPedido;

    // Obtener el valor de la columna "CAJA" de la fila como un número
    var precioFinalValue = parseFloat(fila.precioFinal) || 0;

    // Sumar el valor al total de caja
    totalCaja += precioFinalValue;

    var detallesHtml = "";
    if (Array.isArray(detallesPedido)) {
      detallesPedido.forEach(function (detalles) {
        var nombre = detalles.nombre;
        var cantidad = detalles.cantidad;
        var gaseosaSeleccionada = detalles.gaseosaSeleccionada || "";

        detallesHtml += `${cantidad}x ${nombre} - ${gaseosaSeleccionada}<br>`;
      });
    }

    // Asignar el mozo a cargo a la fila
    fila.detallesHtml = detallesHtml;
    fila.mozoACargo = obtenerMozoACargo(fila.numeroMesa);

    // Obtener el estado de selección de la fila desde Firebase
    fila.seleccionada = datos[key].seleccionada || false;

    filas.push(fila);
  }

  // Generar filas HTML
  var filasHtml = ""; // Variable para almacenar las filas generadas

  filas.forEach(function (fila, index) {
    var selectedClass = fila.seleccionada ? "selected" : "";

    // Utilizar el operador ternario para mostrar "*********" en lugar de "undefined"
    var detallesHtml = fila.detallesHtml
      ? fila.detallesHtml
      : "*********";
    var numeroMesa = fila.numeroMesa ? fila.numeroMesa : "*********";
    var modoEntrega = fila.modoEntrega ? fila.modoEntrega : "*********";
    var nombreUsuario = fila.nombreUsuario
      ? fila.nombreUsuario
      : "*********";
    var telefono = fila.telefono ? fila.telefono : "*********";
    var direccion = fila.direccion ? fila.direccion : "*********";
    var comentarios = fila.comentarios ? fila.comentarios : "*********";
    var precioFinal = fila.precioFinal ? fila.precioFinal : "*********";

    // Aplicar una clase de estilo si el valor es "*********"
    var redTextClass = "red-text";
    if (detallesHtml === "*********") {
      detallesHtml = `<span class="${redTextClass}">${detallesHtml}</span>`;
    }
    if (numeroMesa === "*********") {
      numeroMesa = `<span class="${redTextClass}">${numeroMesa}</span>`;
    }
    if (modoEntrega === "*********") {
      modoEntrega = `<span class="${redTextClass}">${modoEntrega}</span>`;
    }
    if (nombreUsuario === "*********") {
      nombreUsuario = `<span class="${redTextClass}">${nombreUsuario}</span>`;
    }
    if (telefono === "*********") {
      telefono = `<span class="${redTextClass}">${telefono}</span>`;
    }
    if (direccion === "*********") {
      direccion = `<span class="${redTextClass}">${direccion}</span>`;
    }
    if (comentarios === "*********") {
      comentarios = `<span class="${redTextClass}">${comentarios}</span>`;
    }
    if (precioFinal === "*********") {
      precioFinal = `<span class="${redTextClass}">${precioFinal}</span>`;
    }

    var filaHtml = `
    <tr id="fila-${index}" class="${selectedClass}" onclick="seleccionarFila(${index})">
      <td class= "fechaYHora">${fila.fecha}</td>
      <td>${fila.hora}</td>
      <td>${detallesHtml}</td>
      <td>${numeroMesa}</td>
      <td>${modoEntrega}</td>
      <td>${nombreUsuario}</td>
      <td>${telefono}</td>
      <td>${direccion}</td>
      <td>${comentarios}</td>
      <td class= "caja">${precioFinal}</td>
    </tr>
  `;
    filasHtml += filaHtml; // Agregar la fila generada a la cadena de filas
  });

  tablaBody.innerHTML = filasHtml; // Establecer el contenido de la tabla

  // Restaurar el estado de selección de las filas
  restoreSelection();

  // Mostrar el total de la caja en una etiqueta div
  var totalCajaElement = document.getElementById("totalCaja");
  if (totalCajaElement) {
    totalCajaElement.textContent = "Total de Ventas: $" + totalCaja.toFixed(2);
  }
});

function seleccionarFila(filaIndex) {
  var filaElement = document.querySelector(`tr[id="fila-${filaIndex}"]`);
  if (filaElement) {
    filaElement.classList.toggle("selected");

    // Obtener el ID de la fila
    var filaId = `fila-${filaIndex}`;

    // Excluir la última columna de ser tachada
    var celdas = filaElement.querySelectorAll("td:not(.no-highlight)"); // Modificación aquí
    for (var i = 0; i < celdas.length; i++) {
      // Modificación aquí
      celdas[i].style.textDecoration = filaElement.classList.contains(
        "selected"
      )
        ? ""
        : "none";
    }

    // Actualizar el estado de selección de la fila en Firebase
    if (filaId.startsWith("fila-")) {
      // La fila es una fila adicional, no existe en la base de datos
      // Solo actualizamos el estado de selección localmente en el array de filas
      filas[filaIndex].seleccionada =
        filaElement.classList.contains("selected");
    } else {
      // La fila existe en la base de datos, actualizamos el estado en Firebase
      var filaRef = database.ref(filaId); // Utilizar el ID de la fila como referencia
      filaRef.update({
        seleccionada: filaElement.classList.contains("selected"),
      });
    }

    // Guardar el estado de selección en localStorage
    saveSelection();

    console.log("Fila seleccionada:", filaIndex);
  }
}

// Función para guardar el estado de selección en localStorage
function saveSelection() {
  var selectedRows = [];

  filas.forEach(function (fila, index) {
    if (fila.seleccionada) {
      selectedRows.push(index);
    }
  });

  localStorage.setItem("selectedRows", JSON.stringify(selectedRows));
}

// Función para restaurar el estado de selección desde localStorage
function restoreSelection() {
  var selectedRows = localStorage.getItem("selectedRows");

  if (selectedRows) {
    selectedRows = JSON.parse(selectedRows);

    selectedRows.forEach(function (rowIndex) {
      var filaElement = document.querySelector(`tr[id="fila-${rowIndex}"]`);
      if (filaElement) {
        filaElement.classList.add("selected");
        filas[rowIndex].seleccionada = true;
      }
    });
  }
}

// Obtén el mozo a cargo según el número de mesa
function obtenerMozoACargo(numeroMesa) {
  var mozoACargo = "";

  if (numeroMesa >= 1 && numeroMesa <= 10) {
    mozoACargo = "Juan";
  } else if (numeroMesa >= 11 && numeroMesa <= 20) {
    mozoACargo = "Lucas";
  } else if (numeroMesa >= 21 && numeroMesa <= 30) {
    mozoACargo = "Roberto";
  } else if (numeroMesa >= 31 && numeroMesa <= 40) {
    mozoACargo = "Laura";
  } else if (numeroMesa >= 41 && numeroMesa <= 50) {
    mozoACargo = "Carola";
  }

  return mozoACargo;
}

// Ordena las filas de la tabla por la hora del pedido
function ordenarTablaPorHora() {
  var filas = Array.from(tablaBody.getElementsByTagName("tr"));

  // Ordena las filas según la hora del pedido (considerando formato HH:MM:SS)
  filas.sort(function (a, b) {
    var horaA = obtenerHoraPedido(a);
    var horaB = obtenerHoraPedido(b);

    return horaA.localeCompare(horaB);
  });

  // Vuelve a agregar las filas a la tabla en el nuevo orden
  filas.forEach(function (fila) {
    tablaBody.appendChild(fila);
  });
}

// Obtén la hora del pedido de una fila
function obtenerHoraPedido(fila) {
  var celdaHora = fila.querySelector("td:nth-child(2)");
  return celdaHora.textContent;
}
