var D = Object.defineProperty;
var w = (n, t, e) => t in n ? D(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var d = (n, t, e) => w(n, typeof t != "symbol" ? t + "" : t, e);
import c, { useMemo as S } from "react";
const y = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""), E = (n) => n.map((t) => {
  var e;
  return ((e = t.textRun) == null ? void 0 : e.content) || "";
}).join("").replace(/\u000b/g, "").trim(), f = (n) => {
  const t = [];
  let e = null;
  return n ? (n.forEach((r) => {
    var s, a;
    if (r.paragraph && r.paragraph.bullet) {
      const l = r.paragraph.bullet.listId;
      e ? ((a = (s = e.items[0].paragraph) == null ? void 0 : s.bullet) == null ? void 0 : a.listId) !== l && (e = { type: "list_group", items: [] }, t.push(e)) : (e = { type: "list_group", items: [] }, t.push(e)), e.items.push(r);
    } else
      e = null, t.push(r);
  }), t) : [];
}, x = (n) => {
  const t = [], e = [];
  return n.forEach((r) => {
    var l, i;
    const s = ((i = (l = r.paragraph) == null ? void 0 : l.bullet) == null ? void 0 : i.nestingLevel) || 0, a = { item: r, children: [], level: s };
    for (; e.length > 0 && e[e.length - 1].level >= s; )
      e.pop();
    e.length === 0 ? t.push(a) : e[e.length - 1].children.push(a), e.push(a);
  }), t;
}, P = (n) => {
  const t = [];
  return n.forEach((e) => {
    var r, s;
    if (e.paragraph && ((s = (r = e.paragraph.paragraphStyle) == null ? void 0 : r.namedStyleType) != null && s.startsWith("HEADING"))) {
      const a = e.paragraph.paragraphStyle.namedStyleType, l = parseInt(a.split("_")[1]), i = E(e.paragraph.elements || []);
      i && !isNaN(l) && t.push({
        id: y(i),
        text: i,
        level: l
      });
    }
  }), t;
}, I = (n) => {
  var e;
  if (!n) return [];
  const t = [];
  return n.bold && t.push({ tag: "strong" }), n.italic && t.push({ tag: "em" }), n.underline && t.push({ tag: "u" }), n.strikethrough && t.push({ tag: "s" }), (e = n.link) != null && e.url && t.push({
    tag: "a",
    attrs: {
      href: n.link.url,
      target: "_blank",
      rel: "noopener noreferrer"
    }
  }), t;
}, R = (n) => {
  const t = n == null ? void 0 : n.namedStyleType;
  if (t === "TITLE") return "h1";
  if (t === "SUBTITLE") return "p";
  if (t != null && t.startsWith("HEADING_")) {
    const e = t.split("_")[1];
    if (["1", "2", "3", "4", "5", "6"].includes(e))
      return `h${e}`;
  }
  return "p";
}, L = (n, t, e) => {
  var o, p;
  if (!n || !e) return { tag: "ul", styleType: "disc" };
  const r = e[n];
  if (!r) return { tag: "ul", styleType: "disc" };
  const s = t || 0, a = (p = (o = r.listProperties) == null ? void 0 : o.nestingLevels) == null ? void 0 : p[s];
  let l = a == null ? void 0 : a.glyphType;
  if (!l || l === "GLYPH_TYPE_UNSPECIFIED")
    if (a != null && a.glyphSymbol) {
      const g = a.glyphSymbol;
      g === "●" ? l = "DISC" : g === "○" ? l = "CIRCLE" : g === "■" ? l = "SQUARE" : l = "DISC";
    } else a != null && a.glyphFormat && a.glyphFormat.includes("%") ? l = "DECIMAL" : l = "DISC";
  const u = {
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
  }[l] || { tag: "ul", style: "disc" };
  return {
    tag: u.tag,
    styleType: u.style
  };
}, v = (n) => {
  switch (n) {
    case "CENTER":
      return "center";
    case "END":
      return "right";
    case "JUSTIFIED":
      return "justify";
    default:
      return;
  }
};
class W {
  constructor(t) {
    d(this, "doc");
    d(this, "inlineObjects");
    this.doc = t, this.inlineObjects = t.inlineObjects || null;
  }
  render(t) {
    var r;
    if (t.innerHTML = "", !((r = this.doc.body) != null && r.content)) return;
    f(this.doc.body.content).forEach((s) => {
      if ("type" in s && s.type === "list_group")
        t.appendChild(this.renderListGroup(s.items));
      else {
        const a = s;
        a.paragraph ? t.appendChild(this.renderParagraph(a.paragraph)) : a.table && t.appendChild(this.renderTable(a.table));
      }
    });
  }
  renderParagraph(t) {
    const e = t.paragraphStyle, r = R(e), s = document.createElement(r), a = v((e == null ? void 0 : e.alignment) || void 0);
    if (a && (s.style.textAlign = a), r.startsWith("h")) {
      const l = E(t.elements || []);
      l && (s.id = y(l));
    }
    return t.elements && t.elements.forEach((l) => {
      if (l.textRun) {
        const i = this.renderTextRun(l.textRun);
        s.appendChild(i);
      } else if (l.inlineObjectElement) {
        const i = this.renderImage(l.inlineObjectElement.inlineObjectId);
        i && s.appendChild(i);
      }
    }), s;
  }
  renderTextRun(t) {
    let e = t.content || "";
    if (!e) return document.createTextNode("");
    e = e.replace(/\u000b/g, "");
    const r = I(t.textStyle);
    if (r.length === 0)
      return document.createTextNode(e);
    let s = null, a = null;
    for (const l of r) {
      const i = document.createElement(l.tag);
      l.attrs && Object.entries(l.attrs).forEach(([u, o]) => i.setAttribute(u, o)), s ? (a.appendChild(i), a = i) : (s = i, a = i);
    }
    return a && (a.textContent = e), s;
  }
  renderListGroup(t) {
    const e = x(t);
    return this.renderListTree(e);
  }
  renderListTree(t) {
    var u, o;
    if (t.length === 0) return document.createElement("ul");
    const e = t[0], r = (o = (u = e.item.paragraph) == null ? void 0 : u.bullet) == null ? void 0 : o.listId, s = e.level, { tag: a, styleType: l } = L(r, s, this.doc.lists), i = document.createElement(a);
    return i.style.listStyleType = l, t.forEach((p) => {
      var h;
      const g = document.createElement("li");
      (h = p.item.paragraph) != null && h.elements && p.item.paragraph.elements.forEach((m) => {
        m.textRun && g.appendChild(this.renderTextRun(m.textRun));
      }), p.children.length > 0 && g.appendChild(this.renderListTree(p.children)), i.appendChild(g);
    }), i;
  }
  renderTable(t) {
    const e = document.createElement("table"), r = document.createElement("tbody");
    return e.appendChild(r), (t.tableRows || []).forEach((s) => {
      const a = document.createElement("tr");
      (s.tableCells || []).forEach((l) => {
        var u, o;
        const i = document.createElement("td");
        (u = l.tableCellStyle) != null && u.columnSpan && (i.colSpan = l.tableCellStyle.columnSpan), (o = l.tableCellStyle) != null && o.rowSpan && (i.rowSpan = l.tableCellStyle.rowSpan), l.content && f(l.content).forEach((g) => {
          if ("type" in g && g.type === "list_group")
            i.appendChild(this.renderListGroup(g.items));
          else {
            const h = g;
            h.paragraph && i.appendChild(this.renderParagraph(h.paragraph));
          }
        }), a.appendChild(i);
      }), r.appendChild(a);
    }), e;
  }
  renderImage(t) {
    var s, a, l;
    if (!t || !this.inlineObjects) return null;
    const e = (a = (s = this.inlineObjects[t]) == null ? void 0 : s.inlineObjectProperties) == null ? void 0 : a.embeddedObject;
    if (!((l = e == null ? void 0 : e.imageProperties) != null && l.contentUri)) return null;
    const r = document.createElement("img");
    return r.src = e.imageProperties.contentUri, r.alt = "Embedded Image", r.style.cursor = "pointer", r.onclick = () => this.openLightbox(r.src), r;
  }
  openLightbox(t) {
    const e = document.createElement("div");
    e.style.position = "fixed", e.style.top = "0", e.style.left = "0", e.style.width = "100%", e.style.height = "100%", e.style.backgroundColor = "rgba(0,0,0,0.8)", e.style.display = "flex", e.style.alignItems = "center", e.style.justifyContent = "center", e.style.zIndex = "9999", e.style.cursor = "pointer";
    const r = document.createElement("img");
    r.src = t, r.style.maxWidth = "90%", r.style.maxHeight = "90%", r.style.objectFit = "contain", e.appendChild(r), e.onclick = () => document.body.removeChild(e), document.body.appendChild(e);
  }
}
const N = (n) => {
  const t = S(() => {
    var r;
    return (r = n == null ? void 0 : n.body) != null && r.content ? P(n.body.content) : [];
  }, [n]);
  return { html: S(() => {
    var r;
    return (r = n == null ? void 0 : n.body) != null && r.content ? k(n.body.content, n.inlineObjects, n.lists) : null;
  }, [n]), toc: t };
};
function k(n, t, e) {
  return f(n).map((s, a) => {
    if ("type" in s && s.type === "list_group")
      return /* @__PURE__ */ c.createElement(G, { key: a, items: s.items, inlineObjects: t, lists: e });
    const l = s;
    return l.paragraph ? /* @__PURE__ */ c.createElement(_, { key: a, paragraph: l.paragraph, inlineObjects: t }) : l.table ? /* @__PURE__ */ c.createElement(U, { key: a, table: l.table, inlineObjects: t, lists: e }) : null;
  });
}
function _({ paragraph: n, inlineObjects: t }) {
  var u;
  const e = n.paragraphStyle, r = R(e), s = r, a = v((e == null ? void 0 : e.alignment) || void 0), l = a ? { textAlign: a } : void 0;
  let i;
  if (r.startsWith("h")) {
    const o = E(n.elements || []);
    o && (i = y(o));
  }
  return /* @__PURE__ */ c.createElement(s, { id: i, style: l }, (u = n.elements) == null ? void 0 : u.map((o, p) => /* @__PURE__ */ c.createElement(c.Fragment, { key: p }, o.textRun && /* @__PURE__ */ c.createElement(A, { textRun: o.textRun }), o.inlineObjectElement && /* @__PURE__ */ c.createElement(F, { objectId: o.inlineObjectElement.inlineObjectId, inlineObjects: t }))));
}
function A({ textRun: n }) {
  let t = n.content || "";
  if (!t) return null;
  t = t.replace(/\u000b/g, "");
  const e = I(n.textStyle), r = (s, a) => {
    if (a.length === 0) return s;
    const [l, ...i] = a, u = l.tag;
    return /* @__PURE__ */ c.createElement(u, { ...l.attrs || {} }, r(s, i));
  };
  return /* @__PURE__ */ c.createElement(c.Fragment, null, r(t, e));
}
function G({ items: n, inlineObjects: t, lists: e }) {
  const r = x(n);
  return /* @__PURE__ */ c.createElement(O, { nodes: r, inlineObjects: t, lists: e });
}
function O({ nodes: n, inlineObjects: t, lists: e }) {
  var p, g;
  if (n.length === 0) return null;
  const r = n[0], s = (g = (p = r.item.paragraph) == null ? void 0 : p.bullet) == null ? void 0 : g.listId, a = r.level, { tag: l, styleType: i } = L(s, a, e), u = l, o = { listStyleType: i };
  return /* @__PURE__ */ c.createElement(u, { style: o }, n.map((h, m) => {
    var b, C;
    return /* @__PURE__ */ c.createElement("li", { key: m }, (C = (b = h.item.paragraph) == null ? void 0 : b.elements) == null ? void 0 : C.map((T, j) => /* @__PURE__ */ c.createElement(c.Fragment, { key: j }, T.textRun && /* @__PURE__ */ c.createElement(A, { textRun: T.textRun }))), h.children.length > 0 && /* @__PURE__ */ c.createElement(O, { nodes: h.children, inlineObjects: t, lists: e }));
  }));
}
function U({ table: n, inlineObjects: t, lists: e }) {
  var r;
  return /* @__PURE__ */ c.createElement("table", null, /* @__PURE__ */ c.createElement("tbody", null, (r = n.tableRows) == null ? void 0 : r.map((s, a) => {
    var l;
    return /* @__PURE__ */ c.createElement("tr", { key: a }, (l = s.tableCells) == null ? void 0 : l.map((i, u) => {
      var o, p;
      return /* @__PURE__ */ c.createElement("td", { key: u, colSpan: ((o = i.tableCellStyle) == null ? void 0 : o.columnSpan) || 1, rowSpan: ((p = i.tableCellStyle) == null ? void 0 : p.rowSpan) || 1 }, i.content && k(i.content, t, e));
    }));
  })));
}
function F({ objectId: n, inlineObjects: t }) {
  var l, i, u;
  const [e, r] = c.useState(!1);
  if (!n || !t) return null;
  const s = (i = (l = t[n]) == null ? void 0 : l.inlineObjectProperties) == null ? void 0 : i.embeddedObject;
  if (!((u = s == null ? void 0 : s.imageProperties) != null && u.contentUri)) return null;
  const a = s.imageProperties.contentUri;
  return /* @__PURE__ */ c.createElement(c.Fragment, null, /* @__PURE__ */ c.createElement(
    "img",
    {
      src: a,
      alt: "Embedded",
      onClick: () => r(!0),
      style: { cursor: "pointer" }
    }
  ), e && /* @__PURE__ */ c.createElement(
    "div",
    {
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        cursor: "pointer"
      },
      onClick: () => r(!1)
    },
    /* @__PURE__ */ c.createElement("img", { src: a, style: { maxWidth: "90%", maxHeight: "90%", objectFit: "contain" } })
  ));
}
const z = ({ doc: n, className: t }) => {
  const { html: e, toc: r } = N(n);
  return n ? /* @__PURE__ */ c.createElement("div", { className: t }, /* @__PURE__ */ c.createElement("div", { className: "gdoc-content" }, e), r.length > 0 && /* @__PURE__ */ c.createElement("nav", { className: "gdoc-toc" }, /* @__PURE__ */ c.createElement("ul", null, r.map((s) => /* @__PURE__ */ c.createElement("li", { key: s.id, className: `gdoc-toc-level-${s.level}` }, /* @__PURE__ */ c.createElement("a", { href: `#${s.id}` }, s.text)))))) : null;
}, $ = ({ doc: n, className: t }) => {
  const { html: e } = N(n);
  return n ? /* @__PURE__ */ c.createElement("div", { className: t }, e) : null;
};
export {
  $ as GDocContent,
  W as GDocScribe,
  z as GDocViewer,
  x as buildListTree,
  P as extractHeadings,
  v as getAlignmentStyle,
  R as getHeadingTag,
  L as getListTagAndStyle,
  E as getParagraphText,
  I as getTextTags,
  f as processContent,
  y as slugify,
  N as useDocs
};
