import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { filterPools } from "../../slices/pool";
import { Hourglass } from 'react-loader-spinner';
import {
  LuSearch,
  LuPlus,
  LuSlidersHorizontal,
  LuUsers,
  LuClock,
  LuArrowUpDown,
  LuX,
} from 'react-icons/lu';
import Pool from "../../components/pool/pool";

const Pools = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { pools } = useSelector((state) => state.pool);
  const [poolLoading, setPoolLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    term: '',
    joined: '',
    owner: '',
    closed: '',
    opened: '',
    orderBy: 'most_recent'
  });

  useEffect(() => {
    if (currentUser) {
      setPoolLoading(true);
      setCurrentPage(1);
      dispatch(filterPools({
        page: 1,
        pageSize: 10,
        term: filters.term,
        joined: filters.joined,
        owner: filters.owner,
        closed: filters.closed,
        opened: filters.opened,
        orderBy: filters.orderBy,
        userId: currentUser.user.id
      })).finally(() => setPoolLoading(false));
    }
  }, [currentUser, dispatch, filters]);

  const handleFilterTab = (tab) => {
    const nf = { ...filters };
    if (tab === 1)      { nf.joined = currentUser.user.id; nf.owner = ''; }
    else if (tab === 2) { nf.owner = currentUser.user.id;  nf.joined = ''; }
    else                { nf.joined = ''; nf.owner = ''; }
    setFilters(nf);
    setCurrentPage(1);
  };

  const handleSubFilterTab = (sub) => {
    const nf = { ...filters };
    if (sub === 1)      { nf.closed = nf.closed ? '' : '1'; nf.opened = ''; }
    else if (sub === 2) { nf.opened = nf.opened ? '' : '1'; nf.closed = ''; }
    setFilters(nf);
    setCurrentPage(1);
  };

  const handleSort = (order) => {
    setFilters(prev => ({ ...prev, orderBy: order }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setFilters(prev => ({ ...prev, term: searchInput }));
      setCurrentPage(1);
    }
  };

  const clearAllFilters = () => {
    setFilters({ term: '', joined: '', owner: '', closed: '', opened: '', orderBy: 'most_recent' });
    setSearchInput('');
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    if (pools.total > currentPage * pools.pageSize) {
      setLoadMoreLoading(true);
      const nextPage = currentPage + 1;
      dispatch(filterPools({
        page: nextPage,
        pageSize: parseInt(pools.pageSize),
        term: filters.term,
        joined: filters.joined,
        owner: filters.owner,
        closed: filters.closed,
        opened: filters.opened,
        orderBy: filters.orderBy,
        userId: currentUser.user.id
      })).then(() => { setCurrentPage(nextPage); setLoadMoreLoading(false); })
        .catch(() => setLoadMoreLoading(false));
    }
  };

  const isAllPoolsActive    = !filters.joined && !filters.owner;
  const isJoinedPoolsActive = !!filters.joined && !filters.owner;
  const isMyPoolsActive     = !filters.joined && !!filters.owner;

  const sortLabels = { most_recent: 'Most Recent', name: 'Pool Name', most_funded: 'Most Funded' };

  if (!currentUser) {
    const formatReturnUrl = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    return <Navigate to={`/login?returnUrl=${formatReturnUrl}`} />;
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '-0.03em', marginBottom: 4 }}>
          Browse Pools
        </h1>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
          Discover community pools, join causes you care about, or start your own.
        </p>
      </div>

      {/* ── Search + controls ── */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        padding: '16px 20px',
        marginBottom: 16,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
      }}>
        {/* Search input */}
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <LuSearch size={18} style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none'
          }} />
          <input
            type="text"
            placeholder="Search pools…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearch}
            style={{
              width: '100%',
              padding: '11px 14px 11px 42px',
              border: '1.5px solid var(--border-color)',
              borderRadius: 14,
              background: 'var(--surface)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--text-dark)',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--brand-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(93,95,239,0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 16px',
            border: `1.5px solid ${showFilters ? 'var(--brand-primary)' : 'var(--border-color)'}`,
            borderRadius: 12,
            background: showFilters ? 'var(--brand-primary-light)' : 'white',
            color: showFilters ? 'var(--brand-primary)' : 'var(--text-muted)',
            fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <LuSlidersHorizontal size={16} />
          Filters
        </button>

        {/* Sort dropdown */}
        <div className="dropdown">
          <button
            className="dropdown-toggle"
            data-bs-toggle="dropdown"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px',
              border: '1.5px solid var(--border-color)',
              borderRadius: 12,
              background: 'white',
              color: 'var(--text-muted)',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            <LuArrowUpDown size={16} />
            {sortLabels[filters.orderBy]}
          </button>
          <ul className="dropdown-menu dropdown-menu-end" style={{ borderRadius: 14, border: '1px solid var(--border-color)', padding: '6px' }}>
            {Object.entries(sortLabels).map(([val, label]) => (
              <li key={val}>
                <button
                  className="dropdown-item"
                  onClick={() => handleSort(val)}
                  style={{
                    borderRadius: 10, fontWeight: 600, fontSize: '0.85rem',
                    color: filters.orderBy === val ? 'var(--brand-primary)' : 'var(--text-dark)',
                    background: filters.orderBy === val ? 'var(--brand-primary-light)' : 'transparent',
                  }}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Create pool */}
        <Link
          to="/pool-create"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px',
            background: 'var(--brand-primary)',
            color: 'white',
            borderRadius: 12,
            fontWeight: 800, fontSize: '0.85rem',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(93,95,239,0.25)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <LuPlus size={16} strokeWidth={3} />
          Create Pool
        </Link>
      </div>

      {/* ── Filters panel ── */}
      {showFilters && (
        <div style={{
          background: 'white',
          borderRadius: 20,
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          padding: '20px 24px',
          marginBottom: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <LuUsers size={16} style={{ color: 'var(--brand-primary)' }} />
              <span style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dark)' }}>Pool Type</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'All Pools', tab: 3, active: isAllPoolsActive },
                { label: 'Joined', tab: 1, active: isJoinedPoolsActive },
                { label: 'My Pools', tab: 2, active: isMyPoolsActive },
              ].map(({ label, tab, active }) => (
                <button
                  key={label}
                  onClick={() => handleFilterTab(tab)}
                  style={{
                    padding: '7px 14px',
                    border: `1.5px solid ${active ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    borderRadius: 10,
                    background: active ? 'var(--brand-primary)' : 'white',
                    color: active ? 'white' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <LuClock size={16} style={{ color: 'var(--brand-primary)' }} />
              <span style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dark)' }}>Status</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'Open', sub: 2, active: filters.opened === '1' },
                { label: 'Closed', sub: 1, active: filters.closed === '1' },
              ].map(({ label, sub, active }) => (
                <button
                  key={label}
                  onClick={() => handleSubFilterTab(sub)}
                  style={{
                    padding: '7px 14px',
                    border: `1.5px solid ${active ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    borderRadius: 10,
                    background: active ? 'var(--brand-primary)' : 'white',
                    color: active ? 'white' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={clearAllFilters}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px',
                border: '1.5px solid var(--border-color)',
                borderRadius: 10,
                background: 'transparent',
                color: 'var(--text-muted)',
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              <LuX size={14} />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Grid ── */}
      {poolLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Hourglass visible height="64" width="64" colors={['#5D5FEF', '#FF7EB3']} />
        </div>
      ) : (
        <>
          {pools?.items?.length > 0 ? (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 24,
                marginBottom: 32,
              }}>
                {pools.items.map((pool) => (
                  <Pool key={pool.id} pool={pool} />
                ))}
              </div>

              {loadMoreLoading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                  <Hourglass visible height="48" width="48" colors={['#5D5FEF', '#FF7EB3']} />
                </div>
              )}

              {pools.total > 0 && pools.items.length < pools.total && (
                <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 16 }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={loadMoreLoading}
                    style={{
                      padding: '14px 48px',
                      background: 'var(--text-dark)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 24,
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(26,26,46,0.15)',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    {loadMoreLoading ? 'Loading…' : 'Load more pools'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: 32,
              border: '1px solid var(--border-color)',
              padding: '64px 32px',
              textAlign: 'center',
            }}>
              <div style={{
                width: 64, height: 64,
                borderRadius: 20,
                background: 'var(--brand-primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <LuSearch size={28} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <h3 style={{ fontWeight: 800, color: 'var(--text-dark)', marginBottom: 8 }}>No pools found</h3>
              <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: 24 }}>
                Try adjusting your filters or create a new pool.
              </p>
              <Link
                to="/pool-create"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '12px 24px',
                  background: 'var(--brand-primary)',
                  color: 'white',
                  borderRadius: 14,
                  fontWeight: 800, fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(93,95,239,0.25)',
                }}
              >
                <LuPlus size={16} strokeWidth={3} />
                Create Pool
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Pools;
