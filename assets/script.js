(function(){
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

  window.formatCLP = function(value){
    return new Intl.NumberFormat('es-CL', {style:'currency', currency:'CLP', maximumFractionDigits:0}).format(value);
  }

  window.getProduct = function(slug){
    return (window.ANALIXIA_PRODUCTS || []).find(p => p.slug === slug);
  }

  window.renderNav = function(active){
    const nav = `
      <nav class="site-nav">
        <div class="container nav-inner">
          <a class="brand" href="index.html">
            <img src="assets/logo-analixia-pyme.png" alt="Analixia Pyme">
          </a>
          <ul class="nav-links">
            <li><a href="index.html" class="${active==='inicio' ? 'active' : ''}">Inicio</a></li>
            <li><a href="tienda.html" class="${active==='plantillas' ? 'active' : ''}">Plantillas</a></li>
            <li><a href="nosotros.html" class="${active==='nosotros' ? 'active' : ''}">Quiénes somos</a></li>
            <li><a href="legal.html" class="${active==='legal' ? 'active' : ''}">Legal</a></li>
            <li><a href="ayuda.html" class="${active==='ayuda' ? 'active' : ''}">Ayuda</a></li>
          </ul>
          <a class="btn btn-primary" href="tienda.html">Ver plantillas</a>
        </div>
      </nav>`;
    const holder = document.getElementById('site-nav');
    if(holder) holder.innerHTML = nav;
  }

  window.renderFooter = function(){
    const footer = `
      <footer class="footer page">
        <div class="container">
          <div class="footer-grid">
            <div>
              <a class="brand" href="index.html" style="margin-bottom:14px">
                <img src="assets/logo-analixia-pyme.png" alt="Analixia Pyme">
              </a>
              <p>Plantillas empresariales con enfoque financiero y visual para PyMEs que quieren ordenar sus números con criterio.</p>
            </div>
            <div>
              <h4>Empresa</h4>
              <ul>
                <li><a href="index.html">Inicio</a></li>
                <li><a href="nosotros.html">Quiénes somos</a></li>
                <li><a href="ayuda.html">Ayuda</a></li>
              </ul>
            </div>
            <div>
              <h4>Plantillas</h4>
              <ul>
                <li><a href="tienda.html">Catálogo</a></li>
                <li><a href="producto.html?slug=integral-gestion-pyme">Planilla integral</a></li>
                <li><a href="producto.html?slug=estados-financieros-completos">Estados completos</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul>
                <li><a href="legal.html">Centro legal</a></li>
                <li><a href="terminos.html">Términos de uso</a></li>
                <li><a href="privacidad.html">Privacidad</a></li>
                <li><a href="reembolsos.html">Reembolsos</a></li>
              </ul>
            </div>
            <div>
              <h4>Nota</h4>
              <ul>
                <li><a href="#">contacto@analixiapyme.cl</a></li>
                <li><span class="muted">Hecho para Chile</span></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span class="muted">© 2026 Analixia Pyme</span>
            <span class="muted">Plantillas digitales para gestión y finanzas empresariales</span>
          </div>
        </div>
      </footer>
    `;
    const holder = document.getElementById('site-footer');
    if(holder) holder.innerHTML = footer;
  }

  window.renderCatalog = function(containerId, limit=null){
    const grid = document.getElementById(containerId);
    if(!grid) return;
    const items = limit ? window.ANALIXIA_PRODUCTS.slice(0, limit) : window.ANALIXIA_PRODUCTS;
    grid.innerHTML = items.map(p => {
      const thumb = (p.images && p.images[0]) ? p.images[0] : '';
      return `
        <article class="card product" data-category="${p.category}">
          <a href="producto.html?slug=${p.slug}" class="product-thumb">
            ${thumb ? `<img src="${thumb}" alt="${p.name}">` : `<div class="empty-note" style="height:100%; display:grid; place-items:center">Vista previa pendiente</div>`}
          </a>
          <div class="product-body">
            <div class="product-top">
              <div>
                <span class="tag">${p.badge}</span>
                <h3 style="margin-top:10px">${p.name}</h3>
              </div>
              <div class="price">${formatCLP(p.price)}</div>
            </div>
            <p>${p.short}</p>
            <div class="features">
              ${p.includes.slice(0,4).map(i => `<div>${i}</div>`).join('')}
            </div>
            <div class="product-actions">
              <a class="btn btn-primary" href="producto.html?slug=${p.slug}">Ver detalle</a>
              <a class="btn btn-secondary" href="producto.html?slug=${p.slug}#galeria">Ver imágenes</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  window.renderBundle = function(containerId){
    const el = document.getElementById(containerId);
    if(!el) return;
    const slugs = window.ANALIXIA_BUNDLE.slugs;
    const included = slugs.map(s => getProduct(s)).filter(Boolean);
    el.innerHTML = `
      <div class="band card">
        <div class="grid-2" style="align-items:center">
          <div>
            <div class="small-label">Pack premium</div>
            <h3 style="font-size:2rem; margin-bottom:10px">${window.ANALIXIA_BUNDLE.name}</h3>
            <p>Llévate todas las plantillas actuales en un solo paquete. Ideal si quieres construir una oferta sólida desde el día uno o trabajar distintos frentes del negocio con una sola compra.</p>
            <div class="features" style="margin-top:18px">
              ${included.slice(0,6).map(p => `<div>${p.name}</div>`).join('')}
            </div>
          </div>
          <div class="card" style="padding:28px; text-align:center">
            <div class="muted" style="text-decoration:line-through; margin-bottom:6px">${formatCLP(window.ANALIXIA_BUNDLE.oldPrice)}</div>
            <div class="price" style="font-size:2.3rem">${formatCLP(window.ANALIXIA_BUNDLE.price)}</div>
            <p style="margin:8px 0 18px">Ahorro visible, oferta simple y producto mucho más potente.</p>
            <a class="btn btn-gold" href="tienda.html">Ver catálogo completo</a>
          </div>
        </div>
      </div>
    `;
  }

  window.setupFilters = function(buttonsSelector, gridSelector){
    const buttons = $$(buttonsSelector);
    const cards = $$(gridSelector + ' .product');
    if(!buttons.length || !cards.length) return;
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        cards.forEach(card => {
          const category = card.dataset.category.toLowerCase();
          const show = filter === 'todos' || category.includes(filter);
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  window.renderProductDetail = function(){
    const slug = new URLSearchParams(window.location.search).get('slug');
    const p = getProduct(slug);
    const wrap = document.getElementById('product-detail');
    if(!wrap) return;
    if(!p){
      wrap.innerHTML = `<div class="card detail-card"><h2>Producto no encontrado</h2><p>Vuelve a la tienda para seguir navegando.</p><a class="btn btn-primary" href="tienda.html">Ir a plantillas</a></div>`;
      return;
    }
    const main = (p.images && p.images[0]) ? p.images[0] : '';
    wrap.innerHTML = `
      <div class="detail-layout">
        <section class="card gallery" id="galeria">
          <div class="main-image">
            ${main ? `<img id="main-product-image" src="${main}" alt="${p.name}">` : `<div class="empty-note" style="height:100%; display:grid; place-items:center">Aquí irá la captura principal de esta plantilla</div>`}
          </div>
          <div class="thumb-row">
            ${(p.images || []).map((img, i) => `
              <button class="thumb ${i===0 ? 'active' : ''}" type="button" onclick="changeMainImage('${img.replace(/'/g, "\'")}', this)">
                <img src="${img}" alt="Vista ${i+1}">
              </button>
            `).join('')}
          </div>
          ${(!p.images || p.images.length === 0) ? `<p class="note-legal">Para mostrar imágenes reales de este producto, guarda tus capturas en la carpeta del sitio y reemplaza la ruta del producto en <code>assets/products.js</code>.</p>` : ``}
        </section>

        <aside class="card detail-card">
          <div class="small-label">${p.category}</div>
          <h1 style="font-size:clamp(2rem,3.8vw,3.3rem); margin-bottom:10px">${p.name}</h1>
          <p>${p.short}</p>
          <div class="detail-price">${formatCLP(p.price)}</div>
          <div class="badges">
            <span class="badge">${p.badge}</span>
            <span class="badge">${p.legalCategory}</span>
            <span class="badge">Formato .xlsx</span>
          </div>
          <div class="features">
            ${p.includes.map(i => `<div>${i}</div>`).join('')}
          </div>
          <div class="product-actions">
            <button class="btn btn-primary" onclick="fakePayment('${p.name}', '${formatCLP(p.price)}')">Comprar</button>
            <a class="btn btn-secondary" href="tienda.html">Volver a plantillas</a>
          </div>
          <div class="hr"></div>
          <p class="helper"><strong>Importante:</strong> el botón de compra está listo para conectarse más adelante con Flow o Stripe. Por ahora quedó como demostración visual.</p>
        </aside>
      </div>

      <section class="grid-2" style="margin-top:26px">
        <div class="card detail-card">
          <h3>Qué resuelve</h3>
          ${(p.details || []).map(t => `<p>${t}</p>`).join('')}
        </div>
        <div class="card review-box">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px">
            <div>
              <h3>Opiniones</h3>
              <p class="helper">La puntuación real se podrá activar cuando conectes ventas y reseñas.</p>
            </div>
            <div class="stars">★★★★★</div>
          </div>
          <div class="review-item">
            <strong>Vista previa premium</strong>
            <p>La página quedó lista para que luego sumes estrellas y opiniones reales cuando tengas ventas activas.</p>
          </div>
          <div class="review-item">
            <strong>Recomendación</strong>
            <p>Empieza mostrando capturas reales del Excel. Eso aumenta la confianza mucho más que una descripción sola.</p>
          </div>
        </div>
      </section>
    `;
    const breadcrumb = document.getElementById('product-breadcrumb');
    if(breadcrumb) breadcrumb.textContent = p.name;
    document.title = `${p.name} | Analixia Pyme`;
  }

  window.changeMainImage = function(src, btn){
    const img = document.getElementById('main-product-image');
    if(img) img.src = src;
    $$('.thumb').forEach(t => t.classList.remove('active'));
    if(btn) btn.classList.add('active');
  }

  window.setupWaitlist = function(formId, successId){
    const form = document.getElementById(formId);
    const ok = document.getElementById(successId);
    if(!form || !ok) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value.trim();
      if(!email || !email.includes('@')) return;
      const endpoint = window.ANALIXIA_CONFIG?.WAITLIST_ENDPOINT || "";
      if(endpoint){
        try{
          await fetch(endpoint, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ email })
          });
        }catch(err){
          console.log('No se pudo enviar a endpoint remoto todavía', err);
        }
      }
      form.reset();
      ok.textContent = window.ANALIXIA_CONFIG?.WAITLIST_SUCCESS_MESSAGE || 'Listo. Tu correo quedó registrado.';
      ok.style.display = 'block';
    });
  }

  window.fakePayment = function(productName, price){
    alert(`Compra de ejemplo\n\nProducto: ${productName}\nPrecio: ${price}\n\nMás adelante aquí puedes conectar Flow o Stripe.`);
  }

})();