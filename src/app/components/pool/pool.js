import classes from './pool.module.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import useMediaQuery from "../../hooks/useMediaQuery";
import PoolService from "../../services/pool.service";
import { setMessage } from "../../slices/message";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { ProgressBar } from 'react-bootstrap';
import moment from 'moment';

const Pool = (props) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const { user: currentUser } = useSelector((state) => state.auth);
    const row = props.pool;
    const [isHovered, setIsHovered] = useState(false);

    const handlePoolSelection = (pool) => {
        navigate({
            pathname: '/pool-details',
            search: '?id=' + pool.id,
        });
    };


    const progressPercentage = Math.min(100, parseFloat(row.goal_percentage));

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

    return (
        <div
            className={`${classes.poolCard} ${row.status === 0 ? classes.closedPool : classes.openPool}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={classes.poolItem}>
                <div className={classes.poolThumbnail}>
                    <img
                        src={row.photo || "/assets/img/pool-thumbnails/pool-2.png"}
                        alt={row.name}
                        className={classes.thumbnailImage}
                        onClick={() => handlePoolSelection(row)}
                        loading="lazy"
                        draggable={false}
                    />
                    {row.status === 0 && (
                        <div className={classes.closedOverlay}>
                            <span>Closed</span>
                        </div>
                    )}
                    {row.isPrivate && (
                        <div className={classes.privateOverlay}>
                            <span>Private</span>
                        </div>
                    )}
                </div>

                <div className={classes.poolContent}>
                    <div className={classes.poolHeader}>
                        <div className={classes.titleSection}>
                            <h3
                                className={classes.poolTitle}
                                tabIndex={0}
                                onClick={() => handlePoolSelection(row)}
                            >
                                {row.name}
                            </h3>
                            <div className={classes.badgeContainer}>
                                {row.status === 0 && (
                                    <span className={`${classes.badge} ${classes.closedBadge}`}>
                                        Closed
                                    </span>
                                )}
                                {row.isPrivate && (
                                    <span className={`${classes.badge} ${classes.privateBadge}`}>
                                        Private
                                    </span>
                                )}
                            </div>
                            <div className={classes.createdDateRow}>
                                <span className={classes.createdLabel}>Created On</span>
                                <span className={classes.createdValue}>
                                    {moment(row.createdAt).format("dddd, Do MMM YYYY, h:mm:ss A")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={classes.membersSection}>
                        <div className={classes.memberAvatars}>
                            {row.poolMembers && row.poolMembers.slice(0, 4).map((member, i) => (
                                <OverlayTrigger
                                    key={`member-tooltip-${i}`}
                                    placement="top"
                                    overlay={
                                        <Tooltip id={`tooltip-${member.member.id}`}>
                                            {member.member.name}
                                        </Tooltip>
                                    }
                                >
                                    <img
                                        src={member.member.photo}
                                        className={classes.memberAvatar}
                                        alt={`${member.member.name}'s avatar`}
                                        style={{ zIndex: 10 - i, left: i * 22 }}
                                        loading="lazy"
                                        draggable={false}
                                    />
                                </OverlayTrigger>
                            ))}
                            {row.poolMembers && row.poolMembers.length > 4 && (
                                <span className={classes.moreMembers}>
                                    +{row.poolMembers.length - 4}
                                </span>
                            )}
                        </div>
                        <div className={classes.memberCount}>
                            {row.poolMembers?.length || 0} Going
                        </div>
                    </div>

                    <div className={classes.progressSection}>
                        <div className={classes.progressLabels}>
                            <span className={classes.raisedAmount}>
                                ${row.total_contributed}
                            </span>
                            <span className={classes.goalAmount}>
                                Goal: ${row.goal_amount}
                            </span>
                        </div>
                        <CustomProgressBar progressPercentage={progressPercentage} />
                    </div>
                </div>
            </div>

            {/* Private Pool Modal */}
            <div className="modal fade" id="JoinPrivateNotification" tabIndex="-1" aria-labelledby="JoinPrivateNotification" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Private Pool</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <p>Private pools can only be joined by invitation from existing members.</p>
                            <p>If you'd like to join this pool, please ask a current member to send you an invitation.</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Understood</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pool;