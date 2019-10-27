import Homepage from '../../components/Homepage';
import Eventdetails from '../../components/Eventdetails';
import Leaguedetails from '../../components/leaguedetails/Leaguedetails';
import Teamdetails from '../../components/teamdetails/Teamdetails';

const routes = [
    {
        path: "/",
        Component: Homepage
    },
    {
        path: "/(maclar|matches)/(tarih|date)-:date",
        Component: Homepage
    },
    {
        path: "/(mac|match)/:slug-(canli-skor|live-score)-:eventid",
        Component: Eventdetails
    },
    {
        path: "/(lig|league)/:slug-(puan-durumu|standing)-:leagueid-(sezon|season)-:seasonid/:activeTab?",
        Component: Leaguedetails
    },
    {
        path: "/(takim|team)/:slug-:teamId",
        Component: Teamdetails
    },
    {
        path: "/eventdetails/:eventid",
        Component: Eventdetails
    },

];

export default routes;
