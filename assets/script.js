
function getProducts() {
  return window.ANALIXIA_PRODUCTS || [];
}
function getProductBySlug(slug) {
  return getProducts().find(p => p.slug === slug);
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
            <span class="brand-mark">A</span>
            <span class="brand-name">Analix<span>ia</span></span>
          </a>
          <nav class="main-nav" aria-label="Principal">
            <a href="index.html" class="${page === "home" ? "active" : ""}">Inicio</a>
            <a href="tienda.html" class="${page === "tienda" || page === "producto" ? "active" : ""}">Tienda</a>
            <a href="plataforma.html" class="${page === "plataforma" ? "active" : ""}">Plataforma IA</a>
            <a href="nosotros.html" class="${page === "nosotros" ? "active" : ""}">Nosotros</a>
            <a href="legal.html" class="${["legal","terminos","privacidad","reembolsos"].includes(page) ? "active" : ""}">Legal</a>
            <a href="ayuda.html" class="${page === "ayuda" ? "active" : ""}">Ayuda</a>
            <a href="contacto.html" class="${page === "contacto" ? "active" : ""}">Contacto</a>
          </nav>
          <div class="header-actions">
            <span class="header-note">Fase actual: plantillas para captar clientes</span>
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
                <span class="brand-mark">A</span>
                <span class="brand-name">Analix<span>ia</span></span>
              </div>
              <p class="small" style="margin-top:14px;max-width:340px">
                Primero te ayudamos a ordenar números con plantillas. Después te llevamos a una plataforma con diagnóstico, comunidad y formación aplicada.
              </p>
            </div>
            <div>
              <h3 style="font-size:1rem">Explora</h3>
              <div class="footer-links">
                <a href="index.html">Inicio</a>
                <a href="tienda.html">Tienda</a>
                <a href="producto.html?id=integral">Producto destacado</a>
                <a href="plataforma.html">Plataforma IA</a>
              </div>
            </div>
            <div>
              <h3 style="font-size:1rem">Empresa</h3>
              <div class="footer-links">
                <a href="nosotros.html">Nosotros</a>
                <a href="contacto.html">Contacto</a>
                <a href="ayuda.html">Ayuda</a>
                <a href="legal.html">Centro legal</a>
              </div>
            </div>
            <div>
              <h3 style="font-size:1rem">Legal</h3>
              <div class="footer-links">
                <a href="terminos.html">Términos</a>
                <a href="privacidad.html">Privacidad</a>
                <a href="reembolsos.html">Reembolsos</a>
                <a href="mailto:contacto@analixia.cl">contacto@analixia.cl</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© 2026 Analixia · Hecho en Chile · Diseñado para convertir claridad en decisiones.</span>
            <span>Decide con datos. Crece con claridad.</span>
          </div>
        </div>
      </footer>
    `;
  }
}
function moneyIsFree(product) {
  return String(product.price).toLowerCase().includes("gratis");
}
function productCard(product) {
  const button = moneyIsFree(product)
    ? `<a class="btn btn-primary btn-sm" href="plataforma.html">Pedir gratis</a>`
    : `<a class="btn btn-primary btn-sm" href="producto.html?id=${product.slug}">Ver detalle</a>`;
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
        <ul class="product-list">
          ${product.bullets.slice(0,3).map(item => `<li>${item}</li>`).join("")}
        </ul>
        <div class="product-footer">
          <div>
            <div class="price">${product.price}</div>
            <small class="small">${product.priceNote}</small>
          </div>
          <div class="product-actions">
            ${button}
          </div>
        </div>
      </div>
    </article>
  `;
}
function renderFeaturedProducts() {
  const host = document.querySelector("[data-featured-products]");
  if (!host) return;
  const picks = getProducts().filter(p => ["integral","estados","flujo"].includes(p.slug));
  host.innerHTML = picks.map(productCard).join("");
}
function renderStoreProducts() {
  const host = document.querySelector("[data-store-products]");
  if (!host) return;
  const list = getProducts().filter(p => p.slug !== "bundle");
  host.innerHTML = list.map(productCard).join("");
  const filters = document.querySelectorAll("[data-filter]");
  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      filters.forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      host.querySelectorAll(".product-card").forEach(card => {
        const cat = card.dataset.category;
        const show = filter === "all" || cat === filter;
        card.classList.toggle("hidden", !show);
      });
      const visible = [...host.querySelectorAll(".product-card")].filter(card => !card.classList.contains("hidden")).length;
      const counter = document.querySelector("[data-store-count]");
      if (counter) counter.textContent = `${visible} plantilla${visible !== 1 ? "s" : ""} disponible${visible !== 1 ? "s" : ""}`;
    });
  });
}
function renderProductDetail() {
  const host = document.querySelector("[data-product-detail]");
  if (!host) return;
  const params = new URLSearchParams(location.search);
  const slug = params.get("id") || "integral";
  const product = getProductBySlug(slug) || getProducts()[0];
  document.title = `${product.shortTitle} — Analixia`;
  const imageButtons = (product.images || []).map((img, idx) => `
    <button type="button" data-gallery-thumb="${idx}">
      <img src="${img}" alt="${product.title} vista ${idx + 1}">
    </button>`).join("");
  host.innerHTML = `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumbs"><a href="index.html">Inicio</a> / <a href="tienda.html">Tienda</a> / ${product.shortTitle}</div>
        <span class="eyebrow">Detalle del producto</span>
        <h1>${product.title}</h1>
        <p style="max-width:760px">${product.description}</p>
      </div>
    </section>
    <section class="section-tight">
      <div class="container product-detail">
        <div class="card gallery">
          <div class="gallery-main" data-gallery-main>
            <img src="${product.images[0]}" alt="${product.title}">
          </div>
          <div class="gallery-thumbs">
            ${imageButtons}
          </div>
        </div>
        <aside class="card detail-panel">
          <div class="pill">${product.categoryLabel}</div>
          <h2 style="margin-top:14px">${product.outcome}</h2>
          <div class="detail-price">${product.price}</div>
          <p class="small">${product.priceNote}</p>
          <div class="actions">
            <a class="btn btn-primary" href="${moneyIsFree(product) ? "plataforma.html" : "contacto.html"}">${moneyIsFree(product) ? "Quiero esta plantilla" : "Hablar para comprar"}</a>
            <a class="btn btn-secondary" href="tienda.html">Volver a tienda</a>
          </div>
          <ul class="info-list">
            ${product.bullets.map(item => `<li>${item}</li>`).join("")}
            <li>Galería pensada para mostrar tus capturas reales de Excel sin recargar la tarjeta del catálogo.</li>
            <li>Esta plantilla funciona hoy, pero también prepara al cliente para la futura plataforma de análisis.</li>
          </ul>
        </aside>
      </div>
    </section>
  `;
  const thumbs = host.querySelectorAll("[data-gallery-thumb]");
  const main = host.querySelector("[data-gallery-main] img");
  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      main.src = product.images[index];
      main.alt = `${product.title} vista ${index + 1}`;
    });
  });
}
function saveWaitlist(form) {
  const message = form.querySelector("[data-form-ok]");
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.nombre || !data.apellido || !data.email || !data.telefono) {
    alert("Completa nombre, apellido, email y teléfono.");
    return;
  }
  const items = JSON.parse(localStorage.getItem("analixia_waitlist") || "[]");
  items.push({...data, createdAt:new Date().toISOString()});
  localStorage.setItem("analixia_waitlist", JSON.stringify(items));
  message.style.display = "block";
  form.reset();
}
function bindWaitlistForms() {
  document.querySelectorAll("[data-waitlist-form]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      saveWaitlist(form);
    });
  });
}
document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  renderFeaturedProducts();
  renderStoreProducts();
  renderProductDetail();
  bindWaitlistForms();
});
