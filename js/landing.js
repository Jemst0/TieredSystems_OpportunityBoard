/**
 * Tiered Systems · Landing page behaviour
 * Reads the same data source as the board (js/database.js) so numbers always match.
 */

(function () {
  const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;
  const EVENT_DAYS = [
    { day: 1, date: "2026-11-18", start: "2026-11-18T13:00:00+08:00", end: "2026-11-18T17:00:00+08:00", where: "on Zoom" },
    { day: 2, date: "2026-11-19", start: "2026-11-19T13:00:00+08:00", end: "2026-11-19T17:00:00+08:00", where: "at the 5th Floor STEER Hub" }
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function haversineKm(a, b) {
    const R = 6371;
    const toRad = d => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function manilaDateString(ms) {
    return new Date(ms + MANILA_OFFSET_MS).toISOString().slice(0, 10);
  }

  /* Nav border on scroll ------------------------------------------------- */
  function initNav() {
    const nav = document.getElementById("nav");
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Live event status ---------------------------------------------------- */
  function initEventStatus() {
    const statusEl = document.getElementById("event-status");
    const textEl = document.getElementById("event-status-text");

    function update() {
      const now = Date.now();
      const today = manilaDateString(now);
      let text = "";
      let state = "";

      const live = EVENT_DAYS.find(d => now >= Date.parse(d.start) && now < Date.parse(d.end));
      const next = EVENT_DAYS.find(d => now < Date.parse(d.start));

      if (live) {
        text = `Live now: Day ${live.day} ${live.where}, until 5:00 PM`;
        state = "is-live";
      } else if (next) {
        const tomorrow = manilaDateString(now + 24 * 60 * 60 * 1000);
        const when = next.date === today ? "today" : next.date === tomorrow ? "tomorrow" : next.day === 1 ? "Nov 18" : "Nov 19";
        text = `Day ${next.day} starts ${when} at 1:00 PM ${next.where}`;
        state = "is-soon";
      } else {
        text = "The event has ended. The Opportunity Board stays open.";
      }

      statusEl.classList.remove("is-live", "is-soon");
      if (state) statusEl.classList.add(state);
      textEl.textContent = text;

      // Day cards: badge + highlight the current session row
      EVENT_DAYS.forEach(d => {
        const card = document.getElementById(`day-${d.day}`);
        const badge = card.querySelector("[data-day-badge]");
        const isLive = live && live.day === d.day;
        const isDone = now >= Date.parse(d.end);
        const isToday = d.date === today;

        card.classList.toggle("is-today", isToday && !isDone);
        badge.classList.toggle("is-live", Boolean(isLive));
        if (isLive) { badge.hidden = false; badge.textContent = "Live now"; }
        else if (isToday && !isDone) { badge.hidden = false; badge.textContent = "Today"; }
        else if (isDone) { badge.hidden = false; badge.textContent = "Done"; badge.classList.remove("is-live"); }
        else { badge.hidden = true; }

        const rows = card.querySelectorAll(".timeline li");
        rows.forEach(r => r.classList.remove("is-now"));
        if (isLive) {
          const clock = new Date(now + MANILA_OFFSET_MS);
          const nowMin = clock.getUTCHours() * 60 + clock.getUTCMinutes();
          let current = null;
          rows.forEach(r => {
            const [h, m] = r.querySelector(".t").textContent.split(":").map(Number);
            const minutes = (h < 12 ? h + 12 : h) * 60 + m; // all sessions are PM
            if (minutes <= nowMin) current = r;
          });
          if (current) current.classList.add("is-now");
        }
      });
    }

    update();
    setInterval(update, 30 * 1000);
  }

  /* Tier tabs (WAI-ARIA tabs pattern) ------------------------------------ */
  function initTiers() {
    const tabs = Array.from(document.querySelectorAll(".tier-tab"));
    if (!tabs.length) return;

    function select(tab, focus) {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab, false));
      tab.addEventListener("keydown", e => {
        let target = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") target = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") target = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") target = tabs[0];
        if (e.key === "End") target = tabs[tabs.length - 1];
        if (target) { e.preventDefault(); select(target, true); }
      });
    });
  }

  /* Data-driven sections ------------------------------------------------- */
  function renderFacts(companies) {
    const hubs = new Set(companies.map(c => c.hub).filter(Boolean));
    document.getElementById("fact-partners").textContent = companies.length;
    document.getElementById("fact-hubs").textContent = hubs.size;
    document.getElementById("preview-count").textContent = `${companies.length} partners`;
  }

  function renderPreviewList(companies, origin) {
    const list = document.getElementById("preview-list");
    const nearest = companies
      .map(c => ({ c, km: haversineKm(origin, c) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 3);

    list.innerHTML = nearest
      .map(({ c, km }) => `
        <li class="preview-item">
          <span class="preview-name">${escapeHtml(c.name)}</span>
          <span class="preview-dist num">${km.toFixed(1)} km</span>
        </li>`)
      .join("");
  }

  function renderHubTable(companies) {
    const tbody = document.getElementById("hub-table");
    const groups = new Map();
    companies.forEach(c => {
      const key = c.hub || "Other";
      const g = groups.get(key) || { partners: 0, slots: 0 };
      g.partners += 1;
      g.slots += Number(c.slots) || 0;
      groups.set(key, g);
    });

    const rows = Array.from(groups.entries()).sort((a, b) => b[1].partners - a[1].partners || a[0].localeCompare(b[0]));
    const totalSlots = rows.reduce((s, [, g]) => s + g.slots, 0);

    tbody.innerHTML = rows
      .map(([hub, g]) => `
        <tr>
          <td>${escapeHtml(hub)}</td>
          <td class="t-right num">${g.partners}</td>
          <td class="t-right num">${g.slots}</td>
        </tr>`)
      .join("");

    const tfoot = document.createElement("tfoot");
    tfoot.innerHTML = `<tr><td>Total</td><td class="t-right num">${companies.length}</td><td class="t-right num">${totalSlots}</td></tr>`;
    tbody.parentElement.querySelector("tfoot")?.remove();
    tbody.parentElement.appendChild(tfoot);
  }

  function renderPreviewMap(companies, origin) {
    const skeleton = document.getElementById("map-skeleton");
    const done = () => skeleton.classList.add("is-done");

    if (!window.L) { done(); return; }

    const map = L.map("preview-map", {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      attributionControl: true
    });

    const base = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Esri", maxZoom: 16 }
    ).addTo(map);
    base.once("load", done);
    setTimeout(done, 4000); // never leave the skeleton up forever

    const pinIcon = L.divIcon({ className: "", html: '<div class="preview-pin"></div>', iconSize: [12, 12], iconAnchor: [6, 6] });
    const campusIcon = L.divIcon({ className: "", html: '<div class="preview-campus"></div>', iconSize: [12, 12], iconAnchor: [6, 6] });

    companies.forEach(c => L.marker([c.lat, c.lng], { icon: pinIcon, interactive: false, keyboard: false }).addTo(map));
    L.marker([origin.lat, origin.lng], { icon: campusIcon, interactive: false, keyboard: false }).addTo(map);

    const bounds = L.latLngBounds(companies.map(c => [c.lat, c.lng]).concat([[origin.lat, origin.lng]]));
    map.fitBounds(bounds, { padding: [24, 24] });

    window.addEventListener("resize", () => map.invalidateSize());
  }

  async function initData() {
    try {
      const { companies } = await window.DatabaseService.loadCompanies();
      const origin = window.CAMPUSES.alangilan;
      renderFacts(companies);
      renderPreviewList(companies, origin);
      renderHubTable(companies);
      renderPreviewMap(companies, origin);
    } catch (err) {
      document.getElementById("preview-list").innerHTML =
        '<li class="preview-item"><span class="preview-name">Couldn’t load partners. Open the board to retry.</span></li>';
      document.getElementById("map-skeleton").classList.add("is-done");
    }
  }

  /* Reveal on scroll ----------------------------------------------------- */
  function initReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const targets = document.querySelectorAll(".section-head, .tiers, .board-copy, .partner-table-wrap, .day, .faq-list, .closing-inner");
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    targets.forEach(t => { t.classList.add("reveal"); io.observe(t); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initEventStatus();
    initTiers();
    initReveal();
    initData();
  });
})();
