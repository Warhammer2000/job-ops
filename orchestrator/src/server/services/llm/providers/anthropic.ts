import type { LlmRequestOptions } from "../types";
import { joinUrl } from "../utils/http";
import { getNestedValue } from "../utils/object";
import { createProviderStrategy } from "./factory";

export const anthropicStrategy = createProviderStrategy({
  provider: "anthropic",
  defaultBaseUrl: "https://api.anthropic.com",
  requiresApiKey: true,
  modes: ["json_schema", "json_object", "none"],
  validationPaths: ["/v1/messages"],
  buildRequest: ({ mode, baseUrl, apiKey, model, messages, jsonSchema }) => {
    const { system, anthropicMessages } = toAnthropicMessages(messages);
    const body: Record<string, unknown> = {
      model,
      max_tokens: 4096,
      messages: anthropicMessages,
    };

    if (system) {
      body.system = system;
    }

    if (mode === "json_schema") {
      body.system = [
        ...(system ? [{ type: "text", text: system }] : []),
        {
          type: "text",
          text: `You MUST respond with valid JSON matching this schema:\n${JSON.stringify(jsonSchema.schema, null, 2)}\n\nRespond ONLY with the JSON object, no other text.`,
        },
      ];
    } else if (mode === "json_object") {
      const existingSystem = system || "";
      const jsonInstruction = existingSystem.toLowerCase().includes("json")
        ? existingSystem
        : `${existingSystem}\n\nRespond with valid JSON only.`.trim();
      body.system = jsonInstruction;
    }

    return {
      url: joinUrl(baseUrl, "/v1/messages"),
      headers: buildAnthropicHeaders(apiKey),
      body,
    };
  },
  extractText: (response) => {
    const content = getNestedValue(response, ["content"]);
    if (!Array.isArray(content)) return null;

    const textParts: string[] = [];
    for (const block of content) {
      const type = getNestedValue(block, ["type"]);
      const text = getNestedValue(block, ["text"]);
      if (type === "text" && typeof text === "string") {
        textParts.push(text);
      }
    }
    return textParts.join("") || null;
  },
  getValidationUrls: ({ baseUrl }) => [joinUrl(baseUrl, "/v1/models")],
});

function buildAnthropicHeaders(apiKey: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
  };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
  return headers;
}

function toAnthropicMessages(
  messages: LlmRequestOptions<unknown>["messages"],
): {
  system: string | null;
  anthropicMessages: Array<{ role: "user" | "assistant"; content: string }>;
} {
  const systemParts: string[] = [];
  const anthropicMessages: Array<{
    role: "user" | "assistant";
    content: string;
  }> = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      systemParts.push(msg.content);
    } else {
      anthropicMessages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      });
    }
  }

  return {
    system: systemParts.length ? systemParts.join("\n") : null,
    anthropicMessages,
  };
}
