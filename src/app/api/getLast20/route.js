import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

export const revalidate = 0

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

        return NextResponse.json({ tokens }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Error fetching tokens', error }, { status: 500 });
    }
}
