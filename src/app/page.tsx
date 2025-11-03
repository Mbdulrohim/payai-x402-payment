"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import {
  createPaymentHeader,
  selectPaymentRequirements,
} from "@payai/x402/client";
import { createSigner } from "@payai/x402/types";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

async function processSolanaPayment(
  payment: any,
  connectionUrl: string = process.env.NEXT_PUBLIC_QUICK_NODE_HTTPS ||
    "https://api.mainnet-beta.solana.com"
) {
  const connection = new Connection(connectionUrl);
  const provider = (window as any).solana;

  if (!provider?.isPhantom) {
    throw new Error("Phantom wallet not found. Please install it to continue.");
  }
  await provider.connect();

  const sender = provider.publicKey;
  if (!sender) {
    throw new Error("Wallet not connected or public key not available.");
  }

  // Use the production recipient address
  const recipient = new PublicKey(
    "6FFe7xj9fqosbXfFF8SjH89yFqguv5Ah8h4cJMhNPiXh"
  );
  // USDC mint on Solana mainnet
  const mint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

  const senderATA = await getAssociatedTokenAddress(mint, sender);
  const recipientATA = await getAssociatedTokenAddress(mint, recipient);

  const transaction = new Transaction();

  const recipientATAInfo = await connection.getAccountInfo(recipientATA);
  if (!recipientATAInfo) {
    const createATAInstruction = createAssociatedTokenAccountInstruction(
      sender,
      recipientATA,
      recipient,
      mint
    );
    transaction.add(createATAInstruction);
  }

  const amount = BigInt(payment.maxAmountRequired);

  const transferIx = createTransferInstruction(
    senderATA,
    recipientATA,
    sender,
    amount,
    [],
    TOKEN_PROGRAM_ID
  );
  transaction.add(transferIx);

  transaction.feePayer = sender;
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  const signedTx = await provider.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signedTx.serialize());
  await connection.confirmTransaction(signature, "confirmed");

  return signature;
}

export default function Home() {
  const { publicKey, signMessage } = useWallet();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    if (!publicKey || !signMessage) return;

    setLoading(true);
    setMessage("");

    try {
      // First, make a request to our protected endpoint that returns 402
      const response = await fetch("/api/protected", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Requesting access to protected content",
          requestedBy: publicKey.toBase58(),
        }),
      });

      // Check if we got a 402 response with payment requirements
      if (response.status === 402) {
        const paymentData = await response.json();
        if (paymentData.accepts?.length) {
          // Select the appropriate payment requirement (Solana USDC)
          const selectedPayment = selectPaymentRequirements(
            paymentData.accepts,
            "solana",
            "exact"
          );

          console.log("Selected payment:", selectedPayment);

          // For now, fall back to manual payment processing
          const signature = await processSolanaPayment(selectedPayment);

          // Retry the request with the payment header
          const retryResponse = await fetch("/api/protected", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `x402 svm/1; signature=${signature}`,
            },
            body: JSON.stringify({
              message: "Requesting access to protected content via x402",
              payment_data_token: (selectedPayment as any).data,
            }),
          });

          if (!retryResponse.ok) {
            throw new Error(
              `Payment verification failed: ${retryResponse.status}`
            );
          }

          const data = await retryResponse.json();
          console.log(
            `x402 Payment successful! Protected content accessed. Response: ${JSON.stringify(
              data
            )}`
          );
          setMessage(`tx:${data.transactionSignature || "completed"}`);
        } else {
          throw new Error("No payment methods accepted");
        }
      } else if (response.ok) {
        // If no 402 response, just log the successful response
        const data = await response.json();
        console.log(`Request successful! Response: ${JSON.stringify(data)}`);
        setMessage(
          "Request completed successfully! Check console for details."
        );
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setMessage(`❌ Payment failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🚀 Production x402 Payment</CardTitle>
          <CardDescription>
            Real x402 payment protocol implementation. Pay 0.01 USDC to access
            protected content. Funds will be sent to the production wallet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <WalletMultiButton />
          </div>
          {publicKey && (
            <div className="space-y-4">
              <div className="text-sm">
                <strong>Connected Wallet</strong>
                <br />
                {publicKey.toBase58().slice(0, 6)}...
                {publicKey.toBase58().slice(-4)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <div className="text-lg font-semibold">$0.01</div>
                </div>
                <div>
                  <Label>Wallet</Label>
                  <div className="text-sm">
                    {publicKey.toBase58().slice(0, 6)}...
                    {publicKey.toBase58().slice(-4)}
                  </div>
                </div>
                <div>
                  <Label>Available Balance</Label>
                  <div className="text-sm">$0.00</div>
                </div>
                <div>
                  <Label>Currency</Label>
                  <div className="text-sm">USDC</div>
                </div>
              </div>
              <div>
                <Label>Network</Label>
                <div className="text-sm">Solana Mainnet</div>
              </div>
              <div className="text-center text-sm text-gray-600">
                Secure payment powered by Solana
              </div>
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full"
              >
                {loading
                  ? "Processing x402 Payment..."
                  : "Pay 0.01 USDC via x402"}
              </Button>
              <div className="text-center text-sm text-gray-600">
                Recipient: 6FFe7xj9fqosbXfFF8SjH89yFqguv5Ah8h4cJMhNPiXh
              </div>
              {message && (
                <div className="text-center text-sm mt-2">
                  {message.startsWith("tx:") ? (
                    <div className="space-y-2">
                      <div className="text-green-600 font-medium">
                        ✅ x402 Payment completed successfully! Transaction:
                      </div>
                      <div className="flex gap-2 justify-center">
                        <a
                          href={`https://solscan.io/tx/${
                            message.split("tx:")[1]
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          View on Solscan
                        </a>
                        <a
                          href="https://www.x402scan.com/transactions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          View x402 Ecosystem
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`${
                        message.includes("successful")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {message}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
