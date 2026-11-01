/**
 * Промпты AI-консультанта.
 *
 *  - greeting.md      — приветственное сообщение виджета
 *  - quick-replies.md — быстрые варианты (по одному в строке)
 *
 * Системный промпт живёт на backend (backend/app/prompts/system-prompt.md):
 * ключ модели и вызов LLM выполняются только на сервере.
 */
import greetingRaw from './greeting.md?raw';
import quickRepliesRaw from './quick-replies.md?raw';

export const GREETING_MESSAGE: string = greetingRaw.trim();

export const QUICK_REPLIES: readonly string[] = quickRepliesRaw
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);
