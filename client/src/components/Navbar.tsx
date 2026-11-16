import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  User as UserIcon,
  Cpu,
  Truck,
  Shield,
  LogOut,
  Package,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../contexts/CartContext';
import { useDebounce } from '../hooks/useDebounce';
import api from '../services/api';
import { Product, formatNPR } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin, isCourier } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const debouncedQuery = useDebounce(searchQuery, 350);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        setSuggestion(null);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await api.get(`/algo/search?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.data.success) {
          setSearchResults(res.data.products || []);
          setSuggestion(res.data.suggestion);
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    };

    handleSearch();
  }, [debouncedQuery]);

  // Click outside listener for search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleApplySuggestion = (sug: string) => {
    setSearchQuery(sug);
    setIsSearchOpen(false);
    navigate(`/?search=${encodeURIComponent(sug)}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top micro bar with Butwal localization info */}
      <div className="bg-orange-600 text-white text-xs py-1 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">📍 Localized for Butwal, Nepal</span>
            <span className="hidden sm:inline text-orange-200">|</span>
            <span className="hidden sm:inline text-orange-100">
              Central Depot: Traffic Chowk / Kalikanagar
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/algo-lab"
              className="bg-orange-700 hover:bg-orange-800 px-2 py-0.5 rounded text-white font-medium flex items-center space-x-1 transition"
            >
              <Cpu className="w-3 h-3" />
              <span>BCA Algo Lab (Viva Demo)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md font-bold text-xl">
                ब
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  BuTwal<span className="text-orange-600">.ECom</span>
                </span>
                <span className="block text-[10px] text-gray-500 tracking-wider font-semibold uppercase -mt-1">
                  Algorithm-Driven
                </span>
              </div>
            </Link>
          </div>

          {/* Search bar with Levenshtein Typo Tolerance */}
          <div ref={searchRef} className="hidden md:flex-1 md:max-w-md lg:max-w-lg mx-6 relative">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search products in Butwal (e.g. lapotp, mobile, dal)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition"
              />
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Typo-Tolerant Auto-Suggest Dropdown */}
            {isSearchOpen && (searchQuery.trim().length > 0 || isSearching) && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {suggestion && (
                  <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>
                        Did you mean:{' '}
                        <strong className="text-amber-950 font-bold underline cursor-pointer">
                          {suggestion}
                        </strong>
                        ?
                      </span>
                    </div>
                    <button
                      onClick={() => handleApplySuggestion(suggestion)}
                      className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-0.5 rounded font-medium transition"
                    >
                      Apply
                    </button>
                  </div>
                )}

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {isSearching ? (
                    <div className="p-4 text-center text-xs text-gray-400">
                      Searching catalog with Levenshtein Distance...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.slice(0, 6).map((item) => (
                      <Link
                        key={item.id}
                        to={`/product/${item.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center space-x-3 p-3 hover:bg-orange-50/50 transition"
                      >
                        <img
                          src={item.images[0] || 'https://via.placeholder.com/60'}
                          alt={item.name}
                          className="w-10 h-10 rounded-md object-cover border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {item.brand || item.category?.name}
                          </p>
                        </div>
                        <div className="text-xs font-bold text-orange-600">
                          {formatNPR(item.discountPrice ?? item.price)}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-gray-500">
                      No matching products found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-4">
            {/* Algo Lab Viva shortcut */}
            <Link
              to="/algo-lab"
              className="hidden lg:flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition"
            >
              <Cpu className="w-4 h-4 text-purple-600" />
              <span>Algo Lab</span>
            </Link>

            {/* Role specific shortcuts */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}

            {(isCourier || isAdmin) && (
              <Link
                to="/courier"
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition"
              >
                <Truck className="w-4 h-4" />
                <span>Courier</span>
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-orange-600 transition"
              title="View Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-orange-600 rounded-full animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-orange-600 p-1 rounded-full focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs uppercase border border-orange-200">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden md:inline font-medium text-xs text-gray-800">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-gray-500 text-[11px] truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      My Orders
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-blue-700 hover:bg-blue-50 transition"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}

                    {isCourier && (
                      <Link
                        to="/courier"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-emerald-700 hover:bg-emerald-50 transition"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Courier Portal
                      </Link>
                    )}

                    <Link
                      to="/algo-lab"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-purple-700 hover:bg-purple-50 transition font-medium"
                    >
                      <Cpu className="w-4 h-4 mr-2" />
                      Algorithm Laboratory
                    </Link>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-red-50 transition border-t border-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-gray-700 hover:text-orange-600 px-3 py-1.5 rounded-lg transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg shadow-sm transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-orange-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </form>

          <div className="flex flex-col space-y-1 text-sm font-medium">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-gray-100"
            >
              Home Storefront
            </Link>
            <Link
              to="/algo-lab"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-purple-700 bg-purple-50 font-semibold"
            >
              🔬 Algorithm Laboratory (Viva)
            </Link>
            {user && (
              <Link
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-gray-100"
              >
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-blue-700 bg-blue-50 font-semibold"
              >
                Admin Dashboard
              </Link>
            )}
            {isCourier && (
              <Link
                to="/courier"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md text-emerald-700 bg-emerald-50 font-semibold"
              >
                Courier Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
