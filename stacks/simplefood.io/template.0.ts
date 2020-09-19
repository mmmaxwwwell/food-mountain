import { BuildSettings } from '../../classes/BuildSettings'
import {
  readFileSync,
  writeFileSync,
  createWriteStream,
  createReadStream,
} from 'fs'
import { exec, spawn, fork, execFile } from 'promisify-child-process'
import AWS from 'aws-sdk'

const buildAndUploadUpdateLambda = (settings: BuildSettings, uniq) =>
  new Promise(async (resolve, reject) => {
    console.log('building update lambda')
    const { stdout, stderr } = await exec('npm i', {
      cwd: './stacks/simplefood.io/engine',
    })

    await new Promise((resolve2, reject2) => {
      var zipFolder = require('zip-folder')
      zipFolder(
        './stacks/simplefood.io/engine',
        './stacks/simplefood.io/update.zip',
        function(err: any) {
          if (err) {
            reject2(err)
          } else {
            resolve2()
          }
        }
      )
    })
    console.log('uploading update lambda')
    await new Promise(async (resolve3, reject3) => {
      const filePath = './stacks/simplefood.io/update.zip'
      const Bucket = `${settings.cloudFormationStackName}-private-${settings.env}`
      const Key = `lambdas/update/${uniq}.zip`
      const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

      // let objList = await s3.listObjectsV2({ Bucket }).promise()
      // console.log(objList.Contents)
      // let items = objList.Contents?.filter(item => {
      //   const match = item?.Key?.match(/lambdas\/update\/\d{1,}\.zip/)
      //   console.log({ item, match })
      //   return match
      // })

      // items?.forEach(item => {
      //   s3.deleteObject({
      //     Bucket,
      //     Key: item?.Key,
      //   })
      // })

      // process.exit()

      const params = {
        Bucket,
        Key,
        Body: await readFileSync(filePath),
      }

      const result = await s3.upload(params).promise()

      resolve3(result)
    })
    console.log('update lambda complete')
    resolve(uniq)
  })

const config = (settings: BuildSettings) => {
  return new Promise(async (resolve, reject) => {
    const uniq = Math.floor(Math.random() * Math.floor(25565))
    await buildAndUploadUpdateLambda(settings, uniq)
    resolve({
      AWSTemplateFormatVersion: '2010-09-09',
      Description: `${settings.cloudFormationStackName} serverless stack`,
      Parameters: {
        KeyName: {
          Description: 'Key pair to allow SSH access to the instance',
          Type: 'AWS::EC2::KeyPair::KeyName',
        },
      },
      Resources: {
        PublicBucket: {
          Type: 'AWS::S3::Bucket',
          Properties: {
            BucketName: `${settings.cloudFormationStackName}-public-${settings.env}`,
            AccessControl: 'PublicRead',
            WebsiteConfiguration: {
              IndexDocument: 'index.html',
              ErrorDocument: 'error.html',
            },
            PublicAccessBlockConfiguration: {
              BlockPublicAcls: true,
              BlockPublicPolicy: true,
              IgnorePublicAcls: true,
              RestrictPublicBuckets: true,
            },
          },
        },
        PrivateBucket: {
          Type: 'AWS::S3::Bucket',
          Properties: {
            BucketName: `${settings.cloudFormationStackName}-private-${settings.env}`,
            AccessControl: 'Private',
            PublicAccessBlockConfiguration: {
              BlockPublicAcls: true,
              BlockPublicPolicy: true,
              IgnorePublicAcls: true,
              RestrictPublicBuckets: true,
            },
          },
        },
        PublicBucketPolicy: {
          Type: 'AWS::S3::BucketPolicy',
          Properties: {
            PolicyDocument: {
              Id: 'PublicBucketPolicy',
              Version: '2012-10-17',
              Statement: [
                {
                  Sid: 'PublicReadGetObject',
                  Effect: 'Allow',
                  Principal: {
                    CanonicalUser: {
                      'Fn::GetAtt': [
                        'PublicBucketCloudFrontOriginAccessIdentity',
                        'S3CanonicalUserId',
                      ],
                    },
                  },
                  Action: 's3:GetObject',
                  Resource: `arn:aws:s3:::${settings.cloudFormationStackName}-public-${settings.env}/*`,
                },
              ],
            },
            Bucket: {
              Ref: 'PublicBucket',
            },
          },
        },
        RecipesDynamoTable: {
          Type: 'AWS::DynamoDB::Table',
          Properties: {
            AttributeDefinitions: [
              {
                AttributeName: 'slug',
                AttributeType: 'S',
              },
            ],
            KeySchema: [
              {
                AttributeName: 'slug',
                KeyType: 'HASH',
              },
            ],
            ProvisionedThroughput: {
              ReadCapacityUnits: '1',
              WriteCapacityUnits: '1',
            },
            TableName: `${settings.cloudFormationStackName}-recipes-${settings.env}`,
          },
        },
        PublicBucketCloudFrontOriginAccessIdentity: {
          Type: 'AWS::CloudFront::CloudFrontOriginAccessIdentity',
          Properties: {
            CloudFrontOriginAccessIdentityConfig: {
              Comment: 's3 bucket cf distro oai',
            },
          },
        },
        PublicBucketCloudFrontDistro: {
          Type: 'AWS::CloudFront::Distribution',
          Properties: {
            DistributionConfig: {
              Origins: [
                {
                  DomainName: {
                    'Fn::GetAtt': ['PublicBucket', 'DomainName'],
                  },
                  Id: `public-bucket-origin-${settings.env}`,
                  CustomOriginConfig: {
                    OriginProtocolPolicy: 'https-only',
                    OriginSSLProtocols: ['TLSv1.2'],
                  },
                },
              ],
              Enabled: 'true',
              DefaultRootObject: 'index.html',
              Aliases: [
                'simplefood.io',
                'www.simplefood.io',
                'dev.simplefood.io',
                // `${settings.env == 'prod' ? '' : settings.env + '.'}${
                //   settings.applicationName
                // }`,
                // `www.${
                //   settings.applicationName
                // }`,
              ],
              DefaultCacheBehavior: {
                AllowedMethods: [
                  'DELETE',
                  'GET',
                  'HEAD',
                  'OPTIONS',
                  'PATCH',
                  'POST',
                  'PUT',
                ],
                TargetOriginId: `public-bucket-origin-${settings.env}`,
                ForwardedValues: {
                  QueryString: 'false',
                  Cookies: { Forward: 'none' },
                },
                ViewerProtocolPolicy: 'allow-all',
              },
              ViewerCertificate: {
                AcmCertificateArn:
                  'arn:aws:acm:us-east-1:169334054005:certificate/812cc46a-96db-45be-a204-edfd3bed232e',
                MinimumProtocolVersion: 'TLSv1.2_2018',
                SslSupportMethod: 'sni-only',
              },
            },
          },
        },
        UpdateLambda: {
          Type: 'AWS::Lambda::Function',
          Properties: {
            Handler: 'index.handler',
            Role: {
              'Fn::GetAtt': ['UpdateLambdaRole', 'Arn'],
            },
            Code: {
              S3Bucket: `${settings.cloudFormationStackName}-private-${settings.env}`,
              S3Key: `lambdas/update/${uniq}.zip`,
            },
            Runtime: 'nodejs12.x',
            Timeout: 25,
          },
        },
        UpdateLambdaRole: {
          Type: 'AWS::IAM::Role',
          Properties: {
            AssumeRolePolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Principal: {
                    Service: ['lambda.amazonaws.com'],
                  },
                  Action: ['sts:AssumeRole'],
                },
              ],
            },
          },
        },
        UpdateLambdaRolePolicies: {
          Type: 'AWS::IAM::Policy',
          Properties: {
            PolicyName: 'UpdateLambdaRolePolicy',
            PolicyDocument: {
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Action: 's3:*Object',
                  Resource: [
                    `arn:aws:s3:::${settings.cloudFormationStackName}-public-${settings.env}/*`,
                    `arn:aws:s3:::${settings.cloudFormationStackName}-private-${settings.env}/*`,
                  ],
                },
              ],
            },
            Roles: [
              {
                Ref: 'UpdateLambdaRole',
              },
            ],
          },
        },
      },
    })
  })
}

module.exports = {
  config,
}
