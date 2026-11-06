const pages = [...document.querySelectorAll(".page")];
const links = [...document.querySelectorAll(".page-nav a")];

function setCurrentPage(id) {
  links.forEach((link) => {
    if (link.hash === "#" + id) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

let updatePending = false;
function updateCurrentPage() {
  const readingLine = document.querySelector(".site-header").offsetHeight + 80;
  let current = pages[0];
  for (const page of pages) {
    if (page.getBoundingClientRect().top <= readingLine) current = page;
  }
  setCurrentPage(current.id);
  updatePending = false;
}

window.addEventListener("scroll", () => {
  if (updatePending) return;
  updatePending = true;
  requestAnimationFrame(updateCurrentPage);
}, { passive: true });
window.addEventListener("resize", updateCurrentPage);
window.addEventListener("hashchange", updateCurrentPage);
updateCurrentPage();
