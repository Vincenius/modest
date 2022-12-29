import moment from 'moment'

const getDateString = date => {
  const aDayAgo = moment().subtract(1, 'days')
  const postDate = moment(date)

  return (aDayAgo < postDate)
    ? postDate.fromNow()
    : postDate.format('LLL')
}

export default getDateString
