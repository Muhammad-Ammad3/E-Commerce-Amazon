import authSeller from "@/middelwares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { openai } from "@/configs/openai";

async function main(base64Image, mimeType) {
  if (!base64Image || !mimeType) {
    throw new Error("Image data or mimeType missing");
  }

  if (!process.env.OPENAI_MODEL) {
    throw new Error("OPENAI_MODEL is not configured");
  }

  const messages = [
    {
      role: "system",
      content: `
You are an e-commerce assistant. Analyze the product image and return a JSON object with the following keys:
- "name": string (product name)
- "description": string (product description)
- "mrp": number (estimated high retail/original price in USD, pure number)
- "price": number (estimated discounted/offer price in USD, must be less than or equal to mrp, pure number)

Do not include any currency symbols or markdown text.
      `,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Return JSON containing name, description, mrp, and offer price for this product based on its value.",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`,
          },
        },
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages,
    temperature: 0.4, 
    response_format: { type: "json_object" },
  });

  const raw = response?.choices?.[0]?.message?.content;

  if (!raw) {
    throw new Error("Empty response from AI");
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("Invalid AI JSON:", raw);
    throw new Error("AI did not return valid JSON");
  }
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json(
        { message: "Seller access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { base64Image, mimeType } = body;

    if (!base64Image || !mimeType) {
      return NextResponse.json(
        { error: "base64Image and mimeType are required" },
        { status: 400 },
      );
    }

    const result = await main(base64Image, mimeType);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500 },
    );
  }
}
