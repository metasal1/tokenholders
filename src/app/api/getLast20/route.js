import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function GET(request) {

    try {

        let { data: tokens, error } = await supabase
            .from('tokens')
            .select("*")

        // remove duplicate tokens
        tokens = tokens.filter((token, index, self) =>
            index === self.findIndex((t) => (
                t.symbol === token.symbol
            ))
        )

        const headers = {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
        };

        return NextResponse.json({ tokens }, { status: 200, headers });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Error fetching tokens', error }, { status: 500 });
    }
}
