import React from 'react';
import {BrowserRouter as Router, Route } from 'react-router-dom';

import * as routes from '../constants/routes';
import Profile from '../Profile';
import Organization from '../Organization';
import Navigation from '../App/navigation';

class App extends React.Component {
    state = {
        organizationName: 'the-road-to-learn-react',
    }
    
    onSearchUpdate = (organizationName) => this.setState({ organizationName });

    render() {
        return <Router>
        <div className="app">
            <Navigation
                organizationName={this.state.organizationName}
                onSearchUpdate={this.onSearchUpdate}
            />

            <main>
                <Route 
                    exact
                    path={routes.ORGANIZATION}
                    component={() => <Organization organizationName={this.state.organizationName}/>}
                />
                <Route
                    exact
                    path={routes.PROFILE}
                    component={Profile}
                />
            </main>
        </div>
    </Router>
    }
} 

export default App