import classNamees from "./pageNotFound.module.css";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Link, useLocation, useSearchParams } from "react-router-dom";

import { setProgress } from "../../slices/loader";
import EventBus from "../../common/eventBus";


const PageNotFound = () => {
    const dispatch = useDispatch();


    return (<>
        <main>
            <section className="login-area">
                <div className="container">
                    <div className="row">
                        <div>
                            <div className="sign-up-text">
                                <h2 className="text-headline-1 text-center">Page not found!</h2>
                                <p className="text-title-2 mx-auto text-center">The page you are looking for does not exists.</p>
                            </div>
                        </div>
                        <div className="d-flex justify-content-center mt-5">
                            <Link className="frontend_button" to={"/"}>Home</Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </>);
}
export default PageNotFound 