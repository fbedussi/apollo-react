import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import ErrorMessage from '../../Error';
import Loading from '../../Loading';
import IssueItem from '../IssueItem';

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
    query($repositoryName: String!, $repositoryOwner: String!) {
        repository (name: $repositoryName, owner: $repositoryOwner) {
            issues(first: 5) {
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
            }
        }
    }
`;

class Issues extends React.Component {
    state = {
        issueState: ISSUE_STATE.NONE,
    }

    onChangeIssueState = (issueState) => this.setState({issueState});

    render() {
        const {issueState} = this.state;
        const { repositoryName, repositoryOwner } = this.props;

        return <div className="issues">
            <button
                onClick={() => this.onChangeIssueState(TRANSITION_STATE[issueState])}
            >
                {TRANSITION_LABELS[issueState]}
            </button>
            {isShown(issueState) && <Query
                query={GET_ISSUES_OF_REPOSITORY}
                variables={{
                    repositoryName,
                    repositoryOwner,
                }}
            >
                {({ data, loading, error }) => {
                    if (error) {
                        return <ErrorMessage error={error} />
                    }

                    const { repository } = data;

                    if (loading && !repository) {
                        return <Loading />
                    }

                    const filteredRepository = {
                        issues: {
                            edges: repository.issues.edges.filter((issue) => issue.node.state === issueState)
                        }
                    }

                    if (!filteredRepository.issues.edges.length) {
                        return <div>No issues found...</div>
                    }

                    return filteredRepository.issues.edges.map((issue) => <IssueItem key={issue.node.id} issue={issue.node} />)
                }}
            </Query>}
        </div>;
    }
}


export default Issues;