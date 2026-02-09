const path = require("path");
const dotenv = require("dotenv");

// Try loading from .env
const envPath = path.resolve(__dirname, "../.env");
const result = dotenv.config({ path: envPath });

console.log(
  "Dotenv parsed:",
  result.parsed ? Object.keys(result.parsed) : "null",
);
console.log(
  "DATABASE_URL from process.env:",
  process.env.DATABASE_URL ? "DEFINED" : "UNDEFINED",
);

const url = process.env.DATABASE_URL;
if (url) {
  console.log("Length:", url.length);
  console.log("Start:", url.substring(0, 15) + "...");
  try {
    // wrapper to avoid crashing on invalid URL
    // URL constructor might require protocol
    const parsed = new URL(url);
    console.log("Protocol:", parsed.protocol);
    console.log("Hostname:", parsed.hostname);
  } catch (e) {
    console.log("URL parse failed:", e.message);
  }
}
