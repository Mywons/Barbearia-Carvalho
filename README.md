# Barbearia Carvalho

Site estático de quatro páginas, sem framework, backend ou build. Identidade original em amarelo e marrom, fontes Bebas Neue e Poppins, fotos reais e agendamento pela agenda online do AppBarber (sites.appbarber.com.br).

## Rodar localmente

```sh
python3 -m http.server 8843 --bind 127.0.0.1
```

Abra http://localhost:8843. Publique os arquivos HTML e as pastas `css`, `js` e `assets` juntos em uma hospedagem estática. Não são necessárias regras de reescrita: os links usam arquivos `.html` explícitos.

## Páginas e arquivos

- `index.html`: início, Sobre, Serviços, Kids (chamada), Ambiente, Galeria, Localização e encerramento.
- `kids.html`: atendimento infantil.
- `produtos.html`: apresentação da linha para cabelo e barba e consulta por telefone.
- `trabalhe-conosco.html`: convite a interessados e contato por telefone.
- `css/style.css`: identidade, componentes e responsividade compartilhados.
- `js/script.js`: navegação móvel, modal, revelações na rolagem, faixa, vídeos e leão do Kids.
- `PRODUCT.md`: decisões de produto e direção visual.

Cabeçalho, rodapé e modal são HTML estático em cada página. Ao alterar links ou informações comuns, atualize as quatro páginas; isso mantém a navegação funcional mesmo sem JavaScript.

## Conteúdo pendente

### Ilustração Kids

O leão da Carvalho Kids tem 11 expressões em `assets/img/leao/` (WebP transparente, recortado da folha gerada à parte): `oi`, `feliz`, `piscadinha`, `gargalhada`, `surpreso`, `orgulhoso`, `pensando`, `timido`, `sono`, `comemorando` e `espiando`. Os bustos têm o mesmo enquadramento (410×332), então podem ser trocados sem o leão "pular".

- `kids.html`: o leão principal acena (`oi`); a cada toque troca de expressão com uma frase no balão e volta depois de 2,6 s. Fora do horário (antes das 9h ou depois das 18h, no relógio de quem visita) ele aparece com `sono`. Ele fica parado: só a expressão muda.
- Passos da visita: `timido`, `pensando` e `orgulhoso`. Popup de agendamento do Kids: `comemorando`.
- Chamada Kids da página inicial: `espiando`.

Para uma versão mais nítida, troque os arquivos por PNGs individuais maiores com os mesmos nomes.

### Produtos

Não existe checkout, preço presumido ou catálogo inventado. Em `produtos.html`, copie o artigo de `<template id="product-item">` para `.product-catalog` e preencha foto real, nome, descrição e texto alternativo. A consulta atual usa `tel:+5511997621172`.

### Trabalhe Conosco

Nenhum e-mail foi presumido. Em `trabalhe-conosco.html`, copie o link de `<template id="recruitment-email">` para a seção de contato somente após confirmar o endereço real. Adicione `href` no formato `mailto:ENDERECO_REAL?subject=Interesse%20em%20trabalhar%20%E2%80%94%20Barbearia%20Carvalho` e mostre o endereço em texto próximo ao botão para quem não tem cliente de e-mail configurado. Não há upload de currículos nem armazenamento de dados.

### Vídeo e redes sociais

Os vídeos ficam em `assets/video/`, sem áudio e com pôster `.jpg` de mesmo nome. `tour-casa.mp4` (720×1280, ~26 s) junta quatro trechos do salão com transições e ocupa o cartão da abertura (`.hero__video`); `kids.mp4` fica no cantinho de `kids.html`. O script toca cada vídeo mudo e em loop só quando está visível e adiciona um botão de pausa; sem JS ou com movimento reduzido ficam os controles nativos. Instagram e WhatsApp não têm URLs confirmadas; não exibimos atalhos vazios. O telefone real continua disponível.

O plano do rework visual está em `REWORK.md`.

### Domínio

`barbeariacarvalho.com` fica para etapa posterior. Disponibilidade, preço inicial e renovação precisam ser consultados antes da compra. Os US$ 12 da ata não são um preço verificado. Nenhum registro ou DNS foi alterado.

## Movimento e acessibilidade

Camada de movimento ampliada após a ATA. Sem cursor personalizado, magnetismo, confetes ou popup automático.

- Abertura em CSS puro (funciona sem JS): título palavra a palavra, sublinhado desenhado em "só seu.", foto revelada por recorte, selo com texto girando.
- Revelações na rolagem via `data-reveal` (`clip`, `left`, `right`, `pop`), `data-split` (palavra a palavra), `data-draw` (ícones desenhados) e `data-stagger` (escalonamento). Só escondem conteúdo quando `<html>` tem `.motion`, aplicada por script inline e removida em 3 s se `js/script.js` não carregar.
- Faixa de frases contínua que acelera e muda de direção com a rolagem; nav que se recolhe ao descer e volta ao subir, com barra de progresso; link da seção atual destacado.
- Paralaxe, tesoura que percorre a linha tracejada de Serviços e o "Relaxe. A casa é sua." usam `animation-timeline` nativo; sem suporte, ficam estáticos.
- Serviços são links para o agendamento, com preenchimento no hover.
- Kids: leão com 11 expressões que troca de cara ao toque, com balão (`aria-live`), cochila fora do horário e espia na chamada Kids da página inicial.
- Transição entre páginas com View Transitions (Chromium e Safari recentes).

Com `prefers-reduced-motion: reduce`, nada anima e todo o conteúdo aparece de imediato.

O agendamento usa `<dialog>` nativo, que contém o foco e torna o fundo inerte. Escape, botão de fechar ou clique no backdrop fecham o modal e devolvem o foco. O popup traz só o botão "Abrir agenda", que leva à agenda online (`sites.appbarber.com.br/barbeariacarvalhosalto`) em nova aba; não há mais botões de download do app. Sem JavaScript, os botões de agendar já são links diretos para a agenda, que também aparece no rodapé via `noscript`.

## Verificação

Validar as quatro páginas em 320, 390, 768 e 1440 px: leitura, overflow, imagens, links internos, telefone, modal, teclado, foco, modo sem JavaScript e movimento reduzido. O Google Maps e as fontes dependem de rede externa; o site mantém fontes de sistema como alternativa.

Verificação da versão animada em Chromium (390 e 1440 px, quatro páginas): sem rolagem horizontal, sem erros de console, todos os elementos revelados após rolar. Com movimento reduzido nenhuma animação roda e nada fica oculto; sem JavaScript todo o conteúdo aparece. Modal abre pelos serviços, fecha com Escape e devolve o foco; o leão responde ao toque.
