const fs = require("fs");
const path = require("path");

const agentId = process.argv[2];

if (!agentId) {
  console.error("❌ No agent ID provided.");
  process.exit(1);
}

console.log(`🧬 Scaffolding agent: ${agentId}`);

const agentDir = path.join(__dirname, "..", "agents", agentId);
if (!fs.existsSync(agentDir)) {
  fs.mkdirSync(agentDir, { recursive: true });
}

const indexFile = path.join(agentDir, "index.js");
if (!fs.existsSync(indexFile)) {
  fs.writeFileSync(
    indexFile,
    `// Agent: ${agentId}\nconsole.log("🤖 Agent ${agentId} initialized");\n`
  );
  console.log(`✅ Agent scaffolded at: ${agentDir}`);
} else {
  console.log(`⚠️ Agent ${agentId} already exists.`);
}
