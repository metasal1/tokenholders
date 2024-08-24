import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function POST(request) {

    const { symbol, name, address, fav } = await request.json();

    try {
        const { data, error } = await supabase
            .from('tokens')
            .insert([
                { symbol, name, address, fav },
            ])
            .select()
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Error fetching tokens', error }, { status: 500 });
    }
}
