/* =====================================================================
   CHANNEL SALE  —  ye ek hi file hai. Edit sirf "SALE" wale hisse mein karein.
   Price, followers, link, number — sab yahin badlein, aur kuch nahi chhona.
   Kitni bhi cheezein bechni hon, items mein ek aur { ... } add kar dein.
   Poori sale band karni ho to enabled: false kar dein.
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------- EDIT YAHAN SE ------------------------- */
  var SALE = {
    enabled: true,

    badge: 'FOR SALE',                 // chamakta hua tag
    title: 'Channel for sale',         // tag ke saath chhota heading ('' = khali)

    whatsapp: '923147385565',          // aapka number (country code ke saath, + aur space ke baghair)
    whatsappShow: '0314 7385565',      // screen par dikhne wala number ('' = na dikhao)
    buyText: 'Buy / Contact',          // khareedne wale button ka text
    viewText: 'View channel',          // channel dekhne wale button ka text

    // Buyer ka WhatsApp message. {item} ki jagah cheez ka naam aa jata hai.
    message: 'Salam! Mujhe "{item}" kharidna hai. Kya ye abhi available hai?',

    items: [
      {
        name: 'English Captions',                    // channel ka naam
        price: 'Price: DM me',                       // <-- yahan price likhein, jaise 'Rs 2,000'
        about: 'WhatsApp channel \u2022 Public',     // chhoti si line ('' = na dikhao)
        link: 'https://whatsapp.com/channel/0029Vb9QNz6F1YlbGzqHyZ3x',  // channel ka link ('' = button nahi)
        details: [                                   // chhote chhote boxes: [naam, value]
          ['Followers', '814'],
          ['Created', '14 Nov 2026'],
          ['Type', 'Public channel'],
          ['Niche', 'English captions']
        ]
      }
      // Dusri cheez bechni ho to upar ke } ke baad coma laga kar ye add karein:
      // , { name: 'Telegram Channel', price: 'Rs 3,000', about: '', link: '', details: [] }
    ]
  };
  /* ------------------------- EDIT YAHAN TAK ------------------------- */

  if (!SALE.enabled || !SALE.items || !SALE.items.length) return;

  var num = String(SALE.whatsapp || '').replace(/\D/g, '');

  var CSS =
    '.sale-card{margin:18px 0 0;padding:14px;border-radius:20px;background:rgba(var(--brand-glow,0,200,83),.10);border:1px solid rgba(var(--brand-glow,0,200,83),.45);color:var(--text-main,#fff);font-family:inherit}' +
    'body.has-wallpaper .sale-card{background:rgba(0,0,0,.30)}' +
    '.sale-head{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap}' +
    '.sale-tag{display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:999px;font-weight:700;font-size:12px;letter-spacing:1.3px;line-height:1;color:#fff;background:linear-gradient(135deg,var(--brand-1,#00c853),var(--brand-2,#00e676))}' +
    '.sale-title{font-size:12px;font-weight:600;color:var(--text-sub,rgba(255,255,255,.6))}' +
    '.sale-item{padding:12px;border-radius:16px;background:var(--input-bg,rgba(255,255,255,.05));border:1px solid var(--border-soft,rgba(255,255,255,.1))}' +
    '.sale-item+.sale-item{margin-top:8px}' +
    '.sale-name{font-size:15px;font-weight:700;line-height:1.3;word-break:break-word}' +
    '.sale-price{margin-top:3px;font-size:14px;font-weight:700;color:var(--brand-2,#00e676)}' +
    '.sale-about{margin-top:2px;font-size:12px;color:var(--text-sub,rgba(255,255,255,.6))}' +
    '.sale-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}' +
    '.sale-d{min-width:0;padding:7px 10px;border-radius:12px;background:rgba(var(--brand-glow,0,200,83),.10);border:1px solid rgba(var(--brand-glow,0,200,83),.25)}' +
    '.sale-d small{display:block;font-size:10px;line-height:1.2;color:var(--text-sub,rgba(255,255,255,.6))}' +
    '.sale-d b{display:block;font-size:12.5px;font-weight:700;line-height:1.35;word-break:break-word}' +
    '.sale-acts{display:flex;gap:8px;margin-top:12px}' +
    '.sale-btn{flex:1 1 0;min-width:0;display:flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:0 6px;border-radius:12px;font-size:12.5px;font-weight:700;line-height:1;white-space:nowrap;overflow:hidden;font-family:inherit;text-decoration:none;color:#fff;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;background:linear-gradient(135deg,var(--brand-1,#00c853),var(--brand-2,#00e676));border:1px solid transparent}' +
    '.sale-btn.alt{background:rgba(var(--brand-glow,0,200,83),.14);border-color:rgba(var(--brand-glow,0,200,83),.6);color:var(--text-main,#fff)}' +
    '.sale-btn:active{transform:scale(.96)}' +
    '.sale-foot{margin-top:10px;text-align:center;font-size:12px;color:var(--text-sub,rgba(255,255,255,.6))}' +
    '.sale-foot b{color:var(--text-main,#fff)}';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;       // textContent: koi HTML inject nahi hota
    return e;
  }
  function icon(cls) { var i = el('i', cls); i.setAttribute('aria-hidden', 'true'); return i; }
  function buyLink(name) {
    var msg = String(SALE.message || '').replace('{item}', name);
    return 'https://wa.me/' + num + (msg ? '?text=' + encodeURIComponent(msg) : '');
  }

  function build() {
    if (document.getElementById('saleCard')) return;

    var st = el('style', null, CSS);
    document.head.appendChild(st);

    var card = el('section', 'sale-card'); card.id = 'saleCard';

    var head = el('div', 'sale-head');
    var tag = el('span', 'sale-tag');
    tag.appendChild(icon('fas fa-tag'));
    tag.appendChild(document.createTextNode(SALE.badge || 'FOR SALE'));
    head.appendChild(tag);
    if (SALE.title) head.appendChild(el('span', 'sale-title', SALE.title));
    card.appendChild(head);

    SALE.items.forEach(function (it) {
      if (!it || !it.name) return;
      var row = el('div', 'sale-item');
      row.appendChild(el('div', 'sale-name', it.name));
      if (it.price) row.appendChild(el('div', 'sale-price', it.price));
      if (it.about) row.appendChild(el('div', 'sale-about', it.about));

      if (it.details && it.details.length) {
        var grid = el('div', 'sale-grid');
        it.details.forEach(function (d) {
          if (!d || !d[1]) return;
          var c = el('div', 'sale-d');
          c.appendChild(el('small', null, d[0]));
          c.appendChild(el('b', null, d[1]));
          grid.appendChild(c);
        });
        row.appendChild(grid);
      }

      var acts = el('div', 'sale-acts');
      if (it.link && /^https:\/\//i.test(it.link)) {
        var v = el('a', 'sale-btn alt');
        v.href = it.link; v.target = '_blank'; v.rel = 'noopener noreferrer';
        v.appendChild(icon('fab fa-whatsapp'));
        v.appendChild(el('span', null, SALE.viewText || 'View channel'));
        acts.appendChild(v);
      }
      if (num) {
        var b = el('a', 'sale-btn');
        b.href = buyLink(it.name); b.target = '_blank'; b.rel = 'noopener';
        b.appendChild(icon('fas fa-handshake'));
        b.appendChild(el('span', null, SALE.buyText || 'Buy / Contact'));
        acts.appendChild(b);
      }
      if (acts.childNodes.length) row.appendChild(acts);
      card.appendChild(row);
    });

    if (num && SALE.whatsappShow) {
      var foot = el('div', 'sale-foot', 'WhatsApp: ');
      foot.appendChild(el('b', null, SALE.whatsappShow));
      card.appendChild(foot);
    }

    // jagah: views (stats-row) ke bilkul upar. Na mile to main card ke andar, aakhir mein.
    var anchor = document.querySelector('.stats-row');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(card, anchor);
    else (document.getElementById('mainCard') || document.body).appendChild(card);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
