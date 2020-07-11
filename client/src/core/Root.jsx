import React, { useCallback, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import Navbar from '../components/Navbar';
import routes from './routes';
import ErrorBoundary from './ErrorBoundary';
import Error from '../components/common/Error';
import '../assets/style/app.scss';
import PullToRefresh from '../components/common/PullToRefresh';

const Root = () => {
    useEffect(() => {
        PullToRefresh.init();
    }, []);

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
                                        <Component />
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
