import React, {Component} from 'react';
import './assets/style/app.scss';
import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import {Route, Switch, withRouter} from "react-router-dom";
import TestComp from "./components/TestComp";
import Eventdetails from "./components/eventdetails/Eventdetails";
import { TransitionGroup, CSSTransition } from 'react-transition-group';

class App extends Component {

    updateParentState = (state) => {
        return new Promise((resolve) => {
            this.setState(state, () => {
                resolve()
            });
        });
    };


    render() {
        const { location} = this.props;
        const currentKey = location.pathname.split('/')[1] || '/';
        const timeout = { enter: 500, exit: 500 };

        return (
            <div className="App">
                <Navbar getData={this.getData}/>
                <main className="main">
                    <TransitionGroup component="main" className="page-main">
                        <CSSTransition key={currentKey} timeout={timeout} classNames="slide" appear>
                            <section className="page-main-inner">
                                <Switch location={location}>
                                    <Route exact path='/' component={Homepage}/>
                                    <Route path='/eventdetails/:eventid' component={Eventdetails}/>
                                    <Route component={TestComp} />
                                </Switch>
                            </section>
                        </CSSTransition>
                    </TransitionGroup>
                </main>
            </div>
        );
    }
}

export default withRouter(App);
