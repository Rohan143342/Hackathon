async function loadList() {
  const status = document.getElementById("status-filter").value;
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(`/api/insufficiencies${query}`);
  if (!res.ok) throw new Error("Failed to load insufficiencies");
  const items = await res.json();
  renderList(items);
}

function renderList(items) {
  const body = document.getElementById("insuff-body");
  body.innerHTML = "";

  items.forEach((item) => {
    const tr = document.createElement("tr");

    const isResolved = item.status === "RESOLVED";
    const badgeClass = isResolved ? "badge-resolved" : "badge-open";

    const atCap = item.reminderCount >= 3;

    const candidateCell = document.createElement("td");
    candidateCell.textContent = item.candidateName;
    tr.appendChild(candidateCell);

    const reasonCell = document.createElement("td");
    reasonCell.textContent = item.reason;
    tr.appendChild(reasonCell);

    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = `badge ${badgeClass}`;
    badge.textContent = item.status;
    statusCell.appendChild(badge);
    tr.appendChild(statusCell);

    const countCell = document.createElement("td");
    countCell.textContent = item.reminderCount;
    tr.appendChild(countCell);

    const actionsCell = document.createElement("td");
    actionsCell.className = "row-actions";
    actionsCell.innerHTML = `
      <button data-action="remind" data-id="${item.id}"${atCap || isResolved ? " disabled" : ""}>Send Reminder</button>
      <button data-action="resolve" data-id="${item.id}"${isResolved ? " disabled" : ""}>Resolve</button>
    `;
    tr.appendChild(actionsCell);

    body.appendChild(tr);
  });

  body.querySelectorAll("button[data-action=remind]").forEach((btn) => {
    btn.addEventListener("click", () => sendReminder(btn.dataset.id));
  });
  body.querySelectorAll("button[data-action=resolve]").forEach((btn) => {
    btn.addEventListener("click", () => resolveItem(btn.dataset.id));
  });
}

async function sendReminder(id) {
  const res = await fetch(`/api/insufficiencies/${id}/remind`, { method: "POST" });
  if (!res.ok) return;
  await loadList();
}

async function resolveItem(id) {
  const res = await fetch(`/api/insufficiencies/${id}/resolve`, { method: "PATCH" });
  if (!res.ok) return;
  await loadList();
}

document.getElementById("add-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const candidateName = document.getElementById("candidate-name").value;
  const reason = document.getElementById("reason").value;
  const messageEl = document.getElementById("add-message");

  const res = await fetch("/api/insufficiencies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateName, reason })
  });

  if (res.ok) {
    messageEl.textContent = "Insufficiency added.";
    messageEl.className = "message success";
    document.getElementById("candidate-name").value = "";
    document.getElementById("reason").value = "";
    await loadList();
  } else {
    messageEl.textContent = "Failed to add insufficiency.";
    messageEl.className = "message error";
  }
});

document.getElementById("status-filter").addEventListener("change", loadList);

// --- Tooling: reset button (utility only, not part of the app under test) ---
function showToast(msg) {
  let toast = document.getElementById("__toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "__toast";
    toast.style.cssText =
      "position:fixed;bottom:20px;right:20px;background:#333;color:#fff;padding:10px 16px;" +
      "border-radius:4px;font-family:sans-serif;z-index:9999;opacity:0;transition:opacity .2s;";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(toast.__timer);
  toast.__timer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 2000);
}

document.getElementById("reset-btn").addEventListener("click", async () => {
  await fetch("/api/reset", { method: "POST" });
  document.getElementById("candidate-name").value = "";
  document.getElementById("reason").value = "";
  document.getElementById("add-message").textContent = "";
  document.getElementById("status-filter").value = "";
  await loadList();
  showToast("Data reset");
});

loadList();
