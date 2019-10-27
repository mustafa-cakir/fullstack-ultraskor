import React, { useCallback, useEffect, useReducer } from 'react';
import { withTranslation } from 'react-i18next';
import axios from 'axios';
import Loading from '../../common/Loading';
import Errors from '../../common/Errors';
import StandingTable from '../../common/StandingTable';

const Standings = ({ event, updateAutoHeight, hasActived, t }) => {
    const [state, setState] = useReducer((currentState, newState) => ({ ...currentState, ...newState }), {
        standingsTables: null,
        error: null,
        isLoading: true,
        tab: 'Total'
    });
    const { standingsTables, error, isLoading } = state;
    const { teams, tournament, season } = event;
    const getData = useCallback(() => {
        axios
            .get(`/api/tournament/standings/${tournament.id}/${season.id}`)
            .then(res => {
                setState({
                    isLoading: false,
                    standingsTables: res.data.standingsTables
                });
                setTimeout(() => {
                    updateAutoHeight();
                })
            })
            .catch(() => {
                setState({
                    isLoading: false,
                    error: t('Something went wrong')
                });
            });
    }, [tournament.id, season.id, updateAutoHeight, t]);

    useEffect(() => {
        if (hasActived) {
            getData();
        }
    }, [hasActived, getData]);

    if (!standingsTables || isLoading || !hasActived) return <Loading type="whitebox container" />;
    if (error) return <Errors message={error} />;

    return <StandingTable standingsTables={standingsTables} teams={teams} />;
};

export default withTranslation('translations')(Standings);
