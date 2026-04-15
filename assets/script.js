function getProducts() {
  return window.ADS_VERIS_PRODUCTS || [];
}

function getProductBySlug(slug) {
  return getProducts().find((product) => product.slug === slug);
}

function renderChrome() {
  const page = document.body.dataset.page || "";
  const headerHost = document.querySelector("[data-header]");
  const footerHost = document.querySelector("[data-footer]");

  if (headerHost) {
    headerHost.innerHTML = `
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand" href="index.html" aria-label="Ir a inicio">
            <span class="brand-mark">AV</span>
            <span class="brand-name">ADS <span>Veris</span></span>
          </a>
          <nav class="main-nav" aria-label="Principal">
            <a href="index.html" class="${page === "home" ? "active" : ""}">Inicio</a>
            <a href="tienda.html" class="${page === "tienda" || page === "producto" ? "active" : ""}">Tienda</a>
            <a href="nosotros.html" class="${page === "nosotros" ? "active" : ""}">Nosotros</a>
            <a href="legal.html" class="${["legal", "terminos", "privacidad", "reembolsos"].includes(page) ? "active" : ""}">Legal</a>
            <a href="ayuda.html" class="${page === "ayuda" ? "active" : ""}">Ayuda</a>
          </nav>
          <div class="header-actions">
            <span class="header-note">Herramientas empresariales con lógica de análisis</span>
            <a href="plataforma.html" class="btn btn-primary btn-sm">Lista de espera</a>
          </div>
        </div>
      </header>
    `;
  }

  if (footerHost) {
    footerHost.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <div class="brand">
                <span class="brand-mark">AV</span>
                <span class="brand-name">ADS <span>Veris</span></span>
              </div>
              <p class="small footer-copy">ADS Veris crea herramientas empresariales para que una PyME pueda ordenar, visualizar y comprender mejor su negocio.</p>
            </div>
            <div>
              <h3>Explorar</h3>
              <div class="footer-links">
                <a href="index.html">Inicio</a>
                <a href="tienda.html">Tienda</a>
                <a href="nosotros.html">Nosotros</a>
                <a href="ayuda.html">Ayuda</a>
              </div>
            </div>
            <div>
              <h3>Empresa</h3>
              <div class="footer-links">
                <a href="contacto.html">Contacto</a>
                <a href="plataforma.html">Visión futura</a>
                <a href="producto.html?id=planilla-integral-gestion-pyme">Producto destacado</a>
              </div>
            </div>
            <div>
              <h3>Legal</h3>
              <div class="footer-links">
                <a href="legal.html">Centro legal</a>
                <a href="terminos.html">Términos</a>
                <a href="privacidad.html">Privacidad</a>
                <a href="reembolsos.html">Reembolsos</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© <span data-current-year></span> ADS Veris. Del dato al criterio.</span>
            <span>Legal y soporte en páginas separadas dentro del mismo proyecto.</span>
          </div>
        </div>
      </footer>
    `;
  }
}

function productCard(product) {
  return `
    <article class="card product-card" data-category="${product.category}">
      <a class="thumb" href="producto.html?id=${product.slug}" aria-label="Ver ${product.title}">
        <img src="${product.thumb}" alt="${product.title}">
        <div class="thumb-overlay">
          <div class="thumb-title">${product.shortTitle}</div>
          <span class="badge ${product.badgeClass}">${product.badge}</span>
        </div>
      </a>
      <div class="product-body">
        <div class="product-meta">${product.categoryLabel}</div>
        <h3>${product.title}</h3>
        <p class="small">${product.summary}</p>
        <div class="product-footer">
          <div>
            <div class="price">${product.price}</div>
            <small class="small">${product.priceNote}</small>
          </div>
          <div class="product-actions">
            <a class="btn btn-primary btn-sm" href="producto.html?id=${product.slug}">Ver detalle</a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedProducts() {
  const host = document.querySelector("[data-featured-products]");
  if (!host) return;
  host.innerHTML = getProducts().filter((product) => product.featured).map(productCard).join("");
}

function updateStoreCounter(host) {
  const counter = document.querySelector("[data-store-count]");
  if (!counter) return;
  const visible = [...host.querySelectorAll(".product-card")].filter((card) => !card.classList.contains("hidden")).length;
  counter.textContent = `${visible} producto${visible === 1 ? "" : "s"} disponible${visible === 1 ? "" : "s"}`;
}

function renderStoreProducts() {
  const host = document.querySelector("[data-store-products]");
  if (!host) return;

  host.innerHTML = getProducts().map(productCard).join("");
  updateStoreCounter(host);

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const selected = button.dataset.filter;

      host.querySelectorAll(".product-card").forEach((card) => {
        const matches = selected === "all" || card.dataset.category === selected;
        card.classList.toggle("hidden", !matches);
      });

      updateStoreCounter(host);
    });
  });
}

function renderProductDetail() {
  const host = document.querySelector("[data-product-detail]");
  if (!host) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("id") || "planilla-integral-gestion-pyme";
  const product = getProductBySlug(slug) || getProducts()[0];
  document.title = `${product.shortTitle} | ADS Veris`;

  const thumbs = (product.images || []).map((image, index) => `
    <button type="button" data-gallery-thumb="${index}" aria-label="Ver imagen ${index + 1}">
      <img src="${image}" alt="${product.title} vista ${index + 1}">
    </button>
  `).join("");

  host.innerHTML = `
    <section class="page-hero">
      <div class="container page-shell">
        <div class="breadcrumbs"><a href="index.html">Inicio</a> / <a href="tienda.html">Tienda</a> / ${product.shortTitle}</div>
        <span class="eyebrow">Detalle de producto</span>
        <h1>${product.title}</h1>
        <p>${product.subtitle}</p>
      </div>
    </section>
    <section class="section section-tight">
      <div class="container product-detail">
        <div class="card gallery">
          <div class="gallery-main" data-gallery-main>
            <img src="${product.images[0]}" alt="${product.title}">
          </div>
          <div class="gallery-note">Placeholder visual listo para reemplazar por capturas reales del Excel en <code>assets/products.js</code>.</div>
          <div class="gallery-thumbs">${thumbs}</div>
        </div>
        <aside class="card detail-panel">
          <div class="pill">${product.categoryLabel}</div>
          <h2>${product.subtitle}</h2>
          <div class="detail-price">${product.price}</div>
          <p class="small">${product.priceNote}</p>
          <p>${product.description}</p>
          <div class="actions">
            <!-- Conecta aquí el checkout real o enlace de pago cuando definas el flujo comercial. -->
            <a class="btn btn-primary" href="contacto.html">Coordinar compra</a>
            <a class="btn btn-secondary" href="tienda.html">Volver al catálogo</a>
          </div>
          <div class="detail-block">
            <h3>Problema que resuelve</h3>
            <p>${product.problem}</p>
          </div>
          <div class="detail-block">
            <h3>Qué incluye</h3>
            <ul class="info-list">${product.includes.map((item) => `<li>${item}</li>`).join("")}</ul>
          </div>
          <div class="review-shell">
            <h3>Reseñas</h3>
            <p class="small">Espacio preparado para estrellas, comentarios y prueba social.</p>
            <!-- Integra aquí tu sistema de reseñas real cuando definas la fuente de datos. -->
            <div class="empty-review">★★★★★<span>Próximamente podrás mostrar reseñas reales aquí.</span></div>
          </div>
        </aside>
      </div>
    </section>
  `;

  const mainImage = host.querySelector("[data-gallery-main] img");
  host.querySelectorAll("[data-gallery-thumb]").forEach((button, index) => {
    button.addEventListener("click", () => {
      mainImage.src = product.images[index];
      mainImage.alt = `${product.title} vista ${index + 1}`;
    });
  });
}

function handleWaitlistSubmit(form) {
  const email = form.querySelector('input[name="email"]');
  const message = form.parentElement.querySelector("[data-form-ok]") || form.querySelector("[data-form-ok]");
  if (!email || !email.value.trim()) {
    email?.focus();
    return;
  }
  if (message) {
    message.style.display = "block";
  }
  // Reemplaza este bloque por un fetch real cuando conectes Supabase, Resend, Formspree o tu propio backend.
  form.reset();
}

function bindWaitlistForms() {
  document.querySelectorAll("[data-waitlist-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handleWaitlistSubmit(form);
    });
  });
}

function renderYear() {
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  renderFeaturedProducts();
  renderStoreProducts();
  renderProductDetail();
  bindWaitlistForms();
  renderYear();
});
