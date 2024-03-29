import * as uuid from 'uuid'
import busboy from 'busboy'
import AWS from 'aws-sdk'
import 'dotenv/config'

import { unstable_getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

export const config = {
  api: {
    bodyParser: false,
  },
}

// DYNAMO SETUP
const client = new AWS.DynamoDB.DocumentClient({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION,
  params: {
    TableName: process.env.TABLE_NAME_FILES,
    Limit: 500,
  }
});

const dynamoDb = {
  scan: (params) => client.scan(params).promise(),
  get: (params) => client.get(params).promise(),
  put: (params) => client.put(params).promise(),
  query: (params) => client.query(params).promise(),
  delete: (params) => client.delete(params).promise()
};

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

function getSize(key) {
  return s3.headObject({ Key: key, Bucket: process.env.S3_BUCKET })
      .promise()
      .then(res => res.ContentLength);
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

const s3Upload = params => {
  return new Promise((resolve, reject) => {
    s3.upload({
      ...defaultParams,
      ...params,
    }, (error, data) => {
      if (error) {
        reject(error)
      } else {
        resolve(data)
      }
    });
  })
}

const uploadFile = async (req, res) => {
  try {
    const files = await parseForm(req)
    const { fileBuffer, ...fileParams } = files[0]
    const data = await s3Upload({
      Key: `${uuid.v4()}-${fileParams.fileName}`,
      Body: fileBuffer,
      ContentType: fileParams.fileType,
      ContentEncoding: fileParams.fileEnc,
    })

    if (process.env.TABLE_NAME_FILES) {
      const size = await getSize(data.Key)
      const item = {
        ...data,
        size,
        id: req.query['blog-id'],
        createdAt: Date.now()
      }
      await dynamoDb.put({
        Item: item
      })
    }

    res.status(201).json({ url: data.Location });
  } catch (e) {
    console.log('unexpected error on S3 upload', e)
    res.status(500).json();
  }
}

const getAllFiles = async (req, res) => {
  let rangeKey = 99999999999999
  const result = []
  while (rangeKey !== null) {
    const { Items = [] } = await dynamoDb.query({
      ScanIndexForward: false,
      Limit: 500,
      KeyConditionExpression: 'id = :hashKey and createdAt < :rangeKey',
      ExpressionAttributeValues: {
        ':hashKey': req.query['blog-id'],
        ':rangeKey': rangeKey,
      },
    });
    const tempResult = Items.sort((a, b) => b.createdAt - a.createdAt)
    result.push(...tempResult)

    if (tempResult.length === 500) {
      rangeKey = tempResult[tempResult.length - 1].createdAt
    } else {
      rangeKey = null
    }
  }

  return result
}

export const getFile = async (req, res) => {
  // loop until no lastItemRangeKey
  const result = await getAllFiles(req,res)
  const byteSize = result.reduce((acc, curr) => acc + (curr.size || 0), 0)
  const mbSize = (byteSize / 1000) / 1000
  const roundedSize = Math.round(mbSize * 10) / 10

  return roundedSize
}

const deleteFiles = async (req, res) => {
  const urls = req.query.files.split(',')

  if (urls.length) {
    const allFiles = await getAllFiles(req,res)
    const filesToBeDeleted = allFiles.filter(f => urls.find(u => u === f.Location))

    await Promise.all(filesToBeDeleted.map(f => s3.deleteObject({
      Bucket: process.env.S3_BUCKET,
      Key: f.Key
    }).promise()))

    await Promise.all(filesToBeDeleted.map(f => dynamoDb.delete({
      Key: {
        id: f.id,
        createdAt: f.createdAt,
      }
    })))
  }

  res.status(204).send()
}

const checkAuth = (session, id) =>
  session && session.user && session.user.name === id

// HANDLER
export default async function handler(req, res) {
  const userSession = await unstable_getServerSession(req, res, authOptions)
  const isAuthorized = checkAuth(userSession, req.query['blog-id'])

  if (!isAuthorized) {
    res.status(401).json();
  } else {
    if (req.method === 'POST') {
      await uploadFile(req, res)
    } else if (req.method === 'GET') {
      const roundedSize = await getFile(req, res)
      res.status(200).json({ size: roundedSize })
    } else if (req.method === 'DELETE' && req.query.files) {
      await deleteFiles(req, res)
    } else {
      res.status(404).json()
    }
  }
}