import { NextRequest, NextResponse } from 'next/server';

interface Token {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    tags: string[];
    daily_volume: number | null;
    created_at: string;
    freeze_authority: string | null;
    mint_authority: string | null;
    permanent_delegate: string | null;
    minted_at: string | null;
    extensions: Record<string, unknown>;
}

interface TagCount {
    [key: string]: number;
}

export async function GET(request: NextRequest) {
    const url = "https://tokens.jup.ag/tokens/tradable";
    const query = request.nextUrl.searchParams.get('query');
    const getTags = request.nextUrl.searchParams.get('getTags');
    const tag = request.nextUrl.searchParams.get('tag');

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch tokens');
        }

        const data: Token[] = await response.json();

        if (getTags === 'true') {
            const tagCounts: TagCount = {};
            data.forEach(token => token.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }));

            const sortedTags = Object.entries(tagCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([tag, count]) => ({ tag, count }));

            return NextResponse.json({
                tags: sortedTags,
                totalTokens: data.length
            });
        }

        if (tag) {
            const filteredTokens = data.filter((token: Token) =>
                token.tags.includes(tag)
            );
            return NextResponse.json({ tokens: filteredTokens });
        }

        if (query) {
            const filteredTokens = data.filter((token: Token) =>
                token.symbol.toLowerCase().includes(query.toLowerCase()) ||
                token.name.toLowerCase().includes(query.toLowerCase())
            );
            return NextResponse.json({ tokens: filteredTokens });
        }

        return NextResponse.json({ error: 'Query or tag parameter is required' }, { status: 400 });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
