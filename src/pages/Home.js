import { Button, Typography } from "@mui/material";
import { Fragment } from "react";

import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { encodeURL, createQR, findTransactionSignature, validateTransactionSignature, FindTransactionSignatureError } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { simulateWalletInteraction } from "../utils/simulateWalletInteraction";
import { useWallet } from '@solana/wallet-adapter-react';

function Home() {

    const { publicKey, sendTransaction } = useWallet();

    async function main() {
        // Variable to keep state of the payment status
        let paymentStatus;

        // Connecting to devnet for this example
        console.log('1. ✅ Establish connection to the network');
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const version = await connection.getVersion();
        console.log('Connection to cluster established:', "devnet  ", version);

        // Simulate a checkout experience
         
        console.log('2. 🛍 Simulate a customer checkout \n');
        const merchant = new PublicKey("EP8YfUCpbbLVL3zZUZmDWPboFSjpYaSUYYXKc2HRjft9");
        const amount = new BigNumber(0.01);
        const reference = new Keypair().publicKey;
        const label = 'Jungle Cats store';
        const message = 'Jungle Cats store - your order - #001234';
        const memo = 'JC#4098';

        // Create a payment request link
        
        console.log('3. 💰 Create a payment request link \n');
        const url = encodeURL({ recipient: merchant, amount, reference, label, message, memo });

        // encode URL in QR code
        const qrCode = createQR(url);

        // get a handle of the element
        const element = document.getElementById('qr-code');

        // append QR code to the element
        qrCode.append(element);

        // -- snippet -- //

        // Simulate wallet interaction
        console.log('4. 🔐 Simulate wallet interaction \n');
        await simulateWalletInteraction(connection, url, sendTransaction);

        /**
         * Wait for payment to be confirmed
         *
         * When a customer approves the payment request in their wallet, this transaction exists on-chain.
         * You can use any references encoded into the payment link to find the exact transaction on-chain.
         * Important to note that we can only find the transaction when it's **confirmed**
         */
        console.log('\n5. Find the transaction');
        let signatureInfo;
        const { signature } = await new Promise((resolve, reject) => {
            /**
             * Retry until we find the transaction
             *
             * If a transaction with the given reference can't be found, the `findTransactionSignature`
             * function will throw an error. There are a few reasons why this could be a false negative:
             *
             * - Transaction is not yet confirmed
             * - Customer is yet to approve/complete the transaction
             *
             * You can implement a polling strategy to query for the transaction periodically.
             */
            const interval = setInterval(async () => {
                console.count('Checking for transaction...');
                try {
                    signatureInfo = await findTransactionSignature(connection, reference, undefined, 'confirmed');
                    console.log('\n 🖌  Signature found: ', signatureInfo.signature);
                    clearInterval(interval);
                    resolve(signatureInfo);
                } catch (error) {
                    if (!(error instanceof FindTransactionSignatureError)) {
                        console.error(error);
                        clearInterval(interval);
                        reject(error);
                    }
                }
            }, 1000);
        });

        // Update payment status
        paymentStatus = 'confirmed';

        // -- snippet -- //

        /**
         * Validate transaction
         *
         * Once the `findTransactionSignature` function returns a signature,
         * it confirms that a transaction with reference to this order has been recorded on-chain.
         *
         * `validateTransactionSignature` allows you to validate that the transaction signature
         * found matches the transaction that you expected.
         */
        console.log('\n6. 🔗 Validate transaction \n');
        
        try {
            await validateTransactionSignature(connection, signature, merchant, amount, undefined, reference);

            // Update payment status
            paymentStatus = 'validated';
            console.log(paymentStatus);
            console.log('✅ Payment validated');
            console.log('📦 Ship order to customer');
        } catch (error) {
            console.error('❌ Payment failed', error);
        }
    }

    return (
        <Fragment>
            <Typography variant="h1">Sol Starter</Typography>
            <Button variant="contained" color="primary" onClick={main}>Checkout using Solana Pay</Button>
            <div id="qr-code" />
        </Fragment>
    );
}

export default Home;