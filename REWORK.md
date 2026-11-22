# Plano de rework visual — Barbearia Carvalho

As fotos e vídeos novos mostram uma casa com personalidade própria: **tijolo aparente, madeira, metal preto, teto escuro com linhas de LED em quadrados, o letreiro BARBER com lâmpadas, poltronas chesterfield e a chopeira vinho com o selo BC dourado**. Hoje o site fala de "casa" mas mostra pouco dela. O rework traz esse espaço real para o centro, mantendo a identidade amarelo + marrom, Bebas Neue/Poppins e as regras do `PRODUCT.md` (fotos reais, nada inventado, movimento com propósito, acessível sem JS).

## Fase 1 — Mídia nova no ar ✅ (feito nesta entrega)

| Arquivo | Origem | Onde aparece |
|---|---|---|
| `assets/img/salao-barber.jpg` | Foto do salão com o letreiro BARBER | Hero da página inicial |
| `assets/img/cafe.jpg` | Máquina de café | Seção Ambiente (substitui cervejas) |
| `assets/img/prateleira-produtos.jpg` | Estante de tijolo com produtos | Galeria + hero de Produtos |
| `assets/img/bar-chopeira.jpg` | Chopeira BC, banqueta e geladeira | Galeria |
| `assets/img/espaco-kids.jpg` | Cantinho Kids | Galeria + nova seção em Kids |
| `assets/video/tour-casa.mp4` | WA0003 + WA0004 + WA0002 + WA0005, ~7 s cada, com transições | Cartão da abertura da página inicial (substituiu a foto; a foto BARBER foi para a galeria) |
| `assets/video/kids.mp4` | WA0001 | Seção "O cantinho deles" em Kids |

- Fotos redimensionadas (1080 px de largura; café 1600 px), JPEG progressivo, **EXIF/GPS removidos**.
- Vídeos verticais 540×960, H.264, **sem áudio**, `faststart`, ~0,4–0,5 MB cada, com pôster `.jpg`.
- Os vídeos tocam mudos e em loop só quando estão visíveis, pausam fora da tela/aba oculta e têm botão de pausar/reproduzir (WCAG 2.2.2). Sem JS ou com movimento reduzido ficam parados com controles nativos. `preload="none"` até o JS assumir.
- WA0000 (porta do banheiro) não foi usado: pouco valor para a vitrine.
- Corrigido: `foto-pendente.svg` estava em `assets/img/` mas era referenciado em `assets/img/equipe/`.

## Fase 2 — Linguagem visual tirada do espaço ✅ (feito)

- `.led`: moldura deslocada que se traça lado a lado e "acende" com uma piscada (hero, Ambiente, hero de Produtos/Trabalhe Conosco, cantinho Kids). Amarela em seções escuras, marrom nas claras.
- `.bulbs` (`--n` = nº de lâmpadas): fileira que acende uma a uma, acima do título de abertura e do "Relaxe. A casa é sua.".
- `.section--brick`: Serviços e encerramento com o tijolo do salão (`textura-tijolo.jpg`, já escurecido no arquivo; contraste do texto ≥ 6,5:1 no ponto mais claro).
- `--wine: #7a2232`: selo BC do hero, seta dos serviços no hover e botão de pausa dos vídeos.
- Com movimento reduzido, molduras e lâmpadas aparecem prontas, sem animação.

Proposta original:


1. **Linha de LED como assinatura gráfica.** Contornos retangulares finos em amarelo (`--yellow`), inspirados no teto, para emoldurar fotos em destaque, marcar a seção ativa e animar a entrada de seções (traço desenhado com `stroke-dashoffset`, já usado em `data-draw`). Substitui parte dos selos circulares.
2. **Letreiro de lâmpadas.** Pontos dourados nos títulos principais (H1 e "Relaxe. A casa é sua.") acendendo em sequência, uma vez, como o BARBER do salão. Desligado com movimento reduzido.
3. **Materiais nas seções escuras.** Seções `section--ink` ganham um fundo fotográfico muito escurecido do tijolo/madeira (overlay ≥ 85 %, contraste AA garantido) em vez do marrom chapado — no máximo 2 seções para não pesar.
4. **Vinho da chopeira como cor de apoio** (ex.: `--wine: #6e1f2b`) apenas para detalhes (selos, hover de serviços), sem virar a estética "preto e dourado" que o PRODUCT.md evita.

## Fase 3 — Estrutura das páginas

- **Início:** ✅ o cartão da abertura já é o vídeo único `tour-casa.mp4`. Falta avaliar `save-data` (não tocar automaticamente em conexões econômicas).
- **Ambiente → "Por dentro da Carvalho":** tour por zonas (Recepção · Bancadas · Café & chopp · Kids · Produtos), cada uma com foto ou vídeo e uma frase. Une as seções Ambiente e Galeria, hoje redundantes.
- **Produtos:** grade com fotos reais da estante quando a casa confirmar nomes e marcas (o template `#product-item` já existe). Não listar marcas só porque aparecem na foto.
- **Kids:** manter o leão; usar o cantinho real como prova de que o espaço existe.
- **Trabalhe Conosco:** trocar a foto do hero por um quadro do vídeo do salão (o "posto de trabalho").

## Fase 4 — Performance e acabamento

- Gerar versões WebP/AVIF com `srcset`/`sizes` (as fotos verticais ainda pesam 200–450 KB).
- Hospedagem com suporte a `Range` para vídeo (necessário no Safari/iOS).
- Validar 320/390/768/1440 px, teclado, sem JS e movimento reduzido (checklist do README).

## Pendências com a casa

- **Autorização de imagem:** o vídeo `kids.mp4` mostra uma criança (de costas). Confirmar autorização dos responsáveis antes de publicar; se não houver, trocar por um trecho sem a criança.
- No cantinho Kids aparece um relógio com marca de whisky — avaliar trocar o objeto ou recortar em fotos futuras.
- Seção da equipe removida (o AppBarber não oferece como puxar a lista automaticamente). Pode voltar como carrossel quando houver nomes e fotos.
- Catálogo real de produtos; e-mail de recrutamento.
- Instagram `@barbeariacarvalhosalto` aparece na chopeira — confirmar se pode virar link no rodapé.
