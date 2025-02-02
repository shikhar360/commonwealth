import models from '../database';
import AWS from 'aws-sdk';
import { Op } from 'sequelize';
import fs from 'fs';
import path from 'path';

AWS.config.update({
  signatureVersion: 'v4',
});

// This should only be run once. Delete it as soon as you run it on prod.
const staticFileToBucketMigrator = async () => {
  const chainsWithStaticImages = await models.Chain.findAll({
    where: {
      icon_url: {
        [Op.like]: '/static/img%',
      },
    },
  });

  for (const chain of chainsWithStaticImages) {
    console.log('updating chain: ', chain.id);

    const iconPath = chain.icon_url;
    const fileName = iconPath.split('/').pop();

    let fileBlob;
    try {
      fileBlob = await fs.promises.readFile(
        path.join(__dirname, '../..' + iconPath)
      );
    } catch (e) {
      console.log('error uploading', e);
      continue;
    }

    const s3 = new AWS.S3();
    const params = {
      Bucket: 'commonwealth-uploads',
      Key: `${fileName}`,
      Expires: 3600,
      ContentType: 'image/png',
    };

    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
    const url = uploadUrl.replace(/\?.*/, '').trim();

    try {
      await fetch(uploadUrl, {
        method: 'put',
        body: fileBlob,
      });
    } catch (e) {
      console.log('error uploading', e);
    }

    console.log('updated url', url);

    chain.icon_url = url;
    await chain.save();
  }

  return;
};

async function main() {
  await staticFileToBucketMigrator();
}

main()
  .then(() => {
    console.log('Migration successful');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
  });
