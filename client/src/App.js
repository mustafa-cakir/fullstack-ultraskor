import React, {Component} from 'react';
import './assets/style/app.scss';
import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import {Route, Switch, withRouter} from "react-router-dom";
import Eventdetails from "./components/eventdetails/Eventdetails";
import NotFound from "./components/NotFound";

class App extends Component {

    updateParentState = (state) => {
        return new Promise((resolve) => {
            this.setState(state, () => {
                resolve()
            });
        });
    };

    render() {
        return (
            <div className="App">
                <Navbar getData={this.getData}/>
                <main className="main">
                    <Switch>
                        <Route exact path='/' component={Homepage}/>
                        <Route path='/eventdetails/:eventid' component={Eventdetails}/>
                        <Route component={NotFound}/>
                    </Switch>
                </main>
            </div>
        );
    }
}

export default withRouter(App);
