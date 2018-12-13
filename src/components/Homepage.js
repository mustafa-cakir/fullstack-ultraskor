import React, {Component} from 'react';
import Tournament from "./Tournament";
import Errors from "./Errors";
import Loading from "./Loading";
import moment from "moment";
import Headertabs from "./Headertabs";
import Footer from "./Footer";

class Homepage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mainData: null,
            loading: false,
            orjData: null
        };
        this.updateParentState = this.updateParentState.bind(this);
        this.getData = this.getData.bind(this);
        this.interval = null;
    };

    updateParentState = (state) => {
        return new Promise((resolve) => {
            this.setState(state, () => {
                resolve()
            });
        });
    };

    preprocessData = data => {
        // Custom Sorting - Move some tournaments to the top or bottom of the list (FYI: 62 = Turkey Super Lig, 309 = CONMEBOL Libertadores)
        let moveToTop = [62, 63]; // tournament Id's in order that you want at top i.e: [62, 36, 33]
        let moveToBottom = [309]; // tournament Id's in the reverse order that you want at the bottom i.e: [309,310]
        let tournaments = data.sportItem.tournaments;
        for (let i = 0; i < tournaments.length; i++) {
            for (let k = 0; k < moveToTop.length; k++) {
                if (tournaments[i].tournament.id === moveToTop[k]) {
                    let a = tournaments.splice(i, 1); // removes the item
                    tournaments.unshift(a[0]); // adds it back to the beginning
                    break;
                }
            }
            for (let k = 0; k < moveToBottom.length; k++) {
                if (tournaments[i].tournament.id === moveToBottom[k]) {
                    let a = tournaments.splice(i, 1); // removes the item
                    tournaments.push(a[0]); // adds it back to the end
                    break;
                }
            }
        }

        // remove yesterday matches
        let currentDate = data.params.date;
        data.sportItem.tournaments = data.sportItem.tournaments.reduce(function (whole, tournament) {
            tournament.events = tournament.events.filter((event) => {
                return moment(event.startTimestamp * 1000).format('YYYY-MM-DD') === currentDate;
            });
            tournament.events.forEach(() => {
                if (whole.indexOf(tournament) < 0) whole.push(tournament);
            });
            return whole;
        }, []);
        return data;
    };

    getData = options => {
        if (options.loading) this.setState({loading: true});
        let jsonData = {};
        fetch('https://www.sofascore.com' + options.api, {referrerPolicy: "no-referrer", cache: "no-store"})
            .then(res => res.json())
            .then(
                (result) => {
                    if (options.interval) {
                        clearInterval(this.interval);
                        this.interval = setInterval(() => {
                            this.getData({
                                api: options.api,
                                loading: false
                            });
                        }, options.intervaltime || 10000);
                    }
                    jsonData = this.preprocessData(result);
                },
                (error) => {
                    jsonData = {error: error.toString()};
                }
            )
            .then(() => {
                this.setState({
                    orjData: jsonData,
                    mainData: jsonData,
                    loading: false
                });
                if (options.scrollToTop) {
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }
            })
    };

    flagImg(tournament) {
        let uniqueTournamentImages = [7, 8, 11, 384, 480, 679];
        if (uniqueTournamentImages.indexOf(tournament.tournament.uniqueId) > -1) {
            return (
                <div className="col flag-img">
                    <img
                        src={(process.env.NODE_ENV === 'production' ? '/livescore/' : '/') + "static/media/" + tournament.tournament.uniqueId + ".png"}
                        alt={tournament.tournament.name}/>
                </div>
            )
        } else {
            return (
                <div className={"col flag flag-" + tournament.category.flag}/>
            )
        }
    };

    componentDidMount() {
        let todaysDate = moment().format('YYYY-MM-DD');
        this.getData({
            api: '/football//' + todaysDate + '/json',
            loading: true,
            interval: false
        });

        // retrieve fresh data in every 10 seconds without displaying loading
        // setInterval(()=>{
        //     this.getData({
        //         api: '/football//' + todaysDate + '/json',
        //         loading: false
        //     });
        // }, 10000);
    }

    render() {
        const dataObj = this.state.mainData;
        let mainContent = [];

        if (dataObj) {
            if (typeof dataObj.error !== "undefined") {
                mainContent.push(<Errors key={1} type="error" message={dataObj.error}/>);
            } else {
                if (dataObj.sportItem) {
                    if (dataObj.sportItem.tournaments.length > 0) {
                        mainContent.push(<Tournament key={1} data={dataObj} flagImg={this.flagImg}/>)
                    } else {
                        mainContent.push(<Errors key={1} type="no-matched-game"/>)
                    }
                } else if (dataObj.liveList) {
                    mainContent.push(<Errors key={1} type="no-live-game"/>)
                }
            }
        }
        return (
            <div>
                <Headertabs
                    {...this.state}
                    updateParentState={this.updateParentState}
                    getData={this.getData}
                    flagImg={this.flagImg}
                />
                {this.state.loading ? <Loading/> : null}
                <div className="container px-0 homepage-list">
                    <div>
                        {mainContent}
                    </div>
                </div>
                <Footer/>
            </div>
        )
    }
}

export default Homepage
