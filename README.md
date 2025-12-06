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

## Installation

```bash
npm install gdoc-scribe
# or
yarn add gdoc-scribe
```

## Usage

### React

Use the `useDocs` hook to parse and render content.

```tsx
import React from 'react';
import { useDocs } from 'gdoc-scribe';

const MyDocComponent = ({ googleDocJson }) => {
  const { html, toc } = useDocs(googleDocJson);

  return (
    <div>
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
      
      <article>
        {html}
      </article>
    </div>
  );
};
```

### Vanilla JavaScript

#### ES Module (Bundler)

```javascript
import { GDocScribe } from 'gdoc-scribe';

const docData = { ... }; // Your Google Doc JSON
const container = document.getElementById('app');

const scribe = new GDocScribe(docData);
scribe.render(container);
```

#### Browser (CDN)

You can use the library directly in the browser via a CDN (like unpkg or jsdelivr).

```html
<!-- Include the UMD build -->
<script src="https://unpkg.com/gdoc-scribe/dist/gdoc-scribe.umd.js"></script>

<div id="app"></div>

<script>
  const docData = { ... }; // Your Google Doc JSON
  const container = document.getElementById('app');

  // The library is exposed as a global variable 'GDocScribe'
  // Note: Access the class via GDocScribe.GDocScribe
  const scribe = new window.GDocScribe.GDocScribe(docData);
  scribe.render(container);
</script>
```

## Syntax Highlighting

`gdoc-scribe` renders code blocks as semantic `<pre><code class="language-...">...</code></pre>` elements. It does **not** include a syntax highlighting library by default, giving you the freedom to choose your preferred solution (e.g., [highlight.js](https://highlightjs.org/), [Prism.js](https://prismjs.com/)).

### Example with highlight.js

1.  Include the CSS and JS:
    ```html
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    ```

2.  Initialize after rendering:
    ```javascript
    const scribe = new GDocScribe.GDocScribe(data);
    scribe.render(document.getElementById('app'));
    
    // Apply highlighting
    hljs.highlightAll();
    ```

## Development

### Prerequisites

- Node.js (v20 or higher recommended)
- npm

### Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/alfianyusufabdullah/gdoc-scribe.git
    cd gdoc-scribe
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Project Structure

- `src/core`: Core logic for parsing Google Docs JSON.
- `src/react`: React-specific components and hooks (`useDocs`).
- `src/vanilla`: Vanilla JavaScript implementation (`GDocScribe`).
- `demo/`: Contains demo applications (Vanilla JS and React).

### Testing

Run the test suite using Vitest:

```bash
npm test
```

### Building

Build the library for production (outputs to `dist/`):

```bash
npm run build
```

### Local Testing

You can use the included demos to test changes visually.
1.  Build the project: `npm run build`
2.  Open `demo/index.html` in your browser to choose a demo.


## License

ISC
