var B = Object.defineProperty;
var M = (n, t, e) => t in n ? B(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var E = (n, t, e) => M(n, typeof t != "symbol" ? t + "" : t, e);
import u, { useMemo as x } from "react";
const C = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""), y = (n) => n.map((t) => {
  var e;
  return ((e = t.textRun) == null ? void 0 : e.content) || "";
}).join("").replace(/\u000b/g, "").trim(), b = (n) => {
  const t = [];
  let e = null, r = null;
  if (!n) return [];
  for (let l = 0; l < n.length; l++) {
    const i = n[l], a = i.paragraph ? y(i.paragraph.elements || []) : "";
    if (!r && a.trim().startsWith("```")) {
      const c = a.trim(), o = c.match(/^```(\w*)\s*([\s\S]*?)\s*```$/);
      if (o && c.length > 3) {
        t.push({
          type: "code_block",
          language: o[1] || "",
          content: o[2]
        });
        continue;
      }
      r = {
        type: "code_block",
        language: a.trim().replace(/^```/, "").trim(),
        content: []
      };
      continue;
    }
    if (r && a.trim() === "```") {
      t.push({
        type: "code_block",
        language: r.language,
        content: r.content.join(`
`)
      }), r = null;
      continue;
    }
    if (r) {
      r.content.push(a);
      continue;
    }
    if (i.paragraph && i.paragraph.bullet) {
      const c = i.paragraph.bullet.listId;
      !e || e.listId !== c ? (e = {
        type: "list_group",
        listId: c || "",
        items: [i]
      }, t.push(e)) : e.items.push(i);
    } else
      e = null, t.push(i);
  }
  return r && t.push({
    type: "code_block",
    language: r.language,
    content: r.content.join(`
`)
  }), t;
}, I = (n) => {
  const t = [], e = [];
  return n.forEach((r) => {
    var a, c;
    const l = ((c = (a = r.paragraph) == null ? void 0 : a.bullet) == null ? void 0 : c.nestingLevel) || 0, i = { item: r, children: [], level: l };
    for (; e.length > 0 && e[e.length - 1].level >= l; )
      e.pop();
    e.length === 0 ? t.push(i) : e[e.length - 1].children.push(i), e.push(i);
  }), t;
}, P = (n) => {
  const t = [];
  return n.forEach((e) => {
    var r, l;
    if (e.paragraph && ((l = (r = e.paragraph.paragraphStyle) == null ? void 0 : r.namedStyleType) != null && l.startsWith("HEADING"))) {
      const i = e.paragraph.paragraphStyle.namedStyleType, a = parseInt(i.split("_")[1]), c = y(e.paragraph.elements || []);
      c && !isNaN(a) && t.push({
        id: C(c),
        text: c,
        level: a
      });
    }
  }), t;
}, R = (n) => n.split(/(`[^`]+`)/g).map((e) => e.startsWith("`") && e.endsWith("`") && e.length > 2 ? { type: "code", content: e.slice(1, -1) } : { type: "text", content: e }).filter((e) => e.content !== ""), L = (n) => {
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
}, v = (n) => {
  const t = n == null ? void 0 : n.namedStyleType;
  if (t === "TITLE") return "h1";
  if (t === "SUBTITLE") return "p";
  if (t != null && t.startsWith("HEADING_")) {
    const e = t.split("_")[1];
    if (["1", "2", "3", "4", "5", "6"].includes(e))
      return `h${e}`;
  }
  return "p";
}, k = (n, t, e) => {
  var p, d;
  if (!n || !e) return { tag: "ul", styleType: "disc" };
  const r = e[n];
  if (!r) return { tag: "ul", styleType: "disc" };
  const l = t || 0, i = (d = (p = r.listProperties) == null ? void 0 : p.nestingLevels) == null ? void 0 : d[l];
  let a = i == null ? void 0 : i.glyphType;
  if (!a || a === "GLYPH_TYPE_UNSPECIFIED")
    if (i != null && i.glyphSymbol) {
      const s = i.glyphSymbol;
      s === "●" ? a = "DISC" : s === "○" ? a = "CIRCLE" : s === "■" ? a = "SQUARE" : a = "DISC";
    } else i != null && i.glyphFormat && i.glyphFormat.includes("%") ? a = "DECIMAL" : a = "DISC";
  const o = {
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
    tag: o.tag,
    styleType: o.style
  };
}, w = (n) => {
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
}, A = (n, t) => {
  var r, l, i;
  if (!n || !t) return null;
  const e = (l = (r = t[n]) == null ? void 0 : r.inlineObjectProperties) == null ? void 0 : l.embeddedObject;
  return (i = e == null ? void 0 : e.imageProperties) != null && i.contentUri ? {
    src: e.imageProperties.contentUri,
    alt: "Embedded Image"
    // Google Docs API doesn't always provide alt text easily in this structure, defaulting for now
  } : null;
}, h = (n) => n != null && n.magnitude && (n != null && n.unit) ? `${n.magnitude}${n.unit.toLowerCase()}` : null, D = (n) => {
  if (n != null && n.rgbColor) {
    const { red: t, green: e, blue: r } = n.rgbColor, l = Math.round((t || 0) * 255), i = Math.round((e || 0) * 255), a = Math.round((r || 0) * 255);
    return `rgb(${l}, ${i}, ${a})`;
  }
  return null;
};
class Y {
  constructor(t) {
    E(this, "doc");
    E(this, "inlineObjects");
    this.doc = t, this.inlineObjects = t.inlineObjects || null;
  }
  render(t) {
    var r;
    if (t.innerHTML = "", !((r = this.doc.body) != null && r.content)) return;
    b(this.doc.body.content).forEach((l) => {
      if ("type" in l && l.type === "list_group")
        t.appendChild(this.renderListGroup(l.items));
      else if ("type" in l && l.type === "code_block")
        t.appendChild(this.renderCodeBlock(l));
      else {
        const i = l;
        i.paragraph ? t.appendChild(this.renderParagraph(i.paragraph)) : i.table && t.appendChild(this.renderTable(i.table));
      }
    });
  }
  renderCodeBlock(t) {
    const e = document.createElement("pre"), r = document.createElement("code");
    return t.language && (r.className = `language-${t.language}`), r.textContent = t.content, e.appendChild(r), e;
  }
  renderParagraph(t) {
    var a, c;
    const e = t.paragraphStyle, r = v(e), l = document.createElement(r), i = w((e == null ? void 0 : e.alignment) || void 0);
    if (i && (l.style.textAlign = i), e != null && e.indentStart) {
      const o = h(e.indentStart);
      o && (l.style.paddingLeft = o);
    }
    if (e != null && e.indentEnd) {
      const o = h(e.indentEnd);
      o && (l.style.paddingRight = o);
    }
    if (e != null && e.indentFirstLine) {
      const o = h(e.indentFirstLine);
      o && (l.style.textIndent = o);
    }
    if (e != null && e.spaceAbove) {
      const o = h(e.spaceAbove);
      o && (l.style.marginTop = o);
    }
    if (e != null && e.spaceBelow) {
      const o = h(e.spaceBelow);
      o && (l.style.marginBottom = o);
    }
    if ((c = (a = e == null ? void 0 : e.shading) == null ? void 0 : a.backgroundColor) != null && c.color) {
      const o = D(e.shading.backgroundColor.color);
      o && (l.style.backgroundColor = o, l.style.padding = "10px", l.style.borderRadius = "4px");
    }
    if (r.startsWith("h")) {
      const o = y(t.elements || []);
      o && (l.id = C(o));
    }
    return t.elements && t.elements.forEach((o) => {
      if (o.textRun) {
        const p = this.renderTextRun(o.textRun);
        l.appendChild(p);
      } else if (o.inlineObjectElement) {
        const p = this.renderImage(o.inlineObjectElement.inlineObjectId);
        p && l.appendChild(p);
      }
    }), l;
  }
  renderTextRun(t) {
    let e = t.content || "";
    if (!e) return document.createTextNode("");
    e = e.replace(/\u000b/g, "");
    const r = L(t.textStyle), l = (c) => {
      if (r.length === 0)
        return document.createTextNode(c);
      let o = null, p = null;
      for (const d of r) {
        const s = document.createElement(d.tag);
        d.attrs && Object.entries(d.attrs).forEach(([g, m]) => s.setAttribute(g, m)), o ? (p.appendChild(s), p = s) : (o = s, p = s);
      }
      return p && (p.textContent = c), o;
    }, i = R(e);
    if (i.length === 1 && i[0].type === "text")
      return l(i[0].content);
    const a = document.createDocumentFragment();
    return i.forEach((c) => {
      if (c.type === "code") {
        const o = document.createElement("code");
        if (o.textContent = c.content, r.length === 0)
          a.appendChild(o);
        else {
          let p = null, d = null;
          for (const s of r) {
            const g = document.createElement(s.tag);
            s.attrs && Object.entries(s.attrs).forEach(([m, f]) => g.setAttribute(m, f)), p ? (d.appendChild(g), d = g) : (p = g, d = g);
          }
          d ? (d.appendChild(o), a.appendChild(p)) : a.appendChild(o);
        }
      } else
        a.appendChild(l(c.content));
    }), a;
  }
  renderListGroup(t) {
    const e = I(t);
    return this.renderListTree(e);
  }
  renderListTree(t) {
    var o, p;
    if (t.length === 0) return document.createElement("ul");
    const e = t[0], r = (p = (o = e.item.paragraph) == null ? void 0 : o.bullet) == null ? void 0 : p.listId, l = e.level, { tag: i, styleType: a } = k(r, l, this.doc.lists), c = document.createElement(i);
    return c.style.listStyleType = a, t.forEach((d) => {
      var g;
      const s = document.createElement("li");
      (g = d.item.paragraph) != null && g.elements && d.item.paragraph.elements.forEach((m) => {
        m.textRun && s.appendChild(this.renderTextRun(m.textRun));
      }), d.children.length > 0 && s.appendChild(this.renderListTree(d.children)), c.appendChild(s);
    }), c;
  }
  renderTable(t) {
    const e = document.createElement("table"), r = document.createElement("tbody");
    return e.appendChild(r), (t.tableRows || []).forEach((l) => {
      const i = document.createElement("tr");
      (l.tableCells || []).forEach((a) => {
        var o, p;
        const c = document.createElement("td");
        (o = a.tableCellStyle) != null && o.columnSpan && (c.colSpan = a.tableCellStyle.columnSpan), (p = a.tableCellStyle) != null && p.rowSpan && (c.rowSpan = a.tableCellStyle.rowSpan), a.content && b(a.content).forEach((s) => {
          if ("type" in s && s.type === "list_group")
            c.appendChild(this.renderListGroup(s.items));
          else {
            const g = s;
            g.paragraph && c.appendChild(this.renderParagraph(g.paragraph));
          }
        }), i.appendChild(c);
      }), r.appendChild(i);
    }), e;
  }
  renderImage(t) {
    const e = A(t, this.inlineObjects);
    if (!e) return null;
    const r = document.createElement("img");
    return r.src = e.src, r.alt = e.alt, r.style.cursor = "pointer", r.onclick = () => this.openLightbox(r.src), r;
  }
  openLightbox(t) {
    const e = document.createElement("div");
    e.style.position = "fixed", e.style.top = "0", e.style.left = "0", e.style.width = "100%", e.style.height = "100%", e.style.backgroundColor = "rgba(0,0,0,0.8)", e.style.display = "flex", e.style.alignItems = "center", e.style.justifyContent = "center", e.style.zIndex = "9999", e.style.cursor = "pointer";
    const r = document.createElement("img");
    r.src = t, r.style.maxWidth = "90%", r.style.maxHeight = "90%", r.style.objectFit = "contain", e.appendChild(r), e.onclick = () => document.body.removeChild(e), document.body.appendChild(e);
  }
}
const N = (n) => {
  const t = x(() => {
    var r;
    return (r = n == null ? void 0 : n.body) != null && r.content ? P(n.body.content) : [];
  }, [n]);
  return { html: x(() => {
    var r;
    return (r = n == null ? void 0 : n.body) != null && r.content ? j(n.body.content, n.inlineObjects, n.lists) : null;
  }, [n]), toc: t };
};
function j(n, t, e) {
  return b(n).map((l, i) => {
    if ("type" in l && l.type === "list_group")
      return /* @__PURE__ */ u.createElement(W, { key: i, items: l.items, inlineObjects: t, lists: e });
    if ("type" in l && l.type === "code_block")
      return /* @__PURE__ */ u.createElement($, { key: i, block: l });
    const a = l;
    return a.paragraph ? /* @__PURE__ */ u.createElement(G, { key: i, paragraph: a.paragraph, inlineObjects: t }) : a.table ? /* @__PURE__ */ u.createElement(H, { key: i, table: a.table, inlineObjects: t, lists: e }) : null;
  });
}
function $({ block: n }) {
  return /* @__PURE__ */ u.createElement("pre", null, /* @__PURE__ */ u.createElement("code", { className: n.language ? `language-${n.language}` : void 0 }, n.content));
}
function G({ paragraph: n, inlineObjects: t }) {
  var o, p, d;
  const e = n.paragraphStyle, r = v(e), l = r, i = w((e == null ? void 0 : e.alignment) || void 0), a = {};
  if (i && (a.textAlign = i), e != null && e.indentStart) {
    const s = h(e.indentStart);
    s && (a.paddingLeft = s);
  }
  if (e != null && e.indentEnd) {
    const s = h(e.indentEnd);
    s && (a.paddingRight = s);
  }
  if (e != null && e.indentFirstLine) {
    const s = h(e.indentFirstLine);
    s && (a.textIndent = s);
  }
  if (e != null && e.spaceAbove) {
    const s = h(e.spaceAbove);
    s && (a.marginTop = s);
  }
  if (e != null && e.spaceBelow) {
    const s = h(e.spaceBelow);
    s && (a.marginBottom = s);
  }
  if ((p = (o = e == null ? void 0 : e.shading) == null ? void 0 : o.backgroundColor) != null && p.color) {
    const s = D(e.shading.backgroundColor.color);
    s && (a.backgroundColor = s, a.padding = "10px", a.borderRadius = "4px");
  }
  let c;
  if (r.startsWith("h")) {
    const s = y(n.elements || []);
    s && (c = C(s));
  }
  return /* @__PURE__ */ u.createElement(l, { id: c, style: a }, (d = n.elements) == null ? void 0 : d.map((s, g) => /* @__PURE__ */ u.createElement(u.Fragment, { key: g }, s.textRun && /* @__PURE__ */ u.createElement(_, { textRun: s.textRun }), s.inlineObjectElement && /* @__PURE__ */ u.createElement(U, { objectId: s.inlineObjectElement.inlineObjectId, inlineObjects: t }))));
}
function _({ textRun: n }) {
  let t = n.content || "";
  if (!t) return null;
  t = t.replace(/\u000b/g, "");
  const e = L(n.textStyle), r = (i, a) => {
    if (a.length === 0) return i;
    const [c, ...o] = a, p = c.tag;
    return /* @__PURE__ */ u.createElement(p, { ...c.attrs || {} }, r(i, o));
  }, l = R(t);
  return /* @__PURE__ */ u.createElement(u.Fragment, null, l.map((i, a) => i.type === "code" ? /* @__PURE__ */ u.createElement(u.Fragment, { key: a }, r(i.content, [{ tag: "code" }, ...e])) : /* @__PURE__ */ u.createElement(u.Fragment, { key: a }, r(i.content, e))));
}
function W({ items: n, inlineObjects: t, lists: e }) {
  const r = I(n);
  return /* @__PURE__ */ u.createElement(F, { nodes: r, inlineObjects: t, lists: e });
}
function F({ nodes: n, inlineObjects: t, lists: e }) {
  var d, s;
  if (n.length === 0) return null;
  const r = n[0], l = (s = (d = r.item.paragraph) == null ? void 0 : d.bullet) == null ? void 0 : s.listId, i = r.level, { tag: a, styleType: c } = k(l, i, e), o = a, p = { listStyleType: c };
  return /* @__PURE__ */ u.createElement(o, { style: p }, n.map((g, m) => {
    var f, S;
    return /* @__PURE__ */ u.createElement("li", { key: m }, (S = (f = g.item.paragraph) == null ? void 0 : f.elements) == null ? void 0 : S.map((T, O) => /* @__PURE__ */ u.createElement(u.Fragment, { key: O }, T.textRun && /* @__PURE__ */ u.createElement(_, { textRun: T.textRun }))), g.children.length > 0 && /* @__PURE__ */ u.createElement(F, { nodes: g.children, inlineObjects: t, lists: e }));
  }));
}
function H({ table: n, inlineObjects: t, lists: e }) {
  var r;
  return /* @__PURE__ */ u.createElement("table", null, /* @__PURE__ */ u.createElement("tbody", null, (r = n.tableRows) == null ? void 0 : r.map((l, i) => {
    var a;
    return /* @__PURE__ */ u.createElement("tr", { key: i }, (a = l.tableCells) == null ? void 0 : a.map((c, o) => {
      var p, d;
      return /* @__PURE__ */ u.createElement("td", { key: o, colSpan: ((p = c.tableCellStyle) == null ? void 0 : p.columnSpan) || 1, rowSpan: ((d = c.tableCellStyle) == null ? void 0 : d.rowSpan) || 1 }, c.content && j(c.content, t, e));
    }));
  })));
}
function U({ objectId: n, inlineObjects: t }) {
  const [e, r] = u.useState(!1), l = A(n, t);
  return l ? /* @__PURE__ */ u.createElement(u.Fragment, null, /* @__PURE__ */ u.createElement(
    "img",
    {
      src: l.src,
      alt: l.alt,
      onClick: () => r(!0),
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
      onClick: () => r(!1)
    },
    /* @__PURE__ */ u.createElement("img", { src: l.src, style: { maxWidth: "90%", maxHeight: "90%", objectFit: "contain" } })
  )) : null;
}
const q = ({ doc: n, className: t }) => {
  const { html: e, toc: r } = N(n);
  return n ? /* @__PURE__ */ u.createElement("div", { className: t }, /* @__PURE__ */ u.createElement("div", { className: "gdoc-content" }, e), r.length > 0 && /* @__PURE__ */ u.createElement("nav", { className: "gdoc-toc" }, /* @__PURE__ */ u.createElement("ul", null, r.map((l) => /* @__PURE__ */ u.createElement("li", { key: l.id, className: `gdoc-toc-level-${l.level}` }, /* @__PURE__ */ u.createElement("a", { href: `#${l.id}` }, l.text)))))) : null;
}, J = ({ doc: n, className: t }) => {
  const { html: e } = N(n);
  return n ? /* @__PURE__ */ u.createElement("div", { className: t }, e) : null;
};
export {
  J as GDocContent,
  Y as GDocScribe,
  q as GDocViewer,
  I as buildListTree,
  P as extractHeadings,
  w as getAlignmentStyle,
  D as getColorStyle,
  h as getDimensionStyle,
  v as getHeadingTag,
  A as getImageData,
  k as getListTagAndStyle,
  y as getParagraphText,
  L as getTextTags,
  R as parseInlineContent,
  b as processContent,
  C as slugify,
  N as useDocs
};
