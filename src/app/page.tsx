'use client'

import { useState } from 'react';
import Link from 'next/link';
export default function Home() {
  const [mintAddress, setMintAddress] = useState('');
  const [holders, setHolders] = useState<any>(null);
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
      <div>
        <button onClick={() => setMintAddress('ErbakSHZWeLnq1hsqFvNz8FvxSzggrfyNGB6TEGSSgNE')} className="text-white bg-green-500 hover:bg-purple-500 p-2 ">FABS</button>
        <button onClick={() => setMintAddress('SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa')} className="text-white bg-green-500 hover:bg-purple-500 p-2 ">SEND</button>
        <button onClick={() => setMintAddress('oreoN2tQbHXVaZsr3pf66A48miqcBXCDJozganhEJgz')} className="text-white bg-green-500 hover:bg-purple-500 p-2 ">ORE</button>
        <button onClick={() => setMintAddress('FUTURETnhzFApq2TiZiNbWLQDXMx4nWNpFtmvTf11pMy')} className="text-white bg-green-500 hover:bg-purple-500 p-2 ">FUTURE</button>
        <button onClick={() => setMintAddress('Ax6TrTpSthzu1RNptH5VBRR53atgvK75fCSV4zQpump')} className="text-white bg-green-500 hover:bg-purple-500 p-2 ">CXP</button>
        <button onClick={() => setMintAddress('8dtYmiGyAMahRtj2W9XVqAjJo59dGbCT7yk7AaxPBzLc')} className="text-white bg-green-500 hover:bg-purple-500 p-2 ">SHRGMA</button>
        <button onClick={() => setMintAddress('CBBTCYTLFmQMKQznzSX4un9zBdnL3Em7PU99ZQ1UWwfv')} className="text-white bg-green-500 hover:bg-purple-500 p-2 ">CBBT</button>
        <button onClick={() => setMintAddress('6Y7LbYB3tfGBG6CSkyssoxdtHb77AEMTRVXe8JUJRwZ7')} className="text-white bg-green-500 hover:bg-purple-500 p-2 ">DINO</button>
        <button onClick={() => setMintAddress('Ds52CDgqdWbTWsua1hgT3AuSSy4FNx2Ezge1br3jQ14a')} className="text-white bg-green-500 hover:bg-purple-500 p-2 ">DEAN</button>
        <button onClick={() => setMintAddress('DEVwHJ57QMPPArD2CyjboMbdWvjEMjXRigYpaUNDTD7o')} className="text-white bg-green-500 hover:bg-purple-500 p-2 ">DWH</button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {holders && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Token Holders: {holders.length}</h2>
          <p className="mb-2 italic text-xs">Total Accounts: {holders.totalAccounts}</p>
          <p className="mb-2 italic text-xs">Hodlers: {holders.totalHolders}</p>
          <p className="mb-2 italic text-xs">Zero Bois: {holders.zeroBoys}</p>
          <p className="mb-2 italic text-xs">Largest: {holders.largestBalance.balance}</p>
          <p className="mb-2 italic text-xs">Smallest: {holders.smallestNonZeroBalance.balance}</p>
          <p className="mb-2 italic text-xs">Average: {holders.averageBalance}</p>
          <p className="mb-2 italic text-xs">Billionaires: {holders.billionairesCount}</p>
          <p className="mb-2 italic text-xs">Millionaires: {holders.millionairesCount}</p>
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white p-2  mb-4"
          >
            Download Holders Data
          </button>
          <ul className="max-h-96 overflow-y-auto">
            {holders.holders.map((holder: any, index: any) => (
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