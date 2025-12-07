# GDoc-Scribe

A lightweight, flexible library for parsing and rendering Google Docs JSON content in web applications. Supports both React and Vanilla JavaScript.

[Demo](https://alfianyusufabdullah.github.io/gdoc-scribe/) | [Repository](https://github.com/alfianyusufabdullah/gdoc-scribe)

## Features

- 🚀 **Dual Support**: Works seamlessly with React and Vanilla JS.
- 📄 **Rich Text Support**: Handles bold, italic, links, and other text styling.
- 🖼️ **Images**: Renders embedded images with a built-in lightbox (Vanilla) or custom renderer (React).
- 📋 **Lists**: Supports nested bulleted and numbered lists.
- 📊 **Tables**: Renders tables with row/column spans.
- 📑 **Table of Contents**: Automatically extracts headings for TOC generation.
- 🧩 **Plugin System**: Fully customizable renderers for any block type.
- 🔄 **Middleware Pipeline**: Transform content before rendering (e.g., sanitize data, modify text).
- 🎨 **Styling API**: Inject custom CSS classes (e.g., Tailwind CSS) into any element.
- 🛡️ **Error Boundaries**: Robust error handling prevents crashes if a single block fails.

## Installation

```bash
npm install gdoc-scribe
# or
yarn add gdoc-scribe
```

## Usage

### React

Use the `useDocs` hook or `GDocViewer` component to parse and render content.

#### 1. Basic Usage

```tsx
import React from 'react';
import { useDocs } from 'gdoc-scribe';

const MyDocComponent = ({ googleDocJson }) => {
  const { html, toc } = useDocs(googleDocJson);

  return (
    <div>
      {/* Table of Contents */}
      <nav>
        <h3>Table of Contents</h3>
        <ul>
          {toc.map((item) => (
            <li key={item.id} style={{ marginLeft: item.level * 10 }}>
              <a href={`#${item.id}`}>{item.text}</a>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Document Content */}
      <article>
        {html}
      </article>
    </div>
  );
};
```

#### 2. Styling API (Tailwind CSS Example)

You can inject custom CSS classes into any element using the `classNames` prop. This is perfect for integrating with utility-first frameworks like Tailwind CSS.

```tsx
import { useDocs } from 'gdoc-scribe';

const MyStyledDoc = ({ doc }) => {
  const { html } = useDocs(doc, {
    classNames: {
      paragraph: 'mb-4 text-gray-800 leading-relaxed',
      h1: 'text-4xl font-bold mb-6 text-blue-600',
      h2: 'text-2xl font-semibold mb-4 text-gray-700',
      code_block: 'bg-gray-900 text-white p-4 rounded-lg my-4 overflow-x-auto',
      list_group: 'list-disc pl-6 mb-4 space-y-2',
      table: 'min-w-full border-collapse border border-gray-300 my-6',
      table_cell: 'border border-gray-300 p-3',
      image: 'rounded-lg shadow-md max-w-full h-auto my-4'
    }
  });

  return <div className="max-w-4xl mx-auto p-8">{html}</div>;
};
```

#### 3. Custom Renderers (Plugin System)

Override specific block renderers to add custom functionality.

**Example: Code Block with Copy Button**

```tsx
import { useState } from 'react';
import { GDocViewer } from 'gdoc-scribe';

const CustomCodeBlock = ({ block, classNames }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(block.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group ${classNames?.code_block}`}>
      <button 
        onClick={handleCopy}
        className="absolute top-2 right-2 bg-gray-700 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre>
        <code className={`language-${block.language}`}>
          {block.content}
        </code>
      </pre>
    </div>
  );
};

const App = ({ doc }) => (
  <GDocViewer 
    doc={doc} 
    renderers={{
      code_block: CustomCodeBlock
    }} 
  />
);
```

#### 4. Transformers (Middleware)

Modify content before it renders. Useful for redaction, sanitization, or injecting content.

**Example: Redact Sensitive Data**

```tsx
import { useDocs } from 'gdoc-scribe';

const redactConfidential = (blocks) => {
  return blocks.map(block => {
    // Check if it's a paragraph
    if (block.paragraph && block.paragraph.elements) {
      const newElements = block.paragraph.elements.map(el => {
        if (el.textRun && el.textRun.content) {
          // Replace "CONFIDENTIAL" with "[REDACTED]"
          return {
            ...el,
            textRun: {
              ...el.textRun,
              content: el.textRun.content.replace(/CONFIDENTIAL/g, '[REDACTED]')
            }
          };
        }
        return el;
      });
      
      return {
        ...block,
        paragraph: { ...block.paragraph, elements: newElements }
      };
    }
    return block;
  });
};

const SecureDoc = ({ doc }) => {
  const { html } = useDocs(doc, {
    transformers: [redactConfidential]
  });

  return <div>{html}</div>;
};
```

### Vanilla JavaScript
```html
<!-- Include the UMD build -->
<!-- For React Usage -->
<script src="https://unpkg.com/gdoc-scribe/dist/gdoc-scribe.umd.js"></script>

<!-- For Vanilla Usage (Lightweight, No React Dependency) -->
<script src="https://unpkg.com/gdoc-scribe/dist/gdoc-scribe.vanilla.umd.js"></script>

<div id="app"></div>

<script>
  const docData = { ... }; // Your Google Doc JSON
  const container = document.getElementById('app');

  // The library is exposed as a global variable 'GDocScribeLib'
  // Access the class via GDocScribeLib.GDocScribe
  const scribe = new window.GDocScribeLib.GDocScribe(docData);
  scribe.render(container);
</script>
```

#### 2. Styling API

Pass a `classNames` object in the options to apply CSS classes.

```javascript
const scribe = new GDocScribe(docData, {
    classNames: {
        paragraph: 'mb-4 text-lg',
        h1: 'text-3xl font-bold',
        code_block: 'bg-gray-100 p-4 rounded',
        image: 'img-fluid rounded'
    }
});

scribe.render(document.getElementById('app'));
```

#### Custom Renderers (Plugin System)

You can override the default rendering for specific elements. This is useful for using your own components (e.g., `Next.js Image`, `SyntaxHighlighter`, or custom UI components).

**Supported Renderers:**
- `paragraph`: Wrapper for text blocks (headings, p).
- `list_group`: Wrapper for lists (ul, ol).
- `code_block`: Code blocks.
- `table`: Tables.
- `image`: Images.

#### React Example

```tsx
import { useDocs } from 'gdoc-scribe';
import Image from 'next/image';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const MyDoc = ({ doc }) => {
  const { html } = useDocs(doc, {
    renderers: {
      // Simplified Image API: directly get src, alt, title
      image: ({ src, alt, title, className }) => (
        <Image 
          src={src} 
          alt={alt} 
          title={title}
          width={500} 
          height={300} 
          className={className} 
        />
      ),
      // Simplified Code Block API: directly get content and language
      code_block: ({ content, language, className }) => (
        <div className={className}>
          <SyntaxHighlighter language={language}>
            {content}
          </SyntaxHighlighter>
        </div>
      ),
      // Simplified Paragraph API: get pre-rendered children
      paragraph: ({ children, style, text, className }) => {
        // Example: Wrap all headings in a special div
        if (style?.namedStyleType?.startsWith('HEADING')) {
           return <div className="heading-wrapper">{children}</div>;
        }
        return <p className={className}>{children}</p>;
      }
    }
  });

  return <div className="prose">{html}</div>;
};
```

#### Vanilla JS Example

```javascript
const scribe = new GDocScribe(doc, {
  renderers: {
    // Return an HTMLElement
    image: ({ src, alt, title, className }) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.className = className;
      img.loading = 'lazy'; // Add lazy loading
      return img;
    },
    // children is a DocumentFragment containing the rendered content
    paragraph: ({ children, style, className }) => {
       const p = document.createElement('p');
       p.className = className;
       p.appendChild(children);
       return p;
    }
  }
});
```

## API Reference

### `UseDocsOptions` / `ScribeOptions`

| Property | Type | Description |
|Data | --- | --- |
| `renderers` | `RendererRegistry` | Object mapping block types to custom components/functions. |
| `transformers` | `Transformer[]` | Array of functions to transform content blocks before rendering. |
| `classNames` | `ClassNames` | Object mapping element types to CSS class strings. |

### `ClassNames` Interface

| Key | Description |
| --- | --- |
| `paragraph` | Applied to `<p>` tags. |
| `h1` - `h6` | Applied to heading tags. |
| `list_group` | Applied to `<ul>` or `<ol>` tags. |
| `list_item` | Applied to `<li>` tags. |
| `code_block` | Applied to `<pre>` tags wrapping code. |
| `table` | Applied to `<table>` tags. |
| `table_row` | Applied to `<tr>` tags. |
| `table_cell` | Applied to `<td>` tags. |
| `image` | Applied to `<img>` tags. |

## Error Handling

The library includes robust error handling to prevent entire document crashes.

- **React**: Uses `BlockErrorBoundary` to wrap each block. If a block fails, it renders a fallback UI (or nothing) while the rest of the document continues to show.
- **Vanilla**: Uses `try-catch` inside the render loop. Failed blocks log an error to the console and display a visual error indicator in the DOM.

## Development

### Prerequisites

- Node.js (v20+)
- npm

### Setup

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/alfianyusufabdullah/gdoc-scribe.git
    cd gdoc-scribe
    npm install
    ```

2.  **Run Tests**:
    ```bash
    npm test
    ```

3.  **Build**:
    ```bash
    npm run build
    ```

## License

ISC
