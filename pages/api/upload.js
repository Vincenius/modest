import * as uuid from 'uuid'
import busboy from 'busboy'
import AWS from 'aws-sdk'

export const config = {
  api: {
    bodyParser: false,
  },
}

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_KEY,
    region: process.env.REGION,
})

const defaultParams = {
  CacheControl: "max-age=172800",
  ACL: "public-read",
  Bucket: process.env.S3_BUCKET,
}

const parseForm = async req => {
  return new Promise((resolve, reject) => {
    const form = busboy({ headers: req.headers })
    const files = [] // create an empty array to hold the processed files
    const buffers = {} // create an empty object to contain the buffers
    form.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      buffers[name] = [] // add a new key to the buffers object
      file.on('data', data => {
        buffers[name].push(data)
      })
      file.on('end', () => {
        files.push({
          fileBuffer: Buffer.concat(buffers[name]),
          fileType: mimeType,
          fileName: filename,
          fileEnc: encoding,
        })
      })
    })
    form.on('error', err => {
      reject(err)
    })
    form.on('finish', () => {
      resolve(files)
    })
    req.pipe(form) // pipe the request to the form handler
  })
}


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const files = await parseForm(req)
    const { fileBuffer, ...fileParams } = files[0]

    s3.upload({
      ...defaultParams,
      Key: `${uuid.v4()}-${fileParams.fileName}`,
      Body: fileBuffer,
      ContentType: fileParams.fileType,
      ContentEncoding: fileParams.fileEnc,
    }, (error, data) => {
      if (error) {
        throw error;
        // TODO error handling
      }

      res.status(201).json({ url: data.Location });
    });
  }
}
