// Text chat assistant. Reads the knowledge base + program data at cold start,
// sends them as the system prompt to Claude. API key lives in Netlify env
// (ANTHROPIC_API_KEY) - never in the browser.
const fs = require("fs");
const path = require("path");

const KNOWLEDGE = fs.readFileSync(path.join(__dirname, "../../knowledge/CRA_Knowledge_V4.md"), "utf8");
const DATA = fs.readFileSync(path.join(__dirname, "../../public/data/program-data.json"), "utf8");

const SYSTEM = `You are the South St. Pete CRA homebuyer assistant on a free community website run by IBuyStPete.com.
Follow Section 9 (voice and rules) of the knowledge base exactly. Answer from the knowledge base and program data below.
If a fact is tagged UNVERIFIED or TODO, say so plainly. Never invent a number.

=== PROGRAM DATA (JSON) ===
${DATA}

=== KNOWLEDGE BASE ===
${KNOWLEDGE}`;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "POST only" };
  let messages;
  try {
    ({ messages } = JSON.parse(event.body || "{}"));
    if (!Array.isArray(messages) || messages.length === 0) throw new Error("no messages");
  } catch {
    return { statusCode: 400, body: "Expected { messages: [{role, content}, ...] }" };
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.CHAT_MODEL || "claude-sonnet-4-6",
      max_tokens: 600,
      system: SYSTEM,
      messages: messages.slice(-12),
    }),
  });

  if (!res.ok) return { statusCode: 502, body: `Upstream ${res.status}: ${await res.text()}` };
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) };
};
