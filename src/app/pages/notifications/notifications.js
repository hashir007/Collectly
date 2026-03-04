import classes from './notifications.module.css';
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import TimeAgo from 'react-timeago';
import moment from 'moment';
import {
    getNotifications,
    notificationsMarkRead,
    notificationDelete
} from '../../slices/auth';

const Notifications = () => {
    let navigate = useNavigate();
    const searchParams = useLocation();
    const dispatch = useDispatch();
    const { user: currentUser, notification } = useSelector((state) => state.auth);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState('all');

    const pageSize = 20;

    function utcToLocal(utcdateTime) {
        return moment(utcdateTime).local();
    }

    const fetchNotifications = (page, filterType = filter) => {
        let isReadParam = null;
        if (filterType === 'read') isReadParam = true;
        else if (filterType === 'unread') isReadParam = false;

        dispatch(getNotifications({
            userId: currentUser.user.id,
            page: page,
            pageSize: pageSize,
            isRead: isReadParam
        }));
    };

    useEffect(() => {
        if (currentUser) {
            fetchNotifications(currentPage);
        }
    }, [currentUser, currentPage, filter]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleMarkAsRead = (notificationId) => {
        dispatch(notificationsMarkRead({ userId: currentUser.user.id, notificationId: notificationId })).unwrap().then(() => {
            fetchNotifications(currentPage);
        });
    };

    const handleDeleteNotification = (notificationId) => {
        if (window.confirm("Are you sure you want to delete this notification?")) {
            dispatch(notificationDelete({ userId: currentUser.user.id, notificationId: notificationId })).unwrap().then(() => {
                fetchNotifications(currentPage);
            });
        }
    };

    if (!currentUser) {
        let formatReturnUrl = encodeURIComponent(`${searchParams.pathname}${searchParams.search}`);
        let returnUrl = `?returnUrl=${formatReturnUrl}`;
        return <Navigate to={`/login${returnUrl}`} />;
    }

    const pagination = notification?.pagination;
    const hasNotifications = notification?.pagination?.totalItems > 0;

    return (
        <>
            <main className={classes.container}>
                <div className="row justify-content-center">
                    <div className="col-xxl-6 col-lg-8 col-md-10">
                        <div className={classes.card}>
                            {/* Header */}
                            <div className={classes.cardHeader}>
                                <div className={classes.headerContent}>
                                    <div className={classes.titleSection}>
                                        <i className={`fas fa-bell ${classes.titleIcon}`}></i>
                                        <div>
                                            <h1 className={classes.title}>Notifications</h1>
                                            {hasNotifications && (
                                                <span className={classes.badge}>
                                                    {pagination.totalItems} total
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Filter Buttons */}
                                    <div className={classes.filterButtons}>
                                        <button
                                            className={`${classes.filterButton} ${filter === 'all' ? classes.filterButtonActive : ''}`}
                                            onClick={() => handleFilterChange('all')}
                                        >
                                            All
                                        </button>
                                        <button
                                            className={`${classes.filterButton} ${filter === 'unread' ? classes.filterButtonActive : ''}`}
                                            onClick={() => handleFilterChange('unread')}
                                        >
                                            Unread
                                        </button>
                                        <button
                                            className={`${classes.filterButton} ${filter === 'read' ? classes.filterButtonActive : ''}`}
                                            onClick={() => handleFilterChange('read')}
                                        >
                                            Read
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className={classes.cardBody}>
                                {!hasNotifications ? (
                                    <div className={classes.emptyState}>
                                        <div className={classes.emptyIcon}>
                                            <i className="fas fa-bell-slash"></i>
                                        </div>
                                        <h3 className={classes.emptyTitle}>No notifications yet</h3>
                                        <p className={classes.emptyText}>We'll notify you when something important happens.</p>
                                        <button className="btn btn-primary">
                                            <i className="fas fa-home me-2"></i>
                                            Return to Dashboard
                                        </button>
                                    </div>
                                ) : (
                                    <div className={classes.notificationsList}>
                                        <div className={classes.notificationsContainer}>
                                            {notification?.notifications?.map((item, index) => (
                                                <div
                                                    className={`${classes.notificationItem} ${item.isRead ? classes.notificationItemRead : classes.notificationItemUnread}`}
                                                    key={item.id || index}
                                                >
                                                    <div className={classes.notificationContent}>
                                                        <div className={classes.notificationMain}>
                                                            <div className={`${classes.notificationIcon} ${item.isRead ? classes.notificationIconRead : classes.notificationIconUnread}`}>
                                                                <i className={`fas ${item.isRead ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                                                            </div>
                                                            <div className={classes.notificationText}>
                                                                <p className={`${classes.notificationMessage} ${item.isRead ? classes.notificationMessageRead : classes.notificationMessageUnread}`}>
                                                                    {item.message}
                                                                </p>
                                                                <div className={classes.notificationMeta}>
                                                                    <span className={classes.notificationTime}>
                                                                        <i className="fas fa-clock me-1"></i>
                                                                        <TimeAgo date={utcToLocal(new Date(item.createdAt))} />
                                                                    </span>
                                                                    {!item.isRead && (
                                                                        <span className={classes.unreadBadge}>
                                                                            <i className={`fas fa-circle ${classes.unreadDot}`}></i>
                                                                            Unread
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className={classes.notificationActions}>
                                                            {!item.isRead && (
                                                                <button
                                                                    type="button"
                                                                    className={`${classes.actionButton} ${classes.markReadButton}`}
                                                                    onClick={() => handleMarkAsRead(item.id)}
                                                                    title="Mark as read"
                                                                >
                                                                    <i className="fas fa-check"></i>
                                                                    <span>Mark Read</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className={`${classes.actionButton} ${classes.deleteButton}`}
                                                                onClick={() => handleDeleteNotification(item.id)}
                                                                title="Delete notification"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                                <span>Delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Pagination Footer */}
                            {hasNotifications && pagination.totalPages > 1 && (
                                <div className={classes.paginationFooter}>
                                    <div className={classes.paginationContent}>
                                        <div className={classes.resultsInfo}>
                                            <i className="fas fa-list me-1"></i>
                                            Showing <strong>{((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, pagination.totalItems)}</strong> of <strong>{pagination.totalItems}</strong> notifications
                                        </div>

                                        <div className={classes.paginationControls}>
                                            <button
                                                className={classes.paginationButton}
                                                disabled={!pagination.hasPreviousPage}
                                                onClick={() => handlePageChange(currentPage - 1)}
                                            >
                                                <i className="fas fa-chevron-left"></i>
                                                <span>Previous</span>
                                            </button>

                                            <div className={classes.pageNumbers}>
                                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (pagination.totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= pagination.totalPages - 2) {
                                                        pageNum = pagination.totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            className={`${classes.pageButton} ${currentPage === pageNum ? classes.pageButtonActive : ''}`}
                                                            onClick={() => handlePageChange(pageNum)}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className={classes.mobilePageIndicator}>
                                                Page {currentPage} of {pagination.totalPages}
                                            </div>

                                            <button
                                                className={classes.paginationButton}
                                                disabled={!pagination.hasNextPage}
                                                onClick={() => handlePageChange(currentPage + 1)}
                                            >
                                                <span>Next</span>
                                                <i className="fas fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default Notifications;