/* ============================================
   PRIME BURGUER — produtos.js
   Dados do cardápio e SVGs
============================================ */

/* ── SVG HELPERS ── */
function svgBurger(extras = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="88" height="88">
    <ellipse cx="50" cy="28" rx="32" ry="13" fill="#c8762a"/>
    <ellipse cx="50" cy="22" rx="30" ry="10" fill="#e8943a"/>
    <ellipse cx="50" cy="19" rx="28" ry="7" fill="#f5a84a"/>
    <ellipse cx="40" cy="17" rx="3" ry="1.5" fill="#fff" opacity=".5"/>
    <ellipse cx="55" cy="15" rx="3" ry="1.5" fill="#fff" opacity=".5"/>
    <ellipse cx="62" cy="20" rx="2.5" ry="1.2" fill="#fff" opacity=".5"/>
    <rect x="18" y="39" width="64" height="10" rx="4" fill="#7a3b10"/>
    <path d="M16 38 Q18 35 50 36 Q82 35 84 38 L84 41 Q82 38 50 39 Q18 38 16 41 Z" fill="#FF6B00"/>
    ${extras}
    <ellipse cx="50" cy="72" rx="32" ry="9" fill="#c8762a"/>
    <ellipse cx="50" cy="68" rx="32" ry="6" fill="#e8943a"/>
  </svg>`;
}

var SVGS = {
  burger: svgBurger(),
  burger_salada: svgBurger(`
    <rect x="18" y="51" width="64" height="5" rx="2" fill="#4caf50" opacity=".9"/>
    <circle cx="35" cy="53" r="3" fill="#e53935" opacity=".85"/>
    <circle cx="60" cy="53" r="3" fill="#e53935" opacity=".85"/>`),
  burger_frango: svgBurger(`
    <rect x="18" y="51" width="64" height="6" rx="3" fill="#f5d87a" opacity=".95"/>
    <rect x="20" y="50" width="60" height="3" rx="2" fill="#e6c84a" opacity=".7"/>`),
  burger_especial: svgBurger(`
    <rect x="18" y="51" width="64" height="5" rx="2" fill="#d4a843" opacity=".9"/>
    <ellipse cx="50" cy="54" rx="22" ry="3" fill="#b8860b" opacity=".6"/>`),
  burger_bacon: svgBurger(`
    <rect x="20" y="51" width="60" height="4" rx="2" fill="#8B0000" opacity=".9"/>
    <rect x="22" y="56" width="56" height="3" rx="2" fill="#a00" opacity=".7"/>`),
  burger_costela: svgBurger(`
    <rect x="18" y="51" width="64" height="6" rx="3" fill="#6d3b1a" opacity=".95"/>
    <path d="M22 53 Q40 50 60 53 Q70 55 78 52" stroke="#c8762a" stroke-width="2" fill="none" opacity=".7"/>`),
  burger_nordestino: svgBurger(`
    <rect x="18" y="51" width="64" height="5" rx="2" fill="#d4a843" opacity=".85"/>
    <rect x="20" y="57" width="60" height="3" rx="2" fill="#fff" opacity=".25"/>`),
  burger_turbo: svgBurger(`
    <rect x="18" y="49" width="64" height="4" rx="2" fill="#8B0000" opacity=".9"/>
    <rect x="18" y="54" width="64" height="4" rx="2" fill="#f5c842" opacity=".8"/>
    <rect x="18" y="59" width="64" height="3" rx="2" fill="#4caf50" opacity=".7"/>`),
  burger_camarao: svgBurger(`
    <path d="M30 55 Q40 48 50 55 Q60 62 70 55" stroke="#FF6B00" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M34 59 Q44 52 54 59 Q64 66 72 59" stroke="#e07040" stroke-width="2" fill="none" stroke-linecap="round"/>`),

  combo_kids: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" width="110" height="95">
    <ellipse cx="38" cy="30" rx="22" ry="9" fill="#c8762a"/>
    <ellipse cx="38" cy="25" rx="20" ry="7" fill="#e8943a"/>
    <rect x="16" y="34" width="44" height="7" rx="3" fill="#7a3b10"/>
    <path d="M14 33 Q16 30 38 31 Q60 30 62 33 L62 36 Q60 33 38 34 Q16 33 14 36 Z" fill="#FF6B00"/>
    <ellipse cx="38" cy="46" rx="22" ry="6" fill="#e8943a"/>
    <rect x="72" y="55" width="36" height="28" rx="6" fill="#2a2a2a" stroke="#FF6B00" stroke-width="1.5"/>
    <rect x="78" y="35" width="5" height="28" rx="2" fill="#f5c842"/>
    <rect x="86" y="30" width="5" height="33" rx="2" fill="#f0b830"/>
    <rect x="94" y="33" width="5" height="30" rx="2" fill="#f5c842"/>
    <rect x="102" y="28" width="5" height="35" rx="2" fill="#f0b830"/>
  </svg>`,

  combo_sapeense: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" width="110" height="95">
    <ellipse cx="38" cy="30" rx="22" ry="9" fill="#c8762a"/>
    <ellipse cx="38" cy="25" rx="20" ry="7" fill="#e8943a"/>
    <rect x="16" y="34" width="44" height="7" rx="3" fill="#7a3b10"/>
    <path d="M14 33 Q16 30 38 31 Q60 30 62 33 L62 36 Q60 33 38 34 Q16 33 14 36 Z" fill="#FF6B00"/>
    <ellipse cx="38" cy="46" rx="22" ry="6" fill="#e8943a"/>
    <path d="M76 35 L80 85 L108 85 L112 35 Z" fill="#e53935"/>
    <path d="M76 35 L112 35 L110 30 L78 30 Z" fill="#c62828"/>
    <rect x="85" y="25" width="18" height="8" rx="3" fill="#bbb"/>
    <rect x="92" y="10" width="4" height="18" rx="2" fill="#bbb"/>
    <rect x="78" y="50" width="32" height="4" rx="2" fill="#fff" opacity=".15"/>
  </svg>`,

  combo_onions: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 100" width="135" height="95">
    <ellipse cx="30" cy="30" rx="18" ry="8" fill="#c8762a"/>
    <ellipse cx="30" cy="25" rx="17" ry="6" fill="#e8943a"/>
    <rect x="12" y="33" width="36" height="6" rx="3" fill="#7a3b10"/>
    <path d="M11 32 Q13 29 30 30 Q47 29 49 32 L49 35 Q47 32 30 33 Q13 32 11 35 Z" fill="#FF6B00"/>
    <ellipse cx="30" cy="44" rx="18" ry="5" fill="#e8943a"/>
    <rect x="58" y="58" width="30" height="24" rx="5" fill="#2a2a2a" stroke="#FF6B00" stroke-width="1.5"/>
    <rect x="63" y="38" width="4" height="26" rx="2" fill="#f5c842"/>
    <rect x="70" y="34" width="4" height="30" rx="2" fill="#f0b830"/>
    <rect x="77" y="36" width="4" height="28" rx="2" fill="#f5c842"/>
    <path d="M100 38 L103 82 L126 82 L129 38 Z" fill="#e53935"/>
    <path d="M100 38 L129 38 L127 33 L102 33 Z" fill="#c62828"/>
    <rect x="108" y="27" width="14" height="7" rx="2" fill="#bbb"/>
    <rect x="113" y="14" width="4" height="15" rx="2" fill="#bbb"/>
    <rect x="102" y="52" width="26" height="3" rx="2" fill="#fff" opacity=".15"/>
  </svg>`,

  recheada: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="90" height="90">
    <rect x="18" y="52" width="64" height="30" rx="8" fill="#2a2a2a" stroke="#FF6B00" stroke-width="2"/>
    <rect x="26" y="30" width="8" height="30" rx="3" fill="#f5c842"/>
    <rect x="38" y="24" width="8" height="36" rx="3" fill="#f0b830"/>
    <rect x="50" y="28" width="8" height="32" rx="3" fill="#f5c842"/>
    <rect x="62" y="22" width="8" height="38" rx="3" fill="#f0b830"/>
    <path d="M22 54 Q35 47 50 52 Q65 57 78 50 L78 58 Q65 65 50 60 Q35 55 22 62 Z" fill="#FF6B00" opacity="0.85"/>
    <rect x="28" y="61" width="18" height="5" rx="2" fill="#8B0000" opacity="0.9"/>
    <rect x="54" y="64" width="18" height="5" rx="2" fill="#8B0000" opacity="0.9"/>
  </svg>`
};

/* ── PRODUTOS ── */
var produtos = [
  // HAMBÚRGUERES
  {id:1,  num:'1',  nome:'Prime Sapeense',   desc:'Pão opcional, blend 150g, queijo cheddar, abacaxi, cebola caramelizada, alface americano',                                             preco:16.90, cat:'burgers', img:'https://i.ibb.co/1GrdJZKN/prime-sape.jpg'},
  {id:2,  num:'2',  nome:'Prime Classic',    desc:'Pão opcional, blend 150g, queijo cheddar e creme de cheddar',                                                                          preco:14.90, cat:'burgers', img:'https://i.ibb.co/twtwtGf1/prime-classic.jpg'},
  {id:3,  num:'3',  nome:'Prime Duplo',      desc:'Pão opcional, 2 blend 150g, queijo cheddar e creme de cheddar',                                                                        preco:19.90, cat:'burgers', img:'https://i.ibb.co/DJ5VRxP/prime-duplo.jpg'},
  {id:4,  num:'4',  nome:'Prime Onions',     desc:'Pão opcional, blend 150g, queijo cheddar, anéis de cebola, maionese da casa e alface americano',                                       preco:18.90, cat:'burgers', img:'https://i.imgur.com/EHcPkpc.jpg'},
  {id:5,  num:'5',  nome:'Prime Salada',     desc:'Pão opcional, blend 150g, queijo mussarela, ovo, maionese da casa, tomate, cebola roxa e alface americano',                            preco:20.90, cat:'burgers', img:'https://i.ibb.co/RTQpshKr/IMG-20260525-WA0023.jpg'},
  {id:6,  num:'6',  nome:'Prime Calabresa',  desc:'Pão opcional, blend 150g, queijo cheddar, calabresa, picles, maionese da casa, tomate, cebola roxa e alface americano',                preco:22.90, cat:'burgers', img:'https://i.ibb.co/xqmNsV6y/IMG-20260526-WA0005.jpg'},
  {id:7,  num:'7',  nome:'Prime Frango',     desc:'Pão opcional, blend 150g de frango, picles, maionese, queijo mussarela, tomate e alface americano',                                    preco:22.90, cat:'burgers', img:'https://i.ibb.co/fVGLJ535/IMG-20260511-WA0099.jpg', novo:true},
  {id:8,  num:'8',  nome:'Prime Especial',   desc:'Pão opcional, blend 150g, queijo do reino, cebola caramelizada e maionese da casa',                                                    preco:23.90, cat:'burgers', img:'https://i.ibb.co/FkkyWxDw/prime-especial.jpg'},
  {id:9,  num:'9',  nome:'Prime Bacon',      desc:'Pão opcional, blend 150g, queijo cheddar, bacon, geléia de pimenta, picles, cebola caramelizada, alface americano e maionese da casa', preco:24.90, cat:'burgers', img:'https://i.ibb.co/dwvs5xpb/prime-bacon.jpg'},
  {id:10, num:'10', nome:'Prime Costela',    desc:'Pão opcional, blend 150g, queijo cheddar, geléia de pimenta, costela desfiada, picles, tomate, cebola roxa e alface americano',        preco:25.90, cat:'burgers', img:'https://i.ibb.co/mrkvM8Gj/IMG-20260511-WA0092.jpg'},
  {id:11, num:'11', nome:'Prime Nordestino', desc:'Pão opcional, blend 150g, queijo coalho, carne de sol desfiada com requeijão, maionese da casa, tomate, cebola roxa e alface americano',preco:27.90, cat:'burgers', img:'https://i.ibb.co/LzqVdmk4/IMG-20260511-WA0095.jpg'},
  {id:12, num:'12', nome:'Prime Turbo',      desc:'Pão opcional, blend 150g, queijo cheddar, ovo, calabresa, bacon, picles, cebola caramelizada, maionese da casa e alface americano',    preco:28.90, cat:'burgers', img:'https://i.ibb.co/XrsnztTF/IMG-20260526-WA0004.jpg'},
  {id:13, num:'13', nome:'Prime Camarão',    desc:'Pão opcional, blend 150g, queijo mussarela, camarão, maionese da casa e alface americano',                                             preco:29.90, cat:'burgers', img:'https://i.ibb.co/YG8rjqp/IMG-20260521-WA0122.jpg'},

  // COMBOS
  {id:20, nome:'Combo Kids',     desc:'Prime Classic + fritas (80g)',                                preco:18.90, cat:'combos', img:'https://i.ibb.co/DgQ0dKjd/file-0000000069a471f5911e553ae75afe65.png'},
  {id:21, nome:'Combo Sapeense', desc:'Prime Sapeense + Coca-Cola 350ml',                            preco:22.90, cat:'combos', img:'https://i.ibb.co/TqYRfQ04/file-0000000029c071f5a9472d39915ad4fc.png'},
  {id:22, nome:'Combo Onions',   desc:'Prime Onions + fritas (80g) + Refrigerante Pepsi 350ml',      preco:26.90, cat:'combos', img:'https://i.ibb.co/gLn4YGxn/file-0000000066c871f5a6ecaf75e0a234bc.png'},

  // PETISCOS
  {id:30, nome:'Batata Palito P',    desc:'Batata palito frita — porção pequena',                                     preco:12.90, cat:'petiscos', img:'https://i.ibb.co/wrggxGRp/Chat-GPT-Image-May-17-2026-02-49-29-PM.png'},
  {id:31, nome:'Batata Palito M',    desc:'Batata palito frita — porção média',                                       preco:16.90, cat:'petiscos', img:'https://i.ibb.co/wrggxGRp/Chat-GPT-Image-May-17-2026-02-49-29-PM.png'},
  {id:32, nome:'Batata Palito G',    desc:'Batata palito frita — porção grande',                                      preco:19.90, cat:'petiscos', img:'https://i.ibb.co/wrggxGRp/Chat-GPT-Image-May-17-2026-02-49-29-PM.png'},
  {id:33, nome:'Batata Recheada P',  desc:'Batata palito com creme cheddar e bacon — porção pequena',                 preco:16.90, cat:'petiscos', img:'https://i.ibb.co/RGy2t2VB/file-00000000ef58720e8de08411971aae70.png'},
  {id:34, nome:'Batata Recheada M',  desc:'Batata palito com creme cheddar e bacon — porção média',                   preco:20.90, cat:'petiscos', img:'https://i.ibb.co/RGy2t2VB/file-00000000ef58720e8de08411971aae70.png'},
  {id:35, nome:'Batata Recheada G',  desc:'Batata palito com creme cheddar e bacon — porção grande',                  preco:25.90, cat:'petiscos', img:'https://i.ibb.co/RGy2t2VB/file-00000000ef58720e8de08411971aae70.png'},
  {id:36, nome:'Batata Prime',       desc:'Recheada com creme cheddar, bacon, carne de sol desfiada e maionese da casa', preco:28.90, cat:'petiscos', img:'https://i.ibb.co/j9K4Gw54/IMG-20260514-WA0000.jpg'},
  {id:37, nome:'Porção de Onions',   desc:'15 unidades de anéis de cebola empanados',                                 preco:15.90, cat:'petiscos', img:'https://i.ibb.co/RT12WRwF/file-00000000c74871f58cf8f531a747a74e.png'},

  // BEBIDAS
  {id:40, nome:'Água Mineral',            desc:'500ml — sem gás',                                                    preco:3.00,  cat:'bebidas', img:'https://i.ibb.co/XrS3B12g/IMG-20260513-WA0153.jpg'},
  {id:41, nome:'Água com Gás',            desc:'500ml — com gás',                                                    preco:3.50,  cat:'bebidas', img:'https://i.ibb.co/d4MP4tkS/IMG-20260513-WA0150.jpg'},
  {id:42, nome:'Refrigerante Mini 200ml', desc:'Guaraná Antarctica, Pepsi, Soda Antarctica',                         preco:3.50,  cat:'bebidas', img:'https://i.ibb.co/qLfwbxx9/IMG-20260513-WA0014.jpg', opcoes:['Guaraná Antarctica','Pepsi','Soda Antarctica']},
  {id:43, nome:'Refrigerante 250ml',      desc:'Coca-Cola, Fanta',                                                   preco:3.90,  cat:'bebidas', img:'https://i.ibb.co/HWXpSGb/file-000000005ce4720ebf759f0c3836e9ca.png', opcoes:['Coca-Cola','Fanta']},
  {id:44, nome:'Refrigerante Lata 350ml', desc:'Coca-Cola, Coca Zero, Fanta Laranja, Guaraná Antarctica, Pepsi',     preco:5.90,  cat:'bebidas', img:'https://i.ibb.co/zVTqNK0K/IMG-20260513-WA0012.jpg', opcoes:['Coca-Cola','Coca Zero','Fanta Laranja','Guaraná Antarctica','Pepsi']},
  {id:45, nome:'Suco Del Valle 450ml',    desc:'Laranja',                                                            preco:5.90,  cat:'bebidas', img:'https://i.ibb.co/Kcn1k35J/IMG-20260513-WA0050.jpg'},
  {id:46, nome:'H2O Limoneto 500ml',      desc:'',                                                                   preco:6.90,  cat:'bebidas', img:'https://i.ibb.co/ym3q7V2X/IMG-20260513-WA0018-1.jpg'},
  {id:47, nome:'Refrigerante 500ml',      desc:'Coca-Cola',                                                          preco:7.90,  cat:'bebidas', img:'https://i.ibb.co/SwydcFpv/file-00000000a9b471f994659abe6dcd48da.png'},
  {id:48, nome:'Refrigerante 1L',         desc:'Coca-Cola, Fanta, Guaraná Antarctica',                               preco:9.90,  cat:'bebidas', img:'https://i.ibb.co/5xK05zVL/IMG-20260513-WA0013.jpg', opcoes:['Coca-Cola','Fanta','Guaraná Antarctica']},
  {id:49, nome:'Refrigerante 2L',         desc:'Coca-Cola, Guaraná Antarctica',                                      preco:15.90, cat:'bebidas', img:'https://i.ibb.co/005Vbbv/IMG-20260513-WA0017.jpg', opcoes:['Coca-Cola','Guaraná Antarctica']},

  // SOBREMESAS
  {id:50, nome:'Mousse',                desc:'Limão ou Maracujá',                  preco:7.90,  cat:'sobremesas', img:'https://i.ibb.co/L28WYPM/Chat-GPT-Image-15-de-mai-de-2026-19-48-32.png'},
  {id:51, nome:'Tortinha',              desc:'Limão com chantilly',                preco:7.90,  cat:'sobremesas', img:'https://i.ibb.co/vCDJggSM/file-00000000d0fc71f989a19bac8f013fd0.png'},
  {id:52, nome:'Sorvete de 3 Camadas',  desc:'Limão, chocolate e leite condensado',preco:9.90,  cat:'sobremesas', img:'https://i.ibb.co/C55TWydX/IMG-20260525-WA0015.jpg'},
  {id:53, nome:'Bolo de Pote',          desc:'Consultar sabores disponíveis',      preco:10.00, cat:'sobremesas', img:'https://i.ibb.co/7tF07HzD/IMG-20260517-WA0050.jpg'},
  {id:54, nome:'Delícia no Pote',       desc:'Delícia de Abacaxi ou Banoffe',      preco:10.00, cat:'sobremesas', img:'https://i.ibb.co/nstXmm6b/file-00000000b55471fbaea643dd1650334d.png'},
  {id:55, nome:'Caixinha de Doces 4un', desc:'',                                   preco:7.00,  cat:'sobremesas', img:'https://i.ibb.co/23TgxGyd/IMG-20260517-WA0047.jpg'},
  {id:56, nome:'Caixinha de Doces 6un', desc:'',                                   preco:10.00, cat:'sobremesas', img:'https://i.ibb.co/qQGPJhL/IMG-20260517-WA0051.jpg'},
];
