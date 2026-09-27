// Renders the article from docs/data/photos.json (source of truth).
//
// Two modes:
//   1) If data.story is a non-empty array, render it block by block:
//        { "type":"text",    "text":"..." }   -> a paragraph of commentary
//        { "type":"heading", "text":"..." }   -> a section heading
//        { "type":"photo",   "id":"t41" }     -> a figure (looked up by id)
//   2) Otherwise group the included photos by their "section" field
//      (never by date); photos with no section flow continuously.
(function () {
  const $ = (sel) => document.querySelector(sel);

  fetch("data/photos.json")
    .then((r) => {
      if (!r.ok) throw new Error("photos.json " + r.status);
      return r.json();
    })
    .then((data) => {
      if (data.title) $(".title").textContent = data.title;
      if (data.subtitle) $("#subtitle").textContent = data.subtitle;

      const lede = $("#lede");
      if (data.lede) lede.innerHTML = "<p>" + escapeHtml(data.lede) + "</p>";
      else lede.remove();

      const photos = (data.photos || []).filter((p) => p.include !== false);
      const byId = {};
      photos.forEach((p) => { byId[p.id] = p; });

      const content = $("#content");
      content.innerHTML = "";

      if (Array.isArray(data.story) && data.story.length) {
        renderStory(data.story, byId, content);
      } else {
        renderSections(photos, data.section_intros, content);
      }

      if (data.outro) {
        const div = document.createElement("div");
        div.className = "text-block outro";
        String(data.outro).split(/\n\s*\n/).forEach((par) => {
          const p = document.createElement("p");
          p.textContent = par.trim();
          if (p.textContent) div.appendChild(p);
        });
        content.appendChild(div);
      }
    })
    .catch((e) => {
      $("#content").innerHTML =
        '<p style="font-family:system-ui,sans-serif;color:#b3261e">' +
        "Could not load the story: " + escapeHtml(String(e)) + "</p>";
    });

  function renderStory(story, byId, content) {
    let heroDone = false;
    story.forEach((block) => {
      if (block.type === "text" && block.text) {
        const div = document.createElement("div");
        const isPlaceholder = block.text.trim().startsWith("[");
        div.className = isPlaceholder ? "text-block placeholder" : "text-block";
        String(block.text).split(/\n\s*\n/).forEach((par) => {
          const p = document.createElement("p");
          p.textContent = par.trim();
          if (p.textContent) div.appendChild(p);
        });
        content.appendChild(div);
      } else if (block.type === "heading" && block.text) {
        const h = document.createElement("h2");
        h.className = "section-title";
        h.textContent = block.text;
        content.appendChild(h);
      } else if (block.type === "photo" && byId[block.id]) {
        content.appendChild(figure(byId[block.id], !heroDone));
        heroDone = true;
      }
    });
  }

  function renderSections(photos, intros, content) {
    const sections = [];
    for (const p of photos) {
      const key = p.section || "";
      let sec = sections.find((s) => s.key === key);
      if (!sec) { sec = { key, photos: [] }; sections.push(sec); }
      sec.photos.push(p);
    }
    let heroDone = false;
    for (const sec of sections) {
      if (sec.key) {
        const head = document.createElement("div");
        head.className = "section-head";
        head.textContent = sec.key;
        const title = document.createElement("h2");
        title.className = "section-title";
        title.textContent = sec.key;
        content.appendChild(head);
        content.appendChild(title);

        const intro = intros && intros[sec.key];
        if (intro) {
          const div = document.createElement("div");
          div.className = "section-intro";
          String(intro).split(/\n\s*\n/).forEach((par) => {
            const p = document.createElement("p");
            p.textContent = par.trim();
            if (p.textContent) div.appendChild(p);
          });
          content.appendChild(div);
        }
      }
      for (const p of sec.photos) {
        content.appendChild(figure(p, !heroDone));
        heroDone = true;
      }
    }
  }

  function figure(p, isFirst) {
    const fig = document.createElement("figure");
    const aspect = p.aspect || 1.33;

    const explicit = p.layout && p.layout !== "auto" ? p.layout : "";
    if (explicit) fig.className = explicit;
    else if (isFirst) fig.className = "hero";
    else if (aspect >= 2.0) fig.className = "wide";
    else fig.className = "standard";

    const img = document.createElement("img");
    img.src = "assets/photos/" + encodeURIComponent(p.filename);
    img.alt = p.caption || p.filename;
    img.loading = "lazy";
    fig.appendChild(img);

    const cap = document.createElement("figcaption");
    let html = escapeHtml(p.caption || p.filename);
    if (p.tags && p.tags.length) {
      html += " " + p.tags.map((t) => '<span class="tag">' + escapeHtml(t) + "</span>").join("");
    }
    cap.innerHTML = html;
    fig.appendChild(cap);
    return fig;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }
})();
