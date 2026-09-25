// Renders the article from docs/data/photos.json (source of truth).
// Layout rules: first included photo -> "hero"; aspect >= 2.0 -> "wide";
// otherwise standard column. Refine these + add a per-photo "layout" field later.
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
      const content = $("#content");
      content.innerHTML = "";

      // group into sections: use explicit section, else group by date
      const sections = [];
      for (const p of photos) {
        const key = p.section || p.date || "Photos";
        let sec = sections.find((s) => s.key === key);
        if (!sec) { sec = { key, photos: [] }; sections.push(sec); }
        sec.photos.push(p);
      }

      let heroDone = false;
      for (const sec of sections) {
        const head = document.createElement("div");
        head.className = "section-head";
        head.textContent = sec.key;
        const title = document.createElement("h2");
        title.className = "section-title";
        title.textContent = sectionTitle(sec.key);
        content.appendChild(head);
        content.appendChild(title);

        for (const p of sec.photos) {
          content.appendChild(figure(p, !heroDone));
          heroDone = true;
        }
      }
    })
    .catch((e) => {
      $("#content").innerHTML =
        '<p style="font-family:system-ui,sans-serif;color:#b3261e">' +
        "Could not load the story: " + escapeHtml(String(e)) + "</p>";
    });

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

  function sectionTitle(key) {
    // if the key looks like a date, present it nicely
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      const d = new Date(key + "T00:00:00");
      return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
    return key;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
    ));
  }
})();
