import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import * as routes from '../constants/routes';

class OrganizationSearch extends React.Component {
    state = {
        value: this.props.organizationName,
    }

    onChange = (event) => this.setState({ value: event.target.value });

    onSubmit = (event) => {
        event.preventDefault();
        this.props.onUpdate(this.state.value);
    }

    render() {
        const { value } = this.state;

        return (
            <form onSubmit={this.onSubmit}>
                <input type="text" value={value} onChange={this.onChange} />
                <button type="submit">Search</button>
            </form>
        );
    }
}

const Navigation = ({
    location: { pathname },
    organizationName,
    onSearchUpdate
}) => {
    return <header>
        <nav>
            <ul>
                <li>
                    <Link to={routes.ORGANIZATION}>Organization</Link>
                </li>
                <li>
                    <Link to={routes.PROFILE}>Profile</Link>
                </li>
            </ul>
            {pathname === routes.ORGANIZATION &&
                <OrganizationSearch
                    organizationName={organizationName}
                    onUpdate={onSearchUpdate}
                />
            }
        </nav>
    </header>
}

export default withRouter(Navigation);