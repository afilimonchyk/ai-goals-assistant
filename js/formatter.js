/**
 * Модуль для форматирования текста сообщений
 */

/**
 * Форматирует текст сообщения, преобразуя Markdown в HTML
 * - **Bold text** (Markdown `**bold**` -> `<b>bold</b>`)
 * - *Italic text* (Markdown `*italic*` -> `<i>italic</i>`)
 * - `Inline code` (Markdown `` `code` `` -> `<code>code</code>`)
 * - Multi-line code blocks (Markdown ``` ``` code ``` ``` -> `<pre><code>code</code></pre>`)
 *
 * @param {string} text - Текст сообщения для форматирования
 * @returns {string} Отформатированный HTML
 */
function formatMessage(text) {
  // Санитизация HTML для предотвращения XSS
  const sanitizedText = sanitizeHTML(text);

  return sanitizedText
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Bold
    .replace(/\*(.*?)\*/g, "<i>$1</i>") // Italic
    .replace(/`(.*?)`/g, "<code>$1</code>") // Inline code
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>"); // Multi-line code blocks
}

/**
 * Санитизирует HTML-строку для предотвращения XSS-атак
 *
 * @param {string} html - Текст, который нужно санитизировать
 * @returns {string} Санитизированный HTML
 */
function sanitizeHTML(html) {
  const temp = document.createElement("div");
  temp.textContent = html;
  return temp.innerHTML;
}
