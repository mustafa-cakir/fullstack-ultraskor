import React, { useCallback, useEffect, useReducer } from 'react';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import Loading from '../../common/Loading';
import Errors from '../../common/Errors';
import StandingTable from '../../common/StandingTable';

const Standings = ({ event, updateAutoHeight, hasActived, t }) => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        data: null,
        error: null,
        isLoading: true,
        tab: 'Total'
    });
    const { data, error, isLoading } = state;
    const { teams, tournament, season } = event;
    const getData = useCallback(() => {
        axios
            .get(`/api/tournament/standings/${tournament.id}/${season.id}`)
            .then(res => {
                setState({
                    isLoading: false,
                    data: res.data.standingsTables[0],
                    isLoaded: true
                });
                updateAutoHeight();
            })
            .catch(err => {
                setState({
                    isLoading: false,
                    error: err,
                    isLoaded: true
                });
            });
    }, [tournament.id, season.id, updateAutoHeight]);

    useEffect(() => {
        if (hasActived) {
            getData();
        }
    }, [hasActived, getData]);

    if (!hasActived) return false;
    if (isLoading) return <Loading type="inside" />;
    if (error) return <Errors message={error} />;

    return <StandingTable data={data} teams={teams} />;
};

export default withTranslation('translations')(Standings);
