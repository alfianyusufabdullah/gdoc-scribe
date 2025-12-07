var Q = Object.defineProperty;
var Y = (r, t, e) => t in r ? Q(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var R = (r, t, e) => Y(r, typeof t != "symbol" ? t + "" : t, e);
import p, { useMemo as w } from "react";
const v = (r) => r.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""), T = (r) => r.map((t) => {
  var e;
  return ((e = t.textRun) == null ? void 0 : e.content) || "";
}).join("").replace(/\u000b/g, "").trim(), _ = (r, t = []) => {
  const e = [];
  let a = null, n = null;
  if (!r) return [];
  for (let i = 0; i < r.length; i++) {
    const s = r[i], d = s.paragraph ? T(s.paragraph.elements || []) : "";
    if (!n && d.trim().startsWith("```")) {
      const l = d.trim(), o = l.match(/^```(\w*)\s*([\s\S]*?)\s*```$/);
      if (o && l.length > 3) {
        e.push({
          type: "code_block",
          language: o[1] || "",
          content: o[2]
        });
        continue;
      }
      n = {
        type: "code_block",
        language: d.trim().replace(/^```/, "").trim(),
        content: []
      };
      continue;
    }
    if (n && d.trim() === "```") {
      e.push({
        type: "code_block",
        language: n.language,
        content: n.content.join(`
`)
      }), n = null;
      continue;
    }
    if (n) {
      n.content.push(d);
      continue;
    }
    if (s.paragraph && s.paragraph.bullet) {
      const l = s.paragraph.bullet.listId;
      !a || a.listId !== l ? (a = {
        type: "list_group",
        listId: l || "",
        items: [s]
      }, e.push(a)) : a.items.push(s);
    } else
      a = null, e.push(s);
  }
  return n && e.push({
    type: "code_block",
    language: n.language,
    content: n.content.join(`
`)
  }), t.reduce((i, s) => s(i), e);
}, A = (r) => {
  const t = [], e = [];
  return r.forEach((a) => {
    var s, d;
    const n = ((d = (s = a.paragraph) == null ? void 0 : s.bullet) == null ? void 0 : d.nestingLevel) || 0, i = { item: a, children: [], level: n };
    for (; e.length > 0 && e[e.length - 1].level >= n; )
      e.pop();
    e.length === 0 ? t.push(i) : e[e.length - 1].children.push(i), e.push(i);
  }), t;
}, F = (r) => {
  const t = [];
  return r.forEach((e) => {
    var a, n;
    if (e.paragraph && ((n = (a = e.paragraph.paragraphStyle) == null ? void 0 : a.namedStyleType) != null && n.startsWith("HEADING"))) {
      const i = e.paragraph.paragraphStyle.namedStyleType, s = parseInt(i.split("_")[1]), d = T(e.paragraph.elements || []);
      d && !isNaN(s) && t.push({
        id: v(d),
        text: d,
        level: s
      });
    }
  }), t;
}, k = (r) => r.split(/(`[^`]+`)/g).map((e) => e.startsWith("`") && e.endsWith("`") && e.length > 2 ? { type: "code", content: e.slice(1, -1) } : { type: "text", content: e }).filter((e) => e.content !== ""), j = (r) => {
  var e;
  if (!r) return [];
  const t = [];
  return r.bold && t.push({ tag: "strong" }), r.italic && t.push({ tag: "em" }), r.underline && t.push({ tag: "u" }), r.strikethrough && t.push({ tag: "s" }), (e = r.link) != null && e.url && t.push({
    tag: "a",
    attrs: {
      href: r.link.url,
      target: "_blank",
      rel: "noopener noreferrer"
    }
  }), t;
}, B = (r) => {
  const t = r == null ? void 0 : r.namedStyleType;
  if (t === "TITLE") return "h1";
  if (t === "SUBTITLE") return "p";
  if (t != null && t.startsWith("HEADING_")) {
    const e = t.split("_")[1];
    if (["1", "2", "3", "4", "5", "6"].includes(e))
      return `h${e}`;
  }
  return "p";
}, P = (r, t, e) => {
  var o, c;
  if (!r || !e) return { tag: "ul", styleType: "disc" };
  const a = e[r];
  if (!a) return { tag: "ul", styleType: "disc" };
  const n = t || 0, i = (c = (o = a.listProperties) == null ? void 0 : o.nestingLevels) == null ? void 0 : c[n];
  let s = i == null ? void 0 : i.glyphType;
  if (!s || s === "GLYPH_TYPE_UNSPECIFIED")
    if (i != null && i.glyphSymbol) {
      const h = i.glyphSymbol;
      h === "●" ? s = "DISC" : h === "○" ? s = "CIRCLE" : h === "■" ? s = "SQUARE" : s = "DISC";
    } else i != null && i.glyphFormat && i.glyphFormat.includes("%") ? s = "DECIMAL" : s = "DISC";
  const l = {
    DECIMAL: { tag: "ol", style: "decimal" },
    DECIMAL_ZERO: { tag: "ol", style: "decimal-leading-zero" },
    UPPER_ALPHA: { tag: "ol", style: "upper-alpha" },
    ALPHA: { tag: "ol", style: "lower-alpha" },
    UPPER_ROMAN: { tag: "ol", style: "upper-roman" },
    ROMAN: { tag: "ol", style: "lower-roman" },
    DISC: { tag: "ul", style: "disc" },
    CIRCLE: { tag: "ul", style: "circle" },
    SQUARE: { tag: "ul", style: "square" },
    NONE: { tag: "ul", style: "none" }
  }[s] || { tag: "ul", style: "disc" };
  return {
    tag: l.tag,
    styleType: l.style
  };
}, G = (r) => {
  switch (r) {
    case "CENTER":
      return "center";
    case "END":
      return "right";
    case "JUSTIFIED":
      return "justify";
    default:
      return;
  }
}, D = (r, t) => {
  var a, n, i;
  if (!r || !t) return null;
  const e = (n = (a = t[r]) == null ? void 0 : a.inlineObjectProperties) == null ? void 0 : n.embeddedObject;
  return (i = e == null ? void 0 : e.imageProperties) != null && i.contentUri ? {
    src: e.imageProperties.contentUri,
    alt: e.title || "Embedded Image",
    title: e.description || void 0
  } : null;
}, b = (r) => r != null && r.magnitude && (r != null && r.unit) ? `${r.magnitude}${r.unit.toLowerCase()}` : null, O = (r) => {
  if (r != null && r.rgbColor) {
    const { red: t, green: e, blue: a } = r.rgbColor, n = Math.round((t || 0) * 255), i = Math.round((e || 0) * 255), s = Math.round((a || 0) * 255);
    return `rgb(${n}, ${i}, ${s})`;
  }
  return null;
};
class ae {
  constructor(t, e = {}) {
    R(this, "doc");
    R(this, "inlineObjects");
    R(this, "options");
    this.doc = t, this.inlineObjects = t.inlineObjects || null, this.options = e;
  }
  getToc() {
    var t;
    return (t = this.doc.body) != null && t.content ? F(this.doc.body.content) : [];
  }
  render(t) {
    var a;
    if (t.innerHTML = "", !((a = this.doc.body) != null && a.content)) return;
    _(this.doc.body.content, this.options.transformers).forEach((n) => {
      var i, s, d, l, o, c, h, u;
      try {
        if ("type" in n && n.type === "list_group") {
          const g = this.renderListGroupContent(n.items, this.inlineObjects, this.doc.lists), m = ((i = this.options.renderers) == null ? void 0 : i.list_group) || this.defaultRenderListGroup.bind(this);
          t.appendChild(m({
            children: g,
            type: "unordered",
            className: (s = this.options.classNames) == null ? void 0 : s.list_group,
            original: { items: n.items, lists: this.doc.lists }
          }));
        } else if ("type" in n && n.type === "code_block") {
          const g = ((d = this.options.renderers) == null ? void 0 : d.code_block) || this.defaultRenderCodeBlock.bind(this);
          t.appendChild(g({
            content: n.content,
            language: n.language,
            className: (l = this.options.classNames) == null ? void 0 : l.code_block,
            original: { block: n }
          }));
        } else {
          const g = n;
          if (g.paragraph) {
            const m = this.renderParagraphContent(g.paragraph, this.inlineObjects), f = T(g.paragraph.elements || []), C = ((o = this.options.renderers) == null ? void 0 : o.paragraph) || this.defaultRenderParagraph.bind(this);
            t.appendChild(C({
              children: m,
              style: g.paragraph.paragraphStyle,
              text: f,
              className: (c = this.options.classNames) == null ? void 0 : c.paragraph,
              original: { paragraph: g.paragraph }
            }));
          } else if (g.table) {
            const m = this.renderTableContent(g.table, this.inlineObjects, this.doc.lists), f = ((h = this.options.renderers) == null ? void 0 : h.table) || this.defaultRenderTable.bind(this);
            t.appendChild(f({
              children: m,
              className: (u = this.options.classNames) == null ? void 0 : u.table,
              original: { table: g.table }
            }));
          }
        }
      } catch (g) {
        console.error("Error rendering block:", g);
        const m = document.createElement("div");
        m.style.color = "red", m.style.border = "1px dashed red", m.style.padding = "8px", m.textContent = "Error rendering block", t.appendChild(m);
      }
    });
  }
  defaultRenderCodeBlock(t) {
    const e = document.createElement("pre");
    t.className && (e.className = t.className);
    const a = document.createElement("code");
    return t.language && (a.className = `language-${t.language}`), a.textContent = t.content, e.appendChild(a), e;
  }
  renderParagraphContent(t, e) {
    const a = document.createDocumentFragment();
    return t.elements && t.elements.forEach((n) => {
      var i, s;
      if (n.textRun) {
        const d = this.renderTextRun(n.textRun);
        a.appendChild(d);
      } else if (n.inlineObjectElement) {
        const d = n.inlineObjectElement.inlineObjectId, l = D(d, e);
        if (l) {
          const c = (((i = this.options.renderers) == null ? void 0 : i.image) || this.defaultRenderImage.bind(this))({
            src: l.src,
            alt: l.alt,
            title: l.title,
            className: (s = this.options.classNames) == null ? void 0 : s.image,
            original: { objectId: d, inlineObjects: e }
          });
          c && a.appendChild(c);
        }
      }
    }), a;
  }
  defaultRenderParagraph(t) {
    var s, d;
    const e = t.style, a = B(e), n = document.createElement(a);
    t.className && n.classList.add(t.className), this.options.classNames && (a === "h1" && this.options.classNames.h1 && n.classList.add(this.options.classNames.h1), a === "h2" && this.options.classNames.h2 && n.classList.add(this.options.classNames.h2), a === "h3" && this.options.classNames.h3 && n.classList.add(this.options.classNames.h3), a === "h4" && this.options.classNames.h4 && n.classList.add(this.options.classNames.h4), a === "h5" && this.options.classNames.h5 && n.classList.add(this.options.classNames.h5), a === "h6" && this.options.classNames.h6 && n.classList.add(this.options.classNames.h6));
    const i = G((e == null ? void 0 : e.alignment) || void 0);
    if (i && (n.style.textAlign = i), e != null && e.indentStart) {
      const l = b(e.indentStart);
      l && (n.style.paddingLeft = l);
    }
    if (e != null && e.indentEnd) {
      const l = b(e.indentEnd);
      l && (n.style.paddingRight = l);
    }
    if (e != null && e.indentFirstLine) {
      const l = b(e.indentFirstLine);
      l && (n.style.textIndent = l);
    }
    if (e != null && e.spaceAbove) {
      const l = b(e.spaceAbove);
      l && (n.style.marginTop = l);
    }
    if (e != null && e.spaceBelow) {
      const l = b(e.spaceBelow);
      l && (n.style.marginBottom = l);
    }
    if ((d = (s = e == null ? void 0 : e.shading) == null ? void 0 : s.backgroundColor) != null && d.color) {
      const l = O(e.shading.backgroundColor.color);
      l && (n.style.backgroundColor = l, n.style.padding = "10px", n.style.borderRadius = "4px");
    }
    return a.startsWith("h") && t.text && (n.id = v(t.text)), n.appendChild(t.children), n;
  }
  renderTextRun(t) {
    let e = t.content || "";
    if (!e) return document.createTextNode("");
    e = e.replace(/\u000b/g, "");
    const a = j(t.textStyle), n = (d) => {
      if (a.length === 0)
        return document.createTextNode(d);
      let l = null, o = null;
      for (const c of a) {
        const h = document.createElement(c.tag);
        c.attrs && Object.entries(c.attrs).forEach(([u, g]) => h.setAttribute(u, g)), l ? (o.appendChild(h), o = h) : (l = h, o = h);
      }
      return o && (o.textContent = d), l;
    }, i = k(e);
    if (i.length === 1 && i[0].type === "text")
      return n(i[0].content);
    const s = document.createDocumentFragment();
    return i.forEach((d) => {
      if (d.type === "code") {
        const l = document.createElement("code");
        if (l.textContent = d.content, a.length === 0)
          s.appendChild(l);
        else {
          let o = null, c = null;
          for (const h of a) {
            const u = document.createElement(h.tag);
            h.attrs && Object.entries(h.attrs).forEach(([g, m]) => u.setAttribute(g, m)), o ? (c.appendChild(u), c = u) : (o = u, c = u);
          }
          c ? (c.appendChild(l), s.appendChild(o)) : s.appendChild(l);
        }
      } else
        s.appendChild(n(d.content));
    }), s;
  }
  renderListGroupContent(t, e, a) {
    const n = A(t);
    return this.renderListTreeContent(n, e, a);
  }
  renderListTreeContent(t, e, a) {
    var o, c;
    const n = document.createDocumentFragment();
    if (t.length === 0) return n;
    const i = t[0], s = (c = (o = i.item.paragraph) == null ? void 0 : o.bullet) == null ? void 0 : c.listId, d = i.level, { styleType: l } = P(s, d, a || this.doc.lists);
    return t.forEach((h) => {
      var g;
      const u = document.createElement("li");
      if ((g = this.options.classNames) != null && g.list_item && (u.className = this.options.classNames.list_item), u.style.listStyleType = l, h.item.paragraph) {
        const m = this.renderParagraphContent(h.item.paragraph, e);
        u.appendChild(m);
      }
      if (h.children.length > 0) {
        const m = this.renderListTreeContent(h.children, e, a), f = document.createElement("ul");
        f.style.listStyleType = "none", f.style.paddingLeft = "20px", f.appendChild(m), u.appendChild(f);
      }
      n.appendChild(u);
    }), n;
  }
  defaultRenderListGroup(t) {
    const e = t.type === "ordered" ? "ol" : "ul", a = document.createElement(e);
    return t.className && (a.className = t.className), a.appendChild(t.children), a;
  }
  renderTableContent(t, e, a) {
    const n = document.createDocumentFragment(), i = document.createElement("tbody");
    return n.appendChild(i), (t.tableRows || []).forEach((s) => {
      var l;
      const d = document.createElement("tr");
      (l = this.options.classNames) != null && l.table_row && (d.className = this.options.classNames.table_row), (s.tableCells || []).forEach((o) => {
        var h, u, g;
        const c = document.createElement("td");
        (h = this.options.classNames) != null && h.table_cell && (c.className = this.options.classNames.table_cell), (u = o.tableCellStyle) != null && u.columnSpan && (c.colSpan = o.tableCellStyle.columnSpan), (g = o.tableCellStyle) != null && g.rowSpan && (c.rowSpan = o.tableCellStyle.rowSpan), o.content && _(o.content, this.options.transformers).forEach((f) => {
          var C, N, y, x, L, S;
          if ("type" in f && f.type === "list_group") {
            const E = this.renderListGroupContent(f.items, e, a), I = ((C = this.options.renderers) == null ? void 0 : C.list_group) || this.defaultRenderListGroup.bind(this);
            c.appendChild(I({
              children: E,
              type: "unordered",
              className: (N = this.options.classNames) == null ? void 0 : N.list_group,
              original: { items: f.items, lists: a }
            }));
          } else if ("type" in f && f.type === "code_block") {
            const E = ((y = this.options.renderers) == null ? void 0 : y.code_block) || this.defaultRenderCodeBlock.bind(this);
            c.appendChild(E({
              content: f.content,
              language: f.language,
              className: (x = this.options.classNames) == null ? void 0 : x.code_block,
              original: { block: f }
            }));
          } else {
            const E = f;
            if (E.paragraph) {
              const I = this.renderParagraphContent(E.paragraph, e), U = T(E.paragraph.elements || []), z = ((L = this.options.renderers) == null ? void 0 : L.paragraph) || this.defaultRenderParagraph.bind(this);
              c.appendChild(z({
                children: I,
                style: E.paragraph.paragraphStyle,
                text: U,
                className: (S = this.options.classNames) == null ? void 0 : S.paragraph,
                original: { paragraph: E.paragraph }
              }));
            }
          }
        }), d.appendChild(c);
      }), i.appendChild(d);
    }), n;
  }
  defaultRenderTable(t) {
    const e = document.createElement("table");
    return t.className && (e.className = t.className), e.appendChild(t.children), e;
  }
  defaultRenderImage(t) {
    const e = document.createElement("img");
    return e.src = t.src, e.alt = t.alt, t.title && (e.title = t.title), t.className && (e.className = t.className), e.style.cursor = "pointer", e.onclick = () => this.openLightbox(e.src), e;
  }
  openLightbox(t) {
    const e = document.createElement("div");
    e.style.position = "fixed", e.style.top = "0", e.style.left = "0", e.style.width = "100%", e.style.height = "100%", e.style.backgroundColor = "rgba(0,0,0,0.8)", e.style.display = "flex", e.style.alignItems = "center", e.style.justifyContent = "center", e.style.zIndex = "9999", e.style.cursor = "pointer";
    const a = document.createElement("img");
    a.src = t, a.style.maxWidth = "90%", a.style.maxHeight = "90%", a.style.objectFit = "contain", e.appendChild(a), e.onclick = () => document.body.removeChild(e), document.body.appendChild(e);
  }
}
class q extends p.Component {
  constructor(t) {
    super(t), this.state = { hasError: !1 };
  }
  static getDerivedStateFromError(t) {
    return { hasError: !0 };
  }
  componentDidCatch(t, e) {
    console.error("GDocScribe Block Error:", t, e);
  }
  render() {
    return this.state.hasError ? this.props.fallback || /* @__PURE__ */ p.createElement("div", { style: { color: "red", padding: "8px", border: "1px dashed red" } }, "Error rendering block") : this.props.children;
  }
}
function J({ content: r, language: t, className: e }) {
  return /* @__PURE__ */ p.createElement("pre", { className: e }, /* @__PURE__ */ p.createElement("code", { className: t ? `language - ${t} ` : void 0 }, r));
}
function V({ paragraph: r, inlineObjects: t, renderers: e, classNames: a }) {
  var i;
  const n = (e == null ? void 0 : e.image) || $;
  return /* @__PURE__ */ p.createElement(p.Fragment, null, (i = r.elements) == null ? void 0 : i.map((s, d) => /* @__PURE__ */ p.createElement(p.Fragment, { key: d }, s.textRun && /* @__PURE__ */ p.createElement(M, { textRun: s.textRun }), s.inlineObjectElement && (() => {
    const l = s.inlineObjectElement.inlineObjectId, o = D(l, t);
    return o ? /* @__PURE__ */ p.createElement(
      n,
      {
        src: o.src,
        alt: o.alt,
        title: o.title,
        className: a == null ? void 0 : a.image,
        original: { objectId: l, inlineObjects: t }
      }
    ) : null;
  })())));
}
function Z({ children: r, style: t, text: e, className: a }) {
  var l, o;
  const n = B(t), i = {}, s = G((t == null ? void 0 : t.alignment) || void 0);
  if (s && (i.textAlign = s), t != null && t.indentStart) {
    const c = b(t.indentStart);
    c && (i.paddingLeft = c);
  }
  if (t != null && t.indentEnd) {
    const c = b(t.indentEnd);
    c && (i.paddingRight = c);
  }
  if (t != null && t.indentFirstLine) {
    const c = b(t.indentFirstLine);
    c && (i.textIndent = c);
  }
  if (t != null && t.spaceAbove) {
    const c = b(t.spaceAbove);
    c && (i.marginTop = c);
  }
  if (t != null && t.spaceBelow) {
    const c = b(t.spaceBelow);
    c && (i.marginBottom = c);
  }
  if ((o = (l = t == null ? void 0 : t.shading) == null ? void 0 : l.backgroundColor) != null && o.color) {
    const c = O(t.shading.backgroundColor.color);
    c && (i.backgroundColor = c, i.padding = "10px", i.borderRadius = "4px");
  }
  let d;
  return n.startsWith("h") && e && (d = v(e)), /* @__PURE__ */ p.createElement(n, { id: d, style: i, className: a }, r);
}
function M({ textRun: r }) {
  if (!r.content) return null;
  const t = r.content.replace(/\u000b/g, ""), e = j(r.textStyle), a = (i) => e.length === 0 ? /* @__PURE__ */ p.createElement(p.Fragment, null, i) : e.reduceRight((s, d) => {
    const l = d.tag;
    return /* @__PURE__ */ p.createElement(l, { ...d.attrs }, s);
  }, /* @__PURE__ */ p.createElement(p.Fragment, null, i)), n = k(t);
  return /* @__PURE__ */ p.createElement(p.Fragment, null, n.map((i, s) => i.type === "code" ? e.length === 0 ? /* @__PURE__ */ p.createElement("code", { key: s }, i.content) : e.reduceRight((d, l) => {
    const o = l.tag;
    return /* @__PURE__ */ p.createElement(o, { key: s, ...l.attrs }, d);
  }, /* @__PURE__ */ p.createElement("code", null, i.content)) : /* @__PURE__ */ p.createElement(p.Fragment, { key: s }, a(i.content))));
}
function K({ children: r, type: t, className: e }) {
  const a = t === "ordered" ? "ol" : "ul";
  return /* @__PURE__ */ p.createElement(a, { className: e }, r);
}
function X({ items: r, inlineObjects: t, lists: e, renderers: a, classNames: n }) {
  const i = A(r), s = (d) => {
    var u, g;
    if (d.length === 0) return null;
    const l = d[0], o = (g = (u = l.item.paragraph) == null ? void 0 : u.bullet) == null ? void 0 : g.listId, c = l.level, { styleType: h } = P(o, c, e);
    return /* @__PURE__ */ p.createElement(p.Fragment, null, d.map((m, f) => {
      var C, N;
      return /* @__PURE__ */ p.createElement("li", { key: f, className: n == null ? void 0 : n.list_item, style: { listStyleType: h } }, (N = (C = m.item.paragraph) == null ? void 0 : C.elements) == null ? void 0 : N.map((y, x) => {
        const L = (a == null ? void 0 : a.image) || $;
        return /* @__PURE__ */ p.createElement(p.Fragment, { key: x }, y.textRun && /* @__PURE__ */ p.createElement(M, { textRun: y.textRun }), y.inlineObjectElement && (() => {
          const S = y.inlineObjectElement.inlineObjectId, E = D(S, t);
          return E ? /* @__PURE__ */ p.createElement(
            L,
            {
              src: E.src,
              alt: E.alt,
              title: E.title,
              className: n == null ? void 0 : n.image,
              original: { objectId: S, inlineObjects: t }
            }
          ) : null;
        })());
      }), m.children.length > 0 && /* @__PURE__ */ p.createElement("ul", { style: { listStyleType: "none", paddingLeft: "20px" } }, s(m.children)));
    }));
  };
  return s(i);
}
function ee({ children: r, className: t }) {
  return /* @__PURE__ */ p.createElement("table", { className: t }, /* @__PURE__ */ p.createElement("tbody", null, r));
}
function te({
  table: r,
  inlineObjects: t,
  lists: e,
  renderContent: a,
  classNames: n
}) {
  var i;
  return /* @__PURE__ */ p.createElement(p.Fragment, null, (i = r.tableRows) == null ? void 0 : i.map((s, d) => {
    var l;
    return /* @__PURE__ */ p.createElement("tr", { key: d, className: n == null ? void 0 : n.table_row }, (l = s.tableCells) == null ? void 0 : l.map((o, c) => {
      var h, u;
      return /* @__PURE__ */ p.createElement(
        "td",
        {
          key: c,
          colSpan: ((h = o.tableCellStyle) == null ? void 0 : h.columnSpan) || void 0,
          rowSpan: ((u = o.tableCellStyle) == null ? void 0 : u.rowSpan) || void 0,
          className: n == null ? void 0 : n.table_cell
        },
        o.content && a(o.content, t, e)
      );
    }));
  }));
}
function $({ src: r, alt: t, className: e }) {
  return /* @__PURE__ */ p.createElement(
    "img",
    {
      src: r,
      alt: t,
      className: e,
      style: {
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: "1rem 0"
      }
    }
  );
}
const W = (r, t = {}) => {
  const e = w(() => {
    var n;
    return (n = r == null ? void 0 : r.body) != null && n.content ? F(r.body.content) : [];
  }, [r]);
  return { html: w(() => {
    var n;
    return (n = r == null ? void 0 : r.body) != null && n.content ? H(r.body.content, r.inlineObjects, r.lists, t) : null;
  }, [r, t]), toc: e };
};
function H(r, t, e, a = {}) {
  const { renderers: n = {}, transformers: i = [], classNames: s = {} } = a, d = _(r, i), l = (o, c, h) => H(o, c, h, a);
  return d.map((o, c) => {
    let h = null, u = {};
    if ("type" in o)
      o.type === "list_group" ? (h = n.list_group || K, u = {
        children: /* @__PURE__ */ p.createElement(X, { items: o.items, inlineObjects: t, lists: e, renderers: n, classNames: s }),
        type: "unordered",
        // Default, ListGroupContent handles specific styling
        className: s.list_group,
        original: { items: o.items, lists: e }
      }) : o.type === "code_block" && (h = n.code_block || J, u = {
        content: o.content,
        language: o.language,
        className: s.code_block,
        original: { block: o }
      });
    else if (o.paragraph) {
      h = n.paragraph || Z;
      const g = /* @__PURE__ */ p.createElement(V, { paragraph: o.paragraph, inlineObjects: t, renderers: n, classNames: s }), m = T(o.paragraph.elements || []);
      u = {
        children: g,
        style: o.paragraph.paragraphStyle,
        text: m,
        className: s.paragraph,
        // Note: ParagraphRenderer resolves specific h1-h6 classes internally if not provided here, but for custom renderer we pass the base one.
        original: { paragraph: o.paragraph }
      };
    } else o.table && (h = n.table || ee, u = {
      children: /* @__PURE__ */ p.createElement(te, { table: o.table, inlineObjects: t, lists: e, renderContent: l, classNames: s }),
      className: s.table,
      original: { table: o.table }
    });
    return h ? /* @__PURE__ */ p.createElement(q, { key: c }, /* @__PURE__ */ p.createElement(h, { ...u })) : null;
  });
}
const ie = ({ doc: r, className: t, renderers: e, transformers: a }) => {
  const { html: n, toc: i } = W(r, { renderers: e, transformers: a });
  return r ? /* @__PURE__ */ p.createElement("div", { className: t }, /* @__PURE__ */ p.createElement("div", { className: "gdoc-content" }, n), i.length > 0 && /* @__PURE__ */ p.createElement("nav", { className: "gdoc-toc" }, /* @__PURE__ */ p.createElement("ul", null, i.map((s) => /* @__PURE__ */ p.createElement("li", { key: s.id, className: `gdoc-toc-level-${s.level}` }, /* @__PURE__ */ p.createElement("a", { href: `#${s.id}` }, s.text)))))) : null;
}, se = ({ doc: r, className: t, renderers: e, transformers: a }) => {
  const { html: n } = W(r, { renderers: e, transformers: a });
  return r ? /* @__PURE__ */ p.createElement("div", { className: t }, n) : null;
};
export {
  se as GDocContent,
  ae as GDocScribe,
  ie as GDocViewer,
  A as buildListTree,
  F as extractHeadings,
  G as getAlignmentStyle,
  O as getColorStyle,
  b as getDimensionStyle,
  B as getHeadingTag,
  D as getImageData,
  P as getListTagAndStyle,
  T as getParagraphText,
  j as getTextTags,
  k as parseInlineContent,
  _ as processContent,
  v as slugify,
  W as useDocs
};
