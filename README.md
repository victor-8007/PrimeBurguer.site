Prime Burguer

Sobre o projeto
=

O site permite que os clientes montem seus pedidos direto pelo celular ou computador, escolham a forma de pagamento e finalizem a compra via WhatsApp, sem precisar ligar ou esperar atendimento. Do outro lado, a equipe da hamburgueria tem um painel administrativo completo para gerenciar cardápio, acompanhar vendas e controlar a operação do dia a dia.

Funcionalidades:
=
Cardápio digital com mais de 40 produtos (burgers, combos, petiscos, bebidas e sobremesas)

Carrinho de compras com suporte a adicionais em cada item

Pagamento via PIX ou dinheiro, com exibição dinâmica da chave PIX da loja

Integração com WhatsApp para envio automático do pedido finalizado

Painel administrativo protegido por senha, com:

Remoção/restauração de itens do cardápio sem precisar mexer em código

Alteração da chave PIX

Controle de horário de funcionamento

Relatório de vendas (relatorio.html), com filtros por status e detalhamento por forma de pagamento

Agente de impressão térmica (prime-print-agent.ps1) para impressoras 58mm, que imprime os pedidos automaticamente na cozinha

Edição especial Copa 2026, com combo temático

Tecnologias utilizadas
=
Frontend: HTML, CSS e JavaScript, hospedado na Netlify

Backend: Supabase (banco de dados e funções serverless)

Impressão local: script em PowerShell para comunicação com impressoras térmicas

Pedidos: integração direta com WhatsApp

Histórico:
=

O projeto teve uma duração total de 10 meses. Nos primeiros três meses (dezembro, janeiro e fevereiro), o grupo se dedicou a estudar e aprender tecnologia, já que 
todos tinham interesse na área — foi essa fase inicial de aprendizado que deu base para o desenvolvimento do sistema. Para os testes do site, contaram com a ajuda de um conhecido do grupo, que ajudou a identificar falhas e pontos de melhoria antes do lançamento.

Na parte técnica, o projeto começou com testes em ambientes locais (XAMPP) e hospedagens gratuitas (InfinityFree), que se mostraram limitados para as necessidades do sistema. A solução final migrou para Supabase + Netlify, garantindo mais estabilidade, escalabilidade e facilidade de manutenção.

Correções na identificação da forma de pagamento (PIX x cartão) no banco de dados
Melhorias de usabilidade no checkout e no painel de relatórios
