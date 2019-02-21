import React from 'react';

const IssueItem = ({issue}) => {
    const {number, state, title, url, bodyHMTL} = issue;
    return <dl>
        <dt>number</dt>
        <dd>{number}</dd>
        <dt>state</dt>
        <dd>{state}</dd>
        <dt>title</dt>
        <dd>{title}</dd>
        <dt>url</dt>
        <dd>{url}</dd>
        <dt>body</dt>
        <dd dangerouslySetInnerHTML={{__html: bodyHMTL}}></dd>
    </dl>
};

export default IssueItem;