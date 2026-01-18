/**
 * S3/MinIO 儲存層抽象
 * Hub Layer - 資料主權層
 * 支援 AWS S3 與 MinIO（本地部署）
 */
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * S3 客戶端設定介面
 */
interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  useSSL?: boolean;
  forcePathStyle?: boolean; // MinIO 需要設定為 true
}

/**
 * 建立 S3 客戶端
 */
function createS3Client(config: S3Config): S3Client {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.forcePathStyle ?? false, // MinIO 需要
  });
}

/**
 * 取得 S3 設定（從環境變數）
 */
function getS3Config(): S3Config {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;
  const bucketName = process.env.S3_BUCKET_NAME;
  const region = process.env.S3_REGION || 'us-east-1';

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error('缺少 S3 環境變數設定');
  }

  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucketName,
    region,
    useSSL: endpoint.startsWith('https://'),
    forcePathStyle: true, // 預設支援 MinIO
  };
}

/**
 * 上傳檔案至 S3/MinIO
 * @param fileBuffer 檔案內容
 * @param key 儲存路徑（如 'marketing/2025_plan.pdf'）
 * @param contentType MIME 類型
 * @returns ETag（用於版本控制）
 */
export async function uploadToS3(
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const config = getS3Config();
  const client = createS3Client(config);

  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  const response = await client.send(command);

  if (!response.ETag) {
    throw new Error('上傳失敗：未取得 ETag');
  }

  return response.ETag;
}

/**
 * 從 S3/MinIO 下載檔案
 * @param key 儲存路徑
 * @returns 檔案內容（Buffer）
 */
export async function downloadFromS3(key: string): Promise<Buffer> {
  const config = getS3Config();
  const client = createS3Client(config);

  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  const response = await client.send(command);

  if (!response.Body) {
    throw new Error('檔案不存在或無法讀取');
  }

  // 使用 SDK 內建方法轉換為 Buffer，避免使用 any 強制轉型
  const byteArray = await response.Body.transformToByteArray();
  return Buffer.from(byteArray);
}

/**
 * 刪除 S3/MinIO 中的檔案
 * @param key 儲存路徑
 */
export async function deleteFromS3(key: string): Promise<void> {
  const config = getS3Config();
  const client = createS3Client(config);

  const command = new DeleteObjectCommand({
    Bucket: config.bucketName,
    Key: key,
  });

  await client.send(command);
}

/**
 * 產生預簽名 URL（用於安全存取）
 * @param key 儲存路徑
 * @param expiresIn 過期時間（秒），預設 1 小時
 * @returns 預簽名 URL
 */
export async function getSignedUrlForS3(
  key: string,
  expiresIn: number = 3600,
  options?: { responseContentDisposition?: string }
): Promise<string> {
  const config = getS3Config();
  const client = createS3Client(config);

  const command = new GetObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ResponseContentDisposition: options?.responseContentDisposition,
  });

  return await getSignedUrl(client, command, { expiresIn });
}
