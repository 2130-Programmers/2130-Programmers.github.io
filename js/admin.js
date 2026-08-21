// Admin page: loads data.json (or a picked file), lets you edit everything
// in-browser, and lets you download the updated data.json to commit back
// to the repo. Nothing here writes to disk or to GitHub automatically.

let data = {
  team: { name: "", tagline: "", about: "" },
  robots: [],
  subteams: [],
};

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "text") node.textContent = value;
    else if (key === "class") node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) {
    if (child) node.appendChild(child);
  }
  return node;
}

function slugify(str) {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function showStatus(message, kind) {
  const banner = document.getElementById("status-banner");
  banner.textContent = message;
  banner.className = `show ${kind}`;
}

function renderTeam() {
  document.getElementById("team-name-input").value = data.team.name || "";
  document.getElementById("team-tagline-input").value = data.team.tagline || "";
  document.getElementById("team-about-input").value = data.team.about || "";
  document.getElementById("team-logo-input").value = data.team.logo || "";
  document.getElementById("team-accent-input").value = data.team.accentColor || "#0969da";

  const preview = document.getElementById("team-logo-preview");
  preview.src = data.team.logo || "";
  preview.style.display = data.team.logo ? "block" : "none";
  if (data.team.accentColor) {
    document.documentElement.style.setProperty("--accent", data.team.accentColor);
  }
}

function bindTeamInputs() {
  document.getElementById("team-name-input").oninput = (e) => {
    data.team.name = e.target.value;
  };
  document.getElementById("team-tagline-input").oninput = (e) => {
    data.team.tagline = e.target.value;
  };
  document.getElementById("team-about-input").oninput = (e) => {
    data.team.about = e.target.value;
  };
  document.getElementById("team-logo-input").oninput = (e) => {
    data.team.logo = e.target.value;
    const preview = document.getElementById("team-logo-preview");
    preview.src = e.target.value;
    preview.style.display = e.target.value ? "block" : "none";
  };
  document.getElementById("team-logo-file").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const suggested = `images/${file.name}`;
    data.team.logo = suggested;
    document.getElementById("team-logo-input").value = suggested;
    const preview = document.getElementById("team-logo-preview");
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  };
  document.getElementById("team-accent-input").oninput = (e) => {
    data.team.accentColor = e.target.value;
    document.documentElement.style.setProperty("--accent", e.target.value);
  };
}

function renderRobots() {
  const container = document.getElementById("robots-editor");
  container.innerHTML = "";
  data.robots.forEach((robot, index) => {
    const fs = el("fieldset");
    fs.appendChild(
      el("div", { class: "admin-item-header" }, [
        el("legend", { text: `Robot #${index + 1}` }),
        el("button", { class: "danger", type: "button", text: "Remove robot" }),
      ])
    );
    fs.querySelector("button.danger").onclick = () => {
      data.robots.splice(index, 1);
      renderRobots();
    };

    const nameInput = el("input", { type: "text", value: robot.name || "" });
    nameInput.oninput = (e) => (robot.name = e.target.value);

    const idInput = el("input", { type: "text", value: robot.id || "" });
    idInput.oninput = (e) => (robot.id = slugify(e.target.value) || e.target.value);
    idInput.onblur = () => {
      if (!robot.id) robot.id = slugify(robot.name) || `robot-${index}`;
      idInput.value = robot.id;
    };

    const yearInput = el("input", { type: "number", value: robot.year || "" });
    yearInput.oninput = (e) => (robot.year = e.target.value ? Number(e.target.value) : "");

    const githubInput = el("input", { type: "url", value: robot.github || "", placeholder: "https://github.com/..." });
    githubInput.oninput = (e) => (robot.github = e.target.value);

    const imageInput = el("input", { type: "text", value: robot.image || "", placeholder: "images/my-robot.jpg" });
    imageInput.oninput = (e) => (robot.image = e.target.value);

    const imageFile = el("input", { type: "file", accept: "image/*" });
    const preview = el("img", { class: "image-preview" });
    if (robot.image) preview.src = robot.image;
    imageFile.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const suggested = `images/${file.name}`;
      imageInput.value = suggested;
      robot.image = suggested;
      preview.src = URL.createObjectURL(file);
    };

    const descInput = el("textarea", { text: robot.description || "" });
    descInput.oninput = (e) => (robot.description = e.target.value);

    fs.appendChild(
      el("div", { class: "field-row" }, [
        el("div", { class: "field" }, [el("label", { text: "Name" }), nameInput]),
        el("div", { class: "field" }, [el("label", { text: "Year" }), yearInput]),
      ])
    );
    fs.appendChild(el("div", { class: "field" }, [el("label", { text: "ID (used in URLs, auto-filled from name)" }), idInput]));
    fs.appendChild(el("div", { class: "field" }, [el("label", { text: "GitHub link" }), githubInput]));
    fs.appendChild(
      el("div", { class: "field" }, [
        el("label", { text: "Image path" }),
        imageInput,
        el("div", { class: "help-text", text: "Copy the image file into the images/ folder in your repo, then point this at it. Or pick a file below to auto-fill the path and preview it (the file itself still needs to be copied into images/ manually)." }),
        imageFile,
        preview,
      ])
    );
    fs.appendChild(el("div", { class: "field" }, [el("label", { text: "Description" }), descInput]));

    container.appendChild(fs);
  });
}

function renderSubteams() {
  const container = document.getElementById("subteams-editor");
  container.innerHTML = "";
  data.subteams.forEach((team, index) => {
    const fs = el("fieldset");
    fs.appendChild(
      el("div", { class: "admin-item-header" }, [
        el("legend", { text: `Subteam #${index + 1}` }),
        el("button", { class: "danger", type: "button", text: "Remove subteam" }),
      ])
    );
    fs.querySelector("button.danger").onclick = () => {
      data.subteams.splice(index, 1);
      renderSubteams();
    };

    const nameInput = el("input", { type: "text", value: team.name || "" });
    nameInput.oninput = (e) => (team.name = e.target.value);

    const idInput = el("input", { type: "text", value: team.id || "" });
    idInput.oninput = (e) => (team.id = slugify(e.target.value) || e.target.value);
    idInput.onblur = () => {
      if (!team.id) team.id = slugify(team.name) || `subteam-${index}`;
      idInput.value = team.id;
    };

    const descInput = el("textarea", { text: team.description || "" });
    descInput.oninput = (e) => (team.description = e.target.value);

    fs.appendChild(
      el("div", { class: "field-row" }, [
        el("div", { class: "field" }, [el("label", { text: "Name" }), nameInput]),
        el("div", { class: "field" }, [el("label", { text: "ID (used in URLs)" }), idInput]),
      ])
    );
    fs.appendChild(el("div", { class: "field" }, [el("label", { text: "Description" }), descInput]));

    const resourcesWrap = el("div", { class: "field" }, [el("label", { text: "Resources" })]);
    if (!team.resources) team.resources = [];
    team.resources.forEach((res, rIndex) => {
      const labelInput = el("input", { type: "text", value: res.label || "", placeholder: "Label" });
      labelInput.oninput = (e) => (res.label = e.target.value);
      const urlInput = el("input", { type: "url", value: res.url || "", placeholder: "https://..." });
      urlInput.oninput = (e) => (res.url = e.target.value);
      const removeBtn = el("button", { type: "button", text: "Remove" });
      removeBtn.onclick = () => {
        team.resources.splice(rIndex, 1);
        renderSubteams();
      };
      resourcesWrap.appendChild(el("div", { class: "resource-row" }, [labelInput, urlInput, removeBtn]));
    });
    const addResourceBtn = el("button", { type: "button", text: "+ Add resource link" });
    addResourceBtn.onclick = () => {
      team.resources.push({ label: "", url: "" });
      renderSubteams();
    };
    resourcesWrap.appendChild(addResourceBtn);
    fs.appendChild(resourcesWrap);

    container.appendChild(fs);
  });
}

function renderAll() {
  renderTeam();
  bindTeamInputs();
  renderRobots();
  renderSubteams();
}

function downloadData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, download: "data.json" });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showStatus("data.json downloaded. Replace the file in your repo and commit it.", "ok");
}

async function init() {
  document.getElementById("add-robot").onclick = () => {
    data.robots.push({ id: "", name: "", year: "", github: "", image: "", description: "" });
    renderRobots();
  };
  document.getElementById("add-subteam").onclick = () => {
    data.subteams.push({ id: "", name: "", description: "", resources: [] });
    renderSubteams();
  };
  document.getElementById("download-json").onclick = downloadData;
  document.getElementById("load-file").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        data = JSON.parse(reader.result);
        if (!data.robots) data.robots = [];
        if (!data.subteams) data.subteams = [];
        if (!data.team) data.team = { name: "", tagline: "", about: "" };
        renderAll();
        showStatus(`Loaded ${file.name}.`, "ok");
      } catch (err) {
        showStatus("That file isn't valid JSON.", "info");
      }
    };
    reader.readAsText(file);
  };

  try {
    const res = await fetch("data.json", { cache: "no-store" });
    if (!res.ok) throw new Error();
    data = await res.json();
    if (!data.robots) data.robots = [];
    if (!data.subteams) data.subteams = [];
    if (!data.team) data.team = { name: "", tagline: "", about: "" };
    showStatus("Loaded data.json.", "ok");
  } catch (err) {
    showStatus(
      "Couldn't auto-load data.json (this happens when opening this file directly instead of through a server). Use \"Load a data.json file\" above to pick it manually, or just start adding entries and download when done.",
      "info"
    );
  }
  renderAll();
}

document.addEventListener("DOMContentLoaded", init);
