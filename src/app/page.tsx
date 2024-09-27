'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface TagCount {
  tag: string;
  count: number;
}

// Add this new component at the top of your file, outside the main component
const Loader = () => (
  <div className="flex justify-center items-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

export default function Home() {

  const [mintAddress, setMintAddress] = useState('');
  const [holders, setHolders] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokens, setTokens] = useState<any[]>([])
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA;
  const [loadingTime, setLoadingTime] = useState(0);
  const [loadingInterval, setLoadingInterval] = useState<NodeJS.Timeout | null>(null);
  const [timeTaken, setTimeTaken] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [tags, setTags] = useState<TagCount[]>([]);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [loadingTags, setLoadingTags] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagTokens, setTagTokens] = useState<any[]>([]);
  const [loadingTagTokens, setLoadingTagTokens] = useState(false);
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);
  const [isTagsCollapsed, setIsTagsCollapsed] = useState(false);
  const [isHoldersCollapsed, setIsHoldersCollapsed] = useState(false);
  const [filterTag, setFilterTag] = useState<string>('');
  const [holdersMint, setHoldersMint] = useState('');

  useEffect(() => {
    getTokens();
    handleGetTags();
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
    setLoadingTime(0);
    setTimeTaken(null);

    const interval = setInterval(() => {
      setLoadingTime((prevTime) => prevTime + 1);
    }, 1000);
    setLoadingInterval(interval);

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
      setTimeTaken(data.timeTaken);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
      if (loadingInterval) {
        clearInterval(loadingInterval);
      }
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
    setLoadingTime(0);
    if (loadingInterval) {
      clearInterval(loadingInterval);
    }
  };

  const formattedNumber = (num: number) => {
    return Number(num).toLocaleString();
  }

  const placeDecimal = (num: number) => {
    return Math.round(Number(num / Math.pow(10, holders.tokenInfo.decimals))).toLocaleString();
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(function () {
      console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
      console.error('Async: Could not copy text: ', err);
    });
  }

  const handleSearch = async () => {
    if (!searchQuery && !filterTag) return;

    setSearchLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('query', searchQuery);
      if (filterTag) queryParams.append('tag', filterTag);

      const response = await fetch(`/api/findToken?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search tokens');
      }

      const data = await response.json();
      setSearchResults(data.tokens);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilterTag('');
    setSearchResults([]);
  };

  const handleSearchInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleGetTags = async () => {
    setLoadingTags(true);
    try {
      const response = await fetch('/api/findToken?getTags=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const data = await response.json();
      setTags(data.tags);
      setTotalTokens(data.totalTokens);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleTagClick = async (tag: string) => {
    setSelectedTag(tag);
    setLoadingTagTokens(true);
    try {
      const response = await fetch(`/api/findToken?tag=${encodeURIComponent(tag)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tokens for tag');
      }

      const data = await response.json();
      setTagTokens(data.tokens);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoadingTagTokens(false);
    }
  };

  const handleClearTags = () => {
    setSelectedTag(null);
    setTagTokens([]);
    setSortColumn('');
    setSortDirection('');
  };

  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('');

  const sortTokens = (tokens: any[], column: string, direction: string) => {
    return tokens.sort((a, b) => {
      if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleHoldersMintPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    setHoldersMint(pastedText);
    toast.success('Mint address pasted!', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleSearchResultClick = (address: string, symbol: string) => {
    setHoldersMint(address);
    setMintAddress(address);
    toast.success(`Mint address set to ${symbol}`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const sortTokensByVerification = (tokens: any[]) => {
    return tokens.sort((a, b) => {
      if (a.tags?.includes('verified') && !b.tags?.includes('verified')) return -1;
      if (!a.tags?.includes('verified') && b.tags?.includes('verified')) return 1;
      return 0;
    });
  };

  const renderTokenButton = (token: any, index: number) => {
    const isVerified = token.tags?.includes('verified');
    return (
      <button
        key={index}
        onClick={() => handleSearchResultClick(token.address, token.symbol)}
        className="has-tooltip text-white bg-green-500 hover:bg-purple-500 p-2 flex items-center"
      >
        <span>{token.symbol}</span>
        {isVerified && <span className="ml-1" title="Verified">✅</span>}
        <span className='tooltip p-1 rounded bg-red-500 sm:bg-yellow-400 md:bg-blue-500 lg:bg-green-700 -mt-8'>
          {token.name}
        </span>
      </button>
    );
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Solana Token Holders</h1>
      {/* dont allow submit if field empty */}
      <form onSubmit={handleSubmit} className="mb-4">

        <input
          type="text"
          value={holdersMint}
          onChange={(e) => setHoldersMint(e.target.value)}
          onPaste={handleHoldersMintPaste}
          placeholder="Enter mint address to get holders"
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2  mr-2"
          disabled={loading}
        >
          {loading ? `Loading... (${loadingTime}s)` : 'Get Holders'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="bg-red-500 text-white p-2 "
        >
          Clear
        </button>
      </form>

      {timeTaken !== null && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
          <p className="font-bold">Request completed in {timeTaken.toFixed(2)} seconds</p>
        </div>
      )}

      {tokens && tokens.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Last 20 Token Searches</h2>
          <div className="flex flex-wrap gap-2">
            {sortTokensByVerification(tokens).map((token: any, index: number) => renderTokenButton(token, index))}
          </div>
        </div>
      )}

      {error && <p className="text-red-500">{error}</p>}
      {
        holders && (
          <div className="mt-8 border border-gray-700 rounded-lg overflow-hidden">
            <button
              className="w-full bg-gray-800 p-4 text-left text-xl font-semibold flex justify-between items-center"
              onClick={() => setIsHoldersCollapsed(!isHoldersCollapsed)}
            >
              <span>Token: {holders.tokenInfo.name} </span>
              <span>{isHoldersCollapsed ? '▼' : '▲'}</span>
            </button>
            {!isHoldersCollapsed && (
              <div className="p-4">
                {timeTaken !== null && (
                  <p className="mb-2 italic text-xs">Time taken: {timeTaken.toFixed(2)} seconds</p>
                )}
                <p onClick={() => copyToClipboard(mintAddress)} className="mb-2 italic text-xs cursor-pointer">Mint Address: {mintAddress} ⎙</p>
                <p className="mb-2 italic text-xs">Total Accounts: {formattedNumber(holders.totalAccounts)}</p>
                <p className="mb-2 italic text-xs">Hodlers: {formattedNumber(holders.totalHolders)}</p>
                <p className="mb-2 italic text-xs">Zero Bois: {formattedNumber(holders.zeroBoys)}</p>
                <p className="mb-2 italic text-xs">Largest: {placeDecimal(holders.largestBalance.balance)}</p>
                <p className="mb-2 italic text-xs">Smallest: {placeDecimal(holders.smallestNonZeroBalance.balance)}</p>
                <p className="mb-2 italic text-xs">Average: {placeDecimal(holders.averageBalance)}</p>
                <p className="mb-2 italic text-xs">Billionaires: {formattedNumber(holders.billionairesCount)}</p>
                <p className="mb-2 italic text-xs">100 Millionaires: {formattedNumber(holders.hundredMillionairesCount)}</p>
                <p className="mb-2 italic text-xs">Millionaires: {formattedNumber(holders.millionairesCount)}</p>
                <p className="mb-2 italic text-xs">Supply: {placeDecimal(holders.tokenInfo.supply)}</p>
                <p className="mb-2 italic text-xs">Decimals: {holders.tokenInfo.decimals}</p>
                <p onClick={() => copyToClipboard(mintAddress)} className="mb-2 italic text-xs cursor-pointer">Program: {holders.tokenInfo.programId} ⎙</p>
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
            )}
          </div>
        )
      }

      {/* Add this new section for token search */}
      <div className="mt-8 border border-gray-700 rounded-lg overflow-hidden">
        <button
          className="w-full bg-gray-800 p-4 text-left text-xl font-semibold flex justify-between items-center"
          onClick={() => setIsSearchCollapsed(!isSearchCollapsed)}
        >
          <span>Search Tokens</span>
          <span>{isSearchCollapsed ? '▼' : '▲'}</span>
        </button>
        {!isSearchCollapsed && (
          <div className="p-4">
            <div className="flex flex-col mb-4">
              <div className="flex mb-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchInputKeyPress}
                  placeholder="Enter token name or symbol"
                  className="border p-2 mr-2 flex-grow"
                />
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="border p-2 mr-2"
                >
                  <option value="">All Tags</option>
                  {tags.map((tag) => (
                    <option key={tag.tag} value={tag.tag}>{tag.tag}</option>
                  ))}
                </select>
              </div>
              <div className="flex">
                <button
                  onClick={handleSearch}
                  className="bg-blue-500 text-white p-2 mr-2"
                  disabled={searchLoading}
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
                <button
                  onClick={handleClearSearch}
                  className="bg-red-500 text-white p-2"
                >
                  Clear
                </button>
              </div>
            </div>
            {searchResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Search Results (Total Found: {searchResults.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {sortTokensByVerification(searchResults).map((token, index) => renderTokenButton(token, index))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add this new section for fetching tags */}
      <div className="mt-8 border border-gray-700 rounded-lg overflow-hidden">
        <button
          className="w-full bg-gray-800 p-4 text-left text-xl font-semibold flex justify-between items-center"
          onClick={() => setIsTagsCollapsed(!isTagsCollapsed)}
        >
          <span>Token Tags</span>
          <span>{isTagsCollapsed ? '▼' : '▲'}</span>
        </button>
        {!isTagsCollapsed && (
          <div className="p-4">
            <div className="flex mb-4">
              <button
                onClick={handleGetTags}
                className="bg-blue-500 text-white p-2 mr-2"
                disabled={loadingTags}
              >
                {loadingTags ? 'Loading Tags...' : 'Get All Tags'}
              </button>
              <button
                onClick={handleClearTags}
                className="bg-red-500 text-white p-2"
                disabled={!selectedTag && tagTokens.length === 0}
              >
                Clear Tags
              </button>
            </div>
            {tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Available Tags</h3>
                <p className="mb-2">Total Tokens: {totalTokens.toLocaleString()}</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tagCount, index) => (
                    <button
                      key={index}
                      onClick={() => handleTagClick(tagCount.tag)}
                      className={`bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold ${selectedTag === tagCount.tag ? 'bg-blue-500 text-white' : 'text-gray-700'
                        }`}
                    >
                      {tagCount.tag} ({tagCount.count})
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectedTag && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2 text-white">Tokens with tag: {selectedTag}</h3>
                {loadingTagTokens ? (
                  <Loader />
                ) : tagTokens.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="min-w-full">
                      <thead className="bg-gray-900">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('symbol')}
                          >
                            Symbol
                            {sortColumn === 'symbol' && (
                              <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('name')}
                          >
                            Name
                            {sortColumn === 'name' && (
                              <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('address')}
                          >
                            Address
                            {sortColumn === 'address' && (
                              <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('tag')}
                          >
                            Tag
                            {sortColumn === 'tag' && (
                              <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                            )}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-black divide-y divide-gray-800">
                        {sortTokens(tagTokens, sortColumn, sortDirection).map((token, index) => (
                          <tr key={index} className="hover:bg-gray-900 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">{token.symbol}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{token.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => setMintAddress(token.address)}
                                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                              >
                                {token.address.slice(0, 8)}...{token.address.slice(-8)}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{token.tag || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-300">No tokens found for this tag.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="text-xs p-5">Made by <Link className="text-red-500" target="_blank" href={"https://www.metasal.xyz"}>@metasal</Link></footer>
      <ToastContainer />
    </main >
  );
}