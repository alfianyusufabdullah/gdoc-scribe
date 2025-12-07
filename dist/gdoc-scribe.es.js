var U = Object.defineProperty;
var z = (i, r, n) => r in i ? U(i, r, { enumerable: !0, configurable: !0, writable: !0, value: n }) : i[r] = n;
var T = (i, r, n) => z(i, typeof r != "symbol" ? r + "" : r, n);
import h, { useMemo as v } from "react";
const R = (i) => i.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""), I = (i) => i.map((r) => {
  var n;
  return ((n = r.textRun) == null ? void 0 : n.content) || "";
}).join("").replace(/\u000b/g, "").trim(), _ = (i, r = []) => {
  const n = [];
  let t = null, e = null;
  if (!i) return [];
  for (let o = 0; o < i.length; o++) {
    const a = i[o], c = a.paragraph ? I(a.paragraph.elements || []) : "";
    if (!e && c.trim().startsWith("```")) {
      const p = c.trim(), l = p.match(/^```(\w*)\s*([\s\S]*?)\s*```$/);
      if (l && p.length > 3) {
        n.push({
          type: "code_block",
          language: l[1] || "",
          content: l[2]
        });
        continue;
      }
      e = {
        type: "code_block",
        language: c.trim().replace(/^```/, "").trim(),
        content: []
      };
      continue;
    }
    if (e && c.trim() === "```") {
      n.push({
        type: "code_block",
        language: e.language,
        content: e.content.join(`
`)
      }), e = null;
      continue;
    }
    if (e) {
      e.content.push(c);
      continue;
    }
    if (a.paragraph && a.paragraph.bullet) {
      const p = a.paragraph.bullet.listId;
      !t || t.listId !== p ? (t = {
        type: "list_group",
        listId: p || "",
        items: [a]
      }, n.push(t)) : t.items.push(a);
    } else
      t = null, n.push(a);
  }
  return e && n.push({
    type: "code_block",
    language: e.language,
    content: e.content.join(`
`)
  }), r.reduce((o, a) => a(o), n);
}, k = (i) => {
  const r = [], n = [];
  return i.forEach((t) => {
    var a, c;
    const e = ((c = (a = t.paragraph) == null ? void 0 : a.bullet) == null ? void 0 : c.nestingLevel) || 0, o = { item: t, children: [], level: e };
    for (; n.length > 0 && n[n.length - 1].level >= e; )
      n.pop();
    n.length === 0 ? r.push(o) : n[n.length - 1].children.push(o), n.push(o);
  }), r;
}, w = (i) => {
  const r = [];
  return i.forEach((n) => {
    var t, e;
    if (n.paragraph && ((e = (t = n.paragraph.paragraphStyle) == null ? void 0 : t.namedStyleType) != null && e.startsWith("HEADING"))) {
      const o = n.paragraph.paragraphStyle.namedStyleType, a = parseInt(o.split("_")[1]), c = I(n.paragraph.elements || []);
      c && !isNaN(a) && r.push({
        id: R(c),
        text: c,
        level: a
      });
    }
  }), r;
}, D = (i) => i.split(/(`[^`]+`)/g).map((n) => n.startsWith("`") && n.endsWith("`") && n.length > 2 ? { type: "code", content: n.slice(1, -1) } : { type: "text", content: n }).filter((n) => n.content !== ""), A = (i) => {
  var n;
  if (!i) return [];
  const r = [];
  return i.bold && r.push({ tag: "strong" }), i.italic && r.push({ tag: "em" }), i.underline && r.push({ tag: "u" }), i.strikethrough && r.push({ tag: "s" }), (n = i.link) != null && n.url && r.push({
    tag: "a",
    attrs: {
      href: i.link.url,
      target: "_blank",
      rel: "noopener noreferrer"
    }
  }), r;
}, j = (i) => {
  const r = i == null ? void 0 : i.namedStyleType;
  if (r === "TITLE") return "h1";
  if (r === "SUBTITLE") return "p";
  if (r != null && r.startsWith("HEADING_")) {
    const n = r.split("_")[1];
    if (["1", "2", "3", "4", "5", "6"].includes(n))
      return `h${n}`;
  }
  return "p";
}, O = (i, r, n) => {
  var l, s;
  if (!i || !n) return { tag: "ul", styleType: "disc" };
  const t = n[i];
  if (!t) return { tag: "ul", styleType: "disc" };
  const e = r || 0, o = (s = (l = t.listProperties) == null ? void 0 : l.nestingLevels) == null ? void 0 : s[e];
  let a = o == null ? void 0 : o.glyphType;
  if (!a || a === "GLYPH_TYPE_UNSPECIFIED")
    if (o != null && o.glyphSymbol) {
      const d = o.glyphSymbol;
      d === "●" ? a = "DISC" : d === "○" ? a = "CIRCLE" : d === "■" ? a = "SQUARE" : a = "DISC";
    } else o != null && o.glyphFormat && o.glyphFormat.includes("%") ? a = "DECIMAL" : a = "DISC";
  const p = {
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
  }[a] || { tag: "ul", style: "disc" };
  return {
    tag: p.tag,
    styleType: p.style
  };
}, B = (i) => {
  switch (i) {
    case "CENTER":
      return "center";
    case "END":
      return "right";
    case "JUSTIFIED":
      return "justify";
    default:
      return;
  }
}, F = (i, r) => {
  var t, e, o;
  if (!i || !r) return null;
  const n = (e = (t = r[i]) == null ? void 0 : t.inlineObjectProperties) == null ? void 0 : e.embeddedObject;
  return (o = n == null ? void 0 : n.imageProperties) != null && o.contentUri ? {
    src: n.imageProperties.contentUri,
    alt: "Embedded Image"
    // Google Docs API doesn't always provide alt text easily in this structure, defaulting for now
  } : null;
}, y = (i) => i != null && i.magnitude && (i != null && i.unit) ? `${i.magnitude}${i.unit.toLowerCase()}` : null, M = (i) => {
  if (i != null && i.rgbColor) {
    const { red: r, green: n, blue: t } = i.rgbColor, e = Math.round((r || 0) * 255), o = Math.round((n || 0) * 255), a = Math.round((t || 0) * 255);
    return `rgb(${e}, ${o}, ${a})`;
  }
  return null;
};
class X {
  constructor(r, n = {}) {
    T(this, "doc");
    T(this, "inlineObjects");
    T(this, "options");
    this.doc = r, this.inlineObjects = r.inlineObjects || null, this.options = n;
  }
  getToc() {
    var r;
    return (r = this.doc.body) != null && r.content ? w(this.doc.body.content) : [];
  }
  render(r) {
    var t;
    if (r.innerHTML = "", !((t = this.doc.body) != null && t.content)) return;
    _(this.doc.body.content, this.options.transformers).forEach((e) => {
      var o, a, c, p;
      try {
        if ("type" in e && e.type === "list_group") {
          const l = ((o = this.options.renderers) == null ? void 0 : o.list_group) || this.renderListGroup.bind(this);
          r.appendChild(l(e.items, this.inlineObjects, this.doc.lists));
        } else if ("type" in e && e.type === "code_block") {
          const l = ((a = this.options.renderers) == null ? void 0 : a.code_block) || this.renderCodeBlock.bind(this);
          r.appendChild(l(e));
        } else {
          const l = e;
          if (l.paragraph) {
            const s = ((c = this.options.renderers) == null ? void 0 : c.paragraph) || this.renderParagraph.bind(this);
            r.appendChild(s(l.paragraph, this.inlineObjects));
          } else if (l.table) {
            const s = ((p = this.options.renderers) == null ? void 0 : p.table) || this.renderTable.bind(this);
            r.appendChild(s(l.table, this.inlineObjects, this.doc.lists));
          }
        }
      } catch (l) {
        console.error("Error rendering block:", l);
        const s = document.createElement("div");
        s.style.color = "red", s.style.border = "1px dashed red", s.style.padding = "8px", s.textContent = "Error rendering block", r.appendChild(s);
      }
    });
  }
  renderCodeBlock(r) {
    var e;
    const n = document.createElement("pre");
    (e = this.options.classNames) != null && e.code_block && (n.className = this.options.classNames.code_block);
    const t = document.createElement("code");
    return r.language && (t.className = `language-${r.language}`), t.textContent = r.content, n.appendChild(t), n;
  }
  renderParagraph(r, n) {
    var c, p;
    const t = r.paragraphStyle, e = j(t), o = document.createElement(e);
    this.options.classNames && (this.options.classNames.paragraph && o.classList.add(this.options.classNames.paragraph), e === "h1" && this.options.classNames.h1 && o.classList.add(this.options.classNames.h1), e === "h2" && this.options.classNames.h2 && o.classList.add(this.options.classNames.h2), e === "h3" && this.options.classNames.h3 && o.classList.add(this.options.classNames.h3), e === "h4" && this.options.classNames.h4 && o.classList.add(this.options.classNames.h4), e === "h5" && this.options.classNames.h5 && o.classList.add(this.options.classNames.h5), e === "h6" && this.options.classNames.h6 && o.classList.add(this.options.classNames.h6));
    const a = B((t == null ? void 0 : t.alignment) || void 0);
    if (a && (o.style.textAlign = a), t != null && t.indentStart) {
      const l = y(t.indentStart);
      l && (o.style.paddingLeft = l);
    }
    if (t != null && t.indentEnd) {
      const l = y(t.indentEnd);
      l && (o.style.paddingRight = l);
    }
    if (t != null && t.indentFirstLine) {
      const l = y(t.indentFirstLine);
      l && (o.style.textIndent = l);
    }
    if (t != null && t.spaceAbove) {
      const l = y(t.spaceAbove);
      l && (o.style.marginTop = l);
    }
    if (t != null && t.spaceBelow) {
      const l = y(t.spaceBelow);
      l && (o.style.marginBottom = l);
    }
    if ((p = (c = t == null ? void 0 : t.shading) == null ? void 0 : c.backgroundColor) != null && p.color) {
      const l = M(t.shading.backgroundColor.color);
      l && (o.style.backgroundColor = l, o.style.padding = "10px", o.style.borderRadius = "4px");
    }
    if (e.startsWith("h")) {
      const l = I(r.elements || []);
      l && (o.id = R(l));
    }
    return r.elements && r.elements.forEach((l) => {
      var s;
      if (l.textRun) {
        const d = this.renderTextRun(l.textRun);
        o.appendChild(d);
      } else if (l.inlineObjectElement) {
        const g = (((s = this.options.renderers) == null ? void 0 : s.image) || this.renderImage.bind(this))(l.inlineObjectElement.inlineObjectId, n);
        g && o.appendChild(g);
      }
    }), o;
  }
  renderTextRun(r) {
    let n = r.content || "";
    if (!n) return document.createTextNode("");
    n = n.replace(/\u000b/g, "");
    const t = A(r.textStyle), e = (c) => {
      if (t.length === 0)
        return document.createTextNode(c);
      let p = null, l = null;
      for (const s of t) {
        const d = document.createElement(s.tag);
        s.attrs && Object.entries(s.attrs).forEach(([g, f]) => d.setAttribute(g, f)), p ? (l.appendChild(d), l = d) : (p = d, l = d);
      }
      return l && (l.textContent = c), p;
    }, o = D(n);
    if (o.length === 1 && o[0].type === "text")
      return e(o[0].content);
    const a = document.createDocumentFragment();
    return o.forEach((c) => {
      if (c.type === "code") {
        const p = document.createElement("code");
        if (p.textContent = c.content, t.length === 0)
          a.appendChild(p);
        else {
          let l = null, s = null;
          for (const d of t) {
            const g = document.createElement(d.tag);
            d.attrs && Object.entries(d.attrs).forEach(([f, u]) => g.setAttribute(f, u)), l ? (s.appendChild(g), s = g) : (l = g, s = g);
          }
          s ? (s.appendChild(p), a.appendChild(l)) : a.appendChild(p);
        }
      } else
        a.appendChild(e(c.content));
    }), a;
  }
  renderListGroup(r, n, t) {
    const e = k(r);
    return this.renderListTree(e, n, t);
  }
  renderListTree(r, n, t) {
    var s, d, g;
    if (r.length === 0) return document.createElement("ul");
    const e = r[0], o = (d = (s = e.item.paragraph) == null ? void 0 : s.bullet) == null ? void 0 : d.listId, a = e.level, { tag: c, styleType: p } = O(o, a, t || this.doc.lists), l = document.createElement(c);
    return l.style.listStyleType = p, (g = this.options.classNames) != null && g.list_group && (l.className = this.options.classNames.list_group), r.forEach((f) => {
      var E, m;
      const u = document.createElement("li");
      (E = this.options.classNames) != null && E.list_item && (u.className = this.options.classNames.list_item), (m = f.item.paragraph) != null && m.elements && f.item.paragraph.elements.forEach((C) => {
        C.textRun && u.appendChild(this.renderTextRun(C.textRun));
      }), f.children.length > 0 && u.appendChild(this.renderListTree(f.children, n, t)), l.appendChild(u);
    }), l;
  }
  renderTable(r, n, t) {
    var a;
    const e = document.createElement("table");
    (a = this.options.classNames) != null && a.table && (e.className = this.options.classNames.table);
    const o = document.createElement("tbody");
    return e.appendChild(o), (r.tableRows || []).forEach((c) => {
      var l;
      const p = document.createElement("tr");
      (l = this.options.classNames) != null && l.table_row && (p.className = this.options.classNames.table_row), (c.tableCells || []).forEach((s) => {
        var g, f, u;
        const d = document.createElement("td");
        (g = this.options.classNames) != null && g.table_cell && (d.className = this.options.classNames.table_cell), (f = s.tableCellStyle) != null && f.columnSpan && (d.colSpan = s.tableCellStyle.columnSpan), (u = s.tableCellStyle) != null && u.rowSpan && (d.rowSpan = s.tableCellStyle.rowSpan), s.content && _(s.content, this.options.transformers).forEach((m) => {
          var C, S, x;
          if ("type" in m && m.type === "list_group") {
            const b = ((C = this.options.renderers) == null ? void 0 : C.list_group) || this.renderListGroup.bind(this);
            d.appendChild(b(m.items, n, t));
          } else if ("type" in m && m.type === "code_block") {
            const b = ((S = this.options.renderers) == null ? void 0 : S.code_block) || this.renderCodeBlock.bind(this);
            d.appendChild(b(m));
          } else {
            const b = m;
            if (b.paragraph) {
              const L = ((x = this.options.renderers) == null ? void 0 : x.paragraph) || this.renderParagraph.bind(this);
              d.appendChild(L(b.paragraph, n));
            }
          }
        }), p.appendChild(d);
      }), o.appendChild(p);
    }), e;
  }
  renderImage(r, n) {
    var o;
    const t = F(r, n);
    if (!t) return null;
    const e = document.createElement("img");
    return e.src = t.src, e.alt = t.alt, (o = this.options.classNames) != null && o.image && (e.className = this.options.classNames.image), e.style.cursor = "pointer", e.onclick = () => this.openLightbox(e.src), e;
  }
  openLightbox(r) {
    const n = document.createElement("div");
    n.style.position = "fixed", n.style.top = "0", n.style.left = "0", n.style.width = "100%", n.style.height = "100%", n.style.backgroundColor = "rgba(0,0,0,0.8)", n.style.display = "flex", n.style.alignItems = "center", n.style.justifyContent = "center", n.style.zIndex = "9999", n.style.cursor = "pointer";
    const t = document.createElement("img");
    t.src = r, t.style.maxWidth = "90%", t.style.maxHeight = "90%", t.style.objectFit = "contain", n.appendChild(t), n.onclick = () => document.body.removeChild(n), document.body.appendChild(n);
  }
}
class Q extends h.Component {
  constructor(r) {
    super(r), this.state = { hasError: !1 };
  }
  static getDerivedStateFromError(r) {
    return { hasError: !0 };
  }
  componentDidCatch(r, n) {
    console.error("GDocScribe Block Error:", r, n);
  }
  render() {
    return this.state.hasError ? this.props.fallback || /* @__PURE__ */ h.createElement("div", { style: { color: "red", padding: "8px", border: "1px dashed red" } }, "Error rendering block") : this.props.children;
  }
}
function Y({ block: i, classNames: r }) {
  return /* @__PURE__ */ h.createElement("pre", { className: r == null ? void 0 : r.code_block }, /* @__PURE__ */ h.createElement("code", { className: i.language ? `language-${i.language}` : void 0 }, i.content));
}
function q({ paragraph: i, inlineObjects: r, renderers: n, classNames: t }) {
  var d, g, f;
  const e = i.paragraphStyle, o = j(e), a = B((e == null ? void 0 : e.alignment) || void 0), c = {};
  if (a && (c.textAlign = a), e != null && e.indentStart) {
    const u = y(e.indentStart);
    u && (c.paddingLeft = u);
  }
  if (e != null && e.indentEnd) {
    const u = y(e.indentEnd);
    u && (c.paddingRight = u);
  }
  if (e != null && e.indentFirstLine) {
    const u = y(e.indentFirstLine);
    u && (c.textIndent = u);
  }
  if (e != null && e.spaceAbove) {
    const u = y(e.spaceAbove);
    u && (c.marginTop = u);
  }
  if (e != null && e.spaceBelow) {
    const u = y(e.spaceBelow);
    u && (c.marginBottom = u);
  }
  if ((g = (d = e == null ? void 0 : e.shading) == null ? void 0 : d.backgroundColor) != null && g.color) {
    const u = M(e.shading.backgroundColor.color);
    u && (c.backgroundColor = u, c.padding = "10px", c.borderRadius = "4px");
  }
  let p;
  if (o.startsWith("h")) {
    const u = I(i.elements || []);
    u && (p = R(u));
  }
  const l = (n == null ? void 0 : n.image) || G;
  let s = t == null ? void 0 : t.paragraph;
  return o === "h1" && (s = (t == null ? void 0 : t.h1) || s), o === "h2" && (s = (t == null ? void 0 : t.h2) || s), o === "h3" && (s = (t == null ? void 0 : t.h3) || s), o === "h4" && (s = (t == null ? void 0 : t.h4) || s), o === "h5" && (s = (t == null ? void 0 : t.h5) || s), o === "h6" && (s = (t == null ? void 0 : t.h6) || s), /* @__PURE__ */ h.createElement(o, { id: p, style: c, className: s }, (f = i.elements) == null ? void 0 : f.map((u, E) => /* @__PURE__ */ h.createElement(h.Fragment, { key: E }, u.textRun && /* @__PURE__ */ h.createElement(P, { textRun: u.textRun }), u.inlineObjectElement && /* @__PURE__ */ h.createElement(l, { objectId: u.inlineObjectElement.inlineObjectId, inlineObjects: r, classNames: t }))));
}
function P({ textRun: i }) {
  if (!i.content) return null;
  const r = i.content.replace(/\u000b/g, ""), n = A(i.textStyle), t = (o) => n.length === 0 ? /* @__PURE__ */ h.createElement(h.Fragment, null, o) : n.reduceRight((a, c) => {
    const p = c.tag;
    return /* @__PURE__ */ h.createElement(p, { ...c.attrs }, a);
  }, /* @__PURE__ */ h.createElement(h.Fragment, null, o)), e = D(r);
  return /* @__PURE__ */ h.createElement(h.Fragment, null, e.map((o, a) => o.type === "code" ? n.length === 0 ? /* @__PURE__ */ h.createElement("code", { key: a }, o.content) : n.reduceRight((c, p) => {
    const l = p.tag;
    return /* @__PURE__ */ h.createElement(l, { key: a, ...p.attrs }, c);
  }, /* @__PURE__ */ h.createElement("code", null, o.content)) : /* @__PURE__ */ h.createElement(h.Fragment, { key: a }, t(o.content))));
}
function J({ items: i, inlineObjects: r, lists: n, renderers: t, classNames: e }) {
  const o = k(i), a = (c) => {
    var u, E;
    if (c.length === 0) return null;
    const p = c[0], l = (E = (u = p.item.paragraph) == null ? void 0 : u.bullet) == null ? void 0 : E.listId, s = p.level, { tag: d, styleType: g } = O(l, s, n), f = d;
    return /* @__PURE__ */ h.createElement(f, { style: { listStyleType: g }, className: e == null ? void 0 : e.list_group }, c.map((m, C) => {
      var S, x;
      return /* @__PURE__ */ h.createElement("li", { key: C, className: e == null ? void 0 : e.list_item }, (x = (S = m.item.paragraph) == null ? void 0 : S.elements) == null ? void 0 : x.map((b, L) => {
        const H = (t == null ? void 0 : t.image) || G;
        return /* @__PURE__ */ h.createElement(h.Fragment, { key: L }, b.textRun && /* @__PURE__ */ h.createElement(P, { textRun: b.textRun }), b.inlineObjectElement && /* @__PURE__ */ h.createElement(H, { objectId: b.inlineObjectElement.inlineObjectId, inlineObjects: r, classNames: e }));
      }), m.children.length > 0 && a(m.children));
    }));
  };
  return a(o);
}
function V({
  table: i,
  inlineObjects: r,
  lists: n,
  renderContent: t,
  classNames: e
}) {
  var o;
  return /* @__PURE__ */ h.createElement("table", { className: e == null ? void 0 : e.table }, /* @__PURE__ */ h.createElement("tbody", null, (o = i.tableRows) == null ? void 0 : o.map((a, c) => {
    var p;
    return /* @__PURE__ */ h.createElement("tr", { key: c, className: e == null ? void 0 : e.table_row }, (p = a.tableCells) == null ? void 0 : p.map((l, s) => {
      var d, g, f;
      return (d = l.tableCellStyle) != null && d.columnSpan && l.tableCellStyle.columnSpan, /* @__PURE__ */ h.createElement(
        "td",
        {
          key: s,
          colSpan: ((g = l.tableCellStyle) == null ? void 0 : g.columnSpan) || void 0,
          rowSpan: ((f = l.tableCellStyle) == null ? void 0 : f.rowSpan) || void 0,
          className: e == null ? void 0 : e.table_cell
        },
        l.content && t(l.content, r, n)
      );
    }));
  })));
}
function G({ objectId: i, inlineObjects: r, classNames: n }) {
  const t = F(i, r);
  return t ? /* @__PURE__ */ h.createElement(
    "img",
    {
      src: t.src,
      alt: t.alt,
      className: n == null ? void 0 : n.image,
      style: {
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: "1rem 0"
      }
    }
  ) : null;
}
const $ = (i, r = {}) => {
  const n = v(() => {
    var e;
    return (e = i == null ? void 0 : i.body) != null && e.content ? w(i.body.content) : [];
  }, [i]);
  return { html: v(() => {
    var e;
    return (e = i == null ? void 0 : i.body) != null && e.content ? W(i.body.content, i.inlineObjects, i.lists, r) : null;
  }, [i, r]), toc: n };
};
function W(i, r, n, t = {}) {
  const { renderers: e = {}, transformers: o = [], classNames: a = {} } = t, c = _(i, o), p = (l, s, d) => W(l, s, d, t);
  return c.map((l, s) => {
    let d = null, g = {};
    return "type" in l ? l.type === "list_group" ? (d = e.list_group || J, g = { items: l.items, inlineObjects: r, lists: n, renderers: e, classNames: a }) : l.type === "code_block" && (d = e.code_block || Y, g = { block: l, classNames: a }) : l.paragraph ? (d = e.paragraph || q, g = { paragraph: l.paragraph, inlineObjects: r, renderers: e, classNames: a }) : l.table && (d = e.table || V, g = { table: l.table, inlineObjects: r, lists: n, renderContent: p, classNames: a }), d ? /* @__PURE__ */ h.createElement(Q, { key: s }, /* @__PURE__ */ h.createElement(d, { ...g })) : null;
  });
}
const N = ({ doc: i, className: r, renderers: n, transformers: t }) => {
  const { html: e, toc: o } = $(i, { renderers: n, transformers: t });
  return i ? /* @__PURE__ */ h.createElement("div", { className: r }, /* @__PURE__ */ h.createElement("div", { className: "gdoc-content" }, e), o.length > 0 && /* @__PURE__ */ h.createElement("nav", { className: "gdoc-toc" }, /* @__PURE__ */ h.createElement("ul", null, o.map((a) => /* @__PURE__ */ h.createElement("li", { key: a.id, className: `gdoc-toc-level-${a.level}` }, /* @__PURE__ */ h.createElement("a", { href: `#${a.id}` }, a.text)))))) : null;
}, ee = ({ doc: i, className: r, renderers: n, transformers: t }) => {
  const { html: e } = $(i, { renderers: n, transformers: t });
  return i ? /* @__PURE__ */ h.createElement("div", { className: r }, e) : null;
};
export {
  ee as GDocContent,
  X as GDocScribe,
  N as GDocViewer,
  k as buildListTree,
  w as extractHeadings,
  B as getAlignmentStyle,
  M as getColorStyle,
  y as getDimensionStyle,
  j as getHeadingTag,
  F as getImageData,
  O as getListTagAndStyle,
  I as getParagraphText,
  A as getTextTags,
  D as parseInlineContent,
  _ as processContent,
  R as slugify,
  $ as useDocs
};
