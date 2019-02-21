import React from 'react';

import Loading from '../Loading';

const FetchMore = ({
    loading, 
    hasNextPage, 
    cursor, 
    children, 
    updateQuery, 
    fetchMore}) => {
        return loading ?
            <Loading/>
            : hasNextPage && <button 
                type="button"
                onClick={() => fetchMore({
                    variables: {
                        cursor,
                    },
                    updateQuery,
                })}
            >
                more {children}
            </button>
        ;
    }
;

export default FetchMore;