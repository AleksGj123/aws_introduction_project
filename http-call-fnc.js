const https = require('https');

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

exports.handler = async event => {
  
    const url = 'https://nuakw3sawarqcxlu5pvieox4by0gfvpk.lambda-url.eu-central-1.on.aws/';
    const result = await getRequest(url);
    const json = JSON.parse(result)
    console.log('json is: ', json);
    console.log('location is: ' + json.location.name)
    console.log('temperature is: ' + json.current.temp_c)

    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(json),
    };
};