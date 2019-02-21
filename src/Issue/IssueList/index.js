import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import ErrorMessage from '../../Error';
import Loading from '../../Loading';
import IssueItem from '../IssueItem';

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

const Issues = ({ repositoryName, repositoryOwner }) =>
    <Query
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

            if (!repository.issues.edges.length) {
                return <div>No issues found...</div>
            }

            return repository.issues.edges.map((issue) => <IssueItem key={issue.node.id} issue={issue.node} />)
        }}
    </Query>;

export default Issues;