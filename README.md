# Barbearia Carvalho — Landing Page

Site de uma página da Barbearia Carvalho (Salto/SP), com agendamento pelo app AppBarber.

Visual amarelo e marrom tirados do logo, seções alternando claro e escuro, líquido animado no fundo e agendamento por popup. **Sem framework, sem build, sem dependência** — três arquivos e as imagens.

---

## Rodando o site

Não tem build. Qualquer servidor de arquivos estáticos serve:

```bash
python3 -m http.server 8843
# abre http://localhost:8843
```

Abrir o `index.html` direto pelo `file://` funciona quase tudo, mas o mapa e o slot de vídeo podem falhar — melhor usar o servidor.

**Publicar:** sobe a pasta inteira em qualquer hospedagem estática (GitHub Pages, Netlify, Vercel, Hostinger, cPanel). Não precisa de Node, PHP nem banco.

---

## Estrutura

```
index.html        markup e conteúdo (686 linhas)
css/style.css     todo o estilo e as animações (1566 linhas)
js/script.js      interações (372 linhas)
assets/img/       fotos da barbearia, logo e favicons
assets/video/     vazio — o slot de vídeo ativa sozinho quando você põe tour.mp4 aqui
```

---

## Cores

Amostradas do arquivo do logo, não escolhidas a olho:

| Token | Valor | Uso |
| --- | --- | --- |
| `--yellow` | `#fcc920` | amarelo da marca, fundo das seções claras |
| `--ink` | `#43291c` | marrom do logo — textos e fundo das seções escuras |
| `--ink-2` | `#563a28` | marrom claro — cards sobre seção escura |
| `--ink-3` | `#2a1810` | marrom profundo — frase destacada dos títulos |

Trocar a marca inteira = trocar esses quatro valores no `:root` do `css/style.css`. Todo o resto deriva deles.

### Seções claras e escuras

O tema é **troca de variável**, não regra duplicada. Uma seção escura é só isto:

```html
<section class="servicos section--ink" id="servicos">
```

O bloco `.section--ink` reescreve `--bg`, `--fg`, `--surface`, `--accent` etc., e todos os componentes dentro dela se ajustam sozinhos. Para deixar uma seção clara, remova a classe. Para escurecer outra, adicione.

Hoje escuras: **Serviços**, **Ambiente** e **CTA final** (mais o rodapé). As demais são amarelas.

> Ao trocar uma seção de tema, confira também as **faixas líquidas** vizinhas (abaixo) — elas precisam apontar para o lado certo.

---

## As faixas líquidas entre seções

O líquido preto/marrom que separa as seções não é enfeite: é a transição. Três variantes:

| Classe | Papel |
| --- | --- |
| `.liquid-divider` | faixa flutuando entre duas seções claras |
| `.liquid-divider--pour` | o escuro escorre para baixo e encosta na seção escura seguinte |
| `.liquid-divider--rise` | o mesmo espelhado, saindo de uma seção escura acima |

`--pour` usa o path `#liquidPour`; `--rise` usa o mesmo path virado com `scaleY(-1)`.

**Cuidado ao editar o path das ondas:** ele tem 4 períodos de 720px e a animação desloca exatamente 720px (um período). É isso que faz o loop não ter emenda. Se mudar o período do path, mude o `translateX` do `@keyframes liquidDrift` no mesmo valor, senão aparece um salto a cada volta.

A mesma lógica vale para o **selo giratório** (volta de 360°), o **marquee** e o **carrossel da equipe** (conteúdo duplicado + `-50%`).

---

## Coisas que quebram fácil (leia antes de editar)

Três invariantes não óbvias. Todas já causaram bug aqui.

**1. Não escreva `transform` direto nos cards pelo JS.**
Cards e fotos compõem vários efeitos num único `transform`: a inclinação-base do grid torto (`--tilt`/`--shift`), o tilt 3D do mouse (`--tx`/`--ty`), o levantar (`--lift`/`--pop`) e a entrada ao rolar (`--reveal-y`). O JS escreve **custom properties**; o CSS monta o `transform`. Escrever `element.style.transform` apaga tudo de uma vez.

**2. O elemento observado pelo scroll nunca pode estar cortado.**
A revelação das fotos usa `clip-path`. Um elemento totalmente cortado tem área visível zero, então o `IntersectionObserver` **nunca** o considera visível — a classe não entra, o corte não abre, e a foto fica invisível para sempre. Por isso o `data-wipe` fica no **pai sem corte** (`.photo-stack`) e o `clip-path` no filho (`.photo-frame`).

**3. O estado inicial escondido depende da classe `.js` no `<html>`.**
Um script inline no `<head>` marca `document.documentElement.classList.add('js')` antes da primeira pintura. As regras de reveal são presas a `.js`, então **sem JavaScript o conteúdo aparece normal** em vez de ficar invisível esperando alguém revelar. Se remover esse script, metade da página desaparece para quem tem JS desligado.

---

## Como editar o conteúdo

**Fotos da barbearia** — troque os arquivos em `assets/img/` mantendo os nomes, ou ajuste os caminhos no `index.html`. Vale otimizar antes (as atuais estão em ~1400px de lado, qualidade 82).

**Vídeo** — coloque um `tour.mp4` em `assets/video/`. O JS testa o arquivo com um `HEAD` e, se existir, ativa o player e troca a legenda de "Vídeo em breve" para "Vídeo da casa". Nada mais a fazer.

**Equipe** — os três cards em `#equipe` estão com placeholder ("Nome do barbeiro", "Foto em breve"). Para cada um: troque o `<svg class="team-card__avatar">` por uma `<img>`, e edite nome e cargo.
O carrossel tem **dois conjuntos idênticos** de cards (o segundo dentro de `.team-carousel__dup`, com `aria-hidden`). É o que fecha o loop sem emenda — **edite os dois igualmente**, senão o carrossel "pisca" a cada volta.

**Serviços, textos, contato** — direto no `index.html`, tudo em português e sem template.

**Adesivos geométricos** (pontinhos, X, anéis) — posicionados por `style` inline no HTML, dentro de `.stickers`. Precisam ficar **dentro de uma `<section>`**: é o `overflow-x: clip` da seção que evita que os que sangram na borda criem rolagem horizontal.

---

## Acessibilidade

- **Contraste** — os 125 elementos de texto foram medidos nos dois temas; nenhum abaixo do mínimo AA (o corpo de texto fica em ~6:1, títulos passam de 12:1). Ao mexer em cor ou opacidade de texto, meça de novo.
- **`prefers-reduced-motion`** — desliga o líquido, os adesivos, o cursor, a quebra de título em palavras e as cortinas de foto, mantendo o conteúdo visível e a inclinação estática dos cards.
- **Sem JavaScript** — o conteúdo aparece (ver invariante 3).
- Elementos decorativos são `aria-hidden` e `pointer-events: none`; o carrossel duplicado está fora da árvore de acessibilidade.

---

## Integrações externas

**Agendamento** — popup com os links reais do AppBarber (Google Play e App Store). Abre pelos botões "Agendar" e, uma vez por sessão, sozinho após 14s (`AUTO_OPEN_KEY` no `js/script.js`).
Os ícones do Google Play e da App Store são marcas registradas: **não recolorir**.

**Mapa** — iframe do Google Maps por URL simples (`output=embed`), sem chave de API. Está com `pointer-events: none` de propósito: nada nele responde a clique, então os popups que o Google abre por interação não disparam. Quem quiser navegar usa o link "Abrir no Google Maps" abaixo.
Conteúdo dentro de um iframe de outro domínio não é acessível por CSS/JS — se o Google passar a mostrar algum aviso já no carregamento, a única saída é abandonar o embed ao vivo (mapa estático ou ilustrado).

---

## Ainda pendente

- Fotos e nomes reais da equipe
- Vídeo da barbearia (`assets/video/tour.mp4`)
- Links reais do Instagram e WhatsApp (hoje `href="#"` no rodapé e nos cards da equipe)

---

## Testando alterações

Os testes visuais foram feitos com Playwright (Chromium), verificando a cada mudança:

- as três larguras: 1440, 390 e 320px
- ausência de rolagem horizontal (`window.scrollTo(9999, 0)` deve deixar `scrollX` em 0)
- contraste de todo o texto nos dois temas
- os loops sem emenda, comparando o valor computado no início e no fim do ciclo — **não** por comparação de pixels, que dá falso positivo
- `prefers-reduced-motion`
- console sem erros
