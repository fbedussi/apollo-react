import React from 'react';

import RepositoryItem from '../RepositoryItem';
import FetchMore from '../../FetchMore';
import Issues from '../../Issue';

const getUpdateQuery = (entry) => (previousResult, {fetchMoreResult}) => {
    if (!fetchMoreResult) {
        return previousResult;
    }

    return {
        ...previousResult,
        [entry]: {
            ...previousResult[entry],
            repositories: {
                ...previousResult[entry].repositories,
                ...fetchMoreResult[entry].repositories,
                edges: [
                    ...previousResult[entry].repositories.edges,
                    ...fetchMoreResult[entry].repositories.edges,
                ]
            } 

        }
    }
};

const RepositoryList = ({repositories, loading, fetchMore, entry}) => (<React.Fragment>
        <ul>
            {repositories.edges.map(({node}) => {
                return (
                    <div key={node.id} className="repositoryAndIssues">
                        <RepositoryItem node={node}/>

                        <Issues 
                            repositoryName={node.name}
                            repositoryOwner={node.owner.login}
                        />
                    </div>
                );
            })}
        </ul>
        <FetchMore
            fetchMore={fetchMore}
            loading={loading}
            hasNextPage={repositories.pageInfo.hasNextPage}
            cursor={repositories.pageInfo.endCursor}        
            updateQuery={getUpdateQuery(entry)}
        >
            repositories
        </FetchMore>
    </React.Fragment>
);

export default RepositoryList;