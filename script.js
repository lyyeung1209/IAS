document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
      navLinks.classList.toggle("is-open", !isOpen);
    });

    navLinks.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        navLinks.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
        navLinks.classList.remove("is-open");
        menuToggle.focus();
      }
    });
  }

  const agentCards = Array.from(document.querySelectorAll("[data-agent-card]"));
  const agentSearch = document.querySelector("[data-agent-search]");
  const agentFilter = document.querySelector("[data-agent-filter]");
  const agentCount = document.querySelector("[data-agent-count]");
  const agentEmpty = document.querySelector("[data-agent-empty]");

  function filterAgents() {
    if (!agentCards.length || !agentSearch || !agentFilter) return;
    const query = agentSearch.value.trim().toLocaleLowerCase();
    const rating = agentFilter.value;
    let visibleCount = 0;

    agentCards.forEach((card) => {
      const matchesQuery = card.dataset.search.toLocaleLowerCase().includes(query);
      const matchesRating = rating === "all" || card.dataset.rating === rating;
      const isVisible = matchesQuery && matchesRating;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (agentCount) agentCount.textContent = `Showing ${visibleCount} sample agents`;
    if (agentEmpty) agentEmpty.hidden = visibleCount > 0;
  }

  if (agentSearch && agentFilter) {
    agentSearch.addEventListener("input", filterAgents);
    agentFilter.addEventListener("change", filterAgents);
  }

  const reportAgentInput = document.querySelector("[data-report-agent-input]");
  document.querySelectorAll("[data-report-agent]").forEach((link) => {
    link.addEventListener("click", () => {
      if (reportAgentInput) reportAgentInput.value = link.dataset.reportAgent;
    });
  });

  const demoForm = document.querySelector("[data-demo-form]");
  const formStatus = document.querySelector("[data-form-status]");
  if (demoForm && formStatus) {
    demoForm.addEventListener("submit", (event) => {
      event.preventDefault();
      demoForm.reset();
      formStatus.textContent = "Demo complete: your message and file were not sent or saved.";
    });
  }

  const canvases = document.querySelectorAll("canvas[data-chart]");
  if (!canvases.length) return;

  const colors = {
    grid: "rgba(151, 177, 201, 0.13)",
    label: "#71879c",
    cyan: "#66e4dc",
    blue: "#80aaff",
    green: "#8be0b3",
    purple: "#ba9cff"
  };
  const clusterGroups = [
    { color: colors.cyan, points: [[.2,.34],[.24,.46],[.28,.39],[.32,.52],[.35,.35],[.39,.44],[.26,.59],[.42,.3]] },
    { color: colors.blue, points: [[.58,.65],[.63,.72],[.68,.58],[.72,.68],[.76,.55],[.64,.52],[.8,.74],[.71,.82]] },
    { color: colors.purple, points: [[.49,.18],[.55,.28],[.61,.2],[.67,.33],[.45,.31],[.59,.41],[.73,.27]] }
  ];
  const regressionPoints = [[.1,.78],[.17,.65],[.23,.7],[.3,.52],[.37,.64],[.42,.48],[.5,.51],[.56,.34],[.62,.45],[.69,.29],[.76,.37],[.83,.21],[.9,.26]];

  function drawChart(canvas) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const width = rect.width;
    const height = rect.height;
    const pad = { left: 28, right: 11, top: 13, bottom: 23 };
    const plotWidth = width - pad.left - pad.right;
    const plotHeight = height - pad.top - pad.bottom;
    const px = (value) => pad.left + value * plotWidth;
    const py = (value) => pad.top + (1 - value) * plotHeight;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.font = "8px 'DM Mono', monospace";
    ctx.fillStyle = colors.label;
    ctx.strokeStyle = colors.grid;
    for (let i = 0; i <= 4; i += 1) {
      const y = pad.top + (plotHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(width - pad.right, y);
      ctx.stroke();
      ctx.fillText(String(100 - i * 25), 2, y + 3);
    }
    for (let i = 0; i <= 4; i += 1) {
      const x = pad.left + (plotWidth / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, height - pad.bottom);
      ctx.stroke();
      ctx.fillText(String(i * 25), x - 5, height - 7);
    }

    if (canvas.dataset.chart === "clusters") {
      for (const group of clusterGroups) {
        ctx.fillStyle = group.color;
        for (const [x, y] of group.points) {
          ctx.beginPath();
          ctx.arc(px(x), py(y), 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      ctx.strokeStyle = "rgba(102, 228, 220, .75)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(px(.08), py(.82));
      ctx.lineTo(px(.94), py(.2));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.blue;
      for (const [x, y] of regressionPoints) {
        ctx.beginPath();
        ctx.arc(px(x), py(y), 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  canvases.forEach(drawChart);
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => drawChart(entry.target));
    });
    canvases.forEach((canvas) => observer.observe(canvas));
  }
  window.addEventListener("resize", () => canvases.forEach(drawChart));
});
