const CONFIG = {
  eventTitle: "Jhanvi's 29th Birthday",
  eventStart: "2026-08-16T17:30:00-04:00",
  eventEnd: "2026-08-16T21:00:00-04:00",
  rsvpClose: "2026-08-10T23:59:59-04:00",

  // GitHub Pages cannot process forms by itself.
  // Create a free Formspree form and paste its endpoint below.
  formspreeEndpoint: "https://formspree.io/f/YOUR_FORM_ID"
};

const $ = (selector) => document.querySelector(selector);

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function updateEventCountdown() {
  const difference = new Date(CONFIG.eventStart).getTime() - Date.now();

  if (difference <= 0) {
    $("#countdown").innerHTML =
      '<div class="countdown-unit" style="grid-column:1/-1"><strong>Today</strong><span>Let’s celebrate</span></div>';
    return;
  }

  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);

  setText("#days", String(days).padStart(2, "0"));
  setText("#hours", String(hours).padStart(2, "0"));
  setText("#minutes", String(minutes).padStart(2, "0"));
  setText("#seconds", String(seconds).padStart(2, "0"));
}

function updateDeadlineCountdown() {
  const difference = new Date(CONFIG.rsvpClose).getTime() - Date.now();

  if (difference <= 0) {
    setText("#deadlineCountdown", "Closed");
    closeRsvpForm();
    return;
  }

  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);

  setText(
    "#deadlineCountdown",
    days > 0 ? `${days}d ${hours}h` : `${hours}h ${minutes}m`
  );
}

function closeRsvpForm() {
  const form = $("#rsvpForm");
  if (form.dataset.closed === "true") return;

  form.dataset.closed = "true";
  form.querySelectorAll("input, select, textarea, button").forEach((element) => {
    element.disabled = true;
  });

  $("#submitButton").textContent = "RSVP closed";
  $("#formStatus").textContent =
    "Online RSVP is now closed. Please contact the host directly.";
}

function toCalendarDate(dateString) {
  return new Date(dateString)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escapeIcsText(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function configureCalendar() {
  const start = toCalendarDate(CONFIG.eventStart);
  const end = toCalendarDate(CONFIG.eventEnd);
  const details =
    "Surprise celebration for Jhanvi's 29th birthday. Dress code: all black. Please arrive on time and keep it a secret.";
  const location = "Gaia & Loki, 346 Grove Street, Jersey City, NJ 07302";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: CONFIG.eventTitle,
    dates: `${start}/${end}`,
    details,
    location
  });

  $("#googleCalendarLink").href =
    `https://calendar.google.com/calendar/render?${params.toString()}`;

  $("#downloadCalendar").addEventListener("click", () => {
    const stamp = toCalendarDate(new Date().toISOString());
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Jhanvi 29th Birthday Invitation//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@jhanvi-29th-birthday`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcsText(CONFIG.eventTitle)}`,
      `DESCRIPTION:${escapeIcsText(details)}`,
      `LOCATION:${escapeIcsText(location)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "jhanvi-29th-birthday.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
}

function configureAttendanceFields() {
  document.querySelectorAll('input[name="attendance"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const attending = radio.checked && radio.value.startsWith("Yes");
      $("#attendingFields").hidden = !attending;

      if (!attending) {
        $("#guestCount").value = "1";
        $("#additionalNames").value = "";
        $("#dietary").value = "";
      }
    });
  });
}

async function submitRsvp(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const status = $("#formStatus");
  const submitButton = $("#submitButton");

  if (!form.reportValidity()) return;

  if (CONFIG.formspreeEndpoint.includes("YOUR_FORM_ID")) {
    status.textContent =
      "The website is ready, but the host must add a Formspree endpoint in script.js before RSVPs can be collected.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Sending…";
  status.textContent = "";

  try {
    const response = await fetch(CONFIG.formspreeEndpoint, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error("The RSVP could not be submitted.");
    }

    const attendance = new FormData(form).get("attendance");
    setText(
      "#successMessage",
      attendance && attendance.startsWith("Yes")
        ? "We can’t wait to celebrate with you."
        : "Thank you for letting us know. You’ll be missed!"
    );

    form.reset();
    $("#attendingFields").hidden = true;
    showSuccess();
  } catch (error) {
    status.textContent =
      "Something went wrong. Please try again or contact the host directly.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Send RSVP";
  }
}

function showSuccess() {
  $("#successModal").hidden = false;
  document.body.classList.add("no-scroll");
  $("#successClose").focus();
  launchConfetti();
}

function closeSuccess() {
  $("#successModal").hidden = true;
  document.body.classList.remove("no-scroll");
  $("#guestName").focus();
}

function launchConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = $("#confettiCanvas");
  const context = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const colors = ["#080808", "#d6ad60", "#f0d89b", "#ffffff", "#72501d"];
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight * 0.25,
    width: 5 + Math.random() * 7,
    height: 8 + Math.random() * 10,
    speed: 2 + Math.random() * 4,
    drift: -1.5 + Math.random() * 3,
    rotation: Math.random() * Math.PI,
    rotationSpeed: -0.12 + Math.random() * 0.24,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));

  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  context.scale(ratio, ratio);

  const startTime = performance.now();

  function draw(now) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    pieces.forEach((piece) => {
      piece.y += piece.speed;
      piece.x += piece.drift;
      piece.rotation += piece.rotationSpeed;

      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
      context.restore();
    });

    if (now - startTime < 3000) {
      requestAnimationFrame(draw);
    } else {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  requestAnimationFrame(draw);
}

function initialize() {
  updateEventCountdown();
  updateDeadlineCountdown();
  setInterval(updateEventCountdown, 1000);
  setInterval(updateDeadlineCountdown, 60000);

  configureCalendar();
  configureAttendanceFields();

  $("#rsvpForm").addEventListener("submit", submitRsvp);
  $("#successClose").addEventListener("click", closeSuccess);
  $("#successModal").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeSuccess();
  });
}

initialize();
