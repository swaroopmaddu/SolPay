import { Button, Typography } from "@mui/material";
import { Fragment } from "react";

import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { encodeURL, createQR, findTransactionSignature, validateTransactionSignature } from '@solana/pay';
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
        const recipient = new PublicKey("EP8YfUCpbbLVL3zZUZmDWPboFSjpYaSUYYXKc2HRjft9");
        const amount = new BigNumber(0.001);
        const reference = new Keypair().publicKey;
        const label = 'Jungle Cats store';
        const message = 'Jungle Cats store - your order - #001234';
        const memo = 'JC#4098';

        // Create a payment request link
        
        console.log('3. 💰 Create a payment request link \n');
        const url = encodeURL({ recipient, amount, reference, label, message, memo });

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
        const signatureInfo = await findTransactionSignature(connection, reference, undefined, 'confirmed');

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
        const amountInLamports = amount.times(LAMPORTS_PER_SOL).integerValue(BigNumber.ROUND_FLOOR);

        try {
            await validateTransactionSignature(connection, signatureInfo, recipient, amountInLamports, undefined, reference);

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