import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import REPOSITORY_FRAGMENT from '../fragments';

import Link from '../../Link';

const STAR_FRAGMENT = `
    starrable {
        id
        viewerHasStarred
        stargazers {
            totalCount
        }
    }
`;

const ADD_STAR = gql`
    mutation ($id: ID!) {
        addStar(input: {starrableId: $id}) {
            ${STAR_FRAGMENT}
        }
    }
`;

const REMOVE_STAR = gql`
    mutation ($id: ID!) {
        removeStar(input: {starrableId: $id}) {
            ${STAR_FRAGMENT}
        }
    }
`;

const hasViewerSubscribed = (viewerSubscription) => viewerSubscription === 'SUBSCRIBED';

const toggleSubscriptionState = (viewerSubscription) => hasViewerSubscribed(viewerSubscription) ? 'UNSUBSCRIBED' : 'SUBSCRIBED';

const getToggleSubscribe = (viewerSubscription) => gql`
    mutation ($id: ID!) {
        updateSubscription (input: {subscribableId: $id, state: ${toggleSubscriptionState(viewerSubscription)}}) {
            subscribable {
                id
                viewerSubscription
            }
        }
    }
`;

const updateWatchers = (cache, { data: { updateSubscription: {subscribable } } }) => {
    const repository = cache.readFragment({
        id: `Repository:${subscribable.id}`,
        fragment: REPOSITORY_FRAGMENT,
    });
    const delta = hasViewerSubscribed(subscribable.viewerSubscription) ? 1 : -1;
    const watcherTotalCount = repository.watchers.totalCount + delta;

    cache.writeFragment({
        id: `Repository:${subscribable.id}`,
        fragment: REPOSITORY_FRAGMENT,
        data: {
            ...repository,
            watchers: {
                ...repository.watchers,
                totalCount: watcherTotalCount, 
            },
        },
    });
};

const RepositoryItem = ({
    node
}) => {
    const {
        id,
        name,
        url,
        descriptionHTML,
        primaryLanguage,
        owner,
        stargazers,
        watchers,
        viewerSubscription,
        viewerHasStarred,
    } = node;

    const addStarOptimisticResponse = {
        addStar: {
            starrable: {
                id,
                viewerHasStarred: !viewerHasStarred,
                stargazers: {
                    totalCount: stargazers.totalCount + 1,
                    __typename: 'StargazerConnection'
                },
                __typename: 'Repository'
            },       
            __typename: 'Mutation'
        }
    };

    const removeStarOptimisticResponse = {
        removeStar: {
            starrable: {
                id,
                viewerHasStarred: !viewerHasStarred,
                stargazers: {
                    totalCount: stargazers.totalCount - 1,
                    __typename: 'StargazerConnection'
                },
                __typename: 'Repository'
            },       
            __typename: 'Mutation'
        }
    };

    const toggleWatchOptimisticResponse = {
        updateSubscription: {
            subscribable: {
                id,
                viewerSubscription: toggleSubscriptionState(viewerSubscription),
                __typename: 'Repository',
            },
            __typename:'Mutation'
        }
    };

    return <li className="repositoryItem">
        <h2 className="repositoryItem-title">
            <Link href={url}>{name}</Link>
        </h2>

        <div className="repositoryItem-stars">
            <span className="repositoryItem-stars-total">{stargazers.totalCount} stars</span>
            <Mutation
                mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}
                variables={{ id }}
                className="repositoryItem-stars-toggle"
                optimisticResponse={viewerHasStarred ? removeStarOptimisticResponse : addStarOptimisticResponse}
            >
                {(toggleStar, {data, loading, error}) =>
                    <label>
                        <input type="checkbox" checked={viewerHasStarred} onChange={toggleStar} />
                        &nbsp;Star
                        {error && <span>&nbsp;Error :( Please try again</span>}
                    </label>
                }
            </Mutation>
        </div>

        <div className="repositoryItem-watchers">
            <span className="repositoryItem-watchers-total">{watchers.totalCount} watchers</span>
            <Mutation
                mutation={getToggleSubscribe(viewerSubscription)}
                variables={{ id }}
                className="repositoryItem-watchers-toggle"
                optimisticResponse={toggleWatchOptimisticResponse}
                update={updateWatchers}
            >
                {(toggleSubscription, { data, loading, error }) => {
                    const subscribed = data ?
                        hasViewerSubscribed(data.updateSubscription.subscribable.viewerSubscription)
                        : hasViewerSubscribed(viewerSubscription)
                    ;

                    return <label>
                        <input type="checkbox" checked={subscribed} onChange={toggleSubscription} />
                        &nbsp;Watch
                        {error && <span>&nbsp;Error :( Please try again</span>}
                    </label>
                }}
            </Mutation>
        </div>

        <div className="repositoryItem-description">
            <div className="repositoryItem-description-info" dangerouslySetInnerHTML={{ __html: descriptionHTML }} />
            <div className="repositoryItem-d...node, key = node.idescription-details">
                {primaryLanguage ? <div>Language: {primaryLanguage.name}</div> : null}
                {owner ? <div>Owner: <Link href={owner.url}>{owner.login}</Link></div> : null}
            </div>
        </div>
    </li>
};

export default RepositoryItem;