import { PublicKey } from '@solana/web3.js';
import { parseURL, createTransaction } from '@solana/pay';

export async function sendWebTransactionRequest(connection, url, sendTransaction,publicKey) {
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
    const payer = new PublicKey(publicKey.toString());
    console.log('Payer',payer);

    /** * Create the transaction with the parameters decoded from the URL */

    try {
        const tx = await createTransaction(connection, payer, recipient, amount, {
            reference,
            memo,
        });
        console.log('✅ Transaction created');
        console.log('Transaction: ', tx);

        /** * Send the transaction to the network */
         await sendTransaction(tx, connection);
        console.log('✅ Transaction sent');
    } catch (error) {
        console.error('❌ Transaction creation failed', error);
    }
}
