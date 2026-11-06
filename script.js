(() => {
  const chapters = [...document.querySelectorAll(".chapter")];
  const stage = document.querySelector("#book-stage");
  const shell = document.querySelector(".book-shell");
  const pages = document.querySelector(".book-pages");
  const previous = document.querySelector("#previous-page");
  const next = document.querySelector("#next-page");
  const zoomOut = document.querySelector("#zoom-out");
  const zoomIn = document.querySelector("#zoom-in");
  const zoomReset = document.querySelector("#zoom-reset");
  const status = document.querySelector("#page-status");
  const labels = ["Giới thiệu", "Làng Sen quê Bác", "Cửa Lò bến nhớ", "Dấu ấn Sông Lam", "Ví Dặm tình ca"];
  const paper = ["#fff7e9", "#895015", "#bddedc", "#fae7c6", "#779a47"];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const WIDTH = 1080, HEIGHT = 1350, MIN_ZOOM = .6, MAX_ZOOM = 4;
  const pointers = new Map();
  const preparations = new Map();
  const fontLoads = new Map();
  const viewerFonts = ['400 21px "Capitaly Script"', '400 21px "Muli"'];
  let cancelPrefetch = null;
  let current = 0, busy = false, queued = null, zoomRatio = 1;
  let animations = [], layoutPending = false, gesture = null;

  const wrap = index => (index % chapters.length + chapters.length) % chapters.length;
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
    chapter.before(leaf);
    face.append(chapter);
    leaf.append(face);
    leaf.hidden = true;
    for (const image of chapter.querySelectorAll("img")) {
      image.draggable = false;
      image.addEventListener("load", scheduleLayout);
    }
    return leaf;
  });

  const effect = document.createElement("div");
  effect.className = "page-effect";
  effect.hidden = true;
  effect.setAttribute("aria-hidden", "true");
  effect.innerHTML = '<svg class="page-curl" viewBox="0 0 380 1400" preserveAspectRatio="none"><defs><linearGradient id="curl-paper" x1="0" x2="1"><stop offset="0" stop-color="#bbae92"/><stop offset=".25" stop-color="#eee2ca"/><stop offset=".58" stop-color="#fffaee"/><stop offset=".85" stop-color="#f5ead4"/><stop offset="1" stop-color="#d2bea0"/></linearGradient></defs><path d="M320 0 C160 240 70 420 40 700 C70 980 160 1160 320 1400 C260 1100 280 950 340 700 C280 450 260 300 320 0Z" fill="url(#curl-paper)"/></svg>';
  pages.append(effect);
  const curl = effect.querySelector("svg");

  function hasOverflow() {
    return stage.scrollWidth > stage.clientWidth + 3 || stage.scrollHeight > stage.clientHeight + 3;
  }

  function layout() {
    layoutPending = false;
    const style = getComputedStyle(stage);
    const availableWidth = Math.max(1, stage.offsetWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
    const availableHeight = Math.max(1, stage.offsetHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom));
    // Fit the complete Canva page without cropping or changing its proportions.
    const fit = Math.min(availableWidth / WIDTH, availableHeight / HEIGHT, 1);
    const scale = fit * zoomRatio;
    shell.style.setProperty("--book-scale", scale);
    shell.style.setProperty("--book-width", WIDTH * scale + "px");
    shell.style.setProperty("--book-height", HEIGHT * scale + "px");
    shell.style.setProperty("--book-top", Math.max(0, (availableHeight - HEIGHT * scale) / 2) + "px");
    stage.classList.toggle("can-pan", hasOverflow());
  }

  function scheduleLayout() {
    if (!layoutPending) { layoutPending = true; requestAnimationFrame(layout); }
  }

  function updateControls() {
    shell.dataset.page = String(current);
    previous.disabled = busy;
    next.disabled = busy;
    zoomOut.disabled = busy || zoomRatio <= MIN_ZOOM + .001;
    zoomIn.disabled = busy || zoomRatio >= MAX_ZOOM - .001;
    zoomReset.disabled = busy;
    document.querySelector("#zoom-level").textContent = Math.round(zoomRatio * 100) + "%";
    status.textContent = "Trang " + (current + 1) + " trên " + chapters.length + ": " + labels[current];
  }

  function setZoom(value, anchor) {
    if (busy) return;
    const rect = shell.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const x = anchor?.x ?? stageRect.left + stage.clientWidth / 2;
    const y = anchor?.y ?? stageRect.top + stage.clientHeight / 2;
    const u = (x - rect.left) / rect.width, v = (y - rect.top) / rect.height;
    zoomRatio = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
    if (Math.abs(zoomRatio - 1) < .001) zoomRatio = 1;
    layout();
    const after = shell.getBoundingClientRect();
    stage.scrollLeft += after.left + u * after.width - x;
    stage.scrollTop += after.top + v * after.height - y;
    stage.classList.toggle("can-pan", hasOverflow());
    updateControls();
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
    index = wrap(index);
    if (!preparations.has(index)) {
      const chapter = chapters[index];
      const images = [...chapter.querySelectorAll("img")].map(image => {
        image.loading = "eager";
        return image.decode().catch(() => {});
      });
      const fonts = viewerFonts.map(descriptor => {
        if (!fontLoads.has(descriptor)) fontLoads.set(descriptor, document.fonts.load(descriptor).catch(() => []));
        return fontLoads.get(descriptor);
      });
      preparations.set(index, Promise.all([...images, ...fonts]));
    }
    await preparations.get(index);
  }

  function prefetchNextPage() {
    cancelPrefetch?.();
    cancelPrefetch = null;
    const connection = navigator.connection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "")) return;
    const expected = current;
    const run = () => {
      cancelPrefetch = null;
      if (!busy && current === expected) preparePage(current + 1).catch(() => {});
    };
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(run, { timeout: 2500 });
      cancelPrefetch = () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(run, 300);
      cancelPrefetch = () => clearTimeout(id);
    }
  }

  function paperMask(top, middle, direction) {
    const x = n => (direction > 0 ? n : WIDTH - n).toFixed(1);
    const y = fraction => (HEIGHT * fraction).toFixed(1);
    const edge = top * WIDTH, mid = middle * WIDTH, control = edge - (edge - mid) * .3;
    return 'path("M' + x(0) + ' 0 H' + x(edge) +
      ' C' + x(control) + ' ' + y(.15) + ' ' + x(mid) + ' ' + y(.3) + ' ' + x(mid) + ' ' + y(.5) +
      ' C' + x(mid) + ' ' + y(.7) + ' ' + x(control) + ' ' + y(.85) + ' ' + x(edge) + ' ' + y(1) + ' H' + x(0) + ' Z")';
  }

  async function transition(from, index, direction) {
    const moving = leaves[from];
    moving.hidden = false;
    moving.inert = true;
    moving.setAttribute("aria-hidden", "true");
    moving.style.zIndex = "3";
    moving.classList.add("is-turning");
    effect.classList.toggle("is-backward", direction < 0);
    effect.hidden = false;
    const timing = { duration: 580, easing: "cubic-bezier(.22,.6,.3,1)", fill: "both" };
    animations = [
      moving.animate([
        { clipPath: paperMask(1, 1, direction), opacity: 1, offset: 0 },
        { clipPath: paperMask(.70, .50, direction), opacity: 1, offset: .55 },
        { clipPath: paperMask(.48, .30, direction), opacity: 1, offset: .80 },
        { clipPath: paperMask(0, 0, direction), opacity: 1, offset: 1 }
      ], timing),
      curl.animate([
        { transform: "translateX(800px)", opacity: 0, offset: 0 },
        { transform: "translateX(755px)", opacity: .75, offset: .15 },
        { transform: "translateX(464px)", opacity: 1, offset: .55 },
        { transform: "translateX(218px)", opacity: .75, offset: .80 },
        { transform: "translateX(-320px)", opacity: 0, offset: 1 }
      ], timing)
    ];
    try { await Promise.all(animations.map(item => item.finished.catch(() => {}))); }
    finally {
      animations.forEach(item => item.cancel());
      animations = [];
      moving.classList.remove("is-turning");
      effect.hidden = true;
    }
  }

  async function turnTo(requested, { history = true, animate = true, direction = Math.sign(requested - current) || 1 } = {}) {
    const index = wrap(requested);
    if (busy) { queued = { index, options: { history, animate, direction } }; return; }
    if (index === current) return;
    busy = true;
    updateControls();
    const from = current, focusWasInside = chapters[from].contains(document.activeElement);
    try {
      await preparePage(index);
      current = index;
      showOnly(index);
      if (history) window.history.pushState(null, "", "#" + chapters[index].id);
      updateControls();
      if (animate && !reducedMotion.matches && typeof leaves[from].animate === "function") {
        await transition(from, index, direction);
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
      prefetchNextPage();
      const pending = queued; queued = null;
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
    if (index >= 0) { event.preventDefault(); turnTo(index); }
  });

  previous.addEventListener("click", () => turnTo(current - 1));
  next.addEventListener("click", () => turnTo(current + 1));
  zoomOut.addEventListener("click", () => setZoom(zoomRatio / 1.2));
  zoomIn.addEventListener("click", () => setZoom(zoomRatio * 1.2));
  zoomReset.addEventListener("click", () => setZoom(1));

  document.addEventListener("keydown", event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
      event.target.closest("input,textarea,select,[contenteditable]")) return;
    if (event.key === "Escape" && zoomRatio !== 1) { event.preventDefault(); setZoom(1); return; }
    const keys = { ArrowRight: current + 1, PageDown: current + 1, ArrowLeft: current - 1, PageUp: current - 1, Home: 0, End: chapters.length - 1 };
    if (!Object.hasOwn(keys, event.key)) return;
    event.preventDefault();
    if (hasOverflow()) {
      const pan = { ArrowRight: [70, 0], ArrowLeft: [-70, 0], PageDown: [0, stage.clientHeight * .75], PageUp: [0, -stage.clientHeight * .75] };
      if (pan[event.key]) stage.scrollBy(...pan[event.key]);
    } else turnTo(keys[event.key]);
  });

  stage.addEventListener("wheel", event => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    setZoom(zoomRatio * Math.exp(-event.deltaY * .008), { x: event.clientX, y: event.clientY });
  }, { passive: false });

  function pair() {
    const [a, b] = [...pointers.values()];
    return { distance: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
  stage.addEventListener("pointerdown", event => {
    if (busy || event.button !== 0 || event.target.closest("a,button") || (event.pointerType === "mouse" && !hasOverflow())) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    stage.setPointerCapture(event.pointerId);
    if (pointers.size === 2) {
      const info = pair();
      gesture = { type: "pinch", ...info, zoom: zoomRatio };
    } else if (pointers.size === 1) {
      gesture = { type: hasOverflow() ? "pan" : "swipe", x: event.clientX, y: event.clientY, scrollX: stage.scrollLeft, scrollY: stage.scrollTop, time: performance.now() };
    }
    stage.classList.toggle("is-panning", gesture?.type === "pan");
  });
  stage.addEventListener("pointermove", event => {
    if (!pointers.has(event.pointerId) || !gesture) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (gesture.type === "pinch" && pointers.size >= 2) {
      const info = pair();
      stage.scrollLeft -= info.x - gesture.x;
      stage.scrollTop -= info.y - gesture.y;
      setZoom(gesture.zoom * info.distance / Math.max(1, gesture.distance), info);
      gesture.x = info.x; gesture.y = info.y;
    } else if (gesture.type === "pan") {
      stage.scrollLeft = gesture.scrollX - (event.clientX - gesture.x);
      stage.scrollTop = gesture.scrollY - (event.clientY - gesture.y);
    }
  });
  function endPointer(event, cancelled = false) {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    const last = gesture;
    stage.classList.remove("is-panning");
    if (pointers.size === 1) {
      const point = [...pointers.values()][0];
      gesture = { type: "pan", x: point.x, y: point.y, scrollX: stage.scrollLeft, scrollY: stage.scrollTop };
    } else gesture = null;
    if (!cancelled && pointers.size === 0 && last?.type === "swipe") {
      const dx = event.clientX - last.x, dy = event.clientY - last.y;
      if (performance.now() - last.time < 900 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        turnTo(current + (dx < 0 ? 1 : -1));
      }
    }
  }
  stage.addEventListener("pointerup", event => endPointer(event));
  stage.addEventListener("pointercancel", event => endPointer(event, true));

  const followHistory = () => {
    const index = indexForHash(location.hash);
    if (index >= 0) turnTo(index, { history: false });
  };
  window.addEventListener("popstate", followHistory);
  window.addEventListener("hashchange", followHistory);
  window.addEventListener("resize", scheduleLayout);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) animations.forEach(item => item.finish());
  });
  new ResizeObserver(scheduleLayout).observe(stage);

  current = Math.max(0, indexForHash(location.hash));
  document.body.classList.add("book-mode");
  document.querySelector(".reader-tools").hidden = false;
  document.querySelector(".book-page-controls").hidden = false;
  document.querySelector(".reader-hint").hidden = false;
  showOnly(current);
  layout();
  updateControls();
  window.scrollTo(0, 0);
  preparePage(current).then(() => {
    scheduleLayout();
    performance.mark("book-ready");
    prefetchNextPage();
  });
  document.fonts.ready.then(scheduleLayout);
})();
