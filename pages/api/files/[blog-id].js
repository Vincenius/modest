import * as uuid from 'uuid'
import busboy from 'busboy'
import AWS from 'aws-sdk'
import 'dotenv/config'

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

// HANDLER
export default async function handler(req, res) {
  // req.query['blog-id']
  // TODO auth stuff and check if "blog-id" exists in query
  if (req.method === 'POST') {
    await uploadFile(req, res)
  } else if (req.method === 'GET') {
    // loop until no lastItemRangeKey
    const result = await getAllFiles(req,res)
    // console.log('GET', result)
    // TODO get all files / sizes
    res.status(200).json(result)
  } else if (req.method === 'DELETE') {
    // console.log('DELETE', req.body)
    // TODO delete file
    res.status(204).json()
  } else {
    res.status(404).json()
  }
}