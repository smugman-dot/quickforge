let inputValue = document.getElementById("modinpt").textContent;
// The API endpoint URL provided
const apiUrl = "https://api.curse.tools/v1/cf/minecraft/version";

// Get a reference to the <select> element by its ID
const versionSelector = document.getElementById("mc-version-dropdown");

/**
 * Fetches Minecraft versions from the API and populates the dropdown.
 * Uses async/await for cleaner asynchronous code.
 */
async function populateVersions() {
  try {
    // Fetch data from the API
    const response = await fetch(apiUrl);

    // Check if the request was successful (status code 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the JSON response body
    const versionData = await response.json();

    // Clear the "Loading..." option
    versionSelector.innerHTML = "";

    // Check if the data array exists and has items
    if (versionData.data && versionData.data.length > 0) {
      // Add a default, disabled option
      const defaultOption = document.createElement("option");
      defaultOption.textContent = "Choose a version";
      defaultOption.value = "";
      defaultOption.disabled = true;
      defaultOption.selected = true;
      versionSelector.appendChild(defaultOption);

      // Loop through each version object in the 'data' array
      versionData.data.forEach((version) => {
        // 1. Create a new <option> element
        const optionElement = document.createElement("option");

        // 2. Set its text content to the versionString
        optionElement.textContent = version.versionString;

        // 3. Set its value attribute (optional, but good practice)
        optionElement.value = version.versionString;

        // 4. Append the new option to the select element
        versionSelector.appendChild(optionElement);
      });
    } else {
      versionSelector.innerHTML = "<option>No versions found</option>";
    }
  } catch (error) {
    // Log any errors to the console and update the UI
    console.error("Failed to fetch Minecraft versions:", error);
    versionSelector.innerHTML = "<option>Failed to load versions</option>";
  }
}

async function getModSlug() {
  const inputValue = document.getElementById("modinpt").value.trim();

  const match = inputValue.match(
    /curseforge\.com\/minecraft\/[^\/]+\/([^\/?#]+)/,
  );
  if (!match) {
    console.error("❌ Invalid CurseForge URL");
    return;
  }

  const slug = match[1];

  // 1. Fetch mod info
  const res = await fetch(
    `https://api.curse.tools/v1/cf/mods/search?gameId=432&slug=${slug}`,
  );
  const data = await res.json();

  if (!data.data || data.data.length === 0) {
    console.error("❌ No mod found with this slug.");
    return;
  }

  const modId = data.data[0].id;

  // 2. Fetch mod files
  const requestFiles = await fetch(
    `https://api.curse.tools/v1/cf/mods/${modId}/files`,
  );
  const filesData = await requestFiles.json();
  const files = filesData.data;

  // 3. Get selected version from dropdown
  const selectedVersion = document.getElementById("mc-version-dropdown").value;

  // 4. Find the first file that supports the selected version
  const matchingFile = files.find((file) =>
    file.gameVersions.includes(selectedVersion),
  );

  if (!matchingFile) {
    console.error("❌ No file found for that Minecraft version.");
    return;
  }

  const downloadUrl = matchingFile.downloadUrl;

  if (!downloadUrl) {
    console.error("❌ File doesn't have a download URL.");
    return;
  }

  // 5. Force browser download
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = matchingFile.fileName;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Static list of mod loaders (CurseForge doesn’t have an endpoint for this)
function loadModLoaders() {
  const loaders = ["Forge", "NeoForge", "Fabric", "Quilt", "Liteloader"];
  const dropdown = document.getElementById("mc-modloader-dropdown");

  dropdown.innerHTML = ""; // clear loading text

  loaders.forEach((loader) => {
    const opt = document.createElement("option");
    opt.value = loader;
    opt.textContent = loader;
    dropdown.appendChild(opt);
  });
}
loadModLoaders();
document.addEventListener("DOMContentLoaded", populateVersions);
