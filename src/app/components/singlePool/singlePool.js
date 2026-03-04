import React, { useState, useEffect, useRef, useCallback } from "react";
import classes from './singlePool.module.css';
import { useDispatch, useSelector } from "react-redux";
import { Formik, Field, Form, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import useMediaQuery from "../../hooks/useMediaQuery";
import UserService from "../../services/user.service";
import { clearMessage, setMessage } from "../../slices/message";
import { renderToString } from 'react-dom/server';
import { addToRoom } from "../../slices/chat"
import { setNewPool } from "../../slices/pool";
import PoolService from "../../services/pool.service";
import EventBus from "../../common/eventBus";
import Modal from 'react-bootstrap/Modal';


const SinglePool = (props) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchParams = useLocation();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { newPool } = useSelector((state) => state.pool);
    const [loading, setLoading] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);


    const handlePoolCreate = function (formValue) {

        dispatch(setNewPool(formValue));

        const { photo, name, description, defaultBuy_in_amount, goal_amount, maxMembers, is_private } = formValue;

        setLoading(true);

        if (currentUser) {

            PoolService.createPools(
                name,
                props.PoolsTypeID,
                props.PoolsFormatID,
                description,
                parseFloat(defaultBuy_in_amount),
                parseFloat(goal_amount),
                parseInt(maxMembers),
                photo,
                null,
                is_private
            ).then(
                (response) => {
                    setLoading(false);

                    let newPool = response.data.response_body.Pool
                    newPool.conversationType = 'POOL';
                    newPool.PoolsMessages = [];
                    dispatch(addToRoom(newPool))
                    dispatch(setNewPool({}));
                    navigate({
                        pathname: '/pool-details',
                        search: '?id=' + response.data.response_body.Pool.id,
                    });

                },
                (error) => {
                    const _content =
                        (error.response &&
                            error.response.data &&
                            error.response.data.response_message) ||
                        error.message ||
                        error.toString();


                    setLoading(false);


                }
            );


        } else {
            if (!currentUser) {
                setShowLoginPopup(true);
            }

        }
    }

    const handleFileChange = (e, setFieldValue) => {
        if (!e.target.files) {
            return;
        }

        if (currentUser) {

            UserService.fileUpload(e.target.files).then(
                (response) => {
                    setLoading(false);
                    setFieldValue('photo', response.data.response_body.File[0].id, false);
                    setFieldValue('photoUrl', response.data.response_body.File[0].url, false);
                },
                (error) => {
                    const _content =
                        (error.response &&
                            error.response.data &&
                            error.response.data.response_message) ||
                        error.message ||
                        error.toString();
                    setLoading(false);
                    dispatch(setMessage(_content));




                }
            );
        }

    };

    const handleCloseLoginPopup = useCallback(() => {
        setShowLoginPopup(false)
    }, []);

    const handlePoolCreateLogin = useCallback(() => {
        let formatReturnUrl = encodeURIComponent(`${searchParams.pathname}${searchParams.search}`);
        let returnUrl = `?returnUrl=${formatReturnUrl}`;
        navigate(`/login${returnUrl}`);
    }, [searchParams]);

    const handlePoolCreateRegister = useCallback(() => {
        let formatReturnUrl = encodeURIComponent(`${searchParams.pathname}${searchParams.search}`);
        let returnUrl = `?returnUrl=${formatReturnUrl}`;
        navigate(`/register${returnUrl}`);
    }, [searchParams]);


    return (<>
        <div className="select-type-of-pool">
            <div className="create-single-pool-area" style={{ display: 'block' }}>
                <Formik
                    initialValues={{
                        photo: newPool?.photo ? newPool.photo : '',
                        photoUrl: newPool?.photoUrl ? newPool.photoUrl : '',
                        name: newPool?.name ? newPool.name : '',
                        defaultBuy_in_amount: newPool?.defaultBuy_in_amount ? newPool.defaultBuy_in_amount : 0,
                        goal_amount: newPool?.goal_amount ? newPool.goal_amount : 0,
                        maxMembers: newPool?.maxMembers ? newPool.maxMembers : 0,
                        is_private: newPool?.is_private ? newPool.is_private : 0,
                        description: newPool?.description ? newPool.description : ''
                    }}
                    validationSchema={Yup.object().shape({
                        name: Yup.string().required("This field is required!"),
                        defaultBuy_in_amount: Yup.string().required("This field is required!"),
                        goal_amount: Yup.string().required("This field is required!"),
                        maxMembers: Yup.string().required("This field is required!"),
                        description: Yup.string().required("This field is required!")
                    })}
                    onSubmit={handlePoolCreate}
                    enableReinitialize={true}
                    innerRef={props.poolFormRef}
                >
                    {({ values, errors, touched, setFieldValue }) => (
                        <Form>

                            <div className="col-12">
                                <div className="row">
                                    <div className="col-3">
                                        {(currentUser) && (
                                            <div className="pool-cover-image">
                                                <label className="pool-cover-image-label" htmlFor="pool-cover-image">
                                                    <img src={values.photoUrl ? values.photoUrl : "assets/img/new-pool/upload-pool-cover.png"} alt="pool-cover-image" />
                                                </label>
                                                <input className="upload-pool-cover-image" onChange={(e) => handleFileChange(e, setFieldValue)} type="file" id="pool-cover-image" />
                                            </div>)}
                                    </div>
                                    <div className="col-8 offset-1">
                                        <div className="data-input-item">
                                            <label htmlFor="name">Pool name</label>
                                            <div>
                                                <Field
                                                    name="name"
                                                    type="text"
                                                    className={
                                                        "form-control" +
                                                        (errors.name && touched.name ? " is-invalid" : "")
                                                    }
                                                />
                                                <ErrorMessage
                                                    name="name"
                                                    component="div"
                                                    className="invalid-feedback"
                                                />
                                            </div>
                                        </div>
                                        <div className="data-input-item">
                                            <label htmlFor="defaultBuy_in_amount">Default buy in amount</label>
                                            <div>
                                                <Field
                                                    name="defaultBuy_in_amount"
                                                    type="number"
                                                    className={
                                                        "form-control" +
                                                        (errors.defaultBuy_in_amount && touched.defaultBuy_in_amount ? " is-invalid" : "")
                                                    }
                                                />
                                                <ErrorMessage
                                                    name="defaultBuy_in_amount"
                                                    component="div"
                                                    className="invalid-feedback"
                                                />
                                            </div>
                                        </div>
                                        <div className="data-input-item">
                                            <label htmlFor="goal_amount">Goal amount</label>
                                            <div>
                                                <Field
                                                    name="goal_amount"
                                                    type="number"
                                                    className={
                                                        "form-control" +
                                                        (errors.goal_amount && touched.goal_amount ? " is-invalid" : "")
                                                    }
                                                />
                                                <ErrorMessage
                                                    name="goal_amount"
                                                    component="div"
                                                    className="invalid-feedback"
                                                />
                                            </div>
                                        </div>
                                        <div className="data-input-item">
                                            <label htmlFor="maxMembers">Max allowed members</label>
                                            <div>
                                                <Field
                                                    name="maxMembers"
                                                    type="number"
                                                    className={
                                                        "form-control" +
                                                        (errors.maxMembers && touched.maxMembers ? " is-invalid" : "")
                                                    }
                                                />
                                                <ErrorMessage
                                                    name="maxMembers"
                                                    component="div"
                                                    className="invalid-feedback"
                                                />
                                            </div>
                                        </div>
                                        <div className="data-input-item">
                                            <label htmlFor="is_private">Pool visibility</label>
                                            <Field as="select" name="is_private" className={"form-select"}>
                                                <option value="0" defaultValue={{ value: 0 }}>Public</option>
                                                <option value="1">Private</option>
                                            </Field>
                                        </div>
                                        <div className="data-input-item">
                                            <label htmlFor="description">Description</label>
                                            <div>
                                                <Field
                                                    name="description"
                                                    component="textarea"
                                                    rows={10}
                                                    className={
                                                        `${classes.picker}` +
                                                        " form-control" +
                                                        (errors.description && touched.description ? " is-invalid" : "")
                                                    }
                                                />
                                                <ErrorMessage
                                                    name="description"
                                                    component="div"
                                                    className="invalid-feedback"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <br></br>
                        </Form>
                    )}
                </Formik>
                <br></br>
                <br></br>
            </div>
            <Modal show={showLoginPopup} onHide={handleCloseLoginPopup}>
                <Modal.Header closeButton>
                    <Modal.Title></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ textAlign: 'center' }}>
                        <p>You need to be logged in to create a pool.</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="pool-buttons-area">
                        <button className="cancel-new-pool text-title-4" onClick={handlePoolCreateRegister}>
                            Create Account
                        </button>
                        <button className="publish-new-pool text-title-4" onClick={handlePoolCreateLogin}>Login</button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    </>);
}

export default SinglePool;

