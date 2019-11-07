import React, { useCallback, useEffect } from "react";
import { Route, Switch } from "react-router-dom";
import socketIOClient from "socket.io-client";
import Navbar from "../components/Navbar";
import routes from "./routes";
import ErrorBoundary from "./ErrorBoundary";
import Error from "../components/common/Error";
import "../assets/style/app.scss";
import PullToRefresh from "../components/common/PullToRefresh";

const Root = () => {
    const socket = socketIOClient.connect(window.location.origin.replace("3000", "5001"), {
        reconnection: false,
        autoConnect: false
    });

    const pageVisibilityAPI = useCallback(() => {
        let hidden;
        let visibilityChange;
        if (typeof document.hidden !== "undefined") {
            // Opera 12.10 and Firefox 18 and later
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }

        const handleVisibilityChange = () => {
            if (document[hidden]) {
                // page inactive do nothing
            } else if (!socket.connected) {
                socket.open(); // page active again, connect socket if disconnected
            }
        };

        if (typeof document.addEventListener !== "undefined" || hidden !== undefined) {
            document.addEventListener(visibilityChange, handleVisibilityChange, false);
        }
    }, [socket]);

    const initSocket = useCallback(() => {
        if (("WebSocket" in window && window.WebSocket !== undefined) || "MozWebSocket" in window) {
            setTimeout(() => {
                socket.open();
                socket.on("connect_error", data => {
                    console.log("connection_error", data);
                });
                pageVisibilityAPI();
            }, 2000);
        }
        PullToRefresh.init();
    }, [pageVisibilityAPI, socket]);

    useEffect(() => {
        initSocket();
    }, [initSocket]);

    return (
        <div className="App">
            <Navbar />
            <main className="main">
                <Switch>
                    {routes.map(({ path, Component }) => {
                        return (
                            <Route
                                key={path}
                                exact
                                path={path}
                                render={() => (
                                    <ErrorBoundary>
                                        <Component socket={socket} />
                                    </ErrorBoundary>
                                )}
                            />
                        );
                    })}
                    <Route render={() => <Error type="page-not-found" />} />
                </Switch>
            </main>
        </div>
    );
};

export default Root;
