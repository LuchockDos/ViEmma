let Carta = [];
let carrito = [];
let totalPrecio = 0;

const modal = document.getElementById('modalProducto');
const modalImg = document.getElementById('modal_img');
const modalTitle = document.getElementById('modal_title');
const modalPrices = document.querySelector('.modal_prices');
const modalClose = document.querySelector('.modal_close');
const btnAddCart = document.querySelector('.btn_add_cart');

fetch('menu.json')
  .then(res => res.json())
  .then(data => {
    Carta = data.carta;
    renderProductos();
  })
  .catch(err => console.error('Error al cargar el menú:', err));

function renderProductos() {
  const section = document.getElementById('section_products');
  section.innerHTML = '';

  Carta.forEach(categoriaObj => {
    const categoria = categoriaObj.categoria;
    const productos = categoriaObj.productos;

    const titulo = document.createElement('h1');
    titulo.classList.add('h1_global');
    titulo.textContent = categoria;
    section.appendChild(titulo);

    if (categoria === "Empanadas") {
      const aviso = document.createElement('p');
      aviso.classList.add('zona_aviso');
      aviso.innerHTML = `
        <strong>Promo Empanadas:</strong><br>
        1 a 5 unidades → $2500 c/u<br>
        6 unidades → $13000<br>
        12 unidades → $24000<br>
        +12 → $2500 c/u (podés combinar gustos)
      `;
      section.appendChild(aviso);
    }

    const article = document.createElement('article');
    article.classList.add('products_article');
    article.id = `products_${categoria.toLowerCase()}`;

    productos.forEach(producto => {
      const card = document.createElement('div');
      card.classList.add('card');

      const img = document.createElement('img');
      img.classList.add('product');
      img.src = producto.imagen;
      img.alt = producto.nombre;

      const h3 = document.createElement('h3');
      h3.classList.add('h3_global');
      h3.textContent = producto.nombre;

      const desc = document.createElement('p');
      desc.classList.add('info_product');
      desc.textContent = producto.descripcion;

      card.append(img, h3, desc);

      if (categoria === 'Empanadas') {

        if (producto.cantidadFija) {
          const btn = document.createElement('button');
          btn.classList.add("btn_add_cart");
          btn.textContent = "Ver Detalle";
          btn.addEventListener("click", () => abrirModal(producto, categoria));
          card.appendChild(btn);

        } else {
          const input = document.createElement('input');
          input.type = "number";
          input.min = 0;
          input.value = 0;
          input.classList.add("details");
          card.appendChild(input);

          const btn = document.createElement('button');
          btn.classList.add("btn_add_cart");
          btn.textContent = "Agregar";
          btn.addEventListener("click", () => {
            const qty = parseInt(input.value);
            if (qty > 0) {
              agregarEmpanadas(producto, qty);
              input.value = 0;
            }
          });
          card.appendChild(btn);
        }

      } else {
        const btn = document.createElement('button');
        btn.classList.add("btn_add_cart");
        btn.textContent = "Ver Detalle";
        btn.addEventListener("click", () => abrirModal(producto, categoria));
        card.appendChild(btn);
      }

      article.appendChild(card);
    });

    section.appendChild(article);
  });
}

function agregarEmpanadas(producto, cantidad) {
  carrito.push({
    nombre: producto.nombre,
    categoria: "Empanadas",
    cantidad,
    precioUnidad: producto.precioUnidad
  });

  actualizarCarrito();
  actualizarBadge();
}

function abrirModal(producto, categoria) {
  modal.classList.add('show');
  modalImg.src = producto.imagen;
  modalTitle.textContent = producto.nombre;
  modalPrices.innerHTML = '';

  if (categoria === 'Empanadas') {
    if (producto.cantidadFija) {
      mostrarOpcionesComboEmpanadas(producto);
    } else {
      mostrarOpcionesEmpanadasUnidad(producto);
    }
  }

  if (categoria === 'Hamburguesas') mostrarOpcionesHamburguesa(producto);
  if (categoria === 'Pizzas') mostrarOpcionesPizza(producto);

  btnAddCart.onclick = () => {
    const detalles = document.getElementById('details')?.value.trim() || '';

    if (categoria === 'Empanadas' && producto.cantidadFija) {
      const sabor = document.getElementById('selectGusto').value;
      const cantidad = producto.cantidadFija;
      const precio = producto.precio;
      const tipo = cantidad === 12 ? "Docena" : "Media docena";

      carrito.push({ nombre: sabor, categoria, cantidad, tipo, precio, detalle: detalles });
      actualizarCarrito();
      actualizarBadge();
      modal.classList.remove('show');
      return;
    }

    const selected = document.querySelector('input[name="precio"]:checked');
    if (!selected) return alert("Seleccioná una opción");

    carrito.push({
      nombre: producto.nombre,
      categoria,
      precio: parseInt(selected.value),
      detalle: detalles,
      cantidad: 1
    });

    actualizarCarrito();
    actualizarBadge();
    modal.classList.remove('show');
  };
}

function mostrarOpcionesComboEmpanadas(producto) {
  const gustos = Carta.find(c => c.categoria === "Empanadas").productos
    .filter(p => !p.cantidadFija)
    .map(p => p.nombre);

  let options = gustos.map(g => `<option value="${g}">${g}</option>`).join("");

  modalPrices.innerHTML = `
    <label class="modal_label">
      Elegí sabor:
      <select id="selectGusto" class="details">${options}</select>
    </label>
  `;

  agregarInputDetalles();
}

function mostrarOpcionesEmpanadasUnidad(producto) {
  const precioU = producto.precioUnidad ?? producto.precio;
  producto.__precioUnidad = precioU;

  modalPrices.innerHTML = `
    <label class="modal_label">
      Cantidad:
      <input type="number" id="cantidadUnidades" class="details" min="1" value="0">
      $${precioU} c/u
    </label>
  `;
  agregarInputDetalles();
}

function mostrarOpcionesHamburguesa(producto) {
  const precios = producto.precios;
  const opciones = ["simple", "doble", "triple"];

  opciones.forEach(t => {
    modalPrices.innerHTML += `
      <label class="modal_label">
        <input class="modal_radio" type="radio" name="precio" value="${precios[t]}">
        ${t.toUpperCase()} — $${precios[t]}
      </label>`;
  });

  agregarInputDetalles();
}

function mostrarOpcionesPizza(producto) {
  modalPrices.innerHTML = `
    <input type="radio" class="modal_radio" name="precio" value="${producto.precio}" checked hidden>
  `;
  agregarInputDetalles();
}

function agregarInputDetalles() {
  modalPrices.innerHTML += `
    <label class="modal_label">
      Detalles:
      <input type="text" id="details" class="details" placeholder="Sin mayonesa, poco queso...">
    </label>`;
}

modalClose.addEventListener("click", () => modal.classList.remove("show"));
window.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show") });

const modalCarrito = document.getElementById('modalCarrito');
const carritoItems = document.getElementById('carritoItems');
const totalCarrito = document.getElementById('totalCarrito');
const openCarrito = document.getElementById('openCarrito');
const closeCarrito = document.getElementById('closeCarrito');
const cartBadge = document.getElementById('cartBadge');

openCarrito.addEventListener("click", () => modalCarrito.classList.add('show'));
closeCarrito.addEventListener("click", () => modalCarrito.classList.remove('show'));
window.addEventListener("click", e => { if (e.target === modalCarrito) modalCarrito.classList.remove("show") });

function actualizarCarrito() {
  carritoItems.innerHTML = '';
  totalPrecio = 0;

  const empSueltas = carrito.filter(i => i.categoria === "Empanadas" && !i.tipo);
  const empCombo = carrito.filter(i => i.categoria === "Empanadas" && i.tipo);
  const hamb = carrito.filter(i => i.categoria === "Hamburguesas");
  const pizz = carrito.filter(i => i.categoria === "Pizzas");

  // ✅ Combos (Media / Docena)
  if (empCombo.length > 0) {
    carritoItems.innerHTML += `<strong>Empanadas - Combos</strong><br>`;
    empCombo.forEach((i, index) => {
      const div = document.createElement("div");
      div.innerHTML = `
        ${i.tipo}: ${i.nombre} — $${i.precio}
        <button class="btn_quitar_producto" onclick="eliminarProducto(${carrito.indexOf(i)})">❌</button>
      `;
      carritoItems.appendChild(div);
      totalPrecio += i.precio;
    });
    carritoItems.innerHTML += `<br>`;
  }

  // ✅ Sueltas se siguen agrupando
  if (empSueltas.length > 0) {
    let totalCantidad = 0;
    let sabores = {};

    empSueltas.forEach(i => {
      totalCantidad += i.cantidad;
      sabores[i.nombre] = (sabores[i.nombre] || 0) + i.cantidad;
    });

    let precio = totalCantidad >= 12 ? 24000 + (totalCantidad - 12) * 2500 :
                totalCantidad >= 6  ? 13000 + (totalCantidad - 6) * 2500 :
                                     totalCantidad * 2500;

    const div = document.createElement('div');
    div.innerHTML = `<strong>Empanadas Sueltas (${totalCantidad}) — $${precio}</strong><br>` +
      Object.entries(sabores).map(([s, q]) =>
        `${s} (${q})
        <button class="btn_quitar_producto" onclick="eliminarEmpanada('${s}')">❌</button>`
      ).join("<br>");
    carritoItems.appendChild(div);

    totalPrecio += precio;
  }

  // Hamburguesas
  if (hamb.length > 0) {
    carritoItems.innerHTML += `<strong>Hamburguesas</strong><br>`;
    hamb.forEach(i => {
      const div = document.createElement("div");
      div.innerHTML = `
        ${i.nombre} ${i.detalle ? `— ${i.detalle}` : ""} — $${i.precio}
        <button class="btn_quitar_producto" onclick="eliminarProducto(${carrito.indexOf(i)})">❌</button>`;
      carritoItems.appendChild(div);
      totalPrecio += i.precio;
    });
  }

  // Pizzas
  if (pizz.length > 0) {
    carritoItems.innerHTML += `<strong>Pizzas</strong><br>`;
    pizz.forEach(i => {
      const div = document.createElement("div");
      div.innerHTML = `
        ${i.nombre} ${i.detalle ? `— ${i.detalle}` : ""} — $${i.precio}
        <button class="btn_quitar_producto" onclick="eliminarProducto(${carrito.indexOf(i)})">❌</button>`;
      carritoItems.appendChild(div);
      totalPrecio += i.precio;
    });
  }

  totalCarrito.textContent = `$${totalPrecio}`;
  actualizarBadge();
}

function eliminarProducto(index) {
  carrito.splice(index, 1);
  actualizarCarrito();
  actualizarBadge();
}

function eliminarEmpanada(sabor) {
  carrito = carrito.filter(i => !(i.categoria === "Empanadas" && i.nombre === sabor));
  actualizarCarrito();
  actualizarBadge();
}

function actualizarBadge() {
  let items = carrito.reduce((acc, p) => acc + (p.cantidad || 1), 0);
  cartBadge.style.display = items > 0 ? 'block' : 'none';
  cartBadge.textContent = items;
}

document.querySelector('.btn_finalizar').addEventListener('click', () => {
  if (carrito.length === 0) return alert("Tu carrito está vacío");

  const direccion = document.getElementById('direccionEnvio').value.trim();
  if (!direccion) return alert("Ingresá la dirección de entrega");

  const metodoPago = document.querySelector('input[name="metodo_pago"]:checked')?.value || "Efectivo";
  let mensaje = "*Nuevo Pedido ViEmma Food*\n\n";

  const emp = carrito.filter(i => i.categoria === "Empanadas");
  const hamb = carrito.filter(i => i.categoria === "Hamburguesas");
  const pizz = carrito.filter(i => i.categoria === "Pizzas");

  let totalEmp = 0;
  let sabores = {};
  emp.forEach(i => {
    totalEmp += i.cantidad;
    sabores[i.nombre] = (sabores[i.nombre] || 0) + i.cantidad;
  });

  if (totalEmp > 0) {
    mensaje += `Empanadas (${totalEmp})\n`;
    Object.entries(sabores).forEach(([s, q]) => mensaje += `• ${s} (${q})\n`);
    mensaje += `Subtotal: $${(totalEmp >= 12 ? 24000 + ((totalEmp - 12) * 2500)
                        : totalEmp >= 6 ? 13000 + ((totalEmp - 6) * 2500)
                        : totalEmp * 2500)}\n\n`;
  }

  if (hamb.length > 0) {
    mensaje += `Hamburguesas\n`;
    hamb.forEach(i => {
      mensaje += `• ${i.nombre}${i.detalle ? ` — ${i.detalle}` : ""} — $${i.precio}\n`;
    });
    mensaje += `\n`;
  }

  if (pizz.length > 0) {
    mensaje += `Pizzas\n`;
    pizz.forEach(i => {
      mensaje += `• ${i.nombre}${i.detalle ? ` — ${i.detalle}` : ""} — $${i.precio}\n`;
    });
    mensaje += `\n`;
  }

  mensaje += `Total: $${totalPrecio}\n`;
  mensaje += `Dirección: ${direccion}\n`;
  mensaje += `Pago: ${metodoPago} + 2000 si quiere envio\n `;
  mensaje += `Verifique que esté dentro de la zona habilitada`;

  const tel = "5493425995955";
  window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}`, "_blank");
});

const verify = document.getElementById('verify').addEventListener('click', () =>{
  modalCarrito.classList.remove('show')
});