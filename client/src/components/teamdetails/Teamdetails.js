import React, {PureComponent} from 'react';
import {Trans, withTranslation} from "react-i18next";
import Loading from "../common/Loading";
import ReactSwipe from "react-swipe";
import smoothscroll from "smoothscroll-polyfill";
import Footer from "../common/Footer";
import i18n from "i18next";
import {HelperTranslateUrlTo, HelperUpdateMeta} from "../../Helper";
import Errors from "../common/Errors";
import Tournament from "../common/Tournament";

class Teamdetails extends PureComponent {
    constructor(props) {
        super(props);
        this.swipeEl = React.createRef();
        this.swipeMarkerEl = React.createRef();
        this.swipeTabsEl = React.createRef();
        this.swipeByIndex = this.swipeByIndex.bind(this);
        this.swipeByTabName = this.swipeByTabName.bind(this);
        this.swipeAdjustHeight = this.swipeAdjustHeight.bind(this);
        this.state = {
            index: 0,
            teamInfoData: null,
            teamTournamentsData: null,
            teamTournamentsDataByTournament: null,
            isTeamOfTheWeekClicked: false,
            sortBy: 'date'
        };
        smoothscroll.polyfill();
    }

    componentDidMount() {
        this.tabs = [];
        this.initGetData();
    }

    componentDidUpdate() {
        // if (this.swipeEl.current) {
        //     this.swipeAdjustHeight(this.state.index);
        //     this.swipeMarkerAndScrollHandler();
        // }
    }

    swipeChanging = index => {
        this.setState({
            index: index
        });
    };

    static preProcessTournamentsData(data) {
        data.tournaments.reverse();
        data.tournaments.forEach(item => {
            item.events.reverse();
        });
        return data;
    }

    static preProcessTournamentsSortByTournament(data) {
        let newData = JSON.parse(JSON.stringify(data));
        newData.tournaments = newData.tournaments.reduce((whole, item) => {
            let id = item.tournament.id;
            let matchedObj = whole.filter(x => x.tournament.id === id);
            if (matchedObj.length > 0) {
                matchedObj[0].events.push(...item.events)
            } else {
                whole.push(item);
            }
            return whole;
        }, []);
        return newData;
    }

    initGetData() {
        const {teamId} = this.props.match.params;
        const {language} = i18n;

        fetch(`/api/helper4/${language}/teams/${teamId}`)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    throw Error(`404 - Malesef takım hakkında detaylı bilgiye ulaşılamadı`);
                }
            })
            .then(res => {
                this.setState({
                    teamInfoData: res
                }, () => {
                    this.updateMeta(res);
                });
            })
            .catch(() => {
                this.setState({
                    teamInfoData: null,
                });
            });

        fetch(`/api/?query=/team/${teamId}/events/json&page=teamdetails-fixture-round-matches`)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    throw Error(`Can't retrieve information from server, ${res.status}`);
                }
            })
            .then(res => {
                this.setState({
                    loading: false,
                    teamTournamentsData: Teamdetails.preProcessTournamentsData(res),
                    teamTournamentsDataByTournament: Teamdetails.preProcessTournamentsSortByTournament(res)
                }, () => {
                    setTimeout(() => {
                        this.swipeAdjustHeight();
                    }, 100);
                });
            })
            .catch(err => {
                this.setState({
                    teamTournamentsData: {error: err.toString()},
                }, () => {
                    setTimeout(() => {
                        this.swipeAdjustHeight();
                    }, 100);
                });
            });

    }

    updateMeta(teamInfoData) {
        const {t} = this.props;
        if (i18n.language === "en") {
            HelperUpdateMeta({
                title: `${teamInfoData.team.name} Live Match Results, League Fixtures, Weekly Highlights and Lineups - UltraSkor`,
                canonical: window.location.href,
                description: `See live match results, watch highlights, see league fixtures and follow the transfer news for ${t(teamInfoData.team.name)}`,
                keywords: `${t(teamInfoData.team.name)} fixtures, ${t(teamInfoData.team.abbreviation)} match results, ${t(teamInfoData.team.name)} highlights, ${t(teamInfoData.team.name)} transfer news, lineups, league fixtures`,
                alternate: HelperTranslateUrlTo('tr'),
                hrefLang: "tr"
            })
        } else if (i18n.language === "tr") {
            HelperUpdateMeta({
                title: `${t(teamInfoData.team.name)} Fikstür, Kadro, Puan Durumu ve Maç Özetleri - UltraSkor.com`,
                canonical: window.location.href,
                description: `${t(teamInfoData.team.name)} fikstürü ve kadroları görebilir, iddaa maç sonuçları ve transfer haberlerini takip edebilir, haftalık maç özetlerini izleyebilirsiniz.`,
                keywords: `${t(teamInfoData.team.name)} mac fiksturu, ${t(teamInfoData.team.abbreviation)} fixture, lig fikstürü, haftalık lıg fikstürü, ${t(teamInfoData.team.name)} özetleri, ${t(teamInfoData.team.name)} haftanın takımı, ${t(teamInfoData.team.name)} gol krallığı`,
                alternate: HelperTranslateUrlTo('en'),
                hrefLang: "en"
            })
        }
    };

    swipeComplete = (index, el) => {
        let tab = el.getAttribute('data-tab');

        if (tab === "team-of-week") {
            this.setState({isTeamOfTheWeekClicked: true});
        }

        this.swipeMarkerAndScrollHandler(index);
        this.swipeAdjustHeight(index);
    };

    swipeByIndex(index) {
        if (this.swipeEl) this.swipeEl.current.slide(index);
    }

    swipeByTabName(tab) {
        let index = (this.tabs) ? this.tabs.indexOf(tab) : 0;
        if (this.swipeEl) this.swipeEl.current.slide(index);
    }

    swipeTabClick = (event, index) => {
        this.rippleEffectHandler(event);
        this.setState({
            index: index
        }, () => {
            this.swipeEl.current.slide(index);
            this.swipeMarkerAndScrollHandler(index);
            this.swipeAdjustHeight(index);
        });
    };

    swipeAdjustHeight(index) {
        if (this.swipeEl.current && this.swipeEl.current.containerEl) {
            index = index || this.swipeEl.current.getPos();
            let container = this.swipeEl.current.containerEl.firstChild;
            let active = container.childNodes[index];
            container.style.height = active.offsetHeight + 'px';
        }
    }

    swipeMarkerAndScrollHandler() {
        let marker = this.swipeMarkerEl.current,
            active = document.querySelector('.swipe-tabs .active'),
            tabs = this.swipeTabsEl.current;

        marker.style.width = active.offsetWidth + 'px';
        marker.style.left = active.offsetLeft + 'px';

        tabs.scrollTo({
            left: active.offsetLeft - ((window.innerWidth - active.offsetWidth) / 2) + 7,
            behavior: 'smooth'
        });
    };

    rippleEffectHandler(e) {
        let el = e.target,
            rippleEl = document.createElement("span"),
            rect = el.getBoundingClientRect(),
            clientX = e.clientX ? e.clientX : e.touches[0].clientX,
            clientY = e.clientY ? e.clientY : e.touches[0].clientY,
            rippleX = Math.round(clientX - rect.left),
            rippleY = Math.round(clientY - rect.top),
            rippleSize = Math.max(el.offsetWidth, el.offsetHeight);

        rippleEl.className = "ripple";
        el.appendChild(rippleEl);

        rippleEl.style.width = rippleSize + "px";
        rippleEl.style.height = rippleSize + "px";
        rippleEl.style.top = -(rippleSize / 2) + rippleY + 'px';
        rippleEl.style.left = -(rippleSize / 2) + rippleX + 'px';
        rippleEl.className += " rippleEffect";
        setTimeout(() => {
            rippleEl.remove();
        }, 600);
    };

    sortByClickHandler(by) {
        this.setState({
            sortBy: by
        })
    }

    render() {
        const {t} = this.props;
        const {teamInfoData, teamTournamentsData, teamTournamentsDataByTournament, sortBy} = this.state;
        if (!teamTournamentsData) return <Loading/>;
        //if (teamInfoData.error) return <Errors type="error" message={teamInfoData.error}/>;
        if (teamTournamentsData.error) return <Errors type="error" message={teamTournamentsData.error}/>;

        this.tabs = [
            t('Fixture'),
            t('LANG_Players'),
            t('Standing'),
        ];
        const {teamId} = this.props.match.params;
        return (
            <div className="team-details">
                <div className="row team-details-header align-items-center">
                    {teamInfoData ? (
                        <React.Fragment>
                            <div className="col col-img">
                                <img
                                    src={window.ImageServer + '/images/team-logo/football_' + teamId + '.png'}
                                    alt={t(teamInfoData.team.name)}/>
                            </div>
                            <div className="col col-info">
                                <div className="name">{t(teamInfoData.team.name)}</div>
                                {teamInfoData.manager ? <div className="country">{teamInfoData.manager.name}</div> : ""}
                            </div>
                            {teamInfoData.venue ? (
                                <div className="col col-stadium text-right">
                                    <div className="name">{teamInfoData.venue.name}</div>
                                    <div className="capacity"><Trans>Capacity</Trans>: {teamInfoData.venue.capacity}
                                    </div>
                                </div>
                            ) : ""}
                        </React.Fragment>
                    ) : ""}
                </div>
                <div className="middle-tabs">
                    <div className="container">
                        <ul className="swipe-tabs" ref={this.swipeTabsEl}>
                            {this.tabs.map((tab, index) => {
                                return <li key={index} onClick={(event) => this.swipeTabClick(event, index)}
                                           className={(this.state.index === index ? "active " : "") + "ripple-effect pink"}>
                                    <span>{tab}</span></li>;
                            })}
                            <li className="marker" ref={this.swipeMarkerEl}
                                style={{width: '85px', left: '0px'}}/>
                        </ul>
                        <div className="swipe-shadows"/>
                    </div>
                </div>
                <ReactSwipe className="swipe-contents"
                            childCount={this.tabs.length}
                            swipeOptions={{
                                speed: 200,
                                continuous: true,
                                callback: this.swipeChanging,
                                transitionEnd: this.swipeComplete,
                                swiping: this.swipeSwiping,
                                disableScroll: false,
                            }} ref={this.swipeEl}>

                    <div className="swipe-content fixture" data-tab="standing">
                        <div className="sort-by-container">
                            <span className={"sort-by-btn" + (sortBy === "date" ? " checked" : "")} onClick={() => {
                                this.sortByClickHandler('date');
                            }}>
                                <span className="checkbox"/>Tarihe Göre
                            </span>
                            <span className={"sort-by-btn" + (sortBy === "league" ? " checked" : "")} onClick={() => {
                                this.sortByClickHandler('league');
                            }}>
                                <span className="checkbox"/>Lig'e Göre
                            </span>
                        </div>
                        <Tournament
                            tournaments={sortBy === "league" ? teamTournamentsDataByTournament.tournaments : teamTournamentsData.tournaments}
                            from={"h2h"}
                            selectedId={teamId}
                            selected="home"
                        />
                    </div>

                    <div className="swipe-content standing" data-tab="fixture">
                        <div className="coming-soon"><Trans>LANG_Players</Trans> - <Trans>Coming soon</Trans></div>
                    </div>

                    <div className="swipe-content team-of-week" data-tab="team-of-week">
                        <div className="coming-soon"><Trans>Standing</Trans> - <Trans>Coming soon</Trans></div>
                    </div>

                </ReactSwipe>
                <Footer/>
            </div>
        )
    }
}

export default withTranslation('translations')(Teamdetails)
