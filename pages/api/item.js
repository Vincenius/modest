import 'dotenv/config'
import * as uuid from 'uuid';
import dynamoDb from '../../lib/dynamo-db'; // TODO refactor

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const item = {
      id: 'blog',
      uid: uuid.v4(),
      content: req.body,
      createdAt: Date.now()
    };

    await dynamoDb.put({
      Item: item
    });

    res.status(201).json(item);
  }

  if (req.method === 'GET' && req.query.id) {
    const { Item } = await dynamoDb.get({
      Key: {
        id: req.query.id
      }
    });

    res.status(200).json(Item);
  }

  if (req.method === 'GET' && !req.query.id) {
    const lastItemRangeKey = parseInt(req.query.range, 10) || 99999999999999
    const { Items = [] } = await dynamoDb.query({
      ScanIndexForward: false,
      Limit: 10,
      KeyConditionExpression: 'id = :hashKey and createdAt < :rangeKey',
      ExpressionAttributeValues: {
        ':hashKey': 'blog',
        ':rangeKey': lastItemRangeKey,
      },
    });
    const result = Items.sort((a, b) => b.createdAt - a.createdAt)

    res.status(200).json(result);
  }

  if (req.method === 'PUT') {
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

  if (req.method === 'DELETE') {
    await dynamoDb.delete({
      Key: {
        id: req.body.id,
        createdAt: req.body.createdAt,
      }
    });

    res.status(204).json({});
  }
}
