import {
  CloudFrontRequestEvent,
  CloudFrontRequestHandler,
  CloudFrontResponseCallback,
} from "aws-lambda";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { parseUrl } from "@aws-sdk/url-parser";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { Sha256 } from "@aws-crypto/sha256-js";

export const handler: CloudFrontRequestHandler = async (
  event: CloudFrontRequestEvent,
  _context,
) => {
  const request = event.Records[0].cf.request;
  console.log("originalRequest", JSON.stringify(request));

  const url = `https://${request.headers.host[0].value}${request.uri}`;

  // リクエストボディがある場合は、ここで取得します
  const body = request.body?.data || "";

  const parsedUrl = parseUrl(url);
  console.log("parsedUrl", { parsedUrl });

  const httpRequest = new HttpRequest({
    headers: {
      host: parsedUrl.hostname || "",
      ...Object.fromEntries(
        Object.entries(request.headers)
          .filter(([k, v]) => k.toLowerCase() !== "x-forwarded-for") // x-forwarded-forはLambdaに到達するまでにCloudFrontに書き換えられる可能性があり、署名には含めない
          .map(([k, v]) => [k.toLowerCase(), v[0].value]),
      ),
    },
    hostname: parsedUrl.hostname || "",
    method: request.method,
    path: parsedUrl.path,
    body: body,
  });
  console.log("httpRequest", { httpRequest });

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: "ap-northeast-1",
    service: "lambda",
    sha256: Sha256,
  });

  const signedRequest = await signer.sign(httpRequest);
  console.log("signedRequest", { signedRequest });

  // 署名されたヘッダーをCloudFrontリクエストに追加
  for (const key of [
    "authorization",
    "x-amz-date",
    "x-amz-security-token",
    "x-amz-content-sha256",
  ]) {
    request.headers[key] = [{ key: key, value: signedRequest.headers[key] }];
  }
  console.log("modifiedRequest", JSON.stringify(request));

  return request;
};
