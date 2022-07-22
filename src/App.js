import "./App.css";
import { useState, useEffect } from "react";
import awsExports from "./aws-exports";
import {
  CognitoIdentityClient,
  GetIdCommand,
} from "@aws-sdk/client-cognito-identity";
import {
  S3Client,
  ListObjectsCommand,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { createRequest } from "@aws-sdk/util-create-request";
import { formatUrl } from "@aws-sdk/util-format-url";
import { fromCognitoIdentity } from "@aws-sdk/credential-provider-cognito-identity";

function App() {
  const [files, setFiles] = useState([]);
  const [client, setClient] = useState(null);
  const {
    aws_user_files_s3_bucket,
    aws_user_files_s3_bucket_region,
    aws_cognito_identity_pool_id,
  } = awsExports;

  useEffect(() => {
    const cognitoClient = new CognitoIdentityClient({
      region: aws_user_files_s3_bucket_region,
    });

    async function getCredentials(cognitoClient) {
      const { IdentityId } = await cognitoClient.send(
        new GetIdCommand({
          IdentityPoolId: aws_cognito_identity_pool_id,
        })
      );

      const cognitoIdentityParams = {
        client: cognitoClient,
        identityId: IdentityId,
      };

      const credentialsFromCognitoIdentity = fromCognitoIdentity(
        cognitoIdentityParams
      );

      return credentialsFromCognitoIdentity();
    }
    const credentials = getCredentials(cognitoClient);

    const client = new S3Client({
      region: aws_user_files_s3_bucket_region,
      credentials,
    });

    setClient(client);
  }, [aws_cognito_identity_pool_id, aws_user_files_s3_bucket_region]);

  async function upload(file) {
    const target = file.target;
    const myFile = target.files?.[0];
    console.log("test", myFile);

    const uploader = new PutObjectCommand({
      Bucket: aws_user_files_s3_bucket,
      Key: "public/abc12344test-key",
      Body: myFile,
    });
    const s = await client.send(uploader);

    console.log("s", s);
  }

  async function grabFile() {
    const params = {
      Bucket: aws_user_files_s3_bucket,
      Key: "public/abc1234",
    };
    const target = new GetObjectCommand(params);
    const t = await client.send(target);

    // signed

    const signer = new S3RequestPresigner({ ...client.config });
    const request = await createRequest(client, new GetObjectCommand(params));
    // Default is 15 mins as defined in V2 AWS SDK
    const url = formatUrl(
      await signer.presign(request, {
        expiresIn: 900,
      })
    );
    console.log("target", t, url);
  }

  function list() {
    const listObjectsCommand = new ListObjectsCommand({
      Bucket: aws_user_files_s3_bucket,
      Prefix: "public/abc1234",
    });

    client.send(listObjectsCommand).then((response) => {
      const mappedResponse = response.Contents.map((v) => {
        return { key: v.Key, size: v.Size, lastModified: v.LastModified };
      });
      setFiles(mappedResponse);
    });
  }

  return (
    <div className="App">
      <button onClick={() => list()}>List Items</button>
      <button onClick={() => grabFile()}>Grab File</button>
      <input type="file" onChange={(event) => upload(event)} />
      Upload
      <ul>
        {files && files.map((file, index) => <li key={index}>{file.key}</li>)}
      </ul>
    </div>
  );
}

export default App;
