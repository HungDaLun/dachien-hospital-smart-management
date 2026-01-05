// ============================================
// 頭像壓縮 Edge Function
// 功能：
//   1. 自動壓縮頭像圖片至 10KB 以下
//   2. 刪除舊頭像（如果存在）
//   3. 上傳壓縮後的圖片
// ============================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// 壓縮目標：10KB
const MAX_SIZE_BYTES = 10 * 1024; // 10KB
// 建議解析度
const TARGET_SIZE = 300; // 300x300 像素

interface StorageEvent {
  type: string;
  bucket_id: string;
  name: string;
  owner?: string;
}

Deno.serve(async (req: Request) => {
  try {
    // 取得環境變數
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 建立 Supabase 客戶端（使用 service role key 以獲得完整權限）
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 解析請求內容
    const payload: StorageEvent = await req.json();

    // 只處理 avatars bucket 的插入事件
    if (payload.bucket_id !== "avatars" || payload.type !== "INSERT") {
      return new Response(
        JSON.stringify({ message: "忽略非頭像上傳事件" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const filePath = payload.name;
    const userId = payload.owner;

    if (!filePath || !userId) {
      return new Response(
        JSON.stringify({ error: "缺少必要參數" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 驗證路徑格式：user/<user_id>/avatar.*
    if (!filePath.startsWith(`user/${userId}/avatar.`)) {
      return new Response(
        JSON.stringify({ error: "路徑格式錯誤" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. 刪除舊頭像（如果存在）
    try {
      const { data: oldFiles } = await supabase.storage
        .from("avatars")
        .list(`user/${userId}`, {
          search: "avatar.",
        });

      if (oldFiles && oldFiles.length > 0) {
        // 找出所有舊頭像（排除當前檔案）
        const oldFileNames = oldFiles
          .filter((f) => f.name !== filePath.split("/").pop())
          .map((f) => `user/${userId}/${f.name}`);

        if (oldFileNames.length > 0) {
          await supabase.storage.from("avatars").remove(oldFileNames);
        }
      }
    } catch (error) {
      console.warn("刪除舊頭像時發生錯誤:", error);
      // 繼續執行，不中斷流程
    }

    // 2. 下載原始圖片
    const { data: originalFile, error: downloadError } = await supabase.storage
      .from("avatars")
      .download(filePath);

    if (downloadError || !originalFile) {
      return new Response(
        JSON.stringify({ error: "下載原始圖片失敗", details: downloadError }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. 壓縮圖片
    let compressedImage = await compressImage(originalFile);

    // 4. 檢查壓縮後大小
    if (compressedImage.size > MAX_SIZE_BYTES) {
      // 如果還是太大，進一步壓縮
      const furtherCompressed = await compressImageMore(compressedImage);
      if (furtherCompressed.size <= MAX_SIZE_BYTES) {
        compressedImage = furtherCompressed;
      } else {
        console.warn(
          `警告：壓縮後圖片大小為 ${furtherCompressed.size} bytes，仍超過 ${MAX_SIZE_BYTES} bytes 限制`
        );
        // 使用進一步壓縮的版本，即使仍超過限制
        compressedImage = furtherCompressed;
      }
    }

    // 5. 上傳壓縮後的圖片（覆蓋原檔案）
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, compressedImage, {
        contentType: "image/webp",
        upsert: true, // 覆蓋原檔案
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: "上傳壓縮圖片失敗", details: uploadError }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 6. 更新 user_profiles.avatar_url
    const avatarUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${filePath}`;
    await supabase
      .from("user_profiles")
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq("id", userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "頭像壓縮完成",
        originalSize: originalFile.size,
        compressedSize: compressedImage.size,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge Function 錯誤:", error);
    return new Response(
      JSON.stringify({
        error: "處理失敗",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

/**
 * 壓縮圖片至目標大小
 * 注意：Deno Edge Runtime 可能不支援 Canvas API
 * 此實作使用 ImageBitmap API，如果不可用，將回傳原始檔案
 */
async function compressImage(file: Blob): Promise<Blob> {
  try {
    // 嘗試使用 ImageBitmap API（如果可用）
    if (typeof createImageBitmap !== "undefined") {
      const imageBitmap = await createImageBitmap(file);
      
      // 檢查是否支援 OffscreenCanvas
      if (typeof OffscreenCanvas !== "undefined") {
        const canvas = new OffscreenCanvas(TARGET_SIZE, TARGET_SIZE);
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          // 計算縮放比例，保持長寬比
          const scale = Math.min(
            TARGET_SIZE / imageBitmap.width,
            TARGET_SIZE / imageBitmap.height
          );
          const newWidth = imageBitmap.width * scale;
          const newHeight = imageBitmap.height * scale;

          // 居中繪製
          const x = (TARGET_SIZE - newWidth) / 2;
          const y = (TARGET_SIZE - newHeight) / 2;

          ctx.drawImage(imageBitmap, x, y, newWidth, newHeight);

          // 轉換為 WebP 格式（最佳壓縮比）
          const blob = await canvas.convertToBlob({
            type: "image/webp",
            quality: 0.8, // 品質 80%
          });

          imageBitmap.close();
          return blob;
        }
        
        imageBitmap.close();
      }
    }
    
    // 如果不支援 Canvas API，回傳原始檔案
    // 實際部署時，建議使用外部圖片處理服務（如 Cloudinary、ImageKit）
    console.warn("Canvas API 不可用，回傳原始檔案。建議使用外部圖片處理服務。");
    return file;
  } catch (error) {
    console.error("壓縮圖片時發生錯誤:", error);
    // 發生錯誤時回傳原始檔案
    return file;
  }
}

/**
 * 進一步壓縮圖片（如果第一次壓縮後仍太大）
 */
async function compressImageMore(file: Blob): Promise<Blob> {
  try {
    if (typeof createImageBitmap !== "undefined" && typeof OffscreenCanvas !== "undefined") {
      const imageBitmap = await createImageBitmap(file);
      const canvas = new OffscreenCanvas(200, 200); // 更小的尺寸
      const ctx = canvas.getContext("2d");

      if (ctx) {
        const scale = Math.min(200 / imageBitmap.width, 200 / imageBitmap.height);
        const newWidth = imageBitmap.width * scale;
        const newHeight = imageBitmap.height * scale;
        const x = (200 - newWidth) / 2;
        const y = (200 - newHeight) / 2;

        ctx.drawImage(imageBitmap, x, y, newWidth, newHeight);

        // 使用更低的品質
        const blob = await canvas.convertToBlob({
          type: "image/webp",
          quality: 0.6, // 品質 60%
        });

        imageBitmap.close();
        return blob;
      }
      
      imageBitmap.close();
    }
    
    return file;
  } catch (error) {
    console.error("進一步壓縮圖片時發生錯誤:", error);
    return file;
  }
}
