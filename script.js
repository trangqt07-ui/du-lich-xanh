(() => {
  const chapters = [...document.querySelectorAll(".chapter")];
  const stage = document.querySelector("#book-stage");
  const shell = document.querySelector(".book-shell");
  const pages = document.querySelector(".book-pages");
  const toolbar = document.querySelector(".book-toolbar");
  const previous = document.querySelector("#previous-page");
  const next = document.querySelector("#next-page");
  const zoom = document.querySelector("#zoom-page");
  const links = [...document.querySelectorAll(".site-header nav a")];
  const labels = ["Giới thiệu", "Làng Sen quê Bác", "Cửa Lò bến nhớ", "Dấu ấn Sông Lam", "Ví Dặm tình ca"];
  const paper = ["#fff7e9", "#895015", "#bddedc", "#fae7c6", "#779a47"];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const PAGE_WIDTH = 1120;
  const PAGE_HEIGHT = 1400;
  let current = 0;
  let busy = false;
  let queued = null;
  let zoomed = false;
  let animation = null;
  let layoutPending = false;
  let swipe = null;

  function indexForHash(hash) {
    if (!hash || hash === "#dau-trang") return 0;
    if (hash === "#bo-suu-tap") return 1;
    return chapters.findIndex(chapter => "#" + chapter.id === hash);
  }

  const leaves = chapters.map((chapter, index) => {
    const leaf = document.createElement("div");
    leaf.className = "book-leaf";
    leaf.setAttribute("role", "group");
    leaf.setAttribute("aria-label", "Trang " + (index + 1) + " / " + chapters.length + ": " + labels[index]);
    leaf.style.setProperty("--page-paper", paper[index]);
    const face = document.createElement("div");
    face.className = "book-face";
    const back = document.createElement("div");
    back.className = "book-page-back";
    back.setAttribute("aria-hidden", "true");
    chapter.before(leaf);
    face.append(chapter);
    leaf.append(face, back);
    leaf.hidden = true;
    for (const image of chapter.querySelectorAll("img")) {
      image.draggable = false;
      image.addEventListener("load", scheduleLayout);
    }
    return leaf;
  });

  function fitChapter(index) {
    const leaf = leaves[index];
    const chapter = chapters[index];
    const hidden = leaf.hidden;
    if (hidden) {
      leaf.style.visibility = "hidden";
      leaf.hidden = false;
    }
    const height = Math.max(chapter.offsetHeight, PAGE_HEIGHT);
    const scale = Math.min(1, PAGE_HEIGHT / height);
    const left = (PAGE_WIDTH - PAGE_WIDTH * scale) / 2;
    chapter.style.transform = "translateX(" + left + "px) scale(" + scale + ")";
    if (hidden) {
      leaf.hidden = true;
      leaf.style.removeProperty("visibility");
    }
  }

  function layout() {
    layoutPending = false;
    const style = getComputedStyle(stage);
    const width = Math.max(1, stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
    const height = Math.max(1, stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom));
    const fit = Math.min(width / PAGE_WIDTH, height / PAGE_HEIGHT, 1);
    const scale = zoomed ? Math.min(2, Math.max(fit * 1.85, .85)) : fit;
    shell.style.setProperty("--book-scale", scale);
    shell.style.setProperty("--book-width", PAGE_WIDTH * scale + "px");
    shell.style.setProperty("--book-height", PAGE_HEIGHT * scale + "px");
    fitChapter(current);
  }

  function scheduleLayout() {
    if (!layoutPending) {
      layoutPending = true;
      requestAnimationFrame(layout);
    }
  }

  function updateControls() {
    previous.disabled = busy || current === 0;
    next.disabled = busy || current === chapters.length - 1;
    document.querySelector("#page-title").textContent = labels[current];
    document.querySelector("#page-number").textContent = (current + 1) + " / " + chapters.length;
    for (const link of links) {
      if (link.hash === "#" + chapters[current].id) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
  }

  function showOnly(index) {
    leaves.forEach((leaf, i) => {
      leaf.hidden = i !== index;
      leaf.inert = i !== index;
      leaf.setAttribute("aria-hidden", String(i !== index));
      leaf.style.zIndex = i === index ? "1" : "";
    });
  }

  async function preparePage(index) {
    const images = [...chapters[index].querySelectorAll("img")];
    await Promise.all(images.map(image => {
      image.loading = "eager";
      return image.decode().catch(() => {});
    }));
    fitChapter(index);
  }

  function setZoom(value) {
    zoomed = value;
    stage.classList.toggle("is-zoomed", value);
    zoom.setAttribute("aria-pressed", String(value));
    zoom.querySelector("span").textContent = value ? "Vừa trang" : "Phóng to";
    document.querySelector(".turn-hint").textContent = value ? "Kéo để xem nội dung trang" : "Vuốt hoặc dùng phím ← → để lật trang";
    layout();
    stage.scrollTo({ left: value ? Math.max(0, (shell.offsetWidth - stage.clientWidth) / 2) : 0, top: 0, behavior: "instant" });
  }

  async function turnTo(index, { history = true, animate = true } = {}) {
    if (index < 0 || index >= chapters.length) return;
    if (busy) {
      queued = { index, options: { history, animate } };
      return;
    }
    if (index === current) return;
    busy = true;
    updateControls();
    const from = current;
    const focusWasInside = chapters[from].contains(document.activeElement);
    try {
      await preparePage(index);
      if (zoomed) setZoom(false);
      const forward = index > from;
      const moving = leaves[forward ? from : index];
      current = index;
      showOnly(index);
      leaves[from].hidden = false;
      leaves[from].inert = true;
      leaves[from].setAttribute("aria-hidden", "true");
      leaves[from].style.zIndex = "1";
      leaves[index].style.zIndex = "2";
      fitChapter(index);
      if (history) window.history.pushState(null, "", "#" + chapters[index].id);
      updateControls();
      if (animate && !reducedMotion.matches && typeof moving.animate === "function") {
        moving.classList.add("is-turning");
        moving.style.zIndex = "3";
        animation = moving.animate(
          forward ? [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-180deg)" }] :
            [{ transform: "rotateY(-180deg)" }, { transform: "rotateY(0deg)" }],
          { duration: 760, easing: "cubic-bezier(.25,.55,.25,1)", fill: "both" }
        );
        await animation.finished.catch(() => {});
        animation.cancel();
        animation = null;
        moving.classList.remove("is-turning");
      }
      showOnly(index);
      if (focusWasInside) {
        const heading = chapters[index].querySelector("h1,h2");
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    } finally {
      busy = false;
      updateControls();
      if (current + 1 < chapters.length) preparePage(current + 1).catch(() => {});
      const pending = queued;
      queued = null;
      if (pending) turnTo(pending.index, pending.options);
    }
  }

  document.addEventListener("click", event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.hash === "#noi-dung") {
      event.preventDefault();
      document.querySelector("#noi-dung").focus({ preventScroll: true });
      return;
    }
    const index = indexForHash(link.hash);
    if (index >= 0) {
      event.preventDefault();
      turnTo(index);
    }
  });

  previous.addEventListener("click", () => turnTo(current - 1));
  next.addEventListener("click", () => turnTo(current + 1));
  zoom.addEventListener("click", () => {
    if (!busy) setZoom(!zoomed);
  });

  document.addEventListener("keydown", event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
      event.target.closest("input,textarea,select,[contenteditable]")) return;
    const keys = { ArrowRight: current + 1, PageDown: current + 1, ArrowLeft: current - 1, PageUp: current - 1, Home: 0, End: chapters.length - 1 };
    if (zoomed && event.key === "Escape") {
      event.preventDefault();
      setZoom(false);
    } else if (!zoomed && Object.hasOwn(keys, event.key)) {
      event.preventDefault();
      turnTo(keys[event.key]);
    }
  });

  stage.addEventListener("pointerdown", event => {
    if (zoomed || busy || !event.isPrimary || event.pointerType === "mouse" || event.target.closest("a,button")) return;
    swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener("pointerup", event => {
    if (!swipe || swipe.id !== event.pointerId) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    const quick = performance.now() - swipe.time < 900;
    swipe = null;
    if (quick && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) turnTo(current + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener("pointercancel", () => { swipe = null; });

  const followHistory = () => {
    const index = indexForHash(location.hash);
    if (index >= 0) turnTo(index, { history: false });
  };
  window.addEventListener("popstate", followHistory);
  window.addEventListener("hashchange", followHistory);
  window.addEventListener("resize", scheduleLayout);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches && animation) animation.finish();
  });
  new ResizeObserver(scheduleLayout).observe(stage);

  current = Math.max(0, indexForHash(location.hash));
  document.body.classList.add("book-mode");
  toolbar.hidden = false;
  showOnly(current);
  layout();
  updateControls();
  window.scrollTo(0, 0);
  preparePage(current).then(scheduleLayout);
  if (current + 1 < chapters.length) preparePage(current + 1).catch(() => {});
  Promise.all([...document.fonts].map(font => font.load().catch(() => {}))).then(scheduleLayout);
})();
