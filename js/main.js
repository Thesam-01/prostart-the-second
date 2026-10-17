const root = document.documentElement;
root.classList.add("js");

const menuButton = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

function setMenu(open) {
  if (!menuButton) return;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.textContent = open ? "Close" : "Menu";
}

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuButton.focus();
    }
  });

  window.matchMedia("(min-width: 1200px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });
}

const cards = document.querySelectorAll(".sector-grid .card");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!("IntersectionObserver" in window) || reduceMotion) {
  cards.forEach((card) => card.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  cards.forEach((card) => observer.observe(card));
}

const form = document.getElementById("corporate-form");
const formMessage = document.getElementById("form-message");

function checkField(field) {
  const value = field.value.trim();
  const label = field.labels[0].textContent;

  if (field.required && value === "") {
    return label + " is required.";
  }
  if (field.type === "email" && value !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "Enter a valid email, like name@company.com.";
  }
  if (field.type === "tel" && value !== "" && !/^\+?[0-9]{7,15}$/.test(value.replace(/[\s-]/g, ""))) {
    return "Enter a valid phone number, like +234 911 517 8165.";
  }
  if (field.type === "number" && value !== "" && Number(value) < 1) {
    return "Enter at least 1.";
  }
  return "";
}

function showError(field, message) {
  const group = field.closest(".form-group");
  let error = group.querySelector(".field-error");

  if (message === "") {
    group.classList.remove("has-error");
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
    if (error) error.remove();
    return;
  }

  if (!error) {
    error = document.createElement("p");
    error.className = "field-error";
    error.id = field.id + "-error";
    group.appendChild(error);
  }
  error.textContent = message;
  group.classList.add("has-error");
  field.setAttribute("aria-invalid", "true");
  field.setAttribute("aria-describedby", error.id);
}

function shake(field) {
  field.classList.remove("shake");
  void field.offsetWidth;
  field.classList.add("shake");
}

if (form) {
  const fields = form.querySelectorAll("input, select, textarea");

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") {
        showError(field, checkField(field));
      }
    });
    field.addEventListener("blur", () => {
      if (field.value.trim() !== "") showError(field, checkField(field));
    });
    field.addEventListener("animationend", () => field.classList.remove("shake"));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let firstBad = null;

    fields.forEach((field) => {
      const message = checkField(field);
      showError(field, message);
      if (message !== "" && !firstBad) firstBad = field;
    });

    if (firstBad) {
      formMessage.className = "form-message is-error";
      formMessage.textContent = "Please fix the highlighted fields.";
      firstBad.focus();
      shake(firstBad);
      return;
    }

    const company = form.company.value.trim();
    form.reset();
    formMessage.className = "form-message is-success";
    formMessage.textContent = "Thank you, " + company + ". We have received your request and will contact you shortly.";
  });
}
