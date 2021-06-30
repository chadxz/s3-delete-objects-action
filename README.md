# s3-delete-objects-action

Github Action to remove objects from a versioned or unversioned AWS S3 bucket.
Specify an optional `prefix` to limit the objects removed to only those objects
whose keys match this value. For versioned buckets, any objects whose key
matches the given prefix will have all versions removed.

This library uses the AWS SDK for Javascript, version 3. To configure the
authentication credentials and the region, please use the
aws-actions/configure-aws-credentials action.

## inputs

- **bucket**: (required) S3 bucket name to remove objects from.
- **prefix**: (optional) Use this input to select only those keys that begin
  with the specified prefix. If this input is left blank, all objects will be
  removed from the bucket. Default: ''
- **allowEmptyPrefix**: (optional) When set to false, causes this action to
  throw an error when the `prefix` is empty. This prevents buckets from being
  accidentally wiped out if your action is misconfigured. Default: 'true'

## outputs

None. The number of deleted objects is printed to core.info.

## example

```yml
- uses: chadxz/s3-delete-objects-action@v0.0.1
  with:
    bucket: 'my-super-cool-bucket'
    prefix: 'garbage-files/'
    allowEmptyPrefix: false
```
