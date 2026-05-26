import serverless from "serverless-http";
import app from "../../artifacts/api-server/src/app";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handler = serverless(app as any);
