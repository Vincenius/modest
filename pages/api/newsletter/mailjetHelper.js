const Mailjet = require('node-mailjet');
const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_API_SECRET,
);

const getSubscriber = email => new Promise(resolve => {
  const request = mailjet
    .get("contact", {'version': 'v3'})
    .id(email)
    .request()
  request
    .then((result) => {
      resolve(result.body)
    })
    .catch((err) => {
      console.log('error on getsubscriber', email, err.statusCode)
      resolve(null)
    })
})

const createSubscriber = email => new Promise(resolve => {
  const request = mailjet
    .post("contact", {'version': 'v3'})
    .request({
      "Email": email
    })
  request
    .then((result) => {
      console.log('successfully created subscriber:', email)
      resolve(result.body)
    })
    .catch((err) => {
      console.log('failed to create subscriber:', email, err)
      resolve()
    })
})

const addToList = (contactId, listId) => new Promise(resolve => {
  const request = mailjet
    .post("contact", {'version': 'v3'})
    .id(contactId)
    .action("managecontactslists")
    .request({
        "ContactsLists":[
          {
            "Action":"addforce",
            "ListID": listId,
          },
        ]
      })

  request
    .then((result) => {
      console.log('successfully added subscriber to list:', contactId, listId)
      resolve(result.body)
    })
    .catch((err) => {
      console.log('failed to add subscriber to list:', contactId, err)
      resolve()
    })
})

const unsubscribeFromList = (email, listId) => new Promise(resolve => {
  const request = mailjet
    .post("contact", {'version': 'v3'})
    .id(email)
    .action("managecontactslists")
    .request({
        "ContactsLists":[
          {
            "Action":"unsub",
            "ListID": listId,
          },
        ]
      })

  request
    .then((result) => {
      console.log('successfully unsubscribed from list:', email, listId)
      resolve(200)
    })
    .catch((err) => {
      console.log('failed to unsubscribe from list:', email, err.statusCode)
      resolve(err.statusCode)
    })
})

const helper = {
  getSubscriber,
  createSubscriber,
  addToList,
  unsubscribeFromList,
}

export default helper