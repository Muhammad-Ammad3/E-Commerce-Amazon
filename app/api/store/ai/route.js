// import authSeller from "@/middelwares/authSeller";
// import { getAuth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import { openai } from "@/configs/openai";

// async function main(base64Image, mimeType) {
//   const messages = [
//     {
//       role: "system",
//       content: `
//             You are a product listing assistant for an e-commerce store.
//             Your job is to analyze an image of a product and generate structure data.

//             Respond only with raw JSON (no code block, no markdown, no explanation),
//             The JSON must strictly follow this schema:

//             {
//              "name": string,   // Short name of the product
//              "description": string,  // Marketing-friendly description of the product
//             }
//         `,
//     },
//     {
//       role: "user",
//       content: [
//         {
//           type: "text",
//           text: "Analyze this image and return name + description.",
//         },
//         {
//           type: "image_url",
//           image_url: {
//             url: `data:${mimeType};base64,${base64Image}`,
//           },
//         },
//       ],
//     },
//   ];

//   const response = await openai.chat.completions.create({
//     model: process.env.OPENAI_MODEL,
//     messages,
//   });

//   const raw = response.choices[0].message.content;

//   // remove ```json or ``` wrappers if present
//   const cleaned = raw.replace(/```json|```/g, "").trim();

//   let parsed;
//   try {
//     parsed = JSON.parse(cleaned);
//   } catch (error) {
//     throw new Error("AI did not return valid JSON");
//   }
//   return parsed;
// }

// export async function POST(request) {
//   try {
//     const { userId } = getAuth(request);
//     const isSeller = await authSeller(userId);

//     if (!isSeller) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const { base64Image, mimeType } = await request.json();
//     const result = await main(base64Image, mimeType);
//     return NextResponse.json({ ...result });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: error.message || error.code },
//       { status: 400 },
//     );
//   }
// }



import authSeller from "@/middlewares/authSeller";
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
You are a product listing assistant for an e-commerce store.

Your job is to analyze an image of a product and generate structured data.

Respond ONLY with valid raw JSON.
Do not use markdown or code blocks.

Schema:
{
  "name": string,
  "description": string
}
      `,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Analyze this image and return product name and description.",
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
    temperature: 0.5,
  });

  const raw = response?.choices?.[0]?.message?.content;

  if (!raw) {
    throw new Error("Empty response from AI");
  }

  // Remove markdown wrappers if AI accidentally returns them
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Invalid AI JSON:", cleaned);
    throw new Error("AI did not return valid JSON");
  }
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json(
        { message: "Seller access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { base64Image, mimeType } = body;

    if (!base64Image || !mimeType) {
      return NextResponse.json(
        { error: "base64Image and mimeType are required" },
        { status: 400 }
      );
    }

    const result = await main(base64Image, mimeType);

    return NextResponse.json(result);

  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}