import classNames from './dashboard.module.css';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { Chart } from "react-google-charts";
import { Hourglass } from 'react-loader-spinner';
import moment from 'moment';
import TimeAgo from 'react-timeago';
import { convertUTCDateToLocalDate } from '../../helpers/dateTimeHelper';
import {
    getTotalPoolPaymentByMonths,
    getTotalPoolPaymentByWeek
} from "../../slices/finance";
import { filterPools } from "../../slices/pool";
import EventBus from "../../common/eventBus";
import { ProgressBar, Modal } from 'react-bootstrap';


const Dashboard = () => {
    const searchParams = useLocation();
    const navigate = useNavigate();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { pools } = useSelector((state) => state.pool);
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
                    const [monthResponse, weekResponse, ownedPoolsResponse, joinedPoolsResponse] = await Promise.all([
                        dispatch(getTotalPoolPaymentByMonths({})),
                        dispatch(getTotalPoolPaymentByWeek({})),
                        dispatch(filterPools({
                            page: 1,
                            pageSize: 10,
                            term: '',
                            joined: '',
                            owner: currentUser.user.id,
                            closed: '',
                            opened: '',
                            orderBy: 'most_recent',
                            userId: currentUser.user.id
                        })),
                        dispatch(filterPools({
                            page: 1,
                            pageSize: 10,
                            term: '',
                            joined: currentUser.user.id,
                            owner: '',
                            closed: '',
                            opened: '',
                            orderBy: 'most_recent',
                            userId: currentUser.user.id
                        }))
                    ]);


                    setMyPools(ownedPoolsResponse.payload?.Pools?.items || []);
                    setUserJoinedPools(joinedPoolsResponse.payload?.Pools?.items || []);

                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [currentUser, dispatch]);

    const CustomProgressBar = ({ progressPercentage }) => {
        return (
            <div className="progress-container">
                <ProgressBar
                    now={progressPercentage}
                    className="custom-progress-bar"
                />
            </div>
        );
    };

    if (!currentUser) {
        let formatReturnUrl = encodeURIComponent(`${searchParams.pathname}${searchParams.search}`);
        let returnUrl = `?returnUrl=${formatReturnUrl}`;
        return <Navigate to={`/login${returnUrl}`} />;
    }

    return (
        <>
            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <Hourglass
                        visible={true}
                        height="80"
                        width="80"
                        colors={['#FFD59B', '#FFC371']}
                    />
                </div>
            ) : (
                <main className="container-xl my-4 my-md-5">
                    <div className="row g-4">
                        {/* Charts Section */}
                        <div className="col-lg-8">
                            <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4">
                                <h2 className="mb-4 fw-extrabold">Financial Overview</h2>
                                <div className="row g-4">
                                    <div className="col-md-6">
                                        <div className="glass rounded-2xl border-soft p-4 shadow-soft h-100">
                                            <h5 className="fw-semibold d-flex align-items-center gap-2 mb-3">
                                                <i className="bi bi-calendar-month text-primary"></i> Monthly Contributions
                                            </h5>
                                            <div className="dashboard-graph">
                                                {monthChart && monthChart.length > 0 ? (
                                                    <Chart
                                                        chartType="AreaChart"
                                                        width="100%"
                                                        height="300px"
                                                        data={monthChart}
                                                        options={{
                                                            title: "",
                                                            hAxis: {
                                                                title: "Month",
                                                                titleTextStyle: { color: "#6B7280" },
                                                                textStyle: { color: "#6B7280" }
                                                            },
                                                            vAxis: {
                                                                ticks: monthChartTicks,
                                                                minValue: 0,
                                                                textStyle: { color: "#6B7280" }
                                                            },
                                                            chartArea: { width: "80%", height: "70%" },
                                                            colors: ['#C5914B'],
                                                            legend: "none",
                                                            lineWidth: 3,
                                                            animation: {
                                                                startup: true,
                                                                easing: "linear",
                                                                duration: 1500,
                                                            },
                                                            backgroundColor: 'transparent',
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="text-center py-5 text-muted">
                                                        <i className="bi bi-bar-chart display-4"></i>
                                                        <p>No monthly data available</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="glass rounded-2xl border-soft p-4 shadow-soft h-100">
                                            <h5 className="fw-semibold d-flex align-items-center gap-2 mb-3">
                                                <i className="bi bi-calendar-week text-success"></i> Weekly Comparison
                                            </h5>
                                            <div className="dashboard-graph">
                                                {weekChart && weekChart.length > 0 ? (
                                                    <Chart
                                                        chartType="ColumnChart"
                                                        width="100%"
                                                        height="300px"
                                                        data={weekChart}
                                                        options={{
                                                            title: "",
                                                            chartArea: { width: "80%", height: "70%" },
                                                            isStacked: true,
                                                            legend: "none",
                                                            bar: { groupWidth: "60%" },
                                                            hAxis: {
                                                                title: "Week",
                                                                minValue: 0,
                                                                textStyle: { color: "#6B7280" }
                                                            },
                                                            vAxis: {
                                                                title: "Contributed",
                                                                ticks: weekChartTicks,
                                                                minValue: 0,
                                                                textStyle: { color: "#6B7280" }
                                                            },
                                                            colors: ['#FFC371', '#FF796E'],
                                                            animation: {
                                                                startup: true,
                                                                easing: "linear",
                                                                duration: 1500,
                                                            },
                                                            backgroundColor: 'transparent',
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="text-center py-5 text-muted">
                                                        <i className="bi bi-bar-chart display-4"></i>
                                                        <p>No weekly data available</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* My Pools Section */}
                            <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="fw-extrabold mb-0">My Pools</h2>
                                    <Link className="btn btn-outline-primary rounded-xl" to={"/pools"}>
                                        See all <i className="bi bi-arrow-right ms-1"></i>
                                    </Link>
                                </div>
                                <div className="row g-4">
                                    {myPools.length > 0 ? (
                                        myPools.slice(0, 2).map(pool => (
                                            <div key={pool.id} className="col-md-6">
                                                <div className="glass-card rounded-xl border-soft p-4 h-100 d-flex flex-column">
                                                    {/* Pool Image and Header */}
                                                    <div className="d-flex align-items-start gap-3 mb-3">
                                                        <img
                                                            src={pool.photo || "https://via.placeholder.com/60"}
                                                            alt={pool.name}
                                                            className="rounded-xl"
                                                            style={{
                                                                width: "60px",
                                                                height: "60px",
                                                                objectFit: "cover"
                                                            }}
                                                        />
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <h5 className="fw-bold text-truncate mb-1" style={{ maxWidth: 150 }}>{pool.name}</h5>
                                                                <span className={`badge rounded-pill ${pool.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                                                                    {pool.status === 1 ? 'Active' : 'Closed'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-muted small mb-0">By {pool.poolOwner?.username || 'Unknown'}</p>

                                                    <div className="d-flex justify-content-between align-items-center mt-2">
                                                        <div className="d-flex align-items-center">
                                                            <i className="bi bi-people-fill me-2 text-warning"></i>
                                                            <small>{pool.members || 0} members</small>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            <i className="bi bi-currency-dollar me-2 text-success"></i>
                                                            <small>${pool.total_contributed || 0}</small>
                                                        </div>
                                                    </div>
                                                    <div className="progress mb-2" style={{ height: '4px' }}>
                                                        <CustomProgressBar progressPercentage={pool.goal_percentage || 0} />
                                                    </div>
                                                    <div className="d-flex justify-content-between mt-2">
                                                        <small className="text-muted">${pool.total_contributed || 0} collected</small>
                                                        <small className="text-muted">${pool.goal_amount || 0} goal</small>
                                                    </div>
                                                    <div className="mt-3">
                                                        <Link
                                                            to={`/pool-details?id=${pool.id}`}
                                                            className="btn btn-outline-primary btn-sm w-100 rounded-xl"
                                                        >
                                                            View Details
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-12 text-center py-4">
                                            <i className="bi bi-inbox display-4 text-muted"></i>
                                            <p className="text-muted mt-2">You haven't created any pools yet.</p>
                                            <Link to="/pool-create" className="btn btn-primary rounded-xl mt-2">
                                                Create Your First Pool
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar */}
                        <div className="col-lg-4">
                            {/* Joined Pools Section */}
                            <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h2 className="fw-extrabold mb-0">Joined Pools</h2>
                                    <Link className="btn btn-outline-primary rounded-xl" to={"/pools"}>
                                        See all <i className="bi bi-arrow-right ms-1"></i>
                                    </Link>
                                </div>
                                {userJoinedPools.length > 0 ? (
                                    userJoinedPools.slice(0, 2).map(pool => (
                                        <div key={pool.id} className="mb-3">
                                            <div className="glass-card rounded-xl border-soft p-3">
                                                {/* Pool Image and Header */}
                                                <div className="d-flex align-items-start gap-3 mb-2">
                                                    <img
                                                        src={pool.photo || "https://via.placeholder.com/50"}
                                                        alt={pool.name}
                                                        className="rounded-xl"
                                                        style={{
                                                            width: "50px",
                                                            height: "50px",
                                                            objectFit: "cover"
                                                        }}
                                                    />
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <h6 className="fw-semibold text-truncate mb-1" style={{ maxWidth: 200 }}>{pool.name}</h6>
                                                            <span className={`badge rounded-pill ${pool.status === 1 ? 'bg-success' : 'bg-secondary'}`}>
                                                                {pool.status === 1 ? 'Active' : 'Closed'}
                                                            </span>
                                                        </div>
                                                        <p className="text-muted small mb-0">By {pool.poolOwner?.username || 'Unknown'}</p>
                                                    </div>
                                                </div>

                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-currency-dollar me-1 text-success small"></i>
                                                        <small>${pool.total_contributed || 0} of ${pool.goal_amount || 0}</small>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-people-fill me-1 text-primary small"></i>
                                                        <small>{pool.members || 0}</small>
                                                    </div>
                                                </div>
                                                <div className="progress mb-2" style={{ height: '4px' }}>
                                                    <CustomProgressBar progressPercentage={pool.goal_percentage || 0} />
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="badge bg-light text-dark small">
                                                        <TimeAgo date={convertUTCDateToLocalDate(new Date(pool.createdAt))} />
                                                    </span>
                                                    <Link to={`/pool-details?id=${pool.id}`} className="btn btn-sm btn-outline-secondary rounded-xl">
                                                        View
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-3">
                                        <i className="bi bi-people display-5 text-muted"></i>
                                        <p className="text-muted mt-2">You haven't joined any pools yet.</p>
                                        <Link to="/pools" className="btn btn-outline-primary btn-sm rounded-xl">
                                            Explore Pools
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="glass rounded-2xl border-soft p-4 shadow-soft mt-4">
                                <h5 className="fw-semibold d-flex align-items-center gap-2 mb-3">
                                    <i className="bi bi-lightning-fill text-warning"></i> Quick Actions
                                </h5>
                                <div className="d-grid gap-2">
                                    <Link to="/pool-create" className="btn btn-primary rounded-xl">
                                        <i className="bi bi-plus-circle me-2"></i> Create New Pool
                                    </Link>
                                    <Link to="/pools" className="btn btn-outline-secondary rounded-xl">
                                        <i className="bi bi-search me-2"></i> Explore Pools
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </>
    );
};

export default Dashboard;