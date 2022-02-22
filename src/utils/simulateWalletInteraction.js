import { PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import { parseURL, createTransaction } from '@solana/pay';

export async function simulateWalletInteraction(connection, url, sendTransaction) {
    /**
     * For example only
     *
     * The URL that triggers the wallet interaction; follows the Solana Pay URL scheme
     * The parameters needed to create the correct transaction is encoded within the URL
     */
    const { recipient, message, memo, amount, reference, label } = parseURL(url);
    console.log('label: ', label);
    console.log('message: ', message);
    console.log('connection: ', connection);
    console.log('memo: ', memo);
    console.log('amount: ', amount);
    console.log('Reference: ', reference);
    console.log('Recipient: ', recipient);
    const payer = new PublicKey(window.solana.publicKey.toString());
    console.log('Payer',payer);

    /**
     * Create the transaction with the parameters decoded from the URL
     */

    try {
        const tx = await createTransaction(connection, payer, recipient, amount, {
            reference,
            memo,
        });
        console.log('✅ Transaction created');
        console.log('Transaction: ', tx);

        /** * Send the transaction to the network */
        const signature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(signature, 'confirmed');
        console.log('✅ Transaction sent');
    } catch (error) {
        console.error('❌ Transaction creation failed', error);
    }
}
