import 'dotenv/config'
import * as uuid from 'uuid'
import aws from 'aws-sdk'

import { unstable_getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'

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
  const item = {
    id: req.query['blog-id'],
    uid: uuid.v4(),
    content: req.body,
    createdAt: Date.now()
  };

  await dynamoDb.put({
    Item: item
  });

  res.status(201).json(item);
}

const getAll = async (req, res) => {
  const lastItemRangeKey = parseInt(req.query.range, 10) || 99999999999999
  const { Items = [] } = await dynamoDb.query({
    ScanIndexForward: false,
    Limit: 10,
    KeyConditionExpression: 'id = :hashKey and createdAt < :rangeKey',
    ExpressionAttributeValues: {
      ':hashKey': req.query['blog-id'],
      ':rangeKey': lastItemRangeKey,
    },
  });
  const result = Items.sort((a, b) => b.createdAt - a.createdAt)

  res.status(200).json(result);
}

const getItemById = async (req, res) => {
  const { Item } = await dynamoDb.get({
    Key: {
      id: req.query.id
    }
  });

  res.status(200).json(Item);
}

const updateItem = async (req, res) => {
  const { Attributes } = await dynamoDb.update({
    Key: {
      id: req.body.id,
      createdAt: req.body.createdAt,
    },
    UpdateExpression: 'SET content = :content',
    ExpressionAttributeValues: {
      ':content': req.body.content || null
    },
    ReturnValues: 'ALL_NEW'
  });

  res.status(200).json(Attributes);
}

const deleteItem = async (req, res) => {
  await dynamoDb.delete({
    Key: {
      id: req.body.id,
      createdAt: req.body.createdAt,
    }
  });

  res.status(204).json({});
}

const checkAuth = (session, id) =>
  session && session.user && session.user.name === id

// HANDLER
export default async function handler(req, res) {
  const userSession = await unstable_getServerSession(req, res, authOptions)
  const isAuthorized = checkAuth(userSession, req.query['blog-id'])

  // only allow get for unuauthorized users
  if (req.method !== 'GET' && !isAuthorized) {
    res.status(401).json();
  } else {
    if (req.method === 'POST') {
      await createItem(req, res)
    }

    if (req.method === 'GET' && req.query.id) {
      await getItemById(req, res)
    }

    if (req.method === 'GET' && !req.query.id) {
      await getAll(req, res)
    }

    if (req.method === 'PUT') {
      await updateItem(req, res)
    }

    if (req.method === 'DELETE') {
      await deleteItem(req, res)
    }
  }
}
