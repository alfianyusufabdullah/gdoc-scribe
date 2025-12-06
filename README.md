# GDoc-Scribe

A lightweight, flexible library for parsing and rendering Google Docs JSON content in web applications. Supports both React and Vanilla JavaScript.

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

Use the `GDocScribe` class to render content into a DOM element.

```javascript
import { GDocScribe } from 'gdoc-scribe';

const docData = { ... }; // Your Google Doc JSON
const container = document.getElementById('app');

const scribe = new GDocScribe(docData);
scribe.render(container);
```

## Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Build**:
   ```bash
   npm run build
   ```

## License

ISC
