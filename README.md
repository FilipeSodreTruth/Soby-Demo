# SOPY - HTML/CSS Version

Versão em HTML/CSS puro do projeto SOPY, convertido do Next.js original.

## Estrutura do Projeto

```
html-version/
├── index.html          # Página principal
├── comprar.html        # Página de compras
├── css/
│   └── main.css        # Estilos principais (convertidos do Tailwind)
├── js/
│   ├── main.js         # JavaScript principal com animações
│   └── purchase.js     # JavaScript da página de compras
├── fonts/
│   ├── GeistVF.woff    # Fonte Geist Variable
│   └── GeistMonoVF.woff # Fonte Geist Mono Variable
└── images/
    └── .gitkeep        # Pasta para imagens do produto
```

## Funcionalidades Implementadas

### Página Principal (index.html)
- ✅ Hero section com animações
- ✅ Seção de showcase do produto
- ✅ Grid de características (6 features)
- ✅ Seção de depoimentos
- ✅ Call-to-action final
- ✅ Animações de scroll
- ✅ Design responsivo

### Página de Compras (comprar.html)
- ✅ Seleção de variantes (Verde, Azul, Eco)
- ✅ Seleção de quantidade (25, 50, 100 cápsulas)
- ✅ Métodos de pagamento (única/assinatura)
- ✅ Controles de quantidade
- ✅ Galeria de imagens
- ✅ FAQ com acordeão
- ✅ Cálculo dinâmico de preços
- ✅ Mudança de cores por variante

### CSS Personalizado
- ✅ Variáveis CSS para cores
- ✅ Espaçamento consistente
- ✅ Animações (float, pulse-glow, slide-up)
- ✅ Sistema de grid responsivo
- ✅ Componentes de UI (buttons, cards, badges)

### JavaScript
- ✅ Animações de scroll
- ✅ Funcionalidade de acordeão
- ✅ Seleção interativa de produtos
- ✅ Carrinho de compras básico
- ✅ Efeitos visuais e transições

## Como Usar

1. Abra `index.html` em qualquer navegador moderno
2. Navegue para `comprar.html` através dos links
3. Todas as funcionalidades são client-side
4. Não requer servidor web (pode ser aberto diretamente)

## Imagens

As imagens referenciadas no código precisam ser adicionadas na pasta `images/`:
- `modern-cleaning-capsule-product-floating-with-oran.png`
- `sopy-product-showcase.jpg`
- `happy-woman-smiling.png`
- `businessman-portrait.png`
- `happy-mother.png`

## Diferenças do Original Next.js

- ❌ Remoção do framework React/Next.js
- ❌ Remoção do Tailwind CSS (convertido para CSS puro)
- ❌ Remoção das dependências Node.js
- ✅ Mantidas todas as funcionalidades visuais
- ✅ Mantidas todas as interações
- ✅ Mantido o design responsivo
- ✅ Mantidas as animações

## Tecnologias Utilizadas

- HTML5 semântico
- CSS3 com custom properties
- JavaScript ES6+ vanilla
- Design responsivo com CSS Grid/Flexbox
- Animações CSS3
- SVG icons inline

## Compatibilidade

- ✅ Chrome/Edge (90+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ✅ Dispositivos móveis
- ✅ Tablets
- ✅ Desktop

## Performance

- Sem dependências externas
- CSS otimizado
- JavaScript minimalista
- Imagens otimizadas (quando adicionadas)
- Carregamento rápido
