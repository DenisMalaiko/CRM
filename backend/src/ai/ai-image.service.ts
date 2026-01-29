import OpenAI from "openai";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import * as path from "path";

@Injectable()
export class AiImageService {
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  async generateImage(prompt: string): Promise<string> {
    console.log("GENERATE IMAGE...")
    const result = await this.openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    console.log("FINISH GENERATE IMAGE")
    console.log(result)
    console.log("------------")

    const b64 = result.data?.[0]?.b64_json;

    if (!b64) {
      throw new Error("Image generation failed");
    }

    return this.saveBase64Image(b64);
  }

  async saveBase64Image(b64: string): Promise<string> {
    const buffer = Buffer.from(b64, "base64");
    const fileName = `${randomUUID()}.png`;

    // 👇 1. Директорія для картинок
    const imagesDir = path.join(
      process.cwd(),
      "public",
      "images"
    );

    // 👇 2. Гарантуємо, що вона існує (ВАЖЛИВО для Docker)
    await mkdir(imagesDir, { recursive: true });

    // 👇 3. Повний шлях до файлу
    const filePath = path.join(imagesDir, fileName);

    // 👇 4. Запис файлу
    await writeFile(filePath, buffer);

    // 👇 5. Public URL (через static assets)
    return `/images/${fileName}`;
  }
}