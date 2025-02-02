const axios = require('axios');
const AWS = require('aws-sdk');
const path = require('path');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.runCode = async (req, res) => {
  const { projectId, fileName, input } = req.body;
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${projectId}/${fileName}`,
    };
    const data = await s3.getObject(params).promise();
    const fileContent = data.Body.toString('utf-8');

    const extension = path.extname(fileName);
    let language;
    switch (extension) {
      case '.cpp':
        language = 'cpp17';
        break;
      case '.java':
        language = 'java';
        break;
      case '.py':
        language = 'python3';
        break;
      case '.js':
        language = 'nodejs';
        break;
      default:
        return res.status(400).json({ error: 'Unsupported file type!' });
    }

    const jdoodlePayload = {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: fileContent,
      language: language,
      stdin: input || '',
      versionIndex: '0',
    };

    const jdoodleResponse = await axios.post('https://api.jdoodle.com/v1/execute', jdoodlePayload);
    const { output, statusCode, error } = jdoodleResponse.data;

    if (statusCode === 200) {
      res.status(200).json({ output });
    } else {
      res.status(500).json({ error: error || 'Failed to execute code' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to execute code' });
  }
};