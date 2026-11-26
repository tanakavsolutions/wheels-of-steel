const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector(".main-nav");

if (menuButton && menu) {
  menuButton.hidden = false;
  const closeMenu = () => menuButton.setAttribute("aria-expanded", "false");

  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!open));
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuButton.focus();
    }
  });
}

const intro = document.querySelector("#brand-intro");
const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (intro?.showModal && !shouldReduceMotion) {
  const previewIntro = new URLSearchParams(location.search).has("intro");
  let seen = false;

  try {
    seen = sessionStorage.getItem("wheels-intro-seen") === "yes";
  } catch {
    // Browsers that block storage can still play and dismiss the introduction.
  }

  if (previewIntro || (!seen && !location.hash)) {
    intro.showModal();
    const finish = () => {
      if (intro.open) intro.close();
    };
    const timer = window.setTimeout(finish, 2640);
    intro.querySelector("[data-close-intro]").addEventListener("click", finish);
    intro.addEventListener("close", () => {
      window.clearTimeout(timer);
      try {
        sessionStorage.setItem("wheels-intro-seen", "yes");
      } catch {
        // A blocked session store does not affect navigation.
      }
    }, { once: true });
  }
}

const videoDialog = document.querySelector("#video-dialog");

if (videoDialog?.showModal) {
  const video = videoDialog.querySelector("video");
  const videoTitle = videoDialog.querySelector("h2");

  document.querySelectorAll("[data-video]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      videoTitle.textContent = link.dataset.video === "crowd" ? "Big Girls & Big Boys Get Together" : "Wheels of Steel showreel";
      video.src = link.href;
      videoDialog.showModal();
      video.play().catch(() => {});
    });
  });

  videoDialog.querySelector("[data-close-video]").addEventListener("click", () => videoDialog.close());
  videoDialog.addEventListener("click", (event) => {
    if (event.target === videoDialog) videoDialog.close();
  });
  videoDialog.addEventListener("close", () => {
    video.pause();
    video.removeAttribute("src");
    video.load();
  });
}

const form = document.querySelector("#enquiry-form");

if (form) {
  const result = document.querySelector("#prepared-enquiry");
  const resultTitle = document.querySelector("#prepared-title");
  const message = document.querySelector("#message");
  const copyStatus = document.querySelector("#copy-status");
  const service = form.elements.service;
  const preset = new URLSearchParams(location.search).get("service");

  if (Array.from(service.options).some((option) => option.value === preset)) service.value = preset;
  form.hidden = false;

  form.addEventListener("input", () => {
    result.hidden = true;
    copyStatus.textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const date = data.get("date");
    const formattedDate = date
      ? new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(date + "T12:00:00Z"))
      : "To be confirmed";

    message.value = [
      "Hi Wheels of Steel, I’d like to enquire about booking D-Train.",
      "",
      "Name: " + data.get("name").trim(),
      "Email: " + data.get("email").trim(),
      "Service: " + service.selectedOptions[0].textContent.trim(),
      "Date: " + formattedDate,
      "Town or venue: " + data.get("venue").trim(),
      "",
      data.get("details").trim(),
    ].join("\n");

    result.hidden = false;
    copyStatus.textContent = "";
    resultTitle.focus();
  });

  document.querySelector("#copy-message").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(message.value);
      copyStatus.textContent = "Copied. Paste your message in Messenger to send it.";
    } catch {
      message.focus();
      message.select();
      copyStatus.textContent = "The message is selected. Copy it, then paste it into Messenger.";
    }
  });
}
