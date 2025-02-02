const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.deleteProjectFiles = async (projectId) => {
  const listParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: `${projectId}/`,
  };
  const listedObjects = await s3.listObjectsV2(listParams).promise();
  if (listedObjects.Contents.length > 0) {
    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Delete: { Objects: listedObjects.Contents.map(({ Key }) => ({ Key })) },
    };
    await s3.deleteObjects(deleteParams).promise();
  }
};