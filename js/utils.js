/* ============================================
   PRIME BURGUER — utils.js
   Funções auxiliares globais
============================================ */

var LOGO_URL = 'https://i.ibb.co/Hpxh868N/Whats-App-Image-2026-05-08-at-10-48-51-AM-1.jpg';
var WPP_NUM  = '5583994137234';
var ENDERECO = 'R. Júlio Francisco Da Silva, S/N — Planalto Central, Sapé - PB';

/** Formata número para moeda BRL */
function fmt(v) {
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}

/** Scroll suave para seção */
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

/** Monta o link do WhatsApp com a mensagem do pedido */
function montarLinkWpp(tel, msg) {
  const telFull = tel.replace(/\D/g, '');
  const num = telFull.startsWith('55') ? telFull : '55' + telFull;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

/** Abre WhatsApp com mensagem. Se "janela" (aba já aberta no clique) for passada, usa ela — evita bloqueio de pop-up. */
function abrirWpp(tel, msg, janela) {
  const url = montarLinkWpp(tel, msg);
  if (janela && !janela.closed) {
    janela.location.href = url;
    return true;
  }
  const nova = window.open(url, '_blank');
  return !!nova;
}
