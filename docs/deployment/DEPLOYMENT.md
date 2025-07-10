# Cloudflare Worker 部署指南

本文档提供了如何正确部署和配置 Hugging Face API 代理 Worker 的详细说明。

## 环境变量设置

在 Cloudflare Workers 中，您需要设置以下环境变量：

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages > broad-surf-db28
3. 点击 "Settings" > "Variables"
4. 在 "Environment Variables" 部分，添加以下变量：
   - **名称**: `HUGGINGFACE_API_KEY`
   - **类型**: Secret
   - **值**: 您的 Hugging Face API 密钥（从 Hugging Face 获取）

## 路由配置

确保 Worker 可以通过正确的域名访问：

1. 在 Worker 设置页面，点击 "Triggers" 标签
2. 确保以下域名已添加：
   - `broad-surf-db28.3485573766.workers.dev`
   - 如果您有自定义域名，也应添加它们

## CORS 配置

Worker 已经包含了 CORS 支持，允许以下来源访问：

- 您的 Vercel 部署域名（例如 `virtual-ai-streamer.vercel.app`）
- Worker 自己的域名（`broad-surf-db28.3485573766.workers.dev`）
- 本地开发环境（`localhost:3000` 和 `localhost:5173`）

如果需要添加更多允许的来源，请在 `worker.js` 文件中修改 `ALLOWED_ORIGINS` 数组。

## 部署步骤

1. 确保 `worker.js` 文件已更新
2. 通过 Wrangler CLI 部署：

   ```bash
   npx wrangler publish
   ```

   或者，您可以直接在 Cloudflare Dashboard 中编辑和部署代码

3. 验证 Worker 是否正常工作：
   - 访问 `https://broad-surf-db28.3485573766.workers.dev`
   - 您应该看到一个 JSON 响应（可能是错误消息，这是正常的）

## 故障排除

如果遇到 CORS 错误：

1. 检查请求来源是否在 `ALLOWED_ORIGINS` 列表中
2. 确认是否已正确设置 `HUGGINGFACE_API_KEY` 环境变量
3. 查看 Worker 日志以获取更多详细信息（在 Cloudflare Dashboard 中）

如果遇到 API 密钥错误：

1. 确认您的 Hugging Face API 密钥是否有效
2. 确保已正确设置环境变量

## 更新 Worker

当您需要更新 Worker 代码时，可以：

1. 编辑 `worker.js` 文件
2. 使用 Wrangler 重新部署，或在 Cloudflare Dashboard 中直接编辑
3. 确保任何新的域名都添加到 `ALLOWED_ORIGINS` 列表中 