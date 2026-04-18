import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, Link } from 'react-router-dom';
import { Chart } from "react-google-charts";
import { Hourglass } from 'react-loader-spinner';
import moment from 'moment';
import TimeAgo from 'react-timeago';
import { convertUTCDateToLocalDate } from '../../helpers/dateTimeHelper';
import { getTotalPoolPaymentByMonths, getTotalPoolPaymentByWeek } from "../../slices/finance";
import { filterPools } from "../../slices/pool";
import {
  LuPlus,
  LuSearch,
  LuCalendar,
  LuTrendingUp,
  LuUsers,
  LuDollarSign,
  LuExternalLink,
  LuZap,
} from 'react-icons/lu';

/* ─── tiny stat card ─── */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    background: 'white',
    borderRadius: 24,
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    padding: '20px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(93,95,239,0.25)')}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)')}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white',
    }}>
      <Icon size={18} />
    </div>
    <div>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-dark)', margin: 0, letterSpacing: '-0.03em' }}>{value}</p>
    </div>
  </div>
);

/* ─── inline progress bar ─── */
const MiniProgress = ({ pct }) => (
  <div style={{ width: '100%', height: 6, background: 'rgba(93,95,239,0.1)', borderRadius: 99 }}>
    <div style={{
      width: `${Math.min(100, pct)}%`, height: '100%',
      background: 'linear-gradient(90deg,#5D5FEF,#4ADE80)',
      borderRadius: 99, transition: 'width 0.6s ease',
    }} />
  </div>
);

const Dashboard = () => {
  const searchParams = useLocation();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { monthChart, monthChartTicks, weekChart, weekChartTicks } = useSelector((state) => state.finance);
  const [myPools, setMyPools] = useState([]);
  const [userJoinedPools, setUserJoinedPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          const [, , ownedRes, joinedRes] = await Promise.all([
            dispatch(getTotalPoolPaymentByMonths({})),
            dispatch(getTotalPoolPaymentByWeek({})),
            dispatch(filterPools({ page: 1, pageSize: 10, term: '', joined: '', owner: currentUser.user.id, closed: '', opened: '', orderBy: 'most_recent', userId: currentUser.user.id })),
            dispatch(filterPools({ page: 1, pageSize: 10, term: '', joined: currentUser.user.id, owner: '', closed: '', opened: '', orderBy: 'most_recent', userId: currentUser.user.id })),
          ]);
          setMyPools(ownedRes.payload?.Pools?.items || []);
          setUserJoinedPools(joinedRes.payload?.Pools?.items || []);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [currentUser, dispatch]);

  if (!currentUser) {
    const returnUrl = encodeURIComponent(`${searchParams.pathname}${searchParams.search}`);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} />;
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
      <Hourglass visible height="72" width="72" colors={['#5D5FEF', '#FF7EB3']} />
    </div>
  );

  const totalRaised = myPools.reduce((s, p) => s + parseFloat(p.total_contributed || 0), 0);
  const totalMembers = myPools.reduce((s, p) => s + (p.members || 0), 0);

  const chartOpts = {
    chartArea: { width: '82%', height: '72%' },
    legend: 'none',
    backgroundColor: 'transparent',
    colors: ['#5D5FEF'],
    animation: { startup: true, easing: 'out', duration: 1200 },
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

      {/* ── Greeting ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '-0.03em', marginBottom: 4 }}>
          Welcome back, {currentUser.user.username} 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
          Here's what's happening with your pools today.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={LuTrendingUp}  label="Total Raised"  value={`$${totalRaised.toLocaleString()}`} color="#5D5FEF" />
        <StatCard icon={LuDollarSign}  label="My Pools"      value={myPools.length}                     color="#FF7EB3" />
        <StatCard icon={LuUsers}       label="Total Members" value={totalMembers}                        color="#4ADE80" />
        <StatCard icon={LuCalendar}    label="Joined Pools"  value={userJoinedPools.length}              color="#FFD363" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Financial Overview */}
          <div style={{
            background: 'white', borderRadius: 32,
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            padding: '28px 28px 24px',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: 24, letterSpacing: '-0.02em' }}>
              Financial Overview
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Monthly */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ padding: '6px', background: 'rgba(93,95,239,0.1)', borderRadius: 10, color: 'var(--brand-primary)', display: 'flex' }}>
                    <LuCalendar size={16} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-dark)' }}>Monthly Contributions</span>
                </div>
                {monthChart?.length > 0 ? (
                  <Chart chartType="AreaChart" width="100%" height="240px" data={monthChart}
                    options={{ ...chartOpts, hAxis: { title: 'Month', textStyle: { color: '#6B7280' }, titleTextStyle: { color: '#6B7280' } }, vAxis: { ticks: monthChartTicks, minValue: 0, textStyle: { color: '#6B7280' } }, lineWidth: 2.5 }}
                  />
                ) : (
                  <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 8 }}>
                    <LuTrendingUp size={36} style={{ opacity: 0.3 }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>No monthly data yet</span>
                  </div>
                )}
              </div>

              {/* Weekly */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ padding: '6px', background: 'rgba(74,222,128,0.1)', borderRadius: 10, color: '#4ADE80', display: 'flex' }}>
                    <LuTrendingUp size={16} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-dark)' }}>Weekly Comparison</span>
                </div>
                {weekChart?.length > 0 ? (
                  <Chart chartType="ColumnChart" width="100%" height="240px" data={weekChart}
                    options={{ ...chartOpts, colors: ['#5D5FEF', '#FF7EB3'], hAxis: { textStyle: { color: '#6B7280' } }, vAxis: { ticks: weekChartTicks, minValue: 0, textStyle: { color: '#6B7280' } }, bar: { groupWidth: '55%' } }}
                  />
                ) : (
                  <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 8 }}>
                    <LuTrendingUp size={36} style={{ opacity: 0.3 }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>No weekly data yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* My Pools */}
          <div style={{
            background: 'white', borderRadius: 32,
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            padding: '24px 28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0, letterSpacing: '-0.02em' }}>My Pools</h2>
              <Link to="/pools" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px',
                border: '1.5px solid rgba(93,95,239,0.25)',
                borderRadius: 10,
                color: 'var(--brand-primary)',
                fontWeight: 700, fontSize: '0.8rem',
                textDecoration: 'none',
              }}>
                See all <LuExternalLink size={13} />
              </Link>
            </div>

            {myPools.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
                {myPools.slice(0, 4).map(pool => (
                  <div key={pool.id} style={{
                    background: 'var(--surface)',
                    borderRadius: 20, border: '1px solid var(--border-color)',
                    padding: '18px',
                    display: 'flex', flexDirection: 'column', gap: 12,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={pool.photo || "/assets/img/pool-thumbnails/pool-2.png"} alt={pool.name}
                        style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                          <h4 style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pool.name}
                          </h4>
                          <span style={{
                            padding: '3px 8px',
                            background: pool.status === 1 ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.1)',
                            color: pool.status === 1 ? '#16a34a' : '#dc2626',
                            borderRadius: 99, fontSize: '9px', fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0,
                          }}>
                            {pool.status === 1 ? 'Active' : 'Closed'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
                          By {pool.poolOwner?.username || 'Unknown'}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                        <LuUsers size={13} style={{ color: 'var(--brand-yellow)' }} /> {pool.members || 0} members
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                        <LuDollarSign size={13} style={{ color: 'var(--brand-green)' }} /> ${pool.total_contributed || 0}
                      </span>
                    </div>

                    <MiniProgress pct={pool.goal_percentage || 0} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      <span>${pool.total_contributed || 0} raised</span>
                      <span>${pool.goal_amount || 0} goal</span>
                    </div>

                    <Link to={`/pool-details?id=${pool.id}`} style={{
                      display: 'block', textAlign: 'center',
                      padding: '9px',
                      background: 'white',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: 12,
                      color: 'var(--text-dark)',
                      fontWeight: 700, fontSize: '0.82rem',
                      textDecoration: 'none',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-primary)'; e.currentTarget.style.color = 'var(--brand-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-dark)'; }}
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <LuSearch size={40} style={{ opacity: 0.25, marginBottom: 12 }} />
                <p style={{ fontWeight: 600, marginBottom: 16 }}>You haven't created any pools yet.</p>
                <Link to="/pool-create" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 20px',
                  background: 'var(--brand-primary)',
                  color: 'white', borderRadius: 12,
                  fontWeight: 800, fontSize: '0.85rem', textDecoration: 'none',
                }}>
                  <LuPlus size={15} strokeWidth={3} /> Create Your First Pool
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Joined Pools */}
          <div style={{
            background: 'white', borderRadius: 32,
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>Joined Pools</h2>
              <Link to="/pools" style={{
                padding: '4px 12px',
                border: '1.5px solid rgba(93,95,239,0.25)',
                borderRadius: 99, color: 'var(--brand-primary)',
                fontWeight: 700, fontSize: '0.72rem',
                textDecoration: 'none',
              }}>
                See all
              </Link>
            </div>

            {userJoinedPools.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {userJoinedPools.slice(0, 4).map(pool => (
                  <div key={pool.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px',
                    borderRadius: 16,
                    border: '1px solid transparent',
                    transition: 'background 0.15s, border-color 0.15s',
                    cursor: 'default',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <img src={pool.photo || "/assets/img/pool-thumbnails/pool-2.png"} alt={pool.name}
                      style={{ width: 50, height: 50, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pool.name}
                      </h4>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 4px' }}>
                        By {pool.poolOwner?.username || 'Unknown'}
                      </p>
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>
                        <TimeAgo date={convertUTCDateToLocalDate(new Date(pool.createdAt))} />
                      </p>
                    </div>
                    <Link to={`/pool-details?id=${pool.id}`} style={{
                      padding: '6px 12px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 9,
                      color: 'var(--text-dark)',
                      fontWeight: 700, fontSize: '0.75rem',
                      textDecoration: 'none', flexShrink: 0,
                      transition: 'border-color 0.15s',
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)' }}>
                <LuUsers size={32} style={{ opacity: 0.25, marginBottom: 10 }} />
                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 14 }}>You haven't joined any pools yet.</p>
                <Link to="/pools" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 18px',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 10,
                  color: 'var(--text-dark)',
                  fontWeight: 700, fontSize: '0.82rem',
                  textDecoration: 'none',
                }}>
                  Explore Pools
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'white', borderRadius: 32,
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            padding: '24px',
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 16px' }}>
              <LuZap size={18} style={{ color: 'var(--brand-yellow)' }} /> Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/pool-create" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px',
                background: 'var(--brand-primary)',
                color: 'white', borderRadius: 18,
                fontWeight: 800, fontSize: '0.9rem',
                textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(93,95,239,0.28)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <LuPlus size={18} strokeWidth={3} /> Create New Pool
              </Link>
              <Link to="/pools" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '14px',
                background: 'var(--surface)',
                color: 'var(--text-dark)',
                border: '1px solid var(--border-color)',
                borderRadius: 18,
                fontWeight: 800, fontSize: '0.9rem',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e8eaf0')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--surface)')}
              >
                <LuSearch size={18} /> Explore Pools
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
