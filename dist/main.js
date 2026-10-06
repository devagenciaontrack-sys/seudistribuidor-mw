(function () {
  // Eventos vão para o dataLayer (GTM) e, se existirem na página, para gtag, Meta Pixel e TikTok Pixel.
  window.dataLayer = window.dataLayer || [];
  function track(name, params) {
    params = params || {};
    window.dataLayer.push(Object.assign({ event: name }, params));
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    if (typeof window.fbq === 'function') window.fbq('trackCustom', name, params);
    if (window.ttq && typeof window.ttq.track === 'function') window.ttq.track(name, params);
  }
  window.trackEvent = track;

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (!el) return;
    if (el.hasAttribute('data-instagram') && el.getAttribute('href') === '#') e.preventDefault();
    track(el.getAttribute('data-track'), { location: el.getAttribute('data-location') || '' });
  });

  // Vídeo leve: só carrega o player do YouTube no clique (sem autoplay com áudio ao abrir a página).
  document.querySelectorAll('[data-video-id]').forEach(function (box) {
    var btn = box.querySelector('.video-poster');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var id = box.getAttribute('data-video-id');
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&playsinline=1&rel=0';
      iframe.title = btn.getAttribute('aria-label') || 'Vídeo';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      box.innerHTML = '';
      box.appendChild(iframe);
      track(box.getAttribute('data-track-play'), { video_id: id });
    }, { once: true });
  });

  // Simulador: (venda - compra - outros custos) x quantidade. Nenhum valor vem preenchido.
  var form = document.getElementById('calc');
  if (form) {
    var out = form.querySelector('.result');
    var total = document.getElementById('calc-total');
    var note = document.getElementById('calc-note');
    var started = false, completed = false;
    var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    function num(v) {
      v = String(v || '').trim().replace(/[^\d,.\-]/g, '');
      if (!v) return NaN;
      // aceita 1.234,56 e 1234.56
      if (v.indexOf(',') > -1) v = v.replace(/\./g, '').replace(',', '.');
      return parseFloat(v);
    }

    function update() {
      var compra = num(form.compra.value), venda = num(form.venda.value);
      var custos = num(form.custos.value), qtd = num(form.qtd.value);
      if ([compra, venda, custos, qtd].some(isNaN)) {
        total.textContent = 'R$ —';
        note.textContent = 'Preencha os quatro campos para ver o resultado.';
        out.classList.remove('is-neg');
        return;
      }
      var porPeca = venda - compra - custos;
      var dif = porPeca * qtd;
      total.textContent = brl.format(dif);
      out.classList.toggle('is-neg', dif < 0);
      note.textContent = dif < 0
        ? 'Com esses valores, o preço de venda não cobre a compra e os custos.'
        : brl.format(porPeca) + ' por peça × ' + qtd.toLocaleString('pt-BR') + ' peças.';
      if (!completed) {
        completed = true;
        track('distribuidor_simulator_complete');
      }
    }

    form.addEventListener('input', function () {
      if (!started) { started = true; track('distribuidor_simulator_start'); }
      update();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); update(); });
  }

  // Checklist do "Quer conhecer antes de decidir?" (apenas visual).
  document.querySelectorAll('.checklist button').forEach(function (b) {
    b.addEventListener('click', function () {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });
})();
