'use client'

import { useState } from 'react';
import Link from 'next/link';
export default function Home() {
  const [mintAddress, setMintAddress] = useState('');
  const [holders, setHolders] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHolders(null);

    try {
      const response = await fetch('/api/getTokenHolders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mintAddress }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch token holders');
      }

      const data = await response.json();
      setHolders(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!holders) return;

    const dataStr = JSON.stringify(holders, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `token_holders_${mintAddress}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleClear = () => {
    setMintAddress('');
    setHolders(null);
    setError(null);
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Solana Token Holders</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          placeholder="Enter token mint address"
          className="border p-2 mr-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2  mr-2"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Holders'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="bg-red-500 text-white p-2 "
        >
          Clear
        </button>
      </form>
      <button onClick={() => setMintAddress('ErbakSHZWeLnq1hsqFvNz8FvxSzggrfyNGB6TEGSSgNE')} className="bg-green-500 hover:bg-purple-500 p-2 ">FABS</button>
      {error && <p className="text-red-500">{error}</p>}
      {holders && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Token Holders: {holders.length}</h2>
          <p className="mb-2 italic text-xs">Hodlers: {holders.filter(holder => holder.balance > 0).length} / Zerobois: {holders.filter(holder => holder.balance < 1).length}</p>
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white p-2  mb-4"
          >
            Download Holders Data
          </button>
          <ul className="max-h-96 overflow-y-auto">
            {holders.map((holder, index) => (
              <li key={index} className="mb-1">
                Address: {holder.address}, Balance: {holder.balance}
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="text-xs p-5">Made by <Link className="text-red-500" target="_blank" href={"https://www.metasal.xyz"}>@metasal</Link></footer>
    </main>
  );
}