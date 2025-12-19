// 🔗 Raw GitHub URL (your wild magic file)
const url = "https://raw.githubusercontent.com/SDoehren/wildmagicjs/refs/heads/master/functionversion.js";

async function loadWildMagic() {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    ui.notifications.error(`Failed to load wild magic script: ${response.status} ${response.statusText}`);
    console.error("Wild Magic fetch error:", response);
    throw new Error("Failed to load wild magic script.");
  }
  const code = await response.text();
  (0, eval)(code);
}

(async () => {
  try {
    await loadWildMagic();
    advantage(true)
  } catch (err) {
    console.error("Wild Magic macro error:", err);
    ui.notifications.error(`Wild Magic error: ${err.message}`);
  }
})();