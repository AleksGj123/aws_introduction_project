const https = require('https');
var AWS = require('aws-sdk');
// Set the region 
//AWS.config.update({region: 'REGION'});

// Create the DynamoDB service object

function getRequest(url) {
  
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let rawData = '';

      res.on('data', chunk => {
        rawData += chunk;
      });

      res.on('end', () => { 
          resolve(rawData);
        });
    });
  });
}

async function writeIntoDB(location, temperature){
  var ddb = new AWS.DynamoDB();
  var timestamp = Date.now()
  console.log(timestamp)

  var params = {
    TableName: 'weather-info',
    Item: {
      'timestamp' : {S: timestamp},
      'location' : {S: location},
      'temperature' : {N: temperature}
    }
  };

  console.log("test1")

  try {
    const data = await ddb.putItem(params).promise()
    console.log("Success")
    console.log(data)
    return data
  } catch (err) {
    console.log("Failure", err.message)
    // there is no data here, you can return undefined or similar
  }

  console.log("test2")
  
}

exports.handler = async event => {
  
    const url = 'https://nuakw3sawarqcxlu5pvieox4by0gfvpk.lambda-url.eu-central-1.on.aws/';
    const result = await getRequest(url)
    const json = JSON.parse(result)
    console.log('json is: ', json)
    console.log('location is: ' + json.location.name)
    console.log('temperature is: ' + json.current.temp_c)

    await writeIntoDB(json.location.name, json.current.temp_c.toString())
    
    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(json),
    };
};