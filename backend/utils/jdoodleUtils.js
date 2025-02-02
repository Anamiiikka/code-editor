// utils/jdoodleUtils.js

const axios = require('axios');

const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

/**
 * Executes code using the JDoodle API.
 *
 * @param {string} script - The code to execute.
 * @param {string} language - The programming language (e.g., 'cpp17', 'java', 'python3').
 * @param {string} input - Optional input for the program.
 * @returns {Promise<Object>} - The response from JDoodle.
 */
exports.runCodeOnJDoodle = async (script, language, input = '') => {
  try {
    const jdoodlePayload = {
      clientId: JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
      script: script,
      language: language,
      stdin: input,
      versionIndex: '0', // Use the latest version of the language
    };

    const response = await axios.post('https://api.jdoodle.com/v1/execute', jdoodlePayload);

    if (response.data.statusCode === 200) {
      return { output: response.data.output };
    } else {
      throw new Error(response.data.error || 'Failed to execute code');
    }
  } catch (error) {
    console.error('Error executing code on JDoodle:', error);
    throw error;
  }
};