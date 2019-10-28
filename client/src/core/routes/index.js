import Homepage from '../../components/Homepage';
import Eventdetails from '../../components/Eventdetails';
import Team from '../../components/Team';
import League from '../../components/League';

const routes = [
    {
        path: '/',
        Component: Homepage
    },
    {
        path: '/(maclar|matches)/(tarih|date)-:date',
        Component: Homepage
    },
    {
        path: '/(mac|match)/:slug-(canli-skor|live-score)-:eventid',
        Component: Eventdetails
    },
    {
        path: '/(lig|league)/:slug-(puan-durumu|standing)-:leagueid-(sezon|season)-:seasonid/:activeTab?',
        Component: League
    },
    {
        path: '/(takim|team)/:slug-:teamId',
        Component: Team
    },
    {
        path: '/eventdetails/:eventid',
        Component: Eventdetails
    }
];

export default routes;
