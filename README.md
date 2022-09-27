# Modest Blog

This is a Next.js template for a twitter-like micro-blogging website.

## Setup

This template is designed to be hosted easily on Vercel and AWS.

1) Go to AWS and log in or create a new account.

2) Create a new IAM role with the permissions `AmazonDynamoDBFullAccess` and `AmazonS3FullAccess`

3) Add the `ACCESS_KEY` and `SECRET_KEY` to the environment variables

4) Add your AWS region to the env variables as ``REGION``

5) Head to AWS Dynamo DB and create a new database with the Partition key `id` (String) and a Sort key `createdAt` (Number) and add the table name as environment variable `TABLE_NAME`

6) Create a new S3 Bucket on AWS and [make it public](https://aws.amazon.com/premiumsupport/knowledge-center/read-access-objects-s3-bucket/).

7) Add the S3 Bucket name as `S3_BUCKET` to the env variables.

8) Define the variables `NEXTAUTH_URL` (your domain eg. `http://localhost:3000`for local testing) and `NEXTAUTH_SECRET` - more info about this in the [next-auth](https://next-auth.js.org/getting-started/example) library.

9) Add your admin account to the env variables with `ADMIN_USERNAME=admin` and `ADMIN_PASSWORD=some-password`.

10) Install dependencies with `npm i` and run the app with `npm run dev`

11) Use following URL to log into your admin account: [http://localhost:3000/api/auth/signin](http://localhost:3000/api/auth/signin)


## License
[MIT](https://choosealicense.com/licenses/mit/)


---


*created by [Vincent Will](https://twitter.com/wweb_dev)*