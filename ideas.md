# Ideias de Design — Site-App AÍO

## Design Escolhido: Minimalismo Aquático Contemporâneo

### Design Movement
**Minimalismo Aquático Contemporâneo** — Fusão de minimalismo moderno com elementos aquáticos que remetem à ancestralidade, ritmo e natureza. Inspirado em design escandinavo limpo, com toques de arte digital contemporânea.

### Core Principles
1. **Clareza Funcional**: Cada elemento serve um propósito — player intuitivo, navegação clara, hierarquia visual forte
2. **Fluidez Aquática**: Água como metáfora visual — gradientes suaves, ondas, splashes, movimento orgânico
3. **Ancestralidade Geométrica**: Símbolos geométricos (triângulo, círculo, cruz) que sugerem raízes culturais e ritmo
4. **Espaço Respirável**: Abundância de whitespace, layouts assimétricos, composições que deixam o conteúdo respirar

### Color Philosophy
**Paleta Azul-Claro Aquática** (oklch color space):
- **Primary**: `oklch(0.75 0.12 220)` — Azul-claro vibrante, céu e água
- **Secondary**: `oklch(0.88 0.08 200)` — Azul muito claro, quase branco, para backgrounds
- **Accent**: `oklch(0.45 0.18 220)` — Azul profundo para contraste e interatividade
- **Text**: `oklch(0.15 0.02 220)` — Azul muito escuro, quase preto, para legibilidade
- **Background**: `oklch(0.98 0.01 220)` — Branco com toque de azul

**Reasoning**: Azul representa água, ancestralidade, ritmo natural. A paleta transmite calma, profundidade e modernidade sem perder a conexão com a natureza.

### Layout Paradigm
**Assimétrico Fluido com Eixo Vertical**:
- Hero com capa à esquerda, tipografia à direita (quebra a simetria)
- Seções alternadas: conteúdo à esquerda, imagem à direita; depois inverte
- Player flutuante ou integrado organicamente
- Uso de clip-path para cortes diagonais suaves (água)
- Divisores orgânicos entre seções (ondas, splashes)

### Signature Elements
1. **Logo AÍO Geométrico**: Triângulo (A), linha (I), círculo (O) com símbolos internos — aparece em headers, backgrounds sutis, ícones
2. **Efeito de Água**: Splashes, ondas, gotas em backgrounds, divisores, hover states
3. **Tipografia em Camadas**: Serif elegante para títulos (ancestralidade), sans-serif limpo para corpo (modernidade)

### Interaction Philosophy
- **Suave e Orgânica**: Transições fluidas, não abruptas
- **Feedback Tátil**: Hover states com ondas, cliques com splashes
- **Player Intuitivo**: Controles grandes, visuais claros, feedback imediato
- **Exploração**: Instrumentos clicáveis, modais que abrem suavemente

### Animation
- **Transições**: 300-400ms ease-out para aberturas, 200ms para fechamentos
- **Ondas**: Animação contínua sutil em backgrounds (keyframes de 8-12s)
- **Splashes**: Ao clicar em botões principais, efeito de água que se expande
- **Scroll**: Parallax leve em imagens, fade-in de elementos conforme scroll
- **Player**: Animação de barras de progresso fluida, pulsação no play

### Typography System
- **Títulos**: Serif elegante (Google Fonts: Crimson Text, 700 weight) — 48px (desktop), 32px (mobile)
- **Subtítulos**: Serif 400 weight — 24px (desktop), 18px (mobile)
- **Corpo**: Sans-serif limpo (Google Fonts: Poppins, 400 weight) — 16px (desktop), 14px (mobile)
- **Botões**: Poppins 600 weight, 14px, uppercase com letter-spacing
- **Captions**: Poppins 300 weight, 12px, cor muted

---

## Implementação
- Paleta de cores em `client/src/index.css` com variáveis CSS
- Componentes reutilizáveis com Tailwind + shadcn/ui
- Animações em `@keyframes` CSS ou Framer Motion para complexas
- Divisores SVG com clip-path para efeitos aquáticos
- Tipografia via Google Fonts (Crimson Text + Poppins)
