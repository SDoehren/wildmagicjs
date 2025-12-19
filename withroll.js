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

  // Evaluate in global scope so functions like checktoken, checksurge, etc. become available
  (0, eval)(code);
}

(async () => {
  try {
    // 1) Load the GitHub script (defines message, checksurge, surgeroll, surgeresult, etc.)
    await loadWildMagic();

    // 2) Make sure a token is selected
    if (!checktoken()) return;

    // 3) Check if a surge happens (your script already handles chat + dice)
    const surgeHappens = await checksurge();
    if (!surgeHappens) return;

    // 4) Roll on the wild surge table and apply the result
    const result = await surgeroll();    // returns 1–100
    await surgeresult(result);

  } catch (err) {
    console.error("Wild Magic macro error:", err);
    ui.notifications.error(`Wild Magic error: ${err.message}`);
  }
})();