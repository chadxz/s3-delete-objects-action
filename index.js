'use strict';
const core = require('@actions/core');
const get = require('lodash.get');
const {
  S3Client,
  ListObjectVersionsCommand,
  DeleteObjectsCommand,
} = require('@aws-sdk/client-s3');

async function run() {
  const Bucket = core.getInput('bucket', {
    required: true,
    trimWhitespace: true,
  });
  const Prefix = core.getInput('prefix', { trimWhitespace: true });
  const allowEmptyPrefix =
    core.getInput('allowEmptyPrefix', {
      trimWhitespace: true,
    }) === 'true';

  if (Prefix === '' && !allowEmptyPrefix) {
    throw new Error('allowEmptyPrefix is false, but Prefix is empty');
  }

  const s3client = new S3Client({
    /** pulls configuration from environment */
    apiVersion: '2006-03-01',
  });

  let versions = await s3client.send(
    new ListObjectVersionsCommand({ Bucket, Prefix })
  );

  let deletedCount = 0;
  while (get(versions, 'Versions.length', 0) > 0) {
    const result = await s3client.send(
      new DeleteObjectsCommand({
        Bucket,
        Delete: {
          Objects: versions.Versions.map((v) => ({
            Key: v.Key,
            VersionId: v.VersionId,
          })),
        },
      })
    );

    if (get(result, 'Errors.length', 0) > 0) {
      throw new Error(result.Errors.map((e) => e.Message).join('; '));
    }

    deletedCount += result.Deleted.length;

    versions = versions.IsTruncated
      ? await s3client.send(
          new ListObjectVersionsCommand({
            Bucket,
            Prefix,
            KeyMarker: versions.NextKeyMarker,
            VersionIdMarker: versions.NextVersionIdMarker,
          })
        )
      : null;
  }

  core.info(`Successfully deleted ${deletedCount} objects.`);
}

run().catch((err) => {
  process.nextTick(() => {
    core.setFailed(err.message);
  });
});
