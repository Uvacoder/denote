import { AMP, GT, LT, mapValues, QUOT, tag as h } from "./deps.ts";
import { getDenoteCss } from "./css_functions.ts";

import { ConfigObject, ListGroup, ListItem } from "./types.ts";

export const DENOTE_LOGO =
  "https://raw.githubusercontent.com/kawarimidoll/denote/main/logo.svg";

export function sanitize(str?: string): string {
  return (str || "")
    .replaceAll("&", AMP)
    .replaceAll("<", LT)
    .replaceAll(">", GT)
    .replaceAll(`"`, QUOT);
}

export function loadConfig(config: Partial<ConfigObject>): ConfigObject {
  config.name ||= "Your name will be here";

  if (!config.list || Object.keys(config.list).length === 0) {
    throw new Error("list is empty");
  }
  const name = sanitize(config.name);
  const description = sanitize(config.description);
  const image = encodeURI(config.image || "");
  const favicon = encodeURI(config.favicon || DENOTE_LOGO);
  const twitter = config.twitter?.replace(/^([^@])/, "@$1");
  const list = mapValues(
    config.list,
    (group: ListGroup) => ({
      icon: group.icon,
      items: group.items.map((item) => ({
        icon: item.icon,
        text: sanitize(item.text),
        link: item.link ? encodeURI(item.link) : "",
      })),
    }),
  );
  return {
    name,
    description,
    image,
    favicon,
    twitter,
    disable: (config.disable || []),
    list,
  } as ConfigObject;
}

export function icongram(name: string, size = 20, attrs = {}) {
  const regex =
    /^(clarity|devicon|entypo|feather|fontawesome|jam|material|octicons|simple)\/[\w-]+$/;
  if (!regex.test(name)) {
    throw new Error(
      `invalid icon name: ${name}, icon name should be matched with ${regex}`,
    );
  }

  return h("img", {
    src: `https://icongr.am/${name}.svg?size=${size}&color=f0ffff`,
    alt: name,
    ...attrs,
  });
}

const exLink = icongram("feather/external-link", 12, { class: "ex-link" });
export function renderListItem(listItem: ListItem) {
  const { icon, text, link: href } = listItem;

  const iconText = (icon = "", text = "") =>
    h(
      "div",
      { class: "list-item" },
      icon ? icongram(icon) : "",
      text ? h("div", text) : "",
    );

  return href
    ? h("a", { href }, iconText(icon, text + exLink))
    : iconText(icon, text);
}

const rainCount = 30;

export function renderHtmlHead(config: ConfigObject) {
  const { name, description, image, favicon, twitter } = config;
  const url = `https://denote.deno.dev/${name}`;
  const viewport = "width=device-width,initial-scale=1.0";
  const title = `${name} | Denote`;

  return h(
    "head",
    { prefix: "og:http://ogp.me/ns#" },
    h("meta", { charset: "utf-8" }),
    h("meta", { name: "viewport", content: viewport }),
    h("meta", { name: "description", content: description }),
    h("meta", { property: "og:title", content: title }),
    h("meta", { property: "og:description", content: description }),
    h("meta", { property: "og:url", content: url }),
    h("meta", { property: "og:type", content: "profile" }),
    h("meta", { property: "og:site_name", content: "Denote" }),
    image ? h("meta", { property: "og:image", content: image }) : "",
    h("meta", { name: "twitter:card", content: "summary" }),
    twitter ? h("meta", { name: "twitter:site", content: twitter }) : "",
    h("title", title),
    h("style", getDenoteCss(rainCount)),
    h("link", { rel: "icon", href: favicon }),
    h("link", { rel: "canonical", href: url }),
  );
}

export function renderHtmlBody(config: ConfigObject) {
  const { name, description, image } = config;
  const list = Object.entries(config.list);
  const alt = `${name} main image`;

  return h(
    "body",
    h("div", { class: "rain" }, h("div", { class: "drop" }).repeat(rainCount)),
    h(
      "div",
      { id: "main" },
      image ? h("img", { alt, class: "main-image", src: image }) : "",
      h("h1", name),
      description ? h("div", { class: "description" }, description) : "",
      h("div", "Click to jump..."),
      h(
        "div",
        { class: "nav-box" },
        h(
          "div",
          { class: "nav" },
          ...list.map(([id, { icon }]) =>
            h("a", { href: `#${id}` }, icongram(icon, 26))
          ),
        ),
      ),
      h(
        "div",
        { class: "list-group" },
        ...list.map(([id, { icon, items }]) =>
          h("h2", { id }, icongram(icon, 40)) +
          items.map((listItem) => renderListItem(listItem)).join("")
        ),
      ),
      h(
        "footer",
        h("a", { href: "https://github.com/kawarimidoll/denote" }, "Denote"),
        exLink,
        icongram("jam/heart-f", 18, { class: "inline" }),
        h("a", { href: "https://deno.com/deploy" }, "Deno Deploy"),
        exLink,
      ),
    ),
  );
}

export function renderHtml(rawConfig: ConfigObject, debug = false) {
  const config = loadConfig(rawConfig);
  if (debug) {
    console.log(config);
  }
  return "<!DOCTYPE html>" +
    h("html", renderHtmlHead(config), renderHtmlBody(config));
}
