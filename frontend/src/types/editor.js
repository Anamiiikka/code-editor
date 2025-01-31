/**
 * @typedef {'javascript' | 'typescript' | 'python' | 'html'} Language
 */

/**
 * @typedef {Object} EditorState
 * @property {string} code - The code in the editor.
 * @property {Language} language - The programming language.
 * @property {'vs-dark' | 'light'} theme - The editor theme.
 * @property {number} fontSize - The font size.
 * @property {function(string): void} setCode - Function to set the code.
 * @property {function(Language): void} setLanguage - Function to set the language.
 * @property {function('vs-dark' | 'light'): void} setTheme - Function to set the theme.
 * @property {function(number): void} setFontSize - Function to set the font size.
 */

/**
 * @typedef {Object} AIResponse
 * @property {string} code - The AI-generated code.
 * @property {string} explanation - The explanation of the code.
 */

// Export the types (optional, for documentation purposes)
module.exports = {
  /**
   * @type {Language}
   */
  Language: undefined,

  /**
   * @type {EditorState}
   */
  EditorState: undefined,

  /**
   * @type {AIResponse}
   */
  AIResponse: undefined,
};