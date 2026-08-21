// Loads data.json and renders the sidebar + whichever page we're on.
// Every public page reads from the same data.json, so editing that one
// file (via admin.html) updates the whole site.

async function loadData() {
  const res = await fetch("data.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load data.json");
  return res.json();
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child) node.appendChild(child);
  }
  return node;
}

function applyBranding(data) {
  document.title = document.title.replace("Team Wiki", data.team.name || "Team Wiki");
  if (data.team.accentColor) {
    document.documentElement.style.setProperty("--accent", data.team.accentColor);
  }
  if (data.team.logo) {
    const favicon = el("link", { rel: "icon", href: data.team.logo });
    document.head.appendChild(favicon);
  }
}

function buildSidebar(data) {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  const brand = el("div", { class: "brand" });
  if (data.team.logo) {
    const logoImg = el("img", { src: data.team.logo, alt: `${data.team.name || "Team"} logo` });
    logoImg.onerror = () => logoImg.remove();
    brand.appendChild(logoImg);
  }
  const title = el("div", { class: "site-title" }, [
    el("a", { href: "index.html", text: data.team.name || "Team Wiki" }),
  ]);
  brand.appendChild(title);
  sidebar.appendChild(brand);

  const homeList = el("ul", {}, [
    el("li", {}, [el("a", { href: "index.html", text: "Home" })]),
  ]);
  sidebar.appendChild(homeList);

  // Robots
  sidebar.appendChild(el("h2", { text: "Robots" }));
  const robotTop = el("ul", {}, [
    el("li", {}, [el("a", { href: "robots.html", text: "All Robots" })]),
  ]);
  sidebar.appendChild(robotTop);
  if (data.robots && data.robots.length) {
    const sub = el(
      "ul",
      { class: "sub-list" },
      data.robots.map((r) =>
        el("li", {}, [
          el("a", { href: `robots.html#${r.id}`, text: r.name }),
        ])
      )
    );
    sidebar.appendChild(sub);
  }

  // Subteams
  sidebar.appendChild(el("h2", { text: "Subteams" }));
  const subTop = el("ul", {}, [
    el("li", {}, [el("a", { href: "subteams.html", text: "All Subteams" })]),
  ]);
  sidebar.appendChild(subTop);
  if (data.subteams && data.subteams.length) {
    const sub = el(
      "ul",
      { class: "sub-list" },
      data.subteams.map((s) =>
        el("li", {}, [
          el("a", { href: `subteams.html#${s.id}`, text: s.name }),
        ])
      )
    );
    sidebar.appendChild(sub);
  }

  sidebar.appendChild(
    el("div", { class: "admin-link" }, [
      el("a", { href: "admin.html", text: "Edit this wiki \u2192" }),
    ])
  );
}

function renderHome(data) {
  const nameEl = document.getElementById("team-name");
  const tagEl = document.getElementById("team-tagline");
  const aboutEl = document.getElementById("team-about");
  if (nameEl) nameEl.textContent = data.team.name || "Team Wiki";
  if (tagEl) tagEl.textContent = data.team.tagline || "";
  if (aboutEl) aboutEl.textContent = data.team.about || "";
}

function renderRobots(data) {
  const list = document.getElementById("robot-list");
  if (!list) return;
  if (!data.robots || !data.robots.length) {
    list.appendChild(
      el("p", { class: "empty-state", text: "No robots added yet." })
    );
    return;
  }
  data.robots.forEach((r) => {
    const body = el("div", { class: "entry-body" }, [
      r.image ? el("img", { src: r.image, alt: r.name }) : null,
      el("div", { class: "entry-text" }, [
        el("p", { text: r.description || "" }),
        r.github
          ? el("p", {}, [
              el("a", { href: r.github, target: "_blank", rel: "noopener", text: "View on GitHub \u2192" }),
            ])
          : null,
      ]),
    ]);
    const section = el("section", { id: r.id }, [
      el("h2", { text: r.name }),
      el("div", { class: "meta", text: r.year ? String(r.year) : "" }),
      body,
    ]);
    list.appendChild(section);
  });
}

function renderSubteams(data) {
  const list = document.getElementById("subteam-list");
  if (!list) return;
  if (!data.subteams || !data.subteams.length) {
    list.appendChild(
      el("p", { class: "empty-state", text: "No subteams added yet." })
    );
    return;
  }
  data.subteams.forEach((s) => {
    const resources =
      s.resources && s.resources.length
        ? el(
            "ul",
            { class: "resource-list" },
            s.resources.map((r) =>
              el("li", {}, [
                el("a", { href: r.url, target: "_blank", rel: "noopener", text: r.label }),
              ])
            )
          )
        : null;
    const section = el("section", { id: s.id }, [
      el("h2", { text: s.name }),
      el("p", { text: s.description || "" }),
      resources,
    ]);
    list.appendChild(section);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.page;
  try {
    const data = await loadData();
    applyBranding(data);
    buildSidebar(data);
    if (page === "home") renderHome(data);
    if (page === "robots") renderRobots(data);
    if (page === "subteams") renderSubteams(data);
  } catch (err) {
    const content = document.querySelector(".content");
    if (content) {
      content.innerHTML =
        "<p class='empty-state'>Couldn't load data.json. If you're opening this file directly from disk, run a local server (e.g. <code>python3 -m http.server</code>) instead.</p>";
    }
    console.error(err);
  }
});
