import classes from './pool.module.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import moment from 'moment';
import { LuUser } from 'react-icons/lu';

const Pool = ({ pool: row }) => {
    const navigate = useNavigate();
    const { user: currentUser } = useSelector((state) => state.auth);

    const handlePoolSelection = () => {
        navigate({ pathname: '/pool-details', search: '?id=' + row.id });
    };

    const progress = Math.min(100, parseFloat(row.goal_percentage || 0));
    const isClosed = row.status === 0;

    return (
        <div
            className={`${classes.poolCard} ${isClosed ? classes.closedPool : ''}`}
            onClick={handlePoolSelection}
        >
            {/* ── Image ── */}
            <div className={classes.poolThumbnail}>
                <img
                    src={row.photo || "/assets/img/pool-thumbnails/pool-2.png"}
                    alt={row.name}
                    className={classes.thumbnailImage}
                    loading="lazy"
                    draggable={false}
                />
                <span className={classes.statusBadge}>
                    {isClosed ? 'Closed' : 'Community'}
                </span>
                {row.isPrivate && !isClosed && (
                    <span className={classes.privatePill}>Private</span>
                )}
                {isClosed && (
                    <span className={classes.closedPill}>Closed</span>
                )}
            </div>

            {/* ── Content ── */}
            <div className={classes.poolContent}>
                <div>
                    <h3 className={classes.poolTitle}>{row.name}</h3>
                    <p className={classes.poolDescription}>
                        {row.description || 'No description provided.'}
                    </p>
                </div>

                {/* Progress */}
                <div className={classes.progressSection}>
                    <div className={classes.progressTop}>
                        <span>
                            <span className={classes.raisedAmount}>
                                ${(row.total_contributed || 0).toLocaleString()}
                            </span>
                            <span className={classes.raisedLabel}>raised</span>
                        </span>
                    </div>
                    <div className={classes.progressBar}>
                        <div
                            className={classes.progressFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className={classes.progressMeta}>
                        {row.poolMembers?.length || 0} members &bull; {progress.toFixed(0)}% of ${(row.goal_amount || 0).toLocaleString()} goal
                    </p>
                </div>

                {/* Footer */}
                <div className={classes.poolFooter}>
                    <div className={classes.creatorInfo}>
                        <div className={classes.creatorAvatar}>
                            <LuUser size={12} />
                        </div>
                        <span className={classes.creatorName}>
                            {row.poolOwner?.username || 'Unknown'}
                        </span>
                    </div>
                    <span className={classes.createdDate}>
                        {moment(row.createdAt).format("D MMM YYYY")}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Pool;
