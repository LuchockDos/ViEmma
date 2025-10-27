// === VARIABLES GLOBALES ===
let Carta = [];
let carrito = [];
let totalPrecio = 0;

// === ELEMENTOS DEL MODAL ===
const modal = document.getElementById('modalProducto');
const modalImg = document.getElementById('modal_img');
const modalTitle = document.getElementById('modal_title');
const modalPrices = document.querySelector('.modal_prices');
const modalClose = document.querySelector('.modal_close');
const btnAddCart = document.querySelector('.btn_add_cart');

// === CARGAR menu.json ===
fetch('menu.json')
  .then(res => res.json())
  .then(data => {
    Carta = data.carta; // ✅ tu JSON tiene "carta" como array
    renderProductos();
  })
  .catch(err => console.error('Error al cargar el menú:', err));


// === RENDERIZAR TODAS LAS CATEGORÍAS Y PRODUCTOS ===
function renderProductos() {
  const section = document.getElementById('section_products');
  section.innerHTML = '';

  // 🔹 Recorremos cada categoría
  Carta.forEach(categoriaObj => {
    const categoria = categoriaObj.categoria;
    const productos = categoriaObj.productos;

    // --- Crear título ---
    const titulo = document.createElement('h1');
    titulo.classList.add('h1_global');
    titulo.textContent = categoria;
    section.appendChild(titulo);

    // --- Crear contenedor para productos ---
    const article = document.createElement('article');
    article.classList.add('products_article');
    article.id = `products_${categoria.toLowerCase()}`;

    // --- Crear cards para cada producto ---
    productos.forEach(producto => {
      const div = document.createElement('div');
      div.classList.add('card');

      const img = document.createElement('img');
      img.classList.add('product');
      img.src = producto.imagen;
      img.alt = producto.nombre;

      const h3 = document.createElement('h3');
      h3.classList.add('h3_global');
      h3.textContent = producto.nombre;

      const p = document.createElement('p');
      p.classList.add('info_product');
      p.textContent = producto.descripcion;

      const btn = document.createElement('button');
      btn.classList.add('btn_add_cart');
      btn.textContent = 'Ver Detalle';
      btn.addEventListener('click', () => abrirModal(producto, categoria));

      div.append(img, h3, p, btn);
      article.appendChild(div);
    });

    // --- Agregar todo a la sección principal ---
    section.appendChild(article);
  });
}


// === ABRIR MODAL SEGÚN TIPO DE PRODUCTO ===
function abrirModal(producto, categoria) {
  modal.classList.add('show');
  modalImg.src = producto.imagen;
  modalTitle.textContent = producto.nombre;
  modalPrices.innerHTML = ''; // limpiar opciones anteriores

  // 🔹 Mostrar opciones según categoría
  if (categoria === 'Hamburguesas') {
    mostrarOpcionesHamburguesa(producto);
  } else if (categoria === 'Empanadas') {
    mostrarOpcionesEmpanadas(producto);
  } else if (categoria === 'Pizzas') {
    mostrarOpcionesPizza(producto);
  }

  // 🔹 Botón agregar al carrito
 // === MODIFICAR AGREGAR AL CARRITO ===
btnAddCart.onclick = () => {
  const selected = document.querySelector('input[name="precio"]:checked');
  const details = document.getElementById('details')?.value.trim() || '';

  let precioFinal = 0;

  if (categoria === 'Empanadas') {
    const cantidadInput = document.getElementById('cantidadUnidades');
    const cantidad = cantidadInput ? parseInt(cantidadInput.value) : 0;
    const precioUnidad = producto.__precioUnidad ?? producto.precioUnidad ?? producto.precio ?? 0;

    if (cantidad > 0) precioFinal = cantidad * precioUnidad;

    if (selected) precioFinal = parseInt(selected.value);
  } else {
    if (!selected) {
      alert('Seleccioná una opción antes de continuar.');
      return;
    }
    precioFinal = parseInt(selected.value);
  }

  if (precioFinal <= 0) {
    alert('Elegí una cantidad u opción válida.');
    return;
  }

 let cantidad = 1;
let tipo = ""; // para mostrar "Media docena" o "Docena"

if (categoria === "Empanadas") {
  const cantidadInput = document.getElementById("cantidadUnidades");
  const cantidadElegida = parseInt(cantidadInput?.value) || 0;

  if (cantidadElegida > 0) {
    cantidad = cantidadElegida;
    tipo = `x${cantidad}`;
  }

  if (selected) {
    const textoOpcion = selected.parentElement.innerText.trim();

    if (textoOpcion.includes("Media")) {
      cantidad = 6;
      tipo = "Media docena";
    }
    if (textoOpcion.includes("Docena")) {
      cantidad = 12;
      tipo = "Docena";
    }
  }
}

const item = {
  nombre: producto.nombre,
  categoria,
  precio: precioFinal,
  detalle: details || "",
  cantidad,
  tipo // ✅ guardamos esta info para mostrarla bien luego
};

  carrito.push(item);

  actualizarCarrito();
  actualizarBadge();
  modal.classList.remove('show');
};
}


// === OPCIONES SEGÚN CATEGORÍA ===
function mostrarOpcionesHamburguesa(producto) {
  const precios = producto.precios; // ✅ tu JSON guarda los precios dentro de "precios"

  const opciones = [
    { label: 'Simple', value: precios.simple },
    { label: 'Doble', value: precios.doble },
    { label: 'Triple', value: precios.triple }
  ];

  opciones.forEach(op => {
    const label = document.createElement('label');
    label.classList.add('modal_label');
    label.innerHTML = `
      <input type="radio" name="precio" value="${op.value}">
      ${op.label} <span>$${op.value}</span>
    `;
    modalPrices.appendChild(label);
  });

  agregarInputDetalles();
}


function mostrarOpcionesEmpanadas(producto) {
  modalPrices.innerHTML = ''; // limpiar

  // fallbacks por si alguna empanada quedó con el campo viejo "precio"
  const precioUnidad = producto.precioUnidad ?? producto.precio ?? 0;
  const precioMedia = producto.precioMediaDocena ?? Math.ceil(precioUnidad * 6 * 0.9); // fallback promo
  const precioDocena = producto.precioDocena ?? Math.ceil(precioUnidad * 12 * 0.85);

  // ✅ Input cantidad de unidades (por unidad)
  const cantidadLabel = document.createElement('label');
  cantidadLabel.classList.add('modal_label');
  cantidadLabel.innerHTML = `
    Cantidad:
    <input type="number" id="cantidadUnidades" class="details" min="1" value="0">
    <span> $${precioUnidad} c/u</span>
  `;
  modalPrices.appendChild(cantidadLabel);

  // ✅ Opciones rápidas: media docena / docena
  const opcionesExtra = [
    { label: 'Media docena', value: precioMedia },
    { label: 'Docena', value: precioDocena }
  ];

  opcionesExtra.forEach(op => {
    const label = document.createElement('label');
    label.classList.add('modal_label');
    label.innerHTML = `
      <input type="radio" name="precio" value="${op.value}">
      ${op.label} <span>$${op.value}</span>
    `;
    modalPrices.appendChild(label);
  });

  agregarInputDetalles();

  // guardamos precios calculados en el producto para usarlos en el onClick
  producto.__precioUnidad = precioUnidad;
}


function mostrarOpcionesPizza(producto) {
  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = 'precio';
  radio.value = producto.precio;
  radio.checked = true;
  radio.style.display = 'none';
  modalPrices.appendChild(radio);

  agregarInputDetalles();
}


// === INPUT DE DETALLES (común a todos) ===
function agregarInputDetalles() {
  const label = document.createElement('label');
  label.setAttribute('for', 'details');
  label.textContent = 'Detalles:';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'details';
  input.classList.add('details');
  input.placeholder = 'Sin mayonesa, poco queso...';

  modalPrices.append(label, input);
}


// === CERRAR MODAL ===
modalClose.addEventListener('click', () => modal.classList.remove('show'));
window.addEventListener('click', e => {
  if (e.target === modal) modal.classList.remove('show');
});

// === ELEMENTOS DEL CARRITO ===
const modalCarrito = document.getElementById('modalCarrito');
const carritoItems = document.getElementById('carritoItems');
const totalCarrito = document.getElementById('totalCarrito');
const closeCarrito = document.getElementById('closeCarrito');
const openCarrito = document.getElementById('openCarrito');
const cartBadge = document.getElementById('cartBadge');

// === ABRIR / CERRAR CARRITO ===
openCarrito.addEventListener('click', () => modalCarrito.classList.add('show'));
closeCarrito.addEventListener('click', () => modalCarrito.classList.remove('show'));
window.addEventListener('click', e => {
  if (e.target === modalCarrito) modalCarrito.classList.remove('show');
});

// === ACTUALIZAR VISTA DEL CARRITO ===
function actualizarCarrito() {
  carritoItems.innerHTML = '';
  totalPrecio = 0;

  carrito.forEach((item, index) => {
    const div = document.createElement('div');
    div.classList.add('modal_item');
    div.innerHTML = `
      <div class="modal_item_info">
        <h4>${item.nombre}</h4>
        <p>${item.categoria}</p>
        <p>$${item.precio}</p>
        <button class="btn_quitar_producto" onclick="eliminarItem(${index})">&times</button>
      </div>
    `;
    carritoItems.appendChild(div);
    totalPrecio += item.precio;
  });

  totalCarrito.textContent = `$${totalPrecio}`;
  actualizarBadge();
}

// === ELIMINAR ITEM ===
function eliminarItem(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
}

// === ACTUALIZAR CONTADOR ===
function actualizarBadge() {
  if (carrito.length > 0) {
    cartBadge.style.display = 'block';
    cartBadge.textContent = carrito.length;
  } else {
    cartBadge.style.display = 'none';
  }
}
document.querySelector('.btn_finalizar').addEventListener('click', () => {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }

  const direccion = document.getElementById('direccionEnvio').value.trim();

  if (!direccion) {
    alert("Por favor, ingrese una dirección de entrega.");
    return;
  }

  let mensaje = "*Nuevo Pedido ViEmma Food*\n\n";

 carrito.forEach(item => {
  let infoExtra = "";

if (item.categoria === "Empanadas") {
  if (item.tipo) infoExtra += ` — ${item.tipo}`;
} else if (item.cantidad > 1) {
  infoExtra += ` x${item.cantidad}`; // para futuros productos con cantidad
}

if (item.detalle) {
  infoExtra += ` — *${item.detalle}*`;
}

mensaje += `*${item.categoria.slice(0, -1)}* ${item.nombre}${infoExtra} - $${item.precio}\n`;
});

  mensaje += `\n *Total:* $${totalPrecio}`;
  mensaje += `\n *Dirección:* ${direccion}`;
  mensaje += `\n Verifique que esté dentro de la zona habilitada`;
  mensaje += `\n Por favor compartir ubicación por WhatsApp al confirmar.`;

  const telefono = "3482701932";
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, "_blank");
});

const btnVerify = document.getElementById('verify').addEventListener('click', () =>{
  modalCarrito.classList.remove('show')
})