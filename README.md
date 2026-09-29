# Barbearia Carvalho

Site estático de quatro páginas, sem framework, backend ou build. Identidade original em amarelo e marrom, fontes Bebas Neue e Poppins, fotos reais e agendamento pelo AppBarber.

## Rodar localmente

```sh
python3 -m http.server 8843 --bind 127.0.0.1
```

Abra http://localhost:8843. Publique os arquivos HTML e as pastas `css`, `js` e `assets` juntos em uma hospedagem estática. Não são necessárias regras de reescrita: os links usam arquivos `.html` explícitos.

## Páginas e arquivos

- `index.html`: início, Sobre, Serviços, Equipe, Ambiente, Galeria, Localização e encerramento.
- `kids.html`: atendimento infantil.
- `produtos.html`: apresentação da linha para cabelo e barba e consulta por telefone.
- `trabalhe-conosco.html`: convite a interessados e contato por telefone.
- `css/style.css`: identidade, componentes e responsividade compartilhados.
- `js/script.js`: navegação móvel, modal, revelações na rolagem, faixa, esfera e leão do Kids.
- `PRODUCT.md`: decisões de produto e direção visual.

Cabeçalho, rodapé e modal são HTML estático em cada página. Ao alterar links ou informações comuns, atualize as quatro páginas; isso mantém a navegação funcional mesmo sem JavaScript.

## Conteúdo pendente

### Ilustração Kids

A arte prevista é um leão cartoon original, sorridente, com juba marrom penteada, em amarelo e marrom. A geração pela ferramenta embutida foi recusada pelo filtro automático em duas tentativas; nenhum arquivo de ilustração foi produzido. Nesta versão o leão foi desenhado à mão em SVG, embutido em `.kids-stage` (kids.html) e `.teaser-lion` (index.html). Se uma arte final for entregue, troque o SVG mantendo as classes `.lion__head`, `.lion__eye` e `.lion__pupils` para preservar as animações.

### Equipe

A equipe aparece num mostrador estilo smartwatch (`#teamWatch` em `index.html`): fotos em colmeia ao redor da logo, efeito lupa nas bordas, arrastável. Ao tocar, a foto se expande até ocupar o mostrador, com nome, função, botão "Agendar com…" e setas para o anterior e o próximo. Escape ou × fecham e devolvem o foco. Sem JavaScript, a mesma lista aparece como grade com nomes.

**Os 6 perfis atuais são provisórios** ("Barbeiro 1" a "Barbeiro 6" com `assets/img/equipe/foto-pendente.svg`). Para cada profissional real, edite um `<li class="watch__item">`: troque `src` pela foto (quadrada, de preferência 600×600, salva em `assets/img/equipe/`), preencha `data-name` e `data-role` e os textos de `.pro__name` e `.pro__role`. Para adicionar ou remover alguém, basta incluir ou apagar um `<li>`; a colmeia se reorganiza sozinha (a partir de 7 pessoas surge um segundo anel, que aparece menor nas bordas até ser arrastado para o centro). Use somente fotos autorizadas.

### Produtos

Não existe checkout, preço presumido ou catálogo inventado. Em `produtos.html`, copie o artigo de `<template id="product-item">` para `.product-catalog` e preencha foto real, nome, descrição e texto alternativo. A consulta atual usa `tel:+5511997621172`.

### Trabalhe Conosco

Nenhum e-mail foi presumido. Em `trabalhe-conosco.html`, copie o link de `<template id="recruitment-email">` para a seção de contato somente após confirmar o endereço real. Adicione `href` no formato `mailto:ENDERECO_REAL?subject=Interesse%20em%20trabalhar%20%E2%80%94%20Barbearia%20Carvalho` e mostre o endereço em texto próximo ao botão para quem não tem cliente de e-mail configurado. Não há upload de currículos nem armazenamento de dados.

### Vídeo e redes sociais

Sem vídeo fornecido, a galeria mostra a fotografia de ferramentas. Quando houver `assets/video/tour.mp4`, substitua essa imagem por `<video controls playsinline preload="none" poster="assets/img/ferramentas.jpg">` com `<source src="assets/video/tour.mp4" type="video/mp4">`. Não fazemos requisições a arquivos inexistentes. Instagram e WhatsApp não têm URLs confirmadas; não exibimos atalhos vazios. O telefone real continua disponível.

### Domínio

`barbeariacarvalho.com` fica para etapa posterior. Disponibilidade, preço inicial e renovação precisam ser consultados antes da compra. Os US$ 12 da ata não são um preço verificado. Nenhum registro ou DNS foi alterado.

## Movimento e acessibilidade

Camada de movimento ampliada após a ATA. Sem cursor personalizado, magnetismo, confetes ou popup automático.

- Abertura em CSS puro (funciona sem JS): título palavra a palavra, sublinhado desenhado em "só seu.", foto revelada por recorte, selo com texto girando.
- Revelações na rolagem via `data-reveal` (`clip`, `left`, `right`, `pop`), `data-split` (palavra a palavra), `data-draw` (ícones desenhados) e `data-stagger` (escalonamento). Só escondem conteúdo quando `<html>` tem `.motion`, aplicada por script inline e removida em 3 s se `js/script.js` não carregar.
- Faixa de frases contínua que acelera e muda de direção com a rolagem; nav que se recolhe ao descer e volta ao subir, com barra de progresso; link da seção atual destacado.
- Paralaxe, tesoura que percorre a linha tracejada de Serviços e o "Relaxe. A casa é sua." usam `animation-timeline` nativo; sem suporte, ficam estáticos.
- Serviços são links para o agendamento, com preenchimento no hover. A esfera da equipe inclina com o mouse e continua pausando fora da tela, em aba oculta ou pelo botão.
- Kids: leão cartoon em SVG que pisca, segue o ponteiro com os olhos e responde ao toque com um balão (`aria-live`). Ele também espia na chamada Kids da página inicial.
- Transição entre páginas com View Transitions (Chromium e Safari recentes).

Com `prefers-reduced-motion: reduce`, nada anima e todo o conteúdo aparece de imediato.

O agendamento usa `<dialog>` nativo, que contém o foco e torna o fundo inerte. Escape, botão de fechar ou clique no backdrop fecham o modal e devolvem o foco. Sem JavaScript, os botões continuam sendo links reais para o AppBarber; Google Play e App Store também aparecem no rodapé via `noscript`.

## Verificação

Validar as quatro páginas em 320, 390, 768 e 1440 px: leitura, overflow, imagens, links internos, telefone, modal, teclado, foco, modo sem JavaScript e movimento reduzido. O Google Maps e as fontes dependem de rede externa; o site mantém fontes de sistema como alternativa.

Verificação da versão animada em Chromium (390 e 1440 px, quatro páginas): sem rolagem horizontal, sem erros de console, todos os elementos revelados após rolar. Com movimento reduzido nenhuma animação roda e nada fica oculto; sem JavaScript todo o conteúdo aparece. Modal abre pelos serviços, fecha com Escape e devolve o foco; o leão responde ao toque.
