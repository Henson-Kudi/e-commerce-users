import { Router } from 'express';
import fileUpload from 'express-fileupload';
import {
  deleteFileFromS3,
  getFileFromS3,
  uploadFileToS3,
} from '../../../utils/aws/s3';
import IReturnValue from '../../../domain/valueObjects/returnValue';
import { Readable } from 'stream';
import ErrorClass from '../../../domain/valueObjects/customError';

function isFullUrl(url: string): boolean {
  try {
    new URL(url);
    return true
  } catch (err) {
    return false
  }
}

const router = Router();

router.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  })
);

router.route('/').post(async (req, res) => {
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }

  const files = (
    Array.isArray(req.files?.files) ? req.files?.files : [req.files?.files]
  ) as fileUpload.UploadedFile[] | undefined;
  const uploadPath = req.body?.uploadPath || 'public';

  const requests = (files ?? [])?.map((file) =>
    uploadFileToS3(file, `${uploadPath}/${file.name}`)
  );

  const data = await Promise.all(requests);

  const response: IReturnValue<string[]> = {
    success: true,
    data,
    message: 'Files uploaded successfully',
  };

  return res.status(201).json(response);
}).get(async (req, res, next) => {
  const { url } = req?.query

  if (!url || !url.length || typeof url !== 'string') {
    const error = new ErrorClass('url is required', 404);

    next(error)
    return
  }

  try {
    let isExternal = isFullUrl(url)

    if (isExternal) {
      const response = await fetch(url, {
        method: 'GET',
      })

      if (!response.ok) {
        const error = new ErrorClass('file not found', 404);

        next(error)
        return
      }
      const ContentType = response.headers.get('content-type')
      const ContentLength = response.headers.get('content-length')

      res.setHeader('Content-Type', ContentType as string)
      if (ContentLength) res.setHeader('Content-Length', Number(ContentLength) as number)
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
      res.setHeader('Expires', new Date(Date.now() + 86400000).toUTCString());
      const buffer = await response.arrayBuffer();
      return res.status(200).send(Buffer.from(buffer));
    }

    const file = await getFileFromS3(url);

    if (!file || !file.Body) {
      const error = new ErrorClass('file not found', 404);

      next(error)
      return
    }

    res.setHeader('Content-Type', file.ContentType as string);
    res.setHeader('Content-Length', file.ContentLength as number);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.setHeader('Expires', new Date(Date.now() + 86400000).toUTCString()); // 24 hours

    return (file.Body as Readable)?.pipe(res);
  } catch (error) {
    return res.status(404).send('File not found');
  }
});

router.post('/delete', async (req, res) => {
  let { path } = req.body;

  try {
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ message: 'path must be a string' });
    }

    await deleteFileFromS3(path);

    const response: IReturnValue<boolean> = {
      success: true,
      data: true,
      message: 'File deleted successfully',
    };

    return res.status(201).json(response);
  } catch (err) {
    return res.status(400).json({ message: 'Unknown file path' });
  }
});

// Used to render images to the frontend. frontend should not call aws directly
router.get('/:key/*', async (req, res) => {
  try {
    const { key, '0': path } = req.params as Record<string, string>;
    const filePath = `${key}/${path}`;
    const file = await getFileFromS3(filePath);
    if (!file) {
      return res.status(404).send('File not found');
    }
    res.setHeader('Content-Type', file.ContentType as string);
    res.setHeader('Content-Length', file.ContentLength as number);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.setHeader('Expires', new Date(Date.now() + 86400000).toUTCString()); // 24 hours

    if (!file.Body) {
      return res.status(404).send('File not found');
    }

    return (file.Body as Readable)?.pipe(res);
  } catch (error) {
    return res.status(404).send('File not found');
  }
});

export default router;
