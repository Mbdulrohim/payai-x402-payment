import { NextRequest, NextResponse } from "next/server";

// In-memory store for payment verifications (in production, use a database)
const verifiedPayments = new Set<string>();

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  // Check if this is a payment verification request
  if (authHeader?.startsWith("x402 svm/1; signature=")) {
    const signature = authHeader.replace("x402 svm/1; signature=", "");

    // In a real implementation, you would verify the transaction on-chain
    // For demo purposes, we'll accept any signature as valid
    if (signature && signature.length > 0) {
      verifiedPayments.add(signature);

      return NextResponse.json({
        message: "Protected content accessed successfully!",
        paid: true,
        timestamp: new Date().toISOString(),
        transactionSignature: signature,
      });
    }
  }

  // Return 402 Payment Required with x402 payment requirements
  return NextResponse.json(
    {
      x402Version: 1,
      accepts: [
        {
          scheme: "exact",
          network: "solana",
          maxAmountRequired: "10000", // 0.01 USDC (6 decimals)
          resource: "/api/protected",
          description: "Access to protected content",
          mimeType: "application/json",
          payTo: "6FFe7xj9fqosbXfFF8SjH89yFqguv5Ah8h4cJMhNPiXh",
          asset: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC mint
          data: "x402-payment-token-" + Date.now(), // Unique token for this request
        },
      ],
      error: null,
    },
    {
      status: 402,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
