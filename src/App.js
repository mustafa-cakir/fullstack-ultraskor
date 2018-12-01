import React, {Component} from 'react';
import './assets/style/app.scss';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Homepage from "./components/Homepage";
import {Route, Switch} from "react-router-dom";
import TestComp from "./components/TestComp";
import Eventdetails from "./components/eventdetails/Eventdetails";

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
                {/*<Main getData={this.getData} {...this.state}/>*/}
                <main className="main">
                    <Switch>
                        {/*<Route exact path='/' component={Homepage}/>*/}
                        <Route exact path='/' component={Homepage}/>
                        <Route path='/eventdetails/:eventid' component={Eventdetails}/>
                        <Route exact path='/test' render={() => (
                            <TestComp/>
                        )}/>
                        {/*<Route path='/roster' component={Roster}/>*/}
                        {/*<Route path='/schedule' component={Schedule}/>*/}
                    </Switch>
                </main>
                <Footer/>
            </div>
        );
    }
}

export default App;
