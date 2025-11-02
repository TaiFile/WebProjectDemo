# Como usar as variáveis personalizadas do Tailwind CSS v4

## ⚠️ Importante: Tailwind CSS v4

Este projeto usa **Tailwind CSS v4**, que tem uma configuração diferente das versões anteriores. As variáveis customizadas agora são definidas diretamente no arquivo `src/index.css` usando a diretiva `@theme`.

Para utilizar o auto complete, utilize a extensão Tailwind CSS IntelliSense disponivel no VsCode

## Cores Customizadas

O projeto possui várias cores personalizadas configuradas:

### Cores de Fundo e Estado
- **bg**: `#252628` - Fundo escuro principal
- **bgLight**: `#5B5B5B` - Fundo claro/secundário
- **success**: `#029008` - Verde de sucesso
- **danger**: `#AF0505` - Vermelho de erro/perigo
- **gray**: `#646570` - Cinza neutro

### Cores de Prioridade
- **redLight**: `#DDA9A9` - Vermelho claro
- **lowPrio**: `#46F7B7` - Verde claro (prioridade baixa)
- **lowPrioText**: `#096343` - Verde escuro para texto (prioridade baixa)
- **mediumPrio**: `#F5EB88` - Amarelo (prioridade média)
- **mediumPrioText**: `#653408` - Marrom para texto (prioridade média)
- **highPrio**: `#FFA775` - Laranja (prioridade alta)
- **highPrioText**: `#702D08` - Marrom escuro para texto (prioridade alta)
- **veryHighPrio**: `#F27F77` - Vermelho coral (prioridade muito alta)
- **veryHighPrioText**: `#5F0F0B` - Vermelho escuro para texto (prioridade muito alta)

> **Nota**: Nem todas as cores utilizadas no projeto estão definidas como variáveis. Você pode adicionar mais variáveis no arquivo `src/index.css` dentro do bloco `@theme` se achar necessário para manter a consistência do design.

### Exemplos de uso:

```tsx
// Cores de fundo
<div className="bg-bg">Fundo escuro</div>
<div className="bg-bgLight">Fundo claro</div>

// Cores de estado
<button className="bg-success">Sucesso</button>
<button className="bg-danger">Erro</button>

// Cores de texto
<p className="text-gray">Texto cinza</p>
<p className="text-lowPrioText">Texto de prioridade baixa</p>

// Prioridades com fundo e texto
<div className="bg-lowPrio text-lowPrioText">Baixa prioridade</div>
<div className="bg-mediumPrio text-mediumPrioText">Média prioridade</div>
<div className="bg-highPrio text-highPrioText">Alta prioridade</div>
<div className="bg-veryHighPrio text-veryHighPrioText">Prioridade muito alta</div>

// Bordas
<div className="border-2 border-success">Borda verde</div>
<div className="border-2 border-danger">Borda vermelha</div>

// Hover
<button className="bg-success hover:bg-danger">Botão com hover</button>
```

## Fonte Customizada

A fonte configurada é **Poppins** com fallbacks.

### Exemplos de uso:

```tsx
// Aplicar a fonte Poppins
<p className="font-poppins">Texto com fonte Poppins</p>

// Você pode combiná-la com diferentes pesos
<h1 className="font-poppins font-bold">Título em negrito</h1>
<p className="font-poppins font-light">Texto leve</p>
<span className="font-poppins font-medium">Texto médio</span>
<h2 className="font-poppins font-semibold">Subtítulo semi-negrito</h2>
```
