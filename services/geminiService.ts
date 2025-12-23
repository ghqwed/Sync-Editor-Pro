
import { GoogleGenAI } from "@google/genai";
import { ApiSettings } from "../types";

async function callAI(prompt: string, settings: ApiSettings, isJson = false): Promise<string> {
  const { model, baseUrl, apiKey: customKey } = settings;
  
  // 确定最终使用的 API Key
  const finalKey = customKey || process.env.API_KEY;
  
  if (!finalKey) {
    throw new Error("请在配置中输入 API Key 或通过官方渠道授权。");
  }

  // 如果提供了自定义 Base URL，则使用 fetch (适配 JuheAI 等 OpenAI 兼容格式)
  if (baseUrl && baseUrl.trim() !== "") {
    let url = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    // 自动补齐路径
    if (!url.includes("/chat/completions")) {
      url = `${url}chat/completions`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${finalKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        ...(isJson ? { response_format: { type: "json_object" } } : {})
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } else {
    // 否则使用官方 SDK
    const ai = new GoogleGenAI({ apiKey: finalKey });
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { 
        temperature: 0.1, 
        ...(isJson ? { responseMimeType: "application/json" } : {}) 
      }
    });
    return response.text || "";
  }
}

export async function testApiConnection(settings: ApiSettings): Promise<boolean> {
  try {
    const res = await callAI("Respond with 'Connected'", settings);
    return res.toLowerCase().includes("connected");
  } catch (e) {
    throw e;
  }
}

export async function translateText(text: string, stylePrompt: string, settings: ApiSettings): Promise<string> {
  if (!text.trim()) return "";
  const prompt = `Task: Translate to Chinese (Simplified). Style: ${stylePrompt}. Text: "${text}". Return ONLY the translation text.`;
  return await callAI(prompt, settings);
}

function robustParseTranslations(raw: string, expectedCount: number): string[] {
  let clean = raw.replace(/```json\n?|\n?```/g, "").trim();
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(clean);
    let list: string[] = [];
    if (parsed.translations && Array.isArray(parsed.translations)) list = parsed.translations;
    else if (Array.isArray(parsed)) list = parsed;

    if (list.length !== expectedCount) {
       while (list.length < expectedCount) list.push("");
    }
    return list;
  } catch (e) {
    const matches = clean.match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g);
    if (matches) {
      const filtered = matches.map(m => m.slice(1, -1)).filter(val => val !== "translations");
      while (filtered.length < expectedCount) filtered.push("");
      return filtered.slice(0, expectedCount);
    }
  }
  return Array(expectedCount).fill("");
}

export async function translateParagraph(sentences: string[], stylePrompt: string, settings: ApiSettings): Promise<string[]> {
  const prompt = `CRITICAL TASK: Translate ${sentences.length} sentences into Chinese (Simplified).
RULES:
1. You MUST return exactly ${sentences.length} items in the "translations" array.
2. If a sentence is empty or a space, return " " for that index.
3. DO NOT merge sentences.
Style: ${stylePrompt}
Output format: {"translations": ["item1", "item2", ...]}
Input sentences: ${JSON.stringify(sentences)}`;

  try {
    const raw = await callAI(prompt, settings, false);
    return robustParseTranslations(raw, sentences.length);
  } catch (e) {
    return Array(sentences.length).fill("翻译失败");
  }
}

export async function reverseTranslateSentence(
  original: string, modified: string, context: string, settings: ApiSettings
): Promise<string> {
  const prompt = `Task: Update English text to strictly match the revised Chinese meaning.
Context: "${context}"
Revised Chinese: "${modified}"
Current English: "${original}"
Return ONLY the updated English text.`;
  return await callAI(prompt, settings);
}
