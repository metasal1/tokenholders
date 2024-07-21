import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { mintAddress } = await request.json();

    if (!mintAddress) {
        return NextResponse.json({ message: 'Mint address is required' }, { status: 400 });
    }

    try {
        const connection = new Connection(process.env.RPCM);
        const mint = new PublicKey(mintAddress);

        const tokenAccounts = await connection.getProgramAccounts(
            TOKEN_PROGRAM_ID,
            {
                filters: [
                    { dataSize: 165 },
                    {
                        memcmp: {
                            offset: 0,
                            bytes: mint.toBase58(),
                        },
                    },
                ],
            }
        );

        const holders = tokenAccounts
            .map(account => {
                const accountData = AccountLayout.decode(account.account.data);
                return {
                    address: account.pubkey.toString(),
                    balance: accountData.amount.toString(),
                };
            })
            .sort((a, b) => b.balance - a.balance); // Sort holders array based on balance property

        return NextResponse.json(holders);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Error fetching token holders' }, { status: 500 });
    }
}
