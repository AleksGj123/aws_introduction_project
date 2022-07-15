const https = require('https')
const AWS = require('aws-sdk')

function getRequest(url) {
  
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let rawData = ''

      res.on('data', chunk => {
        rawData += chunk
      })

      res.on('end', () => { 
          resolve(rawData)
        })
    })
  })
}

async function writeIntoDB(location, temperature){
  const ddb = new AWS.DynamoDB()
  const timestamp = new Date()
  const timestampIso = timestamp.toISOString()
  console.log(timestampIso)

  const params = {
    TableName: 'weather-info',
    Item: {
      'timestamp' : {S: timestampIso},
      'location' : {S: location},
      'temperature' : {N: temperature}
    }
  }

  try {
    const data = await ddb.putItem(params).promise()
    console.log('Success')
    console.log(data)
    return data
  } catch (err) {
    console.log('Failure', err.message)
    // there is no data here, you can return undefined or similar
  }
  
}

async function getParameter(parameterName){
  const ssm = new AWS.SSM()
  const data = await ssm
        .getParameter({ Name: parameterName})
        .promise()
  const param = data.Parameter || {}
  const value = param.Value || ''
  return value
}

exports.handler = async event => {

    const urlParameter = '/parameters/url'
  
    // get URL:
    const urlParamterValue = await getParameter(urlParameter)
    console.log('Value is: ' + urlParamterValue)

    // load wearther info
    const result = await getRequest(urlParamterValue)
    const json = JSON.parse(result)
    console.log('json is: ', json)
    console.log('location is: ' + json.location.name)
    console.log('temperature is: ' + json.current.temp_c)

    // write into database
    await writeIntoDB(json.location.name, json.current.temp_c.toString())
    
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(json),
    }
}