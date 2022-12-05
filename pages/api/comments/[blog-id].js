import 'dotenv/config'
import aws from 'aws-sdk'

// DYNAMO SETUP
const client = new aws.DynamoDB.DocumentClient({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION,
  params: {
    TableName: process.env.TABLE_NAME,
    Limit: 500,
  }
});

const dynamoDb = {
  scan: (params) => client.scan(params).promise(),
  get: (params) => client.get(params).promise(),
  put: (params) => client.put(params).promise(),
  query: (params) => client.query(params).promise(),
  update: (params) => client.update(params).promise(),
  delete: (params) => client.delete(params).promise()
};

// ITEM HELPERS
const createItem = async (req, res) => {
  const { id, createdAt, comment }= req.body
  const { Item } = await dynamoDb.get({
    Key: { id, createdAt }
  })
  if (Item) {
    const prevComments = Item.content.comments || []
    const { Attributes } = await dynamoDb.update({
      Key: {
        id,
        createdAt,
      },
      UpdateExpression: 'SET content = :content',
      ExpressionAttributeValues: {
        ':content': {
          ...Item.content,
          comments: [...prevComments, {
            createdAt: Date.now(),
            ...comment
          }],
        }
      },
      ReturnValues: 'ALL_NEW'
    });

    res.status(200).json(Attributes);
  } else {
    res.status(400).json()
  }
}

// HANDLER
export default async function handler(req, res) {
  if (req.method === 'POST') {
    await createItem(req, res)
  } else {
    res.status(404).json()
  }
}
