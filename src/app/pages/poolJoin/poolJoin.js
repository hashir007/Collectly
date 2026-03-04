import classNames from "./poolJoin.module.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useSearchParams } from "react-router-dom";
import { Hourglass } from 'react-loader-spinner';
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import moment from "moment";
import { ProgressBar, Modal } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import {
    getPoolJoin,
    filterPoolMembers,
    getMemberGoals,
    requestToJoinPool
} from '../../slices/pool';



const PoolJoin = () => {

    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlParams = new URLSearchParams(window.location.search);

    const PoolID = urlParams.get("id");
    const referral = urlParams.get("referral");

    const { user: currentUser, isLoggedIn } = useSelector((state) => state.auth);
    const { poolJoining, defaultSettings, filteredPoolMembers, topContributors } = useSelector((state) => state.pool);
    const [poolLoading, setPoolLoading] = useState(false);
    const [memberSearchTerm, setMemberSearchTerm] = useState("");



    useEffect(() => {
        setPoolLoading(true);
        if (isLoggedIn) {
            Promise.all([
                dispatch(getPoolJoin({ poolID: PoolID }))
            ]).finally(() => {
                setPoolLoading(false);
            });
        }
    }, [PoolID, isLoggedIn, dispatch]);



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


    const RequestToJoinPool = useCallback(() => {

        dispatch(requestToJoinPool({ poolID: PoolID, referral_code: referral }));          

    }, [dispatch, PoolID, referral]);



    if (!currentUser) {
        const formatReturnUrl = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
        return <Navigate to={`/login?returnUrl=${formatReturnUrl}`} replace />;
    }

    if (!PoolID) {
        return <Navigate to={`*`} />;
    }

    return (
        <>
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
                    <main className="container-xl my-4 my-md-5">
                        <div className="row g-4">

                            <div className="col-lg-8">
                                <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4">
                                    <div className="d-flex flex-wrap flex-md-nowrap align-items-start justify-content-between gap-4">
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                {
                                                    (poolJoining.status === 1) && (
                                                        <span className="badge bg-emerald-100 text-emerald-700 text-xs px-3 py-1 fw-semibold d-flex align-items-center gap-1">
                                                            <i className="bi bi-lightning-charge-fill"></i> Open
                                                        </span>
                                                    )
                                                }
                                                {
                                                    (poolJoining.status === 0) && (
                                                        <span className="badge bg-slate-100 text-slate-600 text-xs px-3 py-1 fw-semibold">
                                                            <i className="bi bi-people-fill me-1"></i> Close
                                                        </span>
                                                    )
                                                }
                                            </div>
                                            <h1 className="mb-2 mt-1 fs-2 fw-extrabold tracking-tight" id="poolTitle">{poolJoining.name || ""}</h1>
                                            <p id="poolDesc" className="mb-0 text-slate-600">{poolJoining.description || ""}</p>
                                        </div>
                                        <img src={poolJoining.photo || ""} alt="Banner" className="d-none d-sm-block rounded-xl ms-md-4" style={{ width: "10rem", height: "7rem", objectFit: "cover" }} loading="lazy" />
                                    </div>
                                    <div className="row g-3 mt-4">
                                        <div className="col-md-4">
                                            <div className="p-3 rounded-xl bg-white-90 border-soft h-100">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="text-sm text-slate-500">Raised</div>
                                                    <i className="bi bi-graph-up text-success"></i>
                                                </div>
                                                <div className="fs-2 fw-bold mt-1" id="poolRaised">${poolJoining.total_contributed}</div>
                                                <CustomProgressBar progressPercentage={poolJoining.goal_percentage} />
                                                <div className="text-xs text-slate-500 mt-1" id="progressLabel">{poolJoining.goal_percentage}% of goal</div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 rounded-xl bg-white-90 border-soft h-100">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="text-sm text-slate-500">Goal</div>
                                                    <i className="bi bi-flag text-primary"></i>
                                                </div>
                                                <div className="fs-2 fw-bold mt-1" id="poolGoal">${poolJoining.goal_amount}</div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="p-3 rounded-xl bg-white-90 border-soft h-100">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="text-sm text-slate-500">Contributors</div>
                                                    <i className="bi bi-heart-fill text-danger"></i>
                                                </div>
                                                <div className="fs-2 fw-bold mt-1" id="poolContribCount">{poolJoining.members}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="glass rounded-2xl border-soft shadow-soft p-0 overflow-hidden">
                                    <div className="px-4 pt-4">
                                        <div className="d-flex gap-2 mb-2" role="tablist">
                                            <i className="bi bi-info-circle me-1"></i> Overview
                                        </div>
                                    </div>
                                    <div className="row g-4">
                                        <div className="col-md-12">
                                            <div className="rounded-xl p-4 bg-white-90 h-100">
                                                <div className="mt-3">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <i className="bi bi-calendar text-slate-500"></i>
                                                        <div>
                                                            <div className="text-xs text-slate-500">Created</div>
                                                            <div className="fw-medium" id="poolCreatedAt">{moment(poolJoining.createdAt).format("dddd, Do MMMM YYYY, h:mm:ss A")}</div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <i className="bi bi-person text-slate-500"></i>
                                                        <div>
                                                            <div className="text-xs text-slate-500">Default buy in amount</div>
                                                            <div className="fw-medium" id="poolOwner">${poolJoining.defaultBuy_in_amount || 0}</div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <i className="bi bi-currency-dollar text-slate-500"></i>
                                                        <div>
                                                            <div className="text-xs text-slate-500">Minimum buy in amount</div>
                                                            <div className="fw-medium" id="poolMinContrib">${defaultSettings?.pool?.minimum_buy_amount}</div>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <i className="bi bi-eye text-slate-500"></i>
                                                        <div>
                                                            <div className="text-xs text-slate-500">Archived</div>
                                                            <div className="fw-medium" id="poolVisibility">{poolJoining.isArchive || "--"}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4">
                                <div className="glass rounded-2xl border-soft p-4 shadow-soft mb-4">
                                    <h5 className="fw-semibold d-flex align-items-center gap-2">
                                        <i className="bi bi-shield-lock text-warning"></i> Join
                                    </h5>
                                    <div className="alert alert-warning bg-warning bg-opacity-10 border-0 mt-3 text-sm">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        Join now to start collaborating with other members. Make sure to read the pool details before joining.
                                    </div>
                                    <button className="btn btn-outline-secondary btn-sm rounded-xl w-100 mt-2" onClick={RequestToJoinPool}>
                                        <i className="bi bi-flag me-1"></i> Join
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </>
            )}
        </>
    );
};

export default PoolJoin;