import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { mintAddress } = await request.json();

    const VAULT = new PublicKey("9sKt35vjeAx78uzKCFcW9Uasd6YAg6To4uh46SGg2J3g");
    const RAYDIUM = new PublicKey("J2wv9UJQDnW9PYi93pEEANJGnZXYhKVbkaBPChLUvP2s");
    const BANK = new PublicKey("GuPGRSTcXkpJ5mY2iaxUmLrCehxXZizTHxTEFwmNWG5t");
    const METEORA = new PublicKey("4EkCNKveDhUogmSVSWTAWNFf9B2HTr66WVEprPEiHiwr");

    const excludedAddresses = [VAULT, RAYDIUM, BANK, METEORA].map(pubkey => pubkey.toString());

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

        const filteredHolders = holders.filter(holder => !excludedAddresses.includes(holder.address));

        const largestBalance = filteredHolders[0];


        const smallestNonZeroBalance = filteredHolders.reduce((min, obj) => {
            const balance = BigInt(obj.balance);
            if (balance === 0n) return min;
            return (min === null || balance < BigInt(min.balance)) ? obj : min;
        }, null);

        const nonZeroBalances = holders.filter(obj => BigInt(obj.balance) !== 0n);
        const sum = nonZeroBalances.reduce((acc, obj) => acc + BigInt(obj.balance), 0n);
        const averageBalance = Number(sum) / nonZeroBalances.length;
        const totalAccounts = holders.length;
        const totalHolders = nonZeroBalances.length;
        const zeroBoys = holders.length - totalHolders;
        const millionaires = holders.filter(obj => BigInt(obj.balance) >= 1000000000000n);
        const billionaires = holders.filter(obj => BigInt(obj.balance) >= 1000000000000000n);

        return NextResponse.json({ mintAddress, billionairesCount: billionaires.length, millionairesCount: millionaires.length, totalAccounts, totalHolders, zeroBoys, largestBalance, smallestNonZeroBalance, averageBalance, holders, billionaires, millionaires });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Error fetching token holders' }, { status: 500 });
    }
}
