import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Link } from "react-router-dom";
import { filterPools } from "../../slices/pool";
import { Hourglass } from 'react-loader-spinner';
import {
  FiSearch,
  FiPlus,
  FiFilter,
  FiUsers,
  FiUser,
  FiGlobe,
  FiClock,
  FiAward,
  FiDollarSign
} from 'react-icons/fi';
import { TbArrowsSort } from 'react-icons/tb';
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

  // Store all filters in state
  const [filters, setFilters] = useState({
    term: '',
    joined: '',
    owner: '',
    closed: '',
    opened: '',
    orderBy: 'most_recent'
  });

  // Initial load
  useEffect(() => {
    if (currentUser) {
      setPoolLoading(true);
      setCurrentPage(1);

      const pageSize = 10;

      dispatch(filterPools({
        page: 1,
        pageSize,
        term: filters.term,
        joined: filters.joined,
        owner: filters.owner,
        closed: filters.closed,
        opened: filters.opened,
        orderBy: filters.orderBy,
        userId: currentUser.user.id
      })).finally(() => {
        setPoolLoading(false);
      });
    }
  }, [currentUser, dispatch, filters]);

  const handleFilterTab = (tabs) => {
    const newFilters = { ...filters };

    if (tabs === 1) {
      // My Joined Pools - only joined has user ID
      newFilters.joined = currentUser.user.id;
      newFilters.owner = '';
    } else if (tabs === 2) {
      // My Pools - only owner has user ID
      newFilters.owner = currentUser.user.id;
      newFilters.joined = '';
    } else if (tabs === 3) {
      // All Pools - CLEAR both filters (don't set to user ID)
      newFilters.joined = '';
      newFilters.owner = '';
    }

    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSubFilterTab = (subTabs) => {
    const newFilters = { ...filters };

    if (subTabs === 1) {
      // Toggle closed filter
      newFilters.closed = newFilters.closed ? '' : '1';
      newFilters.opened = '';
    } else if (subTabs === 2) {
      // Toggle opened filter
      newFilters.opened = newFilters.opened ? '' : '1';
      newFilters.closed = '';
    }

    setFilters(newFilters);
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

  const PoolFiltersSection = useCallback(() => {
    // Helper function to determine active tabs
    const isAllPoolsActive = !filters.joined && !filters.owner;
    const isJoinedPoolsActive = filters.joined && !filters.owner;
    const isMyPoolsActive = !filters.joined && filters.owner;

    return (
      <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4" style={{
        position: 'relative'
      }}>
        <div className="row g-3">
          <div className="col-md-6">
            <h5 className="fw-semibold d-flex align-items-center gap-2 mb-3">
              <FiUsers className="text-primary" /> Pool Type
            </h5>
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`btn btn-sm ${isAllPoolsActive ? 'btn-primary' : 'btn-outline-secondary'} rounded-xl`}
                onClick={() => handleFilterTab(3)}>
                All Pools
              </button>
              <button
                className={`btn btn-sm ${isJoinedPoolsActive ? 'btn-primary' : 'btn-outline-secondary'} rounded-xl`}
                onClick={() => handleFilterTab(1)}>
                My Joined Pools
              </button>
              <button
                className={`btn btn-sm ${isMyPoolsActive ? 'btn-primary' : 'btn-outline-secondary'} rounded-xl`}
                onClick={() => handleFilterTab(2)}>
                My Pools
              </button>
            </div>
          </div>

          <div className="col-md-6">
            <h5 className="fw-semibold d-flex align-items-center gap-2 mb-3">
              <FiClock className="text-primary" /> Status
            </h5>
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`btn btn-sm ${filters.opened === '1' ? 'btn-primary' : 'btn-outline-secondary'} rounded-xl`}
                onClick={() => handleSubFilterTab(2)}>
                Open
              </button>
              <button
                className={`btn btn-sm ${filters.closed === '1' ? 'btn-primary' : 'btn-outline-secondary'} rounded-xl`}
                onClick={() => handleSubFilterTab(1)}>
                Closed
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }, [filters, currentUser]);

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
      })).then(() => {
        setCurrentPage(nextPage);
        setLoadMoreLoading(false);
      }).catch(() => {
        setLoadMoreLoading(false);
      });
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      term: '',
      joined: '',
      owner: '',
      closed: '',
      opened: '',
      orderBy: 'most_recent'
    });
    setSearchInput('');
    setCurrentPage(1);
  };

  if (!currentUser) {
    const formatReturnUrl = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    return <Navigate to={`/login?returnUrl=${formatReturnUrl}`} />;
  }

  return (
    <div className="container-xl my-4 my-md-5">
      <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4" style={{
        position: 'relative',
        zIndex: 1,
        isolation: 'isolate'
      }}>
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div className="flex-grow-1">
            <div className="input-group">
              <span className="input-group-text bg-transparent">
                <FiSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search pools..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary btn-sm rounded-xl dropdown-toggle d-flex align-items-center gap-1"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter />
                Filters
              </button>
            </div>

            <div className="dropdown">
              <button
                className="btn btn-outline-secondary btn-sm rounded-xl dropdown-toggle d-flex align-items-center gap-1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <TbArrowsSort />
                Sort
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button
                    className={`dropdown-item ${filters.orderBy === 'most_recent' ? 'active' : ''}`}
                    onClick={() => handleSort('most_recent')}
                  >
                    Most Recent
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item ${filters.orderBy === 'name' ? 'active' : ''}`}
                    onClick={() => handleSort('name')}
                  >
                    Pool Name
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item ${filters.orderBy === 'most_funded' ? 'active' : ''}`}
                    onClick={() => handleSort('most_funded')}
                  >
                    Most Funded
                  </button>
                </li>
              </ul>
            </div>

            <Link
              to="/pool-create"
              className="btn btn-primary btn-sm rounded-xl d-flex align-items-center gap-1"
            >
              <FiPlus />
              Create Pool
            </Link>
          </div>
        </div>
      </div>

      {showFilters && <PoolFiltersSection />}

      {poolLoading ? (
        <div className="d-flex justify-content-center my-5">
          <Hourglass
            visible={true}
            height="80"
            width="80"
            colors={['#FFD59B', '#FFC371']}
          />
        </div>
      ) : (
        <>
          <div className="row g-4">
            {pools?.items?.length > 0 ? (
              pools.items.map((pool) => (
                <div key={pool.id} className="col-md-6 col-lg-4">
                  <Pool pool={pool} />
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="glass rounded-2xl border-soft p-5 text-center shadow-soft">
                  <h3 className="fw-semibold mb-3">No pools found</h3>
                  <p className="text-slate-500 mb-4">Try adjusting your filters or create a new pool</p>
                  <Link
                    to="/pool-create"
                    className="btn btn-primary rounded-xl d-inline-flex align-items-center gap-1"
                  >
                    <FiPlus />
                    Create Pool
                  </Link>
                </div>
              </div>
            )}
          </div>

          {loadMoreLoading && (
            <div className="d-flex justify-content-center my-4">
              <Hourglass
                visible={true}
                height="60"
                width="60"
                colors={['#FFD59B', '#FFC371']}
              />
            </div>
          )}

          {pools?.total > 0 && pools.items.length < pools.total && (
            <div className="d-flex justify-content-center mt-4">
              <button
                onClick={handleLoadMore}
                disabled={loadMoreLoading}
                className="btn btn-outline-secondary rounded-xl"
              >
                {loadMoreLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Pools;