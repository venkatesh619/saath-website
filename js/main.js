/* ============================================================
   Saath marketing site — interactions + waitlist
   ============================================================ */

// --- Supabase (publishable anon key — safe to expose client-side) ---
const SUPABASE_URL = "https://utgrouufqitmaolaaurh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_XtLO6EOulJl_ghnwhX7_Cg_ss0h17A0";

// --- Mobile nav toggle ---
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
}

// --- FAQ accordion ---
function initFaq() {
  document.querySelectorAll(".faq-q").forEach((q) => {
    q.addEventListener("click", () => {
      const item = q.closest(".faq-item");
      const answer = item.querySelector(".faq-a");
      const isOpen = item.classList.toggle("open");
      answer.style.maxHeight = isOpen ? answer.scrollHeight + "px" : null;
    });
  });
}

// --- Waitlist form → Supabase ---
function initWaitlist() {
  const forms = document.querySelectorAll("form.waitlist");
  forms.forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button[type="submit"]');
      const msg = form.querySelector(".form-msg");
      const email = (input.value || "").trim().toLowerCase();

      msg.textContent = "";
      msg.className = "form-msg";

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = "Please enter a valid email address.";
        msg.classList.add("err");
        return;
      }

      const originalLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Joining…";

      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ email, source: "website" }),
        });

        if (res.ok) {
          msg.textContent = "You're on the list! We'll email you when Saath launches. 🎉";
          msg.classList.add("ok");
          input.value = "";
        } else if (res.status === 409) {
          // Duplicate email (unique constraint) — treat as success.
          msg.textContent = "You're already on the list — we'll be in touch soon. 🎉";
          msg.classList.add("ok");
          input.value = "";
        } else {
          const detail = await res.text();
          console.error("Waitlist error", res.status, detail);
          msg.textContent = "Something went wrong. Please try again in a moment.";
          msg.classList.add("err");
        }
      } catch (err) {
        console.error(err);
        msg.textContent = "Network error. Please check your connection and try again.";
        msg.classList.add("err");
      } finally {
        btn.disabled = false;
        btn.textContent = originalLabel;
      }
    });
  });
}

// --- Contact form → Supabase ---
function initContact() {
  const form = document.querySelector("form.contact-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim().toLowerCase();
    const message = form.querySelector('[name="message"]').value.trim();
    const btn = form.querySelector('button[type="submit"]');
    const msg = form.querySelector(".form-msg");

    msg.textContent = "";
    msg.className = "form-msg";

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 5) {
      msg.textContent = "Please fill in your name, a valid email, and a short message.";
      msg.classList.add("err");
      return;
    }

    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending…";

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        msg.textContent = "Thanks — your message has been sent. We'll get back to you soon.";
        msg.classList.add("ok");
        form.reset();
      } else {
        const detail = await res.text();
        console.error("Contact error", res.status, detail);
        msg.textContent = "Something went wrong. Please try again in a moment.";
        msg.classList.add("err");
      }
    } catch (err) {
      console.error(err);
      msg.textContent = "Network error. Please check your connection and try again.";
      msg.classList.add("err");
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
}

// --- Footer year ---
function initYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initFaq();
  initWaitlist();
  initContact();
  initYear();
});
