var j = Object.defineProperty;
var O = (r, t, e) => t in r ? j(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var E = (r, t, e) => O(r, typeof t != "symbol" ? t + "" : t, e);
import u, { useMemo as T } from "react";
const C = (r) => r.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""), y = (r) => r.map((t) => {
  var e;
  return ((e = t.textRun) == null ? void 0 : e.content) || "";
}).join("").replace(/\u000b/g, "").trim(), b = (r) => {
  var l, a;
  const t = [];
  let e = null, n = null;
  if (!r) return [];
  for (let i = 0; i < r.length; i++) {
    const o = r[i], s = o.paragraph ? y(o.paragraph.elements || []) : "";
    if (!n && s.trim().startsWith("```")) {
      const c = s.trim(), p = c.match(/^```(\w*)\s*([\s\S]*?)\s*```$/);
      if (p && c.length > 3) {
        t.push({
          type: "code_block",
          language: p[1] || "",
          content: p[2]
        });
        continue;
      }
      n = {
        type: "code_block",
        language: s.trim().replace(/^```/, "").trim(),
        content: []
      };
      continue;
    }
    if (n && s.trim() === "```") {
      t.push({
        type: "code_block",
        language: n.language,
        content: n.content.join(`
`)
      }), n = null;
      continue;
    }
    if (n) {
      n.content.push(s);
      continue;
    }
    if (o.paragraph && o.paragraph.bullet) {
      const c = o.paragraph.bullet.listId;
      e ? ((a = (l = e.items[0].paragraph) == null ? void 0 : l.bullet) == null ? void 0 : a.listId) !== c && (e = { type: "list_group", items: [] }, t.push(e)) : (e = { type: "list_group", items: [] }, t.push(e)), e.items.push(o);
    } else
      e = null, t.push(o);
  }
  return n && t.push({
    type: "code_block",
    language: n.language,
    content: n.content.join(`
`)
  }), t;
}, x = (r) => {
  const t = [], e = [];
  return r.forEach((n) => {
    var i, o;
    const l = ((o = (i = n.paragraph) == null ? void 0 : i.bullet) == null ? void 0 : o.nestingLevel) || 0, a = { item: n, children: [], level: l };
    for (; e.length > 0 && e[e.length - 1].level >= l; )
      e.pop();
    e.length === 0 ? t.push(a) : e[e.length - 1].children.push(a), e.push(a);
  }), t;
}, _ = (r) => {
  const t = [];
  return r.forEach((e) => {
    var n, l;
    if (e.paragraph && ((l = (n = e.paragraph.paragraphStyle) == null ? void 0 : n.namedStyleType) != null && l.startsWith("HEADING"))) {
      const a = e.paragraph.paragraphStyle.namedStyleType, i = parseInt(a.split("_")[1]), o = y(e.paragraph.elements || []);
      o && !isNaN(i) && t.push({
        id: C(o),
        text: o,
        level: i
      });
    }
  }), t;
}, I = (r) => {
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
}, L = (r) => {
  const t = r == null ? void 0 : r.namedStyleType;
  if (t === "TITLE") return "h1";
  if (t === "SUBTITLE") return "p";
  if (t != null && t.startsWith("HEADING_")) {
    const e = t.split("_")[1];
    if (["1", "2", "3", "4", "5", "6"].includes(e))
      return `h${e}`;
  }
  return "p";
}, R = (r, t, e) => {
  var c, p;
  if (!r || !e) return { tag: "ul", styleType: "disc" };
  const n = e[r];
  if (!n) return { tag: "ul", styleType: "disc" };
  const l = t || 0, a = (p = (c = n.listProperties) == null ? void 0 : c.nestingLevels) == null ? void 0 : p[l];
  let i = a == null ? void 0 : a.glyphType;
  if (!i || i === "GLYPH_TYPE_UNSPECIFIED")
    if (a != null && a.glyphSymbol) {
      const g = a.glyphSymbol;
      g === "●" ? i = "DISC" : g === "○" ? i = "CIRCLE" : g === "■" ? i = "SQUARE" : i = "DISC";
    } else a != null && a.glyphFormat && a.glyphFormat.includes("%") ? i = "DECIMAL" : i = "DISC";
  const s = {
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
  }[i] || { tag: "ul", style: "disc" };
  return {
    tag: s.tag,
    styleType: s.style
  };
}, k = (r) => {
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
};
class $ {
  constructor(t) {
    E(this, "doc");
    E(this, "inlineObjects");
    this.doc = t, this.inlineObjects = t.inlineObjects || null;
  }
  render(t) {
    var n;
    if (t.innerHTML = "", !((n = this.doc.body) != null && n.content)) return;
    b(this.doc.body.content).forEach((l) => {
      if ("type" in l && l.type === "list_group")
        t.appendChild(this.renderListGroup(l.items));
      else if ("type" in l && l.type === "code_block")
        t.appendChild(this.renderCodeBlock(l));
      else {
        const a = l;
        a.paragraph ? t.appendChild(this.renderParagraph(a.paragraph)) : a.table && t.appendChild(this.renderTable(a.table));
      }
    });
  }
  renderCodeBlock(t) {
    const e = document.createElement("pre"), n = document.createElement("code");
    return t.language && (n.className = `language-${t.language}`), n.textContent = t.content, e.appendChild(n), e;
  }
  renderParagraph(t) {
    var i, o;
    const e = t.paragraphStyle, n = L(e), l = document.createElement(n), a = k((e == null ? void 0 : e.alignment) || void 0);
    if (a && (l.style.textAlign = a), e != null && e.indentStart) {
      const s = this.getDimensionStyle(e.indentStart);
      s && (l.style.paddingLeft = s);
    }
    if (e != null && e.indentEnd) {
      const s = this.getDimensionStyle(e.indentEnd);
      s && (l.style.paddingRight = s);
    }
    if (e != null && e.indentFirstLine) {
      const s = this.getDimensionStyle(e.indentFirstLine);
      s && (l.style.textIndent = s);
    }
    if (e != null && e.spaceAbove) {
      const s = this.getDimensionStyle(e.spaceAbove);
      s && (l.style.marginTop = s);
    }
    if (e != null && e.spaceBelow) {
      const s = this.getDimensionStyle(e.spaceBelow);
      s && (l.style.marginBottom = s);
    }
    if ((o = (i = e == null ? void 0 : e.shading) == null ? void 0 : i.backgroundColor) != null && o.color) {
      const s = this.getColorStyle(e.shading.backgroundColor.color);
      s && (l.style.backgroundColor = s, l.style.padding = "10px", l.style.borderRadius = "4px");
    }
    if (n.startsWith("h")) {
      const s = y(t.elements || []);
      s && (l.id = C(s));
    }
    return t.elements && t.elements.forEach((s) => {
      if (s.textRun) {
        const c = this.renderTextRun(s.textRun);
        l.appendChild(c);
      } else if (s.inlineObjectElement) {
        const c = this.renderImage(s.inlineObjectElement.inlineObjectId);
        c && l.appendChild(c);
      }
    }), l;
  }
  getDimensionStyle(t) {
    return t.magnitude && t.unit ? `${t.magnitude}${t.unit.toLowerCase()}` : null;
  }
  getColorStyle(t) {
    if (t.rgbColor) {
      const { red: e, green: n, blue: l } = t.rgbColor, a = Math.round((e || 0) * 255), i = Math.round((n || 0) * 255), o = Math.round((l || 0) * 255);
      return `rgb(${a}, ${i}, ${o})`;
    }
    return null;
  }
  renderTextRun(t) {
    let e = t.content || "";
    if (!e) return document.createTextNode("");
    e = e.replace(/\u000b/g, "");
    const n = I(t.textStyle), l = (o) => {
      if (n.length === 0)
        return document.createTextNode(o);
      let s = null, c = null;
      for (const p of n) {
        const g = document.createElement(p.tag);
        p.attrs && Object.entries(p.attrs).forEach(([d, h]) => g.setAttribute(d, h)), s ? (c.appendChild(g), c = g) : (s = g, c = g);
      }
      return c && (c.textContent = o), s;
    }, a = e.split(/(`[^`]+`)/g);
    if (a.length === 1)
      return l(e);
    const i = document.createDocumentFragment();
    return a.forEach((o) => {
      if (o.startsWith("`") && o.endsWith("`") && o.length > 2) {
        const s = o.slice(1, -1), c = document.createElement("code");
        if (c.textContent = s, n.length === 0)
          i.appendChild(c);
        else {
          let p = null, g = null;
          for (const d of n) {
            const h = document.createElement(d.tag);
            d.attrs && Object.entries(d.attrs).forEach(([m, f]) => h.setAttribute(m, f)), p ? (g.appendChild(h), g = h) : (p = h, g = h);
          }
          g ? (g.appendChild(c), i.appendChild(p)) : i.appendChild(c);
        }
      } else
        o && i.appendChild(l(o));
    }), i;
  }
  renderListGroup(t) {
    const e = x(t);
    return this.renderListTree(e);
  }
  renderListTree(t) {
    var s, c;
    if (t.length === 0) return document.createElement("ul");
    const e = t[0], n = (c = (s = e.item.paragraph) == null ? void 0 : s.bullet) == null ? void 0 : c.listId, l = e.level, { tag: a, styleType: i } = R(n, l, this.doc.lists), o = document.createElement(a);
    return o.style.listStyleType = i, t.forEach((p) => {
      var d;
      const g = document.createElement("li");
      (d = p.item.paragraph) != null && d.elements && p.item.paragraph.elements.forEach((h) => {
        h.textRun && g.appendChild(this.renderTextRun(h.textRun));
      }), p.children.length > 0 && g.appendChild(this.renderListTree(p.children)), o.appendChild(g);
    }), o;
  }
  renderTable(t) {
    const e = document.createElement("table"), n = document.createElement("tbody");
    return e.appendChild(n), (t.tableRows || []).forEach((l) => {
      const a = document.createElement("tr");
      (l.tableCells || []).forEach((i) => {
        var s, c;
        const o = document.createElement("td");
        (s = i.tableCellStyle) != null && s.columnSpan && (o.colSpan = i.tableCellStyle.columnSpan), (c = i.tableCellStyle) != null && c.rowSpan && (o.rowSpan = i.tableCellStyle.rowSpan), i.content && b(i.content).forEach((g) => {
          if ("type" in g && g.type === "list_group")
            o.appendChild(this.renderListGroup(g.items));
          else {
            const d = g;
            d.paragraph && o.appendChild(this.renderParagraph(d.paragraph));
          }
        }), a.appendChild(o);
      }), n.appendChild(a);
    }), e;
  }
  renderImage(t) {
    var l, a, i;
    if (!t || !this.inlineObjects) return null;
    const e = (a = (l = this.inlineObjects[t]) == null ? void 0 : l.inlineObjectProperties) == null ? void 0 : a.embeddedObject;
    if (!((i = e == null ? void 0 : e.imageProperties) != null && i.contentUri)) return null;
    const n = document.createElement("img");
    return n.src = e.imageProperties.contentUri, n.alt = "Embedded Image", n.style.cursor = "pointer", n.onclick = () => this.openLightbox(n.src), n;
  }
  openLightbox(t) {
    const e = document.createElement("div");
    e.style.position = "fixed", e.style.top = "0", e.style.left = "0", e.style.width = "100%", e.style.height = "100%", e.style.backgroundColor = "rgba(0,0,0,0.8)", e.style.display = "flex", e.style.alignItems = "center", e.style.justifyContent = "center", e.style.zIndex = "9999", e.style.cursor = "pointer";
    const n = document.createElement("img");
    n.src = t, n.style.maxWidth = "90%", n.style.maxHeight = "90%", n.style.objectFit = "contain", e.appendChild(n), e.onclick = () => document.body.removeChild(e), document.body.appendChild(e);
  }
}
const D = (r) => {
  const t = T(() => {
    var n;
    return (n = r == null ? void 0 : r.body) != null && n.content ? _(r.body.content) : [];
  }, [r]);
  return { html: T(() => {
    var n;
    return (n = r == null ? void 0 : r.body) != null && n.content ? v(r.body.content, r.inlineObjects, r.lists) : null;
  }, [r]), toc: t };
};
function v(r, t, e) {
  return b(r).map((l, a) => {
    if ("type" in l && l.type === "list_group")
      return /* @__PURE__ */ u.createElement(F, { key: a, items: l.items, inlineObjects: t, lists: e });
    const i = l;
    return i.paragraph ? /* @__PURE__ */ u.createElement(P, { key: a, paragraph: i.paragraph, inlineObjects: t }) : i.table ? /* @__PURE__ */ u.createElement(M, { key: a, table: i.table, inlineObjects: t, lists: e }) : null;
  });
}
function P({ paragraph: r, inlineObjects: t }) {
  var s;
  const e = r.paragraphStyle, n = L(e), l = n, a = k((e == null ? void 0 : e.alignment) || void 0), i = a ? { textAlign: a } : void 0;
  let o;
  if (n.startsWith("h")) {
    const c = y(r.elements || []);
    c && (o = C(c));
  }
  return /* @__PURE__ */ u.createElement(l, { id: o, style: i }, (s = r.elements) == null ? void 0 : s.map((c, p) => /* @__PURE__ */ u.createElement(u.Fragment, { key: p }, c.textRun && /* @__PURE__ */ u.createElement(w, { textRun: c.textRun }), c.inlineObjectElement && /* @__PURE__ */ u.createElement(G, { objectId: c.inlineObjectElement.inlineObjectId, inlineObjects: t }))));
}
function w({ textRun: r }) {
  let t = r.content || "";
  if (!t) return null;
  t = t.replace(/\u000b/g, "");
  const e = I(r.textStyle), n = (l, a) => {
    if (a.length === 0) return l;
    const [i, ...o] = a, s = i.tag;
    return /* @__PURE__ */ u.createElement(s, { ...i.attrs || {} }, n(l, o));
  };
  return /* @__PURE__ */ u.createElement(u.Fragment, null, n(t, e));
}
function F({ items: r, inlineObjects: t, lists: e }) {
  const n = x(r);
  return /* @__PURE__ */ u.createElement(A, { nodes: n, inlineObjects: t, lists: e });
}
function A({ nodes: r, inlineObjects: t, lists: e }) {
  var p, g;
  if (r.length === 0) return null;
  const n = r[0], l = (g = (p = n.item.paragraph) == null ? void 0 : p.bullet) == null ? void 0 : g.listId, a = n.level, { tag: i, styleType: o } = R(l, a, e), s = i, c = { listStyleType: o };
  return /* @__PURE__ */ u.createElement(s, { style: c }, r.map((d, h) => {
    var m, f;
    return /* @__PURE__ */ u.createElement("li", { key: h }, (f = (m = d.item.paragraph) == null ? void 0 : m.elements) == null ? void 0 : f.map((S, N) => /* @__PURE__ */ u.createElement(u.Fragment, { key: N }, S.textRun && /* @__PURE__ */ u.createElement(w, { textRun: S.textRun }))), d.children.length > 0 && /* @__PURE__ */ u.createElement(A, { nodes: d.children, inlineObjects: t, lists: e }));
  }));
}
function M({ table: r, inlineObjects: t, lists: e }) {
  var n;
  return /* @__PURE__ */ u.createElement("table", null, /* @__PURE__ */ u.createElement("tbody", null, (n = r.tableRows) == null ? void 0 : n.map((l, a) => {
    var i;
    return /* @__PURE__ */ u.createElement("tr", { key: a }, (i = l.tableCells) == null ? void 0 : i.map((o, s) => {
      var c, p;
      return /* @__PURE__ */ u.createElement("td", { key: s, colSpan: ((c = o.tableCellStyle) == null ? void 0 : c.columnSpan) || 1, rowSpan: ((p = o.tableCellStyle) == null ? void 0 : p.rowSpan) || 1 }, o.content && v(o.content, t, e));
    }));
  })));
}
function G({ objectId: r, inlineObjects: t }) {
  var i, o, s;
  const [e, n] = u.useState(!1);
  if (!r || !t) return null;
  const l = (o = (i = t[r]) == null ? void 0 : i.inlineObjectProperties) == null ? void 0 : o.embeddedObject;
  if (!((s = l == null ? void 0 : l.imageProperties) != null && s.contentUri)) return null;
  const a = l.imageProperties.contentUri;
  return /* @__PURE__ */ u.createElement(u.Fragment, null, /* @__PURE__ */ u.createElement(
    "img",
    {
      src: a,
      alt: "Embedded",
      onClick: () => n(!0),
      style: { cursor: "pointer" }
    }
  ), e && /* @__PURE__ */ u.createElement(
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
      onClick: () => n(!1)
    },
    /* @__PURE__ */ u.createElement("img", { src: a, style: { maxWidth: "90%", maxHeight: "90%", objectFit: "contain" } })
  ));
}
const B = ({ doc: r, className: t }) => {
  const { html: e, toc: n } = D(r);
  return r ? /* @__PURE__ */ u.createElement("div", { className: t }, /* @__PURE__ */ u.createElement("div", { className: "gdoc-content" }, e), n.length > 0 && /* @__PURE__ */ u.createElement("nav", { className: "gdoc-toc" }, /* @__PURE__ */ u.createElement("ul", null, n.map((l) => /* @__PURE__ */ u.createElement("li", { key: l.id, className: `gdoc-toc-level-${l.level}` }, /* @__PURE__ */ u.createElement("a", { href: `#${l.id}` }, l.text)))))) : null;
}, H = ({ doc: r, className: t }) => {
  const { html: e } = D(r);
  return r ? /* @__PURE__ */ u.createElement("div", { className: t }, e) : null;
};
export {
  H as GDocContent,
  $ as GDocScribe,
  B as GDocViewer,
  x as buildListTree,
  _ as extractHeadings,
  k as getAlignmentStyle,
  L as getHeadingTag,
  R as getListTagAndStyle,
  y as getParagraphText,
  I as getTextTags,
  b as processContent,
  C as slugify,
  D as useDocs
};
