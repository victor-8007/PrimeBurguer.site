/* ============================================
   PRIME BURGUER — checkout.js
   Finalização de pedido e WhatsApp
============================================ */

/** Chama a RPC criar_pedido no Supabase, tentando de novo 1x se a rede engasgar. */
async function salvarPedidoSupabase(dadosPedido) {
  const cfg = window.PRIME_SUPABASE || {};
  if (!cfg.url || !cfg.anonKey || cfg.url.includes('COLE_AQUI')) {
    throw new Error('Supabase nao configurado em js/supabase-config.js');
  }

  const tentar = async () => {
    const resposta = await fetch(`${cfg.url}/rest/v1/rpc/criar_pedido`, {
      method: 'POST',
      headers: {
        apikey: cfg.anonKey,
        Authorization: `Bearer ${cfg.anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pedido: dadosPedido })
    });
    const retorno = await resposta.json().catch(() => null);
    if (!resposta.ok || !retorno?.sucesso) {
      throw new Error(retorno?.erro || 'Erro ao salvar no Supabase');
    }
    return retorno;
  };

  try {
    return await tentar();
  } catch (primeiroErro) {
    console.warn('Primeira tentativa de salvar pedido falhou, tentando de novo...', primeiroErro);
    await new Promise(r => setTimeout(r, 1200));
    return await tentar();
  }
}

/** Evita pedido duplicado quando o cliente acha que nao funcionou e manda de novo rapido. */
function pedidoRepetidoRecente(chave) {
  try {
    const bruto = sessionStorage.getItem('ultimoPedidoPrime');
    if (!bruto) return false;
    const ultimo = JSON.parse(bruto);
    const passou = Date.now() - ultimo.quando;
    return ultimo.chave === chave && passou < 90000; // 90s
  } catch { return false; }
}
function registrarPedidoEnviado(chave) {
  try {
    sessionStorage.setItem('ultimoPedidoPrime', JSON.stringify({ chave, quando: Date.now() }));
  } catch { /* sessionStorage indisponivel, ignora */ }
}

async function finalizarPedido() {
  const nome = document.getElementById('nome').value.trim();
  const tel  = document.getElementById('telefone').value.trim();
  const obs  = document.getElementById('obs').value.trim();

  if (!cart.length)  { alert('Adicione itens ao carrinho primeiro!'); return; }
  if (!nome)         { alert('Por favor, informe seu nome.'); return; }
  if (!tel)          { alert('Por favor, informe seu telefone.'); return; }

  let enderecoTxt = '*Retirada no local*';
  let enderecoSalvar = '';
  if (tipoEntrega === 'entrega') {
    const rua    = document.getElementById('rua').value.trim();
    const bairro = document.getElementById('bairro').value.trim();
    const ref    = document.getElementById('ref').value.trim();
    if (!rua || !bairro || !ref) { alert('Preencha rua, bairro e ponto de referencia para entrega.'); return; }
    enderecoTxt = `*Entrega*\nEndereco: ${rua} - ${bairro}${ref ? '\nReferencia: ' + ref : ''}`;
    enderecoSalvar = `${rua} - ${bairro}\nReferencia: ${ref}`;
  }

  // Captura tudo ANTES de qualquer modificação
  const itensSalvar   = [...cart];
  const itens         = cart.map(x => `- ${x.qty}x ${x.nome} - ${fmt(x.preco * x.qty)}`).join('\n');
  const subtotal      = cart.reduce((s, x) => s + x.preco * x.qty, 0);
  const frete         = tipoEntrega === 'entrega' ? 3 : 0;
  const total         = subtotal + frete;
  const freteMsg      = frete > 0 ? '\nTaxa de entrega: R$ 3,00' : '';
  const pagtipo       = tipoPagamento;
  const trocoVal      = document.getElementById('troco-val').value;
  const precisaTrocoN = precisaTroco;

  // Trava contra pedido em dobro (cliente acha que travou e manda de novo)
  const chavePedido = JSON.stringify({ nome, tel, itensSalvar, total, pagtipo, enderecoSalvar });
  if (pedidoRepetidoRecente(chavePedido)) {
    const confirmar = confirm('Voce acabou de enviar esse mesmo pedido agora ha pouco. Quer enviar de novo mesmo assim?');
    if (!confirmar) return;
  }

  let pagamentoMsg = '\n*Pagamento:* PIX';
  if (pagtipo === 'dinheiro') {
    pagamentoMsg = `\n*Pagamento:* Dinheiro`
      + (precisaTrocoN && trocoVal  ? `\nTroco para: R$ ${trocoVal}` : '')
      + (precisaTrocoN && !trocoVal ? '\nPrecisa de troco (valor nao informado)' : '')
      + (!precisaTrocoN             ? '\nSem troco' : '');
  } else if (pagtipo === 'cartao') {
    pagamentoMsg = '\n*Pagamento:* Cartao';
  }

  const msg = `*NOVO PEDIDO - PRIME BURGUER*

Nome: ${nome}
Telefone: ${tel}
${enderecoTxt}

*Itens:*
${itens}${freteMsg}

*Total: ${fmt(total)}*${pagamentoMsg}${obs ? '\n\nObs: ' + obs : ''}

_Pedido feito pelo site_`;

  // Dados para salvar no banco
  const dadosPedido = {
    nome, tel, obs,
    tipo: tipoEntrega,
    endereco: enderecoSalvar,
    itens: itensSalvar,
    itens_texto: itens,
    subtotal,
    frete,
    total,
    pagamento: pagtipo,
    troco_para: (pagtipo === 'dinheiro' && precisaTrocoN)
      ? parseFloat(trocoVal) || null
      : null
  };

  // Abre a aba do WhatsApp JA no clique (sincrono), pra celular nao bloquear o pop-up depois do salvamento assincrono
  const wppWindow = window.open('', '_blank');

  // Atualizar botão
  document.getElementById('pedido-btn').disabled = true;
  document.getElementById('pedido-btn').textContent = 'SALVANDO PEDIDO...';

  let salvouNoBanco = true;
  try {
    await salvarPedidoSupabase(dadosPedido);
  } catch (erro) {
    salvouNoBanco = false;
    console.error('Falha ao salvar pedido no relatorio:', erro);
    alert('Nao consegui salvar este pedido no relatorio (internet fraca?). O WhatsApp vai abrir mesmo assim — avise o atendente que o pedido pode nao ter entrado no sistema.');
  }

  document.getElementById('pedido-btn').textContent = 'ABRINDO WHATSAPP...';

  const abriu = abrirWpp(WPP_NUM, msg, wppWindow);
  registrarPedidoEnviado(chavePedido);

  const linkFallback = document.getElementById('wpp-fallback-link');
  if (linkFallback) {
    if (!abriu) {
      linkFallback.href = montarLinkWpp(WPP_NUM, msg);
      linkFallback.style.display = 'block';
    } else {
      linkFallback.style.display = 'none';
    }
  }

  // Zerar carrinho
  cart = [];
  updateCartCount();

  // Mostrar mensagem de sucesso
  const pixInfoSucesso = document.getElementById('success-pix-info');
  if (pixInfoSucesso) {
    if (pagtipo === 'pix') {
      atualizarChavePixTela();
      pixInfoSucesso.style.display = 'block';
    } else {
      pixInfoSucesso.style.display = 'none';
    }
  }
  document.getElementById('success-msg').style.display = 'block';
  if (abriu) document.getElementById('pedido-btn').style.display = 'none';

  // Resetar tudo após alguns segundos (mais tempo se o link de apoio do WhatsApp estiver visivel)
  setTimeout(() => {
    document.getElementById('success-msg').style.display = 'none';
    document.getElementById('pedido-btn').style.display = 'block';
    document.getElementById('pedido-btn').disabled = false;
    document.getElementById('pedido-btn').textContent = 'FINALIZAR PEDIDO';
    document.getElementById('pedido-btn').style.background = 'var(--laranja)';
    if (linkFallback) linkFallback.style.display = 'none';
    document.getElementById('nome').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('rua').value = '';
    document.getElementById('bairro').value = '';
    document.getElementById('ref').value = '';
    document.getElementById('obs').value = '';
  }, abriu ? 4000 : 12000);
}
