import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
const s3Client = new S3Client();
const dynamodbClient = new DynamoDBClient();

let FRAUDTABLE = process.env.FRAUDTABLE;

let response;

exports.lambdaHandler = async (event, context) => {
    try {

        // 1. check the hash is available in dynamodb
        // the variable we need is the {f} variable stored in event.pathParameters.f
        let fraudId = event.pathParameters.f;

        const getItemCcommand = new GetItemCommand({
            TableName: FRAUDTABLE,
            Key: fraudId
        });
        const fraudDataResponse = await dynamodbClient.send(getItemCcommand);

        // if there is an item check if it has downloads left
        let downloadsRemaining = 0;
        if(fraudDataResponse.Item) {
            // CHECK IF IT HAS DOWNLOADS LEFT OR NOT
            // AND SET BELOW VARIABLE ACCORDINGLY
            downloadsRemaining = 0;

            if(downloadsRemaining < 1) {
                // 2. return a 404 if [1] fails
                response = {
                    'statusCode': 404,
                    'body': "Not found"
                }
            } else {

                // 3. create the 30 second expiring link to the s3 file

                // get the object data from the DynamoDB Item

                // create the expiring link

                // 4. redirect the user to the link in [3]

                let body = `<html>
                <header>
                <title>Here Are Dragons</title>
                </header>
                <body>
                    <h1>Fraud Secure Page - Here Be Dragons</h1>
                    <p>Redirecting</p>
                </body>
                </html>`
                
                response = {
                    'statusCode': 301,
                    headers: {
                        location: [{
                          key: 'Location',
                          value: `http://github.com/alphagov/` // CHANGE THIS TO THE URL OF THE S3 FILE
                        }]
                      }
                }
            }

        } else {
            response = {
                'statusCode': 404,
                'body': "Not found"
            }
        }


    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
