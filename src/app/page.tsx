'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {

  const [mintAddress, setMintAddress] = useState('');
  const [holders, setHolders] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokens, setTokens] = useState<any[]>([])
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;

  useEffect(() => {
    getTokens();
  }, []);

  const getTokens = async () => {

    try {
      const response = await fetch('/api/getLast20', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const data = await response.json();
      setTokens(data.tokens);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addToken = async (name: string, address: string, symbol: string) => {
    try {
      const response = await fetch('/api/addToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, address, symbol }),
      });

      if (!response.ok) {
        throw new Error('Failed to add token');
      }
      const data = await response.json();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

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
      const name = data.tokenInfo.name;
      const symbol = data.tokenInfo.symbol;
      const address = mintAddress;
      addToken(name, address, symbol);
      setHolders(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!holders) return;

    const dataStr = JSON.stringify(holders.holders, null, 2);
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

  const formattedNumber = (num: number) => {
    return Number(num).toLocaleString();
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(function () {
      console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
      console.error('Async: Could not copy text: ', err);
    });
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Solana Token Holders</h1>
      {/* dont allow submit if field empty */}
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          placeholder="Enter token mint address"
          className="border p-2 mr-2"
          required
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

      {tokens && tokens.length > 0 && (
        // loop through tokens
        <div>
          <h2 className="text-xl font-semibold mb-2">Last 20 Token Searches</h2>
          {tokens.map((token: any, index: any) => (
            <>
              <button id={index} onClick={() => setMintAddress(token.address)} className="has-tooltip text-white bg-green-500 hover:bg-purple-500 p-2 m-2 ">{token.symbol}
                <span className='tooltip p-1 rounded bg-red-500 sm:bg-yellow-400 md:bg-blue-500 lg:bg-green-700 -mt-8'>{token.name}</span>
              </button>

            </>
          ))}
        </div>
      )
      }

      {error && <p className="text-red-500">{error}</p>}
      {
        holders && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Token: {holders.tokenInfo.name} </h2>
            <p className="mb-2 italic text-xs">Total Accounts: {formattedNumber(holders.totalAccounts)}</p>
            <p className="mb-2 italic text-xs">Hodlers: {formattedNumber(holders.totalHolders)}</p>
            <p className="mb-2 italic text-xs">Zero Bois: {formattedNumber(holders.zeroBoys)}</p>
            <p className="mb-2 italic text-xs">Largest: {formattedNumber(holders.largestBalance.balance)}</p>
            <p className="mb-2 italic text-xs">Smallest: {formattedNumber(holders.smallestNonZeroBalance.balance)}</p>
            <p className="mb-2 italic text-xs">Average: {formattedNumber(holders.averageBalance)}</p>
            <p className="mb-2 italic text-xs">Billionaires: {formattedNumber(holders.billionairesCount)}</p>
            <p className="mb-2 italic text-xs">100 Millionaires: {formattedNumber(holders.hundredMillionairesCount)}</p>
            <p className="mb-2 italic text-xs">Millionaires: {formattedNumber(holders.millionairesCount)}</p>
            <p className="mb-2 italic text-xs">Supply: {formattedNumber(holders.tokenInfo.supply)}</p>
            <p className="mb-2 italic text-xs">Decimals: {holders.tokenInfo.decimals}</p>
            <p className="mb-2 italic text-xs">Program: {holders.tokenInfo.programId}</p>
            <button
              onClick={handleDownload}
              className="bg-green-500 text-white p-2 mb-4 hover:bg-purple-500 m-2"
            >
              Download Holders JSON
            </button>
            {/* <button
            onClick={handleDownload}
            className="bg-green-500 text-white p-2 mb-4 hover:bg-purple-500 m-2"
          >
            Download Holders CSV
          </button> */}
            <button
              onClick={() => window.open(`https://jup.ag/swap/SOL-${mintAddress}?referrer=8bbPc25fviwtBdDNR7dxyznp2qxUTKbxGtsougy9w7de&feeBps=100`)}
              className="bg-green-500 text-white p-2 mb-4 hover:bg-purple-500 m-2"
            >
              Buy {holders.tokenInfo.symbol}
            </button>
            <button
              onClick={() => window.open(`https://rugcheck.xyz/tokens/${mintAddress}`)}
              className="bg-green-500 text-white p-2 mb-4 hover:bg-purple-500 m-2"
            >
              Rugcheck {holders.tokenInfo.symbol}
            </button>
            <button
              onClick={() => window.open(`https://birdeye.so/token/${mintAddress}`)}
              className="bg-green-500 text-white p-2 mb-4 hover:bg-purple-500 m-2"
            >
              Birdeye {holders.tokenInfo.symbol}
            </button>
            <ul className="max-h-96 overflow-y-auto">
              {holders.holders.map((holder: any, index: any) => (
                <li key={index} className="mb-1">
                  Address: {holder.address}, Balance: {formattedNumber(holder.balance)}
                </li>
              ))}
            </ul>
          </div>
        )
      }
      <footer className="text-xs p-5">Made by <Link className="text-red-500" target="_blank" href={"https://www.metasal.xyz"}>@metasal</Link> | {commitSha}</footer>
    </main >
  );
}