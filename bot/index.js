// bot/index.js

console.log("🤖 Emoji Bot Activated");

const event = process.env.GITHUB_EVENT_PATH;
const fs = require("fs");

if (!event || !fs.existsSync(event)) {
  console.error("🚫 No GitHub event payload found.");
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(event, "utf8"));
console.log("📦 Event Payload:", JSON.stringify(payload, null, 2));

const type = payload.action;
const comment = payload.comment?.body || "";
const reaction = payload.reaction?.content || "";

if (reaction) {
  console.log(`🧠 Reaction received: ${reaction}`);

  switch (reaction) {
    case "eyes":
      console.log("👀 Mark as Done");
      break;
    case "hooray":
    case "rocket":
      console.log("✅ Mark as Done");
      break;
    case "-1":
    case "confused":
      console.log("❌ Mark as Blocked");
      break;
    case "rotating_light":
      console.log("🛟 Escalation triggered");
      break;
    case "thinking_face":
      console.log("🤔 Needs Review assigned");
      break;
    default:
      console.log("🪞 No mapping for this reaction.");
  }
} else {
  console.log("💬 Comment ignored — no emoji trigger detected.");
}
