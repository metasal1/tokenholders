import { Connection, PublicKey } from '@solana/web3.js';
import { AccountLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { NextResponse } from 'next/server';

const Layout = {
    span: 96,
    fields: [
        {
            span: 32,
            property: 'parent',
            length: 32
        }, {
            span: 32,
            property: 'owner',
            length: 32
        }, {
            span: 32,
            property: 'class',
            length: 32
        },
    ]
};
export async function POST(request) {
    const connection = new Connection(process.env.RPC);
    const { programId } = await request.json();

    try {
        const program = new PublicKey(programId);

        const tokenAccounts = await connection.getProgramAccounts(
            new PublicKey(program),
            {
                filters: [
                    { dataSize: 96 }, // Adjust this value based on the actual data size of SNS accounts
                    {
                        memcmp: {
                            offset: 32, // The offset where the name hash starts
                            bytes: nameHash, // You need to provide the hash of the domain name
                        },
                    },
                ],
            }
        );

        const holders = tokenAccounts
            .map(account => {
                const accountData = Layout.decode(account.account.data);
                return {
                    address: account.pubkey.toString(),
                    balance: accountData.amount.toString(),
                };
            })
            .sort((a, b) => b.balance - a.balance); // Sort holders array based on balance property

        return NextResponse.json({ holders });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Error fetching token holders' }, { status: 500 });
    }
}
