import React from 'react';
import gql from 'graphql-tag';
import { Query, ApolloConsumer } from 'react-apollo';

import ErrorMessage from '../../Error';
import Loading from '../../Loading';
import IssueItem from '../IssueItem';
import FetchMore from '../../FetchMore';

const ISSUE_STATE = {
    NONE: 'NONE',
    OPEN: 'OPEN',
    CLOSED: 'CLOSED',
}

const isShown = (issueState) => issueState !== ISSUE_STATE.NONE;

const TRANSITION_LABELS = {
    [ISSUE_STATE.NONE]: 'Show open issues',
    [ISSUE_STATE.OPEN]: 'Show closed issues',
    [ISSUE_STATE.CLOSED]: 'Hide issues',
};

const TRANSITION_STATE = {
    [ISSUE_STATE.NONE]: ISSUE_STATE.OPEN,
    [ISSUE_STATE.OPEN]: ISSUE_STATE.CLOSED,
    [ISSUE_STATE.CLOSED]: ISSUE_STATE.NONE,
};

const GET_ISSUES_OF_REPOSITORY = gql`
    query(
        $repositoryName: String!, 
        $repositoryOwner: String!,
        $issueState: IssueState!
        $cursor: String
    ) {
        repository (name: $repositoryName, owner: $repositoryOwner) {
            issues(
                first: 1, 
                after: $cursor, 
                states: [$issueState]
            ) {
                edges {
                    node {
                        id
                        number
                        state
                        title
                        url
                        bodyHTML
                    }
                }
                pageInfo {
                    endCursor
                    hasNextPage
                }
            }
        }
    }
`;

const updateQuery = (previousResult, { fetchMoreResult }) => {
    if (!fetchMoreResult) {
        return previousResult;
    }

    return {
        repository: {
            ...previousResult.repository,
            issues: {
                ...previousResult.repository.issues,
                ...fetchMoreResult.repository.issues,
                edges: [
                    ...previousResult.repository.issues.edges,
                    ...fetchMoreResult.repository.issues.edges,
                ]
            }
        }
    }
};

const prefetchIssues = (client, repositoryOwner, repositoryName, issueState) => {
    const nextIssueState = TRANSITION_STATE[issueState];

    if (isShown(nextIssueState)) {
        client.query({
            query: GET_ISSUES_OF_REPOSITORY,
            variables: {
                repositoryOwner,
                repositoryName,
                issueState: nextIssueState,
            }
        });
    }
};

const IssueFilterBtn = ({ issueState, onChangeIssueState, repositoryOwner, repositoryName }) => (
    <ApolloConsumer>
        {(client => (
            <button
                onMouseOver={() => prefetchIssues(client, repositoryOwner, repositoryName, issueState)}
                onClick={() => onChangeIssueState(TRANSITION_STATE[issueState])}
            >
                {TRANSITION_LABELS[issueState]}
            </button>
        ))}
    </ApolloConsumer>
);

class Issues extends React.Component {
    state = {
        issueState: ISSUE_STATE.NONE,
    }

    onChangeIssueState = (issueState) => this.setState({ issueState });

    render() {
        const { issueState, cursor } = this.state;
        const { repositoryName, repositoryOwner } = this.props;

        return <div className="issues">
            <IssueFilterBtn
                repositoryOwner={repositoryOwner}
                repositoryName={repositoryName}
                issueState={issueState}
                onChangeIssueState={this.onChangeIssueState}
            />
            {isShown(issueState) && <Query
                query={GET_ISSUES_OF_REPOSITORY}
                variables={{
                    repositoryName,
                    repositoryOwner,
                    issueState,
                    cursor,
                }}
            >
                {({ data, loading, error, fetchMore }) => {
                    if (error) {
                        return <ErrorMessage error={error} />
                    }

                    const { repository } = data;

                    if (loading && !repository) {
                        return <Loading />
                    }

                    if (!repository.issues.edges.length) {
                        return <div>No issues found...</div>
                    }

                    const { endCursor, hasNextPage } = repository.issues.pageInfo;

                    return <React.Fragment>
                        {repository.issues.edges.map((issue) =>
                            <IssueItem key={issue.node.id} issue={issue.node} />)}
                        <FetchMore
                            fetchMore={fetchMore}
                            loading={loading}
                            hasNextPage={hasNextPage}
                            cursor={endCursor}
                            updateQuery={updateQuery}
                        >
                            issues
                        </FetchMore>
                    </React.Fragment>
                }}
            </Query>
            }
        </div>;
    }
}


export default Issues;