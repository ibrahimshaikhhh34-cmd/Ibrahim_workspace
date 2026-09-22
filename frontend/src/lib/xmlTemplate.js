const humanize = (s) =>
  s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_\-]/g, " ").replace(/^\w/, (c) => c.toUpperCase());

const walk = (el, path, fields, counter) => {
  const tag = el.tagName;
  const idx = counter[tag] === undefined ? (counter[tag] = 0) : ++counter[tag];
  const here = path ? `${path}/${tag}[${idx}]` : `${tag}[${idx}]`;
  const nameAttr = el.getAttribute("Name") || el.getAttribute("Id") || el.getAttribute("name");
  const groupLabel = path ? `${tag}${nameAttr && el.children.length ? ` · ${nameAttr}` : ""}` : tag;

  for (const attr of Array.from(el.attributes)) {
    fields.push({
      id: `${here}@${attr.name}`,
      path: here,
      attr: attr.name,
      label: `${humanize(attr.name)}`,
      group: groupLabel,
      value: attr.value,
      type: /^-?\d+(\.\d+)?$/.test(attr.value) ? "number" : /^(true|false)$/i.test(attr.value) ? "boolean" : "text",
    });
  }
  const textOnly = el.children.length === 0 && el.textContent.trim();
  if (textOnly) {
    fields.push({ id: `${here}#text`, path: here, attr: null, label: humanize(tag), group: groupLabel, value: el.textContent.trim(), type: "text" });
  }
  const childCounter = {};
  for (const child of Array.from(el.children)) walk(child, here, fields, childCounter);
};

export const parseTemplate = (xml) => {
  const doc = new DOMParser().parseFromString(xml.trim(), "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error(err.textContent.split("\n")[0] || "Invalid XML");
  const fields = [];
  walk(doc.documentElement, "", fields, {});
  return { root: doc.documentElement.tagName, fields };
};

const resolve = (doc, path) => {
  let node = doc;
  for (const seg of path.split("/")) {
    const [, tag, idx] = seg.match(/^(.+)\[(\d+)\]$/);
    node = Array.from(node.children).filter((c) => c.tagName === tag)[Number(idx)];
    if (!node) return null;
  }
  return node;
};

const indent = (node, level, out) => {
  const pad = "  ".repeat(level);
  const attrs = Array.from(node.attributes).map((a) => ` ${a.name}="${a.value.replace(/"/g, "&quot;")}"`).join("");
  if (node.children.length === 0) {
    const text = node.textContent.trim();
    out.push(text ? `${pad}<${node.tagName}${attrs}>${text}</${node.tagName}>` : `${pad}<${node.tagName}${attrs} />`);
    return;
  }
  out.push(`${pad}<${node.tagName}${attrs}>`);
  for (const c of Array.from(node.children)) indent(c, level + 1, out);
  out.push(`${pad}</${node.tagName}>`);
};

export const generateXml = (xml, values) => {
  const doc = new DOMParser().parseFromString(xml.trim(), "application/xml");
  for (const [id, value] of Object.entries(values)) {
    const [path, rest] = id.includes("@") ? id.split("@") : id.split("#");
    const node = resolve(doc, path);
    if (!node) continue;
    if (id.includes("@")) node.setAttribute(rest, value);
    else node.textContent = value;
  }
  const out = [];
  indent(doc.documentElement, 0, out);
  return out.join("\n");
};

export const PRESETS = {
  Creature: `<Template Name="FrostWolf" InheritanceParent="Wolf">
  <Component Name="Body" Mass="60" Density="1" Speed="5.5" />
  <Component Name="Health" MaxHealth="15" AttackResilience="2" FallResilience="2" FireResilience="1" />
  <Component Name="Model" ModelName="Models/FrostWolf" TextureName="Textures/Creatures/FrostWolf" BoundingBoxSize="0.6,0.9,1.4" />
  <Component Name="Creature" DisplayName="Frost Wolf" Category="Land Predator" />
</Template>`,
  Item: `<Item Id="600" Name="Crystal Shard" Description="A sharp shard of frozen crystal." Texture="Textures/Items/CrystalShard" Icon="Icons/CrystalShard" MaxStacking="40" NutritionalValue="0" />`,
  Block: `<Block Id="601" Name="Frost Stone" Description="Cold stone from the northern peaks." Texture="Textures/Blocks/FrostStone" IsTransparent="false" DigResilience="4" ExplosionResilience="10" DefaultDropCount="1" />`,
  Weapon: `<Item Id="602" Name="Ice Blade" Description="A blade of pure ice." Model="Models/IceBlade" Texture="Textures/Items/IceBlade" Icon="Icons/IceBlade" MeleePower="6" MeleeHitProbability="0.7" Durability="180" MaxStacking="1" />`,
};
